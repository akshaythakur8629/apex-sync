const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'ApexSync PMIS API is running' });
});

// Import modules
const authRoutes = require('./modules/auth/routes');
const umsRoutes = require('./modules/ums/routes');
const performanceRoutes = require('./modules/performance/routes');
const decisionRoutes = require('./modules/decision-workflow/routes');
const authMiddleware = require('./shared/middleware/auth');
const tenantMiddleware = require('./shared/middleware/tenant');

app.use('/api/auth', authRoutes);
app.use('/api/ums', umsRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/decisions', decisionRoutes);

// Example of a protected tenant route
// app.use('/api/athletes', authMiddleware(), tenantMiddleware, athleteRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
    },
  });
});

module.exports = app;
