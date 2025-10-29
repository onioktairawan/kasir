import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { api } from '../../services/api';
import type { SalesReportData, TopProductReport } from '../../types';
import { ArrowDownTrayIcon } from '../common/Icons';

const Reports: React.FC = () => {
  const [reportData, setReportData] = useState<SalesReportData[]>([]);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [topProducts, setTopProducts] = useState<TopProductReport[]>([]);
  const [topProductsPeriod, setTopProductsPeriod] = useState<'3d' | '7d' | '30d'>('7d');
  const [topProductsLoading, setTopProductsLoading] = useState(true);
  const [topProductsError, setTopProductsError] = useState<string | null>(null);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
        const data = await api.getSalesReport(period);
        setReportData(data);
    } catch (err) {
        setError('Gagal memuat laporan penjualan.');
        console.error(err);
    } finally {
        setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const fetchTopProducts = useCallback(async () => {
    setTopProductsLoading(true);
    setTopProductsError(null);
    try {
        const data = await api.getTopProductsReport(topProductsPeriod);
        setTopProducts(data);
    } catch (err) {
        setTopProductsError('Gagal memuat produk terlaris.');
        console.error(err);
    } finally {
        setTopProductsLoading(false);
    }
  }, [topProductsPeriod]);

  useEffect(() => {
    fetchTopProducts();
  }, [fetchTopProducts]);

  const exportToCSV = () => {
    if (reportData.length === 0) return;
    const headers = "Period,Total Sales,Transactions\n";
    const rows = reportData.map(d => `${d.period},${d.totalSales},${d.transactions}`).join("\n");
    const csvContent = "data:text/csv;charset=utf-8," + headers + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sales_report_${period}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalSales = reportData.reduce((sum, d) => sum + d.totalSales, 0);
  const totalTransactions = reportData.reduce((sum, d) => sum + d.transactions, 0);
  
  const topProductPeriods = [
    { key: '3d', label: '3 Hari' },
    { key: '7d', label: '7 Hari' },
    { key: '30d', label: '1 Bulan' },
  ];

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Laporan Penjualan</h2>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <select 
            value={period} 
            onChange={e => setPeriod(e.target.value as 'daily' | 'weekly' | 'monthly')}
            className="px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="daily">Harian (7 Hari Terakhir)</option>
            {/* <option value="weekly">Mingguan</option>
            <option value="monthly">Bulanan</option> */}
          </select>
          <button
            onClick={exportToCSV}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            <ArrowDownTrayIcon className="w-5 h-5"/>
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-gray-500 dark:text-gray-400">Total Penjualan</h3>
            <p className="text-3xl md:text-4xl font-bold mt-2">{totalSales.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-gray-500 dark:text-gray-400">Total Transaksi</h3>
            <p className="text-3xl md:text-4xl font-bold mt-2">{totalTransactions}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md h-[300px] md:h-[500px]">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-12 h-12 border-4 border-t-primary-500 border-gray-200 rounded-full animate-spin"></div>
          </div>
        ) : error ? (
            <div className="flex items-center justify-center h-full text-red-500">
                <p>{error}</p>
            </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={reportData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
              <XAxis dataKey="period" />
              <YAxis tickFormatter={(value) => new Intl.NumberFormat('id-ID', { notation: 'compact', compactDisplay: 'short' }).format(value as number)}/>
              <Tooltip 
                contentStyle={{ 
                    backgroundColor: 'rgba(31, 41, 55, 0.8)', 
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: '#fff',
                }}
                formatter={(value: number) => value.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
              />
              <Legend />
              <Bar dataKey="totalSales" fill="#3b82f6" name="Total Penjualan" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="mt-8">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Produk Terlaris</h3>
          <div className="flex items-center gap-1 bg-gray-200 dark:bg-gray-700 p-1 rounded-lg self-start">
            {topProductPeriods.map(p => (
              <button
                key={p.key}
                onClick={() => setTopProductsPeriod(p.key as '3d' | '7d' | '30d')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  topProductsPeriod === p.key
                    ? 'bg-white dark:bg-gray-500 text-primary-600 dark:text-white shadow'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-600/50'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          {topProductsLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-8 h-8 border-4 border-t-primary-500 border-gray-200 rounded-full animate-spin"></div>
            </div>
          ) : topProductsError ? (
            <div className="flex items-center justify-center h-48 text-red-500">
              <p>{topProductsError}</p>
            </div>
          ) : topProducts.length > 0 ? (
            <ul className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {topProducts.map((product, index) => (
                <li key={product.id} className="flex items-center p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <span className="text-lg font-bold text-gray-400 dark:text-gray-500 w-8 text-center">{index + 1}</span>
                  <img src={product.imageUrl} alt={product.name} className="w-12 h-12 rounded-md object-cover mx-4" />
                  <p className="flex-grow font-semibold text-gray-800 dark:text-gray-100">{product.name}</p>
                  <p className="text-lg font-bold text-gray-800 dark:text-gray-100">{product.quantitySold} <span className="text-sm font-normal text-gray-500 dark:text-gray-400">terjual</span></p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex items-center justify-center h-48">
              <p className="text-center text-gray-500 dark:text-gray-400">Tidak ada data penjualan produk untuk periode ini.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;