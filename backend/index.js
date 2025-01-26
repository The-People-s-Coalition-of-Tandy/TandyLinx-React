import express from "express";
import Database from "better-sqlite3";
import path, {
    dirname
} from "path";
import {
    fileURLToPath
} from "url";
import session from 'express-session';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import cors from 'cors';
import multer from 'multer';
import nunjucks from 'nunjucks';
import { templates } from './templates/registry.js';

dotenv.config();

console.log("DB_PATH", process.env.DB_PATH);

const DB_PATH = process.env.DB_PATH || '/app/Database/tandylinx.db';
console.log('Connecting to database at:', DB_PATH);

const db = new Database(DB_PATH, {
    fileMustExist: true
});
const app = express();

// ES Module fix for __dirname
const __filename = fileURLToPath(
    import.meta.url);
const __dirname = dirname(__filename);
const PORT = process.env.PORT || 3000;

// Comment out static file serving since frontend will be separate
// app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({
    extended: true
}));
app.use(express.json()); // Add this for JSON parsing

app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: 'auto',
        httpOnly: true,
    }
}));

// Move this right after express middleware setup, before any routes
app.use(cors({
    origin: process.env.NODE_ENV === 'development' 
        ? ['http://localhost:5173', 'http://localhost:3000']
        : process.env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Serve frontend static files first
app.use(express.static(path.join(__dirname, 'dist')));
app.use('/assets', express.static(path.join(__dirname, 'dist/assets')));

app.use('/templates', express.static(path.join(__dirname, 'public/templates'), {
    setHeaders: (res, path) => {
        if (path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        } else if (path.endsWith('.mp4')) {
            res.setHeader('Content-Type', 'video/mp4');
        } else if (path.endsWith('.png')) {
            res.setHeader('Content-Type', 'image/png');
        } else if (path.endsWith('.gif')) {
            res.setHeader('Content-Type', 'image/gif');
        } else if (path.endsWith('.ico')) {
            res.setHeader('Content-Type', 'image/x-icon');
        } else if (path.endsWith('.jpg')) {
            res.setHeader('Content-Type', 'image/jpeg');
        }
    }
}));

app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Configure nunjucks
nunjucks.configure('templates', {
    autoescape: true,
    express: app
});

function checkAuthenticated(req, res, next) {
    if (req.session.userId) {
        return next();
    }
    // Silent 401 for authentication checks
    res.status(401).json({ error: 'Not authenticated' });
}

// Convert profile route to API endpoint
app.get("/api/profile", checkAuthenticated, (req, res) => {
    const userId = req.session.userId;
    const query = db.prepare("SELECT username, profilePhotoUrl FROM users WHERE id = ?");
    const user = query.get(userId);

    const stmt = db.prepare("SELECT pageTitle, pageURL FROM links WHERE userId = ?");
    const pages = stmt.all(userId);

    res.json({
        username: user.username,
        profilePhotoUrl: user.profilePhotoUrl,
        pages
    });
});


// Convert register routes to API endpoints
// app.get('/register' route can be removed as frontend will handle the form
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    
    // Validate input
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        // Check if username already exists
        const checkStmt = db.prepare("SELECT EXISTS(SELECT 1 FROM users WHERE username = ?) AS exist");
        const exists = checkStmt.get(username).exist;
        
        if (exists) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const insert = db.prepare("INSERT INTO users (username, password) VALUES (?, ?)");
        insert.run(username, hashedPassword);
        
        res.json({ success: true, message: 'Registration successful' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error during registration' });
    }
});

// Convert login routes to API endpoints
// Remove app.get('/login') as frontend will handle the form
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const query = db.prepare("SELECT * FROM users WHERE username = ?");
    const user = query.get(username);

    if (user && bcrypt.compareSync(password, user.password)) {
        req.session.userId = user.id;
        res.json({ 
            success: true,
            user: {
                id: user.id,
                username: user.username
            }
        });
    } else {
        res.status(401).json({ error: 'Invalid username or password' });
    }
});

// Keep existing API routes
app.get('/api/check-auth', (req, res) => {
    if (!req.session.userId) {
        // Silent 401 for auth checks
        return res.status(401).json({ error: "Not authenticated" });
    }

    const userId = req.session.userId;
    const query = db.prepare("SELECT id, username FROM users WHERE id = ?");
    const user = query.get(userId);

    if (!user) {
        req.session.destroy();
        // Silent 401 for missing user
        return res.status(401).json({ error: "User not found" });
    }

    res.json({ id: user.id, username: user.username });
});

app.get('/api/get-page/:pageURL', async (req, res) => {
    const pageURL = req.params.pageURL;
    
    const stmt = db.prepare("SELECT *, userId FROM links WHERE pageURL = ?");
    const page = stmt.get(pageURL);
    
    if (!page) {
        return res.status(404).json({ error: "Page not found" });
    }
    
    res.json(page);
});

