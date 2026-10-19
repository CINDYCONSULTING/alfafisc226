import { useState, useEffect } from 'react';
import Navbar, { type Route } from './components/Navbar';
import HomePage from './components/HomePage';
import AdminPage from './components/AdminPage';
import ExamsPage from './components/ExamsPage';

export default function App() {
  const [route, setRoute] = useState<Route>('home');

  useEffect(() => {
    const hash = window.location.hash.replace('#/', '').replace('#', '');
    if (['home', 'admin', 'exams'].includes(hash)) {
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
      if (['home', 'admin', 'exams'].includes(hash)) setRoute(hash as Route);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return (
    <div className="min-h-screen bg-ink-50 flex flex-col">
      <Navbar route={route} onNavigate={handleNavigate} />
      <main className="flex-1">
        {route === 'home' && <HomePage onNavigate={handleNavigate} />}
        {route === 'admin' && <AdminPage />}
        {route === 'exams' && <ExamsPage />}
      </main>

      <footer className="border-t border-ink-100 bg-white">
        <div className="container-page py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-ink-400">
          <p className="flex items-center gap-2">
            <span className="brand-wordmark text-lg"><span className="alfa">Alfa</span> <span className="fisc">fisc</span></span>
            <span className="text-ink-300">—</span>
            <span className="font-medium">Plateforme de QCM interactifs</span>
          </p>
          <p className="text-xs">Avec Alfa fisc, visez l'excellence</p>
        </div>
      </footer>
    </div>
  );
}
