import prisma from '../db/prisma.js';

export interface CreateFuelLogDTO {
  date: Date;
  liters: number;
  pricePerLiter: number;
  amount: number;
  fuelType?: string;
  station: string;
  stationAddress?: string;
  coords?: string;
  escrowId?: string;
  escrowStatus?: string;
  unitId: string;
  userId: string;
}

export interface UpdateFuelLogDTO {
  date?: Date;
  liters?: number;
  pricePerLiter?: number;
  amount?: number;
  fuelType?: string;
  station?: string;
  stationAddress?: string;
  coords?: string;
  escrowId?: string;
  escrowStatus?: string;
}

export class FuelLogRepository {
  async findAll() {
    return prisma.fuelLog.findMany({
      include: {
        unit: { select: { id: true, plates: true, make: true, model: true } },
        user: { select: { id: true, name: true } },
      },
      orderBy: { date: 'desc' },
    });
  }

  async findById(id: string) {
    return prisma.fuelLog.findUnique({
      where: { id },
      include: {
        unit: true,
        user: true,
      },
    });
  }

  async findByUnitId(unitId: string) {
    return prisma.fuelLog.findMany({
      where: { unitId },
      include: { user: { select: { name: true } } },
      orderBy: { date: 'desc' },
    });
  }

  async findByUserId(userId: string) {
    return prisma.fuelLog.findMany({
      where: { userId },
      include: { unit: { select: { plates: true, make: true, model: true } } },
      orderBy: { date: 'desc' },
    });
  }

  async findByDateRange(startDate: Date, endDate: Date) {
    return prisma.fuelLog.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        unit: { select: { plates: true, make: true, model: true } },
        user: { select: { name: true } },
      },
      orderBy: { date: 'desc' },
    });
  }

  async create(data: CreateFuelLogDTO) {
    return prisma.fuelLog.create({ data });
  }

  async update(id: string, data: UpdateFuelLogDTO) {
    return prisma.fuelLog.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.fuelLog.delete({ where: { id } });
  }

  async count() {
    return prisma.fuelLog.count();
  }

  async getTotalSpend(startDate?: Date, endDate?: Date) {
    const where = startDate && endDate ? { date: { gte: startDate, lte: endDate } } : {};
    const result = await prisma.fuelLog.aggregate({
      where,
      _sum: { amount: true },
    });
    return result._sum.amount || 0;
  }

  async getTotalLiters(startDate?: Date, endDate?: Date) {
    const where = startDate && endDate ? { date: { gte: startDate, lte: endDate } } : {};
    const result = await prisma.fuelLog.aggregate({
      where,
      _sum: { liters: true },
    });
    return result._sum.liters || 0;
  }

  async getMonthlyStats(year: number) {
    const stats = await prisma.$queryRaw`
      SELECT 
        EXTRACT(MONTH FROM date) as month,
        SUM(amount) as total_spend,
        SUM(liters) as total_liters,
        COUNT(*) as transaction_count
      FROM "FuelLog"
      WHERE EXTRACT(YEAR FROM date) = ${year}
      GROUP BY EXTRACT(MONTH FROM date)
      ORDER BY month
    `;
    return stats;
  }

  async getConsumptionByDriver() {
    const result = await prisma.fuelLog.groupBy({
      by: ['userId'],
      _sum: { amount: true, liters: true },
      _count: true,
      orderBy: { _sum: { amount: 'desc' } },
    });

    const userIds = result.map(r => r.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true },
    });

    return result.map(r => {
      const user = users.find(u => u.id === r.userId);
      return {
        userId: r.userId,
        name: user?.name || 'Unknown',
        totalSpend: r._sum.amount || 0,
        totalLiters: r._sum.liters || 0,
        transactionCount: r._count,
      };
    });
  }

  async getTotalSpendByDriver(stellarPubKey: string) {
    const result = await prisma.fuelLog.aggregate({
      where: { user: { stellarPubKey } },
      _sum: { amount: true },
    });
    return result._sum.amount || 0;
  }

  async getTotalLitersByDriver(stellarPubKey: string) {
    const result = await prisma.fuelLog.aggregate({
      where: { user: { stellarPubKey } },
      _sum: { liters: true },
    });
    return result._sum.liters || 0;
  }

  async getConsumptionByUnit() {
    const result = await prisma.fuelLog.groupBy({
      by: ['unitId'],
      _sum: { liters: true, amount: true },
      orderBy: { _sum: { liters: 'desc' } },
    });

    const unitIds = result.map(r => r.unitId);
    const units = await prisma.unit.findMany({
      where: { id: { in: unitIds } },
      select: { id: true, make: true, model: true, plates: true },
    });

    return result.map(r => {
      const unit = units.find(u => u.id === r.unitId);
      const unitName = unit ? `${unit.make} ${unit.model} (${unit.plates})` : 'Unknown';
      return {
        unitId: r.unitId,
        name: unitName,
        liters: r._sum.liters || 0,
        cost: r._sum.amount || 0,
      };
    });
  }
}

export const fuelLogRepository = new FuelLogRepository();
