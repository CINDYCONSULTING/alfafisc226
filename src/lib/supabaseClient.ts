import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const EDGE_URL = `${supabaseUrl}/functions/v1/admin-api`;

export interface ExamMeta {
  id: string;
  title: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExamFull extends ExamMeta {
  qcm_json: QCMRow[];
  settings_json: ExamSettings;
  admin_code: string;
}

export interface QCMRow {
  id: string;
  index: number;
  question: string;
  options: { letter: string; text: string }[];
  answer: string[];
  justification: string;
}

export interface ExamSettings {
  mode: 'immediate' | 'end';
  showJustification: boolean;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  durationMin: number;
}

export interface Attempt {
  id: string;
  exam_id: string;
  candidate_name: string;
  score: number;
  total: number;
  answers_json: string[][];
  correct_array: boolean[];
  started_at: string;
  finished_at: string | null;
}

const headers = () => ({
  Authorization: `Bearer ${supabaseAnonKey}`,
  'Content-Type': 'application/json',
});

export async function adminLogin(code: string): Promise<boolean> {
  const res = await fetch(`${EDGE_URL}/login`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ code }),
  });
  const data = await res.json();
  return res.ok && data.ok === true;
}

export async function listExams(): Promise<ExamMeta[]> {
  const res = await fetch(`${EDGE_URL}/exams`, { headers: headers() });
  if (!res.ok) throw new Error('Failed to load exams');
  const data = await res.json();
  return data.exams as ExamMeta[];
}

export async function getExam(id: string): Promise<ExamFull | null> {
  const { data, error } = await supabase
    .from('exams')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as ExamFull | null;
}

export async function createExam(
  title: string,
  qcmJson: QCMRow[],
  settingsJson: ExamSettings,
  isPublished = true,
): Promise<ExamMeta> {
  const res = await fetch(`${EDGE_URL}/exams`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ title, qcm_json: qcmJson, settings_json: settingsJson, is_published: isPublished }),
  });
  if (!res.ok) throw new Error('Failed to create exam');
  const data = await res.json();
  return data.exam as ExamMeta;
}

export async function updateExam(id: string, patch: Partial<ExamFull>): Promise<ExamMeta> {
  const res = await fetch(`${EDGE_URL}/exams/${id}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error('Failed to update exam');
  const data = await res.json();
  return data.exam as ExamMeta;
}

export async function deleteExam(id: string): Promise<void> {
  const res = await fetch(`${EDGE_URL}/exams/${id}`, {
    method: 'DELETE',
    headers: headers(),
  });
  if (!res.ok) throw new Error('Failed to delete exam');
}

export async function listAttempts(examId: string): Promise<Attempt[]> {
  const res = await fetch(`${EDGE_URL}/exams/${examId}/attempts`, { headers: headers() });
  if (!res.ok) throw new Error('Failed to load attempts');
  const data = await res.json();
  return data.attempts as Attempt[];
}

export async function submitAttempt(
  examId: string,
  candidateName: string,
  score: number,
  total: number,
  answersJson: string[][],
  correctArray: boolean[],
): Promise<string> {
  const res = await fetch(`${EDGE_URL}/attempts`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      exam_id: examId,
      candidate_name: candidateName,
      score,
      total,
      answers_json: answersJson,
      correct_array: correctArray,
    }),
  });
  if (!res.ok) throw new Error('Failed to submit attempt');
  const data = await res.json();
  return data.attempt.id as string;
}
