import React, { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { ThemeContext } from '../../contexts/ThemeContext';
import ProductManagement from './ProductManagement';
import Reports from './Reports';
import { LogoutIcon, MenuIcon, XMarkIcon, SunIcon, MoonIcon } from '../common/Icons';

type AdminView = 'products' | 'reports';

const AdminDashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState<AdminView>('reports');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);

  const NavItem: React.FC<{ view: AdminView, label: string }> = ({ view, label }) => (
    <button
      onClick={() => {
        setCurrentView(view);
        setSidebarOpen(false); // Close sidebar on selection in mobile view
      }}
      className={`w-full text-left px-4 py-2 text-lg font-medium rounded-md transition-colors ${
        currentView === view
          ? 'bg-primary-600 text-white'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
      }`}
    >
      {label}
    </button>
  );

  const ThemeToggleButton = () => (
     <button
      onClick={toggleTheme}
      className="flex items-center gap-3 w-full text-left px-4 py-2 text-lg font-medium rounded-md transition-colors text-gray-600 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700"
    >
      {theme === 'light' ? <MoonIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6" />}
      <span>Ganti Tema</span>
    </button>
  );

  const SidebarContent = () => (
     <>
        <div>
            <h1 className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-8">Admin POS</h1>
            <div className="space-y-4">
            <NavItem view="reports" label="Laporan" />
            <NavItem view="products" label="Produk" />
            </div>
        </div>
        <div className="mt-auto space-y-4">
            <ThemeToggleButton />
           <div className="text-sm text-gray-600 dark:text-gray-200 px-4">
            <p>Masuk sebagai:</p>
            <p className="font-bold">{user?.username}</p>
           </div>
           <button onClick={logout} className="flex items-center justify-center w-full px-4 py-2 text-lg font-medium text-red-600 bg-red-100 rounded-md hover:bg-red-200 dark:text-red-300 dark:bg-red-900/50 dark:hover:bg-red-900/80">
              <LogoutIcon className="h-6 w-6 mr-2"/>
              <span>Logout</span>
            </button>
        </div>
     </>
  );

  return (
    <div className="min-h-screen flex bg-gray-100 dark:bg-gray-900">
      {/* Mobile Sidebar */}
      <div className={`fixed inset-0 z-40 md:hidden transition-transform transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="relative w-64 bg-white dark:bg-gray-800 h-full p-6 flex flex-col shadow-lg">
            <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white md:hidden">
                <XMarkIcon className="w-6 h-6"/>
            </button>
            <SidebarContent />
          </div>
          <div className="flex-1 bg-black opacity-50" onClick={() => setSidebarOpen(false)}></div>
      </div>


      {/* Desktop Sidebar */}
      <nav className="w-64 bg-white dark:bg-gray-800 p-6 flex-col shadow-lg hidden md:flex">
        <SidebarContent />
      </nav>
      
      <main className="flex-1 flex flex-col">
         <header className="md:hidden flex justify-between items-center p-4 bg-white dark:bg-gray-800 shadow-md">
            <button onClick={() => setSidebarOpen(true)} className="text-gray-800 dark:text-white">
                <MenuIcon className="h-6 w-6"/>
            </button>
             <h2 className="text-xl font-bold text-gray-800 dark:text-white capitalize">{currentView}</h2>
        </header>
        <div className="flex-1 p-4 sm:p-8 overflow-y-auto">
            {currentView === 'products' && <ProductManagement />}
            {currentView === 'reports' && <Reports />}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;