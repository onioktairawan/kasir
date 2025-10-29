import React, { useState } from 'react';
import type { Transaction } from '../../types';
import Receipt from './Receipt';
import { XMarkIcon, ArrowDownTrayIcon, PrinterIcon } from '../common/Icons';

interface ReceiptModalProps {
  transaction: Transaction;
  onClose: () => void;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({ transaction, onClose }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handlePrint = () => {
    const receiptElement = document.getElementById('receipt-to-print');
    if (receiptElement) {
      const content = receiptElement.outerHTML;
      const iframe = document.createElement('iframe');
      // Hide the iframe
      iframe.style.position = 'absolute';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);
      
      const doc = iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write('<html><head><title>Struk</title>');
        // Inject Tailwind to style the receipt
        doc.write('<script src="https://cdn.tailwindcss.com"><\/script>');
        // Set print page size to match typical POS printers
        doc.write('<style>@page { size: 80mm auto; margin: 0; } body { margin: 0; }</style>')
        doc.write('</head><body>');
        doc.write(content);
        doc.write('</body></html>');
        doc.close();

        // Wait for Tailwind to initialize before printing
        setTimeout(() => {
            if (iframe.contentWindow) {
                iframe.contentWindow.focus();
                iframe.contentWindow.print();
            }
            document.body.removeChild(iframe);
        }, 500);
      } else {
        document.body.removeChild(iframe);
      }
    }
  };

  const handleDownloadJPG = async () => {
    const receiptElement = document.getElementById('receipt-to-print');
    if (!receiptElement) return;

    setIsDownloading(true);
    try {
        const canvas = await (window as any).html2canvas(receiptElement, {
            scale: 2, // Increase scale for better quality
        });
        const image = canvas.toDataURL('image/jpeg', 0.9);
        const link = document.createElement('a');
        link.href = image;
        link.download = `struk-${transaction.id}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error("Error generating JPG:", error);
        alert("Gagal membuat file JPG. Silakan coba lagi.");
    } finally {
        setIsDownloading(false);
    }
  };


  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-60" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm flex flex-col mx-4 sm:mx-0" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b dark:border-gray-600 flex justify-between items-center">
          <h3 className="text-xl font-bold">Transaksi Berhasil</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 overflow-y-auto max-h-[60vh]">
          <div className="mx-auto" style={{ width: '300px' }}>
            <Receipt transaction={transaction} />
          </div>
        </div>
        <div className="p-4 bg-gray-100 dark:bg-gray-800 border-t dark:border-gray-700 flex flex-wrap justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">
            Tutup
          </button>
          <button
            onClick={handleDownloadJPG}
            disabled={isDownloading}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-emerald-300"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            {isDownloading ? 'Menyimpan...' : 'Simpan JPG'}
          </button>
          <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
            <PrinterIcon className="w-5 h-5" />
            Cetak
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;