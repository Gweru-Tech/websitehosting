const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const bcrypt = require('bcryptjs');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3000;

// Security and middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"]
        }
    }
}));

app.use(compression());
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'ntandostore-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/deployed', express.static(path.join(__dirname, 'deployed')));
app.use(express.static(path.join(__dirname, 'public')));

// Database setup
const db = new sqlite3.Database('./ntandostore.db');

// Initialize database
db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME
    )`);

    // Files table
    db.run(`CREATE TABLE IF NOT EXISTS files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        filename TEXT NOT NULL,
        original_name TEXT NOT NULL,
        file_path TEXT NOT NULL,
        file_size INTEGER,
        mime_type TEXT,
        upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Deployed websites table
    db.run(`CREATE TABLE IF NOT EXISTS websites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        site_name TEXT NOT NULL,
        domain TEXT,
        site_path TEXT NOT NULL,
        deployment_status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Insert default user
    const defaultPassword = bcrypt.hashSync('Ntando', 10);
    db.run(`INSERT OR IGNORE INTO users (username, password, email) VALUES (?, ?, ?)`, 
           ['Ntando', defaultPassword, 'ntando@ntandostore.com']);
});

// File upload configuration
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads', req.session.userId?.toString() || 'temp');
        await fs.mkdir(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept all file types for hosting flexibility
        cb(null, true);
    }
});

// Authentication middleware
function requireAuth(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    next();
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/dashboard', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Login endpoint
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (!user || !bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        req.session.userId = user.id;
        req.session.username = user.username;
        
        // Update last login
        db.run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);
        
        res.json({ 
            message: 'Login successful', 
            user: { 
                id: user.id, 
                username: user.username, 
                email: user.email 
            } 
        });
    });
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Logout failed' });
        }
        res.json({ message: 'Logout successful' });
    });
});

// Check auth status
app.get('/api/auth-status', (req, res) => {
    if (req.session.userId) {
        res.json({ 
            authenticated: true, 
            user: { 
                id: req.session.userId, 
                username: req.session.username 
            } 
        });
    } else {
        res.json({ authenticated: false });
    }
});

// File upload endpoint
app.post('/api/upload', requireAuth, upload.array('files', 10), async (req, res) => {
    try {
        const uploadedFiles = [];
        
        for (const file of req.files) {
            // Save file info to database
            db.run(`INSERT INTO files (user_id, filename, original_name, file_path, file_size, mime_type) 
                    VALUES (?, ?, ?, ?, ?, ?)`, [
                req.session.userId,
                file.filename,
                file.originalname,
                file.path,
                file.size,
                file.mimetype
            ], function(err) {
                if (err) {
                    console.error('Error saving file to database:', err);
                }
            });
            
            uploadedFiles.push({
                id: this.lastID,
                filename: file.filename,
                originalName: file.originalname,
                size: file.size,
                mimeType: file.mimetype,
                url: `/uploads/${req.session.userId}/${file.filename}`
            });
        }
        
        res.json({ 
            message: 'Files uploaded successfully', 
            files: uploadedFiles 
        });
    } catch (error) {
        res.status(500).json({ error: 'Upload failed: ' + error.message });
    }
});

// Get user files
app.get('/api/files', requireAuth, (req, res) => {
    db.all('SELECT * FROM files WHERE user_id = ? ORDER BY upload_date DESC', 
           [req.session.userId], (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(files);
    });
});

// Deploy website endpoint
app.post('/api/deploy', requireAuth, upload.array('websiteFiles'), async (req, res) => {
    try {
        const { siteName, domain, subdomain } = req.body;
        
        if (!siteName) {
            return res.status(400).json({ error: 'Site name is required' });
        }
        
        let deployDir, deploymentUrl;
        let finalDomain = domain;
        
        // Handle subdomain creation
        if (subdomain) {
            const allowedDomains = ['ntando.store', 'ntando.cloud'];
            const selectedDomain = domain || 'ntando.store';
            
            if (!allowedDomains.includes(selectedDomain)) {
                return res.status(400).json({ 
                    error: 'Only ntando.store and ntando.cloud domains are supported for subdomains' 
                });
            }
            
            const fullDomain = `${subdomain}.${selectedDomain}`;
            deployDir = path.join(__dirname, 'deployed', 'subdomains', subdomain);
            
            // For now, use simulation URL since actual DNS requires domain ownership
            deploymentUrl = `${req.protocol}://${req.get('host')}/subdomain/${subdomain}`;
            finalDomain = fullDomain;
            
            console.log(`Creating subdomain: ${fullDomain} at ${deployDir}`);
            console.log(`Simulation URL: ${deploymentUrl}`);
        } else if (domain) {
            if (domain.includes('ntando.store') || domain.includes('ntando.cloud')) {
                // Handle custom domain on our allowed domains
                const subdomainName = domain.split('.')[0];
                deployDir = path.join(__dirname, 'deployed', 'subdomains', subdomainName);
                deploymentUrl = `https://${domain}`;
            } else {
                // Handle external custom domain
                deployDir = path.join(__dirname, 'deployed', req.session.userId.toString(), siteName);
                deploymentUrl = `https://${domain}`;
            }
        } else {
            // Default deployment path
            deployDir = path.join(__dirname, 'deployed', req.session.userId.toString(), siteName);
            deploymentUrl = `${req.protocol}://${req.get('host')}/deployed/${req.session.userId}/${siteName}`;
        }
        
        // Create deployment directory
        await fs.mkdir(deployDir, { recursive: true });
        
        // Move uploaded files to deployment directory
        for (const file of req.files) {
            const targetPath = path.join(deployDir, file.originalname);
            await fs.copyFile(file.path, targetPath);
            await fs.unlink(file.path); // Remove temporary file
        }
        
        // Save website info to database
        db.run(`INSERT INTO websites (user_id, site_name, domain, site_path) 
                VALUES (?, ?, ?, ?)`, [
            req.session.userId,
            siteName,
            finalDomain || null,
            deployDir
        ], function(err) {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            
            res.json({ 
                message: 'Website deployed successfully', 
                website: {
                    id: this.lastID,
                    siteName,
                    domain: finalDomain,
                    url: deploymentUrl,
                    status: 'active'
                }
            });
        });
        
    } catch (error) {
        res.status(500).json({ error: 'Deployment failed: ' + error.message });
    }
});

