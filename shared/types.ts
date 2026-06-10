export interface User {
  id: number;
  email: string;
  username: string;
  avatar: string | null;
  target_language: string;
  level: string;
  streak_days: number;
  xp: number;
  last_active: string;
  created_at: string;
}

export interface Course {
  id: number;
  title: string;
  language: string;
  language_label: string;
  level: string;
  description: string;
  lessons_count: number;
  cover_color: string;
  icon: string;
}

export interface VocabularyWord {
  id: number;
  word: string;
  translation: string;
  pronunciation: string;
  example: string;
  language: string;
}

export interface GrammarQuiz {
  id: number;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  language: string;
  level: string;
}

export interface ListeningItem {
  id: number;
  title: string;
  text_content: string;
  language: string;
  level: string;
}

export interface ProgressEntry {
  id: number;
  user_id: number;
  activity_type: string;
  score: number;
  items_completed: number;
  total_items: number;
  language: string;
  created_at: string;
}

export interface ProgressSummary {
  total_words_learned: number;
  total_lessons_completed: number;
  total_minutes: number;
  streak_days: number;
  weekly: { date: string; score: number }[];
  by_language: { language: string; score: number }[];
}

export interface Post {
  id: number;
  user_id: number;
  username: string;
  avatar: string | null;
  title: string;
  content: string;
  language: string;
  likes: number;
  comments_count: number;
  created_at: string;
  liked?: boolean;
}

export interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  username: string;
  avatar: string | null;
  content: string;
  created_at: string;
}

export interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  requirement_type: string;
  requirement_value: number;
  unlocked: boolean;
  progress: number;
}

export interface Recommendation {
  id: string;
  title: string;
  subtitle: string;
  type: 'course' | 'vocabulary' | 'grammar' | 'listening' | 'speaking';
  reason: string;
}
