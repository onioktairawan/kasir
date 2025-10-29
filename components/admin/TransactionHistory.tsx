import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { api } from '../../services/api';
import type { Transaction } from '../../types';
import ReceiptOptionsModal from '../pos/ReceiptOptionsModal';
import { ChevronDownIcon } from '../common/Icons';

type FilterType = 'today' | 'last7' | 'last30' | 'custom';

const TransactionHistory: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

    // Filter logic copied from Reports.tsx
    const [filterType, setFilterType] = useState<FilterType>('today');
    const [isFilterOpen, setFilterOpen] = useState(false);
    const filterRef = useRef<HTMLDivElement>(null);
    const [customDateRange, setCustomDateRange] = useState<{ start: string, end: string }>({
        start: new Date().toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0],
    });

    const { startDate, endDate } = useMemo(() => {
        let end = new Date();
        end.setHours(23, 59, 59, 999);
        let start = new Date();
        start.setHours(0, 0, 0, 0);

        switch (filterType) {
            case 'last7': start.setDate(start.getDate() - 6); break;
            case 'last30': start.setDate(start.getDate() - 29); break;
            case 'custom':
                start = new Date(customDateRange.start);
                start.setHours(0, 0, 0, 0);
                end = new Date(customDateRange.end);
                end.setHours(23, 59, 59, 999);
                break;
            case 'today': default: break;
        }
        return { startDate: start, endDate: end };
    }, [filterType, customDateRange]);

    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.getTransactions(startDate, endDate);
            setTransactions(data);
        } catch (error) {
            console.error("Failed to fetch transactions:", error);
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

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
        custom: `Kustom`
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Riwayat Transaksi</h2>
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

             <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Daftar Transaksi</h3>
                {loading ? (
                    <div className="text-center py-8">
                        <div className="w-8 h-8 border-4 border-t-primary-500 border-gray-200 rounded-full animate-spin mx-auto"></div>
                        <p className="mt-2 text-gray-500">Memuat data...</p>
                    </div>
                ) : transactions.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID Transaksi</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tanggal & Waktu</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Kasir</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {transactions.map((trx) => (
                                    <tr key={trx.id} onClick={() => setSelectedTransaction(trx)} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{trx.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{trx.timestamp.toLocaleString('id-ID', {dateStyle: 'medium', timeStyle: 'short'})}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{trx.cashier.username}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-right">{trx.total.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">Tidak ada transaksi pada periode ini.</p>
                )}
            </div>
            {selectedTransaction && <ReceiptOptionsModal transaction={selectedTransaction} onClose={() => setSelectedTransaction(null)} />}
        </div>
    );
};

export default TransactionHistory;