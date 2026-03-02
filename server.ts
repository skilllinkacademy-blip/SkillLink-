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

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || 'skilllink-secret-key-2026';
const PORT = 3000;

// Initialize Database
const db = new Database('skilllink.db');
db.pragma('journal_mode = WAL');

// Migrations: Add missing columns if they don't exist
try {
  const userTableInfo = db.prepare("PRAGMA table_info(users)").all();
  const hasGoals = userTableInfo.some((col: any) => col.name === 'goals');
  const hasAvailability = userTableInfo.some((col: any) => col.name === 'availability');
  
  if (!hasGoals) {
    db.prepare("ALTER TABLE users ADD COLUMN goals TEXT").run();
  }
  if (!hasAvailability) {
    db.prepare("ALTER TABLE users ADD COLUMN availability TEXT").run();
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
    apprenticeId INTEGER NOT NULL,
    mentorId INTEGER NOT NULL,
    message TEXT,
    startDate TEXT,
    status TEXT DEFAULT 'pending',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (apprenticeId) REFERENCES users (id),
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

  // Auth
  app.post('/api/auth/register', async (req, res) => {
    const { name, email, password, role, location, age, trade, bio, goals, availability, lang } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const stmt = db.prepare('INSERT INTO users (name, email, password, role, location, age, trade, bio, goals, availability, lang) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
      const result = stmt.run(name, email, hashedPassword, role, location, age, trade, bio, goals, availability, lang);
      
      const user = { id: result.lastInsertRowid, name, email, role };
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

  // Requests & Apprenticeships
  app.post('/api/requests', authenticateToken, (req: any, res) => {
    const { mentorId, message, startDate } = req.body;
    try {
      const stmt = db.prepare('INSERT INTO requests (apprenticeId, mentorId, message, startDate) VALUES (?, ?, ?, ?)');
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
          SELECT r.*, u.name as apprenticeName, u.trade as apprenticeTrade 
          FROM requests r 
          JOIN users u ON r.apprenticeId = u.id 
          WHERE r.mentorId = ?
          ORDER BY r.createdAt DESC
        `).all(req.user.id);
        res.json(requests);
      } else {
        const requests = db.prepare(`
          SELECT r.*, u.name as mentorName, u.trade as mentorTrade 
          FROM requests r 
          JOIN users u ON r.mentorId = u.id 
          WHERE r.apprenticeId = ?
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

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

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

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
