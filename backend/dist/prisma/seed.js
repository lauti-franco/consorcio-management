"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcryptjs");
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "ADMIN";
    UserRole["MAINTENANCE"] = "MAINTENANCE";
    UserRole["RESIDENT"] = "RESIDENT";
})(UserRole || (UserRole = {}));
var ExpenseStatus;
(function (ExpenseStatus) {
    ExpenseStatus["OPEN"] = "OPEN";
    ExpenseStatus["PAID"] = "PAID";
    ExpenseStatus["OVERDUE"] = "OVERDUE";
})(ExpenseStatus || (ExpenseStatus = {}));
var TicketStatus;
(function (TicketStatus) {
    TicketStatus["OPEN"] = "OPEN";
    TicketStatus["IN_PROGRESS"] = "IN_PROGRESS";
    TicketStatus["RESOLVED"] = "RESOLVED";
})(TicketStatus || (TicketStatus = {}));
var TaskStatus;
(function (TaskStatus) {
    TaskStatus["PENDING"] = "PENDING";
    TaskStatus["IN_PROGRESS"] = "IN_PROGRESS";
    TaskStatus["COMPLETED"] = "COMPLETED";
    TaskStatus["CANCELLED"] = "CANCELLED";
})(TaskStatus || (TaskStatus = {}));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Starting seed...');
    try {
        await prisma.refreshToken.deleteMany();
        await prisma.payment.deleteMany();
        await prisma.file.deleteMany();
        await prisma.task.deleteMany();
        await prisma.ticket.deleteMany();
        await prisma.expense.deleteMany();
        await prisma.user.deleteMany();
        await prisma.building.deleteMany();
        console.log('Database cleaned');
        const building = await prisma.building.create({
            data: {
                name: 'Edificio Central',
                address: 'Av. Principal 123',
                city: 'Buenos Aires',
            },
        });
        console.log('Building created:', building.name);
        const adminPassword = await bcrypt.hash('admin123', 12);
        const admin = await prisma.user.create({
            data: {
                name: 'Administrador Principal',
                email: 'admin@consorcio.com',
                passwordHash: adminPassword,
                role: UserRole.ADMIN,
            },
        });
        console.log('Admin user created:', admin.email);
        const maintenancePassword = await bcrypt.hash('mant123', 12);
        const maintenance = await prisma.user.create({
            data: {
                name: 'Técnico de Mantenimiento',
                email: 'mantenimiento@consorcio.com',
                passwordHash: maintenancePassword,
                role: UserRole.MAINTENANCE,
            },
        });
        console.log('Maintenance user created:', maintenance.email);
        const residentPassword = await bcrypt.hash('resi123', 12);
        const resident = await prisma.user.create({
            data: {
                name: 'Juan Resident',
                email: 'residente@consorcio.com',
                passwordHash: residentPassword,
                role: UserRole.RESIDENT,
                buildingId: building.id,
            },
        });
        console.log('Resident user created:', resident.email);
        const expense1 = await prisma.expense.create({
            data: {
                concept: 'Expensas Ordinarias Enero 2024',
                amount: 15000.50,
                dueDate: new Date('2024-01-10'),
                buildingId: building.id,
                userId: admin.id,
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