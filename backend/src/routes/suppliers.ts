import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const suppliers = await prisma.supplier.findMany({
      include: {
        spareParts: true,
      }
    });
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching suppliers' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const supplier = await prisma.supplier.findUnique({
      where: { id: req.params.id },
      include: { spareParts: true, warranties: true }
    });
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
    res.json(supplier);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching supplier details' });
  }
});

router.post('/', requireAdmin, async (req, res) => {
  try {
    const supplier = await prisma.supplier.create({ data: req.body });
    res.status(201).json(supplier);
  } catch (error) {
    res.status(400).json({ message: 'Error creating supplier' });
  }
});

router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const supplier = await prisma.supplier.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(supplier);
  } catch (error) {
    res.status(400).json({ message: 'Error updating supplier' });
  }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await prisma.supplier.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ message: 'Error deleting supplier' });
  }
});

export default router;
