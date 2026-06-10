export const API_BASE = '/api';

export async function api<T = any>(url: string, init?: RequestInit): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('lv_token') : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(url, { ...init, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: '请求失败' }));
    throw new Error(err.message || '请求失败');
  }
  return res.json();
}

export const languages = [
  { code: 'en', label: '英语', flag: '🇬🇧', color: 'from-blue-500 to-indigo-600' },
  { code: 'ja', label: '日语', flag: '🇯🇵', color: 'from-rose-500 to-pink-600' },
  { code: 'ko', label: '韩语', flag: '🇰🇷', color: 'from-amber-500 to-orange-600' },
];

export const levels = [
  { code: 'A1', label: '入门' },
  { code: 'A2', label: '初级' },
  { code: 'B1', label: '中级' },
  { code: 'B2', label: '中高级' },
  { code: 'C1', label: '高级' },
];

export function formatDate(s: string) {
  if (!s) return '';
  const d = new Date(s);
  const now = new Date();
  const diff = (now.getTime() - d.getTime()) / 1000;
  if (diff < 60) return '刚刚';
  if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} 天前`;
  return d.toLocaleDateString('zh-CN');
}

export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(' ');
}
