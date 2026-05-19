const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
// check ci
  if (req.accepts('html')) {
    return res.status(statusCode).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${statusCode} - Server Error | GoHire</title>
          <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap" rel="stylesheet">
          <style>
              :root {
                  --error: #ef4444;
                  --bg: #0f172a;
                  --text: #f8fafc;
                  --text-muted: #94a3b8;
              }
              body {
                  font-family: 'Outfit', sans-serif;
                  background-color: var(--bg);
                  color: var(--text);
                  height: 100vh;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  margin: 0;
                  overflow: hidden;
              }
              .container { text-align: center; padding: 2rem; z-index: 10; }
              .error-code {
                  font-size: 8rem;
                  font-weight: 800;
                  color: var(--error);
                  margin-bottom: 0.5rem;
                  text-shadow: 0 0 20px rgba(239, 68, 68, 0.3);
              }
              .error-message { font-size: 1.8rem; margin-bottom: 1.5rem; }
              .description { color: var(--text-muted); max-width: 500px; margin: 0 auto 2rem; }
              .btn { 
                  display: inline-block; background: #334155; color: white; 
                  padding: 0.8rem 2rem; border-radius: 0.5rem; text-decoration: none; 
                  transition: all 0.3s; 
              }
              .btn:hover { background: #475569; transform: translateY(-2px); }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="error-code">${statusCode}</div>
              <h1 class="error-message">Oops! Something went wrong</h1>
              <p class="description">${message}</p>
              <a href="/" class="btn">Return Home</a>
          </div>
      </body>
      </html>
    `);
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;


