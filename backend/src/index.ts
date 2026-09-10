import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';

import authRoutes from './routes/auth';
import machineRoutes from './routes/machines';
import sparePartsRoutes from './routes/spare-parts';
import maintenanceRoutes from './routes/maintenance';
import dashboardRoutes from './routes/dashboard';
import supplierRoutes from './routes/suppliers';
import warrantyRoutes from './routes/warranties';
import serviceHistoryRoutes from './routes/service-history';
import userRoutes from './routes/users';
import alertRoutes from './routes/alerts';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const prisma = new PrismaClient();
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://redis:6379'
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/machines', machineRoutes);
app.use('/api/spare-parts', sparePartsRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/warranties', warrantyRoutes);
app.use('/api/service-history', serviceHistoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/alerts', alertRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Factory API is running' });
});

async function startServer() {
  try {
    // Only connect if not already connecting to avoid issues, but this is simple for now
    await redisClient.connect();
    console.log('Connected to Redis');
    
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    // Don't exit process in development environment if Redis fails, just log it
    // process.exit(1);
  }
}

startServer();
