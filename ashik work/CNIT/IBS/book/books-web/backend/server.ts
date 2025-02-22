const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const reportsRoutes = require('./routes/reports');
const accountsRoutes = require('./routes/accounts');
const partiesRoutes = require('./routes/parties');
const journalRoutes = require('./routes/journal');
const invoicesRoutes = require('./routes/invoices');
const paymentsRoutes = require('./routes/payments');

dotenv.config();

const app = express();
const port = process.env.PORT || 3501;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/accounts', accountsRoutes);
app.use('/api/parties', partiesRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/invoices', invoicesRoutes);
app.use('/api/payments', paymentsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
