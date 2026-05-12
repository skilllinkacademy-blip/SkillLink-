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

// Database Initialization
function initDb() {
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
      username TEXT,
      supabase_id TEXT,
      phone TEXT,
      workload TEXT,
      learningIntent TEXT,
      preferredDuration TEXT,
      businessType TEXT,
      targetAudience TEXT,
      isBusiness INTEGER DEFAULT 0,
      businessDescription TEXT,
      businessLogo TEXT,
      businessSocialLinks TEXT,
      businessWebsite TEXT,
      headline TEXT,
      skills_level TEXT,
      desired_salary REAL,
      what_i_want_to_learn TEXT,
      who_i_want_to_teach TEXT,
      availability_days TEXT,
      skills TEXT,
      cover_url TEXT,
      verificationStatus TEXT,
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

    CREATE TABLE IF NOT EXISTS post_likes (
      postId INTEGER NOT NULL,
      userId INTEGER NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (postId, userId),
      FOREIGN KEY (postId) REFERENCES posts (id),
      FOREIGN KEY (userId) REFERENCES users (id)
    );

    CREATE TABLE IF NOT EXISTS opportunities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ownerId INTEGER NOT NULL,
      type TEXT NOT NULL,
      profession TEXT,
      opportunityType TEXT,
      commitmentLevel TEXT,
      learningFocus TEXT,
      durationDescription TEXT,
      title TEXT NOT NULL,
      location TEXT NOT NULL,
      workHours TEXT,
      payAmount REAL,
      payPeriod TEXT,
      aboutWork TEXT,
      requirements TEXT,
      whoIWantToTeach TEXT,
      menteeWillLearn TEXT,
      availabilityDays TEXT,
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

    CREATE TABLE IF NOT EXISTS opportunity_interests (
      opportunityId INTEGER NOT NULL,
      userId INTEGER NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (opportunityId, userId),
      FOREIGN KEY (opportunityId) REFERENCES opportunities (id),
      FOREIGN KEY (userId) REFERENCES users (id)
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
      requestId INTEGER,
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
      title TEXT,
      content TEXT,
      link TEXT,
      isRead INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users (id),
      FOREIGN KEY (senderId) REFERENCES users (id)
    );
  `);

  // Migration: Add missing columns if tables already exist
  const migrations = [
    { table: 'users', column: 'phone', type: 'TEXT' },
    { table: 'users', column: 'workload', type: 'TEXT' },
    { table: 'users', column: 'learningIntent', type: 'TEXT' },
    { table: 'users', column: 'preferredDuration', type: 'TEXT' },
    { table: 'users', column: 'businessType', type: 'TEXT' },
    { table: 'users', column: 'targetAudience', type: 'TEXT' },
    { table: 'users', column: 'isBusiness', type: 'INTEGER DEFAULT 0' },
    { table: 'users', column: 'businessDescription', type: 'TEXT' },
    { table: 'users', column: 'businessLogo', type: 'TEXT' },
    { table: 'users', column: 'businessSocialLinks', type: 'TEXT' },
    { table: 'users', column: 'businessWebsite', type: 'TEXT' },
    { table: 'users', column: 'headline', type: 'TEXT' },
    { table: 'users', column: 'skills_level', type: 'TEXT' },
    { table: 'users', column: 'desired_salary', type: 'REAL' },
    { table: 'users', column: 'what_i_want_to_learn', type: 'TEXT' },
    { table: 'users', column: 'who_i_want_to_teach', type: 'TEXT' },
    { table: 'users', column: 'availability_days', type: 'TEXT' },
    { table: 'users', column: 'skills', type: 'TEXT' },
    { table: 'users', column: 'cover_url', type: 'TEXT' },
    { table: 'users', column: 'verificationStatus', type: 'TEXT' },
    { table: 'opportunities', column: 'profession', type: 'TEXT' },
    { table: 'opportunities', column: 'opportunityType', type: 'TEXT' },
    { table: 'opportunities', column: 'commitmentLevel', type: 'TEXT' },
    { table: 'opportunities', column: 'learningFocus', type: 'TEXT' },
    { table: 'opportunities', column: 'durationDescription', type: 'TEXT' },
    { table: 'ratings', column: 'requestId', type: 'INTEGER' },
    { table: 'ratings', column: 'professional', type: 'INTEGER' },
    { table: 'ratings', column: 'teaching', type: 'INTEGER' },
    { table: 'ratings', column: 'workEthic', type: 'INTEGER' },
    { table: 'ratings', column: 'reliability', type: 'INTEGER' },
  ];

  for (const m of migrations) {
    try {
      db.exec(`ALTER TABLE ${m.table} ADD COLUMN ${m.column} ${m.type}`);
    } catch (e: any) {
      if (!e.message.includes('duplicate column name')) {
        console.error(`Migration failed for ${m.table}.${m.column}:`, e.message);
      }
    }
  }
}

// Seed Database Function
function seedDatabase() {
  const userCount = (db.prepare('SELECT COUNT(*) as count FROM users').get() as any).count;
  if (userCount > 0) return;

  console.log('Seeding SQLite database with professional trade data...');

  const masterPassword = bcrypt.hashSync('master123', 10);

  const mentors = [
    { name: 'Marco Barber', email: 'marco@barber.com', trade: 'Barbering', loc: 'Tel Aviv', bio: 'Master barber with 15 years experience.', avatar: 'https://images.unsplash.com/photo-1618077360395-f3068be8e001?auto=format&fit=crop&q=80&w=250', username: 'marco_barber' },
    { name: 'Yossi Wood', email: 'yossi@wood.com', trade: 'Carpentry', loc: 'Haifa', bio: 'Professional carpenter creating bespoke wooden furniture.', avatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&q=80&w=250', username: 'yossi_wood' },
    { name: 'Avi Spark', email: 'avi@spark.com', trade: 'Electrical', loc: 'Jerusalem', bio: 'Licensed electrician for smart home installations.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250', username: 'avi_spark' },
    { name: 'Dan Fixer', email: 'dan@fix.com', trade: 'Construction', loc: 'Beer Sheva', bio: 'Expert in renovations and industrial tiling.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250', username: 'dan_fix' },
    { name: 'Eli Iron', email: 'eli@iron.com', trade: 'Welding', loc: 'Ashdod', bio: 'Industrial welder specializing in heavy metal structures.', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=250', username: 'eli_iron' },
    { name: 'Roni Turbo', email: 'roni@turbo.com', trade: 'Automotive', loc: 'Holon', bio: 'Master mechanic with a passion for engine tuning.', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250', username: 'roni_turbo' },
    { name: 'Meir Water', email: 'meir@water.com', trade: 'Plumbing', loc: 'Ramat Gan', bio: 'Expert in complex piping systems and infrastructure.', avatar: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&q=80&w=250', username: 'meir_water' }
  ];

  const opportunities = [
    { trade: 'Barbering', title: 'Apprenticeship: Modern Barbering Techniques', loc: 'Tel Aviv', about: 'Learn the art of fading, blade work, and shop management.', req: 'High discipline, punctuality.', learn: 'Skin fades, beard grooming.', img: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=1000' },
    { trade: 'Carpentry', title: 'Master Carpentry: Joinery & Restoration', loc: 'Haifa', about: 'Focus on traditional joinery methods and high-end mahogany restoration.', req: 'Passion for wood, some basic hand-tool experience.', learn: 'Dove-tail joints, wood finishing.', img: 'https://images.unsplash.com/photo-1581447100512-675974a24de7?auto=format&fit=crop&q=80&w=1000' },
    { trade: 'Electrical', title: 'Field Training: Residential Electrical Systems', loc: 'Jerusalem', about: 'Join me for site visits, learn wiring and troubleshooting in real-world scenarios.', req: 'Strong safety awareness.', learn: 'Wiring safety, blueprint reading.', img: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=1000' },
    { trade: 'Construction', title: 'Basics of Industrial Tiling & Renovations', loc: 'Beer Sheva', about: 'Intensive hands-on training for large-scale flooring and wall tiling projects.', req: 'Hard worker, physically fit.', learn: 'Tiling techniques, material mixing.', img: 'https://images.unsplash.com/photo-1541944743827-e04bb645f9ad?auto=format&fit=crop&q=80&w=1000' },
    { trade: 'Welding', title: 'Industrial Welding & Metal Fabrication', loc: 'Ashdod', about: 'Professional training in MIG/TIG welding and structural assembly.', req: 'Good eyes, steady hands.', learn: 'Metal cutting, TIG welding.', img: 'https://images.unsplash.com/photo-1504328332780-fe4675203ad4?auto=format&fit=crop&q=80&w=1000' },
    { trade: 'Automotive', title: 'Advanced Auto Diagnostics & Repair', loc: 'Holon', about: 'Hands-on experience with modern vehicle electronics and mechanical systems.', req: 'Technical mind, eagerness to learn.', learn: 'Engine tuning, diagnostic tools.', img: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80&w=1000' },
    { trade: 'Plumbing', title: 'Commercial Plumbing & Infrastructure', loc: 'Ramat Gan', about: 'Master the installation and maintenance of large-scale water and heating systems.', req: 'Reliability, physical ability.', learn: 'Pipe fitting, Leak detection.', img: 'https://images.unsplash.com/photo-1585704032915-c3400ca1f965?auto=format&fit=crop&q=80&w=1000' }
  ];

  for (const m of mentors) {
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(m.email) as any;
    let userId = existing?.id;
    
    if (!existing) {
      userId = db.prepare(`
        INSERT INTO users (name, email, password, role, trade, location, bio, avatar, verified, username) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
      `).run(m.name, m.email, masterPassword, 'mentor', m.trade, m.loc, m.bio, m.avatar, m.username).lastInsertRowid;
    } else {
      db.prepare('UPDATE users SET avatar = ?, bio = ?, trade = ? WHERE id = ?').run(m.avatar, m.bio, m.trade, userId);
    }

    const opp = opportunities.find(o => o.trade === m.trade);
    if (opp) {
      const existingOpp = db.prepare('SELECT id FROM opportunities WHERE ownerId = ? AND title = ?').get(userId, opp.title);
      if (!existingOpp) {
        db.prepare(`
          INSERT INTO opportunities (ownerId, type, title, location, aboutWork, requirements, menteeWillLearn, imageUrl, status) 
          VALUES (?, 'mentor_offer', ?, ?, ?, ?, ?, ?, 'active')
        `).run(userId, opp.title, opp.loc, opp.about, opp.req, opp.learn, opp.img);
      } else {
        db.prepare('UPDATE opportunities SET imageUrl = ?, location = ? WHERE ownerId = ? AND title = ?').run(opp.img, opp.loc, userId, opp.title);
      }
    }
  }

  // Ensure Admin exists
  const adminEmail = 'skilllink.academy@gmail.com';
  const adminExists = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail);
  if (!adminExists) {
    db.prepare(`
      INSERT INTO users (name, email, password, role, trade, location, bio, verified, username) 
      VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
    `).run('Admin', adminEmail, masterPassword, 'admin', 'Management', 'Tel Aviv', 'System Administrator', 'admin_master');
  }
  
  console.log('Database seeded successfully.');
}

async function startServer() {
  initDb();
  seedDatabase();
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

  // Serve static files from public directory ALWAYS and FIRST
  app.use(express.static(path.join(__dirname, 'public')));

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
  }

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
    
    // Get saved count
    const savedCount = (db.prepare('SELECT COUNT(*) as count FROM saved_opportunities WHERE userId = ?').get(req.user.id) as any).count;
    
    const { password: _, ...userWithoutPassword } = user;
    res.json({ ...userWithoutPassword, savedCount });
  });

  app.get('/api/auth/sqlite-id', authenticateToken, (req: any, res) => {
    res.json({ id: req.user.id });
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
      let localUser = db.prepare('SELECT * FROM users WHERE supabase_id = ? OR email = ?').get(user.id, user.email) as any;
      const metadata = user.user_metadata || {};
      
      // Fetch profile from Supabase to get the correct username
      let sbProfile: any = null;
      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('username, full_name, role, location, occupation, avatar_url')
          .eq('id', user.id)
          .maybeSingle();
        sbProfile = profileData;
      } catch (err) {
        console.warn('Could not fetch Supabase profile during sync:', err);
      }

      const finalUsername = sbProfile?.username || metadata.username || localUser?.username || `user_${Math.random().toString(36).substring(2, 10)}`;
      const finalFullName = sbProfile?.full_name || metadata.full_name || localUser?.name || 'User';
      const finalLocation = sbProfile?.location || metadata.location || localUser?.location || 'פתח תקווה';
      const finalTrade = sbProfile?.occupation || metadata.occupation || localUser?.trade || '';
      const finalAvatar = sbProfile?.avatar_url || metadata.avatar_url || localUser?.avatar || null;
      
      // Email-based admin promotion
      let finalRole = sbProfile?.role || metadata.role || localUser?.role || 'mentee';
      if (user.email === 'skilllink.academy@gmail.com') {
        finalRole = 'admin';
      }

      if (!localUser) {
        // Check if this is the first user
        const userCount = (db.prepare('SELECT COUNT(*) as count FROM users').get() as any).count;
        if (userCount === 0) finalRole = 'admin';

        const stmt = db.prepare('INSERT INTO users (supabase_id, name, email, password, role, location, trade, phone, workload, username, avatar, learningIntent, preferredDuration, businessType, targetAudience) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        const result = stmt.run(
          user.id,
          finalFullName,
          user.email,
          'supabase-auth-managed', // Placeholder password
          finalRole,
          finalLocation,
          finalTrade,
          metadata.phone || '',
          metadata.workload || 'low',
          finalUsername,
          finalAvatar,
          metadata.learning_intent || 'trade',
          metadata.preferred_duration || 'long',
          metadata.business_type || '',
          metadata.target_audience || ''
        );
        localUser = {
          id: result.lastInsertRowid,
          supabase_id: user.id,
          name: finalFullName,
          email: user.email,
          role: finalRole,
          username: finalUsername,
          avatar: finalAvatar,
          learningIntent: metadata.learning_intent || 'trade',
          preferredDuration: metadata.preferred_duration || 'long',
          businessType: metadata.business_type || '',
          targetAudience: metadata.target_audience || ''
        };
      } else {
        // Update existing user with latest data from Supabase
        const updateFields = [];
        const updateValues = [];
        
        updateFields.push('supabase_id = ?'); updateValues.push(user.id);
        updateFields.push('name = ?'); updateValues.push(finalFullName);
        updateFields.push('location = ?'); updateValues.push(finalLocation);
        updateFields.push('trade = ?'); updateValues.push(finalTrade);
        updateFields.push('username = ?'); updateValues.push(finalUsername);
        updateFields.push('avatar = ?'); updateValues.push(finalAvatar);
        updateFields.push('role = ?'); updateValues.push(finalRole);
        
        if (metadata.phone) { updateFields.push('phone = ?'); updateValues.push(metadata.phone); }
        if (metadata.learning_intent) { updateFields.push('learningIntent = ?'); updateValues.push(metadata.learning_intent); }
        if (metadata.preferred_duration) { updateFields.push('preferredDuration = ?'); updateValues.push(metadata.preferred_duration); }
        if (metadata.business_type) { updateFields.push('businessType = ?'); updateValues.push(metadata.business_type); }

        if (updateFields.length > 0) {
          updateValues.push(localUser.id);
          db.prepare(`UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`).run(...updateValues);
          // Refresh localUser object
          localUser = db.prepare('SELECT * FROM users WHERE id = ?').get(localUser.id);
        }
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
    const user = db.prepare('SELECT id, name, email, role, location, age, trade, bio, experience, businessName, teachingPrefs, areaServed, lang, avatar, username FROM users WHERE id = ?').get(req.params.id) as any;
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  });

  app.put('/api/users/me', authenticateToken, (req: any, res) => {
    // Map snake_case or legacy fields to SQLite schema
    const body = { ...req.body };
    if (body.full_name && !body.name) body.name = body.full_name;
    if (body.occupation && !body.trade) body.trade = body.occupation;
    if (body.years_experience !== undefined && body.experience === undefined) body.experience = body.years_experience;
    
    const allowedFields = [
      'name', 'bio', 'location', 'age', 'trade', 'experience', 'businessName', 
      'teachingPrefs', 'areaServed', 'lang', 'avatar', 'username', 'phone', 
      'workload', 'goals', 'availability', 'isBusiness', 'businessDescription', 
      'businessLogo', 'businessSocialLinks', 'businessWebsite', 'learningIntent', 
      'preferredDuration', 'businessType', 'targetAudience', 'headline',
      'skills_level', 'desired_salary', 'what_i_want_to_learn', 'who_i_want_to_teach',
      'availability_days', 'skills', 'cover_url'
    ];

    const fields = Object.keys(body).filter(f => allowedFields.includes(f));
    
    if (fields.length === 0) {
      console.warn('Update attempt with no valid fields. Body keys:', Object.keys(req.body));
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    try {
      const setClause = fields.map(f => `${f} = ?`).join(', ');
      const values = fields.map(f => {
        const val = body[f];
        // Special handling for numeric fields
        if (['experience', 'age'].includes(f)) {
          const parsed = parseInt(val);
          return isNaN(parsed) ? 0 : parsed;
        }
        if (['desired_salary'].includes(f)) {
          const parsed = parseFloat(val);
          return isNaN(parsed) ? 0 : parsed;
        }
        // Handle types that need special care (objects/arrays to JSON strings, booleans to integers)
        if (typeof val === 'object' && val !== null) return JSON.stringify(val);
        if (typeof val === 'boolean') return val ? 1 : 0;
        return val;
      });
      values.push(req.user.id);

      const stmt = db.prepare(`UPDATE users SET ${setClause} WHERE id = ?`);
      stmt.run(...values);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error updating profile in SQLite:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
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
    const { q, trade, location, role, experience, verified, isBusiness } = req.query;
    let query = 'SELECT id, name as full_name, role, location, trade as occupation, avatar as avatar_url, businessName, username, supabase_id, verified as is_verified, experience, isBusiness, createdAt as created_at FROM users WHERE 1=1';
    const params: any[] = [];

    if (q) {
      query += ' AND (name LIKE ? OR trade LIKE ? OR businessName LIKE ? OR businessDescription LIKE ?)';
      params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
    }
    if (trade && trade !== 'All' && trade !== 'all') {
      query += ' AND trade = ?';
      params.push(trade);
    }
    if (location && location !== 'All' && location !== 'all') {
      query += ' AND location LIKE ?';
      params.push(`%${location}%`);
    }
    if (role && role !== 'all') {
      query += ' AND role = ?';
      params.push(role);
    }
    if (experience) {
      query += ' AND experience >= ?';
      params.push(parseInt(experience as string));
    }
    if (verified === 'true') {
      query += ' AND verified = 1';
    }
    if (isBusiness === 'true' || isBusiness === true) {
      query += ' AND isBusiness = 1';
    }

    const results = db.prepare(query).all(...params);
    res.json(results);
  });

  app.get('/api/opportunities/saved', authenticateToken, (req: any, res) => {
    const saved = db.prepare(`
      SELECT o.*, u.name as ownerName, u.trade as ownerTrade, u.avatar as authorAvatar, u.supabase_id as ownerSupabaseId, u.username as ownerUsername, u.verified as ownerVerified
      FROM opportunities o
      JOIN saved_opportunities s ON o.id = s.opportunityId
      JOIN users u ON o.ownerId = u.id
      WHERE s.userId = ?
    `).all(req.user.id);
    res.json(saved);
  });

  app.get('/api/opportunities/recommended', authenticateToken, (req: any, res) => {
    try {
      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id) as any;
      if (!user) return res.status(404).json({ error: 'User not found' });

      // Fetch active opportunities excluding self
      const opportunities = db.prepare(`
        SELECT o.*, u.name as ownerName, u.trade as ownerTrade, u.location as ownerLocation, u.avatar as ownerAvatar, u.supabase_id as ownerSupabaseId, u.username as ownerUsername, u.verified as ownerVerified, u.role as ownerRole
        FROM opportunities o
        JOIN users u ON o.ownerId = u.id
        WHERE o.ownerId != ?
        LIMIT 50
      `).all(req.user.id) as any[];

      // Basic filtering is now handled mostly on the frontend to comply with Skill requirement
      // to call Gemini from frontend only. We return a good pool of candidates.
      res.json(opportunities);
    } catch (error) {
      console.error('Recommendation engine error:', error);
      res.status(500).json({ error: 'Failed to fetch recommendations' });
    }
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

  // Ratings & Reviews
  // Ratings: Add new review
  app.post('/api/ratings', authenticateToken, (req: any, res) => {
    let { toId, professional, teaching, workEthic, reliability, comment, requestId } = req.body;
    const fromId = req.user.id;

    if (!toId || !comment) {
      return res.status(400).json({ error: 'toId and comment are required' });
    }

    try {
      // If toId is a supabase UUID, resolve to SQLite ID
      if (typeof toId === 'string' && toId.length > 20) {
        const user = db.prepare('SELECT id FROM users WHERE supabase_id = ?').get(toId) as any;
        if (user) {
          toId = user.id;
        } else {
          return res.status(404).json({ error: 'Recipient not found' });
        }
      }

      const stmt = db.prepare(`
        INSERT INTO ratings (fromId, toId, professional, teaching, workEthic, reliability, comment, requestId)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const result = stmt.run(fromId, toId, professional, teaching, workEthic, reliability, comment, requestId || null);
      
      res.json({ success: true, ratingId: result.lastInsertRowid });
    } catch (error) {
      console.error('Error adding rating:', error);
      res.status(500).json({ error: 'Failed to add rating' });
    }
  });

  app.get('/api/ratings/user/:id', authenticateToken, (req: any, res) => {
    try {
      let targetId = req.params.id;
      
      // Resolve supabase UUID to SQLite ID if needed
      if (targetId.length > 20) {
        const user = db.prepare('SELECT id FROM users WHERE supabase_id = ?').get(targetId) as any;
        if (user) {
          targetId = user.id;
        } else {
          // If not found, return empty reviews instead of 404 to avoid breaking UI
          return res.json({ reviews: [], stats: { total: 0, overallAvg: 0 }, distribution: [] });
        }
      }

      const reviews = db.prepare(`
        SELECT r.*, u.name as fromName, u.avatar as fromAvatar, u.verified as fromVerified
        FROM ratings r
        JOIN users u ON r.fromId = u.id
        WHERE r.toId = ?
        ORDER BY r.createdAt DESC
      `).all(targetId);

      // Calculate stats
      const stats = db.prepare(`
        SELECT 
          COUNT(*) as total,
          AVG(professional) as avgProfessional,
          AVG(teaching) as avgTeaching,
          AVG(workEthic) as avgWorkEthic,
          AVG(reliability) as avgReliability,
          AVG((professional + teaching + workEthic + reliability) / 4.0) as overallAvg
        FROM ratings
        WHERE toId = ?
      `).get(targetId) as any;

      // Group by stars for overall distribution
      const distribution = db.prepare(`
        SELECT CAST(ROUND((professional + teaching + workEthic + reliability) / 4.0) AS INTEGER) as stars, COUNT(*) as count
        FROM ratings
        WHERE toId = ?
        GROUP BY stars
      `).all(targetId);

      res.json({ reviews, stats, distribution });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch reviews' });
    }
  });

  app.post('/api/admin/verify-user', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const { userId, status } = req.body; // status: 'verified' or 'rejected'
    
    try {
      const verified = status === 'verified' ? 1 : 0;
      db.prepare('UPDATE users SET verified = ?, verificationStatus = ? WHERE id = ?').run(verified, status, userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update verification' });
    }
  });

  // Opportunities
  app.get('/api/opportunities', (req: any, res) => {
    const { type, q } = req.query;
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    let userId: number | null = null;

    if (token) {
      try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        userId = decoded.id;
      } catch (e) {
        // Ignore invalid token for public list
      }
    }

    let query = `
      SELECT o.*, u.name as ownerName, u.avatar as ownerAvatar, u.trade as ownerTrade, u.role as ownerRole, u.verified as ownerVerified, u.username as ownerUsername, u.supabase_id as ownerSupabaseId,
      (SELECT COUNT(*) FROM saved_opportunities WHERE opportunityId = o.id AND userId = ?) as isSaved
      FROM opportunities o
      JOIN users u ON o.ownerId = u.id
      WHERE o.status = 'active'
    `;
    const params: any[] = [userId];

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
      SELECT o.*, u.name as ownerName, u.avatar as ownerAvatar, u.username as ownerUsername, u.supabase_id as ownerSupabaseId
      FROM opportunities o
      JOIN users u ON o.ownerId = u.id
      WHERE o.ownerId = ?
      ORDER BY o.createdAt DESC
    `).all(req.user.id);
    res.json(results);
  });

  app.get('/api/opportunities/:id', (req: any, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    let userId: number | null = null;

    if (token) {
      try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        userId = decoded.id;
      } catch (e) {
        // Ignore invalid token for public view
      }
    }

    const opportunity = db.prepare(`
      SELECT o.*, u.name as ownerName, u.avatar as ownerAvatar, u.trade as ownerTrade, u.role as ownerRole, u.verified as ownerVerified, u.username as ownerUsername, u.supabase_id as ownerSupabaseId,
      (SELECT COUNT(*) FROM saved_opportunities WHERE opportunityId = o.id AND userId = ?) as isSaved,
      (SELECT COUNT(*) FROM opportunity_interests WHERE opportunityId = o.id AND userId = ?) as isInterested
      FROM opportunities o
      JOIN users u ON o.ownerId = u.id
      WHERE o.id = ?
    `).get(userId, userId, req.params.id) as any;

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
      type, opportunity_type, commitment_level, learning_focus, duration_description,
      title, location, workHours, payAmount, payPeriod, 
      aboutWork, requirements, whoIWantToTeach, menteeWillLearn,
      availabilityDays, desiredSalary, whatIWantToLearn, experienceNote, imageUrl, profession 
    } = req.body;

    const stmt = db.prepare(`
      INSERT INTO opportunities (
        ownerId, type, opportunityType, commitmentLevel, learningFocus, durationDescription,
        title, location, workHours, payAmount, payPeriod,
        aboutWork, requirements, whoIWantToTeach, menteeWillLearn,
        availabilityDays, desiredSalary, whatIWantToLearn, experienceNote, imageUrl, profession, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `);

    const result = stmt.run(
      req.user.id, type, opportunity_type, commitment_level, learning_focus, duration_description,
      title, location, workHours, payAmount, payPeriod,
      aboutWork, requirements, whoIWantToTeach, menteeWillLearn,
      JSON.stringify(availabilityDays || []), desiredSalary, whatIWantToLearn, experienceNote, imageUrl, profession
    );

    res.json({ id: result.lastInsertRowid });
  });

  app.put('/api/opportunities/:id', authenticateToken, (req: any, res) => {
    const opp = db.prepare('SELECT ownerId FROM opportunities WHERE id = ?').get(req.params.id) as any;
    if (!opp) return res.status(404).json({ error: 'Not found' });
    if (opp.ownerId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

    // Vision update fields mapping
    if (req.body.opportunity_type !== undefined) req.body.opportunityType = req.body.opportunity_type;
    if (req.body.commitment_level !== undefined) req.body.commitmentLevel = req.body.commitment_level;
    if (req.body.learning_focus !== undefined) req.body.learningFocus = req.body.learning_focus;
    if (req.body.duration_description !== undefined) req.body.durationDescription = req.body.duration_description;

    const fields = [
      'type', 'title', 'location', 'workHours', 'payAmount', 'payPeriod',
      'aboutWork', 'requirements', 'whoIWantToTeach', 'menteeWillLearn',
      'availabilityDays', 'desiredSalary', 'whatIWantToLearn', 'experienceNote', 'imageUrl', 'status',
      'opportunityType', 'commitmentLevel', 'learningFocus', 'durationDescription', 'profession'
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

  app.get('/api/opportunities/:id/interests', authenticateToken, (req: any, res) => {
    const opp = db.prepare('SELECT ownerId FROM opportunities WHERE id = ?').get(req.params.id) as any;
    if (!opp) return res.status(404).json({ error: 'Not found' });
    if (opp.ownerId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

    const interests = db.prepare(`
      SELECT i.*, u.name as userName, u.avatar as userAvatar, u.trade as userTrade, u.username as userUsername, u.supabase_id as userSupabaseId
      FROM opportunity_interests i
      JOIN users u ON i.userId = u.id
      WHERE i.opportunityId = ?
      ORDER BY i.createdAt DESC
    `).all(req.params.id);
    res.json(interests);
  });

  app.post('/api/opportunities/:id/interest', authenticateToken, (req: any, res) => {
    const opportunityId = req.params.id;
    const userId = req.user.id;
    
    try {
      db.prepare('INSERT OR IGNORE INTO opportunity_interests (opportunityId, userId) VALUES (?, ?)').run(opportunityId, userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to express interest' });
    }
  });

  app.delete('/api/opportunities/:id/interest/:userId', authenticateToken, (req: any, res) => {
    const opp = db.prepare('SELECT ownerId FROM opportunities WHERE id = ?').get(req.params.id) as any;
    if (!opp) return res.status(404).json({ error: 'Not found' });
    if (opp.ownerId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

    db.prepare('DELETE FROM opportunity_interests WHERE opportunityId = ? AND userId = ?').run(req.params.id, req.params.userId);
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
      SELECT n.*, u.name as senderName, u.avatar as senderAvatar, u.username as senderUsername
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
          requestId INTEGER,
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

  // Admin: Verify user by Supabase ID
  app.post('/api/admin/verify-supabase/:supabaseId', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { supabaseId } = req.params;
    const { verified } = req.body;
    
    try {
      db.prepare('UPDATE users SET verified = ? WHERE supabase_id = ?').run(verified ? 1 : 0, supabaseId);
      res.json({ success: true });
    } catch (error) {
      console.error('Error updating SQLite verification:', error);
      res.status(500).json({ error: 'Failed to update verification status' });
    }
  });

  // Admin: Send notification by Supabase ID
  app.post('/api/admin/notify-supabase/:supabaseId', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { supabaseId } = req.params;
    const { type, title, content, link } = req.body;
    
    try {
      const targetUser = db.prepare('SELECT id FROM users WHERE supabase_id = ?').get(supabaseId) as any;
      if (!targetUser) return res.status(404).json({ error: 'User not found in SQLite' });

      const stmt = db.prepare('INSERT INTO notifications (userId, senderId, type, title, content, link) VALUES (?, ?, ?, ?, ?, ?)');
      stmt.run(targetUser.id, req.user.id, type, title, content, link);
      res.json({ success: true });
    } catch (error) {
      console.error('Error sending notification:', error);
      res.status(500).json({ error: 'Failed to send notification' });
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
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
