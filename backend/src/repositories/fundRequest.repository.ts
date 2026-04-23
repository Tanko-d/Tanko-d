import prisma from '../db/prisma.js';

export type FundStatus =
  | 'PENDING'
  | 'ESCROW_INITIALIZED'
  | 'APPROVED'
  | 'REJECTED'
  | 'RELEASED'
  | 'FAILED_BLOCKCHAIN';

export interface CreateFundRequestDTO {
  liters: number;
  amount: number;
  description?: string;
  driverPubKey: string;
  managerPubKey: string;
}

export interface UpdateFundRequestDTO {
  status?: FundStatus;
  contractId?: string;
  escrowXdr?: string;
  escrowTxHash?: string;
}

export class FundRequestRepository {
  async findAll() {
    return prisma.fundRequest.findMany({
      include: {
        driver: { select: { id: true, name: true, email: true } },
        manager: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return prisma.fundRequest.findUnique({
      where: { id },
      include: {
        driver: { select: { id: true, name: true, email: true, stellarPubKey: true } },
        manager: { select: { id: true, name: true, email: true, stellarPubKey: true } },
      },
    });
  }

  async findByDriverPubKey(driverPubKey: string) {
    return prisma.fundRequest.findMany({
      where: { driverPubKey },
      include: {
        driver: { select: { name: true } },
        manager: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByManagerPubKey(managerPubKey: string) {
    return prisma.fundRequest.findMany({
      where: { managerPubKey },
      include: {
        driver: { select: { name: true } },
        manager: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findPendingByManager(managerPubKey: string) {
    return prisma.fundRequest.findMany({
      where: { managerPubKey, status: 'PENDING' },
      include: {
        driver: { select: { name: true, stellarPubKey: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findByStatus(status: FundStatus) {
    return prisma.fundRequest.findMany({
      where: { status },
      include: {
        driver: { select: { name: true } },
        manager: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: CreateFundRequestDTO) {
    return prisma.fundRequest.create({ data });
  }

  async update(id: string, data: UpdateFundRequestDTO) {
    return prisma.fundRequest.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.fundRequest.delete({ where: { id } });
  }

  async count() {
    return prisma.fundRequest.count();
  }

  async countByStatus(status: FundStatus) {
    return prisma.fundRequest.count({ where: { status } });
  }

  async countPending(managerPubKey: string) {
    return prisma.fundRequest.count({
      where: { managerPubKey, status: 'PENDING' },
    });
  }

  async getTotalReleased() {
    const result = await prisma.fundRequest.aggregate({
      where: { status: 'RELEASED' },
      _sum: { amount: true },
    });
    return result._sum.amount || 0;
  }

  async getStatsByManager(managerPubKey: string) {
    const [pending, approved, released, rejected] = await Promise.all([
      prisma.fundRequest.count({ where: { managerPubKey, status: 'PENDING' } }),
      prisma.fundRequest.count({ where: { managerPubKey, status: 'APPROVED' } }),
      prisma.fundRequest.count({ where: { managerPubKey, status: 'RELEASED' } }),
      prisma.fundRequest.count({ where: { managerPubKey, status: 'REJECTED' } }),
    ]);

    const totalResult = await prisma.fundRequest.aggregate({
      where: { managerPubKey, status: 'RELEASED' },
      _sum: { amount: true },
    });

    return {
      pending,
      approved,
      released,
      rejected,
      totalReleased: totalResult._sum.amount || 0,
    };
  }
}

export const fundRequestRepository = new FundRequestRepository();
