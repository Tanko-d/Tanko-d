# Tanko - Technical Issues for Testnet Deployment

> **Document Version:** 1.0
> **Last Updated:** 2026-04-10
> **Project:** Tanko - Decentralized Fuel Wallet for Transport Fleets
> **Target Environment:** Stellar Testnet

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Critical Issues (P0)](#critical-issues-p0)
3. [High Priority Issues (P1)](#high-priority-issues-p1)
4. [Medium Priority Issues (P2)](#medium-priority-issues-p2)
5. [Backend Analysis](#backend-analysis)
6. [Frontend Analysis](#frontend-analysis)
7. [Database & Schema Issues](#database--schema-issues)
8. [External Integrations](#external-integrations)
9. [Acceptance Criteria](#acceptance-criteria)
10. [Technical Notes](#technical-notes)
11. [Milestones](#milestones)

---

## Executive Summary

This document outlines the technical issues and requirements for deploying Tanko to Stellar Testnet. The application has a solid foundation with a complete 3-tier architecture (Controllers → Services → Repositories), but several critical features are incomplete or use mock data.

### Current Status

| Component | Status | Notes |
|-----------|--------|-------|
| Backend Architecture | ✅ Complete | Controllers, Services, Repositories structure |
| Frontend UI | ✅ Complete | Next.js with shadcn/ui |
| Auth with Freighter | ✅ Complete | Wallet-based authentication |
| Role Selection | ✅ Complete | CONDUCTOR / JEFE roles |
| Dashboard (Jefe) | ✅ Complete | Real data from API |
| Dashboard (Conductor) | ✅ Complete | Real data from API |
| Fuel Logs | ✅ Complete | API integration |
| Users Management | ⚠️ Partial | Needs registration flow |
| Units Management | ✅ Complete | API integration |
| Trustless Work API | ⚠️ Partial | Mock responses |
| Soroban Contract | ⚠️ Partial | Contract exists, not deployed |
| PostgreSQL DB | ❌ Pending | Not configured |
| Driver Registration | ❌ Missing | Manager → Driver flow incomplete |

### Risk Assessment

| Risk | Severity | Probability | Impact |
|------|----------|-------------|--------|
| Database not configured | Critical | High | App non-functional |
| Trustless Work not connected | High | High | No escrow operations |
| Driver registration incomplete | Critical | High | Cannot onboard drivers |
| Mock data in production | High | Low | Poor user experience |
| Soroban contract not deployed | Medium | High | Missing on-chain validation |

---

## Critical Issues (P0)

Issues that block deployment to testnet.

---

### Issue #1: Database Not Configured

**Severity:** Critical
**Labels:** `backend`, `database`, `blocking`

#### Description

The PostgreSQL database is not configured. The Prisma schema exists but has never been migrated, and no seed data has been created.

#### Current State

```bash
# No DATABASE_URL configured
# No migrations run
# No seed data
```

#### Required Actions

1. **Configure DATABASE_URL in .env:**
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/tanko_db
```

2. **Run migrations:**
```bash
cd backend
npx prisma migrate dev --name initial_schema
npx prisma generate
```

3. **Create seed data:**
```bash
npx prisma db seed
```

4. **Verify connection:**
```bash
npx prisma db push  # Sync schema without migration
npx prisma studio  # Visual database editor
```

#### Acceptance Criteria

- [ ] `DATABASE_URL` is set in `.env`
- [ ] `npx prisma migrate dev` runs without errors
- [ ] `npx prisma db push` creates all tables
- [ ] `npx prisma db seed` populates initial data
- [ ] Backend can connect to database on startup
- [ ] Health check returns database status

#### Technical Notes

The Prisma client is already configured in `backend/src/db/prisma.ts`:

```typescript
// backend/src/db/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: ['query', 'error', 'warn'],
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}
```

---

### Issue #2: Driver Registration Flow Incomplete

**Severity:** Critical
**Labels:** `backend`, `frontend`, `user-management`, `blocking`

#### Description

There is no mechanism for a JEFE (Fleet Manager) to register and approve drivers. The current user management system allows listing users but not creating them with the proper manager-driver hierarchy.

#### Current Prisma Schema (User Model)

```prisma
model User {
  id            String   @id @default(cuid())
  stellarPubKey String   @unique
  name          String
  email         String?  @unique
  phone         String?
  role          String   @default("CONDUCTOR")
  status        String   @default("ACTIVE")
  // Missing: managerId for driver-manager relationship
}
```

#### Required Schema Changes

```prisma
model User {
  id            String    @id @default(cuid())
  stellarPubKey String    @unique
  name          String
  email         String?   @unique
  phone         String?
  role          Role      @default(CONDUCTOR)
  status        UserStatus @default(PENDING)
  
  // Manager-Driver hierarchy
  managerId     String?
  manager       User?     @relation("ManagerDrivers", fields: [managerId], references: [id])
  drivers       User[]    @relation("ManagerDrivers")
  
  // Relationships
  units         Unit[]
  fundRequests  FundRequest[] @relation("DriverRequests")
  fuelLogs      FuelLog[]
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

enum Role {
  CONDUCTOR
  JEFE
}

enum UserStatus {
  PENDING   // Awaiting manager approval
  ACTIVE    // Can use the app
  INACTIVE  // Temporarily disabled
}
```

#### Required Backend Changes

**1. Create UserService (`backend/src/services/user.service.ts`):**

```typescript
export class UserService {
  
  async registerDriver(managerId: string, data: {
    name: string;
    email?: string;
    phone?: string;
    stellarPubKey: string;
    unitId?: string;
  }) {
    // 1. Validate manager exists and is a JEFE
    const manager = await userRepository.findById(managerId);
    if (!manager || manager.role !== 'JEFE') {
      throw new Error('Only managers can register drivers');
    }
    
    // 2. Check if Stellar address is already registered
    const existingUser = await userRepository.findByStellarPubKey(data.stellarPubKey);
    if (existingUser) {
      throw new Error('This wallet address is already registered');
    }
    
    // 3. Create driver with PENDING status
    const driver = await userRepository.create({
      ...data,
      role: 'CONDUCTOR',
      status: 'PENDING',
      managerId: managerId,
    });
    
    // 4. Assign unit if provided
    if (data.unitId) {
      await unitRepository.assignToUser(data.unitId, driver.id);
    }
    
    return driver;
  }
  
  async approveDriver(managerId: string, driverId: string) {
    const manager = await userRepository.findById(managerId);
    const driver = await userRepository.findById(driverId);
    
    if (!driver || driver.managerId !== managerId) {
      throw new Error('Driver not found or not assigned to you');
    }
    
    return userRepository.update(driverId, { status: 'ACTIVE' });
  }
  
  async rejectDriver(managerId: string, driverId: string) {
    const driver = await userRepository.findById(driverId);
    
    if (!driver || driver.managerId !== managerId) {
      throw new Error('Driver not found or not assigned to you');
    }
    
    return userRepository.update(driverId, { status: 'INACTIVE' });
  }
}
```

**2. Add new routes (`backend/src/routes/user.routes.ts`):**

```typescript
router.post('/users/register-driver', userController.registerDriver);  // Manager only
router.post('/users/:id/approve', userController.approveDriver);       // Manager only
router.post('/users/:id/reject', userController.rejectDriver);         // Manager only
router.get('/users/drivers', userController.getDriversForManager);      // Manager only
router.get('/users/pending', userController.getPendingDrivers);        // Manager only
```

**3. Add input validation (Zod schema):**

```typescript
const registerDriverSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  stellarPubKey: z.string().length(56), // Stellar public key validation
  unitId: z.string().optional(),
});

const approveRejectSchema = z.object({
  driverId: z.string(),
});
```

#### Required Frontend Changes

**1. Add "Register Driver" dialog in Users page:**

```typescript
// frontend/app/dashboard/usuarios/page.tsx
// Add to the existing Dialog component

const handleRegisterDriver = async (formData: DriverFormData) => {
  const res = await fetch(`${BACKEND}/api/v1/users/register-driver`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...formData,
      managerId: currentUser.id, // From auth context
    }),
  });
  
  if (res.ok) {
    toast.success('Driver registered successfully. Awaiting approval.');
    refetchUsers();
  } else {
    const error = await res.json();
    toast.error(error.message || 'Failed to register driver');
  }
};
```

**2. Add "Pending Approvals" section:**

```tsx
// In users page, visible only to JEFE
{pendingDrivers.length > 0 && (
  <Card className="border-amber-200 bg-amber-50">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-amber-700">
        <AlertCircle className="h-5 w-5" />
        Pending Approvals ({pendingDrivers.length})
      </CardTitle>
    </CardHeader>
    <CardContent>
      {pendingDrivers.map(driver => (
        <div key={driver.id} className="flex items-center justify-between py-3 border-b last:border-0">
          <div>
            <p className="font-medium">{driver.name}</p>
            <p className="text-sm text-muted-foreground font-mono">
              {driver.stellarPubKey.slice(0, 12)}...{driver.stellarPubKey.slice(-8)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              onClick={() => handleApprove(driver.id)}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Approve
            </Button>
            <Button 
              size="sm" 
              variant="destructive"
              onClick={() => handleReject(driver.id)}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Reject
            </Button>
          </div>
        </div>
      ))}
    </CardContent>
  </Card>
)}
```

**3. Update user status badges:**

```tsx
<span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
  user.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
  user.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
  'bg-gray-100 text-gray-700'
}`}>
  {user.status === 'ACTIVE' ? 'Active' :
   user.status === 'PENDING' ? 'Pending Approval' : 'Inactive'}
</span>
```

#### Acceptance Criteria

- [ ] Manager can register a new driver with name, email, phone, and Stellar wallet address
- [ ] New drivers start with `status=PENDING`
- [ ] Manager sees list of pending drivers awaiting approval
- [ ] Manager can approve a pending driver → `status=ACTIVE`
- [ ] Manager can reject a pending driver → `status=INACTIVE`
- [ ] Approved drivers can log in and see their wallet
- [ ] Rejected drivers cannot access the application
- [ ] Drivers are linked to their manager (managerId)
- [ ] Drivers can be assigned to units during registration
- [ ] Only managers can register drivers (role validation)

#### Technical Notes

1. **Security:** The `stellarPubKey` should be validated to ensure it's a valid Stellar public key format (starts with G, 56 characters).

2. **Email uniqueness:** The `unique` constraint on email should be relaxed or removed since drivers might share email domains or not have emails.

3. **Wallet connection:** When a driver registers, they should connect their Freighter wallet to verify ownership of the Stellar address before submitting.

4. **Notification:** Consider adding email notifications when a driver is approved or rejected.

---

### Issue #3: Trustless Work API Not Connected

**Severity:** Critical
**Labels:** `backend`, `trustless-work`, `escrow`, `blocking`

#### Description

The Trustless Work API integration exists but is incomplete. The approve/reject endpoints in the frontend return mock responses instead of calling the backend which should call Trustless Work.

#### Current State

**Frontend mock endpoints:**
- `/frontend/app/api/trustless/solicitud/approve/route.ts` - Returns mock success
- `/frontend/app/api/trustless/solicitud/reject/route.ts` - Returns mock success

#### Required Changes

**1. Backend - Complete funds approval flow (`backend/src/services/funds.service.ts`):**

```typescript
async approveRequest(requestId: string, managerAddress: string) {
  // 1. Get the fund request
  const request = await fundRequestRepository.findById(requestId);
  if (!request) {
    throw new Error('Fund request not found');
  }
  
  // 2. Verify manager owns this request
  if (request.managerPubKey !== managerAddress) {
    throw new Error('Not authorized to approve this request');
  }
  
  // 3. Verify request is pending
  if (request.status !== 'PENDING') {
    throw new Error('Request is not pending');
  }
  
  // 4. Create escrow via Trustless Work
  const escrowResult = await trustlessWorkService.createMultiReleaseEscrow({
    engagementId: `TANKO-${request.id}-${Date.now()}`,
    milestones: [{
      title: `Fuel load: ${request.liters}L`,
      description: request.description || `Fuel request for ${request.liters} liters`,
      amount: request.amount.toString(),
      recipient: request.driverPubKey,
    }],
    payer: managerAddress,
    usdcAddress: config.trustlessWork.usdcAddress,
    decimals: config.trustlessWork.decimals,
  });
  
  // 5. Update request with escrow info
  await fundRequestRepository.update(requestId, {
    status: 'APPROVED',
    contractId: escrowResult.contractId,
    escrowXdr: escrowResult.unsignedXdr,
  });
  
  // 6. Create escrow milestone record
  await escrowMilestoneRepository.create({
    escrowId: escrowResult.escrowId,
    contractId: escrowResult.contractId,
    engagementId: escrowResult.engagementId,
    title: `Fuel load: ${request.liters}L`,
    description: request.description,
    amount: request.amount,
    status: 'CREATED',
  });
  
  return {
    requestId,
    status: 'APPROVED',
    escrowCreated: true,
    contractId: escrowResult.contractId,
  };
}
```

**2. Backend - Complete funds rejection flow:**

```typescript
async rejectRequest(requestId: string, managerAddress: string) {
  const request = await fundRequestRepository.findById(requestId);
  
  if (!request || request.managerPubKey !== managerAddress) {
    throw new Error('Not authorized');
  }
  
  if (request.status !== 'PENDING') {
    throw new Error('Request is not pending');
  }
  
  await fundRequestRepository.update(requestId, {
    status: 'REJECTED',
  });
  
  return {
    requestId,
    status: 'REJECTED',
  };
}
```

**3. Backend - Error handling improvements (`backend/src/services/trustlessWork.service.ts`):**

```typescript
async createMultiReleaseEscrow(params: CreateEscrowParams) {
  try {
    const response = await axios.post(
      `${this.baseUrl}/escrow/multi-release/create`,
      params,
      {
        headers: this.headers,
        timeout: 30000 // 30 second timeout
      }
    );
    
    if (!response.data?.success) {
      throw new Error(response.data?.error || 'Trustless Work API error');
    }
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const message = error.response.data?.message || error.response.data?.error || 'API error';
        throw new Error(`Trustless Work API Error (${error.response.status}): ${message}`);
      } else if (error.request) {
        throw new Error('Trustless Work API unreachable - check network connection');
      }
    }
    throw error;
  }
}
```

**4. Update frontend API routes to proxy to backend:**

```typescript
// frontend/app/api/trustless/solicitud/approve/route.ts
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { requestId } = body;
  
  const res = await fetch(`${BACKEND_URL}/api/v1/funds/approve?address=${request.address}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requestId }),
  });
  
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
```

#### Acceptance Criteria

- [ ] Clicking "Approve" in dashboard creates a real escrow via Trustless Work
- [ ] Clicking "Reject" updates request status to REJECTED
- [ ] Trustless Work API errors are properly handled and displayed to user
- [ ] Transaction hash / contract ID is stored in database
- [ ] Request status updates to APPROVED after escrow creation
- [ ] Backend logs all Trustless Work API calls with correlation IDs
- [ ] Retry logic exists for transient API failures

#### Technical Notes

1. **Idempotency:** The `engagementId` should be unique per request to prevent duplicate escrows.

2. **Transaction finality:** Trustless Work operations are async - implement webhook handlers for status updates.

3. **Rate limiting:** Add rate limiting to prevent abuse of fund operations.

4. **Logging:** Log all Trustless Work API requests with:
   - Correlation ID
   - Timestamp
   - Request/response (sanitized)
   - Duration

---

## High Priority Issues (P1)

Important issues that should be fixed before production but don't block testnet deployment.

---

### Issue #4: Mock Data in Reports Page

**Severity:** High
**Labels:** `frontend`, `mock-data`

#### Description

The `/dashboard/reportes` page contains entirely hardcoded/mock data.

#### Current State

All charts, stats, and tables show static sample data from March 2024.

#### Required Changes

Replace all hardcoded data with API calls:

```typescript
// frontend/app/dashboard/reportes/page.tsx
useEffect(() => {
  async function fetchReportData() {
    const [monthly, byDriver, topUnits] = await Promise.all([
      fetch(`${BACKEND}/api/v1/stats/monthly`),
      fetch(`${BACKEND}/api/v1/stats/consumption-by-driver`),
      fetch(`${BACKEND}/api/v1/stats/top-units`),
    ]);
    
    const [monthlyJson, byDriverJson, topUnitsJson] = await Promise.all([
      monthly.json(),
      byDriver.json(),
      topUnits.json(),
    ]);
    
    setReportData({
      monthly: monthlyJson.data,
      byDriver: byDriverJson.data,
      topUnits: topUnitsJson.data,
    });
  }
  
  fetchReportData();
}, []);
```

#### Acceptance Criteria

- [ ] Monthly consumption chart shows real data from API
- [ ] Driver breakdown table shows real driver data
- [ ] Top units section shows real unit consumption
- [ ] Export functionality works with real data
- [ ] Empty states display correctly when no data exists

---

### Issue #5: Mock Data in Admin Page

**Severity:** High
**Labels:** `frontend`, `mock-data`

#### Description

The `/dashboard/admin` page contains entirely hardcoded/mock data.

#### Required Changes

Rewrite to fetch from:
- `/api/v1/stats/reports` - Dashboard statistics
- `/api/v1/funds/manager/:address/pending` - Pending requests
- `/api/v1/escrow/stats` - Escrow statistics

#### Acceptance Criteria

- [ ] Escrow balance shows real data from database
- [ ] Pending/Approved/Released counts are accurate
- [ ] Pending requests list is real and actionable
- [ ] Fee calculations are based on actual escrow config

---

### Issue #6: Missing Input Validation

**Severity:** High
**Labels:** `backend`, `validation`, `security`

#### Description

Most backend controllers lack input validation. Only the escrow controller has Zod validation.

#### Controllers Missing Validation

- `funds.controller.ts`
- `user.controller.ts`
- `unit.controller.ts`
- `fuelLog.controller.ts`

#### Required Implementation

```typescript
// Add to each controller using Zod
import { z } from 'zod';

const createFundRequestSchema = z.object({
  driverPubKey: z.string().length(56), // Stellar public key length
  managerPubKey: z.string().length(56),
  liters: z.number().positive().max(10000),
  amount: z.number().positive(),
  description: z.string().max(500).optional(),
});

const createUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  stellarPubKey: z.string().length(56),
});

