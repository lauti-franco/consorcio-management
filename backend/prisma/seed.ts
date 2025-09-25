import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

// Enums locales para el seed
enum UserRole {
  ADMIN = 'ADMIN',
  MAINTENANCE = 'MAINTENANCE',
  RESIDENT = 'RESIDENT'
}

enum ExpenseStatus {
  OPEN = 'OPEN',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE'
}

enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED'
}

enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  try {
    // Limpiar base de datos existente en orden correcto (por dependencias)
    await prisma.refreshToken.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.file.deleteMany();
    await prisma.task.deleteMany();
    await prisma.ticket.deleteMany();
    await prisma.expense.deleteMany();
    await prisma.user.deleteMany();
    await prisma.building.deleteMany();

    console.log('Database cleaned');

    // Crear edificio de ejemplo
    const building = await prisma.building.create({
      data: {
        name: 'Edificio Central',
        address: 'Av. Principal 123',
        city: 'Buenos Aires',
      },
    });

    console.log('Building created:', building.name);

    // Crear usuario admin
    const adminPasswordHash = await bcrypt.hash('admin123', 12);
    const admin = await prisma.user.create({
      data: {
        name: 'Administrador Principal',
        email: 'admin@consorcio.com',
        passwordHash: adminPasswordHash,
        role: UserRole.ADMIN,
      },
    });

    console.log('Admin user created:', admin.email);

    // Crear usuario mantenimiento
    const maintenancePasswordHash = await bcrypt.hash('mant123', 12);
    const maintenance = await prisma.user.create({
      data: {
        name: 'Técnico de Mantenimiento',
        email: 'mantenimiento@consorcio.com',
        passwordHash: maintenancePasswordHash,
        role: UserRole.MAINTENANCE,
      },
    });

    console.log('Maintenance user created:', maintenance.email);

    // Crear usuario residente
    const residentPasswordHash = await bcrypt.hash('resi123', 12);
    const resident = await prisma.user.create({
      data: {
        name: 'Juan Resident',
        email: 'residente@consorcio.com',
        passwordHash: residentPasswordHash,
        role: UserRole.RESIDENT,
        buildingId: building.id,
      },
    });

    console.log('Resident user created:', resident.email);

    // Crear expensas de ejemplo
    const expense1 = await prisma.expense.create({
      data: {
        concept: 'Expensas Ordinarias Enero 2024',
        amount: 15000.50,
        dueDate: new Date('2024-01-10'),
        buildingId: building.id,
        userId: admin.id, // El admin crea la expensa
      },
    });

    const expense2 = await prisma.expense.create({
      data: {
        concept: 'Expensas Extraordinarias Mantenimiento Ascensor',
        amount: 5000.00,
        dueDate: new Date('2024-01-15'),
        buildingId: building.id,
        userId: admin.id,
      },
    });

    console.log('Expenses created');

    // Crear tickets de ejemplo
    const ticket = await prisma.ticket.create({
      data: {
        title: 'Fuga de agua en baño',
        description: 'Hay una fuga de agua en el baño principal del departamento 4B',
        status: TicketStatus.OPEN,
        userId: resident.id,
        photos: [],
      },
    });

    console.log('Ticket created:', ticket.title);

    // Crear tarea de ejemplo
    const task = await prisma.task.create({
      data: {
        title: 'Reparar fuga de agua',
        description: 'Reparar fuga reportada en ticket #001',
        status: TaskStatus.PENDING,
        assignedTo: maintenance.id,
        createdBy: admin.id,
        photos: [],
        dueDate: new Date('2024-01-20'),
      },
    });

    console.log('Task created:', task.title);

    // Crear un pago de ejemplo
    const payment = await prisma.payment.create({
      data: {
        amount: 15000.50,
        method: 'transfer',
        expenseId: expense1.id,
        userId: resident.id,
        receiptUrl: 'https://example.com/receipts/12345',
      },
    });

    console.log('Payment created');

    console.log('✅ Seed completed successfully!');

  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('Seed process failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });