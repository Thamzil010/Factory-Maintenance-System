import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const history = await prisma.serviceHistory.findMany({
      include: {
        machine: { select: { name: true, code: true } },
        technician: { select: { name: true } },
        maintenance: { select: { start_date: true, completion_date: true } }
      },
      orderBy: { service_date: 'desc' }
    });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching service history' });
  }
});

router.post('/', async (req, res) => {
  try {
    const record = await prisma.serviceHistory.create({
      data: req.body
    });
    res.status(201).json(record);
  } catch (error) {
    res.status(400).json({ message: 'Error creating service history record' });
  }
});

export default router;
