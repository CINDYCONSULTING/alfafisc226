import { useState, useEffect } from 'react';
import Navbar, { type Route } from './components/Navbar';
import HomePage from './components/HomePage';
import GeneratorPage from './components/GeneratorPage';

export default function App() {
  const [route, setRoute] = useState<Route>('home');

  useEffect(() => {
    const hash = window.location.hash.replace('#/', '').replace('#', '');
    if (hash === 'generator' || hash === 'home') {
      setRoute(hash as Route);
    }
  }, []);

  const handleNavigate = (r: Route) => {
    setRoute(r);
    window.location.hash = `/${r}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '');
      if (hash === 'generator' || hash === 'home') setRoute(hash as Route);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return (
    <div className="min-h-screen bg-ink-50 flex flex-col">
      <Navbar route={route} onNavigate={handleNavigate} />
      <main className="flex-1">
        {route === 'home' && <HomePage onNavigate={handleNavigate} />}
        {route === 'generator' && <GeneratorPage />}
      </main>

      <footer className="border-t border-ink-100 bg-white">
        <div className="container-page py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-ink-400">
          <p className="flex items-center gap-2">
            <span className="brand-wordmark text-lg"><span className="alfa">ALFA</span> <span className="fisc">FISC</span></span>
            <span className="text-ink-300">—</span>
            <span className="font-medium">Générateur de sujets QCM interactifs</span>
          </p>
          <p className="text-xs">Fichiers HTML autonomes, utilisables hors ligne</p>
        </div>
      </footer>
    </div>
  );
}
