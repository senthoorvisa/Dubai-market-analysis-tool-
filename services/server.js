const express = require('express');
const cors = require('cors');
const path = require('path');
const next = require('next');
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

const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev, dir: path.join(__dirname, '..') });
const handle = nextApp.getRequestHandler();

const app = express();
const PORT = process.env.PORT || 3000;

// Prepare Next.js app
nextApp.prepare().then(() => {
  // Middleware
  app.use(cors());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
  });

  // API Routes (these take precedence over Next.js routes)
  app.use('/api/rentals', rentalRoutes);
  app.use('/api/properties', propertyRoutes);
  app.use('/api/developers', developerRoutes);
  app.use('/api/demand', demandRoutes);
  app.use('/api/ai', aiRoutes);

  // Error handling middleware for API routes
  app.use('/api/*', (err, req, res, next) => {
    console.error('API Error:', err);
    res.status(500).json({
      error: 'Internal Server Error',
      message: err.message,
      timestamp: new Date().toISOString()
    });
  });

  // Handle all other routes with Next.js
  app.all('*', (req, res) => {
    return handle(req, res);
  });

  // Start server
  app.listen(PORT, () => {
    console.log(`🚀 Dubai Market Analysis Tool running on port ${PORT}`);
    console.log(`🌐 Frontend: http://localhost:${PORT}`);
    console.log(`📊 Backend APIs:`);
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
}).catch((ex) => {
  console.error('Error starting server:', ex);
  process.exit(1);
});

module.exports = app; 