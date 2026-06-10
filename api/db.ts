import Database from 'better-sqlite3';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'linguaverse.db');
export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      avatar TEXT,
      target_language TEXT DEFAULT 'en',
      level TEXT DEFAULT 'A1',
      streak_days INTEGER DEFAULT 0,
      xp INTEGER DEFAULT 0,
      last_active TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      language TEXT NOT NULL,
      language_label TEXT NOT NULL,
      level TEXT NOT NULL,
      description TEXT,
      lessons_count INTEGER DEFAULT 5,
      cover_color TEXT,
      icon TEXT
    );

    CREATE TABLE IF NOT EXISTS lessons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER,
      title TEXT NOT NULL,
      order_index INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS vocabulary (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lesson_id INTEGER,
      word TEXT NOT NULL,
      translation TEXT NOT NULL,
      pronunciation TEXT,
      example TEXT,
      language TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS grammar_quizzes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lesson_id INTEGER,
      question TEXT NOT NULL,
      options TEXT NOT NULL,
      correct_answer TEXT NOT NULL,
      explanation TEXT,
      language TEXT NOT NULL,
      level TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS listening_materials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      text_content TEXT NOT NULL,
      audio_url TEXT,
      language TEXT NOT NULL,
      level TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      activity_type TEXT NOT NULL,
      score INTEGER DEFAULT 0,
      items_completed INTEGER DEFAULT 0,
      total_items INTEGER DEFAULT 0,
      language TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      language TEXT DEFAULT 'general',
      likes INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS post_likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      UNIQUE(post_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      requirement_type TEXT NOT NULL,
      requirement_value INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      achievement_id INTEGER NOT NULL,
      unlocked_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, achievement_id)
    );
  `);

  seedIfEmpty();
}

function seedIfEmpty() {
  const courseCount = db.prepare('SELECT COUNT(*) as c FROM courses').get() as { c: number };
  if (courseCount.c > 0) return;

  // Courses
  const insertCourse = db.prepare(
    'INSERT INTO courses (title, language, language_label, level, description, lessons_count, cover_color, icon) VALUES (?,?,?,?,?,?,?,?)'
  );
  const courses: any[][] = [
    ['English Foundations', 'en', '英语', 'A1', '从零开始，构建扎实的英语基础，掌握日常表达与核心词汇。', 6, 'from-blue-500 to-indigo-600', 'BookOpen'],
    ['Business English Pro', 'en', '英语', 'B1', '职场英语强化，涵盖会议、谈判、邮件与报告场景。', 8, 'from-sky-500 to-blue-700', 'Briefcase'],
    ['日本語入門', 'ja', '日语', 'A1', '五十音起步，系统掌握日语发音、基础语法与日常问候。', 6, 'from-rose-500 to-pink-600', 'Landmark'],
    ['JLPT N4 突破', 'ja', '日语', 'A2', '针对 N4 级别训练，词汇+语法+阅读三位一体。', 8, 'from-pink-500 to-fuchsia-600', 'GraduationCap'],
    ['한국어 기초', 'ko', '韩语', 'A1', '从韩字发音到简单对话，轻松入门韩国语。', 6, 'from-amber-500 to-orange-600', 'Heart'],
    ['K-Pop 韩语实用', 'ko', '韩语', 'A2', '通过 K-Pop 歌词与综艺内容，趣味学习韩语口语。', 8, 'from-orange-500 to-red-500', 'Music'],
  ];
  const courseIds: number[] = [];
  for (const c of courses) {
    const info = insertCourse.run(...c);
    courseIds.push(Number(info.lastInsertRowid));
  }

  // Lessons
  const insertLesson = db.prepare('INSERT INTO lessons (course_id, title, order_index) VALUES (?,?,?)');
  courseIds.forEach((cid, i) => {
    const n = courses[i][5] as number;
    for (let k = 1; k <= n; k++) {
      insertLesson.run(cid, `第 ${k} 课 · 基础训练`, k);
    }
  });

  // Vocabulary per language
  const insertVocab = db.prepare(
    'INSERT INTO vocabulary (lesson_id, word, translation, pronunciation, example, language) VALUES (?,?,?,?,?,?)'
  );
  const enWords: [string, string, string, string][] = [
    ['hello', '你好', '/həˈloʊ/', 'Hello, nice to meet you.'],
    ['welcome', '欢迎', '/ˈwɛlkəm/', 'Welcome to our platform.'],
    ['friend', '朋友', '/frɛnd/', 'She is my best friend.'],
    ['learn', '学习', '/lɜrn/', 'I learn English every day.'],
    ['language', '语言', '/ˈlæŋɡwɪdʒ/', 'Language is the key to culture.'],
    ['book', '书籍', '/bʊk/', 'This book is interesting.'],
    ['teacher', '老师', '/ˈtitʃər/', 'My teacher is patient.'],
    ['student', '学生', '/ˈstudənt/', 'She is a hard-working student.'],
    ['morning', '早晨', '/ˈmɔrnɪŋ/', 'Good morning, everyone.'],
    ['evening', '傍晚', '/ˈivnɪŋ/', 'We met in the evening.'],
    ['travel', '旅行', '/ˈtrævəl/', 'I love to travel abroad.'],
    ['music', '音乐', '/ˈmjuzɪk/', 'Music makes me happy.'],
    ['coffee', '咖啡', '/ˈkɔfi/', 'A cup of coffee, please.'],
    ['weather', '天气', '/ˈwɛðər/', 'The weather is beautiful today.'],
    ['beautiful', '美丽', '/ˈbjutəfəl/', 'What a beautiful view!'],
    ['important', '重要', '/ɪmˈpɔrtənt/', 'This meeting is important.'],
    ['understand', '理解', '/ˌʌndərˈstænd/', 'I understand now.'],
    ['practice', '练习', '/ˈpræktɪs/', 'Practice makes perfect.'],
    ['improve', '提升', '/ɪmˈpruv/', 'I want to improve my English.'],
    ['culture', '文化', '/ˈkʌltʃər/', 'Culture shapes how we think.'],
  ];
  const jaWords: [string, string, string, string][] = [
    ['こんにちは', '你好', 'kon-ni-chi-wa', 'こんにちは、元気ですか。'],
    ['ありがとう', '谢谢', 'a-ri-ga-tō', 'ありがとうございます。'],
    ['さようなら', '再见', 'sa-yō-na-ra', 'さようなら、また明日。'],
    ['はい', '是', 'hai', 'はい、そうです。'],
    ['いいえ', '不是', 'i-i-e', 'いいえ、違います。'],
    ['水', '水', 'mi-zu', '水をください。'],
    ['食べる', '吃', 'ta-be-ru', '朝ごはんを食べます。'],
    ['飲む', '喝', 'no-mu', 'コーヒーを飲みます。'],
    ['行く', '去', 'i-ku', '学校に行きます。'],
    ['見る', '看', 'mi-ru', '映画を見ます。'],
    ['聞く', '听', 'ki-ku', '音楽を聞きます。'],
    ['話す', '说', 'ha-na-su', '日本語を話します。'],
    ['書く', '写', 'ka-ku', '手紙を書きます。'],
    ['読む', '读', 'yo-mu', '本を読みます。'],
    ['学生', '学生', 'ga-ku-sei', '私は学生です。'],
    ['先生', '老师', 'sen-sei', '先生はとても親切です。'],
    ['友達', '朋友', 'to-mo-da-chi', '友達と遊びます。'],
    ['学校', '学校', 'gak-kō', '学校は遠いです。'],
    ['天気', '天气', 'ten-ki', 'いい天気ですね。'],
    ['旅行', '旅行', 'ryo-kō', '日本に旅行したい。'],
  ];
  const koWords: [string, string, string, string][] = [
    ['안녕하세요', '你好', 'an-nyeong-ha-se-yo', '안녕하세요, 만나서 반갑습니다.'],
    ['감사합니다', '谢谢', 'gam-sa-ham-ni-da', '정말 감사합니다.'],
    ['안녕히 가세요', '再见', 'an-nyeong-hi ga-se-yo', '안녕히 가세요, 내일 봐요.'],
    ['네', '是', 'ne', '네, 맞아요.'],
    ['아니요', '不是', 'a-ni-yo', '아니요, 그렇지 않아요.'],
    ['물', '水', 'mul', '물 한 잔 주세요.'],
    ['밥', '饭', 'bap', '밥을 먹어요.'],
    ['학교', '学校', 'hak-gyo', '학교에 가요.'],
    ['선생님', '老师', 'seon-saeng-nim', '선생님은 친절해요.'],
    ['학생', '学生', 'hak-saeng', '저는 학생이에요.'],
    ['친구', '朋友', 'chin-gu', '친구를 만나요.'],
    ['책', '书', 'chaek', '책을 읽어요.'],
    ['음악', '音乐', 'eu-mak', '음악을 들어요.'],
    ['영화', '电影', 'yeong-hwa', '영화를 봐요.'],
    ['여행', '旅行', 'yeo-haeng', '여행을 가요.'],
    ['사랑', '爱', 'sa-rang', '사랑해요.'],
    ['가족', '家人', 'ga-jok', '가족이 중요해요.'],
    ['날씨', '天气', 'nal-ssi', '날씨가 좋아요.'],
    ['음식', '食物', 'eum-sik', '한국 음식을 좋아해요.'],
    ['언어', '语言', 'eon-eo', '한국어를 배워요.'],
  ];
  [
    { lang: 'en', words: enWords, courseId: courseIds[0] },
    { lang: 'en', words: enWords, courseId: courseIds[1] },
    { lang: 'ja', words: jaWords, courseId: courseIds[2] },
    { lang: 'ja', words: jaWords, courseId: courseIds[3] },
    { lang: 'ko', words: koWords, courseId: courseIds[4] },
    { lang: 'ko', words: koWords, courseId: courseIds[5] },
  ].forEach(({ words, courseId, lang }) => {
    const lessons = db.prepare('SELECT id FROM lessons WHERE course_id = ?').all(courseId) as { id: number }[];
    words.forEach((w, i) => {
      const lesson = lessons[i % lessons.length];
      insertVocab.run(lesson.id, w[0], w[1], w[2], w[3], lang);
    });
  });

  // Grammar quizzes
  const insertQuiz = db.prepare(
    'INSERT INTO grammar_quizzes (lesson_id, question, options, correct_answer, explanation, language, level) VALUES (?,?,?,?,?,?,?)'
  );
  const enQuizzes: [string, string[], string, string][] = [
    ['She ___ to school every day.', ['go', 'goes', 'going', 'gone'], 'goes', '主语为第三人称单数时，动词加 -s。'],
    ['I have ___ finished my homework.', ['yet', 'already', 'ever', 'ago'], 'already', '肯定句中用 already 表示已经完成。'],
    ['This is ___ interesting book.', ['a', 'an', 'the', '-'], 'an', '以元音发音开头的单词前使用 an。'],
    ['He ___ football when it started to rain.', ['played', 'was playing', 'plays', 'is playing'], 'was playing', '过去进行时表示当时正在发生的动作。'],
    ['By next month, I ___ here for ten years.', ['work', 'will work', 'will have worked', 'worked'], 'will have worked', '将来完成时表示到将来某时已完成的动作。'],
  ];
  const jaQuizzes: [string, string[], string, string][] = [
    ['私は学生___です。', ['の', 'が', 'は', 'を'], '（不填）', '「～です」直接接名词，不需要助词。'],
    ['りんごを___ください。', ['食べ', '食べて', '食べます', '食べた'], '食べて', '「～てください」是请求句型。'],
    ['昨日、映画を___。', ['見ます', '見て', '見ました', '見よう'], '見ました', '昨天是过去，用过去式。'],
    ['田中さんは___人です。', ['優しい', '優しく', '優しさ', '優し'], '優しい', '形容词直接修饰名词。'],
    ['日本へ___ことがありますか。', ['行く', '行った', '行き', '行こう'], '行った', '「～たことがある」表示曾经做过。'],
  ];
  const koQuizzes: [string, string[], string, string][] = [
    ['저는 학생___입니다.', ['이', '가', '은', '는'], '（不填）', '입니다 直接接名词。'],
    ['커피를___ 주세요.', ['마시', '마시고', '마시-', '마신'], '마시고', '「-고 주세요」用于请求。'],
    ['어제 영화를___.', ['봐요', '봤어요', '볼 거예요', '보고'], '봤어요', '어제用过去式。'],
    ['한국어를___ 좋아해요.', ['배우', '배우고', '배워서', '배우는'], '배우고', '连接动作使用 -고。'],
    ['친구를___ 만났어요.', ['만나', '만나서', '만나고', '만난'], '만나서', '表先后顺序使用 -서。'],
  ];
  [
    { lang: 'en', level: 'A1', quizzes: enQuizzes, courseId: courseIds[0] },
    { lang: 'en', level: 'B1', quizzes: enQuizzes, courseId: courseIds[1] },
    { lang: 'ja', level: 'A1', quizzes: jaQuizzes, courseId: courseIds[2] },
    { lang: 'ja', level: 'A2', quizzes: jaQuizzes, courseId: courseIds[3] },
    { lang: 'ko', level: 'A1', quizzes: koQuizzes, courseId: courseIds[4] },
    { lang: 'ko', level: 'A2', quizzes: koQuizzes, courseId: courseIds[5] },
  ].forEach(({ quizzes, courseId, lang, level }) => {
    const lessons = db.prepare('SELECT id FROM lessons WHERE course_id = ?').all(courseId) as { id: number }[];
    quizzes.forEach((q, i) => {
      const lesson = lessons[i % lessons.length];
      insertQuiz.run(lesson.id, q[0], JSON.stringify(q[1]), q[2], q[3], lang, level);
    });
  });

  // Listening materials
  const insertListen = db.prepare(
    'INSERT INTO listening_materials (title, text_content, language, level) VALUES (?,?,?,?)'
  );
  const listenings: [string, string, string, string][] = [
    ['Morning Greetings', 'Good morning! My name is Alex. I wake up at 7 every day. After breakfast, I go to work. Today the weather is sunny and warm.', 'en', 'A1'],
    ['A Day in Tokyo', '東京へようこそ。朝、私はコンビニでおにぎりを買いました。電車に乗って仕事へ行きます。夜は友達とレストランへ行きます。', 'ja', 'A1'],
    ['Introducing Myself', '안녕하세요, 저는 민수입니다. 저는 학생이고, 서울에 삽니다. 취미는 음악 듣기와 여행이에요. 잘 부탁드립니다.', 'ko', 'A1'],
    ['Business Call', 'Hello Sarah, thank you for joining the call. As we discussed, the quarterly report needs to be submitted by next Friday.', 'en', 'B1'],
  ];
  for (const l of listenings) insertListen.run(l[0], l[1], l[2], l[3]);

  // Achievements
  const insertAchv = db.prepare(
    'INSERT INTO achievements (name, description, icon, requirement_type, requirement_value) VALUES (?,?,?,?,?)'
  );
  const achvs: any[][] = [
    ['初学者', '完成第一次词汇练习', 'Sparkles', 'vocabulary', 1],
    ['词汇达人', '学习 50 个单词', 'BookOpen', 'vocabulary', 50],
    ['语法之星', '完成 20 道语法题', 'Lightbulb', 'grammar', 20],
    ['听力能手', '完成 10 次听力训练', 'Headphones', 'listening', 10],
    ['开口说', '完成 5 次口语跟读', 'Mic', 'speaking', 5],
    ['坚持不懈', '连续学习 7 天', 'Flame', 'streak', 7],
    ['社区贡献者', '发布 5 条社区帖子', 'MessageCircle', 'posts', 5],
    ['语言大师', '累计获得 1000 XP', 'Trophy', 'xp', 1000],
  ];
  for (const a of achvs) insertAchv.run(...a);

  // Sample community posts
  const insertPost = db.prepare(
    'INSERT INTO posts (user_id, title, content, language, likes) VALUES (?,?,?,?,?)'
  );
  const sampleUser = db
    .prepare('SELECT id FROM users ORDER BY id ASC LIMIT 1')
    .get() as { id: number } | undefined;
  if (sampleUser) {
    const posts: any[][] = [
      [sampleUser.id, '学习打卡 Day 30', '坚持一个月了！从完全零基础到能说简单句子，真的很有成就感。给大家的建议是每天复习比突击有效。', 'general', 42],
      [sampleUser.id, '日语五十音记忆技巧', '把每一行假名编成故事来记忆，效果比机械重复好很多。比如「あいうえお」编成一个小故事。', 'ja', 28],
      [sampleUser.id, '韩国语发音难点讨论', 'ㄱ/ㄲ/ㅋ 三者的发音区别困扰我好久，终于找到方法：松音、紧音、送气音的对比练习。', 'ko', 17],
      [sampleUser.id, '推荐一部英语学习的美剧', '《Friends》虽然老，但台词生活化、语速适中，非常适合中级学习者练听力和口语。', 'en', 55],
      [sampleUser.id, '大家每天学多久？', '最近在考虑每天安排 30 分钟还是 60 分钟更有效。想听听大家的学习节奏。', 'general', 9],
    ];
    for (const p of posts) insertPost.run(...p);
  }
}
