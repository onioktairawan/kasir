import React, { useState, useEffect, useCallback, useRef, ChangeEvent } from 'react';
import type { Product, Category } from '../../types';
import { api } from '../../services/api';
import ProductFormModal from './ProductFormModal';
import { DocumentDuplicateIcon } from '../common/Icons';

declare const XLSX: any; // Use 'any' to avoid installing types for the CDN script

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const data = await api.getProducts();
    setProducts(data);
    setLoading(false);
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
      await api.deleteProduct(productId);
      await fetchProducts();
    }
  };

  const handleImportClick = () => {
    importInputRef.current?.click();
  };
  
  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        // Fix: Replaced `UintArray` with `Uint8Array` as `UintArray` is not a valid type.
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);

        const categories = await api.getCategories();
        const categoryMap = categories.reduce((acc: { [key: string]: Category }, cat) => {
            acc[cat.name.toLowerCase()] = cat;
            return acc;
        }, {});

        const newProducts: Omit<Product, 'id'>[] = json.map((row: any) => {
            const categoryName = String(row.kategori || '').toLowerCase();
            const category = categoryMap[categoryName];
            if (!row.nama || !row.harga || !category) {
                console.warn("Baris tidak valid dilewati:", row);
                return null;
            }
            return {
                name: String(row.nama),
                price: Number(row.harga),
                category: category,
                imageUrl: row.imageUrl || undefined,
            };
        }).filter((p: Omit<Product, 'id'> | null): p is Omit<Product, 'id'> => p !== null);

        if (newProducts.length > 0) {
            await api.addMultipleProducts(newProducts);
            alert(`${newProducts.length} produk berhasil diimpor!`);
            fetchProducts();
        } else {
            alert("Tidak ada produk valid yang ditemukan di file.");
        }
      } catch (error) {
        console.error("Gagal mengimpor file:", error);
        alert("Terjadi kesalahan saat mengimpor file. Pastikan formatnya benar.");
      } finally {
        setLoading(false);
        if (importInputRef.current) importInputRef.current.value = ""; // Reset input
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleExport = () => {
    const dataToExport = products.map(p => ({
      nama: p.name,
      harga: p.price,
      kategori: p.category.name,
      imageUrl: p.imageUrl || ''
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Produk");
    XLSX.writeFile(workbook, "products.xlsx");
  };

  const handleDownloadTemplate = () => {
    const templateData = [{
      nama: 'Contoh Nasi Goreng',
      harga: 25000,
      kategori: 'Makanan',
      imageUrl: 'https://example.com/nasi-goreng.jpg'
    },
    {
      nama: 'Contoh Es Teh',
      harga: 5000,
      kategori: 'Minuman',
      imageUrl: ''
    }];
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    XLSX.writeFile(workbook, "template_produk.xlsx");
  }


  return (
    <div>
      <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Manajemen Produk</h2>
        <div className="flex flex-wrap gap-2 items-center">
            <input type="file" ref={importInputRef} onChange={handleFileChange} className="hidden" accept=".xlsx, .xls" />
            <button onClick={handleImportClick} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">Impor XLSX</button>
            <button onClick={handleExport} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">Ekspor XLSX</button>
            <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm">Tambah Produk</button>
             <a onClick={handleDownloadTemplate} className="text-xs text-gray-500 hover:underline cursor-pointer ml-2">Unduh Template</a>
        </div>
      </div>
      
      {loading ? (
        <p>Loading...</p>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(product => (
            <div key={product.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-xl hover:scale-105">
                <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover"/>
                  ) : (
                    <DocumentDuplicateIcon className="w-20 h-20 text-gray-400 dark:text-gray-500" />
                  )}
                </div>
                <div className="p-4 flex flex-col flex-grow">
                    <span className="text-sm bg-primary-100 text-primary-800 dark:bg-primary-900/50 dark:text-primary-300 px-2 py-0.5 rounded-full self-start">{product.category.name}</span>
                    <h3 className="text-lg font-bold mt-2 text-gray-800 dark:text-white flex-grow">{product.name}</h3>
                    <div className="flex justify-between items-center mt-2">
                        <p className="text-xl font-semibold text-primary-600 dark:text-primary-400">
                            {product.price.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
                        </p>
                    </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 flex justify-end gap-2">
                    <button onClick={() => handleOpenModal(product)} className="text-sm font-medium text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300">Ubah</button>
                    <button onClick={() => handleDelete(product.id)} className="text-sm font-medium text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">Hapus</button>
                </div>
            </div>
          ))}
        </div>
      ) : (
         <div className="text-center py-16">
            <p className="text-gray-500 dark:text-gray-400">Anda belum memiliki produk.</p>
             <button
              onClick={() => handleOpenModal()}
              className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Tambah Produk Pertama Anda
            </button>
        </div>
      )}
      
      {isModalOpen && <ProductFormModal product={selectedProduct} onClose={handleCloseModal} onSave={handleSave} />}
    </div>
  );
};

export default ProductManagement;
