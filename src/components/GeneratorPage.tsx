import { useState, useMemo } from 'react';
import {
  FileEdit, Eye, Download, Sparkles, ClipboardPaste, Trash2,
  AlertTriangle, CheckCircle2, ChevronDown, Settings2, Printer, Play, Shuffle,
} from 'lucide-react';
import { parseQCMText, SAMPLE_QCM, type ParseResult, type QCM } from '@/lib/qcm';
import { generateExamHtml, type GenerateOptions } from '@/lib/generateExam';

type CorrectionMode = 'immediate' | 'end';

export default function GeneratorPage() {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [mode, setMode] = useState<CorrectionMode>('immediate');
  const [showJustification, setShowJustification] = useState(true);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [shuffleOptions, setShuffleOptions] = useState(false);
  const [result, setResult] = useState<ParseResult | null>(null);

  const parsed = useMemo(() => (text.trim() ? parseQCMText(text) : null), [text]);
  const questions: QCM[] = result?.questions ?? parsed?.questions ?? [];

  const buildOptions = (): GenerateOptions => ({ mode, showJustification, shuffleQuestions, shuffleOptions });

  const handleParse = () => {
    const res = parseQCMText(text);
    setResult(res);
  };

  const handleDownload = () => {
    const res = result ?? parseQCMText(text);
    if (res.questions.length === 0) return;
    const html = generateExamHtml(title, res.questions, buildOptions());
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safeName = (title.trim() || 'examen-alfa-fisc')
      .toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').slice(0, 60);
    a.href = url;
    a.download = `${safeName}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePreview = () => {
    const res = result ?? parseQCMText(text);
    if (res.questions.length === 0) return;
    const html = generateExamHtml(title, res.questions, buildOptions());
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  };

  const loadSample = () => {
    setTitle('CONCOURS ENAREF 2026 — Culture Fiscale');
    setText(SAMPLE_QCM);
    setResult(null);
  };

  const handleClear = () => {
    setText('');
    setTitle('');
    setResult(null);
  };

  const pasteFromClipboard = () => {
    navigator.clipboard?.readText().then((t) => { setText(t); setResult(null); }).catch(() => {});
  };

  const errorCount = result?.errors.length ?? parsed?.errors.length ?? 0;
  const hasQuestions = questions.length > 0;

  return (
    <div className="container-page py-8 sm:py-12">
      <div className="grid lg:grid-cols-[1fr_360px] gap-8">
        {/* Left: Input */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-ink-900 grid place-items-center">
              <FileEdit className="w-5 h-5 text-alfa-green" />
            </div>
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-ink-900 tracking-tight">
                Générateur de sujet
              </h1>
              <p className="text-ink-500 text-sm">
                Collez vos QCM, configurez, puis téléchargez le fichier HTML interactif.
              </p>
            </div>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="exam-title" className="block text-sm font-semibold text-ink-700 mb-2">
              Titre de l'examen
            </label>
            <input
              id="exam-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: CONCOURS ENAREF 2026 — Culture Fiscale"
              className="input-field font-semibold"
            />
          </div>

          {/* Canevas hint */}
          <details className="card overflow-hidden">
            <summary className="cursor-pointer select-none px-5 py-4 flex items-center justify-between text-sm font-semibold text-ink-700 hover:bg-ink-50 transition-colors">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-alfa-green" />
                Voir le canevas attendu
              </span>
              <ChevronDown className="w-4 h-4" />
            </summary>
            <div className="px-5 pb-5 border-t border-ink-100">
              <pre className="mt-4 text-xs sm:text-sm bg-ink-900 text-ink-100 rounded-xl p-4 overflow-x-auto leading-relaxed">{`QCM 1 : [Texte de la question]
A. [Option A]
B. [Option B]
C. [Option C]
D. [Option D]

Réponse : [Lettre : A, B, C ou D]
Justification : [Explication ou base juridique]

(QCM 2 ...)`}</pre>
              <p className="mt-3 text-xs text-ink-400">
                Le parseur est insensible à la casse (QCM, qcm, Réponse, Reponse, reponse) et accepte aussi
                le format numéroté « 1. Votre question ». Options de A à E supportées.
              </p>
            </div>
          </details>

          {/* Textarea */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="qcm-input" className="text-sm font-semibold text-ink-700">
                Bloc de QCM brut
              </label>
              <div className="flex gap-2">
                <button
                  onClick={pasteFromClipboard}
                  className="text-xs font-semibold text-ink-500 hover:text-ink-800 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-ink-100 transition-colors"
                >
                  <ClipboardPaste className="w-3.5 h-3.5" />
                  Coller
                </button>
                <button
                  onClick={loadSample}
                  className="text-xs font-semibold text-alfa-green hover:brightness-110 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-alfa-green/10 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Exemple
                </button>
                {text && (
                  <button
                    onClick={handleClear}
                    className="text-xs font-semibold text-alfa-red hover:brightness-110 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-alfa-red/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Vider
                  </button>
                )}
              </div>
            </div>
            <textarea
              id="qcm-input"
              value={text}
              onChange={(e) => { setText(e.target.value); setResult(null); }}
              placeholder={`QCM 1 : Votre première question\nA. Option A\nB. Option B\nC. Option C\nD. Option D\n\nRéponse : B\nJustification : Explication...`}
              className="input-field font-mono text-sm leading-relaxed min-h-[280px] resize-y"
              spellCheck={false}
            />
          </div>

          {/* Live status */}
          {parsed && (
            <div className="flex items-center gap-3 text-sm flex-wrap">
              {hasQuestions ? (
                <span className="inline-flex items-center gap-2 text-alfa-green font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  {questions.length} QCM détecté{questions.length > 1 ? 's' : ''}
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 text-ink-400 font-medium">
                  <AlertTriangle className="w-4 h-4" />
                  Aucun QCM valide détecté
                </span>
              )}
              {errorCount > 0 && (
                <span className="inline-flex items-center gap-2 text-alfa-red font-semibold">
                  {errorCount} erreur{errorCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
          )}

          {/* Error details */}
          {errorCount > 0 && (result || parsed) && (
            <div className="card overflow-hidden">
              <div className="px-5 py-3 bg-alfa-red/5 border-b border-alfa-red/10 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-alfa-red" />
                <span className="text-sm font-semibold text-alfa-red">Détails des erreurs</span>
              </div>
              <ul className="divide-y divide-ink-100 max-h-48 overflow-y-auto">
                {(result ?? parsed)!.errors.map((err, i) => (
                  <li key={i} className="px-5 py-3 text-sm flex items-start gap-3">
                    <span className="label-chip bg-alfa-red/10 text-alfa-red mt-0.5">Ligne {err.inputLine}</span>
                    <span className="text-ink-600">{err.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right: Settings + Actions */}
        <aside className="space-y-5 lg:sticky lg:top-24 self-start">
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Settings2 className="w-4 h-4 text-ink-500" />
              <h3 className="font-display font-bold text-ink-900">Configuration</h3>
            </div>

            {/* Mode */}
            <div className="mb-5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 mb-2">
                Mode de correction
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setMode('immediate')}
                  className={`px-3 py-2.5 rounded-lg text-sm font-semibold border-2 transition-all ${
                    mode === 'immediate'
                      ? 'border-alfa-green bg-alfa-green/5 text-ink-900'
                      : 'border-ink-100 text-ink-500 hover:border-ink-200'
                  }`}
                >
                  Immédiate
                </button>
                <button
                  onClick={() => setMode('end')}
                  className={`px-3 py-2.5 rounded-lg text-sm font-semibold border-2 transition-all ${
                    mode === 'end'
                      ? 'border-alfa-green bg-alfa-green/5 text-ink-900'
                      : 'border-ink-100 text-ink-500 hover:border-ink-200'
                  }`}
                >
                  À la fin
                </button>
              </div>
              <p className="mt-2 text-xs text-ink-400 leading-relaxed">
                {mode === 'immediate'
                  ? 'La correction et la justification apparaissent après chaque réponse.'
                  : 'Toutes les corrections saffichent une fois le test terminé.'}
              </p>
            </div>

            {/* Justification toggle */}
            <label className="flex items-center justify-between gap-3 cursor-pointer mb-4">
              <span className="text-sm font-semibold text-ink-700">Afficher les justifications</span>
              <Toggle on={showJustification} onClick={() => setShowJustification((s) => !s)} />
            </label>

            {/* Shuffle toggles */}
            <div className="pt-4 border-t border-ink-100">
              <div className="flex items-center gap-2 mb-3">
                <Shuffle className="w-4 h-4 text-ink-500" />
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">Mélange</span>
              </div>
              <label className="flex items-center justify-between gap-3 cursor-pointer mb-3">
                <span className="text-sm text-ink-700">Mélanger les questions</span>
                <Toggle on={shuffleQuestions} onClick={() => setShuffleQuestions((s) => !s)} />
              </label>
              <label className="flex items-center justify-between gap-3 cursor-pointer">
                <span className="text-sm text-ink-700">Mélanger les options</span>
                <Toggle on={shuffleOptions} onClick={() => setShuffleOptions((s) => !s)} />
              </label>
              <p className="mt-3 text-xs text-ink-400 leading-relaxed">
                Le mélange sapplique à chaque ouverture du fichier par le candidat.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="card p-5 space-y-3">
            <button
              onClick={handleParse}
              disabled={!text.trim()}
              className="btn-3d-ink w-full disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Play className="w-4 h-4" />
              Parser et valider
            </button>
            <button
              onClick={handlePreview}
              disabled={!hasQuestions}
              className="btn-3d-blue w-full disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Eye className="w-4 h-4" />
              Prévisualiser dans un onglet
            </button>
            <button
              onClick={handleDownload}
              disabled={!hasQuestions}
              className="btn-3d-green w-full disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              Télécharger le fichier HTML
            </button>
            <p className="text-xs text-ink-400 leading-relaxed pt-1">
              Le fichier téléchargé est un HTML autonome : ouvrable par double-clic, sans connexion, avec correction interactive et export PDF intégré.
            </p>
          </div>

          {/* Preview summary */}
          {hasQuestions && (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-bold text-ink-900 text-sm">Aperçu du contenu</h3>
                <span className="label-chip bg-ink-100 text-ink-600">{questions.length} QCM</span>
              </div>
              <ol className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {questions.slice(0, 12).map((q) => (
                  <li key={q.id} className="text-sm flex items-start gap-2.5">
                    <span className="flex-shrink-0 w-6 h-6 rounded-md bg-ink-50 text-ink-500 grid place-items-center text-xs font-bold mt-0.5">
                      {q.index}
                    </span>
                    <span className="text-ink-600 leading-snug line-clamp-2">{q.question}</span>
                  </li>
                ))}
                {questions.length > 12 && (
                  <li className="text-xs text-ink-400 pt-1">+ {questions.length - 12} autres…</li>
                )}
              </ol>
              <div className="mt-4 pt-4 border-t border-ink-100 flex items-center justify-between text-xs text-ink-400">
                <span className="flex items-center gap-1.5">
                  <Printer className="w-3 h-3" />
                  PDF intégré
                </span>
                <span className="flex items-center gap-1.5">
                  <Shuffle className="w-3 h-3" />
                  Mélange optional
                </span>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`relative w-11 h-6 rounded-full transition-colors ${on ? 'bg-alfa-green' : 'bg-ink-200'}`}
      aria-pressed={on}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${on ? 'translate-x-5' : ''}`} />
    </button>
  );
}
