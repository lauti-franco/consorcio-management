"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Starting seed...');
    try {
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
        const adminPasswordHash = await bcrypt.hash('admin123', 12);
        const admin = await prisma.user.create({
            data: {
                name: 'Administrador Principal',
                email: 'admin@consorcio.com',
                passwordHash: adminPasswordHash,
                role: client_1.UserRole.ADMIN,
            },
        });
        console.log('Admin user created:', admin.email);
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
                currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
        });
        console.log('Subscription created for admin');
        const building = await prisma.building.create({
            data: {
                name: 'Edificio Central',
                address: 'Av. Principal 123',
                city: 'Buenos Aires',
                ownerId: admin.id,
                settings: {
                    currency: 'ARS',
                    language: 'es',
                    expenseCalculation: 'area_based'
                }
            },
        });
        console.log('Building created:', building.name);
        const unit1 = await prisma.unit.create({
            data: {
                number: '4A',
                floor: 4,
                type: client_1.UnitType.APARTMENT,
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
                type: client_1.UnitType.APARTMENT,
                area: 92.0,
                bedrooms: 3,
                bathrooms: 2,
                features: ['Terraza', 'Vista al mar'],
                buildingId: building.id,
                isOccupied: true,
            },
        });
        console.log('Units created');
        const maintenancePasswordHash = await bcrypt.hash('mant123', 12);
        const maintenance = await prisma.user.create({
            data: {
                name: 'Técnico de Mantenimiento',
                email: 'mantenimiento@consorcio.com',
                passwordHash: maintenancePasswordHash,
                role: client_1.UserRole.MAINTENANCE,
            },
        });
        console.log('Maintenance user created:', maintenance.email);
        const residentPasswordHash = await bcrypt.hash('resi123', 12);
        const resident = await prisma.user.create({
            data: {
                name: 'María González',
                email: 'maria.gonzalez@email.com',
                passwordHash: residentPasswordHash,
                role: client_1.UserRole.RESIDENT,
                managedUnits: {
                    connect: { id: unit1.id }
                }
            },
        });
        const resident2PasswordHash = await bcrypt.hash('resi123', 12);
        const resident2 = await prisma.user.create({
            data: {
                name: 'Carlos López',
                email: 'carlos.lopez@email.com',
                passwordHash: resident2PasswordHash,
                role: client_1.UserRole.RESIDENT,
                managedUnits: {
                    connect: { id: unit2.id }
                }
            },
        });
        console.log('Resident users created');
        const expense1 = await prisma.expense.create({
            data: {
                concept: 'Expensas Ordinarias Enero 2024',
                amount: 25000.00,
                dueDate: new Date('2024-01-10'),
                period: '2024-01',
                type: client_1.ExpenseType.ORDINARY,
                status: client_1.ExpenseStatus.OPEN,
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
                type: client_1.ExpenseType.FUND,
                status: client_1.ExpenseStatus.OPEN,
                buildingId: building.id,
                unitId: unit2.id,
            },
        });
        console.log('Expenses created');
        const ticket1 = await prisma.ticket.create({
            data: {
                title: 'Fuga de agua en baño',
                description: 'Hay una fuga de agua en el baño principal del departamento 4A',
                status: client_1.TicketStatus.OPEN,
                priority: client_1.Priority.HIGH,
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
                status: client_1.TicketStatus.IN_PROGRESS,
                priority: client_1.Priority.MEDIUM,
                category: 'ELECTRICAL',
                userId: resident2.id,
                buildingId: building.id,
                unitId: unit2.id,
                assignedToId: maintenance.id,
                photos: [],
            },
        });
        console.log('Tickets created');
        const task1 = await prisma.task.create({
            data: {
                title: 'Reparar fuga de agua reportada',
                description: 'Reparar fuga reportada en ticket #' + ticket1.id.substring(0, 8),
                status: client_1.TaskStatus.PENDING,
                priority: client_1.Priority.HIGH,
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
                status: client_1.TaskStatus.IN_PROGRESS,
                priority: client_1.Priority.MEDIUM,
                assignedToId: maintenance.id,
                createdById: admin.id,
                buildingId: building.id,
                dueDate: new Date('2024-02-01'),
                photos: [],
            },
        });
        console.log('Tasks created');
        const payment1 = await prisma.payment.create({
            data: {
                amount: 25000.00,
                method: client_1.PaymentMethod.TRANSFER,
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
                method: client_1.PaymentMethod.CASH,
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
    }
    catch (error) {
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
//# sourceMappingURL=seed.js.map