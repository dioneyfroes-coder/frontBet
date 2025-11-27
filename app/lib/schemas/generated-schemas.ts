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

export const RegisterResponse = z.object({
  success: z.boolean().optional(),
  data: z
    .object({
      message: z.string().optional(),
      user: User.optional(),
    })
    .optional(),
  meta: z
    .object({
      timestamp: z.string().optional(),
    })
    .optional(),
});

export const MeResponse = z.object({
  success: z.boolean().optional(),
  data: User.optional(),
  meta: z
    .object({
      timestamp: z.string().optional(),
    })
    .optional(),
});

export const LogoutResponse = z.object({
  success: z.boolean().optional(),
  data: z
    .object({
      message: z.string().optional(),
    })
    .optional(),
  meta: z
    .object({
      timestamp: z.string().optional(),
    })
    .optional(),
});

export const ConflictError = z.object({
  success: z.boolean().optional(),
  error: z
    .object({
      code: z.string().optional(),
      message: z.string().optional(),
    })
    .optional(),
  meta: z
    .object({
      timestamp: z.string().optional(),
    })
    .optional(),
});

// duplicate ValidationError declaration removed (declared earlier)

export const AppError = z.object({
  code: z.string().optional(),
  message: z.string().optional(),
  details: z.union([ValidationError, z.record(z.string(), z.any())]).optional(),
});

export const Transaction = z.object({
  id: z.string().uuid().optional(),
  type: z.string().optional(),
  amount: z.number().optional(),
  currency: z.string().optional(),
  description: z.string().optional(),
  createdAt: z.string().optional(),
});

export const TransactionHistory = z.object({
  transactions: z.array(Transaction).optional(),
  total: z.number().optional(),
});

export const UnauthorizedError = z.object({
  success: z.boolean().optional(),
  error: z
    .object({
      code: z.string().optional(),
      message: z.string().optional(),
    })
    .optional(),
  meta: z
    .object({
      timestamp: z.string().optional(),
    })
    .optional(),
});

export const PlaceBetRequest = z.object({
  eventId: z.string().uuid(),
  marketId: z.string(),
  oddId: z.string(),
  amount: z.number(),
  type: z.enum(['SINGLE', 'MULTIPLE'] as const).optional(),
  currency: z.enum(['BRL', 'USD', 'EUR'] as const).optional(),
});

export const CancelBetRequest = z.object({
  betId: z.string().uuid(),
  reason: z.string().optional(),
});

export const BetResponse = z.object({
  id: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  eventId: z.string().uuid().optional(),
  marketId: z.string().optional(),
  amount: z.number().optional(),
  odds: z.number().optional(),
  potentialReturn: z.number().optional(),
  status: z.enum(['PENDING', 'WON', 'LOST', 'CANCELED'] as const).optional(),
  type: z.string().optional(),
  createdAt: z.string().optional(),
  resolvedAt: z.string().nullable().optional(),
  cancellationReason: z.string().nullable().optional(),
});

export const BetListResponse = z.object({
  bets: z.array(BetResponse).optional(),
});

export const schemas = {
  User,
  Wallet,
  WalletResponse,
  RegisterRequest,
  AuthResponse,
  ErrorResponse,
  RegisterResponse,
  MeResponse,
  LogoutResponse,
  ConflictError,
  ValidationError,
  AppError,
  Transaction,
  TransactionHistory,
  UnauthorizedError,
  PlaceBetRequest,
  CancelBetRequest,
  BetResponse,
  BetListResponse,
} as const;
