-- ============================================================
-- jungs-quiz Supabase Schema
-- ============================================================
-- Supabase SQL Editor에서 실행하세요.
-- ============================================================

-- 1. 과목
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  subtitle TEXT DEFAULT '',
  quiz_types JSONB NOT NULL DEFAULT '[]',
  ai_description TEXT DEFAULT '',
  ai_file_content TEXT DEFAULT '',
  default_days INTEGER DEFAULT 20,
  default_questions INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Day (과목 하위)
CREATE TABLE days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  lesson TEXT DEFAULT '',
  title TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  ai_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(subject_id, day_number)
);

-- 3. 문제
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id UUID NOT NULL REFERENCES days(id) ON DELETE CASCADE,
  template_id TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. 학생
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject_ids UUID[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. 시험 결과
CREATE TABLE results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  day_id UUID NOT NULL REFERENCES days(id) ON DELETE CASCADE,
  template_id TEXT NOT NULL,
  score INTEGER NOT NULL,
  total INTEGER NOT NULL,
  details TEXT DEFAULT '',
  submitted_at TIMESTAMPTZ DEFAULT now()
);

-- 6. 설정 (API 키 등)
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- 7. 채팅 메시지 (관리자↔학생)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  title TEXT DEFAULT '',
  content TEXT NOT NULL,
  sender_type TEXT NOT NULL DEFAULT 'admin',
  sender_name TEXT DEFAULT '',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. 공지사항
CREATE TABLE notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 인덱스
-- ============================================================
CREATE INDEX idx_days_subject ON days(subject_id);
CREATE INDEX idx_questions_day ON questions(day_id);
CREATE INDEX idx_results_student ON results(student_id);
CREATE INDEX idx_results_day ON results(day_id);
CREATE INDEX idx_results_submitted ON results(submitted_at DESC);
CREATE INDEX idx_messages_student ON messages(student_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);
CREATE INDEX idx_notices_created ON notices(created_at DESC);

-- ============================================================
-- RLS (Row Level Security)
-- ============================================================
-- 학생용: 읽기만 허용
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE days ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;

-- anon(비인증) 사용자: 읽기 전용
CREATE POLICY "subjects_read" ON subjects FOR SELECT TO anon USING (is_active = true);
CREATE POLICY "days_read" ON days FOR SELECT TO anon USING (true);
CREATE POLICY "questions_read" ON questions FOR SELECT TO anon USING (true);
CREATE POLICY "students_read" ON students FOR SELECT TO anon USING (is_active = true);
CREATE POLICY "results_insert" ON results FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "results_read" ON results FOR SELECT TO anon USING (true);

-- 인증된 사용자(관리자): 전체 CRUD
CREATE POLICY "subjects_admin" ON subjects FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "days_admin" ON days FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "questions_admin" ON questions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "students_admin" ON students FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "results_admin" ON results FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "settings_admin" ON settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 메시지: anon 읽기/쓰기 (학생이 채팅 가능)
CREATE POLICY "messages_read" ON messages FOR SELECT TO anon USING (true);
CREATE POLICY "messages_insert" ON messages FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "messages_admin" ON messages FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 공지: anon 읽기만
CREATE POLICY "notices_read" ON notices FOR SELECT TO anon USING (is_active = true);
CREATE POLICY "notices_admin" ON notices FOR ALL TO authenticated USING (true) WITH CHECK (true);
