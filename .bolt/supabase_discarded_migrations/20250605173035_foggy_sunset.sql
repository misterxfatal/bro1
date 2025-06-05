/*
  # Quiz System Schema

  1. New Tables
    - `quiz_modules`
      - Core quiz metadata and settings
      - Includes title, description, category, difficulty, etc.
    
    - `quiz_questions` 
      - Individual questions for each quiz module
      - Supports multiple question types
      - Includes points, time limits, and ordering
    
    - `quiz_answers`
      - Answer options for each question
      - Tracks correct answers and explanations
    
    - `quiz_attempts`
      - Records user quiz attempts
      - Stores scores and completion status
    
    - `quiz_progress`
      - Tracks overall user progress per module
      - Stores best scores and completion status
    
    - `quiz_analytics`
      - Aggregates quiz statistics and metrics
      - Helps track module effectiveness

  2. Security
    - RLS enabled on all tables
    - Policies for user data access
    - Protected write operations
*/

-- Quiz Modules table
CREATE TABLE quiz_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL,
  difficulty text NOT NULL CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  settings jsonb DEFAULT '{}'::jsonb NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb NOT NULL
);

CREATE INDEX idx_quiz_modules_category ON quiz_modules(category);
CREATE INDEX idx_quiz_modules_difficulty ON quiz_modules(difficulty);
CREATE INDEX idx_quiz_modules_status ON quiz_modules(status);

-- Questions table
CREATE TABLE quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid REFERENCES quiz_modules(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('multiple_choice', 'true_false', 'matching')),
  question_text text NOT NULL,
  explanation text,
  points integer DEFAULT 1,
  time_limit integer DEFAULT 60,
  order_num integer NOT NULL,
  difficulty text NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  tags jsonb DEFAULT '[]'::jsonb,
  media_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(module_id, order_num)
);

CREATE INDEX idx_quiz_questions_module ON quiz_questions(module_id);
CREATE INDEX idx_quiz_questions_type ON quiz_questions(type);
CREATE INDEX idx_quiz_questions_difficulty ON quiz_questions(difficulty);

-- Answers table
CREATE TABLE quiz_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid REFERENCES quiz_questions(id) ON DELETE CASCADE,
  text text NOT NULL,
  is_correct boolean NOT NULL,
  explanation text,
  order_num integer NOT NULL,
  UNIQUE(question_id, order_num)
);

CREATE INDEX idx_quiz_answers_question ON quiz_answers(question_id);

-- Quiz Attempts table
CREATE TABLE quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id uuid REFERENCES quiz_modules(id) ON DELETE CASCADE,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  score real,
  time_taken integer,
  status text DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  answers jsonb DEFAULT '{}'::jsonb NOT NULL
);

CREATE INDEX idx_quiz_attempts_user ON quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_module ON quiz_attempts(module_id);
CREATE INDEX idx_quiz_attempts_status ON quiz_attempts(status);

-- Quiz Progress table
CREATE TABLE quiz_progress (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id uuid REFERENCES quiz_modules(id) ON DELETE CASCADE,
  best_score real DEFAULT 0,
  attempts integer DEFAULT 0,
  completed boolean DEFAULT false,
  last_attempt_at timestamptz DEFAULT now(),
  total_time integer DEFAULT 0,
  PRIMARY KEY (user_id, module_id)
);

CREATE INDEX idx_quiz_progress_user ON quiz_progress(user_id);
CREATE INDEX idx_quiz_progress_module ON quiz_progress(module_id);

-- Quiz Analytics table
CREATE TABLE quiz_analytics (
  module_id uuid PRIMARY KEY REFERENCES quiz_modules(id) ON DELETE CASCADE,
  total_attempts integer DEFAULT 0,
  average_score real DEFAULT 0,
  completion_rate real DEFAULT 0,
  average_time integer DEFAULT 0,
  question_stats jsonb DEFAULT '{}'::jsonb NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE quiz_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Quiz Modules
CREATE POLICY "Anyone can view published modules"
  ON quiz_modules FOR SELECT
  USING (status = 'published');

CREATE POLICY "Authors can manage their modules"
  ON quiz_modules FOR ALL
  USING (auth.uid() = created_by);

-- Quiz Questions
CREATE POLICY "Anyone can view questions for published modules"
  ON quiz_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM quiz_modules
      WHERE id = quiz_questions.module_id
      AND status = 'published'
    )
  );

CREATE POLICY "Authors can manage their questions"
  ON quiz_questions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM quiz_modules
      WHERE id = quiz_questions.module_id
      AND created_by = auth.uid()
    )
  );

-- Quiz Answers
CREATE POLICY "Anyone can view answers for published modules"
  ON quiz_answers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM quiz_questions q
      JOIN quiz_modules m ON m.id = q.module_id
      WHERE q.id = quiz_answers.question_id
      AND m.status = 'published'
    )
  );

CREATE POLICY "Authors can manage their answers"
  ON quiz_answers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM quiz_questions q
      JOIN quiz_modules m ON m.id = q.module_id
      WHERE q.id = quiz_answers.question_id
      AND m.created_by = auth.uid()
    )
  );

-- Quiz Attempts
CREATE POLICY "Users can view and manage their own attempts"
  ON quiz_attempts FOR ALL
  USING (auth.uid() = user_id);

-- Quiz Progress
CREATE POLICY "Users can view and manage their own progress"
  ON quiz_progress FOR ALL
  USING (auth.uid() = user_id);

-- Quiz Analytics
CREATE POLICY "Anyone can view analytics for published modules"
  ON quiz_analytics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM quiz_modules
      WHERE id = quiz_analytics.module_id
      AND status = 'published'
    )
  );

CREATE POLICY "Authors can manage analytics for their modules"
  ON quiz_analytics FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM quiz_modules
      WHERE id = quiz_analytics.module_id
      AND created_by = auth.uid()
    )
  );