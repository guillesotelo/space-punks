const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 3000; // Use the PORT environment variable for production

const isProduction = process.env.NODE_ENV === 'production';

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    // Read the index.html file
    fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
      if (err) {
        // Handle file read error
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Internal Server Error');
      } else {
        // Serve the HTML content
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        res.end(data);
      }
    });
  } else {
    // Handle other requests (e.g., 404 Not Found)
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Not Found');
  }
});

server.listen(port, () => {
  console.log(`Server running on port ${port} in ${isProduction ? 'production' : 'development'} mode`);
});
