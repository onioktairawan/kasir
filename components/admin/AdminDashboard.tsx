import React, { useState } from 'react';
import ProductManagement from './ProductManagement';
import Reports from './Reports';
import UserMenu from '../common/UserMenu';
import { Bars3Icon, ChartPieIcon, TagIcon, ArchiveBoxIcon, UsersIcon, FolderIcon } from '../common/Icons';
import TransactionHistory from './TransactionHistory';
import UserManagement from './UserManagement';
import CategoryManagement from './CategoryManagement';

type AdminView = 'products' | 'reports' | 'history' | 'users' | 'categories';

const AdminDashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState<AdminView>('reports');
  const [isSidebarVisible, setSidebarVisible] = useState(true);

  const NavItem: React.FC<{ view: AdminView, label: string, icon: React.ReactNode }> = ({ view, label, icon }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`flex items-center gap-3 px-4 py-2 text-lg font-medium rounded-md transition-colors w-full text-left ${
        currentView === view
          ? 'bg-primary-600 text-white'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <nav 
        className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 p-6 flex flex-col shadow-lg z-30 transition-transform duration-300 ease-in-out ${
          isSidebarVisible ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <h1 className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-8">Admin POS</h1>
        <div className="space-y-4">
          <NavItem view="reports" label="Laporan" icon={<ChartPieIcon className="w-6 h-6" />} />
          <NavItem view="products" label="Produk" icon={<TagIcon className="w-6 h-6" />} />
          <NavItem view="categories" label="Kategori" icon={<FolderIcon className="w-6 h-6" />} />
          <NavItem view="users" label="Pengguna" icon={<UsersIcon className="w-6 h-6" />} />
          <NavItem view="history" label="Riwayat" icon={<ArchiveBoxIcon className="w-6 h-6" />} />
        </div>
        <div className="mt-auto">
           <UserMenu direction="up" />
        </div>
      </nav>

      <div 
        className={`transition-all duration-300 ease-in-out ${
          isSidebarVisible ? 'pl-0 md:pl-64' : 'pl-0'
        }`}
      >
        <header className="sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-20 flex items-center p-4 border-b border-gray-200 dark:border-gray-700">
            <button 
              onClick={() => setSidebarVisible(!isSidebarVisible)}
              className="p-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
              aria-label="Toggle sidebar"
            >
                <Bars3Icon className="w-6 h-6" />
            </button>
        </header>
        <main className="p-8">
            {currentView === 'products' && <ProductManagement />}
            {currentView === 'reports' && <Reports />}
            {currentView === 'history' && <TransactionHistory />}
            {currentView === 'users' && <UserManagement />}
            {currentView === 'categories' && <CategoryManagement />}
        </main>
      </div>

       {/* Overlay for mobile */}
       {isSidebarVisible && (
        <div
          onClick={() => setSidebarVisible(false)}
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          aria-hidden="true"
        ></div>
      )}
    </div>
  );
};

export default AdminDashboard;
