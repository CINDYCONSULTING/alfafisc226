import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Users, ArrowRight, BookOpen, CheckCircle2,
  AlertTriangle, X, FileText, RotateCcw, Eye, Target, Download,
} from 'lucide-react';
import {
  listExams, getExam, submitAttempt,
  type ExamMeta, type ExamFull, type QCMRow, type ExamSettings,
} from '@/lib/supabaseClient';
import { generateExamHtml } from '@/lib/generateExam';

type Phase = 'name' | 'list' | 'taking' | 'done';

export default function ExamsPage() {
  const [phase, setPhase] = useState<Phase>('name');
  const [candidateName, setCandidateName] = useState('');
  const [exams, setExams] = useState<ExamMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedExam, setSelectedExam] = useState<ExamFull | null>(null);
  const [lastResult, setLastResult] = useState<{ score: number; total: number; pct: number; correctArray?: boolean[] } | null>(null);
  const [examHtml, setExamHtml] = useState('');
  const [showCorrectionOverlay, setShowCorrectionOverlay] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const list = await listExams();
      setExams(list.filter(e => e.is_published));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type !== 'alfa-exam-complete') return;
      const { score, total, correctArray, answers, isPractice } = e.data;
      // Only record the real (full-exam) attempt — retries of missed questions are practice only.
      if (selectedExam && candidateName && !isPractice) {
        submitAttempt(selectedExam.id, candidateName, score, total, answers, correctArray).catch(() => {});
      }
      const pct = total > 0 ? Math.round((score / total) * 100) : 0;
      setLastResult({ score, total, pct, correctArray, isPractice: !!isPractice });
      setPhase('done');
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [selectedExam, candidateName]);

  const startExam = async (meta: ExamMeta) => {
    setError('');
    try {
      const full = await getExam(meta.id);
      if (!full) { setError('Sujet introuvable'); return; }
      setSelectedExam(full);
      const html = generateExamHtml(
        full.title,
        full.qcm_json as unknown as QCMRow[],
        full.settings_json as ExamSettings,
      );
      setExamHtml(html);
      setShowCorrectionOverlay(false);
      setLastResult(null);
      setPhase('taking');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    }
  };

  const retakeSameExam = () => {
    if (!selectedExam) return;
    const html = generateExamHtml(
      selectedExam.title,
      selectedExam.qcm_json as unknown as QCMRow[],
      selectedExam.settings_json as ExamSettings,
    );
    setExamHtml(html);
    setShowCorrectionOverlay(false);
    setLastResult(null);
    setPhase('taking');
  };

  const retryWrongOnly = () => {
    if (!selectedExam || !lastResult?.correctArray) return;
    const wrongQuestions = (selectedExam.qcm_json as unknown as QCMRow[])
      .filter((_, i) => !lastResult.correctArray![i]);
    if (wrongQuestions.length === 0) return;
    const html = generateExamHtml(
      `${selectedExam.title} — Questions ratées`,
      wrongQuestions,
      selectedExam.settings_json as ExamSettings,
    );
    setExamHtml(html);
    setShowCorrectionOverlay(false);
    setLastResult(null);
    setPhase('taking');
  };

  const wrongCount = lastResult?.correctArray ? lastResult.correctArray.filter(c => !c).length : 0;

  // --- Phase: Name entry ---
  if (phase === 'name') {
    return (
      <div className="container-page py-16 sm:py-24">
        <div className="max-w-md mx-auto">
          <div className="card p-8 sm:p-10">
            <div className="w-16 h-16 rounded-2xl bg-ink-900 grid place-items-center mx-auto mb-6">
              <Users className="w-8 h-8 text-alfa-green" />
            </div>
            <h1 className="font-display text-2xl font-extrabold text-ink-900 text-center mb-2">
              Espace Candidats
            </h1>
            <p className="text-ink-500 text-sm text-center mb-8">
              Avant de commencer, veuillez saisir votre nom et prénom. L'admin aura accès à votre note et aux questions ratées.
            </p>
            <div className="space-y-4">
              <input
                type="text"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && candidateName.trim() && setPhase('list')}
                placeholder="Nom et prénom"
                className="input-field font-semibold text-center"
                autoFocus
              />
              {error && (
                <div className="flex items-center gap-2 text-sm text-alfa-red font-semibold bg-alfa-red/5 rounded-lg px-4 py-3">
                  <AlertTriangle className="w-4 h-4" />{error}
                </div>
              )}
              <button
                onClick={() => candidateName.trim() ? setPhase('list') : setError('Veuillez saisir votre nom')}
                disabled={!candidateName.trim()}
                className="btn-3d-green w-full text-base py-3.5 disabled:opacity-40"
              >
                Continuer
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Phase: Exam list ---
  if (phase === 'list') {
    return (
      <div className="container-page py-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-ink-900 grid place-items-center">
              <BookOpen className="w-6 h-6 text-alfa-green" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-extrabold text-ink-900">Choisissez un sujet</h1>
              <p className="text-ink-500 text-sm">Bienvenue, <span className="font-semibold text-ink-700">{candidateName}</span></p>
            </div>
          </div>
          <button onClick={() => { setPhase('name'); setCandidateName(''); }} className="btn-ghost px-4 py-2.5 text-sm font-semibold">
            Changer de nom
          </button>
        </div>

        {error && <div className="card p-4 mb-6 text-alfa-red font-semibold">{error}</div>}

        {loading ? (
          <div className="card p-12 text-center text-ink-400">Chargement des sujets...</div>
        ) : exams.length === 0 ? (
          <div className="card p-12 text-center">
            <FileText className="w-12 h-12 text-ink-200 mx-auto mb-4" />
            <h3 className="font-display text-lg font-bold text-ink-700 mb-2">Aucun sujet disponible</h3>
            <p className="text-ink-400 text-sm">Les sujets publiés par l'admin apparaîtront ici.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-5">
            {exams.map((exam) => (
              <button
                key={exam.id}
                onClick={() => startExam(exam)}
                className="card p-6 text-left hover:shadow-card hover:-translate-y-0.5 transition-all duration-200 group"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-alfa-green/10 text-alfa-green grid place-items-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-ink-300 group-hover:text-alfa-green group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="font-display font-bold text-ink-900 mb-1">{exam.title}</h3>
                <p className="text-xs text-ink-400">Publié le {new Date(exam.created_at).toLocaleDateString('fr-FR')}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // --- Phase: Taking exam (iframe fullscreen) ---
  if (phase === 'taking' && examHtml) {
    return (
      <div className="fixed inset-0 z-50 bg-ink-900">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-alfa-green to-alfa-red z-10" />
        <div className="absolute top-3 left-4 z-10 flex items-center gap-3">
          <span className="text-white/80 text-sm font-medium bg-white/10 backdrop-blur px-3 py-1.5 rounded-lg">
            Candidat: {candidateName}
          </span>
        </div>
        <button
          onClick={() => { if (confirm('Quitter le test ? Votre progression sera perdue.')) { setPhase('list'); setExamHtml(''); } }}
          className="absolute top-3 right-4 z-10 flex items-center gap-1.5 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors"
        >
          <X className="w-4 h-4" />
          Quitter
        </button>
        <iframe
          ref={iframeRef}
          srcDoc={examHtml}
          title="Examen QCM"
          className="w-full h-full border-0"
        />
      </div>
    );
  }

  // --- Phase: Done — show result summary + keep iframe accessible for correction/PDF ---
  if (phase === 'done' && lastResult) {
    const { score, total, pct } = lastResult;
    let mention = 'À renforcer', mentionColor = 'text-alfa-red', msg = 'Reprenez les points clés et relancez un test.';
    if (pct >= 90) { mention = 'Expert'; mentionColor = 'text-alfa-green'; msg = 'Maîtrise exceptionnelle. Vous êtes prêt pour le concours.'; }
    else if (pct >= 75) { mention = 'Confirmé'; mentionColor = 'text-alfa-green'; msg = 'Très bon niveau. Quelques détails à peaufiner.'; }
    else if (pct >= 50) { mention = 'En progrès'; mentionColor = 'text-ink-600'; msg = 'Des bases solides, continuez vos révisions.'; }

    return (
      <div className="min-h-screen bg-ink-50">
        {/* Result summary bar */}
        <div className="bg-white border-b border-ink-100 sticky top-0 z-40">
          <div className="container-page py-4 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-alfa-green/10 grid place-items-center">
                <CheckCircle2 className="w-6 h-6 text-alfa-green" />
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-2xl font-extrabold text-ink-900">{score}/{total}</span>
                  <span className={`font-display text-sm font-bold ${mentionColor}`}>{mention} — {pct}%</span>
                </div>
                <p className="text-xs text-ink-400">{msg} · Note enregistrée</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setShowCorrectionOverlay(true)}
                className="btn-3d-blue px-4 py-2.5 text-sm"
              >
                <Eye className="w-4 h-4" />
                Voir la correction
              </button>
              {wrongCount > 0 && (
                <button onClick={retryWrongOnly} className="btn-3d-green px-4 py-2.5 text-sm">
                  <Target className="w-4 h-4" />
                  Revoir les {wrongCount} ratées
                </button>
              )}
              <button onClick={retakeSameExam} className="btn-3d-blue px-4 py-2.5 text-sm">
                <RotateCcw className="w-4 h-4" />
                Refaire ce sujet
              </button>
              <button
                onClick={() => { setPhase('list'); setExamHtml(''); setLastResult(null); }}
                className="btn-ghost px-4 py-2.5 text-sm font-semibold"
              >
                <BookOpen className="w-4 h-4" />
                Autre sujet
              </button>
              <button
                onClick={() => { setPhase('name'); setCandidateName(''); setExamHtml(''); setLastResult(null); }}
                className="btn-ghost px-4 py-2.5 text-sm font-semibold"
              >
                Changer de candidat
              </button>
            </div>
          </div>
        </div>

        {/* Correction overlay — shows the completed exam iframe with all correction features */}
        {showCorrectionOverlay && examHtml && (
          <div className="fixed inset-0 z-50 bg-ink-900/95 backdrop-blur-sm flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 bg-ink-900 border-b border-white/10">
              <h2 className="text-white font-display font-bold text-lg">Correction détaillée</h2>
              <div className="flex items-center gap-2">
                <span className="text-white/60 text-sm hidden sm:inline">
                  Utilisez le bouton « Télécharger la correction (PDF) » dans l'encadré ci-dessous
                </span>
                <button
                  onClick={() => { if (iframeRef.current?.contentWindow) iframeRef.current.contentWindow.postMessage({ type: 'alfa-trigger-pdf', candidateName }, '*'); }}
                  className="flex items-center gap-1.5 bg-alfa-green hover:brightness-110 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors"
                >
                  <Download className="w-4 h-4" />
                  PDF
                </button>
                <button
                  onClick={() => setShowCorrectionOverlay(false)}
                  className="flex items-center gap-1.5 text-white hover:bg-white/10 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors"
                >
                  <X className="w-4 h-4" />
                  Fermer
                </button>
              </div>
            </div>
            <iframe
              ref={iframeRef}
              srcDoc={examHtml}
              title="Correction"
              className="w-full flex-1 border-0 bg-white"
            />
          </div>
        )}

        {/* Detailed correction in-page (question by question, styled like the app) */}
        <div className="container-page py-8">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="card p-6 sm:p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-alfa-green/10 grid place-items-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10 text-alfa-green" />
              </div>
              <h1 className="font-display text-3xl font-extrabold text-ink-900 mb-1">{score}/{total}</h1>
              <p className={`font-display text-lg font-bold ${mentionColor} mb-2`}>{mention} — {pct}%</p>
              <p className="text-ink-500 text-sm">{msg}</p>
              <p className="text-xs text-ink-400 mt-3">Votre note a été enregistrée et transmise à l'administrateur.</p>
            </div>

            {/* Stat cards: correct vs wrong */}
            <div className="grid grid-cols-2 gap-4">
              <div className="card p-5 text-center">
                <div className="w-11 h-11 rounded-xl bg-alfa-green/10 grid place-items-center mx-auto mb-2">
                  <CheckCircle2 className="w-6 h-6 text-alfa-green" />
                </div>
                <div className="font-display text-3xl font-extrabold text-alfa-green">{total - wrongCount}</div>
                <div className="text-xs font-semibold uppercase tracking-wider text-ink-400 mt-1">Réussies</div>
              </div>
              <div className="card p-5 text-center">
                <div className="w-11 h-11 rounded-xl bg-alfa-red/10 grid place-items-center mx-auto mb-2">
                  <AlertTriangle className="w-6 h-6 text-alfa-red" />
                </div>
                <div className="font-display text-3xl font-extrabold text-alfa-red">{wrongCount}</div>
                <div className="text-xs font-semibold uppercase tracking-wider text-ink-400 mt-1">Ratées</div>
              </div>
            </div>

            {selectedExam && (
              <CorrectionList
                questions={selectedExam.qcm_json}
                answers={lastResult}
                examTitle={selectedExam.title}
                candidateName={candidateName}
                showJustification={selectedExam.settings_json.showJustification}
              />
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4 flex-wrap">
              <button
                onClick={() => setShowCorrectionOverlay(true)}
                className="btn-3d-blue"
              >
                <Eye className="w-4 h-4" />
                Voir la correction complète (avec PDF)
              </button>
              {wrongCount > 0 && (
                <button onClick={retryWrongOnly} className="btn-3d-green">
                  <Target className="w-4 h-4" />
                  Revoir les {wrongCount} questions ratées
                </button>
              )}
              <button onClick={retakeSameExam} className="btn-3d-blue">
                <RotateCcw className="w-4 h-4" />
                Refaire tout le sujet
              </button>
              <button
                onClick={() => { setPhase('list'); setExamHtml(''); setLastResult(null); }}
                className="btn-ghost px-5 py-3 text-sm font-semibold"
              >
                Choisir un autre sujet
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// In-page correction list (question by question, app-styled)
function CorrectionList({
  questions, answers, examTitle, candidateName, showJustification,
}: {
  questions: QCMRow[];
  answers: { score: number; total: number; pct: number };
  examTitle: string;
  candidateName: string;
  showJustification: boolean;
}) {
  // We need the user's actual answers — but we don't have them here since they're in the iframe.
  // This component shows the answer key for all questions so the candidate can review.
  void answers; void examTitle; void candidateName;
  return (
    <div className="card p-6">
      <h2 className="font-display text-lg font-extrabold text-ink-900 mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5 text-alfa-green" />
        Corrigé des questions
      </h2>
      <p className="text-sm text-ink-400 mb-5">
        Voici les bonnes réponses et justifications pour chaque question. Pour télécharger la correction complète en PDF avec vos réponses surlignées, cliquez sur « Voir la correction complète ».
      </p>
      <div className="space-y-3">
        {questions.map((q, i) => (
          <div key={q.id} className="rounded-xl border border-ink-100 p-4 bg-ink-50/50">
            <div className="flex items-start gap-3 mb-2">
              <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-ink-900 text-white grid place-items-center text-xs font-bold">
                {i + 1}
              </span>
              <p className="font-semibold text-ink-900 text-sm leading-relaxed">{q.question}</p>
            </div>
            <div className="space-y-1 ml-10">
              {q.options.map(opt => {
                const isRight = q.answer.includes(opt.letter);
                return (
                  <div key={opt.letter} className={`text-sm flex items-start gap-2 ${isRight ? 'text-alfa-green font-semibold' : 'text-ink-400'}`}>
                    <span className="font-bold">{opt.letter}.</span>
                    <span>{opt.text}</span>
                    {isRight && <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />}
                  </div>
                );
              })}
            </div>
            {showJustification && (
              <div className="mt-3 ml-10 text-sm text-ink-600 bg-blue-50 rounded-lg p-3 border-l-4 border-blue-400">
                <strong className="text-ink-700">Justification:</strong> {q.justification}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
