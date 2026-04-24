import { fuelLogRepository } from "../repositories/fuelLog.repository.js";
import { fundRequestRepository } from "../repositories/fundRequest.repository.js";

type DateArg = Date | number | undefined;

function normalizeDateArgs(startOrLimit?: DateArg, endDate?: Date, limit = 50) {
  if (typeof startOrLimit === "number") {
    return {
      startDate: undefined as Date | undefined,
      endDate: undefined as Date | undefined,
      limit: startOrLimit,
    };
  }

  return {
    startDate: startOrLimit instanceof Date ? startOrLimit : undefined,
    endDate,
    limit,
  };
}

class StatsService {
  async getDashboardStats(startDate?: Date, endDate?: Date) {
    const [
      totalFuelSpend,
      totalFuelLiters,
      totalRequests,
      pendingRequests,
      totalReleased,
      consumptionByDriver,
      spendByDriver,
      litersByDriver,
    ] = await Promise.all([
      fuelLogRepository.getTotalSpend(startDate, endDate),
      fuelLogRepository.getTotalLiters(startDate, endDate),
      fundRequestRepository.count(startDate, endDate),
      fundRequestRepository.countPending(startDate, endDate),
      fundRequestRepository.getTotalReleased(startDate, endDate),
      fuelLogRepository.getConsumptionByDriver(startDate, endDate),
      fuelLogRepository.getTotalSpendByDriver(startDate, endDate),
      fuelLogRepository.getTotalLitersByDriver(startDate, endDate),
    ]);

    const summary = {
      totalFuelSpend,
      totalFuelLiters,
      totalRequests,
      pendingRequests,
      totalReleased,
    };

    return {
      ...summary,
      summary,
      dashboardStats: summary,
      stats: summary,
      consumptionByDriver,
      spendByDriver,
      litersByDriver,
    };
  }

  async getConsumptionByDriver(startDate?: Date, endDate?: Date) {
    return fuelLogRepository.getConsumptionByDriver(startDate, endDate);
  }

  async getRecentTransactions(startOrLimit?: DateArg, endDate?: Date, limit = 50) {
    const normalized = normalizeDateArgs(startOrLimit, endDate, limit);
    const transactions = await fuelLogRepository.findAll(normalized.startDate, normalized.endDate);

    return transactions.slice(0, normalized.limit);
  }

  async getReportStats(startDate?: Date, endDate?: Date) {
    const [summary, consumptionByDriver, recentTransactions, fuelSpendByDriver, fuelLitersByDriver] = await Promise.all([
      statsService.getDashboardStats(startDate, endDate),
      statsService.getConsumptionByDriver(startDate, endDate),
      fuelLogRepository.findAll(startDate, endDate),
      fuelLogRepository.getTotalSpendByDriver(startDate, endDate),
      fuelLogRepository.getTotalLitersByDriver(startDate, endDate),
    ]);

    return {
      ...summary,
      summary,
      dashboardStats: summary,
      stats: summary,
      consumptionByDriver,
      driverBreakdown: consumptionByDriver,
      recentTransactions,
      transactions: recentTransactions,
      fuelSpendByDriver,
      fuelLitersByDriver,
    };
  }
}

export const statsService = new StatsService();
export default StatsService;