require('dotenv').config();
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase limit for images

const uri = process.env.MONGO_URI;
const dbName = process.env.MONGO_DB;

const client = new MongoClient(uri);
let db;

async function connectDB() {
  try {
    await client.connect();
    console.log('Connected successfully to MongoDB');
    db = client.db(dbName);
    // You can define collections here if needed
  } catch (e) {
    console.error('Could not connect to MongoDB', e);
    process.exit(1);
  }
}

// Collections
const collections = {
    users: () => db.collection('users'),
    products: () => db.collection('products'),
    categories: () => db.collection('categories'),
    transactions: () => db.collection('transactions'),
};

// Helper to map _id to id
const mapId = (item) => {
  if (!item) return null;
  const { _id, ...rest } = item;
  return { id: _id, ...rest };
};

const mapIds = (items) => items.map(mapId);

// --- API Endpoints ---

// USERS
app.post('/api/login', async (req, res) => {
  const { username, pin } = req.body;
  const user = await collections.users().findOne({ username, pin });
  if (user) {
    const { pin, ...userToReturn } = user;
    res.json(mapId(userToReturn));
  } else {
    res.status(401).json(null);
  }
});

app.get('/api/users', async (req, res) => {
  const users = await collections.users().find({}, { projection: { pin: 0 } }).toArray();
  res.json(mapIds(users));
});

app.post('/api/users', async (req, res) => {
    const { pin, ...userData } = req.body;
    if (!pin) return res.status(400).json({ message: "PIN is required" });
    const result = await collections.users().insertOne({ pin, ...userData });
    const newUser = await collections.users().findOne({ _id: result.insertedId }, { projection: { pin: 0 } });
    res.status(201).json(mapId(newUser));
});

app.put('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    const { pin, ...userData } = req.body;
    const updateDoc = { $set: userData };
    if (pin) updateDoc.$set.pin = pin;

    await collections.users().updateOne({ _id: new ObjectId(id) }, updateDoc);
    const updatedUser = await collections.users().findOne({ _id: new ObjectId(id) }, { projection: { pin: 0 } });
    res.json(mapId(updatedUser));
});

app.delete('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    await collections.users().deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
});

// PRODUCTS & CATEGORIES
app.get('/api/products', async (req, res) => {
    const products = await collections.products().aggregate([
        { $lookup: { from: 'categories', localField: 'categoryId', foreignField: '_id', as: 'categoryInfo' } },
        { $unwind: '$categoryInfo' },
        { $addFields: { category: '$categoryInfo' } },
        { $project: { categoryInfo: 0, categoryId: 0 } }
    ]).toArray();
    res.json(mapIds(products));
});

app.get('/api/categories', async (req, res) => {
    const categories = await collections.categories().find({}).toArray();
    res.json(mapIds(categories));
});

app.post('/api/products', async (req, res) => {
    const { category, ...productData } = req.body;
    const result = await collections.products().insertOne({ ...productData, categoryId: new ObjectId(category.id) });
    const newProduct = await collections.products().findOne({ _id: result.insertedId });
    res.status(201).json(mapId(newProduct));
});

app.post('/api/products/bulk', async (req, res) => {
    const productsData = req.body;
    if (!productsData || productsData.length === 0) {
        return res.status(400).json({ message: "No products to import" });
    }
    const productsToInsert = productsData.map(({ category, ...p }) => ({
        ...p,
        categoryId: new ObjectId(category.id)
    }));
    const result = await collections.products().insertMany(productsToInsert);
    res.status(201).json({ success: true, count: result.insertedCount });
});


app.put('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    const { category, ...productData } = req.body;
    await collections.products().updateOne(
        { _id: new ObjectId(id) },
        { $set: { ...productData, categoryId: new ObjectId(category.id) } }
    );
    res.json({ id, category, ...productData });
});

app.delete('/api/products/:id', async (req, res) => {
    await collections.products().deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ success: true });
});


// TRANSACTIONS & REPORTS
app.post('/api/transactions', async (req, res) => {
    const transactionData = req.body;
    transactionData.timestamp = new Date();
    const result = await collections.transactions().insertOne(transactionData);
    const newTransaction = await collections.transactions().findOne({ _id: result.insertedId });
    res.status(201).json(mapId(newTransaction));
});

app.get('/api/transactions', async (req, res) => {
    const { startDate, endDate } = req.query;
    const transactions = await collections.transactions().find({
        timestamp: { $gte: new Date(startDate), $lte: new Date(endDate) }
    }).sort({ timestamp: -1 }).toArray();
    res.json(mapIds(transactions));
});

app.get('/api/reports/sales', async (req, res) => {
    const { startDate, endDate } = req.query;
    const matchStage = { $match: { timestamp: { $gte: new Date(startDate), $lte: new Date(endDate) } } };

    const salesData = await collections.transactions().aggregate([
        matchStage,
        { $group: { _id: null, totalSales: { $sum: '$total' }, transactions: { $sum: 1 } } }
    ]).toArray();

    const chartDataAgg = await collections.transactions().aggregate([
        matchStage,
        { $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
            dailySales: { $sum: '$total' }
        }},
        { $sort: { _id: 1 } },
        { $project: { _id: 0, date: '$_id', sales: '$dailySales' } }
    ]).toArray();

    const result = {
        totalSales: salesData[0]?.totalSales || 0,
        transactions: salesData[0]?.transactions || 0,
        chartData: chartDataAgg
    };
    res.json(result);
});

app.get('/api/reports/top-products', async (req, res) => {
    const { startDate, endDate } = req.query;
    const topProductsAgg = await collections.transactions().aggregate([
        { $match: { timestamp: { $gte: new Date(startDate), $lte: new Date(endDate) } } },
        { $unwind: '$items' },
        { $group: {
            _id: '$items.id',
            quantity: { $sum: '$items.quantity' },
            revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }},
        { $sort: { quantity: -1 } },
        { $limit: 10 },
        { $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'productInfo'
        }},
        { $unwind: '$productInfo' },
        { $lookup: { from: 'categories', localField: 'productInfo.categoryId', foreignField: '_id', as: 'productInfo.categoryInfo' } },
        { $unwind: '$productInfo.categoryInfo' },
        { $addFields: { 'productInfo.category': '$productInfo.categoryInfo' } },
        { $project: {
            quantity: 1,
            revenue: 1,
            product: {
              id: '$productInfo._id',
              name: '$productInfo.name',
              price: '$productInfo.price',
              imageUrl: '$productInfo.imageUrl',
              category: {
                id: '$productInfo.category._id',
                name: '$productInfo.category.name'
              }
            },
            _id: 0
        }}
    ]).toArray();
    res.json(topProductsAgg);
});


// Start server
connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
});
