import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { api } from '../../services/api';
import type { SalesReportData, Product } from '../../types';
import { ChevronDownIcon } from '../common/Icons';
import SalesActivityChart from './SalesActivityChart'; // Import komponen baru

type FilterType = 'today' | 'last7' | 'last30' | 'custom';
type TopProduct = { product: Product; quantity: number; revenue: number };

const Reports: React.FC = () => {
  const [reportData, setReportData] = useState<SalesReportData | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [filterType, setFilterType] = useState<FilterType>('today');
  const [isFilterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const [customDateRange, setCustomDateRange] = useState<{ start: string, end: string }>({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(true);

  const { startDate, endDate } = useMemo(() => {
    let end = new Date();
    end.setHours(23, 59, 59, 999);
    let start = new Date();
    start.setHours(0, 0, 0, 0);

    switch (filterType) {
      case 'last7':
        start.setDate(start.getDate() - 6);
        break;
      case 'last30':
        start.setDate(start.getDate() - 29);
        break;
      case 'custom':
        start = new Date(customDateRange.start);
        start.setHours(0, 0, 0, 0);
        end = new Date(customDateRange.end);
        end.setHours(23, 59, 59, 999);
        break;
      case 'today':
      default:
        break;
    }
    return { startDate: start, endDate: end };
  }, [filterType, customDateRange]);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
        const [salesData, productsData] = await Promise.all([
            api.getSalesReport(startDate, endDate),
            api.getTopSellingProducts(startDate, endDate)
        ]);
        setReportData(salesData);
        setTopProducts(productsData);
    } catch (error) {
        console.error("Failed to fetch reports:", error);
    } finally {
        setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
            setFilterOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filterLabels: Record<FilterType, string> = {
    today: 'Hari Ini',
    last7: '7 Hari Terakhir',
    last30: '1 Bulan Terakhir',
    custom: 'Kustom'
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Laporan Penjualan</h2>
        <div className="relative" ref={filterRef}>
            <button
                onClick={() => setFilterOpen(!isFilterOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
                <span>Filter: {filterLabels[filterType]}</span>
                <ChevronDownIcon className={`w-4 h-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
            </button>
            {isFilterOpen && (
                <div className="absolute left-0 md:right-0 md:left-auto mt-2 w-72 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-40 p-4">
                    <div className="space-y-2">
                        <button onClick={() => { setFilterType('today'); setFilterOpen(false); }} className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">Hari Ini</button>
                        <button onClick={() => { setFilterType('last7'); setFilterOpen(false); }} className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">7 Hari Terakhir</button>
                        <button onClick={() => { setFilterType('last30'); setFilterOpen(false); }} className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">1 Bulan Terakhir</button>
                        <hr className="border-gray-200 dark:border-gray-700 my-2"/>
                        <p className="text-sm font-medium px-3 pt-2 text-gray-700 dark:text-gray-300">Rentang Kustom</p>
                        <div className="flex items-center gap-2 px-3 py-2">
                            <input type="date" value={customDateRange.start} onChange={e => { setCustomDateRange(prev => ({...prev, start: e.target.value})); setFilterType('custom'); }} className="w-full px-2 py-1.5 border border-gray-300 bg-white rounded-md text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600" />
                            <span className="text-gray-500">-</span>
                            <input type="date" value={customDateRange.end} onChange={e => { setCustomDateRange(prev => ({...prev, end: e.target.value})); setFilterType('custom'); }} className="w-full px-2 py-1.5 border border-gray-300 bg-white rounded-md text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600" />
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md animate-pulse"><div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div><div className="h-10 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div></div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md animate-pulse"><div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div><div className="h-10 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div></div>
        </div>
      ) : reportData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-gray-500 dark:text-gray-400">Total Penjualan</h3>
                <p className="text-4xl font-bold mt-2">{reportData.totalSales.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-gray-500 dark:text-gray-400">Total Transaksi</h3>
                <p className="text-4xl font-bold mt-2">{reportData.transactions}</p>
            </div>
        </div>
      )}

      {/* -- START: Bagian Baru -- */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Aktivitas Penjualan</h3>
        {loading ? (
            <div className="h-48 flex items-center justify-center bg-gray-100 dark:bg-gray-700/50 rounded-md">
                <p className="text-gray-500">Memuat grafik...</p>
            </div>
        ) : reportData && reportData.chartData.length > 0 ? (
            <SalesActivityChart data={reportData.chartData} />
        ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">Tidak ada aktivitas penjualan pada periode ini.</p>
        )}
      </div>
      {/* -- END: Bagian Baru -- */}

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Produk Terlaris</h3>
        {loading ? (
            <div className="space-y-4">
                {Array.from({length: 3}).map((_, i) => <div key={i} className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>)}
            </div>
        ) : topProducts.length > 0 ? (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Produk</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Terjual</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Pendapatan</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {topProducts.map(({ product, quantity, revenue }) => (
                            <tr key={product.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{product.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-right">{quantity}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-right">{revenue.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        ) : (
             <p className="text-center text-gray-500 dark:text-gray-400 py-8">Tidak ada produk yang terjual pada periode ini.</p>
        )}
      </div>
    </div>
  );
};

export default Reports;
