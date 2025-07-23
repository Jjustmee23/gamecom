import { Router } from 'express';
import { Client } from 'pg';

const router = Router();

// Database connection
const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

// Connect to database
client.connect().catch(console.error);

// Get all users for Wall of Gamers (public info only)
router.get('/wall-of-gamers', async (req: any, res: any) => {
  try {
    const { page = 1, limit = 20, search, sortBy = 'level', sortOrder = 'desc' } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    let whereClause = 'WHERE status = \'active\'';
    const params: any[] = [];
    let paramIndex = 1;

    if (search) {
      whereClause += ` AND (username ILIKE $${paramIndex} OR bio ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Validate sort parameters
    const allowedSortFields = ['level', 'xp', 'points', 'username', 'last_seen', 'created_at'];
    const allowedSortOrders = ['asc', 'desc'];
    
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'level';
    const sortDirection = allowedSortOrders.includes(sortOrder.toLowerCase()) ? sortOrder.toUpperCase() : 'DESC';

    // Get total count
    const countResult = await client.query(
      `SELECT COUNT(*) FROM users ${whereClause}`,
      params
    );
    const totalCount = parseInt(countResult.rows[0].count);

    // Get users with public info
    const usersResult = await client.query(
      `SELECT 
        id, username, avatar, bio, level, xp, points, 
        steam_username, steam_avatar, steam_level,
        last_seen, created_at,
        (SELECT COUNT(*) FROM user_game_library WHERE user_id = users.id) as games_count,
        (SELECT COUNT(*) FROM user_game_achievements WHERE user_id = users.id AND is_unlocked = true) as achievements_count
       FROM users ${whereClause} 
       ORDER BY ${sortField} ${sortDirection}
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, parseInt(limit as string), offset]
    );

    const totalPages = Math.ceil(totalCount / parseInt(limit as string));

    return res.json({
      users: usersResult.rows,
      pagination: {
        currentPage: parseInt(page as string),
        totalPages,
        totalCount,
        limit: parseInt(limit as string)
      },
      filters: {
        search,
        sortBy: sortField,
        sortOrder: sortDirection
      }
    });
  } catch (error) {
    console.error('Error fetching wall of gamers:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get public user profile by ID
router.get('/profile/:id', async (req: any, res: any) => {
  try {
    const userId = parseInt(req.params.id);
    const requestingUserId = req.user?.id; // Current user making the request

    // Get user's public profile
    const userResult = await client.query(
      `SELECT 
        id, username, avatar, bio, level, xp, points, 
        steam_username, steam_avatar, steam_level,
        last_seen, created_at,
        (SELECT COUNT(*) FROM user_game_library WHERE user_id = users.id) as games_count,
        (SELECT COUNT(*) FROM user_game_achievements WHERE user_id = users.id AND is_unlocked = true) as achievements_count
       FROM users 
       WHERE id = $1 AND status = 'active'`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
  }

    const user = userResult.rows[0];

    // Get user's recent games
    const recentGamesResult = await client.query(
      `SELECT g.id, g.name, g.header_image, ugl.playtime, ugl.last_played, ugl.is_favorite
       FROM user_game_library ugl
       JOIN games g ON ugl.game_id = g.id
       WHERE ugl.user_id = $1
       ORDER BY ugl.last_played DESC NULLS LAST
       LIMIT 6`,
      [userId]
    );

    // Get user's recent achievements
    const recentAchievementsResult = await client.query(
      `SELECT uga.achievement_name, uga.achievement_description, uga.achievement_icon, uga.unlocked_at, g.name as game_name
       FROM user_game_achievements uga
       JOIN games g ON uga.game_id = g.id
       WHERE uga.user_id = $1 AND uga.is_unlocked = true
       ORDER BY uga.unlocked_at DESC
       LIMIT 5`,
      [userId]
    );

    // Check friendship status if requesting user is logged in
    let friendshipStatus = null;
    if (requestingUserId && requestingUserId !== userId) {
      const friendshipResult = await client.query(
        `SELECT status, created_at
         FROM friendships 
         WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)`,
        [requestingUserId, userId]
      );
      
      if (friendshipResult.rows.length > 0) {
        friendshipStatus = friendshipResult.rows[0];
      }
    }

    return res.json({
      user,
      recentGames: recentGamesResult.rows,
      recentAchievements: recentAchievementsResult.rows,
      friendshipStatus
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Send friendship request
router.post('/friendship/request', async (req: any, res: any) => {
  try {
    const { friendId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (userId === friendId) {
      return res.status(400).json({ message: 'Cannot send friend request to yourself' });
    }

    // Check if friendship already exists
    const existingFriendship = await client.query(
      `SELECT * FROM friendships 
       WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)`,
      [userId, friendId]
    );

    if (existingFriendship.rows.length > 0) {
      const friendship = existingFriendship.rows[0];
      
      if (friendship.status === 'accepted') {
        return res.status(400).json({ message: 'Already friends' });
      } else if (friendship.status === 'pending') {
        if (friendship.user_id === userId) {
          return res.status(400).json({ message: 'Friend request already sent' });
        } else {
          // Accept the pending request
          await client.query(
            `UPDATE friendships SET status = 'accepted', updated_at = CURRENT_TIMESTAMP
             WHERE user_id = $1 AND friend_id = $2`,
            [friendId, userId]
          );
          return res.json({ message: 'Friend request accepted' });
        }
      }
    }

    // Send new friend request
    await client.query(
      `INSERT INTO friendships (user_id, friend_id, status, created_at, updated_at)
       VALUES ($1, $2, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [userId, friendId]
    );

    return res.json({ message: 'Friend request sent successfully' });
  } catch (error) {
    console.error('Error sending friend request:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Accept/Reject friendship request
router.patch('/friendship/:action', async (req: any, res: any) => {
  try {
    const { action } = req.params; // 'accept' or 'reject'
    const { friendId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (action === 'accept') {
      await client.query(
        `UPDATE friendships 
         SET status = 'accepted', updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $1 AND friend_id = $2 AND status = 'pending'`,
        [friendId, userId]
      );
      return res.json({ message: 'Friend request accepted' });
    } else if (action === 'reject') {
      await client.query(
        `DELETE FROM friendships 
         WHERE user_id = $1 AND friend_id = $2 AND status = 'pending'`,
        [friendId, userId]
      );
      return res.json({ message: 'Friend request rejected' });
    } else {
      return res.status(400).json({ message: 'Invalid action' });
    }
  } catch (error) {
    console.error('Error updating friendship:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user's friends
router.get('/friends', async (req: any, res: any) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const friendsResult = await client.query(
      `SELECT 
        u.id, u.username, u.avatar, u.level, u.last_seen,
        f.created_at as friendship_date
       FROM friendships f
       JOIN users u ON (f.user_id = u.id OR f.friend_id = u.id)
       WHERE f.status = 'accepted' 
       AND u.id != $1
       AND (f.user_id = $1 OR f.friend_id = $1)
       ORDER BY u.last_seen DESC`,
      [userId]
    );

    return res.json({ friends: friendsResult.rows });
  } catch (error) {
    console.error('Error fetching friends:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get pending friend requests
router.get('/friendship/pending', async (req: any, res: any) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const pendingResult = await client.query(
      `SELECT 
        u.id, u.username, u.avatar, u.level, u.created_at as user_created_at,
        f.created_at as request_date
       FROM friendships f
       JOIN users u ON f.user_id = u.id
       WHERE f.friend_id = $1 AND f.status = 'pending'
       ORDER BY f.created_at DESC`,
      [userId]
    );

    return res.json({ pendingRequests: pendingResult.rows });
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router; 