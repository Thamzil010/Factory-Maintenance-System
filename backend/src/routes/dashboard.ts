import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

router.get('/stats', async (req, res) => {
  try {
    const now = new Date();
    now.setHours(0,0,0,0);

    const [
      totalMachines,
      activeMachines,
      maintenanceMachines,
      upcomingMaintenance,
      totalSpareParts,
      
      mwTotal, mwActive, mwExpired, mwUpcoming,
      swTotal, swActive, swExpired, swUpcoming
    ] = await Promise.all([
      prisma.machine.count(),
      prisma.machine.count({ where: { status: 'ACTIVE' } }),
      prisma.machine.count({ where: { status: 'UNDER_MAINTENANCE' } }),
      prisma.maintenance.count({ where: { status: { in: ['SCHEDULED', 'IN_PROGRESS'] } } }),
      prisma.sparePart.count(),
      
      prisma.warranty.count({ where: { warrantyType: 'MACHINE' } }),
      prisma.warranty.count({ where: { warrantyType: 'MACHINE', end_date: { gte: now }, start_date: { lte: now } } }),
      prisma.warranty.count({ where: { warrantyType: 'MACHINE', end_date: { lt: now } } }),
      prisma.warranty.count({ where: { warrantyType: 'MACHINE', start_date: { gt: now } } }),
      
      prisma.warranty.count({ where: { warrantyType: 'SPARE_PART' } }),
      prisma.warranty.count({ where: { warrantyType: 'SPARE_PART', end_date: { gte: now }, start_date: { lte: now } } }),
      prisma.warranty.count({ where: { warrantyType: 'SPARE_PART', end_date: { lt: now } } }),
      prisma.warranty.count({ where: { warrantyType: 'SPARE_PART', start_date: { gt: now } } }),
    ]);

    const lowStockQuery: any[] = await prisma.$queryRaw`SELECT count(*) FROM "SparePart" WHERE quantity <= min_stock`;
    const lowStockCount = Number(lowStockQuery[0].count);

    res.json({
      totalMachines,
      activeMachines,
      maintenanceMachines,
      upcomingMaintenance,
      totalSpareParts,
      lowStockItems: lowStockCount,
      machineWarranties: {
        total: mwTotal,
        active: mwActive,
        expired: mwExpired,
        upcoming: mwUpcoming
      },
      sparePartWarranties: {
        total: swTotal,
        active: swActive,
        expired: swExpired,
        upcoming: swUpcoming
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard stats' });
  }
});

router.get('/alerts', async (req, res) => {
  try {
    const lowStockParts = await prisma.$queryRaw`SELECT * FROM "SparePart" WHERE quantity <= min_stock`;
    
    const upcomingMaintenance = await prisma.maintenance.findMany({
      where: { status: { in: ['SCHEDULED', 'IN_PROGRESS'] } },
      orderBy: { scheduled_date: 'asc' },
      take: 5,
      include: { machine: { select: { name: true, status: true } } }
    });

    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    const expiringWarranties = await prisma.warranty.findMany({
      where: {
        end_date: {
          gte: now,
          lte: thirtyDaysFromNow
        }
      },
      orderBy: { end_date: 'asc' },
      take: 5,
      include: {
        machine: { select: { name: true } },
        sparePart: { select: { name: true } }
      }
    });

    res.json({
      lowStockAlerts: lowStockParts,
      upcomingMaintenance,
      expiringWarranties
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching alerts' });
  }
});

export default router;
