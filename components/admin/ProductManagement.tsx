import React, { useState, useEffect, useCallback } from 'react';
import type { Product } from '../../types';
import { api } from '../../services/api';
import ProductFormModal from './ProductFormModal';

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
        const data = await api.getProducts();
        setProducts(data);
    } catch (err) {
        setError('Gagal memuat produk. Pastikan server backend berjalan.');
        console.error(err);
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleOpenModal = (product: Product | null = null) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedProduct(null);
  };

  const handleSave = async () => {
    await fetchProducts();
    handleCloseModal();
  };

  const handleDelete = async (productId: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      try {
        await api.deleteProduct(productId);
        await fetchProducts();
      } catch (err) {
        alert('Gagal menghapus produk.');
        console.error(err);
      }
    }
  };

  const renderContent = () => {
    if (loading) {
      return <p className="text-center py-8">Loading...</p>;
    }
    if (error) {
      return <p className="text-center py-8 text-red-500">{error}</p>;
    }
    return (
      <>
        {/* Desktop Table View */}
        <div className="hidden md:block bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Gambar</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nama</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Kategori</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Harga</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Stok</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {products.map(product => (
                <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img src={product.imageUrl} alt={product.name} className="w-12 h-12 rounded-md object-cover" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{product.category.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{product.price.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{product.stock}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleOpenModal(product)} className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 mr-4">Ubah</button>
                    <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
            {products.map(product => (
                <div key={product.id} className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 flex gap-4">
                    <img src={product.imageUrl} alt={product.name} className="w-20 h-20 rounded-md object-cover flex-shrink-0" />
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-bold text-lg">{product.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{product.category.name}</p>
                            </div>
                            <p className="font-semibold text-primary-600 dark:text-primary-400 text-right">{product.price.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</p>
                        </div>
                        <div className="mt-2 flex justify-between items-end">
                             <p className="text-sm text-gray-600 dark:text-gray-300">Stok: <span className="font-medium">{product.stock}</span></p>
                             <div className="text-sm font-medium">
                                <button onClick={() => handleOpenModal(product)} className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 mr-4">Ubah</button>
                                <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">Hapus</button>
                             </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </>
    );
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Manajemen Produk</h2>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 self-start sm:self-center"
        >
          Tambah Produk
        </button>
      </div>
      
      {renderContent()}
      
      {isModalOpen && <ProductFormModal product={selectedProduct} onClose={handleCloseModal} onSave={handleSave} />}
    </div>
  );
};

export default ProductManagement;