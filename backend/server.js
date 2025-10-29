// Impor modul yang dibutuhkan
require('dotenv').config(); // Untuk memuat variabel dari file .env
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Inisialisasi aplikasi Express
const app = express();

// Middleware
app.use(cors()); // Mengizinkan Cross-Origin Resource Sharing
app.use(express.json({ limit: '5mb' })); // Mengizinkan parsing body JSON dengan limit lebih besar untuk gambar base64

// --- Koneksi ke Database MongoDB Atlas ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected successfully.'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- Skema & Model Database (Struktur Data) ---

// Skema untuk Pengguna (User)
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  pin: { type: String, required: true }, // Di dunia nyata, ini harus di-hash
  role: { type: String, enum: ['admin', 'cashier'], required: true },
});
const User = mongoose.model('User', userSchema);

// Skema untuk Kategori
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }
});
const Category = mongoose.model('Category', categorySchema);

// Skema untuk Produk
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, min: 0 },
  category: { type: categorySchema, required: true },
  imageUrl: { type: String, required: true }
});
const Product = mongoose.model('Product', productSchema);

// Skema untuk Transaksi
const transactionSchema = new mongoose.Schema({
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    price: Number,
    quantity: Number,
    imageUrl: String,
  }],
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  amountPaid: { type: Number, required: true },
  change: { type: Number, required: true },
  cashier: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      username: String,
  },
  timestamp: { type: Date, default: Date.now }
});
const Transaction = mongoose.model('Transaction', transactionSchema);


// --- Seeding Data Awal (Hanya jika database kosong) ---
const seedDatabase = async () => {
    try {
        const userCount = await User.countDocuments();
        if (userCount === 0) {
            console.log('No users found. Seeding initial data...');
            await User.insertMany([
                { username: 'admin', pin: '1234', role: 'admin' },
                { username: 'kasir1', pin: '1111', role: 'cashier' }
            ]);
            console.log('Users seeded.');
        }

        const categoryCount = await Category.countDocuments();
        if (categoryCount === 0) {
            console.log('No categories found. Seeding initial data...');
            await Category.insertMany([
                { name: 'Makanan' }, { name: 'Minuman' }, { name: 'Cemilan' }
            ]);
            console.log('Categories seeded.');
        }

        const productCount = await Product.countDocuments();
        if (productCount === 0) {
            console.log('No products found. Seeding initial data...');
            const makananCat = await Category.findOne({name: 'Makanan'});
            const minumanCat = await Category.findOne({name: 'Minuman'});
            await Product.insertMany([
                { name: 'Nasi Goreng Spesial', price: 25000, stock: 50, category: makananCat, imageUrl: 'https://i.imgur.com/ODt3aA7.jpeg' },
                { name: 'Kopi Susu Gula Aren', price: 18000, stock: 100, category: minumanCat, imageUrl: 'https://i.imgur.com/qE2KUTj.jpeg' }
            ]);
            console.log('Products seeded.');
        }
    } catch (error) {
        console.error('Error seeding database:', error);
    }
};

// Panggil fungsi seeding setelah koneksi mongoose siap
mongoose.connection.once('open', () => {
  seedDatabase();
});


// ======================================================
// --- RUTE API (ENDPOINTS) ---
// ======================================================

// --- Rute Pengguna (Auth) ---
app.get('/api/users', async (req, res) => {
    try {
        const { username, pin } = req.query;
        // Peringatan: Ini metode login yang SANGAT tidak aman. Hanya untuk demo.
        const user = await User.findOne({ username, pin });
        if (user) {
            res.json([{ id: user._id, username: user.username, role: user.role }]);
        } else {
            res.status(404).json({ message: "User not found or pin incorrect" });
        }
    } catch (err) {
        res.status(500).json({ message: "Server error during login" });
    }
});


