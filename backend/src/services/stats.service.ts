import { fuelLogRepository } from '../repositories/fuelLog.repository.js';
import { fundRequestRepository } from '../repositories/fundRequest.repository.js';
import { userRepository } from '../repositories/user.repository.js';
import { unitRepository } from '../repositories/unit.repository.js';
import { escrowMilestoneRepository } from '../repositories/escrowMilestone.repository.js';

export interface DashboardStats {
  totalSpent: number;
  totalLiters: number;
  transactionCount: number;
  activeUsers: number;
  registeredUnits: number;
  activeUnits: number;
  escrowBalance: number;
  totalReleased: number;
  pendingRequests: number;
}

export interface MonthlyStats {
  month: string;
  spend: number;
  liters: number;
  transactionCount: number;
}

export interface ConsumptionByDriver {
  userId: string;
  name: string;
  totalSpend: number;
  totalLiters: number;
  percentage: number;
}

export interface TopUnit {
  id: string;
  make: string;
  model: string;
  plates: string;
  monthlySpend: number;
  totalLiters: number;
  driverName: string;
}

export interface DriverStats {
  escrowLimit: number;
  escrowUsed: number;
  escrowAvailable: number;
  stellarBalance: number;
  pendingApprovals: number;
  totalSpend: number;
  totalLiters: number;
  recentRequests: Array<{
    id: string;
    liters: number;
    amount: number;
    status: string;
    createdAt: Date;
  }>;
}

export interface StatsSummary {
  totalLiters: number;
  totalCost: number;
  approvedRequests: number;
  consumptionByUnit: Array<{
    name: string;
    value: number;
  }>;
}

export class StatsService {
  async getDashboardStats(): Promise<DashboardStats> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalSpent,
      totalLiters,
      transactionCount,
      activeUsers,
      registeredUnits,
      activeUnits,
      escrowBalance,
      totalReleased,
      pendingRequests,
    ] = await Promise.all([
      fuelLogRepository.getTotalSpend(),
      fuelLogRepository.getTotalLiters(),
      fuelLogRepository.count(),
      userRepository.countByRole('CONDUCTOR'),
      unitRepository.count(),
      unitRepository.countActive(),
      escrowMilestoneRepository.getTotalEscrowAmount(),
      escrowMilestoneRepository.getTotalReleasedAmount(),
      fundRequestRepository.countByStatus('PENDING'),
    ]);

    return {
      totalSpent,
      totalLiters,
      transactionCount,
      activeUsers,
      registeredUnits,
      activeUnits,
      escrowBalance,
      totalReleased,
      pendingRequests,
    };
  }

  async getMonthlyStats(year?: number): Promise<MonthlyStats[]> {
    const targetYear = year || new Date().getFullYear();
    const rawStats = await fuelLogRepository.getMonthlyStats(targetYear) as any[];

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return months.map((month, index) => {
      const monthData = rawStats.find((m) => Number(m.month) === index + 1);
      return {
        month,
        spend: monthData ? Number(monthData.total_spend) : 0,
        liters: monthData ? Number(monthData.total_liters) : 0,
        transactionCount: monthData ? Number(monthData.transaction_count) : 0,
      };
    });
  }

  async getConsumptionByDriver(limit: number = 10): Promise<ConsumptionByDriver[]> {
    const drivers = await fuelLogRepository.getConsumptionByDriver();
    const totalSpend = drivers.reduce((sum, d) => sum + d.totalSpend, 0);

    return drivers.slice(0, limit).map(driver => ({
      ...driver,
      percentage: totalSpend > 0 ? (driver.totalSpend / totalSpend) * 100 : 0,
    }));
  }

  async getTopUnits(limit: number = 5): Promise<TopUnit[]> {
    const units = await unitRepository.getTopBySpend(limit);

    return units.map(unit => ({
      id: unit.id,
      make: unit.make,
      model: unit.model,
      plates: unit.plates,
      monthlySpend: unit.monthlySpend,
      totalLiters: 0,
      driverName: unit.user?.name || 'Unknown',
    }));
  }

  async getRecentTransactions(limit: number = 10) {
    const transactions = await fuelLogRepository.findAll();
    return transactions.slice(0, limit).map(tx => ({
      id: tx.id,
      date: tx.date,
      driver: tx.user?.name || 'Unknown',
      unit: `${tx.unit?.make} ${tx.unit?.model}`,
      plates: tx.unit?.plates || 'Unknown',
      station: tx.station,
      amount: tx.amount,
      liters: tx.liters,
    }));
  }

  async getReportStats(managerPubKey?: string) {
    const [
      escrowBalance,
      totalReleased,
      transactions,
      activeDrivers,
      escrowConfig,
    ] = await Promise.all([
      escrowMilestoneRepository.getTotalEscrowAmount(),
      escrowMilestoneRepository.getTotalReleasedAmount(),
      fundRequestRepository.count(),
      userRepository.countByRole('CONDUCTOR'),
      escrowMilestoneRepository.count(),
    ]);

    return {
      escrowBalance,
      totalReleased,
      transactions,
      activeDrivers,
      escrowCount: escrowConfig,
    };
  }

  async getDriverStats(driverPubKey: string): Promise<DriverStats> {
    const [
      fundRequests,
      totalSpend,
      totalLiters,
      escrowConfig,
    ] = await Promise.all([
      fundRequestRepository.findByDriver(driverPubKey),
      fuelLogRepository.getTotalSpendByDriver(driverPubKey),
      fuelLogRepository.getTotalLitersByDriver(driverPubKey),
      escrowMilestoneRepository.getDefaultEscrowConfig(),
    ]);

    const escrowLimit = escrowConfig?.escrowLimit || 50000000000;
    const escrowUsed = fundRequests
      .filter(r => r.status === 'APPROVED' || r.status === 'PENDING')
      .reduce((sum, r) => sum + r.amount, 0);
    
    const pendingApprovals = fundRequests
      .filter(r => r.status === 'PENDING')
      .reduce((sum, r) => sum + r.amount, 0);

    return {
      escrowLimit: escrowLimit / 10000000,
      escrowUsed: escrowUsed / 10000000,
      escrowAvailable: (escrowLimit - escrowUsed) / 10000000,
      stellarBalance: 0,
      pendingApprovals: pendingApprovals / 10000000,
      totalSpend: totalSpend || 0,
      totalLiters: totalLiters || 0,
      recentRequests: fundRequests.slice(0, 5).map(r => ({
        id: r.id,
        liters: r.liters,
        amount: r.amount / 10000000,
        status: r.status,
        createdAt: r.createdAt,
      })),
    };
  }

  async getStatsSummary(): Promise<StatsSummary> {
    const [
      totalLitersResult,
      totalCostResult,
      approvedRequestsCount,
      consumptionByUnit,
    ] = await Promise.all([
      fuelLogRepository.getTotalLiters(),
      fuelLogRepository.getTotalSpend(),
      fundRequestRepository.countByStatus('APPROVED'),
      fuelLogRepository.getConsumptionByUnit(),
    ]);

    return {
      totalLiters: totalLitersResult || 0,
      totalCost: totalCostResult || 0,
      approvedRequests: approvedRequestsCount || 0,
      consumptionByUnit: consumptionByUnit.map(unit => ({
        name: unit.name,
        value: unit.liters,
      })),
    };
  }
}

export const statsService = new StatsService();
