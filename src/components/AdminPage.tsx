import { useState, useEffect, useCallback } from 'react';
import {
  Shield, Lock, Plus, Trash2, Edit3, Eye, Users, X, Save,
  FileEdit, CheckCircle2, AlertTriangle, BarChart3, Download,
  ArrowLeft, Eye as EyeIcon, Settings2, Timer, Shuffle, Play,
} from 'lucide-react';
import {
  adminLogin, listExams, getExam, createExam, updateExam, deleteExam,
  listAttempts, type ExamMeta, type ExamFull, type Attempt, type QCMRow, type ExamSettings,
} from '@/lib/supabaseClient';
import { parseQCMText, SAMPLE_QCM } from '@/lib/qcm';
import { generateExamHtml } from '@/lib/generateExam';

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [code, setCode] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const handleLogin = async () => {
    setLoginLoading(true);
    setLoginError('');
    const ok = await adminLogin(code.trim());
    setLoginLoading(false);
    if (ok) setAuthed(true);
    else setLoginError('Code incorrect. Vérifiez et réessayez.');
  };

  if (!authed) {
    return (
      <div className="container-page py-16 sm:py-24">
        <div className="max-w-md mx-auto">
          <div className="card p-8 sm:p-10">
            <div className="w-16 h-16 rounded-2xl bg-ink-900 grid place-items-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-alfa-green" />
            </div>
            <h1 className="font-display text-2xl font-extrabold text-ink-900 text-center mb-2">
              Espace Administrateur
            </h1>
            <p className="text-ink-500 text-sm text-center mb-8">
              Saisissez le code d'accès pour gérer les sujets et suivre les candidats.
            </p>
            <div className="space-y-4">
              <div className="relative">
                <Lock className="w-5 h-5 text-ink-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  placeholder="Code d'accès admin"
                  className="input-field pl-12 font-semibold tracking-wider"
                  autoFocus
                />
              </div>
              {loginError && (
                <div className="flex items-center gap-2 text-sm text-alfa-red font-semibold bg-alfa-red/5 rounded-lg px-4 py-3">
                  <AlertTriangle className="w-4 h-4" />
                  {loginError}
                </div>
              )}
              <button
                onClick={handleLogin}
                disabled={loginLoading || !code.trim()}
                className="btn-3d-green w-full text-base py-3.5 disabled:opacity-40"
              >
                {loginLoading ? 'Vérification...' : 'Se connecter'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <AdminDashboard onLogout={() => { setAuthed(false); setCode(''); }} />;
}

type View =
  | { mode: 'list' }
  | { mode: 'create' }
  | { mode: 'edit'; examId: string }
  | { mode: 'attempts'; examId: string };

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [view, setView] = useState<View>({ mode: 'list' });
  const [exams, setExams] = useState<ExamMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const list = await listExams();
      setExams(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  if (view.mode === 'create') {
    return <ExamEditor onBack={() => setView({ mode: 'list' })} onSaved={() => { refresh(); setView({ mode: 'list' }); }} />;
  }
  if (view.mode === 'edit') {
    return <ExamEditor examId={view.examId} onBack={() => setView({ mode: 'list' })} onSaved={() => { refresh(); setView({ mode: 'list' }); }} />;
  }
  if (view.mode === 'attempts') {
    return <AttemptsView examId={view.examId} onBack={() => setView({ mode: 'list' })} />;
  }

  return (
    <div className="container-page py-8">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-ink-900 grid place-items-center">
            <Shield className="w-6 h-6 text-alfa-green" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-extrabold text-ink-900">Tableau de bord</h1>
            <p className="text-ink-500 text-sm">Gérez vos sujets et suivez les candidats</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setView({ mode: 'create' })} className="btn-3d-green">
            <Plus className="w-4 h-4" />
            Nouveau sujet
          </button>
          <button onClick={onLogout} className="btn-ghost px-4 py-2.5 text-sm font-semibold">
            Déconnexion
          </button>
        </div>
      </div>

      {error && (
        <div className="card p-4 mb-6 flex items-center gap-2 text-alfa-red font-semibold">
          <AlertTriangle className="w-5 h-5" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="card p-12 text-center text-ink-400">Chargement des sujets...</div>
      ) : exams.length === 0 ? (
        <div className="card p-12 text-center">
          <FileEdit className="w-12 h-12 text-ink-200 mx-auto mb-4" />
          <h3 className="font-display text-lg font-bold text-ink-700 mb-2">Aucun sujet pour le moment</h3>
          <p className="text-ink-400 text-sm mb-6">Créez votre premier sujet QCM pour le diffuser aux candidats.</p>
          <button onClick={() => setView({ mode: 'create' })} className="btn-3d-green">
            <Plus className="w-4 h-4" />
            Créer un sujet
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {exams.map((exam) => (
            <ExamCard
              key={exam.id}
              exam={exam}
              onViewAttempts={() => setView({ mode: 'attempts', examId: exam.id })}
              onEdit={() => setView({ mode: 'edit', examId: exam.id })}
              onDelete={async () => {
                if (confirm(`Supprimer le sujet « ${exam.title} » ? Cette action est définitive.`)) {
                  try {
                    await deleteExam(exam.id);
                    refresh();
                  } catch (e) {
                    setError(e instanceof Error ? e.message : 'Erreur de suppression');
                  }
                }
              }}
              onTogglePublish={async () => {
                try {
                  await updateExam(exam.id, { is_published: !exam.is_published });
                  refresh();
                } catch (e) {
                  setError(e instanceof Error ? e.message : 'Erreur');
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ExamCard({
  exam, onViewAttempts, onEdit, onDelete, onTogglePublish,
}: {
  exam: ExamMeta;
  onViewAttempts: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePublish: () => void;
}) {
  const created = new Date(exam.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  return (
    <div className="card p-5 flex items-center justify-between gap-4 flex-wrap hover:shadow-card transition-shadow">
      <div className="flex-1 min-w-[200px]">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-display font-bold text-ink-900">{exam.title}</h3>
          <span className={`label-chip text-xs ${exam.is_published ? 'bg-alfa-green/10 text-alfa-green' : 'bg-ink-100 text-ink-500'}`}>
            {exam.is_published ? 'Publié' : 'Brouillon'}
          </span>
        </div>
        <p className="text-xs text-ink-400">Créé le {created}</p>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={onViewAttempts} className="btn-ghost px-3 py-2 text-sm font-semibold flex items-center gap-1.5">
          <Users className="w-4 h-4" />
          Candidats
        </button>
        <button onClick={onEdit} className="btn-ghost px-3 py-2 text-sm font-semibold flex items-center gap-1.5">
          <Edit3 className="w-4 h-4" />
          Modifier
        </button>
        <button onClick={onTogglePublish} className="btn-ghost px-3 py-2 text-sm font-semibold flex items-center gap-1.5">
          {exam.is_published ? <><X className="w-4 h-4" /> Dépublier</> : <><Eye className="w-4 h-4" /> Publier</>}
        </button>
        <button onClick={onDelete} className="btn-ghost px-3 py-2 text-sm font-semibold flex items-center gap-1.5 text-alfa-red hover:bg-alfa-red/10">
          <Trash2 className="w-4 h-4" />
          Supprimer
        </button>
      </div>
    </div>
  );
}

function ExamEditor({ examId, onBack, onSaved }: { examId?: string; onBack: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [mode, setMode] = useState<'immediate' | 'end'>('immediate');
  const [showJustification, setShowJustification] = useState(true);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [shuffleOptions, setShuffleOptions] = useState(false);
  const [durationMin, setDurationMin] = useState(0);
  const [isPublished, setIsPublished] = useState(true);
  const [loading, setLoading] = useState(!!examId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!examId) return;
    (async () => {
      try {
        const exam = await getExam(examId);
        if (exam) {
          setTitle(exam.title);
          setMode(exam.settings_json.mode || 'immediate');
          setShowJustification(exam.settings_json.showJustification ?? true);
          setShuffleQuestions(exam.settings_json.shuffleQuestions ?? false);
          setShuffleOptions(exam.settings_json.shuffleOptions ?? false);
          setDurationMin(exam.settings_json.durationMin ?? 0);
          setIsPublished(exam.is_published);
          const lines = exam.qcm_json.map((q: QCMRow) => {
            const opts = q.options.map(o => `${o.letter}. ${o.text}`).join('\n');
            const ans = q.answer.join(', ');
            return `QCM ${q.index} : ${q.question}\n${opts}\n\nRéponse : ${ans}\nJustification : ${q.justification}`;
          });
          setText(lines.join('\n\n'));
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    })();
  }, [examId]);

  const parsed = text.trim() ? parseQCMText(text) : null;
  const questions = parsed?.questions ?? [];
  const hasQuestions = questions.length > 0;
  const errorCount = parsed?.errors.length ?? 0;

  const handleSave = async () => {
    if (!title.trim() || !hasQuestions) return;
    setSaving(true);
    setError('');
    try {
      const settings: ExamSettings = { mode, showJustification, shuffleQuestions, shuffleOptions, durationMin };
      const qcmRows: QCMRow[] = questions.map(q => ({
        id: q.id, index: q.index, question: q.question,
        options: q.options, answer: q.answer, justification: q.justification,
      }));
      if (examId) {
        await updateExam(examId, { title, qcm_json: qcmRows, settings_json: settings, is_published: isPublished });
      } else {
        await createExam(title, qcmRows, settings, isPublished);
      }
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur de sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    if (!hasQuestions) return;
    const html = generateExamHtml(title, questions, { mode, showJustification, shuffleQuestions, shuffleOptions, durationMin });
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  };

  if (loading) return <div className="container-page py-16 text-center text-ink-400">Chargement du sujet...</div>;

  return (
    <div className="container-page py-8">
      <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-ink-500 hover:text-ink-800 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Retour au tableau de bord
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-ink-900 grid place-items-center">
          <FileEdit className="w-5 h-5 text-alfa-green" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink-900">{examId ? 'Modifier le sujet' : 'Nouveau sujet'}</h1>
          <p className="text-ink-500 text-sm">Saisissez vos QCM, configurez, puis enregistrez dans la plateforme.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-8">
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-ink-700 mb-2">Titre de l'examen</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: CONCOURS ENAREF 2026 — Culture Fiscale"
              className="input-field font-semibold" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-ink-700">Bloc de QCM brut</label>
              <button onClick={() => { setText(SAMPLE_QCM); }}
                className="text-xs font-semibold text-alfa-green flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-alfa-green/10">
                Exemple
              </button>
            </div>
            <textarea value={text} onChange={(e) => setText(e.target.value)}
              placeholder={`QCM 1 : Votre question\nA. Option A\nB. Option B\nC. Option C\nD. Option D\n\nRéponse : B\nJustification : ...`}
              className="input-field font-mono text-sm leading-relaxed min-h-[300px] resize-y" spellCheck={false} />
          </div>

          {parsed && (
            <div className="flex items-center gap-3 text-sm flex-wrap">
              {hasQuestions ? (
                <span className="inline-flex items-center gap-2 text-alfa-green font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  {questions.length} QCM détecté{questions.length > 1 ? 's' : ''}
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 text-ink-400">
                  <AlertTriangle className="w-4 h-4" />
                  Aucun QCM valide
                </span>
              )}
              {errorCount > 0 && (
                <span className="inline-flex items-center gap-2 text-alfa-red font-semibold">
                  {errorCount} erreur{errorCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
          )}

          {errorCount > 0 && parsed && (
            <div className="card overflow-hidden">
              <ul className="divide-y divide-ink-100">
                {parsed.errors.map((err, i) => (
                  <li key={i} className="px-5 py-3 text-sm flex items-start gap-3">
                    <span className="label-chip bg-alfa-red/10 text-alfa-red mt-0.5">Ligne {err.inputLine}</span>
                    <span className="text-ink-600">{err.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 self-start">
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Settings2 className="w-4 h-4 text-ink-500" />
              <h3 className="font-display font-bold text-ink-900">Configuration</h3>
            </div>

            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 mb-2">Mode de correction</label>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button onClick={() => setMode('immediate')}
                className={`px-3 py-2.5 rounded-lg text-sm font-semibold border-2 ${mode === 'immediate' ? 'border-alfa-green bg-alfa-green/5' : 'border-ink-100 text-ink-500'}`}>
                Immédiate
              </button>
              <button onClick={() => setMode('end')}
                className={`px-3 py-2.5 rounded-lg text-sm font-semibold border-2 ${mode === 'end' ? 'border-alfa-green bg-alfa-green/5' : 'border-ink-100 text-ink-500'}`}>
                À la fin
              </button>
            </div>

            <label className="flex items-center justify-between gap-3 cursor-pointer mb-4">
              <span className="text-sm font-semibold text-ink-700">Afficher les justifications</span>
              <Toggle on={showJustification} onClick={() => setShowJustification(s => !s)} />
            </label>

            <div className="mb-4">
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 mb-2">
                <Timer className="w-3.5 h-3.5 inline mr-1" />Durée (minutes)
              </label>
              <input type="number" min={0} max={600} value={durationMin}
                onChange={(e) => setDurationMin(Math.max(0, Math.min(600, parseInt(e.target.value, 10) || 0)))}
                className="input-field font-semibold" placeholder="0 = sans limite" />
            </div>

            <div className="pt-4 border-t border-ink-100">
              <div className="flex items-center gap-2 mb-3">
                <Shuffle className="w-4 h-4 text-ink-500" />
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">Mélange</span>
              </div>
              <label className="flex items-center justify-between gap-3 cursor-pointer mb-3">
                <span className="text-sm text-ink-700">Mélanger les questions</span>
                <Toggle on={shuffleQuestions} onClick={() => setShuffleQuestions(s => !s)} />
              </label>
              <label className="flex items-center justify-between gap-3 cursor-pointer">
                <span className="text-sm text-ink-700">Mélanger les options</span>
                <Toggle on={shuffleOptions} onClick={() => setShuffleOptions(s => !s)} />
              </label>
            </div>

            <div className="pt-4 mt-4 border-t border-ink-100">
              <label className="flex items-center justify-between gap-3 cursor-pointer">
                <span className="text-sm font-semibold text-ink-700">Publier aux candidats</span>
                <Toggle on={isPublished} onClick={() => setIsPublished(s => !s)} />
              </label>
            </div>
          </div>

          <div className="card p-5 space-y-3">
            <button onClick={handlePreview} disabled={!hasQuestions}
              className="btn-3d-blue w-full disabled:opacity-40">
              <EyeIcon className="w-4 h-4" />
              Prévisualiser
            </button>
            <button onClick={handleSave} disabled={!title.trim() || !hasQuestions || saving}
              className="btn-3d-green w-full disabled:opacity-40">
              <Save className="w-4 h-4" />
              {saving ? 'Enregistrement...' : examId ? 'Mettre à jour' : 'Enregistrer le sujet'}
            </button>
            {error && (
              <p className="text-xs text-alfa-red font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />{error}
              </p>
            )}
          </div>

          {hasQuestions && (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-bold text-ink-900 text-sm">Aperçu</h3>
                <span className="label-chip bg-ink-100 text-ink-600">{questions.length} QCM</span>
              </div>
              <ol className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {questions.slice(0, 10).map((q) => (
                  <li key={q.id} className="text-sm flex items-start gap-2.5">
                    <span className="flex-shrink-0 w-6 h-6 rounded-md bg-ink-50 text-ink-500 grid place-items-center text-xs font-bold mt-0.5">{q.index}</span>
                    <span className="text-ink-600 leading-snug line-clamp-2">{q.question}</span>
                  </li>
                ))}
                {questions.length > 10 && <li className="text-xs text-ink-400">+ {questions.length - 10} autres…</li>}
              </ol>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function AttemptsView({ examId, onBack }: { examId: string; onBack: () => void }) {
  const [exam, setExam] = useState<ExamFull | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<Attempt | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [ex, atts] = await Promise.all([getExam(examId), listAttempts(examId)]);
        setExam(ex);
        setAttempts(atts);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erreur');
      } finally {
        setLoading(false);
      }
    })();
  }, [examId]);

  if (loading) return <div className="container-page py-16 text-center text-ink-400">Chargement des résultats...</div>;

  const avgScore = attempts.length > 0
    ? Math.round((attempts.reduce((s, a) => s + (a.score / a.total) * 100, 0) / attempts.length))
    : 0;

  return (
    <div className="container-page py-8">
      <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-ink-500 hover:text-ink-800 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Retour au tableau de bord
      </button>

      {error && <div className="card p-4 mb-6 text-alfa-red font-semibold">{error}</div>}

      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-xl bg-ink-900 grid place-items-center">
          <BarChart3 className="w-6 h-6 text-alfa-green" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink-900">{exam?.title || 'Sujet'}</h1>
          <p className="text-ink-500 text-sm">Résultats des candidats</p>
        </div>
      </div>

      {attempts.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <StatCard label="Candidats" value={attempts.length.toString()} icon={Users} color="text-ink-900" />
          <StatCard label="Note moyenne" value={`${avgScore}%`} icon={BarChart3} color="text-alfa-green" />
          <StatCard label="Meilleure note" value={`${Math.max(...attempts.map(a => Math.round((a.score / a.total) * 100)))}%`} icon={CheckCircle2} color="text-alfa-green" />
        </div>
      )}

      {attempts.length === 0 ? (
        <div className="card p-12 text-center">
          <Users className="w-12 h-12 text-ink-200 mx-auto mb-4" />
          <h3 className="font-display text-lg font-bold text-ink-700 mb-2">Aucun candidat pour le moment</h3>
          <p className="text-ink-400 text-sm">Les résultats apparaîtront ici dès qu'un candidat terminera le sujet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {attempts.map((att, idx) => {
            const pct = Math.round((att.score / att.total) * 100);
            const wrongCount = att.correct_array.filter(c => !c).length;
            const finished = att.finished_at ? new Date(att.finished_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';
            return (
              <div key={att.id} className="card p-5 flex items-center justify-between gap-4 flex-wrap hover:shadow-card transition-shadow">
                <div className="flex items-center gap-4 flex-1 min-w-[200px]">
                  <div className="w-10 h-10 rounded-xl bg-ink-50 text-ink-500 grid place-items-center font-bold text-sm">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-ink-900">{att.candidate_name}</h3>
                    <p className="text-xs text-ink-400">Terminé le {finished}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className={`font-display text-xl font-extrabold ${pct >= 50 ? 'text-alfa-green' : 'text-alfa-red'}`}>{att.score}/{att.total}</div>
                    <div className="text-[10px] uppercase tracking-wider text-ink-400 font-bold">Note</div>
                  </div>
                  <div className="text-center">
                    <div className="font-display text-xl font-extrabold text-alfa-red">{wrongCount}</div>
                    <div className="text-[10px] uppercase tracking-wider text-ink-400 font-bold">Ratées</div>
                  </div>
                  <button onClick={() => setSelected(att)} className="btn-ghost px-3 py-2 text-sm font-semibold flex items-center gap-1.5">
                    <EyeIcon className="w-4 h-4" />
                    Détails
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selected && exam && (
        <AttemptDetailModal attempt={selected} exam={exam} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

function AttemptDetailModal({ attempt, exam, onClose }: { attempt: Attempt; exam: ExamFull; onClose: () => void }) {
  const questions = exam.qcm_json;
  return (
    <div className="fixed inset-0 bg-ink-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-ink-100 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-extrabold text-ink-900">{attempt.candidate_name}</h2>
            <p className="text-sm text-ink-500">Score: {attempt.score}/{attempt.total} — {Math.round((attempt.score / attempt.total) * 100)}%</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-lg hover:bg-ink-100 grid place-items-center">
            <X className="w-5 h-5 text-ink-500" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {questions.map((q, i) => {
            const userAns = attempt.answers_json[i] || [];
            const isCorrect = attempt.correct_array[i];
            return (
              <div key={q.id} className={`rounded-xl border p-4 ${isCorrect ? 'border-alfa-green/30 bg-alfa-green/5' : 'border-alfa-red/30 bg-alfa-red/5'}`}>
                <div className="flex items-start gap-2 mb-2">
                  <span className={`flex-shrink-0 w-7 h-7 rounded-lg grid place-items-center text-xs font-bold ${isCorrect ? 'bg-alfa-green text-white' : 'bg-alfa-red text-white'}`}>
                    {isCorrect ? '✓' : '✕'}
                  </span>
                  <p className="font-semibold text-ink-900 text-sm">{q.index}. {q.question}</p>
                </div>
                <div className="space-y-1 ml-9">
                  {q.options.map(opt => {
                    const isRightAns = q.answer.includes(opt.letter);
                    const isUserPick = userAns.includes(opt.letter);
                    let cls = 'text-ink-500';
                    if (isRightAns) cls = 'text-alfa-green font-semibold';
                    else if (isUserPick && !isRightAns) cls = 'text-alfa-red font-semibold';
                    return (
                      <div key={opt.letter} className={`text-sm ${cls}`}>
                        <span className="font-bold">{opt.letter}.</span> {opt.text}
                        {isRightAns && <span className="ml-2 text-xs">(bonne réponse)</span>}
                        {isUserPick && !isRightAns && <span className="ml-2 text-xs">(choisi par le candidat)</span>}
                      </div>
                    );
                  })}
                </div>
                {exam.settings_json.showJustification && (
                  <div className="mt-3 ml-9 text-sm text-ink-500 bg-ink-50 rounded-lg p-3">
                    <strong className="text-ink-700">Justification:</strong> {q.justification}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string; icon: React.ComponentType<{ className?: string }>; color: string }) {
  return (
    <div className="card p-5">
      <Icon className={`w-5 h-5 mb-2 ${color}`} />
      <div className={`font-display text-2xl font-extrabold ${color}`}>{value}</div>
      <div className="text-xs font-semibold uppercase tracking-wider text-ink-400 mt-1">{label}</div>
    </div>
  );
}

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`relative w-11 h-6 rounded-full transition-colors ${on ? 'bg-alfa-green' : 'bg-ink-200'}`} aria-pressed={on}>
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${on ? 'translate-x-5' : ''}`} />
    </button>
  );
}
