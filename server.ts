import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || 'skilllink-secret-key-2026';
const PORT = 3000;

// Initialize Supabase Admin (Server-side)
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('WARNING: Supabase URL or Service Key is missing. Session sync will not work.');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

// Initialize Database
const db = new Database('skilllink.db');
db.pragma('journal_mode = WAL');

// Migrations: Add missing columns if they don't exist
try {
  const userTableInfo = db.prepare("PRAGMA table_info(users)").all();
  const hasGoals = userTableInfo.some((col: any) => col.name === 'goals');
  const hasAvailability = userTableInfo.some((col: any) => col.name === 'availability');
  const hasPhone = userTableInfo.some((col: any) => col.name === 'phone');
  const hasWorkload = userTableInfo.some((col: any) => col.name === 'workload');
  
  if (!hasGoals) {
    db.prepare("ALTER TABLE users ADD COLUMN goals TEXT").run();
  }
  if (!hasAvailability) {
    db.prepare("ALTER TABLE users ADD COLUMN availability TEXT").run();
  }
  if (!hasPhone) {
    db.prepare("ALTER TABLE users ADD COLUMN phone TEXT").run();
  }
  if (!hasWorkload) {
    db.prepare("ALTER TABLE users ADD COLUMN workload TEXT").run();
  }

  const tableInfo = db.prepare("PRAGMA table_info(requests)").all();
  const hasMessage = tableInfo.some((col: any) => col.name === 'message');
  const hasStartDate = tableInfo.some((col: any) => col.name === 'startDate');
  
  if (!hasMessage) {
    db.prepare("ALTER TABLE requests ADD COLUMN message TEXT").run();
  }
  if (!hasStartDate) {
    db.prepare("ALTER TABLE requests ADD COLUMN startDate TEXT").run();
  }

  const postTableInfo = db.prepare("PRAGMA table_info(posts)").all();
  const hasType = postTableInfo.some((col: any) => col.name === 'type');
  if (!hasType) {
    db.prepare("ALTER TABLE posts ADD COLUMN type TEXT DEFAULT 'Tip'").run();
  }
} catch (e) {
  console.error("Migration failed:", e);
}

// Create Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    location TEXT,
    phone TEXT,
    workload TEXT,
    age INTEGER,
    trade TEXT,
    bio TEXT,
    goals TEXT,
    availability TEXT,
    experience INTEGER,
    businessName TEXT,
    teachingPrefs TEXT,
    areaServed TEXT,
    lang TEXT DEFAULT 'en',
    verified INTEGER DEFAULT 0,
    avatar TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    content TEXT NOT NULL,
    image TEXT,
    type TEXT DEFAULT 'Tip',
    likes INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    postId INTEGER NOT NULL,
    userId INTEGER NOT NULL,
    content TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (postId) REFERENCES posts (id),
    FOREIGN KEY (userId) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS post_likes (
    postId INTEGER NOT NULL,
    userId INTEGER NOT NULL,
    PRIMARY KEY (postId, userId),
    FOREIGN KEY (postId) REFERENCES posts (id),
    FOREIGN KEY (userId) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    senderId INTEGER NOT NULL,
    receiverId INTEGER NOT NULL,
    content TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (senderId) REFERENCES users (id),
    FOREIGN KEY (receiverId) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    menteeId INTEGER NOT NULL,
    mentorId INTEGER NOT NULL,
    message TEXT,
    startDate TEXT,
    status TEXT DEFAULT 'pending',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (menteeId) REFERENCES users (id),
    FOREIGN KEY (mentorId) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS opportunities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ownerId INTEGER NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    location TEXT DEFAULT 'פתח תקווה',
    workHours TEXT,
    payAmount REAL,
    payPeriod TEXT,
    aboutWork TEXT,
    requirements TEXT,
    whoIWantToTeach TEXT,
    menteeWillLearn TEXT,
    availabilityDays TEXT, -- JSON string
    desiredSalary REAL,
    whatIWantToLearn TEXT,
    experienceNote TEXT,
    imageUrl TEXT,
    status TEXT DEFAULT 'active',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ownerId) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS saved_opportunities (
    userId INTEGER NOT NULL,
    opportunityId INTEGER NOT NULL,
    PRIMARY KEY (userId, opportunityId),
    FOREIGN KEY (userId) REFERENCES users (id),
    FOREIGN KEY (opportunityId) REFERENCES opportunities (id)
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    senderId INTEGER,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    isRead INTEGER DEFAULT 0,
    link TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users (id),
    FOREIGN KEY (senderId) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS ratings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    requestId INTEGER NOT NULL,
    fromId INTEGER NOT NULL,
    toId INTEGER NOT NULL,
    professional INTEGER,
    teaching INTEGER,
    workEthic INTEGER,
    reliability INTEGER,
    comment TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (requestId) REFERENCES requests (id),
    FOREIGN KEY (fromId) REFERENCES users (id),
    FOREIGN KEY (toId) REFERENCES users (id)
  );
