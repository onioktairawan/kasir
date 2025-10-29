import React, { useState, FormEvent, useEffect } from 'react';
import { Category } from '../../types';
import { api } from '../../services/api';

interface CategoryFormModalProps {
  category: Category | null;
  onClose: () => void;
  onSave: () => void;
}

const CategoryFormModal: React.FC<CategoryFormModalProps> = ({ category, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (category) {
      setName(category.name);
    }
  }, [category]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (category) {
        await api.updateCategory({ ...category, name });
      } else {
        await api.addCategory({ name });
      }
      onSave();
    } catch (err) {
      console.error("Failed to save category", err);
      setError("Gagal menyimpan kategori. Mungkin nama sudah ada.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="flex justify-between items-center p-6 pb-3 border-b dark:border-gray-600">
            <h3 className="text-2xl font-bold">{category ? 'Ubah Kategori' : 'Tambah Kategori'}</h3>
            <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">&times;</button>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nama Kategori</label>
              <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600"/>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          <div className="p-6 pt-4 border-t dark:border-gray-600 flex justify-end gap-3 bg-gray-50 dark:bg-gray-800/50 rounded-b-lg">
            <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">
              Batal
            </button>
            <button type="submit" disabled={loading} className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-primary-300">
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryFormModal;
