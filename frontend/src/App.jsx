import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import DocumentForm from './components/DocumentForm';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [employeeType, setEmployeeType] = useState('regular');

  const handleNavigate = (tab, type = 'regular') => {
    setActiveTab(tab);
    if(type) setEmployeeType(type);
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800">
      {/* CORREÇÃO AQUI: Adicionei currentType={employeeType} */}
      <Sidebar 
        activeTab={activeTab} 
        currentType={employeeType} 
        onNavigate={handleNavigate} 
      />
      
      <main className="flex-1 overflow-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'form' && <DocumentForm type={employeeType} />}
        </div>
      </main>
    </div>
  );
}

export default App;