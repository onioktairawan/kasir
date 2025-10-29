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

// Collections
const collections = {
    users: () => db.collection('users'),
    products: () => db.collection('products'),
    categories: () => db.collection('categories'),
    transactions: () => db.collection('transactions'),
};

// --- DATABASE SEEDING ---
// This function will run once to populate the database with initial data
async function seedDatabase() {
  const categoryCount = await collections.categories().countDocuments();
  if (categoryCount === 0) {
    console.log('No categories found. Seeding database with initial data...');
    const categoriesResult = await collections.categories().insertMany([
      { name: "Makanan" },
      { name: "Minuman" },
      { name: "Cemilan" }
    ]);
    console.log(`${categoriesResult.insertedCount} categories seeded.`);

    const makananCategory = await collections.categories().findOne({ name: "Makanan" });
    const minumanCategory = await collections.categories().findOne({ name: "Minuman" });

    if (makananCategory && minumanCategory) {
       const productsResult = await collections.products().insertMany([
          {
            name: "Nasi Goreng Spesial",
            price: 25000,
            categoryId: makananCategory._id,
            imageUrl: "https://d1vbn70lmn1nqe.cloudfront.net/prod/wp-content/uploads/2023/07/20043555/ini-resep-nasi-goreng-yang-lezat-dan-mudah-dibuat-halodoc.jpg"
          },
          {
            name: "Mie Ayam Bakso",
            price: 20000,
            categoryId: makananCategory._id,
            imageUrl: "https://asset.kompas.com/crops/p55hrfN_3V-c3n33flfF2i3p_X4=/0x0:1000x667/750x500/data/photo/2022/03/10/6229551b14271.jpg"
          },
          {
            name: "Es Teh Manis",
            price: 5000,
            categoryId: minumanCategory._id,
            imageUrl: "https://www.sasa.co.id/medias/page_medias/es_teh_susu_cincau.jpg"
          },
          {
            name: "Jus Alpukat",
            price: 15000,
            categoryId: minumanCategory._id,
            imageUrl: "https://www.sehataqua.co.id/images/1676865231_Jus-Alpukat.jpg"
          }
       ]);
       console.log(`${productsResult.insertedCount} products seeded.`);
    }
  } else {
    console.log('Database already contains data. Skipping seed.');
  }
}

async function connectDB() {
  try {
    await client.connect();
    console.log('Connected successfully to MongoDB');
    db = client.db(dbName);
    // Seed the database if it's empty
    await seedDatabase();
  } catch (e) {
    console.error('Could not connect to MongoDB', e);
    process.exit(1);
  }
}


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
    try {
        const products = await collections.products().aggregate([
            { $lookup: { from: 'categories', localField: 'categoryId', foreignField: '_id', as: 'categoryInfo' } },
            { $unwind: { path: '$categoryInfo', preserveNullAndEmptyArrays: true } }, // Keep products even if category is deleted
            { $addFields: { category: '$categoryInfo' } },
            { $project: { categoryInfo: 0, categoryId: 0 } }
        ]).toArray();
        res.json(mapIds(products));
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

app.get('/api/categories', async (req, res) => {
    const categories = await collections.categories().find({}).sort({ name: 1 }).toArray();
    res.json(mapIds(categories));
});

app.post('/api/categories', async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Category name is required" });
    const existing = await collections.categories().findOne({ name });
    if (existing) {
        return res.status(409).json({ message: 'Nama kategori sudah ada' });
    }
    const result = await collections.categories().insertOne({ name });
    const newCategory = await collections.categories().findOne({ _id: result.insertedId });
    res.status(201).json(mapId(newCategory));
});

app.put('/api/categories/:id', async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Category name is required" });
    const existing = await collections.categories().findOne({ name, _id: { $ne: new ObjectId(id) } });
    if (existing) {
        return res.status(409).json({ message: 'Nama kategori sudah ada' });
    }
    await collections.categories().updateOne({ _id: new ObjectId(id) }, { $set: { name } });
    const updatedCategory = await collections.categories().findOne({ _id: new ObjectId(id) });
    res.json(mapId(updatedCategory));
});

