const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

const authRoutes = require('./App/Routes/Admin/authRoutes');
const registerUserRouter = require('./App/Routes/Web/registerUser');
const userRouter = require('./App/Routes/Web/userRoutes');
const plantRoutes = require('./App/Routes/Admin/plantRoutes');
const cartRoutes = require('./App/Routes/Web/cartRoutes');
const orderRoutes = require('./App/Routes/Admin/orderRoutes');
const notificationRoutes = require('./App/Routes/Admin/notificationRoutes');
const plantRecognitionRoutes = require('./App/Routes/Web/plantRecognitionRoutes');
const serviceRoutes = require('./App/Routes/Web/serviceRoutes');

dotenv.config();

// Set JWT secret with fallback
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'fallback_jwt_secret_key_2024';
  console.log('⚠️  JWT_SECRET not found in .env, using fallback secret');
}

const app = express();

// MongoDB Connection String
const MONGODB_URI = 'mongodb+srv://PotGreen:B5FYHFS9kWHLB9z2@potgreen.xlumbap.mongodb.net/?retryWrites=true&w=majority&appName=PotGreen';

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization'],
  maxAge: 86400 // 24 hours
}));

app.use(express.json({ limit: '10mb' })); 
app.use(cookieParser());

// Static files
app.use('/uploads', express.static('uploads'));

// Web Routes
app.use('/api/web/registerUser', registerUserRouter);
app.use('/api/web/users', userRouter);
app.use('/api/web', userRouter); // This route will handle /api/web/me
app.use('/api/web/auth', authRoutes);
app.use('/api/web/total-users', userRouter);
app.use('/api/web/logout-id', authRoutes);
app.use('/api/web/userdata', userRouter);

// Plant Recognition Routes
app.use('/api/web/plant-recognition', plantRecognitionRoutes);

// Service Routes
app.use('/api/web/services', serviceRoutes);

// Plant Routes (both public and admin)
app.use('/api/admin/plants', plantRoutes); // All plant-related routes

// Cart Routes
app.use('/api/cart', cartRoutes);

// Order Routes
app.use('/api/orders', orderRoutes);

// Admin Routes
app.use('/api/admin/notifications', notificationRoutes);

// MongoDB Connection with enhanced error handling
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  retryWrites: true,
  w: 'majority'
})
.then(() => {
  console.log('✅ Connected to MongoDB Atlas successfully');
  const PORT = process.env.PORT || 8020;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// Enhanced error handling middleware
app.use((err, req, res, next) => {
  console.error('🔴 Server Error:', err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: err.message
  });
});