"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let DashboardService = class DashboardService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAdminDashboard(userId) {
        const [buildings, units, residents, activeTickets, pendingExpenses, monthlyRevenue, expenseTrends, recentActivities] = await Promise.all([
            this.getBuildingStats(userId),
            this.getUnitStats(userId),
            this.getResidentStats(userId),
            this.getActiveTickets(userId),
            this.getPendingExpenses(userId),
            this.getMonthlyRevenue(userId),
            this.getExpenseTrends(userId),
            this.getRecentActivities(userId)
        ]);
        const collectionRate = await this.calculateCollectionRate(userId);
        return {
            overview: {
                totalBuildings: buildings.total,
                totalUnits: units.total,
                totalResidents: residents.total,
                activeTickets,
                pendingExpenses: pendingExpenses.totalAmount,
                monthlyRevenue,
                collectionRate,
            },
            buildings,
            expenseTrends,
            recentActivities,
        };
    }
    async getResidentDashboard(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                managedUnits: {
                    include: {
                        building: true,
                        expenses: {
                            where: {
                                status: { in: ['OPEN', 'OVERDUE'] },
                            },
                            include: {
                                payments: {
                                    where: { userId },
                                },
                            },
                        },
                        tickets: {
                            where: {
                                status: { in: ['OPEN', 'IN_PROGRESS'] },
                            },
                            take: 5,
                            orderBy: { createdAt: 'desc' },
                        },
                    },
                },
            },
        });
        if (!user) {
            throw new Error('User not found');
        }
        const totalDue = user.managedUnits.reduce((sum, unit) => {
            return sum + unit.expenses.reduce((expenseSum, expense) => {
                const paidAmount = expense.payments.reduce((paid, payment) => paid + payment.amount, 0);
                return expenseSum + (expense.amount - paidAmount);
            }, 0);
        }, 0);
        const activeTickets = user.managedUnits.reduce((sum, unit) => sum + unit.tickets.length, 0);
        return {
            user: {
                name: user.name,
                email: user.email,
                role: user.role,
            },
            overview: {
                totalDue,
                activeTickets,
                managedUnits: user.managedUnits.length,
            },
            recentExpenses: user.managedUnits.flatMap(unit => unit.expenses.map(expense => ({
                ...expense,
                building: unit.building.name,
                unit: unit.number,
                paidAmount: expense.payments.reduce((sum, payment) => sum + payment.amount, 0),
            }))).slice(0, 10),
            recentTickets: user.managedUnits.flatMap(unit => unit.tickets.map(ticket => ({
                ...ticket,
                building: unit.building.name,
                unit: unit.number,
            }))),
        };
    }
    async getMaintenanceDashboard(userId) {
        const [assignedTickets, completedTickets, buildings] = await Promise.all([
            this.prisma.ticket.findMany({
                where: {
                    assignedToId: userId,
                    status: { in: ['OPEN', 'IN_PROGRESS'] },
                },
                include: {
                    building: true,
                    unit: true,
                    user: {
                        select: {
                            name: true,
                            phone: true,
                        },
                    },
                },
                orderBy: { priority: 'desc' },
            }),
            this.prisma.ticket.count({
                where: {
                    assignedToId: userId,
                    status: 'RESOLVED',
                    updatedAt: {
                        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                    },
                },
            }),
            this.prisma.building.findMany({
                where: {
                    tickets: {
                        some: {
                            assignedToId: userId,
                        },
                    },
                },
                select: {
                    id: true,
                    name: true,
                    _count: {
                        select: {
                            tickets: {
                                where: {
                                    assignedToId: userId,
                                    status: { in: ['OPEN', 'IN_PROGRESS'] },
                                },
                            },
                        },
                    },
                },
            }),
        ]);
        return {
            overview: {
                assignedTickets: assignedTickets.length,
                completedThisMonth: completedTickets,
                activeBuildings: buildings.length,
            },
            assignedTickets,
            buildings,
        };
    }
    async getBuildingStats(userId) {
        const [total, active] = await Promise.all([
            this.prisma.building.count({
                where: { ownerId: userId },
            }),
            this.prisma.building.count({
                where: {
                    ownerId: userId,
                    isActive: true
                },
            }),
        ]);
        return { total, active };
    }
    async getUnitStats(userId) {
        const [total, occupied] = await Promise.all([
            this.prisma.unit.count({
                where: {
                    building: { ownerId: userId },
                },
            }),
            this.prisma.unit.count({
                where: {
                    building: { ownerId: userId },
                    isOccupied: true,
                },
            }),
        ]);
        return { total, occupied };
    }
    async getResidentStats(userId) {
        const total = await this.prisma.user.count({
            where: {
                OR: [
                    { ownedBuildings: { some: { ownerId: userId } } },
                    { managedUnits: { some: { building: { ownerId: userId } } } },
                ],
                role: 'RESIDENT',
            },
        });
        return { total };
    }
    async getActiveTickets(userId) {
        return this.prisma.ticket.count({
            where: {
                building: { ownerId: userId },
                status: { in: ['OPEN', 'IN_PROGRESS'] },
            },
        });
    }
    async getPendingExpenses(userId) {
        const result = await this.prisma.expense.aggregate({
            where: {
                building: { ownerId: userId },
                status: { in: ['OPEN', 'OVERDUE'] },
            },
            _sum: { amount: true },
        });
        return { totalAmount: result._sum.amount || 0 };
    }
    async getMonthlyRevenue(userId) {
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const result = await this.prisma.payment.aggregate({
            where: {
                expense: {
                    building: { ownerId: userId },
                },
                status: 'COMPLETED',
                date: { gte: startOfMonth },
            },
            _sum: { amount: true },
        });
        return result._sum.amount || 0;
    }
    async calculateCollectionRate(userId) {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const expenses = await this.prisma.expense.findMany({
            where: {
                building: { ownerId: userId },
                dueDate: { gte: sixMonthsAgo },
                status: { in: ['OPEN', 'OVERDUE', 'PAID'] },
            },
            include: {
                payments: {
                    where: {
                        status: 'COMPLETED',
                    },
                },
            },
        });
        const totalDue = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const totalPaid = expenses.reduce((sum, expense) => sum + expense.payments.reduce((paid, payment) => paid + payment.amount, 0), 0);
        return totalDue > 0 ? (totalPaid / totalDue) * 100 : 0;
    }
    async getExpenseTrends(userId) {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const trends = await this.prisma.expense.findMany({
            where: {
                building: { ownerId: userId },
                dueDate: { gte: sixMonthsAgo },
            },
            select: {
                period: true,
                amount: true,
                payments: {
                    where: {
                        status: 'COMPLETED',
                    },
                    select: {
                        amount: true,
                    },
                },
            },
            orderBy: { dueDate: 'asc' },
        });
        const grouped = trends.reduce((acc, expense) => {
            if (!acc[expense.period]) {
                acc[expense.period] = { total: 0, collected: 0 };
            }
            acc[expense.period].total += expense.amount;
            acc[expense.period].collected += expense.payments.reduce((sum, p) => sum + p.amount, 0);
            return acc;
        }, {});
        return Object.entries(grouped).map(([period, data]) => ({
            period,
            total: data.total,
            collected: data.collected,
        }));
    }
    async getRecentActivities(userId) {
        const [recentPayments, recentTickets, recentExpenses] = await Promise.all([
            this.prisma.payment.findMany({
                where: {
                    expense: {
                        building: { ownerId: userId },
                    },
                },
                include: {
                    user: {
                        select: {
                            name: true,
                        },
                    },
                    expense: {
                        select: {
                            concept: true,
                        },
                    },
                    unit: {
                        select: {
                            number: true,
                        },
                    },
                },
                orderBy: { date: 'desc' },
                take: 5,
            }),
            this.prisma.ticket.findMany({
                where: {
                    building: { ownerId: userId },
                },
                include: {
                    user: {
                        select: {
                            name: true,
                        },
                    },
                    building: {
                        select: {
                            name: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                take: 5,
            }),
            this.prisma.expense.findMany({
                where: {
                    building: { ownerId: userId },
                },
                include: {
                    building: {
                        select: {
                            name: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                take: 5,
            }),
        ]);
        const activities = [
            ...recentPayments.map(payment => ({
                type: 'PAYMENT',
                description: `Pago de ${payment.user.name} - ${payment.expense.concept}`,
                date: payment.date,
                buildingName: payment.unit.number,
            })),
            ...recentTickets.map(ticket => ({
                type: 'TICKET',
                description: `Ticket: ${ticket.title}`,
                date: ticket.createdAt,
                buildingName: ticket.building.name,
            })),
            ...recentExpenses.map(expense => ({
                type: 'EXPENSE',
                description: `Nueva expensa: ${expense.concept}`,
                date: expense.createdAt,
                buildingName: expense.building.name,
            })),
        ];
        return activities.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 10);
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map