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
const client_1 = require("@prisma/client");
let DashboardService = class DashboardService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboardByRole(userId, tenantId, userRole) {
        switch (userRole) {
            case client_1.UserRole.ADMIN:
            case client_1.UserRole.SUPER_ADMIN:
                return this.getAdminDashboard(userId, tenantId);
            case client_1.UserRole.RESIDENT:
                return this.getResidentDashboard(userId, tenantId);
            case client_1.UserRole.MAINTENANCE:
                return this.getMaintenanceDashboard(userId, tenantId);
            default:
                throw new common_1.NotFoundException(`Dashboard no implementado para el rol: ${userRole}`);
        }
    }
    async getAdminDashboard(userId, tenantId) {
        const [properties, units, residents, activeTickets, pendingExpenses, monthlyRevenue, expenseTrends, recentActivities, delinquency, quickStats] = await Promise.all([
            this.getPropertyStats(userId, tenantId),
            this.getUnitStats(userId, tenantId),
            this.getResidentStats(userId, tenantId),
            this.getActiveTickets(userId, tenantId),
            this.getPendingExpenses(userId, tenantId),
            this.getMonthlyRevenue(userId, tenantId),
            this.getExpenseTrends(userId, tenantId),
            this.getRecentActivities(userId, tenantId),
            this.getDelinquencyStats(userId, tenantId),
            this.getQuickStats(userId, tenantId)
        ]);
        const collectionRate = await this.calculateCollectionRate(userId, tenantId);
        const occupancyRate = units.total > 0 ? (units.occupied / units.total) * 100 : 0;
        return {
            overview: {
                totalProperties: properties.total,
                totalUnits: units.total,
                totalResidents: residents.total,
                activeTickets,
                pendingExpenses: pendingExpenses.totalAmount,
                monthlyRevenue,
                collectionRate,
                occupancyRate
            },
            properties,
            expenseTrends,
            recentActivities,
            delinquency,
            quickStats
        };
    }
    async getResidentDashboard(userId, tenantId) {
        const [userData, paymentHistory, financialSummary] = await Promise.all([
            this.getResidentUserData(userId, tenantId),
            this.getPaymentHistory(userId, tenantId),
            this.getFinancialSummary(userId, tenantId)
        ]);
        const { user, overview, recentExpenses, recentTickets } = userData;
        return {
            user,
            overview: {
                ...overview,
                nextDueDate: await this.getNextDueDate(userId, tenantId)
            },
            recentExpenses,
            recentTickets,
            paymentHistory,
            financialSummary
        };
    }
    async getMaintenanceDashboard(userId, tenantId) {
        const [assignedTickets, completedTickets, properties, priorityBreakdown, performanceMetrics] = await Promise.all([
            this.getAssignedTickets(userId, tenantId),
            this.getCompletedTicketsCount(userId, tenantId),
            this.getMaintenanceProperties(userId, tenantId),
            this.getPriorityBreakdown(userId, tenantId),
            this.getPerformanceMetrics(userId, tenantId)
        ]);
        return {
            overview: {
                assignedTickets: assignedTickets.length,
                completedThisMonth: completedTickets,
                activeProperties: properties.length,
                averageResolutionTime: performanceMetrics.averageResponseTime
            },
            assignedTickets,
            properties,
            priorityBreakdown,
            performanceMetrics
        };
    }
    async getPropertyStats(userId, tenantId) {
        const [total, active, occupiedUnits] = await Promise.all([
            this.prisma.property.count({
                where: {
                    ownerId: userId,
                    tenantId: tenantId
                },
            }),
            this.prisma.property.count({
                where: {
                    ownerId: userId,
                    tenantId: tenantId,
                    isActive: true
                },
            }),
            this.prisma.unit.count({
                where: {
                    property: {
                        ownerId: userId,
                        tenantId: tenantId
                    },
                    isOccupied: true
                }
            })
        ]);
        const totalUnits = await this.prisma.unit.count({
            where: {
                property: {
                    ownerId: userId,
                    tenantId: tenantId
                }
            }
        });
        const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;
        return { total, active, occupancyRate };
    }
    async getUnitStats(userId, tenantId) {
        const [total, occupied] = await Promise.all([
            this.prisma.unit.count({
                where: {
                    property: {
                        ownerId: userId,
                        tenantId: tenantId
                    },
                },
            }),
            this.prisma.unit.count({
                where: {
                    property: {
                        ownerId: userId,
                        tenantId: tenantId
                    },
                    isOccupied: true,
                },
            }),
        ]);
        return { total, occupied };
    }
    async getResidentStats(userId, tenantId) {
        const total = await this.prisma.user.count({
            where: {
                userTenants: {
                    some: {
                        tenantId: tenantId,
                        role: 'RESIDENT'
                    }
                }
            },
        });
        return { total };
    }
    async getActiveTickets(userId, tenantId) {
        return this.prisma.ticket.count({
            where: {
                property: {
                    ownerId: userId,
                    tenantId: tenantId
                },
                tenantId: tenantId,
                status: { in: ['OPEN', 'IN_PROGRESS'] },
            },
        });
    }
    async getPendingExpenses(userId, tenantId) {
        const result = await this.prisma.expense.aggregate({
            where: {
                property: {
                    ownerId: userId,
                    tenantId: tenantId
                },
                tenantId: tenantId,
                status: { in: ['OPEN', 'OVERDUE'] },
            },
            _sum: { amount: true },
        });
        return { totalAmount: result._sum.amount || 0 };
    }
    async getMonthlyRevenue(userId, tenantId) {
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const result = await this.prisma.payment.aggregate({
            where: {
                expense: {
                    property: {
                        ownerId: userId,
                        tenantId: tenantId
                    },
                },
                tenantId: tenantId,
                status: 'COMPLETED',
                date: { gte: startOfMonth },
            },
            _sum: { amount: true },
        });
        return result._sum.amount || 0;
    }
    async calculateCollectionRate(userId, tenantId) {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const expenses = await this.prisma.expense.findMany({
            where: {
                property: {
                    ownerId: userId,
                    tenantId: tenantId
                },
                tenantId: tenantId,
                dueDate: { gte: sixMonthsAgo },
                status: { in: ['OPEN', 'OVERDUE', 'PAID'] },
            },
            include: {
                payments: {
                    where: {
                        status: 'COMPLETED',
                        tenantId: tenantId
                    },
                },
            },
        });
        const totalDue = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const totalPaid = expenses.reduce((sum, expense) => sum + expense.payments.reduce((paid, payment) => paid + payment.amount, 0), 0);
        return totalDue > 0 ? (totalPaid / totalDue) * 100 : 0;
    }
    async getExpenseTrends(userId, tenantId) {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const trends = await this.prisma.expense.findMany({
            where: {
                property: {
                    ownerId: userId,
                    tenantId: tenantId
                },
                tenantId: tenantId,
                dueDate: { gte: sixMonthsAgo },
            },
            select: {
                period: true,
                amount: true,
                payments: {
                    where: {
                        status: 'COMPLETED',
                        tenantId: tenantId
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
            pending: data.total - data.collected,
        }));
    }
    async getRecentActivities(userId, tenantId) {
        const [recentPayments, recentTickets, recentExpenses, recentTasks] = await Promise.all([
            this.prisma.payment.findMany({
                where: {
                    expense: {
                        property: {
                            ownerId: userId,
                            tenantId: tenantId
                        },
                    },
                    tenantId: tenantId,
                },
                include: {
                    user: { select: { name: true } },
                    expense: { select: { concept: true } },
                    unit: { select: { number: true } },
                },
                orderBy: { date: 'desc' },
                take: 5,
            }),
            this.prisma.ticket.findMany({
                where: {
                    property: {
                        ownerId: userId,
                        tenantId: tenantId
                    },
                    tenantId: tenantId,
                },
                include: {
                    user: { select: { name: true } },
                    property: { select: { name: true } },
                },
                orderBy: { createdAt: 'desc' },
                take: 5,
            }),
            this.prisma.expense.findMany({
                where: {
                    property: {
                        ownerId: userId,
                        tenantId: tenantId
                    },
                    tenantId: tenantId,
                },
                include: {
                    property: { select: { name: true } },
                },
                orderBy: { createdAt: 'desc' },
                take: 5,
            }),
            this.prisma.task.findMany({
                where: {
                    property: {
                        ownerId: userId,
                        tenantId: tenantId
                    },
                    tenantId: tenantId,
                },
                include: {
                    property: { select: { name: true } },
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
                propertyName: payment.unit.number,
                amount: payment.amount,
            })),
            ...recentTickets.map(ticket => ({
                type: 'TICKET',
                description: `Ticket: ${ticket.title}`,
                date: ticket.createdAt,
                propertyName: ticket.property.name,
            })),
            ...recentExpenses.map(expense => ({
                type: 'EXPENSE',
                description: `Nueva expensa: ${expense.concept}`,
                date: expense.createdAt,
                propertyName: expense.property.name,
                amount: expense.amount,
            })),
            ...recentTasks.map(task => ({
                type: 'TASK',
                description: `Tarea: ${task.title}`,
                date: task.createdAt,
                propertyName: task.property.name,
            })),
        ];
        return activities.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 10);
    }
    async getDelinquencyStats(userId, tenantId) {
        const overdueExpenses = await this.prisma.expense.findMany({
            where: {
                property: {
                    ownerId: userId,
                    tenantId: tenantId
                },
                tenantId: tenantId,
                status: 'OVERDUE',
            },
            include: {
                unit: {
                    select: {
                        number: true,
                        property: {
                            select: {
                                name: true
                            }
                        }
                    }
                },
                payments: {
                    where: {
                        status: 'COMPLETED',
                        tenantId: tenantId
                    },
                },
            },
        });
        const totalOverdueAmount = overdueExpenses.reduce((sum, expense) => {
            const paidAmount = expense.payments.reduce((paid, payment) => paid + payment.amount, 0);
            return sum + (expense.amount - paidAmount);
        }, 0);
        const totalExpenses = await this.prisma.expense.aggregate({
            where: {
                property: {
                    ownerId: userId,
                    tenantId: tenantId
                },
                tenantId: tenantId,
            },
            _sum: { amount: true },
        });
        const delinquencyRate = totalExpenses._sum.amount > 0
            ? (totalOverdueAmount / totalExpenses._sum.amount) * 100
            : 0;
        const topDelinquentUnits = overdueExpenses
            .reduce((acc, expense) => {
            if (!expense.unit)
                return acc;
            const unitKey = `${expense.unit.property.name}-${expense.unit.number}`;
            const existing = acc.find(item => item.unitNumber === unitKey);
            const paidAmount = expense.payments.reduce((paid, payment) => paid + payment.amount, 0);
            const overdueAmount = expense.amount - paidAmount;
            if (existing) {
                existing.overdueAmount += overdueAmount;
            }
            else {
                acc.push({
                    unitNumber: unitKey,
                    propertyName: expense.unit.property.name,
                    overdueAmount,
                    daysOverdue: Math.floor((new Date().getTime() - expense.dueDate.getTime()) / (1000 * 3600 * 24))
                });
            }
            return acc;
        }, [])
            .sort((a, b) => b.overdueAmount - a.overdueAmount)
            .slice(0, 5);
        return {
            overdueExpenses: overdueExpenses.length,
            totalOverdueAmount,
            delinquencyRate,
            topDelinquentUnits
        };
    }
    async getQuickStats(userId, tenantId) {
        const [pendingTasks, openTickets, scheduledTasks, overdueExpenses] = await Promise.all([
            this.prisma.task.count({
                where: {
                    property: {
                        ownerId: userId,
                        tenantId: tenantId
                    },
                    tenantId: tenantId,
                    status: 'PENDING'
                }
            }),
            this.prisma.ticket.count({
                where: {
                    property: {
                        ownerId: userId,
                        tenantId: tenantId
                    },
                    tenantId: tenantId,
                    status: 'OPEN'
                }
            }),
            this.prisma.task.count({
                where: {
                    property: {
                        ownerId: userId,
                        tenantId: tenantId
                    },
                    tenantId: tenantId,
                    status: 'IN_PROGRESS'
                }
            }),
            this.prisma.expense.count({
                where: {
                    property: {
                        ownerId: userId,
                        tenantId: tenantId
                    },
                    tenantId: tenantId,
                    status: 'OVERDUE'
                }
            })
        ]);
        return {
            pendingTasks,
            openTickets,
            scheduledTasks,
            overdueExpenses
        };
    }
    async getResidentUserData(userId, tenantId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                userTenants: {
                    where: {
                        tenantId: tenantId
                    }
                },
                managedUnits: {
                    where: {
                        tenantId: tenantId,
                        isOccupied: true
                    },
                    include: {
                        property: true,
                        expenses: {
                            where: {
                                status: { in: ['OPEN', 'OVERDUE'] },
                                tenantId: tenantId
                            },
                            include: {
                                payments: {
                                    where: {
                                        userId,
                                        tenantId: tenantId
                                    },
                                },
                            },
                        },
                        tickets: {
                            where: {
                                status: { in: ['OPEN', 'IN_PROGRESS'] },
                                tenantId: tenantId
                            },
                            take: 5,
                            orderBy: { createdAt: 'desc' },
                        },
                    },
                },
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('Usuario no encontrado');
        }
        const userTenant = user.userTenants[0];
        if (!userTenant) {
            throw new common_1.ForbiddenException('Usuario no tiene acceso a este tenant');
        }
        const totalDue = user.managedUnits.reduce((sum, unit) => {
            return sum + unit.expenses.reduce((expenseSum, expense) => {
                const paidAmount = expense.payments.reduce((paid, payment) => paid + payment.amount, 0);
                return expenseSum + (expense.amount - paidAmount);
            }, 0);
        }, 0);
        const activeTickets = user.managedUnits.reduce((sum, unit) => sum + unit.tickets.length, 0);
        const recentExpenses = user.managedUnits.flatMap(unit => unit.expenses.map(expense => {
            const paidAmount = expense.payments.reduce((sum, payment) => sum + payment.amount, 0);
            return {
                id: expense.id,
                concept: expense.concept,
                amount: expense.amount,
                dueDate: expense.dueDate,
                status: expense.status,
                property: unit.property.name,
                unit: unit.number,
                paidAmount,
                remainingAmount: expense.amount - paidAmount
            };
        })).slice(0, 10);
        const recentTickets = user.managedUnits.flatMap(unit => unit.tickets.map(ticket => ({
            id: ticket.id,
            title: ticket.title,
            status: ticket.status,
            priority: ticket.priority,
            createdAt: ticket.createdAt,
            property: unit.property.name,
            unit: unit.number,
        })));
        return {
            user: {
                name: user.name,
                email: user.email,
                role: userTenant.role,
            },
            overview: {
                totalDue,
                activeTickets,
                managedUnits: user.managedUnits.length,
            },
            recentExpenses,
            recentTickets
        };
    }
    async getPaymentHistory(userId, tenantId) {
        const payments = await this.prisma.payment.findMany({
            where: {
                userId,
                tenantId: tenantId,
                status: 'COMPLETED'
            },
            include: {
                expense: {
                    select: {
                        concept: true
                    }
                }
            },
            orderBy: { date: 'desc' },
            take: 10
        });
        return payments.map(payment => ({
            id: payment.id,
            date: payment.date,
            amount: payment.amount,
            concept: payment.expense.concept,
            method: payment.method,
            status: payment.status
        }));
    }
    async getFinancialSummary(userId, tenantId) {
        const [paidResult, pendingResult, upcomingResult] = await Promise.all([
            this.prisma.payment.aggregate({
                where: {
                    userId,
                    tenantId: tenantId,
                    status: 'COMPLETED'
                },
                _sum: { amount: true }
            }),
            this.prisma.expense.aggregate({
                where: {
                    unit: {
                        managerId: userId
                    },
                    tenantId: tenantId,
                    status: { in: ['OPEN', 'OVERDUE'] }
                },
                _sum: { amount: true }
            }),
            this.prisma.expense.aggregate({
                where: {
                    unit: {
                        managerId: userId
                    },
                    tenantId: tenantId,
                    status: 'OPEN',
                    dueDate: {
                        gte: new Date()
                    }
                },
                _sum: { amount: true }
            })
        ]);
        return {
            totalPaid: paidResult._sum.amount || 0,
            pendingAmount: pendingResult._sum.amount || 0,
            upcomingExpenses: upcomingResult._sum.amount || 0
        };
    }
    async getNextDueDate(userId, tenantId) {
        const nextExpense = await this.prisma.expense.findFirst({
            where: {
                unit: {
                    managerId: userId
                },
                tenantId: tenantId,
                status: 'OPEN',
                dueDate: {
                    gte: new Date()
                }
            },
            orderBy: {
                dueDate: 'asc'
            },
            select: {
                dueDate: true
            }
        });
        return nextExpense?.dueDate;
    }
    async getAssignedTickets(userId, tenantId) {
        return this.prisma.ticket.findMany({
            where: {
                assignedToId: userId,
                tenantId: tenantId,
                status: { in: ['OPEN', 'IN_PROGRESS'] },
            },
            include: {
                property: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                unit: {
                    select: {
                        id: true,
                        number: true
                    }
                },
                user: {
                    select: {
                        name: true,
                        phone: true,
                    },
                },
            },
            orderBy: { priority: 'desc' },
        });
    }
    async getCompletedTicketsCount(userId, tenantId) {
        return this.prisma.ticket.count({
            where: {
                assignedToId: userId,
                tenantId: tenantId,
                status: 'RESOLVED',
                updatedAt: {
                    gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                },
            },
        });
    }
    async getMaintenanceProperties(userId, tenantId) {
        return this.prisma.property.findMany({
            where: {
                tenantId: tenantId,
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
        }).then(properties => properties.map(property => ({
            id: property.id,
            name: property.name,
            activeTickets: property._count.tickets
        })));
    }
    async getPriorityBreakdown(userId, tenantId) {
        const result = await this.prisma.ticket.groupBy({
            by: ['priority'],
            where: {
                assignedToId: userId,
                tenantId: tenantId,
                status: { in: ['OPEN', 'IN_PROGRESS'] },
            },
            _count: {
                id: true,
            },
        });
        const breakdown = { high: 0, medium: 0, low: 0 };
        result.forEach(item => {
            breakdown[item.priority.toLowerCase()] = item._count.id;
        });
        return breakdown;
    }
    async getPerformanceMetrics(userId, tenantId) {
        const resolvedTickets = await this.prisma.ticket.findMany({
            where: {
                assignedToId: userId,
                tenantId: tenantId,
                status: 'RESOLVED',
                updatedAt: {
                    gte: new Date(new Date().setMonth(new Date().getMonth() - 3)),
                },
            },
            select: {
                createdAt: true,
                updatedAt: true,
            },
        });
        const totalTickets = resolvedTickets.length;
        const totalResponseTime = resolvedTickets.reduce((sum, ticket) => {
            const responseTime = ticket.updatedAt.getTime() - ticket.createdAt.getTime();
            return sum + responseTime;
        }, 0);
        const averageResponseTime = totalTickets > 0 ? totalResponseTime / totalTickets / (1000 * 3600 * 24) : 0;
        const resolutionRate = totalTickets > 0 ? (totalTickets / (totalTickets + 5)) * 100 : 0;
        const customerSatisfaction = 4.5;
        return {
            resolutionRate,
            averageResponseTime,
            customerSatisfaction
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map