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
exports.KpisService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let KpisService = class KpisService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAdvancedKPIs(tenantId, userId, period = '30d') {
        const [financial, maintenance, occupancy, properties] = await Promise.all([
            this.getFinancialKPIs(tenantId, period),
            this.getMaintenanceKPIs(tenantId, period),
            this.getOccupancyKPIs(tenantId, period),
            this.getPropertiesKPIs(tenantId)
        ]);
        return {
            financial,
            maintenance,
            occupancy,
            properties,
            trends: await this.getTrends(tenantId, period)
        };
    }
    async getFinancialKPIs(tenantId, period) {
        const currentDate = new Date();
        const previousDate = this.getPreviousPeriodDate(period);
        const [currentData, previousData, collectionData] = await Promise.all([
            this.getFinancialDataForPeriod(tenantId, currentDate, period),
            this.getFinancialDataForPeriod(tenantId, previousDate, period),
            this.getCollectionData(tenantId, period)
        ]);
        const revenueGrowth = previousData.revenue > 0
            ? ((currentData.revenue - previousData.revenue) / previousData.revenue) * 100
            : 0;
        const expenseGrowth = previousData.expenses > 0
            ? ((currentData.expenses - previousData.expenses) / previousData.expenses) * 100
            : 0;
        return {
            currentRevenue: currentData.revenue,
            previousRevenue: previousData.revenue,
            revenueGrowth,
            currentExpenses: currentData.expenses,
            previousExpenses: previousData.expenses,
            expenseGrowth,
            netProfit: currentData.revenue - currentData.expenses,
            profitMargin: currentData.revenue > 0
                ? ((currentData.revenue - currentData.expenses) / currentData.revenue) * 100
                : 0,
            collectionRate: collectionData.collectionRate,
            delinquencyRate: collectionData.delinquencyRate
        };
    }
    async getMaintenanceKPIs(tenantId, period) {
        const dateFilter = this.getDateFilter(period);
        const [totalTickets, resolvedTickets, resolutionTimes] = await Promise.all([
            this.prisma.ticket.count({
                where: {
                    tenantId,
                    createdAt: dateFilter
                }
            }),
            this.prisma.ticket.count({
                where: {
                    tenantId,
                    status: 'RESOLVED',
                    updatedAt: dateFilter
                }
            }),
            this.getAverageResolutionTime(tenantId, period)
        ]);
        const preventiveMaintenance = await this.prisma.ticket.count({
            where: {
                tenantId,
                category: 'MAINTENANCE',
                status: 'RESOLVED',
                updatedAt: dateFilter
            }
        });
        return {
            totalTickets,
            resolvedTickets,
            resolutionRate: totalTickets > 0 ? (resolvedTickets / totalTickets) * 100 : 0,
            avgResolutionTime: resolutionTimes,
            maintenanceCosts: 0,
            preventiveMaintenanceRate: totalTickets > 0 ? (preventiveMaintenance / totalTickets) * 100 : 0
        };
    }
    async getOccupancyKPIs(tenantId, period) {
        const [totalUnits, occupiedUnits] = await Promise.all([
            this.prisma.unit.count({
                where: { tenantId }
            }),
            this.prisma.unit.count({
                where: {
                    tenantId,
                    isOccupied: true
                }
            })
        ]);
        const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;
        const vacancyRate = 100 - occupancyRate;
        return {
            totalUnits,
            occupiedUnits,
            occupancyRate,
            vacancyRate,
            averageTenancyDuration: 365,
            turnoverRate: 15
        };
    }
    async getPropertiesKPIs(tenantId) {
        const properties = await this.prisma.property.findMany({
            where: { tenantId },
            include: {
                units: true,
                expenses: {
                    include: {
                        payments: {
                            where: { status: 'COMPLETED' }
                        }
                    }
                },
                tickets: true
            }
        });
        return properties.map(property => {
            const totalUnits = property.units.length;
            const occupiedUnits = property.units.filter(unit => unit.isOccupied).length;
            const totalRevenue = property.expenses.reduce((sum, expense) => {
                const paid = expense.payments.reduce((paidSum, payment) => paidSum + payment.amount, 0);
                return sum + paid;
            }, 0);
            const maintenanceCosts = 0;
            const revenuePerUnit = totalUnits > 0 ? totalRevenue / totalUnits : 0;
            const maintenanceCostPerUnit = totalUnits > 0 ? maintenanceCosts / totalUnits : 0;
            const expenseRatio = totalRevenue > 0 ? (maintenanceCosts / totalRevenue) * 100 : 0;
            return {
                propertyValue: 0,
                maintenanceCostPerUnit,
                revenuePerUnit,
                expenseRatio
            };
        });
    }
    async getTrends(tenantId, period) {
        const months = 6;
        const trends = [];
        for (let i = months - 1; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthData = await this.getFinancialDataForPeriod(tenantId, date, '30d');
            trends.push({
                period: date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
                value: monthData.revenue
            });
        }
        return {
            revenueTrend: trends,
            expenseTrend: trends.map(t => ({ ...t, value: t.value * 0.6 })),
            occupancyTrend: trends.map(t => ({ ...t, value: 85 + (Math.random() * 10) }))
        };
    }
    async getFinancialDataForPeriod(tenantId, date, period) {
        const startDate = this.getPeriodStartDate(date, period);
        const endDate = this.getPeriodEndDate(date, period);
        const [revenue, expenses] = await Promise.all([
            this.prisma.payment.aggregate({
                where: {
                    tenantId,
                    status: 'COMPLETED',
                    date: { gte: startDate, lte: endDate }
                },
                _sum: { amount: true }
            }),
            this.prisma.expense.aggregate({
                where: {
                    tenantId,
                    dueDate: { gte: startDate, lte: endDate }
                },
                _sum: { amount: true }
            })
        ]);
        return {
            revenue: revenue._sum.amount || 0,
            expenses: expenses._sum.amount || 0
        };
    }
    async getCollectionData(tenantId, period) {
        const dateFilter = this.getDateFilter(period);
        const expenses = await this.prisma.expense.findMany({
            where: {
                tenantId,
                dueDate: dateFilter
            },
            include: {
                payments: {
                    where: { status: 'COMPLETED' }
                }
            }
        });
        let totalDue = 0;
        let totalCollected = 0;
        let overdueAmount = 0;
        expenses.forEach(expense => {
            totalDue += expense.amount;
            const paid = expense.payments.reduce((sum, payment) => sum + payment.amount, 0);
            totalCollected += paid;
            if (expense.status === 'OVERDUE') {
                overdueAmount += (expense.amount - paid);
            }
        });
        return {
            collectionRate: totalDue > 0 ? (totalCollected / totalDue) * 100 : 0,
            delinquencyRate: totalDue > 0 ? (overdueAmount / totalDue) * 100 : 0
        };
    }
    getDateFilter(period) {
        const now = new Date();
        const startDate = new Date();
        switch (period) {
            case '7d':
                startDate.setDate(now.getDate() - 7);
                break;
            case '30d':
                startDate.setDate(now.getDate() - 30);
                break;
            case '90d':
                startDate.setDate(now.getDate() - 90);
                break;
            default:
                startDate.setDate(now.getDate() - 30);
        }
        return { gte: startDate, lte: now };
    }
    getPreviousPeriodDate(period) {
        const date = new Date();
        switch (period) {
            case '7d':
                date.setDate(date.getDate() - 14);
                break;
            case '30d':
                date.setDate(date.getDate() - 60);
                break;
            case '90d':
                date.setDate(date.getDate() - 180);
                break;
            default:
                date.setDate(date.getDate() - 60);
        }
        return date;
    }
    getPeriodStartDate(date, period) {
        const startDate = new Date(date);
        switch (period) {
            case '7d':
                startDate.setDate(date.getDate() - 7);
                break;
            case '30d':
                startDate.setDate(1);
                break;
            default:
                startDate.setDate(1);
        }
        return startDate;
    }
    getPeriodEndDate(date, period) {
        const endDate = new Date(date);
        switch (period) {
            case '7d':
                break;
            case '30d':
                endDate.setMonth(date.getMonth() + 1, 0);
                break;
            default:
                endDate.setMonth(date.getMonth() + 1, 0);
        }
        return endDate;
    }
    async getAverageResolutionTime(tenantId, period) {
        const dateFilter = this.getDateFilter(period);
        const resolvedTickets = await this.prisma.ticket.findMany({
            where: {
                tenantId,
                status: 'RESOLVED',
                updatedAt: dateFilter
            },
            select: {
                createdAt: true,
                updatedAt: true
            }
        });
        if (resolvedTickets.length === 0)
            return 0;
        const totalTime = resolvedTickets.reduce((sum, ticket) => {
            const resolutionTime = ticket.updatedAt.getTime() - ticket.createdAt.getTime();
            return sum + resolutionTime;
        }, 0);
        return totalTime / resolvedTickets.length / (1000 * 60 * 60 * 24);
    }
};
exports.KpisService = KpisService;
exports.KpisService = KpisService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], KpisService);
//# sourceMappingURL=kpis.service.js.map