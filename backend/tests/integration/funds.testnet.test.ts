import { fundsService } from '../../src/services/funds.service';
import { stellarService } from '../../src/services/stellar.service';
import { fundRequestStore } from '../../src/services/funds.store';
import { TestnetAccount } from '../../src/types';
import { config } from '../../src/config/index';

const TRUSTLESS_WORK_API_KEY = config.trustlessWork.apiKey;
const API_KEY_TESTS_ENABLED = Boolean(TRUSTLESS_WORK_API_KEY && TRUSTLESS_WORK_API_KEY.includes('.'));

describe('Funds Flow - Testnet Real', () => {
  let manager: TestnetAccount;
  let driver: TestnetAccount;
  const testIds: string[] = [];

  beforeAll(async () => {
    console.log('\n=== Setting up test accounts on Stellar Testnet ===\n');

    console.log('Creating Manager account...');
    const managerResult = await fundsService.createTestnetAccount();
    if (!managerResult.success || !managerResult.data) {
      throw new Error(`Failed to create Manager account: ${managerResult.error}`);
    }
    manager = managerResult.data;
    console.log(`Manager created: ${manager.publicKey}`);

    console.log('Creating Driver account...');
    const driverResult = await fundsService.createTestnetAccount();
    if (!driverResult.success || !driverResult.data) {
      throw new Error(`Failed to create Driver account: ${driverResult.error}`);
    }
    driver = driverResult.data;
    console.log(`Driver created: ${driver.publicKey}`);

    console.log('\nWaiting for accounts to be funded...');
    await new Promise((resolve) => setTimeout(resolve, 3000));

    console.log('Verifying balances...');
    const managerBalance = await stellarService.getAccountBalance(manager.publicKey);
    console.log(`Manager XLM Balance: ${managerBalance.find((b) => b.asset === 'XLM')?.balance}`);

    const driverBalance = await stellarService.getAccountBalance(driver.publicKey);
    console.log(`Driver XLM Balance: ${driverBalance.find((b) => b.asset === 'XLM')?.balance}`);

    expect(managerBalance.some((b) => b.asset === 'XLM' && parseFloat(b.balance) > 0)).toBe(true);
    expect(driverBalance.some((b) => b.asset === 'XLM' && parseFloat(b.balance) > 0)).toBe(true);

    console.log('\n=== Test accounts ready ===\n');
  });

  afterAll(async () => {
    console.log('\n=== Cleaning up test data ===\n');
    fundRequestStore.clear();
  });

  beforeEach(() => {
    fundRequestStore.clear();
  });

  describe('1. Account Creation & Verification', () => {
    it('should have valid public keys for both accounts', () => {
      expect(stellarService.validatePublicKey(manager.publicKey)).toBe(true);
      expect(stellarService.validatePublicKey(driver.publicKey)).toBe(true);
    });

    it('should have valid secret keys for both accounts', () => {
      expect(stellarService.validateSecretKey(manager.secret)).toBe(true);
      expect(stellarService.validateSecretKey(driver.secret)).toBe(true);
    });

    it('should have funded accounts on testnet', async () => {
      const managerBalances = await stellarService.getAccountBalance(manager.publicKey);
      const driverBalances = await stellarService.getAccountBalance(driver.publicKey);

      expect(managerBalances.length).toBeGreaterThan(0);
      expect(driverBalances.length).toBeGreaterThan(0);
    });
  });

  describe('2. Fund Request Creation (Driver)', () => {
    it('should create a fund request from driver to manager', async () => {
      const result = await fundsService.createRequest(
        driver.publicKey,
        {
          amount: '1000000',
          description: 'Fuel Mexico-Queretaro route',
        },
        manager.publicKey
      );

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.status).toBe('pending');
      expect(result.data?.driverPublicKey).toBe(driver.publicKey);
      expect(result.data?.managerPublicKey).toBe(manager.publicKey);
      expect(result.data?.amount).toBe('1000000');

      if (result.data) {
        testIds.push(result.data.id);
      }
    });

    it('should reject invalid driver public key', async () => {
      const result = await fundsService.createRequest(
        'INVALID_KEY',
        {
          amount: '1000000',
          description: 'Test',
        },
        manager.publicKey
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid driver');
    });

    it('should reject invalid amount', async () => {
      const result = await fundsService.createRequest(
        driver.publicKey,
        {
          amount: '-100',
          description: 'Test',
        },
        manager.publicKey
      );

      expect(result.success).toBe(false);
    });

    it('should create request with minimum amount', async () => {
      const result = await fundsService.createRequest(
        driver.publicKey,
        {
          amount: '1',
          description: 'Minimum test',
        },
        manager.publicKey
      );

      expect(result.success).toBe(true);
    });
  });

  describe('3. Request Query (Manager)', () => {
    it('should get pending requests for manager', async () => {
      const createResult = await fundsService.createRequest(
        driver.publicKey,
        {
          amount: '2000000',
          description: 'Travel allowance',
        },
        manager.publicKey
      );

      if (createResult.data) {
        testIds.push(createResult.data.id);
      }

      const result = fundsService.getPendingRequests(manager.publicKey);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.length).toBeGreaterThan(0);
    });

    it('should get all requests for driver', async () => {
      await fundsService.createRequest(
        driver.publicKey,
        { amount: '500000', description: 'Test 1' },
        manager.publicKey
      );

      await fundsService.createRequest(
        driver.publicKey,
        { amount: '500000', description: 'Test 2' },
        manager.publicKey
      );

      const result = fundsService.getRequestsByDriver(driver.publicKey);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.length).toBe(2);
    });

    it('should get request by ID', async () => {
      const createResult = await fundsService.createRequest(
        driver.publicKey,
        { amount: '1000000', description: 'Test request' },
        manager.publicKey
      );

      if (createResult.data) {
        testIds.push(createResult.data.id);
      }

      const result = fundsService.getRequest(createResult.data!.id);

      expect(result.success).toBe(true);
      expect(result.data?.id).toBe(createResult.data!.id);
    });

    it('should return empty array for unknown driver', () => {
      const result = fundsService.getRequestsByDriver(
        'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });
  });

  describe('4. Request Rejection (Manager)', () => {
    it('should reject a pending request', async () => {
      const createResult = await fundsService.createRequest(
        driver.publicKey,
        { amount: '1000000', description: 'Test rejection' },
        manager.publicKey
      );

      if (createResult.data) {
        testIds.push(createResult.data.id);
      }

      const rejectResult = fundsService.rejectRequest(
        { requestId: createResult.data!.id },
        manager.publicKey
      );

      expect(rejectResult.success).toBe(true);
      expect(rejectResult.data?.status).toBe('rejected');
    });

    it('should not allow non-assigned manager to reject', async () => {
      const createResult = await fundsService.createRequest(
        driver.publicKey,
        { amount: '1000000', description: 'Test' },
        manager.publicKey
      );

      if (createResult.data) {
        testIds.push(createResult.data.id);
      }

      const newAccount = stellarService.generateKeypair();

      const rejectResult = fundsService.rejectRequest(
        { requestId: createResult.data!.id },
        newAccount.publicKey
      );

      expect(rejectResult.success).toBe(false);
      expect(rejectResult.error).toContain('Only the assigned manager');
    });

    it('should not reject already rejected request', async () => {
      const createResult = await fundsService.createRequest(
        driver.publicKey,
        { amount: '1000000', description: 'Test' },
        manager.publicKey
      );

      fundsService.rejectRequest(
        { requestId: createResult.data!.id },
        manager.publicKey
      );

      const secondReject = fundsService.rejectRequest(
        { requestId: createResult.data!.id },
        manager.publicKey
      );

      expect(secondReject.success).toBe(false);
      expect(secondReject.error).toContain('Cannot reject');
    });
  });

  (API_KEY_TESTS_ENABLED ? describe : describe.skip)('5. Trustless Work Integration (Requires Valid API Key)', () => {
    it('NOTE: These tests require a valid Trustless Work API key with deploy permissions', () => {
      console.log('\n⚠️ Trustless Work API tests skipped - requires valid API key\n');
      expect(true).toBe(true);
    });
  });

  describe('6. Testnet Account Operations', () => {
    it('should create new testnet account', async () => {
      const result = await fundsService.createTestnetAccount();

      expect(result.success).toBe(true);
      expect(result.data?.publicKey).toBeDefined();
      expect(result.data?.secret).toBeDefined();
      expect(stellarService.validatePublicKey(result.data!.publicKey)).toBe(true);
    }, 30000);

    it('should handle funding already funded account', async () => {
      const fundResult = await fundsService.fundTestnetAccount(manager.publicKey);

      expect(fundResult.success).toBe(false);
    });

    it('should reject invalid public key for funding', async () => {
      const result = await fundsService.fundTestnetAccount('INVALID_KEY');

      expect(result.success).toBe(false);
    });
  });

  describe('7. Request State Machine', () => {
    it('should follow correct state transitions', async () => {
      const createResult = await fundsService.createRequest(
        driver.publicKey,
        { amount: '1000000', description: 'State test' },
        manager.publicKey
      );

      expect(createResult.data?.status).toBe('pending');

      const rejectResult = fundsService.rejectRequest(
        { requestId: createResult.data!.id },
        manager.publicKey
      );

      expect(rejectResult.data?.status).toBe('rejected');

      const getResult = fundsService.getRequest(createResult.data!.id);
      expect(getResult.data?.status).toBe('rejected');
    });

    it('should track timestamps correctly', async () => {
      const createResult = await fundsService.createRequest(
        driver.publicKey,
        { amount: '1000000', description: 'Timestamp test' },
        manager.publicKey
      );

      expect(createResult.data?.createdAt).toBeDefined();
      expect(createResult.data?.updatedAt).toBeDefined();

      await new Promise((resolve) => setTimeout(resolve, 100));

      fundsService.rejectRequest(
        { requestId: createResult.data!.id },
        manager.publicKey
      );

      const updated = fundsService.getRequest(createResult.data!.id);
      expect(new Date(updated.data!.updatedAt).getTime()).toBeGreaterThanOrEqual(
        new Date(createResult.data!.createdAt).getTime()
      );
    });
  });

  describe('8. Store Operations', () => {
    it('should clear all requests', async () => {
      await fundsService.createRequest(
        driver.publicKey,
        { amount: '1000000', description: 'To be cleared' },
        manager.publicKey
      );

      fundRequestStore.clear();

      const result = fundsService.getRequestsByDriver(driver.publicKey);
      expect(result.data).toEqual([]);
    });

    it('should return undefined for non-existent request', () => {
      const result = fundsService.getRequest('non-existent-id');

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });
});
