import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const alerts = await prisma.alert.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching alerts' });
  }
});

router.put('/:id/read', async (req, res) => {
  try {
    const alert = await prisma.alert.update({
      where: { id: req.params.id },
      data: { status: 'READ' }
    });
    res.json(alert);
  } catch (error) {
    res.status(400).json({ message: 'Error updating alert status' });
  }
});

export default router;
