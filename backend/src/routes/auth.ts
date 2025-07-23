import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { Client } from 'pg';
import axios from 'axios';

const router = Router();

// Database connection
const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

// Connect to database
client.connect().catch(console.error);

// Register user
router.post('/register', [
  body('username').isLength({ min: 3, max: 50 }).withMessage('Username must be between 3 and 50 characters'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req: any, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUserResult = await client.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existingUserResult.rows.length > 0) {
      return res.status(400).json({ message: 'User with this email or username already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUserResult = await client.query(
      `INSERT INTO users (username, email, password, role, level, xp) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, username, email, role, level, xp`,
      [username, email, hashedPassword, 'user', 1, 0]
    );

    const newUser = newUserResult.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, username: newUser.username, role: newUser.role },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        level: newUser.level,
        xp: newUser.xp
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Login user
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req: any, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const userResult = await client.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = userResult.rows[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password || '');
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last seen
    await client.query(
      'UPDATE users SET last_seen = NOW() WHERE id = $1',
      [user.id]
    );

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
      { expiresIn: '7d' }
    );

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        level: user.level,
        xp: user.xp,
        avatar: user.avatar,
        bio: user.bio
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Steam OAuth routes
router.get('/steam', (req: any, res: any) => {
  const returnUrl = `${req.protocol}://${req.get('host')}/api/auth/steam/return`;
  const steamAuthUrl = `https://steamcommunity.com/openid/login?openid.ns=http://specs.openid.net/auth/2.0&openid.mode=checkid_setup&openid.return_to=${encodeURIComponent(returnUrl)}&openid.realm=${encodeURIComponent(req.protocol + '://' + req.get('host'))}&openid.identity=http://specs.openid.net/auth/2.0/identifier_select&openid.claimed_id=http://specs.openid.net/auth/2.0/identifier_select`;
  
  res.json({ 
    authUrl: steamAuthUrl,
    message: 'Steam OAuth URL generated'
  });
});

router.get('/steam/return', async (req: any, res: any) => {
  try {
    const { openid_assoc_handle, openid_sig, openid_signed, openid_ns, openid_mode } = req.query;
    
    if (openid_mode !== 'id_res') {
      return res.status(400).json({ error: 'Invalid OAuth response' });
    }
    
    // Verify Steam OpenID response
    const verifyResponse = await axios.post('https://steamcommunity.com/openid/login', {
      'openid.assoc_handle': openid_assoc_handle,
      'openid.sig': openid_sig,
      'openid.signed': openid_signed,
      'openid.ns': openid_ns,
      'openid.mode': 'check_authentication'
    });
    
    if (verifyResponse.data.includes('is_valid:true')) {
      // Extract Steam ID from the signed data
      const steamId = req.query['openid.claimed_id']?.toString().split('/').pop();
      
      if (steamId) {
        // Get Steam profile
        const STEAM_API_KEY = process.env.STEAM_API_KEY || '9F55E7961556268BE9A327338F50B893';
        const profileResponse = await axios.get(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_API_KEY}&steamids=${steamId}`);
        
        const player = profileResponse.data.response.players[0];
        
        // Check if user exists with this Steam ID
        const existingUserResult = await client.query(
          'SELECT * FROM users WHERE steam_id = $1',
          [steamId]
        );
        
        let user;
        
        if (existingUserResult.rows.length > 0) {
          // User exists, update last seen
          user = existingUserResult.rows[0];
          await client.query(
            'UPDATE users SET last_seen = NOW() WHERE id = $1',
            [user.id]
          );
        } else {
          // Create new user with Steam data
          const newUserResult = await client.query(
            `INSERT INTO users (username, email, steam_id, role, level, xp, avatar) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) 
             RETURNING id, username, email, role, level, xp, avatar`,
            [player.personaname, `${steamId}@steam.com`, steamId, 'user', 1, 0, player.avatarfull]
          );
          user = newUserResult.rows[0];
        }
        
        // Generate JWT token
        const token = jwt.sign(
          { id: user.id, username: user.username, role: user.role },
          process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
          { expiresIn: '7d' }
        );
        
        // Redirect to frontend with token
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        res.redirect(`${frontendUrl}/auth/steam/callback?token=${token}&steamId=${steamId}`);
      } else {
        res.status(400).json({ error: 'Could not extract Steam ID' });
      }
    } else {
      res.status(400).json({ error: 'Steam authentication failed' });
    }
  } catch (error) {
    console.error('Steam OAuth error:', error);
    res.status(500).json({ error: 'Steam authentication failed' });
  }
});

// Link Steam account to existing user
router.post('/steam/link', async (req: any, res: any) => {
  try {
    const { steamId, userId } = req.body;
    
    if (!steamId || !userId) {
      return res.status(400).json({ error: 'Steam ID and User ID are required' });
    }
    
    // Check if Steam ID is already linked
    const existingSteamResult = await client.query(
      'SELECT id FROM users WHERE steam_id = $1',
      [steamId]
    );
    
    if (existingSteamResult.rows.length > 0) {
      return res.status(400).json({ error: 'Steam account already linked to another user' });
    }
    
    // Link Steam account to user
    await client.query(
      'UPDATE users SET steam_id = $1 WHERE id = $2',
      [steamId, userId]
    );
    
    res.json({ message: 'Steam account linked successfully' });
  } catch (error) {
    console.error('Steam link error:', error);
    res.status(500).json({ error: 'Failed to link Steam account' });
  }
});

// Verify token
router.get('/verify', async (req: any, res: any) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production') as any;
    
    const userResult = await client.query(
      'SELECT * FROM users WHERE id = $1',
      [decoded.id]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'User not found' });
    }

    const user = userResult.rows[0];

    return res.json({
      valid: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        level: user.level,
        xp: user.xp,
        avatar: user.avatar,
        bio: user.bio
      }
    });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
});

export default router; 