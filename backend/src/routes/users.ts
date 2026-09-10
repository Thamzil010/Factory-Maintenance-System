import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin } from '../middleware/auth';
import bcrypt from 'bcryptjs';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);
router.use(requireAdmin);

router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, createdAt: true }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    const password_hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password_hash, name, role },
      select: { id: true, email: true, name: true, role: true, createdAt: true }
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: 'Error creating user' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { email, name, role, password } = req.body;
    const data: any = { email, name, role };
    if (password) {
      data.password_hash = await bcrypt.hash(password, 10);
    }
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data,
      select: { id: true, email: true, name: true, role: true, createdAt: true }
    });
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: 'Error updating user' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ message: 'Error deleting user' });
  }
});

export default router;
