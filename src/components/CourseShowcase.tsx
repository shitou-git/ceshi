import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, * as LucideIcons } from 'lucide-react';
import type { Course } from '@shared/types';
import { api } from '@/utils';

export default function CourseShowcase() {
  const [courses, setCourses] = useState<Course[]>([]);
  useEffect(() => {
    api<{ courses: Course[] }>('/api/courses').then((d) => setCourses(d.courses.slice(0, 6))).catch(() => {});
  }, []);

  return (
    <section>
      <div className="flex items-end justify-between mb-5">
        <div>
          <h2 className="font-display text-2xl font-bold text-white">精选课程</h2>
          <p className="text-sm text-slate-400 mt-1">系统化分级课程，从入门到精通</p>
        </div>
        <Link to="/courses" className="text-sm text-blue-300 hover:text-white inline-flex items-center gap-1">
          查看全部 <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((c) => {
          const IconComponent = (LucideIcons as any)[c.icon] || LucideIcons.BookOpen;
          return (
            <Link
              key={c.id}
              to={`/courses/${c.id}`}
              className="card-hover group relative overflow-hidden rounded-2xl p-5 border border-white/10 bg-slate-900/60"
            >
              <div className={`absolute -top-16 -right-16 w-56 h-56 rounded-full bg-gradient-to-br ${c.cover_color} opacity-30 blur-3xl`} />
              <div className="relative">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${c.cover_color} text-white flex items-center justify-center shadow-lg`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-white font-semibold">{c.title}</div>
                    <div className="text-xs text-slate-400">{c.language_label} · {c.level} · {c.lessons_count} 课</div>
                  </div>
                </div>
                <p className="mt-4 text-sm text-slate-300 leading-relaxed">{c.description}</p>
                <div className="mt-4 inline-flex items-center text-sm text-blue-300 group-hover:text-white">
                  开始学习 <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
