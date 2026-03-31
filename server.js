require('dotenv').config();
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const booksRoutes = require('./routes/books');
const errorHandler = require('./middleware/errorHandler');
const { swaggerUi, swaggerSpec } = require('./config/swagger');
const authRoutes = require('./routes/auth');

dotenv.config();
const app = express();

// DB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/books', booksRoutes);

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.use('/auth', authRoutes);