export interface User {
  id: string;
  username: string;
  xp: number;
  lastLogin: string;
  role: 'admin' | 'user';
}

export interface Module {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  xp_reward: number;
  time_limit?: number;
  created_by?: string;
  created_at?: string;
  passing_score: number;
  randomize: boolean;
  instant_feedback: boolean;
}

export interface Question {
  id: string;
  module_id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation?: string;
  time_limit?: number;
  question_order: number;
}

export interface Progress {
  user_id: string;
  module_id: string;
  module_title?: string;
  completed: boolean;
  score: number;
  last_attempt: string;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  xp: number;
  modules_completed: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  requirement: string;
  requirement_value: number;
  earned_at?: string;
}

export interface AuthContextType {
  currentUser: User | null;
  login: (username: string, password: string) => Promise<User | null>;
  register: (username: string, password: string) => Promise<User | null>;
  logout: () => void;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
  isAdmin: boolean;
}