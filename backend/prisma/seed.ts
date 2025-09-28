
import { PrismaClient, UserRole, ExpenseStatus, TicketStatus, TaskStatus, Priority, PaymentMethod, ExpenseType, UnitType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  try {
    // Limpiar base de datos existente en orden correcto (por dependencias)
    await prisma.payment.deleteMany();
    await prisma.expense.deleteMany();
    await prisma.ticket.deleteMany();
    await prisma.task.deleteMany();
    await prisma.unit.deleteMany();
    await prisma.building.deleteMany();
    await prisma.subscription.deleteMany();
    await prisma.user.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.file.deleteMany();

    console.log('Database cleaned');

    // Crear usuario admin PRIMERO (necesario para crear el building)
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

    // Crear suscripción para el admin
    const subscription = await prisma.subscription.create({
      data: {
        plan: 'PROFESSIONAL',
        status: 'ACTIVE',
        maxBuildings: 5,
        maxUsers: 50,
        features: {
          advancedReports: true,
          apiAccess: true,
          customBranding: false,
          prioritySupport: true
        },
        userId: admin.id,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
      },
    });

    console.log('Subscription created for admin');

    // Crear edificio de ejemplo (con ownerId)
    const building = await prisma.building.create({
      data: {
        name: 'Edificio Central',
        address: 'Av. Principal 123',
        city: 'Buenos Aires',
        ownerId: admin.id, // IMPORTANTE: agregar ownerId
        settings: {
          currency: 'ARS',
          language: 'es',
          expenseCalculation: 'area_based'
        }
      },
    });

    console.log('Building created:', building.name);

    // Crear unidades para el edificio
    const unit1 = await prisma.unit.create({
      data: {
        number: '4A',
        floor: 4,
        type: UnitType.APARTMENT,
        area: 85.5,
        bedrooms: 2,
        bathrooms: 1,
        features: ['Balcón', 'Cocina equipada'],
        buildingId: building.id,
        isOccupied: true,
      },
    });

    const unit2 = await prisma.unit.create({
      data: {
        number: '4B',
        floor: 4,
        type: UnitType.APARTMENT,
        area: 92.0,
        bedrooms: 3,
        bathrooms: 2,
        features: ['Terraza', 'Vista al mar'],
        buildingId: building.id,
        isOccupied: true,
      },
    });

    console.log('Units created');

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

    // Crear usuario residente (con unidad asignada)
    const residentPasswordHash = await bcrypt.hash('resi123', 12);
    const resident = await prisma.user.create({
      data: {
        name: 'María González',
        email: 'maria.gonzalez@email.com',
        passwordHash: residentPasswordHash,
        role: UserRole.RESIDENT,
        managedUnits: {
          connect: { id: unit1.id }
        }
      },
    });

    // Crear segundo residente
    const resident2PasswordHash = await bcrypt.hash('resi123', 12);
    const resident2 = await prisma.user.create({
      data: {
        name: 'Carlos López',
        email: 'carlos.lopez@email.com',
        passwordHash: resident2PasswordHash,
        role: UserRole.RESIDENT,
        managedUnits: {
          connect: { id: unit2.id }
        }
      },
    });

    console.log('Resident users created');

    // Crear expensas de ejemplo (con unitId y tipo)
    const expense1 = await prisma.expense.create({
      data: {
        concept: 'Expensas Ordinarias Enero 2024',
        amount: 25000.00,
        dueDate: new Date('2024-01-10'),
        period: '2024-01',
        type: ExpenseType.ORDINARY,
        status: ExpenseStatus.OPEN,
        buildingId: building.id,
        unitId: unit1.id,
      },
    });

    const expense2 = await prisma.expense.create({
      data: {
        concept: 'Fondo de Reserva',
        amount: 5000.00,
        dueDate: new Date('2024-01-15'),
        period: '2024-01',
        type: ExpenseType.FUND,
        status: ExpenseStatus.OPEN,
        buildingId: building.id,
        unitId: unit2.id,
      },
    });

    console.log('Expenses created');

    // Crear tickets de ejemplo (con buildingId y unitId)
    const ticket1 = await prisma.ticket.create({
      data: {
        title: 'Fuga de agua en baño',
        description: 'Hay una fuga de agua en el baño principal del departamento 4A',
        status: TicketStatus.OPEN,
        priority: Priority.HIGH,
        category: 'PLUMBING',
        userId: resident.id,
        buildingId: building.id,
        unitId: unit1.id,
        assignedToId: maintenance.id,
        photos: [],
      },
    });

    const ticket2 = await prisma.ticket.create({
      data: {
        title: 'Luz de pasillo no funciona',
        description: 'La luz del pasillo del 4to piso no enciende',
        status: TicketStatus.IN_PROGRESS,
        priority: Priority.MEDIUM,
        category: 'ELECTRICAL',
        userId: resident2.id,
        buildingId: building.id,
        unitId: unit2.id,
        assignedToId: maintenance.id,
        photos: [],
      },
    });

    console.log('Tickets created');

    // Crear tareas de ejemplo (con buildingId)
    const task1 = await prisma.task.create({
      data: {
        title: 'Reparar fuga de agua reportada',
        description: 'Reparar fuga reportada en ticket #' + ticket1.id.substring(0, 8),
        status: TaskStatus.PENDING,
        priority: Priority.HIGH,
        assignedToId: maintenance.id,
        createdById: admin.id,
        buildingId: building.id,
        dueDate: new Date('2024-01-20'),
        photos: [],
      },
    });

    const task2 = await prisma.task.create({
      data: {
        title: 'Mantenimiento preventivo ascensor',
        description: 'Realizar mantenimiento trimestral del ascensor',
        status: TaskStatus.IN_PROGRESS,
        priority: Priority.MEDIUM,
        assignedToId: maintenance.id,
        createdById: admin.id,
        buildingId: building.id,
        dueDate: new Date('2024-02-01'),
        photos: [],
      },
    });

    console.log('Tasks created');

    // Crear pagos de ejemplo (con unitId)
    const payment1 = await prisma.payment.create({
      data: {
        amount: 25000.00,
        method: PaymentMethod.TRANSFER,
        status: 'COMPLETED',
        expenseId: expense1.id,
        userId: resident.id,
        unitId: unit1.id,
        receiptUrl: 'https://example.com/receipts/001',
      },
    });

    const payment2 = await prisma.payment.create({
      data: {
        amount: 5000.00,
        method: PaymentMethod.CASH,
        status: 'PENDING',
        expenseId: expense2.id,
        userId: resident2.id,
        unitId: unit2.id,
      },
    });

    console.log('Payments created');

    console.log('✅ Seed completed successfully!');
    console.log('📊 Summary:');
    console.log(`- Users: 4 (Admin, Maintenance, 2 Residents)`);
    console.log(`- Building: 1 with 2 units`);
    console.log(`- Expenses: 2`);
    console.log(`- Tickets: 2`);
    console.log(`- Tasks: 2`);
    console.log(`- Payments: 2`);

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
