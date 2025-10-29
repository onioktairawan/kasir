import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import type { Product, Category } from '../../types';
import { api } from '../../services/api';
import { DocumentDuplicateIcon } from '../common/Icons';

interface ProductFormModalProps {
  product: Product | null;
  onClose: () => void;
  onSave: () => void;
}

type ImageSource = 'upload' | 'url';

const ProductFormModal: React.FC<ProductFormModalProps> = ({ product, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [categoryId, setCategoryId] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageSource, setImageSource] = useState<ImageSource>('upload');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false); // For form submission
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setPrice(product.price);
      setImageUrl(product.imageUrl || '');
    } else {
      setName('');
      setPrice(0);
      setImageUrl('');
    }

    setCategoriesLoading(true);
    setCategoriesError(null);
    api.getCategories()
      .then(cats => {
        setCategories(cats);
        if (cats.length === 0) {
          setCategoriesError("Belum ada kategori. Tambah dulu di menu 'Kategori'.");
        } else {
          if (product) {
            setCategoryId(product.category.id);
          } else {
            setCategoryId(cats[0].id);
          }
        }
      })
      .catch(error => {
        console.error("Failed to fetch categories:", error);
        setCategoriesError('Gagal memuat kategori.');
      })
      .finally(() => {
        setCategoriesLoading(false);
      });

  }, [product]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (categoriesError) {
        alert("Tidak bisa menyimpan produk karena kategori tidak dapat dimuat.");
        return;
    }
    setLoading(true);
    const selectedCategory = categories.find(c => c.id === categoryId);
    if (!selectedCategory) {
        alert('Kategori tidak valid');
        setLoading(false);
        return;
    }

    const productData = { name, price, category: selectedCategory, imageUrl: imageUrl || undefined };

    try {
        if (product) {
            await api.updateProduct({ ...product, ...productData });
        } else {
            await api.addProduct(productData);
        }
        onSave();
    } catch (error) {
        console.error("Failed to save product", error);
        alert("Gagal menyimpan produk");
    } finally {
        setLoading(false);
    }
  };
  
  const TabButton: React.FC<{source: ImageSource, label: string}> = ({ source, label }) => (
    <button
      type="button"
      onClick={() => setImageSource(source)}
      className={`px-3 py-1.5 text-sm font-medium rounded-md ${
        imageSource === source 
          ? 'bg-primary-600 text-white' 
          : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="flex justify-between items-center p-6 pb-3 border-b dark:border-gray-600">
            <h3 className="text-2xl font-bold">{product ? 'Ubah Produk' : 'Tambah Produk'}</h3>
            <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">&times;</button>
          </div>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Foto Produk (Opsional)</label>
                <div className="flex items-center gap-4">
                     <div className="w-24 h-24 rounded-md bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden ring-1 ring-inset ring-gray-200 dark:ring-gray-600">
                        {imageUrl ? (
                            <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <DocumentDuplicateIcon className="w-10 h-10 text-gray-400" />
                        )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex gap-2">
                        <TabButton source="upload" label="Upload"/>
                        <TabButton source="url" label="Link Gambar"/>
                      </div>
                      {imageSource === 'upload' ? (
                         <label htmlFor="image-upload" className="cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-primary-600 hover:text-primary-500 border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm inline-block">
                            <span>Pilih File</span>
                            <input id="image-upload" name="image-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                        </label>
                      ) : (
                        <input
                          type="text"
                          placeholder="https://..."
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          className="block w-full text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600"/>
                      )}
                    </div>
                </div>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nama Produk</label>
              <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600"/>
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Kategori</label>
              <select 
                id="category" 
                value={categoryId} 
                onChange={e => setCategoryId(e.target.value)} 
                required 
                disabled={categoriesLoading || !!categoriesError}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 disabled:bg-gray-200 dark:disabled:bg-gray-700/50"
              >
                {categoriesLoading ? (
                  <option>Loading...</option>
                ) : categoriesError ? (
                  <option>{categoriesError}</option>
                ) : (
                  categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)
                )}
              </select>
            </div>
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Harga</label>
              <input type="number" id="price" value={price} onChange={e => setPrice(Number(e.target.value))} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600"/>
            </div>
          </div>
          <div className="p-6 pt-4 border-t dark:border-gray-600 flex justify-end gap-3 bg-gray-50 dark:bg-gray-800/50 rounded-b-lg">
            <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">
              Batal
            </button>
            <button type="submit" disabled={loading || !!categoriesError} className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-primary-300">
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormModal;
