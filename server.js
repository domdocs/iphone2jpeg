const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname)));

// Explicitly serve CSS files from public directory
app.use('/public', express.static(path.join(__dirname, 'public')));

// Explicitly serve JS files from js directory
app.use('/js', express.static(path.join(__dirname, 'js')));

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Log all incoming requests for debugging (remove in production)
app.use((req, res, next) => {
  console.log(`Request: ${req.method} ${req.url}`);
  next();
});

// Start the server
app.listen(PORT, () => {
  console.log(`HEIC to JPEG Converter app running at http://localhost:${PORT}`);
  console.log('Press Ctrl+C to quit');
});