// Get deployed websites
app.get('/api/websites', requireAuth, (req, res) => {
    db.all('SELECT * FROM websites WHERE user_id = ? ORDER BY created_at DESC', 
           [req.session.userId], (err, websites) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(websites);
    });
});

// Delete website
app.delete('/api/websites/:id', requireAuth, async (req, res) => {
    try {
        const websiteId = req.params.id;
        
        // Get website info
        db.get('SELECT * FROM websites WHERE id = ? AND user_id = ?', 
               [websiteId, req.session.userId], async (err, website) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            
            if (!website) {
                return res.status(404).json({ error: 'Website not found' });
            }
            
            // Delete website directory
            try {
                await fs.rmdir(website.site_path, { recursive: true });
            } catch (deleteErr) {
                console.error('Error deleting website directory:', deleteErr);
            }
            
            // Delete from database
            db.run('DELETE FROM websites WHERE id = ?', [websiteId], (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Database error' });
                }
                res.json({ message: 'Website deleted successfully' });
            });
        });
        
    } catch (error) {
        res.status(500).json({ error: 'Delete failed: ' + error.message });
    }
});

// Serve deployed websites - Multiple route patterns
app.get('/deployed/:userId/:siteName/*', (req, res) => {
    const { userId, siteName } = req.params;
    const filePath = req.params[0] || 'index.html';
    const fullPath = path.join(__dirname, 'deployed', userId, siteName, filePath);
    
    res.sendFile(fullPath, (err) => {
        if (err) {
            res.status(404).json({ error: 'File not found' });
        }
    });
});

// Serve subdomain simulations via special routes
app.get('/subdomain/:subdomain/*', (req, res) => {
    const { subdomain } = req.params;
    const filePath = req.params[0] || 'index.html';
    const sitePath = path.join(__dirname, 'deployed', 'subdomains', subdomain);
    const fullPath = path.join(sitePath, filePath);
    
    // Check if subdomain exists
    res.sendFile(fullPath, (err) => {
        if (err) {
            // If specific file not found, try index.html
            res.sendFile(path.join(sitePath, 'index.html'), (indexErr) => {
                if (indexErr) {
                    res.status(404).json({ 
                        error: 'Subdomain not found',
                        message: `Subdomain "${subdomain}" has not been deployed yet`,
                        suggestion: 'Deploy a website with this subdomain name first'
                    });
                }
            });
        }
    });
});

// Serve websites via custom subdomains (ntando.store and ntando.cloud) - for production DNS setup
app.get('*', (req, res) => {
    const host = req.get('host');
    const protocol = req.protocol;
    
    // Check if this is a custom subdomain request
    if (host && (host.includes('ntando.store') || host.includes('ntando.cloud'))) {
        // Extract subdomain name
        const subdomain = host.split('.')[0];
        
        if (subdomain && subdomain !== 'www' && subdomain !== 'ntando') {
            const sitePath = path.join(__dirname, 'deployed', 'subdomains', subdomain);
            const filePath = path.join(sitePath, req.path === '/' ? 'index.html' : req.path.substring(1));
            
            // Try to serve the file
            res.sendFile(filePath, (err) => {
                if (err) {
                    // If specific file not found, try index.html
                    res.sendFile(path.join(sitePath, 'index.html'), (indexErr) => {
                        if (indexErr) {
                            // If nothing found, show 404 page
                            res.status(404).send(`
                                <!DOCTYPE html>
                                <html>
                                <head>
                                    <title>Site Not Found - Ntandostore</title>
                                    <style>
                                        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; }
                                        .error-container { background: white; padding: 3rem; border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); max-width: 500px; }
                                        .error-code { font-size: 72px; color: #6366f1; margin: 0; }
                                        .error-message { font-size: 24px; color: #666; margin: 20px 0; }
                                        .back-link { color: #6366f1; text-decoration: none; background: #f8fafc; padding: 1rem 2rem; border-radius: 10px; display: inline-block; margin-top: 1rem; }
                                        .demo-link { color: #22d3ee; text-decoration: none; background: #f0fdfa; padding: 0.5rem 1rem; border-radius: 8px; display: inline-block; margin-top: 0.5rem; font-size: 0.9rem; }
                                    </style>
                                </head>
                                <body>
                                    <div class="error-container">
                                        <h1 class="error-code">404</h1>
                                        <p class="error-message">Site "${subdomain}.${host.split('.').slice(1).join('.')}" not found</p>
                                        <p>This subdomain is not yet deployed.</p>
                                        <a href="/" class="back-link">← Return to Ntandostore</a><br>
                                        <a href="/subdomain/${subdomain}" class="demo-link">View Demo Version</a>
                                    </div>
                                </body>
                                </html>
                            `);
                        }
                    });
                }
            });
            return;
        }
    }
    
    // Continue with normal routing for non-subdomain requests
    next();
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Ntandostore Hosting Platform running on port ${PORT}`);
    console.log(`Login: username: Ntando, password: Ntando`);
});

module.exports = app;