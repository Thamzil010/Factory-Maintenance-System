import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const warranties = await prisma.warranty.findMany({
      include: {
        supplier: true,
        machine: { select: { id: true, name: true, code: true, manufacturer: true } },
        sparePart: { select: { id: true, name: true, code: true, category: true } }
      }
    });
    
    const now = new Date();
    // Reset time for accurate date comparison
    now.setHours(0, 0, 0, 0);

    const mapped = warranties.map(w => {
      let calcStatus = 'ACTIVE';
      const startDate = new Date(w.start_date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(w.end_date);
      endDate.setHours(0, 0, 0, 0);

      if (endDate < now) {
        calcStatus = 'EXPIRED';
      } else if (startDate > now) {
        calcStatus = 'UPCOMING';
      }

      return { ...w, status: calcStatus };
    });

    res.json(mapped);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching warranties' });
  }
});

router.post('/', requireAdmin, async (req, res) => {
  try {
    const { start_date, end_date, purchaseDate, ...rest } = req.body;
    
    const data: any = {
      ...rest,
      start_date: new Date(start_date),
      end_date: new Date(end_date)
    };

    if (purchaseDate) {
      data.purchaseDate = new Date(purchaseDate);
    }

    const warranty = await prisma.warranty.create({
      data
    });
    res.status(201).json(warranty);
  } catch (error) {
    res.status(400).json({ message: 'Error creating warranty' });
  }
});

router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { start_date, end_date, purchaseDate, ...rest } = req.body;
    const updateData: any = { ...rest };
    
    if (start_date) updateData.start_date = new Date(start_date);
    if (end_date) updateData.end_date = new Date(end_date);
    if (purchaseDate) updateData.purchaseDate = new Date(purchaseDate);

    const warranty = await prisma.warranty.update({
      where: { id: req.params.id },
      data: updateData
    });
    res.json(warranty);
  } catch (error) {
    res.status(400).json({ message: 'Error updating warranty' });
  }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await prisma.warranty.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ message: 'Error deleting warranty' });
  }
});

export default router;
