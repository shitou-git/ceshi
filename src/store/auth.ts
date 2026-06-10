import { create } from 'zustand';
import type { User } from '@shared/types';
import { api } from '@/utils';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  init: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  refresh: () => Promise<void>;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('lv_token'),
  loading: false,
  error: null,
  init() {
    const t = localStorage.getItem('lv_token');
    if (t && !get().user) {
      get().refresh().catch(() => {
        localStorage.removeItem('lv_token');
        set({ user: null, token: null });
      });
    }
  },
  async login(email, password) {
    set({ loading: true, error: null });
    try {
      const { token, user } = await api<{ token: string; user: User }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem('lv_token', token);
      set({ token, user, loading: false });
    } catch (e: any) {
      set({ error: e.message, loading: false });
      throw e;
    }
  },
  async register(username, email, password) {
    set({ loading: true, error: null });
    try {
      const { token, user } = await api<{ token: string; user: User }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password }),
      });
      localStorage.setItem('lv_token', token);
      set({ token, user, loading: false });
    } catch (e: any) {
      set({ error: e.message, loading: false });
      throw e;
    }
  },
  logout() {
    localStorage.removeItem('lv_token');
    set({ user: null, token: null });
  },
  async updateProfile(data) {
    const { user } = await api<{ user: User }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    set({ user });
  },
  async refresh() {
    const { user } = await api<{ user: User }>('/api/auth/profile');
    set({ user });
  },
}));
