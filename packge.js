const compression = require('compression');
const express = require('express');
const app = express();

// Enable compression for API responses
app.use(compression({
  level: 6, // Balance between speed and compression
  threshold: 1024, // Compress responses > 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false; // Skip compression if client can't handle it
    }
    return compression.filter(req, res);
  }
}));

// Static assets with different compression
app.use(express.static('public', {
  maxAge: '1d',
  setHeaders: (res, path) => {
    if (path.endsWith('.br')) {
      res.setHeader('Content-Encoding', 'br');
    } else if (path.endsWith('.gz')) {
      res.setHeader('Content-Encoding', 'gzip');
    }
  }
}));