async createRequest(req: Request, res: Response) {
  const validation = createFundRequestSchema.safeParse(req.body);
  
  if (!validation.success) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: validation.error.flatten().fieldErrors,
    });
    return;
  }
  
  const { driverPubKey, managerPubKey, liters, amount, description } = validation.data;
  // ... proceed with validated data
}
```

#### Acceptance Criteria

- [ ] All POST/PUT/PATCH endpoints validate input
- [ ] Invalid input returns 400 with field-specific errors
- [ ] Stellar addresses are validated for correct format (56 chars, starts with G)
- [ ] Numeric values have min/max bounds
- [ ] Required fields are enforced

---

### Issue #7: Rate Limiting Not Implemented

**Severity:** High
**Labels:** `backend`, `security`

#### Description

No rate limiting exists on any API endpoint, making the application vulnerable to abuse.

#### Required Implementation

**File:** `backend/src/index.ts`

```typescript
import rateLimit from 'express-rate-limit';

// General API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: { success: false, error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limit for fund operations
const fundOperationsLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 fund operations per minute
  message: { success: false, error: 'Too many fund operations, please slow down' },
});

// Auth endpoints - prevent brute force
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 failed attempts per hour
  message: { success: false, error: 'Too many failed attempts, try again later' },
});

app.use('/api/v1/', apiLimiter);
app.use('/api/v1/funds/', fundOperationsLimiter);
app.use('/api/v1/wallet/', authLimiter);
```

#### Acceptance Criteria

- [ ] Rate limiting applied to all API routes
- [ ] Fund operations have stricter limits
- [ ] Rate limit headers included in responses
- [ ] Appropriate error messages returned when limits exceeded

---

### Issue #8: Stellar Balance Not Fetched

**Severity:** High
**Labels:** `backend`, `stellar`

#### Description

The driver stats endpoint returns `stellarBalance: 0` (hardcoded mock value).

#### Current Code (`backend/src/services/stats.service.ts` line ~206)

```typescript
return {
  // ...
  stellarBalance: 0, // MOCK - should fetch from stellar
  // ...
};
```

#### Required Implementation

```typescript
async getDriverStats(driverPubKey: string): Promise<DriverStats> {
  let stellarBalance = 0;
  
  try {
    const balances = await stellarService.getBalances(driverPubKey);
    const usdcBalance = balances.find(b => b.asset_code === 'USDC');
    if (usdcBalance) {
      stellarBalance = parseFloat(usdcBalance.balance) * 10000000; // Convert to stroops
    }
  } catch (error) {
    console.error(`[Stats] Failed to fetch stellar balance for ${driverPubKey}:`, error);
    // Continue with stellarBalance = 0 instead of failing
  }
  
  return {
    stellarBalance: stellarBalance / 10000000,
    // ...
  };
}
```

#### Acceptance Criteria

- [ ] Driver wallet page shows real USDC balance from Stellar
- [ ] Balance updates after approve/reject operations
- [ ] Graceful handling when wallet has no balance
- [ ] Graceful handling when wallet doesn't exist on network

---

## Medium Priority Issues (P2)

Issues that should be addressed but don't block testnet.

---

### Issue #9: Missing Locations Endpoint

**Severity:** Medium
**Labels:** `backend`, `frontend`, `api`

#### Description

The locations page fetches from `stats/recent-transactions` and extracts unique stations - this is a workaround without a dedicated endpoint.

#### Required Implementation

**1. Add Location model to Prisma:**

```prisma
model Location {
  id          String   @id @default(cuid())
  name        String
  address     String
  city        String?
  coords      String?  // "lat,lng"
  hours       String?
  services    String[] // ["Diesel", "Regular", "Premium"]
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

**2. Create location routes:**

```typescript
// backend/src/routes/location.routes.ts
router.get('/locations', locationController.getAll);
router.get('/locations/:id', locationController.getById);
router.post('/locations', locationController.create);  // Manager only
router.put('/locations/:id', locationController.update);
router.delete('/locations/:id', locationController.delete);
```

**3. Update frontend to use dedicated endpoint:**

```typescript
const res = await fetch(`${BACKEND}/api/v1/locations`);
```

#### Acceptance Criteria

- [ ] Locations page fetches from dedicated `/api/v1/locations` endpoint
- [ ] Manager can add/edit/delete gas station locations
- [ ] Location data includes name, address, coordinates, hours, services

---

### Issue #10: Export Functionality Not Implemented

**Severity:** Medium
**Labels:** `backend`, `frontend`, `export`

#### Description

Export buttons return "not available in demo mode" instead of generating real exports.

#### Required Implementation

**1. Backend export routes:**

```typescript
// backend/src/routes/export.routes.ts
router.get('/export/transactions', exportController.exportTransactions);
router.get('/export/drivers', exportController.exportDrivers);
router.get('/export/units', exportController.exportUnits);

export async function exportTransactions(req: Request, res: Response) {
  const { startDate, endDate, format = 'csv' } = req.query;
  
  const transactions = await fuelLogRepository.findByDateRange(
    new Date(startDate as string),
    new Date(endDate as string)
  );
  
  if (format === 'csv') {
    const csv = generateCSV(transactions, [
      'date', 'driver', 'unit', 'plates', 'liters', 'amount', 'station'
    ]);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=transactions-${Date.now()}.csv`);
    return res.send(csv);
  }
  
  res.json({ success: true, data: transactions });
}
```

**2. Frontend export button:**

```typescript
const handleExport = async (type: 'transactions' | 'drivers' | 'units') => {
  const res = await fetch(`${BACKEND}/api/v1/export/${type}?format=csv`);
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${type}-export.csv`;
  a.click();
};
```

#### Acceptance Criteria

- [ ] Export to CSV works for transactions, drivers, and units
- [ ] Date range filtering works for transactions
- [ ] File downloads with correct filename
- [ ] Loading state shown during export

---

### Issue #11: Soroban Contract Not Deployed

**Severity:** Medium
**Labels:** `backend`, `soroban`, `smart-contract`

#### Description

The `tanko-registry` Soroban contract exists in `/contracts/tanko-registry/` but has not been deployed to Testnet.

#### Current Contract Functions

| Function | Description |
|----------|-------------|
| `init(admin)` | Initialize contract with admin address |
| `add_driver(admin, driver)` | Add driver to whitelist |
| `add_station(admin, station)` | Add gas station to whitelist |
| `verify_tx(driver, station)` | Verify both are registered |
| `get_driver_stats(driver)` | Get driver's escrow config |
| `update_driver_limit(admin, driver, limit)` | Update driver's escrow limit |
| `record_usage(admin, driver, amount)` | Record fuel usage |
| `reset_driver_usage(admin, driver)` | Reset driver's usage |

#### Deployment Steps

```bash
# 1. Build the contract
cd contracts/tanko-registry
cargo build --target wasm32-unknown-unknown --release

# 2. Optimize for deployment
soroban contract optimize \
  --wasm target/wasm32-unknown-unknown/release/tanko_registry.wasm

# 3. Deploy to testnet
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/tanko_registry.wasm \
  --source SADMIN_SECRET_KEY \
  --network testnet

# 4. Save the contract ID to .env
# SOROBAN_CONTRACT_ID=CDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

#### Backend Integration

```typescript
// backend/src/services/soroban.service.ts (new file)
export class SorobanService {
  private contractId: string;
  private rpcUrl: string;
  
  async getDriverStats(driverAddress: string): Promise<DriverConfig> {
    // Call contract's get_driver_stats function
    const result = await this.invokeContract({
      method: 'get_driver_stats',
      args: [driverAddress],
    });
    return result;
  }
  
  async verifyTransaction(driverAddress: string, stationAddress: string): Promise<boolean> {
    const result = await this.invokeContract({
      method: 'verify_tx',
      args: [driverAddress, stationAddress],
    });
    return result;
  }
}
```

#### Acceptance Criteria

- [ ] Contract deployed to Soroban Testnet
- [ ] Contract ID saved to `.env`
- [ ] Backend can call contract functions
- [ ] Driver verification works on-chain
- [ ] Escrow limits tracked in smart contract

---

## Backend Analysis

### Current Architecture

```
Controllers (Request Handling)
    │
    ├── Validators (Zod - partial)
    │
    ▼
Services (Business Logic)
    │
    ├── trustlessWorkService ───► Trustless Work API
    ├── stellarService ──────────► Stellar Horizon
    ├── fundsService ───────────► Trustless Work + DB
    ├── escrowService ───────────► Trustless Work + DB
    └── statsService ────────────► DB (no external deps)
    │
    ▼
Repositories (Data Access - Prisma)
    │
    ▼
PostgreSQL Database
```

### Files and Line Counts

| File | Lines | Purpose |
|------|-------|---------|
| `backend/src/index.ts` | 77 | Express app entry point |
| `backend/src/config/index.ts` | ~50 | Environment configuration |
| `backend/src/routes/*.ts` | ~200 | API routes (9 files) |
| `backend/src/controllers/*.ts` | ~400 | Request handlers (8 files) |
| `backend/src/services/*.ts` | ~800 | Business logic (6 files) |
| `backend/src/repositories/*.ts` | ~600 | Data access (7 files) |
| `backend/prisma/schema.prisma` | ~120 | Database schema |

### API Endpoints Summary

| Category | Endpoints | Status |
|----------|-----------|--------|
| Escrow | 11 | ✅ Implemented |
| Wallet | 6 | ✅ Implemented |
| Funds | 10 | ⚠️ Trustless Work not connected |
| Stats | 7 | ⚠️ Stellar balance mock |
| Users | 7 | ⚠️ No registration flow |
| Units | 6 | ✅ Implemented |
| Fuel Logs | 8 | ✅ Implemented |
| Config | 2 | ✅ Implemented |
| Helper | 3 | ✅ Implemented |

### Hardcoded Values to Fix

| Location | Value | Should Be |
|----------|-------|-----------|
| `stats.service.ts:193` | `50000000000` | From EscrowConfig |
| `stats.service.ts:206` | `stellarBalance: 0` | From Stellar API |
| `prisma/schema.prisma:95` | USDC address | From EscrowConfig |

### Missing Services

| Service | Purpose | Status |
|---------|---------|--------|
| `soroban.service.ts` | Soroban contract calls | Not created |
| `user.service.ts` | User management logic | Not created |
| `location.service.ts` | Location CRUD | Not created |

---

## Frontend Analysis

### Page Status

| Page | Status | Data Source | Issues |
|------|--------|-------------|--------|
| `/dashboard` | ✅ Complete | Real API | None |
| `/dashboard/conductor` | ✅ Complete | Real API | None |
| `/dashboard/usuarios` | ⚠️ Partial | Real API | No registration flow |
| `/dashboard/unidades` | ✅ Complete | Real API | None |
| `/dashboard/consumos` | ✅ Complete | Real API | Period filter non-functional |
| `/dashboard/ubicaciones` | ⚠️ Workaround | Derived | Uses transactions endpoint |
| `/dashboard/reportes` | ❌ Mock | None | All hardcoded data |
| `/dashboard/admin` | ❌ Mock | None | All hardcoded data |

### Mock Data Locations

| File | Lines | Data Type |
|------|-------|-----------|
| `reportes/page.tsx` | All | Monthly stats, driver breakdown, transactions |
| `admin/page.tsx` | All | Escrow stats, pending requests |
| `api/trustless/solicitud/route.ts` | 3-18 | MOCK_PETICIONES array |
| `api/export/route.ts` | 4,8 | "Export not available" message |
| `api/trustless/escrow/route.ts` | 10-34 | Placeholder responses |

### Duplicate Code

| Issue | Files |
|-------|-------|
| Two auth providers | `providers/auth-provider.tsx`, `providers/wallet-provider.tsx` |
| Different localStorage keys | `tanko_stellar_address` vs `stellar_address` |

### API Route Usage

The frontend pages call the backend directly instead of using Next.js API routes:

```typescript
// CURRENT - Direct call
const res = await fetch(`${BACKEND}/api/v1/stats/dashboard`);

// RECOMMENDED - Use API route
const res = await fetch('/api/stats');
```

This inconsistency should be resolved by choosing one approach.

---

## Database & Schema Issues

### Current Schema (`backend/prisma/schema.prisma`)

```prisma
model User {
  id            String   @id @default(cuid())
  stellarPubKey String   @unique
  name          String
  email         String?  @unique
  phone         String?
  role          String   @default("CONDUCTOR")
  status        String   @default("ACTIVE")
  // Missing: managerId
}

model Unit {
  id        String @id @default(cuid())
  make      String
  model     String
  year      Int?
  plates    String @unique
  userId    String
  user      User   @relation(fields: [userId], references: [id])
}

model FuelLog {
  id      String @id @default(cuid())
  liters  Float
  amount  Float
  station String
  unitId  String
  userId  String
  unit    Unit   @relation(fields: [unitId], references: [id])
  user    User   @relation(fields: [userId], references: [id])
}

model FundRequest {
  id             String @id @default(cuid())
  liters         Float
  amount         Float
  status         String @default("PENDING")
  driverPubKey   String
  managerPubKey   String
}

model EscrowConfig {
  id            String @id @default(cuid())
  name          String @unique @default("default")
  usdcAddress   String
  decimals      Int    @default(7)
  platformFee   Float  @default(0)
}

model EscrowMilestone {
  id          String    @id @default(cuid())
  escrowId    String    @unique
  contractId  String
  engagementId String
  title       String
  description String?
  amount     Float
  status     String   @default("PENDING")
}
```

### Required Schema Changes

1. **Add Role and UserStatus enums**
2. **Add managerId to User model**
3. **Add managerId to FundRequest and FuelLog**
4. **Create Location model**
5. **Add indexes for common queries**

---

## External Integrations

### Trustless Work API

| Endpoint | Status | Notes |
|----------|--------|-------|
| `POST /escrow/multi-release/create` | ⚠️ Implemented | Needs error handling |
| `POST /escrow/multi-release/fund` | ⚠️ Implemented | Needs testing |
| `POST /escrow/multi-release/approve` | ⚠️ Implemented | Needs testing |
| `POST /escrow/multi-release/release` | ⚠️ Implemented | Needs testing |
| Webhooks | ❌ Not implemented | For async status updates |

### Stellar Network

| Operation | Status | Notes |
|-----------|--------|-------|
| Get balances | ✅ Implemented | stellar-sdk |
| Validate address | ✅ Implemented | Key validation |
| Sign transaction | ⚠️ Incomplete | XDR signing flow |
| Submit transaction | ⚠️ Incomplete | Needs Freighter integration |

### Required Environment Variables

```env
# Trustless Work
TRUSTLESS_WORK_API_URL=https://dev.api.trustlesswork.com
TRUSTLESS_WORK_API_KEY=<REQUIRED>

# Stellar
STELLAR_NETWORK=testnet
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org

# Soroban
SOROBAN_CONTRACT_ID=<AFTER_DEPLOYMENT>
SOROBAN_RPC_URL=https://soroban-testnet.stellar.org

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/tanko_db

# Admin
TANKO_ADMIN_SECRET=<REQUIRED>
```

---

## Acceptance Criteria

### Phase 1: Core Infrastructure (P0)

- [ ] PostgreSQL database configured and connected
- [ ] Prisma migrations run successfully
- [ ] Seed data created (1 manager, sample drivers)
- [ ] Backend starts without errors
- [ ] Health check returns OK with database status

### Phase 2: Driver Registration (P0)

- [ ] Manager can register a new driver
- [ ] New drivers have PENDING status
- [ ] Manager can approve/reject pending drivers
- [ ] Approved drivers can log in
- [ ] Driver-manager relationship enforced

### Phase 3: Trustless Work Integration (P0)

- [ ] Fund request approval creates real escrow
- [ ] Fund request rejection updates status
- [ ] Trustless Work errors handled gracefully
- [ ] Transaction data stored in database
- [ ] Escrow status displayed in UI

### Phase 4: Data Quality (P1)

- [ ] Reports page shows real data
- [ ] Admin page shows real data
- [ ] Stellar balance fetched correctly
- [ ] All mock data removed
- [ ] Input validation on all endpoints

### Phase 5: Security & Performance (P1)

- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] No sensitive data in logs
- [ ] Error messages sanitized
- [ ] API response times < 500ms

### Phase 6: External Integrations (P2)

- [ ] Soroban contract deployed
- [ ] Soroban service implemented
- [ ] Driver verification on-chain
- [ ] Webhook handlers for Trustless Work
- [ ] Real-time updates (optional)

---

## Technical Notes

### Error Handling Pattern

```typescript
// Always wrap async operations in try/catch
try {
  const result = await someAsyncOperation();
  res.json({ success: true, data: result });
} catch (error) {
  console.error('[Controller] Error:', error);
  res.status(error instanceof HttpError ? error.status : 500).json({
    success: false,
    error: error instanceof Error ? error.message : 'Unknown error',
  });
}
```

### Logging Requirements

```typescript
// Use consistent log format
console.log(`[Service] ${operationName} - ${correlationId} - ${duration}ms`);
console.error(`[Service] ${operationName} - ERROR - ${error.message}`);

// Include:
console.log('[TrustlessWork] Creating escrow', {
  engagementId,
  amount,
  recipient,
  timestamp: new Date().toISOString(),
});
```

### Database Connection Pattern

```typescript
// backend/src/db/prisma.ts - Already configured for Prisma 7
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: ['query', 'error', 'warn'],
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}
```

### Stellar Address Validation

```typescript
function isValidStellarAddress(address: string): boolean {
  return /^G[A-Z0-9]{55}$/.test(address);
}
```

### Stroops Conversion

Stellar uses stroops (1 stroop = 0.0000001 XLM). USDC on Stellar typically has 7 decimals.

```typescript
// Convert USDC to stroops
const stroops = usdcAmount * 10000000;

// Convert stroops to USDC
const usdc = stroops / 10000000;
```

---

## Milestones

### Milestone 1: Infrastructure (2 hours)
- [ ] Setup PostgreSQL
- [ ] Run migrations
- [ ] Create seed data
- [ ] Verify connection

### Milestone 2: Driver Registration (8 hours)
- [ ] Update Prisma schema
- [ ] Create UserService
- [ ] Add registration endpoints
- [ ] Create registration UI
- [ ] Add approval/rejection flow

### Milestone 3: Trustless Work (6 hours)
- [ ] Complete approve flow
- [ ] Complete reject flow
- [ ] Add error handling
- [ ] Update frontend API routes
- [ ] Test end-to-end

### Milestone 4: Data Cleanup (4 hours)
- [ ] Remove mock data from Reports
- [ ] Remove mock data from Admin
- [ ] Fix Stellar balance fetch
- [ ] Add input validation

### Milestone 5: Security (2 hours)
- [ ] Add rate limiting
- [ ] Configure CORS
- [ ] Add request logging
- [ ] Sanitize error messages

### Milestone 6: External Services (4 hours)
- [ ] Deploy Soroban contract
- [ ] Create SorobanService
- [ ] Implement webhook handlers
- [ ] Add on-chain verification

---

## Questions for Clarification

1. **Should drivers be able to self-register** (pending approval) **or must managers create them directly?**

2. **Can a driver belong to multiple managers?** (Currently assumed: No)

3. **Should we implement NextAuth for additional auth methods**, or is wallet-only sufficient?

4. **Is there a specific export format required?** (CSV, Excel, PDF?)

5. **Should we implement real-time updates** (WebSocket/SSE) for pending requests?

6. **Is there a Trustless Work API key available?** (Required for escrow operations)

---

## Appendix: Environment Variables Reference

```env
# ═══════════════════════════════════════════════════════════════════════════════
# TANKO - Environment Variables
# ═══════════════════════════════════════════════════════════════════════════════

# ── APPLICATION ───────────────────────────────────────────────────────────────
NODE_ENV=development
PORT=3001

# ── DATABASE ─────────────────────────────────────────────────────────────────
# PostgreSQL connection string
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/tanko_db

# ── STELLAR NETWORK ──────────────────────────────────────────────────────────
STELLAR_NETWORK=testnet
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org

# ── SOROBAN ──────────────────────────────────────────────────────────────────
SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
SOROBAN_CONTRACT_ID=

# ── TRUSTLESS WORK ───────────────────────────────────────────────────────────
TRUSTLESS_WORK_API_URL=https://dev.api.trustlesswork.com
TRUSTLESS_WORK_API_KEY=

# ── ADMIN ─────────────────────────────────────────────────────────────────────
TANKO_ADMIN_SECRET=

# ── CORS ──────────────────────────────────────────────────────────────────────
CORS_ORIGIN=http://localhost:3000,http://127.0.0.1:3000

# ── FRONTEND ─────────────────────────────────────────────────────────────────
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_STELLAR_NETWORK=testnet
```

---

**Document Author:** Tanko Development Team
**Version:** 1.0
**Last Updated:** 2026-04-10