app.get('/api/get-page-links/:pageURL', checkAuthenticated, checkPageOwnership, (req, res) => {
    if (!req.session.userId) {
        // Silent 401 for page links
        return res.status(401).json({ error: "Not authenticated" });
    }

    try {
        const pageURL = req.params.pageURL;
        const stmt = db.prepare("SELECT links FROM links WHERE pageURL = ? AND userId = ?");
        const result = stmt.get(pageURL, req.session.userId);

        if (!result) {
            return res.status(404).json({ error: "Page not found" });
        }

        res.json(result);
    } catch (err) {
        console.error('Error fetching page links:', err);
        res.status(500).json({ error: "Server error" });
    }
});

app.get('/api/get-user-links', (req, res) => {
    if (!req.session.userId) {
        // Silent 401 for user links
        return res.status(401).json({ error: "Not authenticated" });
    }

    const userId = req.session.userId;
    const stmt = db.prepare("SELECT pageTitle, pageURL FROM links WHERE userId = ?");
    const pages = stmt.all(userId);
    res.json(pages);
});

app.post('/api/logout', (req, res) => {
    req.session.destroy(() => {
        res.json({ success: true });
    });
});

// Convert utility endpoints to API format
app.get("/api/check-pageURL", (req, res) => {
    const pageURL = req.query.name;
    const checkStmt = db.prepare(
        "SELECT EXISTS(SELECT 1 FROM links WHERE pageURL = ?) AS exist"
    );
    console.log(pageURL);
    const exist = checkStmt.get(pageURL).exist;

    res.json({
        exists: !!exist
    });
});

app.get("/api/check-username", (req, res) => {
    const username = req.query.name;
    const checkStmt = db.prepare(
        "SELECT EXISTS(SELECT 1 FROM users WHERE username = ?) AS exist"
    );
    console.log(username);
    const exist = checkStmt.get(username).exist;

    res.json({
        exists: !!exist
    });
});

