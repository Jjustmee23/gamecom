import { Router } from 'express';
import { Client } from 'pg';

const router = Router();

// Database connection
const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

// Connect to database
client.connect().catch(console.error);

// Get all chat rooms
router.get('/rooms', async (req: any, res: any) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const roomsResult = await client.query(
      `SELECT cr.*, g.name as game_name, 
              (SELECT COUNT(*) FROM chat_room_members WHERE room_id = cr.id) as member_count,
              crm.is_admin
       FROM chat_rooms cr
       LEFT JOIN games g ON cr.game_id = g.id
       LEFT JOIN chat_room_members crm ON cr.id = crm.room_id AND crm.user_id = $1
       WHERE cr.id IN (SELECT room_id FROM chat_room_members WHERE user_id = $1)
       ORDER BY cr.created_at DESC`,
      [userId]
    );

    return res.json({
      rooms: roomsResult.rows
    });
  } catch (error) {
    console.error('Error fetching chat rooms:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new chat room
router.post('/rooms', async (req: any, res: any) => {
  try {
    const userId = req.user?.id;
    const { name, isGroup = true, gameId } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!name) {
      return res.status(400).json({ message: 'Room name is required' });
    }

    // Create room
    const roomResult = await client.query(
      `INSERT INTO chat_rooms (name, is_group, game_id, created_by) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [name, isGroup, gameId, userId]
    );

    const room = roomResult.rows[0];

    // Add creator as admin member
    await client.query(
      `INSERT INTO chat_room_members (room_id, user_id, is_admin) 
       VALUES ($1, $2, $3)`,
      [room.id, userId, true]
    );

    return res.status(201).json(room);
  } catch (error) {
    console.error('Error creating chat room:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get room messages
router.get('/rooms/:roomId/messages', async (req: any, res: any) => {
  try {
    const userId = req.user?.id;
    const roomId = parseInt(req.params.roomId);

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Check if user is member of the room
    const memberResult = await client.query(
      'SELECT * FROM chat_room_members WHERE room_id = $1 AND user_id = $2',
      [roomId, userId]
    );

    if (memberResult.rows.length === 0) {
      return res.status(403).json({ message: 'Not a member of this room' });
    }

    // Get messages
    const messagesResult = await client.query(
      `SELECT m.*, u.username as sender_name, u.avatar as sender_avatar
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.room_id = $1
       ORDER BY m.created_at DESC
       LIMIT 50`,
      [roomId]
    );

    return res.json({
      messages: messagesResult.rows.reverse()
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get room users
router.get('/rooms/:roomId/users', async (req: any, res: any) => {
  try {
    const userId = req.user?.id;
    const roomId = parseInt(req.params.roomId);

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Check if user is member of the room
    const memberResult = await client.query(
      'SELECT * FROM chat_room_members WHERE room_id = $1 AND user_id = $2',
      [roomId, userId]
    );

    if (memberResult.rows.length === 0) {
      return res.status(403).json({ message: 'Not a member of this room' });
    }

    // Get room users
    const usersResult = await client.query(
      `SELECT u.id, u.username, u.avatar, u.is_online, u.last_seen, crm.is_admin
       FROM chat_room_members crm
       JOIN users u ON crm.user_id = u.id
       WHERE crm.room_id = $1
       ORDER BY crm.is_admin DESC, u.username`,
      [roomId]
    );

    return res.json({
      users: usersResult.rows
    });
  } catch (error) {
    console.error('Error fetching room users:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Add user to room
router.post('/rooms/:roomId/members', async (req: any, res: any) => {
  try {
    const userId = req.user?.id;
    const roomId = parseInt(req.params.roomId);
    const { targetUserId } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Check if user is admin of the room
    const adminResult = await client.query(
      'SELECT * FROM chat_room_members WHERE room_id = $1 AND user_id = $2 AND is_admin = true',
      [roomId, userId]
    );

    if (adminResult.rows.length === 0) {
      return res.status(403).json({ message: 'Not an admin of this room' });
    }

    // Add user to room
    await client.query(
      'INSERT INTO chat_room_members (room_id, user_id, is_admin) VALUES ($1, $2, $3)',
      [roomId, targetUserId, false]
    );

    return res.json({ message: 'User added to room successfully' });
  } catch (error) {
    console.error('Error adding user to room:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Remove user from room
router.delete('/rooms/:roomId/members/:targetUserId', async (req: any, res: any) => {
  try {
    const userId = req.user?.id;
    const roomId = parseInt(req.params.roomId);
    const targetUserId = parseInt(req.params.targetUserId);

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Check if user is admin of the room
    const adminResult = await client.query(
      'SELECT * FROM chat_room_members WHERE room_id = $1 AND user_id = $2 AND is_admin = true',
      [roomId, userId]
    );

    if (adminResult.rows.length === 0) {
      return res.status(403).json({ message: 'Not an admin of this room' });
    }

    // Remove user from room
    await client.query(
      'DELETE FROM chat_room_members WHERE room_id = $1 AND user_id = $2',
      [roomId, targetUserId]
    );

    return res.json({ message: 'User removed from room successfully' });
  } catch (error) {
    console.error('Error removing user from room:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get direct messages
router.get('/direct-messages', async (req: any, res: any) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Get direct message rooms (private rooms with 2 members)
    const dmResult = await client.query(
      `SELECT cr.*, 
              (SELECT u.username FROM users u 
               JOIN chat_room_members crm ON u.id = crm.user_id 
               WHERE crm.room_id = cr.id AND u.id != $1 LIMIT 1) as other_user_name
       FROM chat_rooms cr
       WHERE cr.is_group = false 
       AND cr.id IN (SELECT room_id FROM chat_room_members WHERE user_id = $1)
       AND (SELECT COUNT(*) FROM chat_room_members WHERE room_id = cr.id) = 2`,
      [userId]
    );

    return res.json({
      directMessages: dmResult.rows
    });
  } catch (error) {
    console.error('Error fetching direct messages:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Create or get direct message room
router.post('/direct-messages', async (req: any, res: any) => {
  try {
    const userId = req.user?.id;
    const { targetUserId } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Check if DM room already exists
    const existingRoomResult = await client.query(
      `SELECT cr.* FROM chat_rooms cr
       WHERE cr.is_group = false
       AND cr.id IN (SELECT room_id FROM chat_room_members WHERE user_id = $1)
       AND cr.id IN (SELECT room_id FROM chat_room_members WHERE user_id = $2)
       AND (SELECT COUNT(*) FROM chat_room_members WHERE room_id = cr.id) = 2`,
      [userId, targetUserId]
    );

    if (existingRoomResult.rows.length > 0) {
      return res.json(existingRoomResult.rows[0]);
    }

    // Create new DM room
    const roomResult = await client.query(
      `INSERT INTO chat_rooms (name, is_group, created_by) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [`DM_${userId}_${targetUserId}`, false, userId]
    );

    const room = roomResult.rows[0];

    // Add both users to the room
    await client.query(
      `INSERT INTO chat_room_members (room_id, user_id, is_admin) VALUES ($1, $2, $3), ($1, $4, $3)`,
      [room.id, userId, false, targetUserId]
    );

    return res.status(201).json(room);
  } catch (error) {
    console.error('Error creating direct message:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router; 