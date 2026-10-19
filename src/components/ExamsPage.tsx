import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Users, ArrowRight, ArrowLeft, BookOpen, Clock, Shuffle, CheckCircle2,
  AlertTriangle, Play, X, FileText, Eye,
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
  const [lastResult, setLastResult] = useState<{ score: number; total: number; pct: number } | null>(null);
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

  // Listen for exam completion from iframe
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type !== 'alfa-exam-complete') return;
      const { score, total, correctArray, answers, candidateName: name } = e.data;
      if (selectedExam && candidateName) {
        submitAttempt(selectedExam.id, candidateName, score, total, answers, correctArray).catch(() => {});
      }
      const pct = total > 0 ? Math.round((score / total) * 100) : 0;
      setLastResult({ score, total, pct });
      setPhase('done');
      void name;
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
      setPhase('taking');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    }
  };

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

  // --- Phase: Taking exam ---
  if (phase === 'taking' && selectedExam) {
    const html = generateExamHtml(
      selectedExam.title,
      selectedExam.qcm_json as unknown as QCMRow[] & { options: { letter: string; text: string }[]; answer: string[]; id: string; index: number; question: string; justification: string }[],
      selectedExam.settings_json as ExamSettings,
    );
    return (
      <div className="fixed inset-0 z-50 bg-ink-900">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-alfa-green to-alfa-red z-10" />
        <div className="absolute top-3 left-4 z-10 flex items-center gap-3">
          <span className="text-white/80 text-sm font-medium bg-white/10 backdrop-blur px-3 py-1.5 rounded-lg">
            Candidat: {candidateName}
          </span>
        </div>
        <button
          onClick={() => { if (confirm('Quitter le test ? Votre progression sera perdue.')) setPhase('list'); }}
          className="absolute top-3 right-4 z-10 flex items-center gap-1.5 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors"
        >
          <X className="w-4 h-4" />
          Quitter
        </button>
        <iframe
          ref={iframeRef}
          srcDoc={html}
          title="Examen QCM"
          className="w-full h-full border-0"
        />
      </div>
    );
  }

  // --- Phase: Done ---
  if (phase === 'done' && lastResult) {
    const { score, total, pct } = lastResult;
    let mention = 'À renforcer', mentionColor = 'text-alfa-red', msg = 'Reprenez les points clés et relancez un test.';
    if (pct >= 90) { mention = 'Expert'; mentionColor = 'text-alfa-green'; msg = 'Maîtrise exceptionnelle. Vous êtes prêt pour le concours.'; }
    else if (pct >= 75) { mention = 'Confirmé'; mentionColor = 'text-alfa-green'; msg = 'Très bon niveau. Quelques détails à peaufiner.'; }
    else if (pct >= 50) { mention = 'En progrès'; mentionColor = 'text-ink-600'; msg = 'Des bases solides, continuez vos révisions.'; }

    return (
      <div className="container-page py-16 sm:py-24">
        <div className="max-w-md mx-auto text-center">
          <div className="card p-8 sm:p-10">
            <div className="w-20 h-20 rounded-full bg-alfa-green/10 grid place-items-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-alfa-green" />
            </div>
            <h1 className="font-display text-3xl font-extrabold text-ink-900 mb-2">{score}/{total}</h1>
            <p className={`font-display text-lg font-bold ${mentionColor} mb-3`}>{mention} — {pct}%</p>
            <p className="text-ink-500 text-sm mb-2">{msg}</p>
            <p className="text-xs text-ink-400 mb-8">Votre note a été enregistrée et transmise à l'administrateur.</p>
            <div className="space-y-3">
              <button onClick={() => { setLastResult(null); setPhase('list'); }} className="btn-3d-green w-full">
                <BookOpen className="w-4 h-4" />
                Choisir un autre sujet
              </button>
              <button onClick={() => { setPhase('name'); setCandidateName(''); setLastResult(null); }} className="btn-ghost w-full py-3 text-sm font-semibold">
                Changer de candidat
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
