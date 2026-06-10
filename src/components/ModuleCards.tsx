import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Headphones, MessageSquareText, Mic2 } from 'lucide-react';

const modules = [
  {
    title: '单词记忆',
    desc: '翻转卡片 + 例句场景，科学记忆，快速扩充词汇',
    to: '/learn/vocabulary',
    icon: BookOpen,
    color: 'from-sky-500 to-blue-600',
  },
  {
    title: '语法练习',
    desc: '分级选择题，即时反馈与解析，构建语法体系',
    to: '/learn/grammar',
    icon: MessageSquareText,
    color: 'from-emerald-500 to-teal-600',
  },
  {
    title: '口语跟读',
    desc: '浏览器原生语音识别，开口跟读，提升流利度',
    to: '/learn/speaking',
    icon: Mic2,
    color: 'from-fuchsia-500 to-purple-600',
  },
  {
    title: '听力训练',
    desc: '分级对话材料，逐句精听，训练真实语境理解力',
    to: '/learn/listening',
    icon: Headphones,
    color: 'from-amber-500 to-orange-600',
  },
];

export default function ModuleCards() {
  return (
    <section>
      <div className="flex items-end justify-between mb-5">
        <div>
          <h2 className="font-display text-2xl font-bold text-white">互动学习模块</h2>
          <p className="text-sm text-slate-400 mt-1">多种练习模式，打造沉浸式学习体验</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {modules.map((m) => (
          <Link
            key={m.to}
            to={m.to}
            className="card-hover group relative rounded-2xl p-5 border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-900/30"
          >
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${m.color} flex items-center justify-center text-white shadow-lg`}>
              <m.icon className="w-6 h-6" />
            </div>
            <div className="mt-4 text-lg font-semibold text-white">{m.title}</div>
            <p className="mt-1.5 text-sm text-slate-400 leading-relaxed">{m.desc}</p>
            <div className="mt-4 inline-flex items-center text-sm text-blue-300 group-hover:text-white">
              进入练习 <ArrowRight className="w-4 h-4 ml-1 transition group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
