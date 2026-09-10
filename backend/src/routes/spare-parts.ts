import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const parts = await prisma.sparePart.findMany({
      include: {
        warranties: {
          include: { supplier: true }
        },
        supplier: true
      }
    });
    res.json(parts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching spare parts' });
  }
});

router.post('/', requireAdmin, async (req, res) => {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const part = await tx.sparePart.create({
        data: req.body
      });

      if (part.quantity > 0) {
        await tx.stockMovement.create({
          data: {
            partId: part.id,
            quantity_change: part.quantity,
            movement_type: 'IN', // Or 'INITIAL'
            remarks: 'Initial stock added'
          }
        });
      }

      return part;
    });

    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: 'Error creating spare part' });
  }
});

router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const part = await prisma.sparePart.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(part);
  } catch (error) {
    res.status(400).json({ message: 'Error updating spare part' });
  }
});

router.get('/:id/history', async (req, res) => {
  try {
    const history = await prisma.stockMovement.findMany({
      where: { partId: req.params.id },
      orderBy: { date: 'desc' }
    });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching history' });
  }
});

// Stock movement
router.post('/:id/stock', async (req, res) => {
  try {
    const { quantity_change, movement_type, remarks, reference_id } = req.body;
    
    // Validate quantity_change
    if (!quantity_change || quantity_change === 0) {
      return res.status(400).json({ message: 'Quantity change must be non-zero' });
    }

    // Use a transaction to update stock and record movement
    const result = await prisma.$transaction(async (tx) => {
      const part = await tx.sparePart.findUnique({ where: { id: req.params.id } });
      if (!part) throw new Error('Part not found');
      
      const newQuantity = part.quantity + quantity_change;
      if (newQuantity < 0) {
        throw new Error(`Insufficient stock. Only ${part.quantity} units are available.`);
      }

      const updatedPart = await tx.sparePart.update({
        where: { id: req.params.id },
        data: { quantity: newQuantity }
      });

      const movement = await tx.stockMovement.create({
        data: {
          partId: part.id,
          quantity_change,
          movement_type,
          reference_id,
          remarks
        }
      });

      // Handle Alerts
      const existingAlerts = await tx.alert.findMany({
        where: { relatedId: part.id, type: 'INVENTORY', status: 'UNREAD' }
      });

      if (newQuantity === 0) {
        await tx.alert.create({
          data: {
            type: 'INVENTORY',
            title: `Out of Stock: ${part.name}`,
            message: `Out of Stock: ${part.name} (${part.code}) is currently unavailable.`,
            priority: 'CRITICAL',
            relatedId: part.id
          }
        });
      } else if (newQuantity <= part.min_stock) {
        // Ensure we don't spam if already low
        if (!existingAlerts.some(a => a.title.startsWith('Low Stock'))) {
          await tx.alert.create({
            data: {
              type: 'INVENTORY',
              title: `Low Stock: ${part.name}`,
              message: `Low Stock: ${part.name} (${part.code}) has only ${newQuantity} ${part.unit} remaining. Minimum required: ${part.min_stock} ${part.unit}.`,
              priority: 'HIGH',
              relatedId: part.id
            }
          });
        }
      } else if (newQuantity > part.min_stock) {
        // Resolve existing unread inventory alerts for this part
        if (existingAlerts.length > 0) {
          await tx.alert.updateMany({
            where: { relatedId: part.id, type: 'INVENTORY', status: 'UNREAD' },
            data: { status: 'READ' } // Using READ to signify resolved in this simple system
          });
        }
      }

      return { updatedPart, movement };
    });

    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Error updating stock' });
  }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await prisma.stockMovement.deleteMany({ where: { partId: req.params.id } });
    await prisma.sparePart.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ message: 'Error deleting spare part' });
  }
});

export default router;