// --- Rute Kategori ---
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories.map(c => ({ id: c._id, name: c.name })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// --- Rute Produk ---
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products.map(p => ({
        id: p._id,
        name: p.name,
        price: p.price,
        stock: p.stock,
        category: { id: p.category._id, name: p.category.name },
        imageUrl: p.imageUrl
    })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/products', async (req, res) => {
    try {
        // Cari atau buat kategori baru
        let category = await Category.findOne({ name: req.body.category.name });
        if (!category) {
            category = new Category({ name: req.body.category.name });
            await category.save();
        }

        const product = new Product({
            name: req.body.name,
            price: req.body.price,
            stock: req.body.stock,
            category: category,
            imageUrl: req.body.imageUrl,
        });
        const newProduct = await product.save();
        res.status(201).json({
            id: newProduct._id,
            name: newProduct.name,
            price: newProduct.price,
            stock: newProduct.stock,
            category: { id: category._id, name: category.name },
            imageUrl: newProduct.imageUrl
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.put('/api/products/:id', async (req, res) => {
    try {
        const { name, price, stock, category, imageUrl } = req.body;
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            { name, price, stock, category, imageUrl },
            { new: true } // Mengembalikan dokumen yang sudah diupdate
        );
        if (!updatedProduct) return res.status(404).json({ message: 'Product not found' });
        res.json(updatedProduct);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// --- Rute Transaksi ---
app.post('/api/transactions', async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { items, cashierId, amountPaid, discount, subtotal, total } = req.body;
        
        // 1. Kurangi stok produk
        for (const item of items) {
            const product = await Product.findById(item.id).session(session);
            if (!product || product.stock < item.quantity) {
                throw new Error(`Stok tidak cukup untuk produk: ${item.name}`);
            }
            product.stock -= item.quantity;
            await product.save({ session });
        }

        // 2. Ambil data kasir
        const cashierUser = await User.findById(cashierId).session(session);
        if (!cashierUser) throw new Error('Kasir tidak ditemukan');

        // 3. Buat data transaksi baru
        const transaction = new Transaction({
            items: items.map(item => ({
                productId: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                imageUrl: item.imageUrl
            })),
            subtotal,
            discount,
            total,
            amountPaid,
            change: amountPaid - total,
            cashier: {
                id: cashierUser._id,
                username: cashierUser.username,
            },
        });
        const newTransaction = await transaction.save({ session });

        await session.commitTransaction();
        
        // Format respons agar sesuai dengan frontend
        res.status(201).json({
            id: newTransaction._id.toString(),
            items: newTransaction.items,
            subtotal: newTransaction.subtotal,
            discount: newTransaction.discount,
            total: newTransaction.total,
            amountPaid: newTransaction.amountPaid,
            change: newTransaction.change,
            cashier: {
                id: cashierUser._id,
                username: cashierUser.username,
                role: cashierUser.role
            },
            timestamp: newTransaction.timestamp,
        });

    } catch (err) {
        await session.abortTransaction();
        res.status(400).json({ message: err.message });
    } finally {
        session.endSession();
    }
});


// --- Rute Laporan ---
app.get('/api/reports/sales', async (req, res) => {
    try {
        const { period } = req.query; // 'daily'
        let report = [];

        if (period === 'daily') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            for (let i = 0; i < 7; i++) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                
                const startOfDay = new Date(date);
                const endOfDay = new Date(date);
                endOfDay.setHours(23, 59, 59, 999);
                
                const transactions = await Transaction.find({
                    timestamp: { $gte: startOfDay, $lte: endOfDay }
                });

                const totalSales = transactions.reduce((sum, t) => sum + t.total, 0);
                report.push({
                    period: date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' }),
                    totalSales: totalSales,
                    transactions: transactions.length
                });
            }
        }
        res.json(report.reverse());
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get('/api/reports/topproducts', async (req, res) => {
    try {
        const { period } = req.query; // '3d', '7d', '30d'
        const days = parseInt(period.replace('d', ''));

        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - days);

        const topProducts = await Transaction.aggregate([
            { $match: { timestamp: { $gte: dateLimit } } },
            { $unwind: '$items' },
            { $group: {
                _id: '$items.productId',
                name: { $first: '$items.name' },
                imageUrl: { $first: '$items.imageUrl' },
                quantitySold: { $sum: '$items.quantity' }
            }},
            { $sort: { quantitySold: -1 } },
            { $limit: 5 },
            { $project: {
                id: '$_id',
                name: 1,
                imageUrl: 1,
                quantitySold: 1,
                _id: 0
            }}
        ]);
        
        res.json(topProducts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- Menjalankan Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
