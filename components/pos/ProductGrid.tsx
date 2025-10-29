import React, { useState, useEffect, useCallback } from 'react';
import type { Product, Category } from '../../types';
import { api } from '../../services/api';
import { DocumentDuplicateIcon } from '../common/Icons';

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onSearch: (query: string, category: string) => void;
  loading: boolean;
}

const ProductCard: React.FC<{ product: Product; onAddToCart: (product: Product) => void }> = ({ product, onAddToCart }) => (
  <div
    className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 cursor-pointer flex flex-col"
    onClick={() => onAddToCart(product)}
  >
    <div className="w-full h-40 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
      {product.imageUrl ? (
        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
      ) : (
        <DocumentDuplicateIcon className="w-16 h-16 text-gray-400 dark:text-gray-500" />
      )}
    </div>
    <div className="p-4 flex flex-col flex-grow">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex-grow">{product.name}</h3>
      <p className="text-xl font-bold text-primary-600 dark:text-primary-400 mt-2">
        {product.price.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
      </p>
    </div>
  </div>
);

const ProductGrid: React.FC<ProductGridProps> = ({ products, onAddToCart, onSearch, loading }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    api.getCategories().then(setCategories);
  }, []);
  
  useEffect(() => {
    onSearch(searchQuery, selectedCategory);
  }, [searchQuery, selectedCategory, onSearch]);

  const handleCategoryChange = useCallback((categoryName: string) => {
    setSelectedCategory(categoryName);
  }, []);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
  }

  return (
    <div>
      <div className="mb-4 sticky top-0 bg-gray-100 dark:bg-gray-900 py-4 z-10">
        <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Cari produk... (F1)"
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
            <button onClick={() => handleCategoryChange('all')} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === 'all' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>Semua</button>
            {categories.map(cat => (
                <button key={cat.id} onClick={() => handleCategoryChange(cat.name)} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === cat.name ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>{cat.name}</button>
            ))}
        </div>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
             <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden animate-pulse">
                <div className="w-full h-40 bg-gray-300 dark:bg-gray-700"></div>
                <div className="p-4">
                    <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                    <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
             </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.map(product => (
            <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
            <p className="text-gray-500 dark:text-gray-400">Belum ada produk. Silakan tambahkan di halaman Admin.</p>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;