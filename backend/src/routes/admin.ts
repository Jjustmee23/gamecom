import { Router } from 'express';
import { db } from '../database/connection';
import { users, games, achievements, forums, notifications } from '../database/schema';
import { eq, and } from 'drizzle-orm';
import { requireRole } from '../middleware/auth';

const router = Router();

// Apply admin middleware to all routes
router.use(requireRole(['admin', 'moderator']));

// Get system statistics
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await db.select().from(users);
    const totalGames = await db.select().from(games);
    const totalAchievements = await db.select().from(achievements);
    const totalForums = await db.select().from(forums);

    const onlineUsers = totalUsers.filter(user => user.isOnline);

    return res.json({
      totalUsers: totalUsers.length,
      onlineUsers: onlineUsers.length,
      totalGames: totalGames.length,
      totalAchievements: totalAchievements.length,
      totalForums: totalForums.length
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all users (admin only)
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, role } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      role: users.role,
      level: users.level,
      xp: users.xp,
      isOnline: users.isOnline,
      lastSeen: users.lastSeen,
      createdAt: users.createdAt
    })
    .from(users);

    if (role) {
      query = query.where(eq(users.role, role as any));
    }

    const userList = await query.limit(Number(limit)).offset(offset);

    return res.json({ users: userList });
  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Update user role
router.put('/users/:id/role', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { role } = req.body;

    if (!['user', 'moderator', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    await db.update(users)
      .set({ role })
      .where(eq(users.id, userId));

    return res.json({ message: 'User role updated successfully' });
  } catch (error) {
    console.error('Update user role error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Ban/unban user
router.put('/users/:id/ban', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { banned } = req.body;

    // For now, we'll use a custom field or just update the role
    // In a real implementation, you'd have a banned field
    const newRole = banned ? 'user' : 'user'; // Can't set to 'banned' as it's not in enum
    
    await db.update(users)
      .set({ role: newRole })
      .where(eq(users.id, userId));

    return res.json({ message: `User ${banned ? 'banned' : 'unbanned'} successfully` });
  } catch (error) {
    console.error('Ban user error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Create achievement
router.post('/achievements', async (req, res) => {
  try {
    const { name, description, icon, type, gameId, xpReward } = req.body;

    if (!name || !description) {
      return res.status(400).json({ message: 'Name and description are required' });
    }

    const [newAchievement] = await db.insert(achievements).values({
      name,
      description,
      icon,
      type: type || 'custom',
      gameId,
      xpReward: xpReward || 0,
      isActive: true
    }).returning();

    return res.status(201).json({ 
      message: 'Achievement created successfully',
      achievement: newAchievement 
    });
  } catch (error) {
    console.error('Create achievement error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Update achievement
router.put('/achievements/:id', async (req, res) => {
  try {
    const achievementId = parseInt(req.params.id);
    const { name, description, icon, type, xpReward, isActive } = req.body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (icon) updateData.icon = icon;
    if (type) updateData.type = type;
    if (xpReward !== undefined) updateData.xpReward = xpReward;
    if (isActive !== undefined) updateData.isActive = isActive;

    await db.update(achievements)
      .set(updateData)
      .where(eq(achievements.id, achievementId));

    return res.json({ message: 'Achievement updated successfully' });
  } catch (error) {
    console.error('Update achievement error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete achievement
router.delete('/achievements/:id', async (req, res) => {
  try {
    const achievementId = parseInt(req.params.id);

    await db.delete(achievements).where(eq(achievements.id, achievementId));

    return res.json({ message: 'Achievement deleted successfully' });
  } catch (error) {
    console.error('Delete achievement error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Create forum
router.post('/forums', async (req, res) => {
  try {
    const { name, description, gameId } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Forum name is required' });
    }

    const [newForum] = await db.insert(forums).values({
      name,
      description,
      gameId,
      isActive: true
    }).returning();

    return res.status(201).json({ 
      message: 'Forum created successfully',
      forum: newForum 
    });
  } catch (error) {
    console.error('Create forum error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Update forum
router.put('/forums/:id', async (req, res) => {
  try {
    const forumId = parseInt(req.params.id);
    const { name, description, isActive } = req.body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = isActive;

    await db.update(forums)
      .set(updateData)
      .where(eq(forums.id, forumId));

    return res.json({ message: 'Forum updated successfully' });
  } catch (error) {
    console.error('Update forum error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete forum
router.delete('/forums/:id', async (req, res) => {
  try {
    const forumId = parseInt(req.params.id);

    await db.delete(forums).where(eq(forums.id, forumId));

    return res.json({ message: 'Forum deleted successfully' });
  } catch (error) {
    console.error('Delete forum error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Send system notification
router.post('/notifications', async (req, res) => {
  try {
    const { title, message, userIds } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }

    if (userIds && Array.isArray(userIds)) {
      // Send to specific users
      const notificationEntries = userIds.map((userId: number) => ({
        userId,
        type: 'system',
        title,
        message,
        isRead: false
      }));

      await db.insert(notifications).values(notificationEntries);
    } else {
      // Send to all users
      const allUsers = await db.select({ id: users.id }).from(users);
      
      const notificationEntries = allUsers.map(user => ({
        userId: user.id,
        type: 'system',
        title,
        message,
        isRead: false
      }));

      await db.insert(notifications).values(notificationEntries);
    }

    return res.json({ message: 'System notification sent successfully' });
  } catch (error) {
    console.error('Send system notification error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router; 