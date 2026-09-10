import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.stockMovement.deleteMany();
  await prisma.warranty.deleteMany();
  await prisma.serviceHistory.deleteMany();
  await prisma.maintenance.deleteMany();
  await prisma.sparePart.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.machine.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  const password_hash = await bcrypt.hash('password123', 10);
  
  const admin = await prisma.user.create({
    data: {
      email: 'admin@factory.com',
      name: 'System Admin',
      password_hash,
      role: 'ADMIN'
    }
  });

  const tech = await prisma.user.create({
    data: {
      email: 'tech@factory.com',
      name: 'John Technician',
      password_hash,
      role: 'MAINTENANCE'
    }
  });

  console.log('Created users');

  // Create Machines
  const m1 = await prisma.machine.create({
    data: {
      name: 'CNC Machine A',
      code: 'MCH-001',
      model: 'CNC-2000X',
      manufacturer: 'Haas Automation',
      department: 'Machining',
      location: 'Zone A',
      installation_date: new Date('2023-01-15'),
      status: 'ACTIVE',
      description: 'Primary 5-axis CNC router'
    }
  });

  const m2 = await prisma.machine.create({
    data: {
      name: 'Hydraulic Press B',
      code: 'MCH-002',
      model: 'HP-500T',
      manufacturer: 'Schuler',
      department: 'Forming',
      location: 'Zone B',
      installation_date: new Date('2022-05-20'),
      status: 'ACTIVE'
    }
  });

  console.log('Created machines');

  // Create Suppliers
  const s1 = await prisma.supplier.create({
    data: {
      name: 'Acme Parts',
      company: 'Acme Industrial Corp',
      contact_person: 'Bob Smith',
      phone: '555-0101',
      email: 'bob@acme.com',
      address: '123 Industrial Way'
    }
  });

  // Create Spare Parts
  const p1 = await prisma.sparePart.create({
    data: {
      name: 'Bearing',
      code: 'PRT-100',
      category: 'Mechanical',
      quantity: 5,
      min_stock: 10,
      unit: 'pcs',
      location: 'Shelf A1',
      unit_price: 45.0
    }
  });

  const p2 = await prisma.sparePart.create({
    data: {
      name: 'Motor Belt',
      code: 'PRT-101',
      category: 'Mechanical',
      quantity: 15,
      min_stock: 5,
      unit: 'pcs',
      location: 'Shelf B2',
      unit_price: 22.5
    }
  });

  console.log('Created spare parts and suppliers');

  // Create Maintenance Schedule
  await prisma.maintenance.create({
    data: {
      machineId: m1.id,
      type: 'Preventive Maintenance',
      scheduled_date: new Date('2026-09-10'),
      frequency: 'Monthly',
      assignedTechnicianId: tech.id,
      priority: 'HIGH',
      status: 'SCHEDULED'
    }
  });

  console.log('Seeding completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
