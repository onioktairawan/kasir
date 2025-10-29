import React, { useState, FormEvent, useEffect } from 'react';
import { User, UserRole } from '../../types';
import { api } from '../../services/api';

interface UserFormModalProps {
  user: User | null;
  onClose: () => void;
  onSave: () => void;
}

const UserFormModal: React.FC<UserFormModalProps> = ({ user, onClose, onSave }) => {
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.CASHIER);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setRole(user.role);
    }
  }, [user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!user && !pin) {
        setError("PIN wajib diisi untuk pengguna baru.");
        return;
    }
    setLoading(true);

    try {
      if (user) {
        // Update user
        await api.updateUser({ ...user, username, role, pin: pin || undefined });
      } else {
        // Add user
        await api.addUser({ username, role, pin });
      }
      onSave();
    } catch (err) {
      console.error("Failed to save user", err);
      setError("Gagal menyimpan pengguna. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="flex justify-between items-center p-6 pb-3 border-b dark:border-gray-600">
            <h3 className="text-2xl font-bold">{user ? 'Ubah Pengguna' : 'Tambah Pengguna'}</h3>
            <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">&times;</button>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
              <input type="text" id="username" value={username} onChange={e => setUsername(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600"/>
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Peran</label>
              <select id="role" value={role} onChange={e => setRole(e.target.value as UserRole)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600">
                <option value={UserRole.CASHIER}>Kasir</option>
                <option value={UserRole.ADMIN}>Admin</option>
              </select>
            </div>
            <div>
              <label htmlFor="pin" className="block text-sm font-medium text-gray-700 dark:text-gray-300">PIN</label>
              <input type="password" id="pin" value={pin} onChange={e => setPin(e.target.value)} required={!user} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600" placeholder={user ? "Isi untuk mengubah PIN" : "Wajib diisi"}/>
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

export default UserFormModal;
