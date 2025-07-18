require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const soundboardRoutes = require('./routes/soundboard');
const todoRoutes = require('./routes/todo');
const statsRoutes = require('./routes/stats');

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' })); // Allow for some file uploads

app.use('/api/auth', authRoutes);
app.use('/api/soundboard', soundboardRoutes);
app.use('/api/todo', todoRoutes);
app.use('/api/stats', statsRoutes);

const PORT = process.env.PORT || 4000;

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error('MongoDB connection error:', err));