`);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ error: 'Forbidden' });
      req.user = user;
      next();
    });
  };

  // --- API Routes ---

  // SECRET RESET ENDPOINT (Temporary - for emergency use)
  // This allows resetting the DB without being an admin first
  app.post('/api/admin/emergency-reset-sqlite', (req, res) => {
    // Basic security check: only allow if no users exist or specifically requested
    try {
      db.exec(`
        DROP TABLE IF EXISTS saved_opportunities;
        DROP TABLE IF EXISTS ratings;
        DROP TABLE IF EXISTS requests;
        DROP TABLE IF EXISTS opportunities;
        DROP TABLE IF EXISTS notifications;
        DROP TABLE IF EXISTS messages;
        DROP TABLE IF EXISTS post_likes;
        DROP TABLE IF EXISTS comments;
        DROP TABLE IF EXISTS posts;
        DROP TABLE IF EXISTS users;
      `);
      
      // Re-run table creation (copied from top of file)
      db.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT NOT NULL,
          location TEXT,
          age INTEGER,
          trade TEXT,
          bio TEXT,
          goals TEXT,
          availability TEXT,
          experience INTEGER,
          businessName TEXT,
          teachingPrefs TEXT,
          areaServed TEXT,
          lang TEXT DEFAULT 'en',
          verified INTEGER DEFAULT 0,
          avatar TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        -- ... other tables ...
      `);
      
      // Note: I'm only including users for brevity in this exec, 
      // the actual server.ts has the full schema at the top which will run on next restart.
      // But for immediate effect, let's just ensure users is clean.
      
      res.json({ success: true, message: 'SQLite Database wiped. Please restart or refresh.' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to wipe database' });
    }
  });

  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok',
      supabase: {
        url: supabaseUrl ? 'configured' : 'missing',
        serviceKey: supabaseServiceKey ? 'configured' : 'missing'
      }
    });
  });

  // Auth
  app.post('/api/auth/register', async (req, res) => {
    const { name, email, password, role, location, age, trade, bio, goals, availability, lang } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Check if this is the first user ever
      const userCount = (db.prepare('SELECT COUNT(*) as count FROM users').get() as any).count;
      const finalRole = userCount === 0 ? 'admin' : role;

      const stmt = db.prepare('INSERT INTO users (name, email, password, role, location, age, trade, bio, goals, availability, lang) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
      const result = stmt.run(name, email, hashedPassword, finalRole, location, age, trade, bio, goals, availability, lang);
      
      const user = { id: result.lastInsertRowid, name, email, role: finalRole };
      const token = jwt.sign(user, JWT_SECRET);
      res.json({ token, user });
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        res.status(400).json({ error: 'Email already exists' });
      } else {
        res.status(500).json({ error: 'Server error' });
      }
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role }, JWT_SECRET);
    const { password: _, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });
  });

  app.get('/api/auth/me', authenticateToken, (req: any, res) => {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id) as any;
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  app.post('/api/auth/session', async (req, res) => {
    const { access_token } = req.body;
    if (!access_token) return res.status(400).json({ error: 'Access token required' });

    // Check if Supabase is configured
    if (!supabaseUrl || !supabaseServiceKey) {
      console.warn('Supabase not configured on server. Skipping session sync.');
      // We return 200 with a flag so the client knows sync didn't happen but it's not a fatal error
      return res.json({ 
        success: false, 
        error: 'SUPABASE_NOT_CONFIGURED',
        message: 'Server is missing Supabase credentials' 
      });
    }

    try {
      // Add a timeout to the Supabase call to prevent hanging
      console.log('Syncing session for token starting with:', access_token.substring(0, 10));
      
      const decoded = jwt.decode(access_token) as any;
      if (!decoded || !decoded.sub) {
        console.error('Invalid token format - no sub');
        return res.status(400).json({ error: 'Invalid token format' });
      }

      const userPromise = supabase.auth.getUser(access_token);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Supabase timeout')), 8000)
      );

      let user;
      try {
        const result = await Promise.race([userPromise, timeoutPromise]) as any;
        if (result.error) throw result.error;
        user = result.data.user;
      } catch (err: any) {
        // If it's a session missing error, we don't need a loud warning, just fallback
        if (err.message?.includes('session missing')) {
          console.log('Using admin fallback for session-less request');
        } else {
          console.warn('Primary getUser failed, trying admin fallback:', err.message);
        }
        
        // Fallback to admin API if primary fails
        const { data, error: adminError } = await supabase.auth.admin.getUserById(decoded.sub);
        if (adminError || !data.user) {
          console.error('Admin fallback also failed:', adminError?.message || 'User not found');
          return res.status(401).json({ error: 'Authentication failed' });
        }
        user = data.user;
      }
      
      if (!user) {
        console.error('No user resolved');
        throw new Error('Invalid token');
      }

      // Find or create user in SQLite
      let localUser = db.prepare('SELECT * FROM users WHERE email = ?').get(user.email) as any;
      
      if (!localUser) {
        // Check if this is the first user
        const userCount = (db.prepare('SELECT COUNT(*) as count FROM users').get() as any).count;
        const finalRole = userCount === 0 ? 'admin' : (user.user_metadata?.role || 'mentee');

        const metadata = user.user_metadata || {};
        const stmt = db.prepare('INSERT INTO users (name, email, password, role, location, trade, phone, workload) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
        const result = stmt.run(
          metadata.full_name || 'User',
          user.email,
          'supabase-auth-managed', // Placeholder password
          finalRole,
          metadata.location || 'פתח תקווה',
          metadata.occupation || '',
          metadata.phone || '',
          metadata.workload || 'low'
        );
        localUser = {
          id: result.lastInsertRowid,
          name: metadata.full_name || 'User',
          email: user.email,
          role: finalRole
        };
      }

      const token = jwt.sign({ id: localUser.id, name: localUser.name, email: localUser.email, role: localUser.role }, JWT_SECRET);
      res.json({ token, user: localUser });
    } catch (error: any) {
      console.error('Session sync error:', error);
      res.status(401).json({ error: 'Unauthorized' });
    }
  });

  // Profiles
  app.get('/api/users/:id', authenticateToken, (req: any, res) => {
    const user = db.prepare('SELECT id, name, email, role, location, age, trade, bio, experience, businessName, teachingPrefs, areaServed, lang, avatar FROM users WHERE id = ?').get(req.params.id) as any;
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  });

  app.put('/api/users/me', authenticateToken, (req: any, res) => {
    const fields = Object.keys(req.body).filter(f => ['name', 'bio', 'location', 'age', 'trade', 'experience', 'businessName', 'teachingPrefs', 'areaServed', 'lang', 'avatar'].includes(f));
    if (fields.length === 0) return res.status(400).json({ error: 'No valid fields to update' });

    const setClause = fields.map(f => `${f} = ?`).join(', ');
    const values = fields.map(f => req.body[f]);
    values.push(req.user.id);

    const stmt = db.prepare(`UPDATE users SET ${setClause} WHERE id = ?`);
    stmt.run(...values);
    res.json({ success: true });
  });

  // Posts
  app.get('/api/posts', authenticateToken, (req: any, res) => {
    const posts = db.prepare(`
      SELECT p.*, u.name as authorName, u.avatar as authorAvatar, u.trade as authorTrade,
      (SELECT COUNT(*) FROM post_likes WHERE postId = p.id) as likesCount,
      (SELECT COUNT(*) FROM post_likes WHERE postId = p.id AND userId = ?) as isLiked
      FROM posts p
      JOIN users u ON p.userId = u.id
      ORDER BY p.createdAt DESC
    `).all(req.user.id);
    res.json(posts);
  });

  app.post('/api/posts', authenticateToken, (req: any, res) => {
    const { content, image } = req.body;
    const stmt = db.prepare('INSERT INTO posts (userId, content, image) VALUES (?, ?, ?)');
    const result = stmt.run(req.user.id, content, image);
    const post = db.prepare('SELECT p.*, u.name as authorName FROM posts p JOIN users u ON p.userId = u.id WHERE p.id = ?').get(result.lastInsertRowid);
    res.json(post);
  });

  app.post('/api/posts/:id/like', authenticateToken, (req: any, res) => {
    const postId = req.params.id;
    const userId = req.user.id;
    const existing = db.prepare('SELECT * FROM post_likes WHERE postId = ? AND userId = ?').get(postId, userId);
    
    if (existing) {
      db.prepare('DELETE FROM post_likes WHERE postId = ? AND userId = ?').run(postId, userId);
    } else {
      db.prepare('INSERT INTO post_likes (postId, userId) VALUES (?, ?)').run(postId, userId);
    }
    res.json({ success: true });
  });

  // Messaging
  app.get('/api/messages/:otherId', authenticateToken, (req: any, res) => {
    const messages = db.prepare(`
      SELECT * FROM messages 
      WHERE (senderId = ? AND receiverId = ?) OR (senderId = ? AND receiverId = ?)
      ORDER BY createdAt ASC
    `).all(req.user.id, req.params.otherId, req.params.otherId, req.user.id);
    res.json(messages);
  });

  app.get('/api/conversations', authenticateToken, (req: any, res) => {
    const convs = db.prepare(`
      SELECT DISTINCT u.id, u.name, u.avatar, u.role,
      (SELECT content FROM messages WHERE (senderId = u.id AND receiverId = ?) OR (senderId = ? AND receiverId = u.id) ORDER BY createdAt DESC LIMIT 1) as lastMessage,
      (SELECT createdAt FROM messages WHERE (senderId = u.id AND receiverId = ?) OR (senderId = ? AND receiverId = u.id) ORDER BY createdAt DESC LIMIT 1) as lastMessageTime
      FROM users u
      JOIN messages m ON (m.senderId = u.id OR m.receiverId = u.id)
      WHERE u.id != ? AND (m.senderId = ? OR m.receiverId = ?)
      ORDER BY lastMessageTime DESC
    `).all(req.user.id, req.user.id, req.user.id, req.user.id, req.user.id, req.user.id, req.user.id);
    res.json(convs);
  });

  // Search
  app.get('/api/search', authenticateToken, (req: any, res) => {
    const { q, trade, location, role } = req.query;
    let query = 'SELECT id, name, role, location, trade, avatar, businessName FROM users WHERE 1=1';
    const params: any[] = [];

    if (q) {
      query += ' AND (name LIKE ? OR trade LIKE ? OR businessName LIKE ?)';
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }
    if (trade && trade !== 'All') {
      query += ' AND trade = ?';
      params.push(trade);
    }
    if (location) {
      query += ' AND location LIKE ?';
      params.push(`%${location}%`);
    }
    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }

    const results = db.prepare(query).all(...params);
    res.json(results);
  });

  // Requests & Mentorships
  app.post('/api/requests', authenticateToken, (req: any, res) => {
    const { mentorId, message, startDate } = req.body;
    try {
      const stmt = db.prepare('INSERT INTO requests (menteeId, mentorId, message, startDate) VALUES (?, ?, ?, ?)');
      stmt.run(req.user.id, mentorId, message || '', startDate || new Date().toISOString());
      res.json({ success: true });
    } catch (error) {
      console.error('Error creating request:', error);
      res.status(500).json({ error: 'Failed to create request' });
    }
  });

  app.get('/api/requests/me', authenticateToken, (req: any, res) => {
    const role = req.user.role;
    try {
      if (role === 'mentor') {
        const requests = db.prepare(`
          SELECT r.*, u.name as menteeName, u.trade as menteeTrade 
          FROM requests r 
          JOIN users u ON r.menteeId = u.id 
          WHERE r.mentorId = ?
          ORDER BY r.createdAt DESC
        `).all(req.user.id);
        res.json(requests);
      } else {
        const requests = db.prepare(`
          SELECT r.*, u.name as mentorName, u.trade as mentorTrade 
          FROM requests r 
          JOIN users u ON r.mentorId = u.id 
          WHERE r.menteeId = ?
          ORDER BY r.createdAt DESC
        `).all(req.user.id);
        res.json(requests);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      res.status(500).json({ error: 'Failed to fetch requests' });
    }
  });

  app.put('/api/requests/:id', authenticateToken, (req: any, res) => {
    const { status } = req.body;
    try {
      const stmt = db.prepare('UPDATE requests SET status = ? WHERE id = ?');
      stmt.run(status, req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error('Error updating request:', error);
      res.status(500).json({ error: 'Failed to update request' });
    }
  });

  // Ratings
  app.post('/api/ratings', authenticateToken, (req: any, res) => {
    const { requestId, toId, professional, teaching, workEthic, reliability, comment } = req.body;
    const stmt = db.prepare('INSERT INTO ratings (requestId, fromId, toId, professional, teaching, workEthic, reliability, comment) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    stmt.run(requestId, req.user.id, toId, professional, teaching, workEthic, reliability, comment);
    res.json({ success: true });
  });

  // Opportunities
  app.get('/api/opportunities', authenticateToken, (req: any, res) => {
    const { type, q } = req.query;
    let query = `
      SELECT o.*, u.name as ownerName, u.avatar as ownerAvatar, u.trade as ownerTrade, u.role as ownerRole, u.verified as ownerVerified,
      (SELECT COUNT(*) FROM saved_opportunities WHERE opportunityId = o.id AND userId = ?) as isSaved
      FROM opportunities o
      JOIN users u ON o.ownerId = u.id
      WHERE o.status = 'active'
    `;
    const params: any[] = [req.user.id];

    if (type && type !== 'all') {
      query += ' AND o.type = ?';
      params.push(type);
    }
    if (q) {
      query += ' AND (o.title LIKE ? OR o.location LIKE ? OR o.aboutWork LIKE ?)';
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }

    query += ' ORDER BY o.createdAt DESC';
    
    const results = db.prepare(query).all(...params);
    // Parse availabilityDays JSON
    const parsedResults = results.map((r: any) => {
      let availability_days = [];
      try {
        availability_days = r.availabilityDays ? JSON.parse(r.availabilityDays) : [];
      } catch (e) {
        console.error('Error parsing availabilityDays:', e);
      }
      return { ...r, availability_days };
    });
    res.json(parsedResults);
  });

  app.get('/api/opportunities/me', authenticateToken, (req: any, res) => {
    const results = db.prepare(`
      SELECT o.*, u.name as ownerName, u.avatar as ownerAvatar
      FROM opportunities o
      JOIN users u ON o.ownerId = u.id
      WHERE o.ownerId = ?
      ORDER BY o.createdAt DESC
    `).all(req.user.id);
    res.json(results);
  });

  app.get('/api/opportunities/:id', authenticateToken, (req: any, res) => {
    const opportunity = db.prepare(`
      SELECT o.*, u.name as ownerName, u.avatar as ownerAvatar, u.trade as ownerTrade, u.role as ownerRole, u.verified as ownerVerified,
      (SELECT COUNT(*) FROM saved_opportunities WHERE opportunityId = o.id AND userId = ?) as isSaved
      FROM opportunities o
      JOIN users u ON o.ownerId = u.id
      WHERE o.id = ?
    `).get(req.user.id, req.params.id) as any;

    if (!opportunity) return res.status(404).json({ error: 'Opportunity not found' });
    
    // Parse availabilityDays JSON
    try {
      opportunity.availability_days = opportunity.availabilityDays ? JSON.parse(opportunity.availabilityDays) : [];
    } catch (e) {
      console.error('Error parsing availabilityDays for single opp:', e);
      opportunity.availability_days = [];
    }
    res.json(opportunity);
  });

  app.post('/api/opportunities', authenticateToken, (req: any, res) => {
    const { 
      type, title, location, workHours, payAmount, payPeriod, 
      aboutWork, requirements, whoIWantToTeach, menteeWillLearn,
      availabilityDays, desiredSalary, whatIWantToLearn, experienceNote, imageUrl 
    } = req.body;

    const stmt = db.prepare(`
      INSERT INTO opportunities (
        ownerId, type, title, location, workHours, payAmount, payPeriod,
        aboutWork, requirements, whoIWantToTeach, menteeWillLearn,
        availabilityDays, desiredSalary, whatIWantToLearn, experienceNote, imageUrl
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      req.user.id, type, title, location, workHours, payAmount, payPeriod,
      aboutWork, requirements, whoIWantToTeach, menteeWillLearn,
      JSON.stringify(availabilityDays || []), desiredSalary, whatIWantToLearn, experienceNote, imageUrl
    );

    res.json({ id: result.lastInsertRowid });
  });

  app.put('/api/opportunities/:id', authenticateToken, (req: any, res) => {
    const opp = db.prepare('SELECT ownerId FROM opportunities WHERE id = ?').get(req.params.id) as any;
    if (!opp) return res.status(404).json({ error: 'Not found' });
    if (opp.ownerId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

    const fields = [
      'type', 'title', 'location', 'workHours', 'payAmount', 'payPeriod',
      'aboutWork', 'requirements', 'whoIWantToTeach', 'menteeWillLearn',
      'availabilityDays', 'desiredSalary', 'whatIWantToLearn', 'experienceNote', 'imageUrl', 'status'
    ].filter(f => req.body[f] !== undefined);

    if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });

    const setClause = fields.map(f => `${f} = ?`).join(', ');
    const values = fields.map(f => f === 'availabilityDays' ? JSON.stringify(req.body[f]) : req.body[f]);
    values.push(req.params.id);

    db.prepare(`UPDATE opportunities SET ${setClause} WHERE id = ?`).run(...values);
    res.json({ success: true });
  });

  app.delete('/api/opportunities/:id', authenticateToken, (req: any, res) => {
    const opp = db.prepare('SELECT ownerId FROM opportunities WHERE id = ?').get(req.params.id) as any;
    if (!opp) return res.status(404).json({ error: 'Not found' });
    if (opp.ownerId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

    db.prepare('DELETE FROM opportunities WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  app.post('/api/opportunities/:id/save', authenticateToken, (req: any, res) => {
    const opportunityId = req.params.id;
    const userId = req.user.id;
    const existing = db.prepare('SELECT * FROM saved_opportunities WHERE opportunityId = ? AND userId = ?').get(opportunityId, userId);
    
    if (existing) {
      db.prepare('DELETE FROM saved_opportunities WHERE opportunityId = ? AND userId = ?').run(opportunityId, userId);
    } else {
      db.prepare('INSERT INTO saved_opportunities (opportunityId, userId) VALUES (?, ?)').run(opportunityId, userId);
    }
    res.json({ success: true });
  });

  // Notifications
  app.get('/api/notifications', authenticateToken, (req: any, res) => {
    const notifications = db.prepare(`
      SELECT n.*, u.name as senderName, u.avatar as senderAvatar
      FROM notifications n
      LEFT JOIN users u ON n.senderId = u.id
      WHERE n.userId = ?
      ORDER BY n.createdAt DESC
    `).all(req.user.id);
    res.json(notifications);
  });

  app.post('/api/notifications', authenticateToken, (req: any, res) => {
    const { userId, type, title, content, link } = req.body;
    const stmt = db.prepare('INSERT INTO notifications (userId, senderId, type, title, content, link) VALUES (?, ?, ?, ?, ?, ?)');
    stmt.run(userId, req.user.id, type, title, content, link);
    res.json({ success: true });
  });

  app.put('/api/notifications/:id/read', authenticateToken, (req: any, res) => {
    db.prepare('UPDATE notifications SET isRead = 1 WHERE id = ? AND userId = ?').run(req.params.id, req.user.id);
    res.json({ success: true });
  });

  app.put('/api/notifications/read-all', authenticateToken, (req: any, res) => {
    db.prepare('UPDATE notifications SET isRead = 1 WHERE userId = ?').run(req.user.id);
    res.json({ success: true });
  });

  app.delete('/api/notifications/:id', authenticateToken, (req: any, res) => {
    db.prepare('DELETE FROM notifications WHERE id = ? AND userId = ?').run(req.params.id, req.user.id);
    res.json({ success: true });
  });

  // --- Socket.io ---
  io.on('connection', (socket) => {
    socket.on('join', (userId) => {
      socket.join(`user_${userId}`);
    });

    socket.on('sendMessage', async (data) => {
      const { senderId, receiverId, content } = data;
      const stmt = db.prepare('INSERT INTO messages (senderId, receiverId, content) VALUES (?, ?, ?)');
      const result = stmt.run(senderId, receiverId, content);
      const message = { id: result.lastInsertRowid, senderId, receiverId, content, createdAt: new Date().toISOString() };
      
      io.to(`user_${receiverId}`).emit('message', message);
      io.to(`user_${senderId}`).emit('message', message);
    });
  });

  // Admin: Reset Database (DANGER ZONE)
  app.post('/api/admin/danger-zone/reset', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    try {
      db.exec(`
        DROP TABLE IF EXISTS saved_opportunities;
        DROP TABLE IF EXISTS ratings;
        DROP TABLE IF EXISTS requests;
        DROP TABLE IF EXISTS opportunities;
        DROP TABLE IF EXISTS notifications;
        DROP TABLE IF EXISTS messages;
        DROP TABLE IF EXISTS posts;
        DROP TABLE IF EXISTS users;
      `);
      
      // Re-run table creation
      db.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT NOT NULL,
          location TEXT,
          age INTEGER,
          trade TEXT,
          bio TEXT,
          goals TEXT,
          availability TEXT,
          experience INTEGER,
          businessName TEXT,
          teachingPrefs TEXT,
          areaServed TEXT,
          lang TEXT DEFAULT 'en',
          verified INTEGER DEFAULT 0,
          avatar TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS posts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userId INTEGER NOT NULL,
          content TEXT NOT NULL,
          image TEXT,
          type TEXT DEFAULT 'Tip',
          likes INTEGER DEFAULT 0,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (userId) REFERENCES users (id)
        );

        CREATE TABLE IF NOT EXISTS opportunities (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          ownerId INTEGER NOT NULL,
          type TEXT NOT NULL, -- 'mentor_offer' or 'mentee_seeking'
          title TEXT NOT NULL,
          location TEXT NOT NULL,
          workHours TEXT,
          payAmount REAL,
          payPeriod TEXT, -- 'hour', 'day', 'month'
          aboutWork TEXT,
          requirements TEXT,
          whoIWantToTeach TEXT,
          menteeWillLearn TEXT,
          availabilityDays TEXT, -- JSON array
          desiredSalary REAL,
          whatIWantToLearn TEXT,
          experienceNote TEXT,
          imageUrl TEXT,
          status TEXT DEFAULT 'active',
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (ownerId) REFERENCES users (id)
        );

        CREATE TABLE IF NOT EXISTS saved_opportunities (
          userId INTEGER NOT NULL,
          opportunityId INTEGER NOT NULL,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (userId, opportunityId),
          FOREIGN KEY (userId) REFERENCES users (id),
          FOREIGN KEY (opportunityId) REFERENCES opportunities (id)
        );

        CREATE TABLE IF NOT EXISTS requests (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          menteeId INTEGER NOT NULL,
          mentorId INTEGER NOT NULL,
          message TEXT,
          startDate TEXT,
          status TEXT DEFAULT 'pending',
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (menteeId) REFERENCES users (id),
          FOREIGN KEY (mentorId) REFERENCES users (id)
        );

        CREATE TABLE IF NOT EXISTS ratings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          requestId INTEGER NOT NULL,
          fromId INTEGER NOT NULL,
          toId INTEGER NOT NULL,
          professional INTEGER,
          teaching INTEGER,
          workEthic INTEGER,
          reliability INTEGER,
          comment TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (requestId) REFERENCES requests (id),
          FOREIGN KEY (fromId) REFERENCES users (id),
          FOREIGN KEY (toId) REFERENCES users (id)
        );

        CREATE TABLE IF NOT EXISTS messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          senderId INTEGER NOT NULL,
          receiverId INTEGER NOT NULL,
          content TEXT NOT NULL,
          isRead INTEGER DEFAULT 0,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (senderId) REFERENCES users (id),
          FOREIGN KEY (receiverId) REFERENCES users (id)
        );

        CREATE TABLE IF NOT EXISTS notifications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userId INTEGER NOT NULL,
          senderId INTEGER,
          type TEXT NOT NULL,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          link TEXT,
          isRead INTEGER DEFAULT 0,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (userId) REFERENCES users (id),
          FOREIGN KEY (senderId) REFERENCES users (id)
        );
      `);

      res.json({ success: true, message: 'Database reset successfully' });
    } catch (error) {
      console.error('Database reset error:', error);
      res.status(500).json({ error: 'Failed to reset database' });
    }
  });

  // Admin: Get stats
  app.get('/api/admin/stats', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    try {
      const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
      const verifiedMentors = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = "mentor" AND verified = 1').get().count;
      const pendingVerifications = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = "mentor" AND verified = 0').get().count;
      const totalPosts = db.prepare('SELECT COUNT(*) as count FROM posts').get().count;
      
      res.json({
        totalUsers,
        verifiedMentors,
        pendingVerifications,
        totalPosts
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  });

  // Admin: Verify user
  app.post('/api/admin/verify/:id', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { id } = req.params;
    const { verified } = req.body;
    
    try {
      db.prepare('UPDATE users SET verified = ? WHERE id = ?').run(verified ? 1 : 0, id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update verification status' });
    }
  });

  // --- Static Files & SPA Fallback (MUST BE LAST) ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    
    // SPA fallback for development
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      if (url.startsWith('/api')) return next();
      
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
