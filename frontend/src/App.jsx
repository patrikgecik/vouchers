import { useEffect, useState } from 'react';
import AdminDashboard from './pages/Dashboard';
import ClientVouchers from './pages/ClientVouchers';

const getRouteFromLocation = () => {
  if (typeof window === 'undefined') {
    return { view: 'client', slug: '' };
  }
  const segments = window.location.pathname.split('/').filter(Boolean);
  if (segments[0] === 'client') {
    return { view: 'client', slug: segments[1]?.toLowerCase() || '' };
  }
  if (segments[0] === 'admin') {
    return { view: 'admin', slug: '' };
  }
  return { view: 'client', slug: '' };
};

const normalizeSlug = (value = '') => value.trim().toLowerCase();

const App = () => {
  const initialRoute = getRouteFromLocation();
  const [currentView, setCurrentView] = useState(initialRoute.view);
  const [clientSlug, setClientSlug] = useState(initialRoute.slug);

  useEffect(() => {
    const handlePopstate = () => {
      const route = getRouteFromLocation();
      setCurrentView(route.view);
      setClientSlug(route.slug);
    };

    window.addEventListener('popstate', handlePopstate);
    return () => window.removeEventListener('popstate', handlePopstate);
  }, []);

  const navigateToClient = () => {
    let slug = normalizeSlug(clientSlug);
    if (!slug) {
      const manualSlug = window.prompt('Zadajte identifikator firmy (slug):', '') || '';
      slug = normalizeSlug(manualSlug);
      if (!slug) {
        return;
      }
      setClientSlug(slug);
    }
    setCurrentView('client');
    window.history.pushState({}, '', `/client/${slug}`);
  };

  const navigateToAdmin = () => {
    setCurrentView('admin');
    setClientSlug('');
    window.history.pushState({}, '', '/admin');
  };

  return (
    <div>
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Voucher System</h1>
            </div>
            <div className="flex items-center space-x-3">
              <div className="hidden sm:block">
                <label htmlFor="client-slug" className="sr-only">
                  Identifikator firmy
                </label>
                <input
                  id="client-slug"
                  type="text"
                  value={clientSlug}
                  onChange={(e) => setClientSlug(normalizeSlug(e.target.value))}
                  placeholder="slug firmy"
                  className="px-3 py-2 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                onClick={navigateToClient}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  currentView === 'client'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Klientska stranka
                {clientSlug && <span className="text-xs ml-2">/{clientSlug}</span>}
              </button>
              <button
                onClick={navigateToAdmin}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  currentView === 'admin'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Admin panel
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      <main>
        {currentView === 'admin' ? <AdminDashboard /> : <ClientVouchers companySlug={clientSlug} />}
      </main>
    </div>
  );
};

export default App;
