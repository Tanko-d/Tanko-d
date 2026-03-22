export interface Trustline {
  address: string;
  symbol: string;
}

export interface Roles {
  sender: string;
  serviceProvider: string;
  platformAddress: string;
  releaseSigner: string;
  disputeResolver: string;
}

export interface EscrowMilestone {
  description: string;
  amount: number;
}

export interface CreateEscrowPayload {
  signer: string;
  engagementId: string;
  title: string;
  roles: Roles;
  amount: number;
  platformFee: number;
  milestones: EscrowMilestone[];
  trustline: Trustline;
}

export interface FundEscrowPayload {
  contractId: string;
  signer: string;
  role: 'serviceProvider' | 'platformAddress' | 'releaseSigner' | 'disputeResolver';
  rolePublicKey: string;
  trustline: Trustline;
}

export interface ApproveMilestonePayload {
  contractId: string;
  milestoneIndex: number;
  signer: string;
  rolePublicKey: string;
}

export interface ReleaseFundsPayload {
  contractId: string;
  signer: string;
  rolePublicKey: string;
}

export interface SendTransactionPayload {
  signedXdr: string;
}

export interface EscrowResponse {
  contractId?: string;
  unsignedTransaction?: string;
  xdr?: string;
}

export interface TrustlessWorkResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface EscrowStatus {
  contractId: string;
  status: 'initialized' | 'funded' | 'approved' | 'released' | 'disputed';
  amount: string;
  milestone?: EscrowMilestone;
  createdAt: string;
  updatedAt: string;
}

export interface FundRequest {
  id: string;
  driverPublicKey: string;
  managerPublicKey: string;
  amount: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'released';
  contractId?: string;
  escrowXdr?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FundRequestPayload {
  amount: string;
  description: string;
}

export interface ApproveFundRequestPayload {
  requestId: string;
  managerSecret: string;
  createNewEscrow?: boolean;
}

export interface RejectFundRequestPayload {
  requestId: string;
  reason?: string;
}

export interface TestnetAccount {
  publicKey: string;
  secret: string;
}
