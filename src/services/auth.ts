import api from './api';

export type LoginReq = { username: string; password: string };
export type LoginRes = { username: string; roles: string[]; token: string };

export async function login(payload: LoginReq): Promise<LoginRes> {
  const { data } = await api.post<LoginRes>('/api/auth/login', payload);
  localStorage.setItem('token', data.token);
  localStorage.setItem('username', data.username);
  localStorage.setItem('roles', JSON.stringify(data.roles || []));
  return data;
}

export async function signup(payload: LoginReq, admin = false): Promise<string> {
  const path = admin ? '/api/auth/signup/admin' : '/api/auth/signup';
  const { data } = await api.post<string>(path, payload);
  return data;
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  localStorage.removeItem('roles');
}

export function isAdmin(): boolean {
  try {
    const roles = JSON.parse(localStorage.getItem('roles') || '[]');
    return Array.isArray(roles) && roles.includes('ROLE_ADMIN');
  } catch {
    return false;
  }
}


