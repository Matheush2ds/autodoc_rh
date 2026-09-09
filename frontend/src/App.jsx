import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import DocumentForm from './components/DocumentForm';
import Settings from './components/Settings';
import Login from './components/Login';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [employeeType, setEmployeeType] = useState('regular');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Usuário autenticado com persistência no localStorage
  const [currentUser, setCurrentUser] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('autodoc_user');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  });

  // Inicialização do Tema Claro / Escuro com persistência
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('autodoc_theme');
      if (savedTheme) return savedTheme;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('autodoc_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    localStorage.setItem('autodoc_user', JSON.stringify(user));
  };

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (err) {
      console.error(err);
    }
    setCurrentUser(null);
    localStorage.removeItem('autodoc_user');
    setActiveTab('dashboard');
  };

  const handleNavigate = (tab, type = 'regular') => {
    setActiveTab(tab);
    if(type) setEmployeeType(type);
  };

  // Se o usuário não estiver autenticado, exibe a tela de Login
  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#0a0f1d] font-sans text-slate-800 dark:text-slate-100 overflow-hidden transition-colors duration-300">
      {/* Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        currentType={employeeType} 
        onNavigate={handleNavigate}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        theme={theme}
        onToggleTheme={toggleTheme}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
      
      {/* Painel Principal com Header flush */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        <Header 
          activeTab={activeTab} 
          currentType={employeeType}
          onToggleMobile={() => setIsMobileOpen(!isMobileOpen)}
          theme={theme}
          onToggleTheme={toggleTheme}
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        <main className="flex-1 overflow-auto p-4 sm:p-6 md:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'form' && <DocumentForm type={employeeType} />}
            {activeTab === 'settings' && <Settings currentUser={currentUser} />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;