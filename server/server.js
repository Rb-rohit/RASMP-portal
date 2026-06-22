require('dotenv').config();

const path = require('path');
const express = require('express');
const connectDB = require('./config/db');
const seedDatabase = require('./services/seedService');
const auth = require('./middleware/auth');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { session } = require('./controllers/AuthController');

const systemRoutes = require('./routes/SystemRoute');
const authRoutes = require('./routes/AuthRoute');
const requirementRoutes = require('./routes/RequirementRoute');
const quotationRoutes = require('./routes/QuotationRoute');
const supplierRoutes = require('./routes/SupplierRoute');
const customerRoutes = require('./routes/CustomerRoute');
const notificationRoutes = require('./routes/NotificationRoute');

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://127.0.0.1:5173';
const allowedOrigins = new Set([
  CLIENT_ORIGIN,
  'http://localhost:5173',
  'http://127.0.0.1:5173'
]);

app.use(express.json({ limit: '25mb' }));

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.has(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

app.use('/api', systemRoutes);
app.use('/api/auth', authRoutes);
app.get('/api/session', auth(), session);
app.use('/api/requirements', requirementRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/notifications', notificationRoutes);

app.use('/api', notFound);

const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDistPath));
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

app.use(errorHandler);

const startServer = async () => {
  await connectDB();
  await seedDatabase();

  app.listen(PORT, () => {
    console.log(`RASMP API running on ${PORT}`);
  });
};

startServer();
