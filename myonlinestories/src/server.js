const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
// Serve static files from the src directory
app.use(express.static(path.join(__dirname)));

// API endpoint to get environment variables
app.get('/api/config', (req, res) => {
  res.json({
    kimiApiKey: process.env.KIMI_API_KEY || '',
    runwareApiKey: process.env.RUNWARE_API_KEY || ''
  });
});

// Handle all other routes by serving index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`MyOnlineStories server is running on port ${PORT}`);
  console.log(`Visit: http://localhost:${PORT}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});
