import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const machines = await prisma.machine.findMany({
      include: {
        maintenance: {
          where: { status: 'IN_PROGRESS' },
          take: 1
        },
        warranties: {
          include: { supplier: true }
        }
      }
    });
    res.json(machines);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching machines' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const machine = await prisma.machine.findUnique({
      where: { id: req.params.id },
      include: {
        maintenance: { orderBy: { scheduled_date: 'desc' }, take: 5 },
        serviceHistory: { orderBy: { service_date: 'desc' }, take: 5 }
      }
    });
    if (!machine) return res.status(404).json({ message: 'Machine not found' });
    res.json(machine);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching machine details' });
  }
});

router.post('/', async (req, res) => {
  try {
    const machine = await prisma.machine.create({
      data: req.body
    });
    res.status(201).json(machine);
  } catch (error) {
    console.error("MACHINE CREATE ERROR:", error);
    res.status(400).json({ message: 'Error creating machine', error: error });
  }
});

router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const machine = await prisma.machine.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(machine);
  } catch (error) {
    res.status(400).json({ message: 'Error updating machine' });
  }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await prisma.machine.delete({
      where: { id: req.params.id }
    });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ message: 'Error deleting machine' });
  }
});

export default router;
