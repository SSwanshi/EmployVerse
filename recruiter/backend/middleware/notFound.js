const notFound = (req, res, next) => {
    res.status(404);

    // Design a premium looking 404 page
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>404 - Page Not Found | GoHire</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap" rel="stylesheet">
        <style>
            :root {
                --primary: #6366f1;
                --primary-hover: #4f46e5;
                --bg: #0f172a;
                --card-bg: #1e293b;
                --text: #f8fafc;
                --text-muted: #94a3b8;
            }
            
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Outfit', sans-serif;
                background-color: var(--bg);
                color: var(--text);
                height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
            }

            .container {
                text-align: center;
                padding: 2rem;
                position: relative;
                z-index: 10;
            }

            .error-code {
                font-size: 10rem;
                font-weight: 800;
                line-height: 1;
                margin-bottom: 1rem;
                background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                animation: pulse 2s infinite ease-in-out;
            }

            .error-message {
                font-size: 2rem;
                font-weight: 600;
                margin-bottom: 1rem;
            }

            .description {
                color: var(--text-muted);
                font-size: 1.1rem;
                max-width: 500px;
                margin: 0 auto 2.5rem;
                line-height: 1.6;
            }

            .btn {
                display: inline-block;
                background-color: var(--primary);
                color: white;
                padding: 0.8rem 2rem;
                border-radius: 0.5rem;
                text-decoration: none;
                font-weight: 600;
                transition: all 0.3s ease;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            }

            .btn:hover {
                background-color: var(--primary-hover);
                transform: translateY(-2px);
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            }

            .background-blobs {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 1;
                overflow: hidden;
            }

            .blob {
                position: absolute;
                border-radius: 50%;
                filter: blur(80px);
                opacity: 0.2;
                z-index: -1;
            }

            .blob-1 {
                top: -10%;
                left: -10%;
                width: 400px;
                height: 400px;
                background-color: #6366f1;
            }

            .blob-2 {
                bottom: -10%;
                right: -10%;
                width: 300px;
                height: 300px;
                background-color: #a855f7;
            }

            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }

            @media (max-width: 640px) {
                .error-code { font-size: 6rem; }
                .error-message { font-size: 1.5rem; }
            }
        </style>
    </head>
    <body>
        <div class="background-blobs">
            <div class="blob blob-1"></div>
            <div class="blob blob-2"></div>
        </div>
        
        <div class="container">
            <div class="error-code">404</div>
            <h1 class="error-message">Page Not Found</h1>
            <p class="description">
                The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>
            <a href="/" class="btn">Back to Home</a>
        </div>
    </body>
    </html>
  `;

    // Check if the request accepts HTML
    if (req.accepts('html')) {
        res.send(htmlContent);
        return;
    }

    // Fallback to JSON for API requests
    res.json({
        success: false,
        message: "404 - Page Not Found",
        path: req.originalUrl
    });
};

module.exports = notFound;
