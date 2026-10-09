import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';

import Login from './components/Login';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import TagsModal from './components/TagsModal';

import Dashboard from './components/Dashboard';
import DocumentForm from './components/DocumentForm';
import History from './components/History';
import Companies from './components/Companies';
import Users from './components/Users';

const USER_KEY = 'autodoc_user';
const THEME_KEY = 'autodoc_theme';

const SEARCH_PLACEHOLDER = {
  history: 'Buscar no histórico...',
  companies: 'Buscar empresa...',
  users: 'Buscar usuário...',
};

export default function App() {
  /* ---------------- Sessão ---------------- */
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
    } catch {
      return null;
    }
  });
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let alive = true;
    axios
      .get('/api/auth/me')
      .then(({ data }) => {
        if (!alive) return;
        setUser(data.user);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      })
      .catch(() => {
        if (!alive) return;
        setUser(null);
        localStorage.removeItem(USER_KEY);
      })
      .finally(() => alive && setChecking(false));
    return () => {
      alive = false;
    };
  }, []);

  /* ---------------- Tema ---------------- */
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  // Revelação circular a partir do botão, em vez do flash.
  const toggleTheme = useCallback((event) => {
    const next = theme === 'dark' ? 'light' : 'dark';
    const root = document.documentElement;

    if (event?.clientX !== undefined) {
      root.style.setProperty('--vt-x', `${event.clientX}px`);
      root.style.setProperty('--vt-y', `${event.clientY}px`);
    }

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!document.startViewTransition || reduce) {
      setTheme(next);
      return;
    }
    document.startViewTransition(() => {
      // flushSync não é necessário: o React 18 aplica a classe no efeito,
      // então trocamos a classe aqui e deixamos o estado seguir.
      root.classList.toggle('dark', next === 'dark');
      setTheme(next);
    });
  }, [theme]);

  /* ---------------- Navegação ---------------- */
  const [route, setRoute] = useState('dashboard');
  const [query, setQuery] = useState('');
  const [mobileNav, setMobileNav] = useState(false);
  const [tagsOpen, setTagsOpen] = useState(false);

  const navigate = (next) => {
    setRoute(next);
    setQuery('');
  };

  /* ---------------- Auth handlers ---------------- */
  const handleLogin = (u) => {
    setUser(u);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setRoute('dashboard');
  };

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch {
      /* sessão já pode ter expirado no servidor */
    }
    setUser(null);
    localStorage.removeItem(USER_KEY);
    setRoute('dashboard');
  };

  /* ---------------- Render ---------------- */
  if (!user) {
    if (checking) {
      return (
        <div className="min-h-screen bg-bg flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-[3px] border-line border-t-accent animate-spin-slow" />
        </div>
      );
    }
    return <Login onLoginSuccess={handleLogin} />;
  }

  const formType = route.startsWith('form:') ? route.split(':')[1] : null;

  return (
    <div className="h-screen flex flex-col bg-bg text-ink overflow-hidden">
      <TopBar
        user={user}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenTags={() => setTagsOpen(true)}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex min-h-0">
        <Sidebar
          route={route}
          onNavigate={navigate}
          query={query}
          onQuery={setQuery}
          searchPlaceholder={SEARCH_PLACEHOLDER[route] || 'Buscar...'}
          onOpenTags={() => setTagsOpen(true)}
          mobileOpen={mobileNav}
          onCloseMobile={() => setMobileNav(false)}
        />

        <main className="flex-1 min-w-0 overflow-y-auto scroll-slim">
          {route === 'dashboard' && (
            <Dashboard onNavigate={navigate} onOpenMobileNav={() => setMobileNav(true)} />
          )}
          {formType && (
            <DocumentForm
              key={formType}
              type={formType}
              onOpenMobileNav={() => setMobileNav(true)}
              onOpenTags={() => setTagsOpen(true)}
            />
          )}
          {route === 'history' && (
            <History query={query} onNavigate={navigate} onOpenMobileNav={() => setMobileNav(true)} />
          )}
          {route === 'companies' && (
            <Companies query={query} onOpenMobileNav={() => setMobileNav(true)} />
          )}
          {route === 'users' && (
            <Users query={query} currentUser={user} onOpenMobileNav={() => setMobileNav(true)} />
          )}
        </main>
      </div>

      <TagsModal open={tagsOpen} onClose={() => setTagsOpen(false)} />
    </div>
  );
}
