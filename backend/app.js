const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const salonRoutes = require("./routes/salon");
app.use("/api/salons", salonRoutes);

const userRoutes = require('./routes/admin');
app.use('/api/users', userRoutes);


app.get('/', (req, res) => {
  res.send('API is running...');
});

module.exports = app;
