// prisma/seed.ts - ACTUALIZADO para multi-tenant
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
    await prisma.property.deleteMany(); // CAMBIADO: Building → Property
    await prisma.userTenant.deleteMany(); // AGREGADO
    await prisma.tenant.deleteMany(); // AGREGADO
    await prisma.subscription.deleteMany();
    await prisma.user.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.file.deleteMany();

    console.log('Database cleaned');

    // 1. CREAR TENANT PRINCIPAL
    const tenant = await prisma.tenant.create({
      data: {
        name: 'Consorcio Edificio Central',
        description: 'Edificio principal de administración',
        isActive: true
      }
    });

    console.log('Tenant created:', tenant.name);

    // 2. Crear usuario admin
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

    // 3. Asociar admin al tenant
    await prisma.userTenant.create({
      data: {
        userId: admin.id,
        tenantId: tenant.id,
        role: UserRole.ADMIN
      }
    });

    console.log('Admin associated with tenant');

    // 4. Crear suscripción para el admin
    const subscription = await prisma.subscription.create({
      data: {
        plan: 'PROFESSIONAL',
        status: 'ACTIVE',
        maxProperties: 5, // CAMBIADO: maxBuildings → maxProperties
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

    // 5. Crear propiedad de ejemplo (con ownerId y tenantId)
    const property = await prisma.property.create({ // CAMBIADO: Building → Property
      data: {
        name: 'Edificio Central',
        address: 'Av. Principal 123',
        city: 'Buenos Aires',
        ownerId: admin.id,
        tenantId: tenant.id, // AGREGADO: tenantId
        settings: {
          currency: 'ARS',
          language: 'es',
          expenseCalculation: 'area_based'
        }
      },
    });

    console.log('Property created:', property.name);

    // 6. Crear unidades para la propiedad (con tenantId)
    const unit1 = await prisma.unit.create({
      data: {
        number: '4A',
        floor: 4,
        type: UnitType.APARTMENT,
        area: 85.5,
        bedrooms: 2,
        bathrooms: 1,
        features: ['Balcón', 'Cocina equipada'],
        propertyId: property.id, // CAMBIADO: buildingId → propertyId
        tenantId: tenant.id, // AGREGADO: tenantId
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
        propertyId: property.id, // CAMBIADO: buildingId → propertyId
        tenantId: tenant.id, // AGREGADO: tenantId
        isOccupied: true,
      },
    });

    console.log('Units created');

    // 7. Crear usuario mantenimiento
    const maintenancePasswordHash = await bcrypt.hash('mant123', 12);
    const maintenance = await prisma.user.create({
      data: {
        name: 'Técnico de Mantenimiento',
        email: 'mantenimiento@consorcio.com',
        passwordHash: maintenancePasswordHash,
        role: UserRole.MAINTENANCE,
      },
    });

    // Asociar mantenimiento al tenant
    await prisma.userTenant.create({
      data: {
        userId: maintenance.id,
        tenantId: tenant.id,
        role: UserRole.MAINTENANCE
      }
    });

    console.log('Maintenance user created:', maintenance.email);

    // 8. Crear usuario residente (con unidad asignada)
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

    // Asociar residente al tenant
    await prisma.userTenant.create({
      data: {
        userId: resident.id,
        tenantId: tenant.id,
        role: UserRole.RESIDENT
      }
    });

    // 9. Crear segundo residente
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

    // Asociar segundo residente al tenant
    await prisma.userTenant.create({
      data: {
        userId: resident2.id,
        tenantId: tenant.id,
        role: UserRole.RESIDENT
      }
    });

    console.log('Resident users created');

    // 10. Crear expensas de ejemplo (con propertyId y tenantId)
    const expense1 = await prisma.expense.create({
      data: {
        concept: 'Expensas Ordinarias Enero 2024',
        amount: 25000.00,
        dueDate: new Date('2024-01-10'),
        period: '2024-01',
        type: ExpenseType.ORDINARY,
        status: ExpenseStatus.OPEN,
        propertyId: property.id, // CAMBIADO: buildingId → propertyId
        tenantId: tenant.id, // AGREGADO: tenantId
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
        propertyId: property.id, // CAMBIADO: buildingId → propertyId
        tenantId: tenant.id, // AGREGADO: tenantId
        unitId: unit2.id,
      },
    });

    console.log('Expenses created');

    // 11. Crear tickets de ejemplo (con propertyId y tenantId)
    const ticket1 = await prisma.ticket.create({
      data: {
        title: 'Fuga de agua en baño',
        description: 'Hay una fuga de agua en el baño principal del departamento 4A',
        status: TicketStatus.OPEN,
        priority: Priority.HIGH,
        category: 'PLUMBING',
        userId: resident.id,
        propertyId: property.id, // CAMBIADO: buildingId → propertyId
        tenantId: tenant.id, // AGREGADO: tenantId
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
        propertyId: property.id, // CAMBIADO: buildingId → propertyId
        tenantId: tenant.id, // AGREGADO: tenantId
        unitId: unit2.id,
        assignedToId: maintenance.id,
        photos: [],
      },
    });

    console.log('Tickets created');

    // 12. Crear tareas de ejemplo (con propertyId y tenantId)
    const task1 = await prisma.task.create({
      data: {
        title: 'Reparar fuga de agua reportada',
        description: 'Reparar fuga reportada en ticket #' + ticket1.id.substring(0, 8),
        status: TaskStatus.PENDING,
        priority: Priority.HIGH,
        assignedToId: maintenance.id,
        createdById: admin.id,
        propertyId: property.id, // CAMBIADO: buildingId → propertyId
        tenantId: tenant.id, // AGREGADO: tenantId
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
        propertyId: property.id, // CAMBIADO: buildingId → propertyId
        tenantId: tenant.id, // AGREGADO: tenantId
        dueDate: new Date('2024-02-01'),
        photos: [],
      },
    });

    console.log('Tasks created');

    // 13. Crear pagos de ejemplo (con tenantId)
    const payment1 = await prisma.payment.create({
      data: {
        amount: 25000.00,
        method: PaymentMethod.TRANSFER,
        status: 'COMPLETED',
        expenseId: expense1.id,
        userId: resident.id,
        unitId: unit1.id,
        tenantId: tenant.id, // AGREGADO: tenantId
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
        tenantId: tenant.id, // AGREGADO: tenantId
      },
    });

    console.log('Payments created');

    console.log('✅ Seed completed successfully!');
    console.log('📊 Summary:');
    console.log(`- Tenant: ${tenant.name}`);
    console.log(`- Users: 4 (Admin, Maintenance, 2 Residents)`);
    console.log(`- Property: 1 with 2 units`);
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