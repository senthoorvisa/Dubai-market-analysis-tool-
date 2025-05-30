const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import service routes
const rentalRoutes = require('./rentalService/routes');
const propertyRoutes = require('./propertyLookup/routes');
const developerRoutes = require('./developerAnalysis/routes');
const demandRoutes = require('./marketDemand/routes');
const aiRoutes = require('./aiConnector/routes');

// Import schedulers
const rentalScheduler = require('./rentalService/scheduler');
const developerScheduler = require('./developerAnalysis/scheduler');
const demandScheduler = require('./marketDemand/scheduler');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/rentals', rentalRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/developers', developerRoutes);
app.use('/api/demand', demandRoutes);
app.use('/api/ai', aiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Dubai Market Analysis Backend Server running on port ${PORT}`);
  console.log(`📊 Services available:`);
  console.log(`   - Rental Analysis: http://localhost:${PORT}/api/rentals`);
  console.log(`   - Property Lookup: http://localhost:${PORT}/api/properties`);
  console.log(`   - Developer Analysis: http://localhost:${PORT}/api/developers`);
  console.log(`   - Market Demand: http://localhost:${PORT}/api/demand`);
  console.log(`   - AI Services: http://localhost:${PORT}/api/ai`);
  
  // Start schedulers
  console.log('🕐 Starting scheduled jobs...');
  rentalScheduler.start();
  developerScheduler.start();
  demandScheduler.start();
});

module.exports = app; 