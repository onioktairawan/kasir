import React, { useState, useEffect, useCallback } from 'react';
import type { Category } from '../../types';
import { api } from '../../services/api';
import CategoryFormModal from './CategoryFormModal';

const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (error) {
        console.error("Failed to fetch categories", error);
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleOpenModal = (category: Category | null = null) => {
    setSelectedCategory(category);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedCategory(null);
  };

  const handleSave = async () => {
    await fetchCategories();
    handleCloseModal();
  };

  const handleDelete = async (categoryId: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus kategori ini? Menghapus kategori juga akan menghapus semua produk di dalamnya.')) {
      try {
        await api.deleteCategory(categoryId);
        await fetchCategories();
      } catch (error: any) {
        alert(`Gagal menghapus kategori: ${error.message}`);
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Manajemen Kategori</h2>
        <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
          Tambah Kategori
        </button>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        {loading ? (
            <p>Memuat kategori...</p>
        ) : categories.length > 0 ? (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nama Kategori</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {categories.map(category => (
                            <tr key={category.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{category.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                                    <button onClick={() => handleOpenModal(category)} className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300">Ubah</button>
                                    <button onClick={() => handleDelete(category.id)} className="ml-4 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">Hapus</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        ) : (
            <div className="text-center py-16">
                <p className="text-gray-500 dark:text-gray-400">Anda belum memiliki kategori.</p>
                <button
                onClick={() => handleOpenModal()}
                className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                Tambah Kategori Pertama Anda
                </button>
            </div>
        )}
      </div>

      {isModalOpen && <CategoryFormModal category={selectedCategory} onClose={handleCloseModal} onSave={handleSave} />}
    </div>
  );
};

export default CategoryManagement;
