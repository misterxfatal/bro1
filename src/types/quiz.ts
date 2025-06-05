// Quiz system type definitions
export interface QuizModule {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  created_by: string;
  created_at: string;
  updated_at: string;
  status: 'draft' | 'published' | 'archived';
  settings: QuizSettings;
  metadata: QuizMetadata;
}

export interface QuizSettings {
  time_limit: number;
  passing_score: number;
  randomize_questions: boolean;
  show_instant_feedback: boolean;
  allow_review: boolean;
  max_attempts: number;
  xp_reward: number;
}

export interface QuizMetadata {
  total_questions: number;
  total_points: number;
  average_completion_time: number;
  completion_count: number;
  average_score: number;
}

export interface QuizQuestion {
  id: string;
  module_id: string;
  type: 'multiple_choice' | 'true_false' | 'matching';
  question_text: string;
  explanation: string;
  points: number;
  time_limit: number;
  order: number;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  media_url?: string;
  created_at: string;
  updated_at: string;
}

export interface QuizAnswer {
  id: string;
  question_id: string;
  text: string;
  is_correct: boolean;
  explanation?: string;
  order: number;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  module_id: string;
  started_at: string;
  completed_at?: string;
  score: number;
  time_taken: number;
  answers: QuizAttemptAnswer[];
  status: 'in_progress' | 'completed' | 'abandoned';
}

export interface QuizAttemptAnswer {
  question_id: string;
  answer_id: string;
  is_correct: boolean;
  time_taken: number;
  points_earned: number;
}

export interface QuizProgress {
  user_id: string;
  module_id: string;
  best_score: number;
  attempts: number;
  completed: boolean;
  last_attempt_at: string;
  total_time: number;
}

export interface QuizAnalytics {
  module_id: string;
  total_attempts: number;
  average_score: number;
  completion_rate: number;
  average_time: number;
  question_stats: QuestionStats[];
}

export interface QuestionStats {
  question_id: string;
  correct_attempts: number;
  total_attempts: number;
  average_time: number;
  difficulty_rating: number;
}