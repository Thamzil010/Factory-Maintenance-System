import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';

const Layout = () => {
  const navigate = useNavigate();
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    window.location.reload();
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-slate-100 flex flex-col shadow-xl z-10">
        <div className="h-16 flex items-center justify-center border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg shadow-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg leading-none">F</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">Factory<span className="text-indigo-400">Pro</span></h1>
          </div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <Link to="/" className="block px-4 py-2.5 hover:bg-white/10 rounded-lg transition-colors duration-200 font-medium">Dashboard</Link>
          <Link to="/machines" className="block px-4 py-2.5 hover:bg-white/10 rounded-lg transition-colors duration-200 font-medium">Machines</Link>
          <Link to="/maintenance" className="block px-4 py-2.5 hover:bg-white/10 rounded-lg transition-colors duration-200 font-medium">Maintenance</Link>
          <Link to="/spare-parts" className="block px-4 py-2.5 hover:bg-white/10 rounded-lg transition-colors duration-200 font-medium">Spare Parts</Link>
          <Link to="/suppliers" className="block px-4 py-2.5 hover:bg-white/10 rounded-lg transition-colors duration-200 font-medium">Suppliers</Link>
          <Link to="/warranties" className="block px-4 py-2.5 hover:bg-white/10 rounded-lg transition-colors duration-200 font-medium">Warranties</Link>
          <Link to="/service-history" className="block px-4 py-2.5 hover:bg-white/10 rounded-lg transition-colors duration-200 font-medium">Service History</Link>
          
          <div className="pt-4 mt-4 border-t border-slate-700/50">
            <Link to="/alerts" className="block px-4 py-2.5 hover:bg-white/10 rounded-lg transition-colors duration-200 font-medium text-amber-400">Alerts</Link>
            {user?.role === 'ADMIN' && (
              <Link to="/users" className="block px-4 py-2.5 hover:bg-white/10 rounded-lg transition-colors duration-200 font-medium text-purple-400">Users (Admin)</Link>
            )}
          </div>
        </nav>
        <div className="p-4 border-t border-slate-700/50 text-xs text-slate-500 text-center">
          FactoryPro System v1.0
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-20 shadow-sm">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold text-slate-800 tracking-tight">Welcome back, {user?.name}</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shadow-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <button onClick={handleLogout} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200">
              Logout
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
