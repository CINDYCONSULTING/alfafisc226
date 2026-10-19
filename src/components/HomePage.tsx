import { ArrowRight, Shield, Users, Sparkles, BookOpen, Eye, Printer, Shuffle, RefreshCw, BarChart3 } from 'lucide-react';
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
              Plateforme de QCM interactifs
            </span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] animate-fadeIn">
              Créez et diffusez vos sujets <span className="text-alfa-green">QCM</span> en ligne
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-ink-200 leading-relaxed max-w-2xl animate-fadeIn">
              L'admin prépare les sujets, les candidats les traitent en ligne avec leur nom,
              et vous suivez les notes et les erreurs de chacun en temps réel.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 animate-fadeIn">
              <button onClick={() => onNavigate('admin')} className="btn-3d-green text-base px-7 py-3.5">
                <Shield className="w-5 h-5" />
                Espace Admin
                <ArrowRight className="w-5 h-5" />
              </button>
              <button onClick={() => onNavigate('exams')} className="btn-ghost text-base bg-white/10 text-white border-white/20 hover:bg-white/20 hover:border-white/40">
                <Users className="w-5 h-5" />
                Espace Candidats
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="container-page py-16 sm:py-20 scroll-mt-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-ink-900 tracking-tight">
            Deux espaces, une plateforme complète
          </h2>
          <p className="mt-4 text-ink-500 text-lg">
            L'admin gère les sujets, les candidats les traitent — tout est enregistré.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="card p-7 relative hover:shadow-card hover:-translate-y-0.5 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-alfa-green/10 text-alfa-green grid place-items-center mb-4">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="font-display text-xl font-bold text-ink-900 mb-2">Espace Admin</h3>
            <p className="text-ink-500 leading-relaxed mb-4">
              Créez, modifiez et supprimez vos sujets QCM. Suivez les candidats : noms, notes,
              questions ratées par chacun. Tout est centralisé.
            </p>
            <button onClick={() => onNavigate('admin')} className="text-sm font-semibold text-alfa-green flex items-center gap-1.5">
              Accéder à l'espace admin <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="card p-7 relative hover:shadow-card hover:-translate-y-0.5 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-alfa-red/10 text-alfa-red grid place-items-center mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-display text-xl font-bold text-ink-900 mb-2">Espace Candidats</h3>
            <p className="text-ink-500 leading-relaxed mb-4">
              Les candidats saisissent leur nom, choisissent un sujet, répondent aux questions
              et obtiennent leur correction immédiate avec justification et export PDF.
            </p>
            <button onClick={() => onNavigate('exams')} className="text-sm font-semibold text-alfa-red flex items-center gap-1.5">
              Accéder à l'espace candidats <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white border-y border-ink-100">
        <div className="container-page py-16 sm:py-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-ink-900 tracking-tight">
              Pensé pour la qualité et le suivi
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Eye, title: 'Correction immédiate', text: 'Le candidat voit la bonne réponse et la justification après chaque question.' },
              { icon: Shuffle, title: 'Mélange automatique', text: 'Questions et options mélangées à chaque session pour éviter la triche.' },
              { icon: BarChart3, title: 'Suivi des notes', text: 'L'admin voit les noms, notes et erreurs détaillées de chaque candidat.' },
              { icon: Printer, title: 'Correction en PDF', text: 'Téléchargement PDF de la correction avec le nom du candidat.' },
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
    </div>
  );
}
