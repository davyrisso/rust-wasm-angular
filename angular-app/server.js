const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist/angular-app')));

// Set correct MIME type for WASM files
app.use('/assets/wasm', (req, res, next) => {
  if (req.url.endsWith('.wasm')) {
    res.set('Content-Type', 'application/wasm');
  }
  next();
}, express.static(path.join(__dirname, 'dist/angular-app/assets/wasm')));

// Handle all other routes by serving index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/angular-app/index.html'));
});

const port = process.env.PORT || 4200;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 