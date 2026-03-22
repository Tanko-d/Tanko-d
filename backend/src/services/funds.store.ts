import { FundRequest } from '../types/index.js';
import { v4 as uuidv4 } from 'uuid';

const fundRequests = new Map<string, FundRequest>();

export class FundRequestStore {
  create(data: Omit<FundRequest, 'id' | 'status' | 'createdAt' | 'updatedAt'>): FundRequest {
    const id = uuidv4();
    const now = new Date().toISOString();
    const request: FundRequest = {
      ...data,
      id,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };
    fundRequests.set(id, request);
    return request;
  }

  getById(id: string): FundRequest | undefined {
    return fundRequests.get(id);
  }

  getByDriver(driverPublicKey: string): FundRequest[] {
    return Array.from(fundRequests.values()).filter(
      (r) => r.driverPublicKey === driverPublicKey
    );
  }

  getByManager(managerPublicKey: string): FundRequest[] {
    return Array.from(fundRequests.values()).filter(
      (r) => r.managerPublicKey === managerPublicKey
    );
  }

  getPendingByManager(managerPublicKey: string): FundRequest[] {
    return this.getByManager(managerPublicKey).filter((r) => r.status === 'pending');
  }

  update(id: string, data: Partial<FundRequest>): FundRequest | undefined {
    const request = fundRequests.get(id);
    if (!request) return undefined;
    
    const updated = {
      ...request,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    fundRequests.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return fundRequests.delete(id);
  }

  getAll(): FundRequest[] {
    return Array.from(fundRequests.values());
  }

  clear(): void {
    fundRequests.clear();
  }
}

export const fundRequestStore = new FundRequestStore();
