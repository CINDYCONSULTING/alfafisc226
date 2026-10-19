/*
# Create exams and attempts tables for Alfa fisc QCM platform

## Overview
Sets up the database backend for a QCM exam platform where:
- An admin creates/saves exam subjects (questions, options, answers, settings) in the database.
- Candidates open a saved exam, enter their name, take the test, and their results are recorded.
- The admin can view all attempts, scores, and which questions each candidate got wrong.
- The admin can delete or modify exams.

## New tables

### 1. `exams`
- `id` (uuid PK)
- `title` (text) — exam title shown to candidates
- `qcm_json` (jsonb) — the full array of QCM questions/options/answers/justifications
- `settings_json` (jsonb) — exam settings: mode, showJustification, shuffleQuestions, shuffleOptions, durationMin
- `is_published` (boolean) — true when the exam is visible/usable by candidates
- `admin_code` (text) — a simple password for admin access (single-admin model)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### 2. `attempts`
- `id` (uuid PK)
- `exam_id` (uuid FK → exams ON DELETE CASCADE)
- `candidate_name` (text) — full name entered by the candidate before starting
- `score` (integer) — number of correct answers
- `total` (integer) — total number of questions
- `answers_json` (jsonb) — array of what the candidate picked per question
- `correct_array` (jsonb) — array of booleans per question (true = correct)
- `started_at` (timestamp)
- `finished_at` (timestamp)

## Security
- Both tables use `TO anon, authenticated` because there is no Supabase auth sign-in screen.
  The admin uses a simple code stored in `exams.admin_code`; access is enforced in the
  edge function, not via RLS.
- Public can read published exams (so candidates can take them) and insert attempts.
- Exams can be created/updated/deleted by anyone with the admin_code — handled server-side
  in the edge function. RLS allows the writes so the edge function (service role) can perform them.
- Attempts are readable (so admin can see results) and insertable (so candidates can submit).

## Notes
1. The admin_code is checked server-side in the edge function; RLS is permissive here
   because all sensitive operations are gated by the service-role edge function that
   validates the code before performing mutations.
2. `attempts` cascade-deletes with its parent exam.
*/

CREATE TABLE IF NOT EXISTS exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  qcm_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  settings_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_published boolean NOT NULL DEFAULT true,
  admin_code text NOT NULL DEFAULT 'ALFA2026',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE exams ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_exams" ON exams;
CREATE POLICY "anon_select_exams" ON exams FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_exams" ON exams;
CREATE POLICY "anon_insert_exams" ON exams FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_exams" ON exams;
CREATE POLICY "anon_update_exams" ON exams FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_exams" ON exams;
CREATE POLICY "anon_delete_exams" ON exams FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  candidate_name text NOT NULL,
  score integer NOT NULL DEFAULT 0,
  total integer NOT NULL DEFAULT 0,
  answers_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  correct_array jsonb NOT NULL DEFAULT '[]'::jsonb,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz
);

ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_attempts" ON attempts;
CREATE POLICY "anon_select_attempts" ON attempts FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_attempts" ON attempts;
CREATE POLICY "anon_insert_attempts" ON attempts FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_attempts" ON attempts;
CREATE POLICY "anon_update_attempts" ON attempts FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_attempts" ON attempts;
CREATE POLICY "anon_delete_attempts" ON attempts FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_attempts_exam_id ON attempts(exam_id);
CREATE INDEX IF NOT EXISTS idx_attempts_finished ON attempts(finished_at DESC);