app.delete('/api/categories/:id', async (req, res) => {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid category ID format" });
    }
    const categoryId = new ObjectId(id);
    
    // Start a session for transaction
    const session = client.startSession();
    try {
        await session.withTransaction(async () => {
            // Design choice: delete all products in the category.
            await collections.products().deleteMany({ categoryId: categoryId }, { session });
            const deleteResult = await collections.categories().deleteOne({ _id: categoryId }, { session });
            if (deleteResult.deletedCount === 0) {
                throw new Error("Category not found");
            }
        });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ message: 'Transaction failed', error: e.message });
    } finally {
        await session.endSession();
    }
});


app.post('/api/products', async (req, res) => {
    const { category, ...productData } = req.body;
    if (!category || !category.id || !ObjectId.isValid(category.id)) {
        return res.status(400).json({ message: "A valid Category is required" });
    }
    const result = await collections.products().insertOne({ ...productData, categoryId: new ObjectId(category.id) });
    const newProductRaw = await collections.products().findOne({ _id: result.insertedId });
    
    // Join with category to return full product object
     const newProduct = await collections.products().aggregate([
        { $match: { _id: newProductRaw._id } },
        { $lookup: { from: 'categories', localField: 'categoryId', foreignField: '_id', as: 'categoryInfo' } },
        { $unwind: '$categoryInfo' },
        { $addFields: { category: '$categoryInfo' } },
        { $project: { categoryInfo: 0, categoryId: 0 } }
    ]).toArray();

    res.status(201).json(mapId(newProduct[0]));
});

app.post('/api/products/bulk', async (req, res) => {
    const productsData = req.body;
    if (!Array.isArray(productsData) || productsData.length === 0) {
        return res.status(400).json({ message: "No products array to import" });
    }
    const productsToInsert = productsData
        .filter(p => p.category && p.category.id && ObjectId.isValid(p.category.id))
        .map(({ category, ...p }) => ({
            ...p,
            categoryId: new ObjectId(category.id)
        }));

    if (productsToInsert.length === 0) {
        return res.status(400).json({ message: "No valid products with category IDs to import" });
    }
    const result = await collections.products().insertMany(productsToInsert);
    res.status(201).json({ success: true, count: result.insertedCount });
});


app.put('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid product ID format" });
    }
    const { category, ...productData } = req.body;
    if (!category || !category.id || !ObjectId.isValid(category.id)) {
        return res.status(400).json({ message: "A valid category is required" });
    }
    await collections.products().updateOne(
        { _id: new ObjectId(id) },
        { $set: { ...productData, categoryId: new ObjectId(category.id) } }
    );
    const updatedProduct = await collections.products().aggregate([
        { $match: { _id: new ObjectId(id) } },
        { $lookup: { from: 'categories', localField: 'categoryId', foreignField: '_id', as: 'categoryInfo' } },
        { $unwind: '$categoryInfo' },
        { $addFields: { category: '$categoryInfo' } },
        { $project: { categoryInfo: 0, categoryId: 0 } }
    ]).toArray();
    res.json(mapId(updatedProduct[0]));
});

app.delete('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid product ID format" });
    }
    await collections.products().deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
});


// TRANSACTIONS & REPORTS
app.post('/api/transactions', async (req, res) => {
    const transactionData = req.body;
    transactionData.timestamp = new Date();
    // Ensure item IDs are ObjectIds for accurate lookups in reports
    transactionData.items = transactionData.items.map(item => ({
        ...item,
        id: new ObjectId(item.id)
    }));

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
            name: { $first: '$items.name' }, // Keep the name from the transaction item
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
        { $unwind: { path: '$productInfo', preserveNullAndEmptyArrays: true } }, // Keep item even if product deleted
        { $lookup: { from: 'categories', localField: 'productInfo.categoryId', foreignField: '_id', as: 'productInfo.categoryInfo' } },
        { $unwind: { path: '$productInfo.categoryInfo', preserveNullAndEmptyArrays: true } },
        { $addFields: { 'productInfo.category': '$productInfo.categoryInfo' } },
        { $project: {
            quantity: 1,
            revenue: 1,
            product: {
              id: '$_id',
              name: { $ifNull: [ '$productInfo.name', '$name' ] }, // Use original name if product deleted
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
