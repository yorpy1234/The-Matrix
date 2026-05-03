const express = require('express');
const cors = require('cors');
const httpProxy = require('http-proxy');
const path = require('path');
require('dotenv').config();

const app = express();
const proxy = httpProxy.createProxyServer({
  changeOrigin: true,
  onProxyRes(proxyRes) {
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Proxy endpoint
app.post('/api/proxy', (req, res) => {
  const { url } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    // Validate URL format
    new URL(url);
    
    // Forward the request to the target URL
    proxy.web(req, res, { target: url }, (error) => {
      if (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ error: 'Failed to access the website' });
      }
    });
  } catch (error) {
    res.status(400).json({ error: 'Invalid URL' });
  }
});

// API endpoint to fetch webpage content
app.get('/api/fetch', (req, res) => {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    new URL(url);
    // In a real implementation, you'd use a library like jsdom or puppeteer
    // For now, return a success response
    res.json({ success: true, message: 'Fetching webpage...' });
  } catch (error) {
    res.status(400).json({ error: 'Invalid URL' });
  }
});

// Home route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🔥 The Matrix Server running on http://localhost:${PORT}`);
});
