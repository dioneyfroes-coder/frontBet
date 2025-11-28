// Auto-generated from docs da backend/openapi.json — do not edit manually
import { z } from 'zod';

export const User = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  username: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  status: z.enum(['PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED'] as const),
  createdAt: z.string(),
});

export const Wallet = z.object({
  id: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  balance: z
    .object({
      amount: z.number().optional(),
      currency: z.string().optional(),
    })
    .optional(),
  createdAt: z.string().optional(),
});

export const WalletResponse = z.object({
  success: z.boolean().optional(),
  data: Wallet.optional(),
  meta: z
    .object({
      timestamp: z.string().optional(),
    })
    .optional(),
});

export const ValidationError = z.record(z.string(), z.string());

export const RegisterRequest = z.object({
  email: z.string().email(),
  password: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  username: z.string(),
});

export const AuthResponse = z.object({
  success: z.boolean().optional(),
  data: z
    .object({
      accessToken: z.string().optional(),
      refreshToken: z.string().optional(),
      user: User.optional(),
    })
    .optional(),
  meta: z
    .object({
      timestamp: z.string().optional(),
    })
    .optional(),
});

export const ErrorResponse = z.object({
  success: z.boolean().optional(),
  error: z
    .object({
      code: z.string().optional(),
      message: z.string().optional(),
      details: z.union([ValidationError, z.record(z.string(), z.any())]).optional(),
    })
    .optional(),
  meta: z
    .object({
      timestamp: z.string().optional(),
    })
    .optional(),
});

// ... other schemas omitted for brevity (original file is large)
