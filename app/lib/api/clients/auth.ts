import { post, get } from '../rest';
import { z } from 'zod';
import {
  AuthResponse,
  RegisterResponse,
  MeResponse,
  LogoutResponse,
} from '../../schemas/generated-schemas';

type AuthResp = z.infer<typeof AuthResponse>;
type RegisterResp = z.infer<typeof RegisterResponse>;
type MeResp = z.infer<typeof MeResponse>;
type LogoutResp = z.infer<typeof LogoutResponse>;

export async function login(payload: { email: string; password: string }) {
  const res = await post<AuthResp>('/api/auth/login', payload, { validate: AuthResponse });
  return res.data;
}

export async function register(payload: zodInferRegisterRequest) {
  const res = await post<RegisterResp>('/api/auth/register', payload, {
    validate: RegisterResponse,
  });
  return res.data;
}

export async function me() {
  const res = await get<MeResp>('/api/auth/me', undefined, { validate: MeResponse });
  return res.data ?? null;
}

export async function logout() {
  const res = await post<LogoutResp>('/api/auth/logout', undefined, { validate: LogoutResponse });
  return res.data ?? null;
}

// Minimal typed helper for RegisterRequest shape — keep internal so we avoid extra runtime imports
type zodInferRegisterRequest = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  username: string;
};

export default { login, register, me, logout };