// Convert create/edit routes to API endpoints
app.post("/api/pages", checkAuthenticated, (req, res) => {
    const { pageURL, pageTitle, style } = req.body;
    const userId = req.session.userId;

    // Input validation
    if (!pageURL || !pageTitle) {
        return res.status(400).json({ error: 'Page URL and title are required' });
    }

    // URL format validation
    if (!/^[a-zA-Z0-9-]+$/.test(pageURL)) {
        return res.status(400).json({ error: 'Invalid URL format' });
    }

    // Style validation
    if (style && !templates[style]) {
        return res.status(400).json({ error: 'Invalid template style' });
    }

    const checkStmt = db.prepare("SELECT EXISTS(SELECT 1 FROM links WHERE pageURL = ?) AS exist");
    const exist = checkStmt.get(pageURL).exist;

    if (exist) {
        return res.status(400).json({ error: 'Page URL already exists' });
    }

    try {
        const insertStmt = db.prepare(
            "INSERT INTO links (pageURL, pageTitle, links, style, userId) VALUES (?, ?, ?, ?, ?)"
        );
        insertStmt.run(
            pageURL, 
            pageTitle, 
            JSON.stringify([]), // empty links array
            style || 'TandyLinx',  // Use provided style or fallback to default
            userId
        );
        
        res.json({ 
            success: true, 
            page: {
                pageURL,
                pageTitle,
                style
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Failed to create page' });
    }
});

// Add this middleware function
function checkPageOwnership(req, res, next) {
    const userId = req.session.userId;
    const pageURL = req.params.pageURL;

    const stmt = db.prepare("SELECT userId FROM links WHERE pageURL = ?");
    const page = stmt.get(pageURL);

    if (!page) {
        return res.status(404).json({ error: 'Page not found' });
    }

    if (page.userId !== userId) {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    next();
}

// Update the routes to use the new middleware
app.put('/api/pages/:pageURL', checkAuthenticated, checkPageOwnership, (req, res) => {
    const { pageURL } = req.params;
    const { links, pageTitle, style, newPageURL } = req.body;
    const userId = req.session.userId;
    console.log("PUT /api/pages/:pageURL", req.body);

    try {
        // First verify the page exists and belongs to the user
        const checkStmt = db.prepare("SELECT * FROM links WHERE pageURL = ? AND userId = ?");
        const page = checkStmt.get(pageURL, userId);

        if (!page) {
            return res.status(404).json({ error: 'Page not found or unauthorized' });
        }

        // If only updating links, use a simplified update
        if (links && !pageTitle && !style && !newPageURL) {
            const updateStmt = db.prepare(`
                UPDATE links 
                SET links = ?
                WHERE pageURL = ? AND userId = ?
            `);
            updateStmt.run(JSON.stringify(links), pageURL, userId);
        } else {
            // Build update query dynamically based on what's provided
            let updates = [];
            let params = [];
            
            if (links !== undefined) {
                updates.push('links = ?');
                params.push(JSON.stringify(links));
            }
            if (pageTitle !== undefined) {
                updates.push('pageTitle = ?');
                params.push(pageTitle);
            }
            if (style !== undefined) {
                updates.push('style = ?');
                params.push(style);
            }
            if (newPageURL !== undefined) {
                updates.push('pageURL = ?');
                params.push(newPageURL);
            }

            params.push(pageURL, userId);
            
            const updateStmt = db.prepare(`
                UPDATE links 
                SET ${updates.join(', ')}
                WHERE pageURL = ? AND userId = ?
            `);
            updateStmt.run(...params);
        }

        res.json({ 
            success: true,
            newPageURL: newPageURL || pageURL
        });
    } catch (err) {
        console.error('Error updating page:', err);
        res.status(500).json({ error: 'Failed to update page' });
    }
});

// Add this after the PUT /api/pages/:pageURL endpoint
app.delete('/api/pages/:pageURL', checkAuthenticated, checkPageOwnership, (req, res) => {
    const { pageURL } = req.params;
    const userId = req.session.userId;

    try {
        const deleteStmt = db.prepare('DELETE FROM links WHERE pageURL = ? AND userId = ?');
        const result = deleteStmt.run(pageURL, userId);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Page not found or unauthorized' });
        }

        res.json({ success: true });
    } catch (err) {
        console.error('Error deleting page:', err);
        res.status(500).json({ error: 'Failed to delete page' });
    }
});

// Add new public endpoint for getting page data
app.get('/api/public/pages/:pageURL', (req, res) => {
    try {
        const pageURL = req.params.pageURL;
        const stmt = db.prepare("SELECT pageTitle, links, style FROM links WHERE pageURL = ?");
        const result = stmt.get(pageURL);

        if (!result) {
            return res.status(404).json({ error: "Page not found" });
        }

        res.json(result);
    } catch (err) {
        console.error('Error fetching page:', err);
        res.status(500).json({ error: "Server error" });
    }
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/profiles')
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Add profile photo upload endpoint
app.post('/api/upload-profile-photo', checkAuthenticated, upload.single('photo'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const userId = req.session.userId;
  const photoUrl = `/uploads/profiles/${req.file.filename}`;

  try {
    const updateStmt = db.prepare('UPDATE users SET profilePhotoUrl = ? WHERE id = ?');
    updateStmt.run(photoUrl, userId);
    
    res.json({ 
      success: true, 
      photoUrl: photoUrl 
    });
  } catch (err) {
    console.error('Error updating profile photo:', err);
    res.status(500).json({ error: 'Failed to update profile photo' });
  }
});

// Add endpoint to get profile photo
app.get('/api/profile-photo', checkAuthenticated, (req, res) => {
  const userId = req.session.userId;
  
  try {
    const query = db.prepare('SELECT profilePhotoUrl FROM users WHERE id = ?');
    const result = query.get(userId);
    
    res.json({ 
      photoUrl: result?.profilePhotoUrl || null 
    });
  } catch (err) {
    console.error('Error fetching profile photo:', err);
    res.status(500).json({ error: 'Failed to fetch profile photo' });
  }
});

// Move this block before the catch-all route
app.get('/:pageURL', async (req, res, next) => {
    const pageURL = req.params.pageURL;
    
    // Skip certain paths that should be handled by the frontend
    if (['login', 'create', 'profile', 'edit'].includes(pageURL)) {
        return next();
    }
    
    try {
        let pageData;
        // For normal viewing, get from database
        const stmt = db.prepare(`
            SELECT l.pageTitle, l.links, l.style, l.userId, u.profilePhotoUrl 
            FROM links l
            LEFT JOIN users u ON l.userId = u.id
            WHERE l.pageURL = ?
        `);
        pageData = stmt.get(pageURL);
        
        if (!pageData) {
            return next();
        }

        // Get template info from registry
        const templateInfo = templates[pageData.style || 'TandyLinx'];
        
        if (!templateInfo) {
            console.error(`Template ${pageData.style} not found in registry`);
            return res.status(500).send('Template not found');
        }

        // Render the template with profile photo
        res.render(templateInfo.template, {
            pageTitle: pageData.pageTitle,
            links: JSON.parse(pageData.links || '[]'),
            preview: false,
            profilePhotoUrl: pageData.profilePhotoUrl || null
        });
    } catch (error) {
        console.error('Error rendering template:', error);
        next(error);
    }
});

// Add before the catch-all route
app.get('/api/templates', (req, res) => {
    res.json(templates);
});

// Keep this as the last route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
});

app.listen(PORT, () => {
    console.log(`API server listening at http://localhost:${PORT}`);
});