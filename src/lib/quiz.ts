import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';
import {
  QuizModule,
  QuizQuestion,
  QuizAnswer,
  QuizAttempt,
  QuizProgress,
  QuizAnalytics
} from '../types/quiz';

const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export async function getQuizModules(): Promise<QuizModule[]> {
  const { data, error } = await supabase
    .from('quiz_modules')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getQuizModule(id: string): Promise<QuizModule | null> {
  const { data, error } = await supabase
    .from('quiz_modules')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function getQuizQuestions(moduleId: string): Promise<QuizQuestion[]> {
  const { data, error } = await supabase
    .from('quiz_questions')
    .select(`
      *,
      answers:quiz_answers(*)
    `)
    .eq('module_id', moduleId)
    .order('order_num', { ascending: true });

  if (error) throw error;
  return data;
}

export async function createQuizAttempt(
  userId: string,
  moduleId: string
): Promise<QuizAttempt> {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .insert({
      user_id: userId,
      module_id: moduleId,
      status: 'in_progress'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function submitQuizAnswer(
  attemptId: string,
  questionId: string,
  answerId: string,
  timeTaken: number
): Promise<void> {
  const { data: question } = await supabase
    .from('quiz_questions')
    .select('points')
    .eq('id', questionId)
    .single();

  const { data: answer } = await supabase
    .from('quiz_answers')
    .select('is_correct')
    .eq('id', answerId)
    .single();

  const pointsEarned = answer?.is_correct ? question?.points || 0 : 0;

  const { error } = await supabase.rpc('submit_quiz_answer', {
    p_attempt_id: attemptId,
    p_question_id: questionId,
    p_answer_id: answerId,
    p_time_taken: timeTaken,
    p_points_earned: pointsEarned
  });

  if (error) throw error;
}

export async function completeQuizAttempt(attemptId: string): Promise<void> {
  const { error } = await supabase.rpc('complete_quiz_attempt', {
    p_attempt_id: attemptId
  });

  if (error) throw error;
}

export async function getQuizProgress(
  userId: string,
  moduleId: string
): Promise<QuizProgress | null> {
  const { data, error } = await supabase
    .from('quiz_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('module_id', moduleId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function getQuizAnalytics(moduleId: string): Promise<QuizAnalytics | null> {
  const { data, error } = await supabase
    .from('quiz_analytics')
    .select('*')
    .eq('module_id', moduleId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}