import { Link } from 'react-router-dom';
import { languages } from '@/utils';

export default function Hero() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-blue-600/20 via-violet-600/10 to-fuchsia-600/20 p-8 md:p-12">
      <div className="absolute -top-16 -right-16 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute -bottom-20 -left-10 w-80 h-80 bg-fuchsia-500/15 rounded-full blur-3xl animate-pulse-slow" />
      <div className="relative z-10 max-w-3xl animate-slide-up">
        <span className="inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full bg-white/10 border border-white/15 text-blue-200 mb-5">
          ✨ 多语种沉浸式学习 · AI 个性化路径
        </span>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-white leading-tight tracking-tight">
          让世界<span className="bg-gradient-to-r from-blue-300 via-fuchsia-300 to-amber-300 bg-clip-text text-transparent">成为你的课堂</span>
        </h1>
        <p className="mt-5 text-slate-300 text-base md:text-lg leading-relaxed max-w-2xl">
          英、日、韩三语体系分级课程，互动式单词记忆、语法训练、口语跟读与听力磨耳朵，配合游戏化成就与活跃社区，让学习语言变成每天的快乐仪式。
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link to="/courses" className="btn-primary text-white px-5 py-3 rounded-xl font-medium inline-flex items-center gap-2">
            探索课程
          </Link>
          <Link to="/learn/vocabulary" className="px-5 py-3 rounded-xl font-medium border border-white/15 text-white hover:bg-white/5">
            立即开始练习 →
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-3 gap-3 md:gap-5 max-w-xl">
          {languages.map((l) => (
            <Link
              key={l.code}
              to={`/courses?language=${l.code}`}
              className="card-hover group p-4 rounded-2xl border border-white/10 bg-slate-900/40"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${l.color} text-white flex items-center justify-center text-xl`}>
                {l.flag}
              </div>
              <div className="mt-3 text-white font-medium">{l.label}</div>
              <div className="text-xs text-slate-400 mt-0.5">分级课程 + 互动练习</div>
            </Link>
          ))}
        </div>
      </div>

      <div className="relative z-10 mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          ['6+', '精选课程'],
          ['180+', '词汇条目'],
          ['30+', '语法练习'],
          ['8', '成就徽章'],
        ].map(([n, label]) => (
          <div key={label} className="rounded-2xl bg-slate-900/50 border border-white/10 p-4">
            <div className="text-2xl font-display font-bold text-white">{n}</div>
            <div className="text-xs text-slate-400 mt-1">{label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
