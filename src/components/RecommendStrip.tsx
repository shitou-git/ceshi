import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { api } from '@/utils';
import { useAuth } from '@/store/auth';
import type { Recommendation } from '@shared/types';

export default function RecommendStrip() {
  const auth = useAuth();
  const [items, setItems] = useState<Recommendation[]>([]);
  useEffect(() => {
    if (!auth.user) return;
    api<{ recommendations: Recommendation[] }>('/api/recommendations')
      .then((d) => setItems(d.recommendations.slice(0, 5)))
      .catch(() => {});
  }, [auth.user]);
  if (!auth.user) return null;

  const typeToUrl: Record<string, string> = {
    course: '/courses',
    vocabulary: '/learn/vocabulary',
    grammar: '/learn/grammar',
    listening: '/learn/listening',
    speaking: '/learn/speaking',
  };

  return (
    <section className="rounded-3xl border border-white/10 bg-gradient-to-r from-blue-600/10 via-violet-600/10 to-fuchsia-600/10 p-6 md:p-7">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-amber-300" />
        <h3 className="font-display text-xl font-semibold text-white">为你推荐</h3>
        <span className="text-xs text-slate-400">基于你的目标语言 {auth.user.target_language.toUpperCase()} · 水平 {auth.user.level}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {items.map((r) => (
          <Link
            key={r.id}
            to={typeToUrl[r.type]}
            className="card-hover p-4 rounded-2xl border border-white/10 bg-slate-900/40"
          >
            <div className="text-xs uppercase tracking-widest text-blue-300">{r.type}</div>
            <div className="mt-1.5 text-white font-medium">{r.title}</div>
            <div className="text-xs text-slate-400 mt-1">{r.subtitle}</div>
            <div className="text-[11px] text-slate-500 mt-2.5">{r.reason}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
