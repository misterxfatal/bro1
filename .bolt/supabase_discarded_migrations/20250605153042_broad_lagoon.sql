/*
  # Quiz System Database Schema

  1. Tables
    - users: Core user data
    - quiz_modules: Quiz content and metadata
    - quiz_questions: Individual questions within modules
    - quiz_answers: Answer options for questions
    - quiz_attempts: User attempts at quizzes
    - quiz_progress: User progress tracking
    - quiz_analytics: Module performance analytics
  
  2. Security
    - RLS enabled on all tables
    - Policies for authenticated access
    - Public read access for published content
*/

-- Create users table first since it's referenced by foreign keys
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quiz Modules
CREATE TABLE IF NOT EXISTS quiz_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')) NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
  settings JSONB NOT NULL DEFAULT '{}',
  metadata JSONB NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_quiz_modules_category ON quiz_modules(category);
CREATE INDEX IF NOT EXISTS idx_quiz_modules_difficulty ON quiz_modules(difficulty);
CREATE INDEX IF NOT EXISTS idx_quiz_modules_status ON quiz_modules(status);

-- Quiz Questions
CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL,
  type TEXT CHECK (type IN ('multiple_choice', 'true_false', 'matching')) NOT NULL,
  question_text TEXT NOT NULL,
  explanation TEXT,
  points INTEGER DEFAULT 1,
  time_limit INTEGER DEFAULT 60,
  order_num INTEGER NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')) NOT NULL,
  tags JSONB DEFAULT '[]',
  media_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (module_id) REFERENCES quiz_modules(id) ON DELETE CASCADE,
  UNIQUE(module_id, order_num)
);

CREATE INDEX IF NOT EXISTS idx_quiz_questions_module ON quiz_questions(module_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_type ON quiz_questions(type);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_difficulty ON quiz_questions(difficulty);

-- Quiz Answers
CREATE TABLE IF NOT EXISTS quiz_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL,
  text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  explanation TEXT,
  order_num INTEGER NOT NULL,
  FOREIGN KEY (question_id) REFERENCES quiz_questions(id) ON DELETE CASCADE,
  UNIQUE(question_id, order_num)
);

CREATE INDEX IF NOT EXISTS idx_quiz_answers_question ON quiz_answers(question_id);

-- Quiz Attempts
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  module_id UUID NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  score REAL,
  time_taken INTEGER,
  status TEXT CHECK (status IN ('in_progress', 'completed', 'abandoned')) DEFAULT 'in_progress',
  answers JSONB NOT NULL DEFAULT '{}',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (module_id) REFERENCES quiz_modules(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_module ON quiz_attempts(module_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_status ON quiz_attempts(status);

-- Quiz Progress
CREATE TABLE IF NOT EXISTS quiz_progress (
  user_id UUID NOT NULL,
  module_id UUID NOT NULL,
  best_score REAL DEFAULT 0,
  attempts INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  last_attempt_at TIMESTAMPTZ DEFAULT NOW(),
  total_time INTEGER DEFAULT 0,
  PRIMARY KEY (user_id, module_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (module_id) REFERENCES quiz_modules(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_quiz_progress_user ON quiz_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_progress_module ON quiz_progress(module_id);

-- Quiz Analytics
CREATE TABLE IF NOT EXISTS quiz_analytics (
  module_id UUID PRIMARY KEY,
  total_attempts INTEGER DEFAULT 0,
  average_score REAL DEFAULT 0,
  completion_rate REAL DEFAULT 0,
  average_time INTEGER DEFAULT 0,
  question_stats JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (module_id) REFERENCES quiz_modules(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public users can read published modules"
  ON quiz_modules FOR SELECT
  TO authenticated
  USING (status = 'published');

CREATE POLICY "Public users can read questions for published modules"
  ON quiz_questions FOR SELECT
  TO authenticated
  USING (
    module_id IN (
      SELECT id FROM quiz_modules 
      WHERE status = 'published'
    )
  );

CREATE POLICY "Public users can read answers for published modules"
  ON quiz_answers FOR SELECT
  TO authenticated
  USING (
    question_id IN (
      SELECT id FROM quiz_questions 
      WHERE module_id IN (
        SELECT id FROM quiz_modules 
        WHERE status = 'published'
      )
    )
  );

CREATE POLICY "Users can read their own attempts"
  ON quiz_attempts FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::uuid);

CREATE POLICY "Users can create attempts"
  ON quiz_attempts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid()::uuid);

CREATE POLICY "Users can read their own progress"
  ON quiz_progress FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::uuid);

CREATE POLICY "Users can update their own progress"
  ON quiz_progress FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid()::uuid);

-- Create view for module statistics
CREATE OR REPLACE VIEW v_quiz_module_stats AS
SELECT 
  qm.id,
  qm.title,
  qm.category,
  qm.difficulty,
  COUNT(DISTINCT qq.id) as question_count,
  COUNT(DISTINCT qa.id) as attempt_count,
  AVG(qa.score) as average_score,
  COUNT(DISTINCT CASE WHEN qp.completed THEN qp.user_id END) as completion_count
FROM quiz_modules qm
LEFT JOIN quiz_questions qq ON qm.id = qq.module_id
LEFT JOIN quiz_attempts qa ON qm.id = qa.module_id
LEFT JOIN quiz_progress qp ON qm.id = qp.module_id
GROUP BY qm.id;