require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const fileRoutes = require('./routes/files');
const errorHandler = require('./middleware/errorHandler');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT ;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files from uploads directory
app.use('/uploads', express.static(uploadsDir));

// Connect to MongoDB
connectDB();

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Personal Cloud Storage API is running',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/files', fileRoutes);

// Error handling middleware 
app.use(errorHandler);

// Handle 404 routes
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Uploads directory: ${uploadsDir}`);
  console.log(`API Health: http://localhost:${PORT}/api/health`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
});