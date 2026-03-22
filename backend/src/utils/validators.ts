import { z } from 'zod';

export const trustlineSchema = z.object({
  address: z.string().min(1, 'Trustline address is required'),
  symbol: z.string().min(1, 'Trustline symbol is required'),
});

export const milestoneSchema = z.object({
  description: z.string().min(1, 'Milestone description is required'),
  amount: z.number().positive('Milestone amount must be positive'),
});

export const rolesSchema = z.object({
  sender:          z.string().min(1, 'sender address is required'),
  serviceProvider: z.string().min(1, 'serviceProvider address is required'),
  platformAddress: z.string().min(1, 'platformAddress is required'),
  releaseSigner:   z.string().min(1, 'releaseSigner address is required'),
  disputeResolver: z.string().min(1, 'disputeResolver address is required'),
});

export const createEscrowSchema = z.object({
  signer:       z.string().min(1, 'Signer address is required'),
  engagementId: z.string().min(1, 'Engagement ID is required'),
  title:        z.string().min(1, 'Title is required'),
  roles:        rolesSchema,
  amount:       z.number().positive('Amount must be positive'),
  platformFee:  z.number().min(0, 'Platform fee must be >= 0'),
  milestones:   z.array(milestoneSchema).min(1, 'At least one milestone is required'),
  trustline:    trustlineSchema,
});

export const fundEscrowSchema = z.object({
  contractId: z.string().min(1, 'Contract ID is required'),
  signer: z.string().min(1, 'Signer is required'),
  role: z.enum(['serviceProvider', 'platformAddress', 'releaseSigner', 'disputeResolver']),
  rolePublicKey: z.string().min(1, 'Role public key is required'),
  trustline: trustlineSchema,
});

export const approveMilestoneSchema = z.object({
  contractId: z.string().min(1, 'Contract ID is required'),
  milestoneIndex: z.number().int().nonnegative('Milestone index must be non-negative'),
  signer: z.string().min(1, 'Signer is required'),
  rolePublicKey: z.string().min(1, 'Role public key is required'),
});

export const releaseFundsSchema = z.object({
  contractId: z.string().min(1, 'Contract ID is required'),
  signer: z.string().min(1, 'Signer is required'),
  rolePublicKey: z.string().min(1, 'Role public key is required'),
});

export const sendTransactionSchema = z.object({
  signedXdr: z.string().min(1, 'Signed XDR is required'),
});

export const getEscrowSchema = z.object({
  contractId: z.string().min(1, 'Contract ID is required'),
  type: z.enum(['single', 'multi']).default('single'),
});

export const setTrustlineSchema = z.object({
  address: z.string().min(1, 'Address is required'),
  publicKey: z.string().min(1, 'Public key is required'),
  trustline: trustlineSchema,
});

export const getEscrowsByRoleSchema = z.object({
  role: z.enum(['serviceProvider', 'platformAddress', 'releaseSigner', 'disputeResolver']),
  publicKey: z.string().min(1, 'Public key is required'),
});

export const getMultipleBalancesSchema = z.object({
  contractIds: z.array(z.string().min(1)).min(1, 'At least one contract ID is required'),
});

export const disputeEscrowSchema = z.object({
  contractId: z.string().min(1, 'Contract ID is required'),
  signer: z.string().min(1, 'Signer is required'),
  rolePublicKey: z.string().min(1, 'Role public key is required'),
  reason: z.string().optional(),
});

export const resolveDisputeSchema = z.object({
  contractId: z.string().min(1, 'Contract ID is required'),
  signer: z.string().min(1, 'Signer is required'),
  rolePublicKey: z.string().min(1, 'Role public key is required'),
  resolver: z.enum(['serviceProvider', 'platformAddress', 'releaseSigner', 'disputeResolver']),
  percentage: z.number().min(0).max(100),
});

export type CreateEscrowInput = z.infer<typeof createEscrowSchema>;
export type FundEscrowInput = z.infer<typeof fundEscrowSchema>;
export type ApproveMilestoneInput = z.infer<typeof approveMilestoneSchema>;
export type ReleaseFundsInput = z.infer<typeof releaseFundsSchema>;
export type SendTransactionInput = z.infer<typeof sendTransactionSchema>;
export type GetEscrowInput = z.infer<typeof getEscrowSchema>;
export type SetTrustlineInput = z.infer<typeof setTrustlineSchema>;
export type GetEscrowsByRoleInput = z.infer<typeof getEscrowsByRoleSchema>;
export type GetMultipleBalancesInput = z.infer<typeof getMultipleBalancesSchema>;
export type DisputeEscrowInput = z.infer<typeof disputeEscrowSchema>;
export type ResolveDisputeInput = z.infer<typeof resolveDisputeSchema>;
