import express from "express";
import nunjucks from "nunjucks";
import Database from "better-sqlite3";
import path, {
    dirname
} from "path";
import fs from "fs";
import {
    fileURLToPath
} from "url";
import session from 'express-session';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import cors from 'cors';

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

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));

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
    const query = db.prepare("SELECT username FROM users WHERE id = ?");
    const user = query.get(userId);

    const stmt = db.prepare("SELECT pageTitle, pageURL FROM links WHERE userId = ?");
    const pages = stmt.all(userId);

    res.json({
        username: user.username,
        pages
    });
});


// Convert register routes to API endpoints
// app.get('/register' route can be removed as frontend will handle the form
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const insert = db.prepare("INSERT INTO users (username, password) VALUES (?, ?)");
        insert.run(username, hashedPassword);
        res.json({ success: true, message: 'Registration successful' });
    } catch (error) {
        console.error(error.message);
        res.status(400).json({ error: 'User already exists or other error' });
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
    
    // get page from database
    const stmt = db.prepare("SELECT * FROM links WHERE pageURL = ?");
    const page = stmt.get(pageURL);
    if (!page) {
        return res.status(404).json({ error: "Page not found" });
    }
    
    res.json(page);
});

app.get('/api/get-page-links/:pageURL', async (req, res) => {
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
app.post("/api/create", checkAuthenticated, (req, res) => {
    const { pageURL, pageTitle, links, style } = req.body;
    const userId = req.session.userId;

    const checkStmt = db.prepare("SELECT EXISTS(SELECT 1 FROM links WHERE pageURL = ?) AS exist");
    const exist = checkStmt.get(pageURL).exist;

    if (exist) {
        return res.status(400).json({ error: 'Page name already exists' });
    }

    try {
        const insertStmt = db.prepare("INSERT INTO links (pageURL, pageTitle, links, style, userId) VALUES (?, ?, ?, ?, ?)");
        insertStmt.run(pageURL, pageTitle, JSON.stringify(links), style, userId);
        res.json({ success: true, pageURL });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Failed to create the TandyLinx page' });
    }
});

app.put('/api/pages/:pageURL', checkAuthenticated, (req, res) => {
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

app.listen(PORT, () => {
    console.log(`API server listening at http://localhost:${PORT}`);
});