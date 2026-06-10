import { Link, NavLink, useNavigate } from 'react-router-dom';
import { BookOpen, Flame, Trophy, Home, GraduationCap, MessageCircle, LineChart, UserCircle2, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '@/store/auth';
import { cx } from '@/utils';

const navItems = [
  { to: '/', label: '首页', icon: Home },
  { to: '/courses', label: '课程', icon: GraduationCap },
  { to: '/learn/vocabulary', label: '学习', icon: BookOpen },
  { to: '/progress', label: '进度', icon: LineChart },
  { to: '/community', label: '社区', icon: MessageCircle },
  { to: '/achievements', label: '成就', icon: Trophy },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const nav = useNavigate();

  return (
    <div className="min-h-screen aurora">
      <header className="sticky top-0 z-30 border-b border-slate-800/60 bg-slate-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-6 h-16">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 via-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight text-white">LinguaVerse</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cx(
                    'flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg transition',
                    isActive
                      ? 'text-white bg-white/10'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  )
                }
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            {auth.user && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                <Flame className="w-4 h-4" />
                连续 {auth.user.streak_days} 天
              </div>
            )}
            {auth.user ? (
              <div className="flex items-center gap-2">
                <Link to="/profile" className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition">
                  <img
                    src={auth.user.avatar || undefined}
                    alt="avatar"
                    className="w-7 h-7 rounded-full bg-slate-700 object-cover"
                  />
                  <span className="text-sm text-slate-200 max-w-[120px] truncate">{auth.user.username}</span>
                </Link>
                <button
                  onClick={() => {
                    auth.logout();
                    nav('/login');
                  }}
                  className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-white/5"
                  title="退出登录"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-sm text-slate-200 px-3 py-2 rounded-lg hover:bg-white/5">登录</Link>
                <Link to="/register" className="text-sm text-white btn-primary px-4 py-2 rounded-lg font-medium">注册</Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">{children}</main>

      <nav className="md:hidden fixed bottom-0 inset-x-0 border-t border-slate-800/60 bg-slate-900/90 backdrop-blur">
        <div className="grid grid-cols-6 max-w-7xl mx-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cx('flex flex-col items-center gap-0.5 py-2.5 text-[11px]', isActive ? 'text-blue-400' : 'text-slate-400')
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
      <div className="md:hidden h-16" />

      <footer className="border-t border-slate-800/60 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-slate-400">
          <div>© {new Date().getFullYear()} LinguaVerse · 沉浸式多语学习平台</div>
          <div className="flex items-center gap-4">
            <span>支持英语 / 日语 / 韩语</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
