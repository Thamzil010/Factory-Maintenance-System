import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const records = await prisma.maintenance.findMany({
      include: {
        machine: { select: { name: true, code: true } },
        assignedTechnician: { select: { name: true } }
      },
      orderBy: { scheduled_date: 'asc' }
    });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching maintenance records' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { machineId, status } = req.body;
    
    // If attempting to start immediately upon creation
    if (status === 'IN_PROGRESS') {
      const machine = await prisma.machine.findUnique({ where: { id: machineId } });
      if (machine?.status === 'UNDER_MAINTENANCE') {
        return res.status(400).json({ message: 'Machine is already under maintenance.' });
      }
    }

    const record = await prisma.$transaction(async (tx) => {
      const newRecord = await tx.maintenance.create({
        data: req.body
      });

      if (status === 'IN_PROGRESS') {
        await tx.machine.update({
          where: { id: machineId },
          data: { status: 'UNDER_MAINTENANCE', isOperational: false }
        });
        
        await tx.maintenance.update({
          where: { id: newRecord.id },
          data: { start_date: new Date() }
        });

        await tx.alert.create({
          data: {
            type: 'MAINTENANCE',
            title: 'Maintenance Started',
            message: `Maintenance started for machine ID: ${machineId}`,
            priority: 'MEDIUM',
            relatedId: machineId
          }
        });
      }

      return newRecord;
    });

    res.status(201).json(record);
  } catch (error) {
    res.status(400).json({ message: 'Error creating maintenance record' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { status, work_performed, parts_used, cost, remarks, ...rest } = req.body;
    
    const result = await prisma.$transaction(async (tx) => {
      const existingRecord = await tx.maintenance.findUnique({ where: { id: req.params.id } });
      if (!existingRecord) throw new Error('Maintenance record not found');

      // Check machine conflict if starting
      if (status === 'IN_PROGRESS' && existingRecord.status !== 'IN_PROGRESS') {
        const machine = await tx.machine.findUnique({ where: { id: existingRecord.machineId } });
        if (machine?.status === 'UNDER_MAINTENANCE') {
          throw new Error('Machine is already under maintenance.');
        }
      }

      let dataToUpdate: any = { ...rest, status };

      if (status === 'IN_PROGRESS' && existingRecord.status !== 'IN_PROGRESS') {
        dataToUpdate.start_date = new Date();
        await tx.machine.update({
          where: { id: existingRecord.machineId },
          data: { status: 'UNDER_MAINTENANCE', isOperational: false }
        });

        await tx.alert.create({
          data: {
            type: 'MAINTENANCE',
            title: 'Maintenance Started',
            message: `Machine is currently under maintenance.`,
            priority: 'MEDIUM',
            relatedId: existingRecord.machineId
          }
        });
      }

      if (status === 'COMPLETED' && existingRecord.status !== 'COMPLETED') {
        dataToUpdate.completion_date = new Date();
        
        await tx.machine.update({
          where: { id: existingRecord.machineId },
          data: { status: 'ACTIVE', isOperational: true }
        });

        await tx.alert.create({
          data: {
            type: 'MAINTENANCE',
            title: 'Maintenance Completed',
            message: `Machine has been returned to service.`,
            priority: 'LOW',
            relatedId: existingRecord.machineId
          }
        });
      }

      const updatedRecord = await tx.maintenance.update({
        where: { id: req.params.id },
        data: dataToUpdate
      });

      if (status === 'COMPLETED' && work_performed && existingRecord.status !== 'COMPLETED') {
        // Create Service History
        const serviceHistory = await tx.serviceHistory.create({
          data: {
            machineId: updatedRecord.machineId,
            maintenanceId: updatedRecord.id,
            type: updatedRecord.type,
            technicianId: updatedRecord.assignedTechnicianId || (req as any).user!.id,
            problem_description: updatedRecord.description || 'Maintenance completed',
            work_performed,
            cost: cost || 0,
            remarks
          }
        });

        // Deduct parts
        if (parts_used && parts_used.length > 0) {
          for (const part of parts_used) {
            const dbPart = await tx.sparePart.findUnique({ where: { id: part.partId } });
            if (dbPart) {
              const newQuantity = dbPart.quantity - part.quantity;
              await tx.sparePart.update({
                where: { id: part.partId },
                data: { quantity: newQuantity }
              });

              await tx.stockMovement.create({
                data: {
                  partId: part.partId,
                  quantity_change: -part.quantity,
                  movement_type: 'OUT',
                  reference_id: serviceHistory.id,
                  remarks: 'Used in maintenance'
                }
              });

              if (newQuantity <= dbPart.min_stock) {
                await tx.alert.create({
                  data: {
                    type: 'INVENTORY',
                    title: 'Low Stock Alert',
                    message: `Stock for ${dbPart.name} is now ${newQuantity}`,
                    priority: 'HIGH',
                    relatedId: dbPart.id
                  }
                });
              }
            }
          }
        }
      }
      return updatedRecord;
    });

    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Error updating maintenance record' });
  }
});

export default router;
