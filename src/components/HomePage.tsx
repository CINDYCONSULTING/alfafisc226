import { ArrowRight, FileEdit, Download, BookOpen, Sparkles, ShieldCheck, Layers, Eye, Printer, Shuffle, RefreshCw } from 'lucide-react';
import type { Route } from './Navbar';

interface HomePageProps {
  onNavigate: (route: Route) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="bg-ink-50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink-900 text-white">
        <div className="absolute inset-0 bg-grid-dark opacity-40" />
        <div className="absolute -top-32 -right-24 w-96 h-96 rounded-full bg-alfa-green/20 blur-3xl animate-floaty" />
        <div className="absolute -bottom-32 -left-20 w-80 h-80 rounded-full bg-alfa-red/15 blur-3xl" />

        <div className="container-page relative py-20 sm:py-28 lg:py-36">
          <div className="max-w-3xl">
            <span className="label-chip bg-white/10 text-alfa-green border border-alfa-green/30 mb-6 animate-fadeIn">
              <Sparkles className="w-3.5 h-3.5" />
              Générateur de sujets QCM interactifs
            </span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] animate-fadeIn">
              Créez des examens QCM <span className="text-alfa-green">interactifs</span> téléchargeables
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-ink-200 leading-relaxed max-w-2xl animate-fadeIn">
              Collez vos questions au format brut, générez un fichier HTML autonome, et partagez-le
              avec vos candidats. Ils l'ouvrent, répondent, et obtiennent leur correction immédiatement.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 animate-fadeIn">
              <button onClick={() => onNavigate('generator')} className="btn-3d-green text-base px-7 py-3.5">
                <FileEdit className="w-5 h-5" />
                Ouvrir le générateur
                <ArrowRight className="w-5 h-5" />
              </button>
              <a
                href="#how"
                className="btn-ghost text-base bg-white/10 text-white border-white/20 hover:bg-white/20 hover:border-white/40"
              >
                <BookOpen className="w-5 h-5" />
                Comment ça marche
              </a>
            </div>

            <div className="mt-12 flex items-center gap-6 text-ink-300 animate-fadeIn flex-wrap">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-alfa-green" />
                <span className="text-sm font-medium">100% navigateur, hors ligne</span>
              </div>
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-alfa-green" />
                <span className="text-sm font-medium">HTML autonome, aucun serveur</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="container-page py-16 sm:py-20 scroll-mt-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-ink-900 tracking-tight">
            Trois étapes, un sujet prêt à diffuser
          </h2>
          <p className="mt-4 text-ink-500 text-lg">
            De votre texte brut au fichier que le candidat ouvre et complète.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { n: '01', icon: FileEdit, title: 'Collez vos QCM', text: "Saisissez un titre d'examen et collez vos questions au format fourni. Le parseur reconnaît questions, options, réponses et justifications." },
            { n: '02', icon: Eye, title: 'Visualisez et testez', text: 'Prévisualisez le rendu directement dans le navigateur, avec correction immédiate ou différée au choix.' },
            { n: '03', icon: Download, title: 'Téléchargez et partagez', text: "Exportez un fichier HTML autonome. Envoyez-le aux candidats : ils l'ouvrent, répondent et obtiennent leur score." },
          ].map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="card p-7 relative hover:shadow-card hover:-translate-y-0.5 transition-all duration-300 animate-fadeIn" style={{ animationDelay: `${i * 120}ms` }}>
                <div className="absolute -top-4 left-7 w-10 h-10 rounded-lg bg-ink-900 text-alfa-green grid place-items-center font-display font-extrabold text-sm shadow-soft">
                  {step.n}
                </div>
                <div className="mt-4">
                  <Icon className="w-7 h-7 text-alfa-green mb-3" />
                  <h3 className="font-display text-xl font-bold text-ink-900 mb-2">{step.title}</h3>
                  <p className="text-ink-500 leading-relaxed">{step.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Features */}
      <section className="bg-white border-y border-ink-100">
        <div className="container-page py-16 sm:py-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-ink-900 tracking-tight">
              Pensé pour la qualité et la simplicité
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Eye, title: 'Prévisualisation live', text: 'Voyez le rendu exact avant de télécharger.' },
              { icon: Shuffle, title: 'Mélange optional', text: 'Mélangez lordre des questions et des options à chaque session.' },
              { icon: RefreshCw, title: 'Reprise des ratés', text: 'Le candidat peut reprendre uniquement les questions ratées.' },
              { icon: Printer, title: 'Correction en PDF', text: 'Téléchargement PDF formel avec nom du candidat, après le test.' },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="card p-6 animate-fadeIn" style={{ animationDelay: `${i * 80}ms` }}>
                  <div className="w-11 h-11 rounded-xl bg-alfa-green/10 text-alfa-green grid place-items-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-bold text-ink-900 mb-1.5">{f.title}</h3>
                  <p className="text-sm text-ink-500 leading-relaxed">{f.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-page py-20">
        <div className="relative overflow-hidden rounded-3xl bg-ink-900 p-10 sm:p-14 text-center">
          <div className="absolute inset-0 bg-grid-dark opacity-30" />
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-alfa-green/20 blur-3xl" />
          <div className="relative">
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Prêt à générer votre premier sujet ?
            </h2>
            <p className="mt-4 text-ink-300 text-lg max-w-xl mx-auto">
              Quelques secondes suffisent. Collez, visualisez, téléchargez.
            </p>
            <div className="mt-8 flex justify-center">
              <button onClick={() => onNavigate('generator')} className="btn-3d-green text-base px-7 py-3.5">
                <FileEdit className="w-5 h-5" />
                Ouvrir le générateur
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
