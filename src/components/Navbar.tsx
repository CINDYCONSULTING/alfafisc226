import { Home, FileEdit } from 'lucide-react';

export type Route = 'home' | 'generator';

interface NavbarProps {
  route: Route;
  onNavigate: (route: Route) => void;
}

export default function Navbar({ route, onNavigate }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-white/90 border-b border-ink-100">
      <div className="container-page flex h-16 items-center justify-between">
        <button onClick={() => onNavigate('home')} className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-xl bg-ink-900 grid place-items-center shadow-soft group-hover:bg-ink-800 transition-colors">
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" stroke="#009E49" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6 12v5c3 2.5 9 2.5 12 0v-5" stroke="#EF2B2D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="flex flex-col leading-none text-left">
            <span className="brand-wordmark text-2xl">
              <span className="alfa">ALFA</span> <span className="fisc">FISC</span>
            </span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-ink-400 font-semibold mt-0.5">
              Générateur de Sujets
            </span>
          </div>
        </button>

        <nav className="flex items-center gap-1">
          <button
            onClick={() => onNavigate('home')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
              route === 'home' ? 'bg-ink-800 text-white shadow-soft' : 'text-ink-600 hover:text-ink-900 hover:bg-ink-50'
            }`}
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Accueil</span>
          </button>
          <button
            onClick={() => onNavigate('generator')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
              route === 'generator' ? 'bg-ink-800 text-white shadow-soft' : 'text-ink-600 hover:text-ink-900 hover:bg-ink-50'
            }`}
          >
            <FileEdit className="w-4 h-4" />
            <span className="hidden sm:inline">Générateur</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
