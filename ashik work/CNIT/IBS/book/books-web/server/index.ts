import express from 'express';
import { join } from 'path';
import cors from 'cors';
import { databaseManager } from '../backend/database/manager';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, '../dist')));

// Import routes
import dbRoutes from '../backend/routes/db.routes';
import configRoutes from '../backend/routes/config.routes';
import fileRoutes from '../backend/routes/file.routes';

// Use routes
app.use('/api/db', dbRoutes);
app.use('/api/config', configRoutes);
app.use('/api/file', fileRoutes);

// Serve the Vue app
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../dist/index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
