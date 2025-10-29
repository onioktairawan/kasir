# Gemini POS - Arsitektur Aplikasi

Aplikasi ini sekarang telah diubah dari prototipe berbasis data tiruan (mock data) menjadi aplikasi frontend yang siap terhubung ke backend sungguhan. Perubahan ini penting untuk memungkinkan penyimpanan data persisten menggunakan database seperti MongoDB Atlas.

## Mengapa Perlu Backend?

Anda tidak bisa menghubungkan aplikasi frontend (React) secara langsung ke database karena alasan keamanan. Kredensial database (username, password) akan terekspos di browser siapa pun yang membuka aplikasi Anda.

Backend berfungsi sebagai perantara yang aman:
1.  **Frontend (React)**: Mengirim permintaan (misalnya, "berikan saya semua produk") ke Backend.
2.  **Backend (Server)**: Menerima permintaan, memvalidasinya, lalu berkomunikasi dengan aman ke Database.
3.  **Database (MongoDB)**: Mengirimkan data yang diminta kembali ke Backend.
4.  **Backend**: Meneruskan data tersebut ke Frontend untuk ditampilkan kepada pengguna.

---

## Contoh Backend Sederhana (Node.js + Express + MongoDB)

Berikut adalah contoh titik awal untuk backend Anda. Anda perlu membuat folder baru di samping folder frontend Anda untuk kode ini.

### 1. Inisialisasi Proyek Backend

```bash
mkdir backend
cd backend
npm init -y
npm install express mongoose cors dotenv
```
*   `express`: Kerangka kerja web untuk membuat API.
*   `mongoose`: Library untuk berinteraksi dengan MongoDB.
*   `cors`: Untuk mengizinkan frontend Anda berkomunikasi dengan backend.
*   `dotenv`: Untuk mengelola variabel lingkungan (seperti connection string Anda).

### 2. Buat File `.env`

Buat file bernama `.env` di dalam folder `backend`. **Di sinilah Anda harus meletakkan connection string Anda dengan aman.**

```
MONGO_URI=mongodb+srv://ditamelia711:Irawanoni02@bot-db.i4x9n1y.mongodb.net/kasir?retryWrites=true&w=majority&appName=bot-db
PORT=5000
```
**Penting**: Nama database (`kasir`) ditambahkan dalam URI. Mongoose akan otomatis membuat database dan collection jika belum ada saat Anda pertama kali memasukkan data.

### 3. Buat File `server.js`

Ini adalah file utama untuk server backend Anda.

```javascript
// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Untuk parsing body JSON

// --- Koneksi Database ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- Skema & Model Database (Contoh untuk Produk) ---
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true }
});
const Category = mongoose.model('Category', categorySchema);

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  category: { type: categorySchema, required: true }, // Menyimpan objek kategori
  imageUrl: { type: String, required: true }
});
const Product = mongoose.model('Product', productSchema);


// --- Rute API (Endpoints) ---

// GET semua produk
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST produk baru
app.post('/api/products', async (req, res) => {
    // Logika untuk memastikan kategori ada atau membuatnya
    // Untuk kesederhanaan, kita asumsikan data kategori dari frontend sudah benar
    const product = new Product({
        name: req.body.name,
        price: req.body.price,
        stock: req.body.stock,
        category: req.body.category,
        imageUrl: req.body.imageUrl,
    });

    try {
        const newProduct = await product.save();
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


// Tambahkan rute lain di sini (GET /api/categories, POST /api/transactions, dll.)


// --- Jalankan Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

### 4. Konfigurasi `vite.config.js` atau `package.json` di Frontend

Agar `fetch('/api/products')` berfungsi saat pengembangan, Anda perlu memberi tahu server pengembangan frontend untuk meneruskan permintaan tersebut ke backend Anda. Jika Anda menggunakan Vite (umum untuk React), tambahkan ini ke `vite.config.js`:

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Alamat backend Anda
        changeOrigin: true,
      },
    }
  }
})
```

### 5. Menjalankan Aplikasi
1.  Buka satu terminal, masuk ke folder `backend`, dan jalankan `node server.js`.
2.  Buka terminal kedua, masuk ke folder `frontend`, dan jalankan `npm run dev`.

Sekarang aplikasi frontend Anda akan dapat berkomunikasi dengan backend Anda, dan backend Anda akan menyimpan data di MongoDB Atlas.