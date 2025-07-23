import express from 'express';
import { db } from '../database/connection';
import { achievements, userAchievements, users } from '../database/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

const router = express.Router();

// Get all achievements
router.get('/', async (req, res) => {
  try {
    const { gameId, type } = req.query;

    let conditions = [eq(achievements.isActive, true)];

    if (gameId) {
      conditions.push(eq(achievements.gameId, parseInt(gameId as string)));
    }

    if (type) {
      conditions.push(eq(achievements.type, type as any));
    }

    const achievementList = await db.select({
      id: achievements.id,
      name: achievements.name,
      description: achievements.description,
      icon: achievements.icon,
      type: achievements.type,
      xpReward: achievements.xpReward,
      gameId: achievements.gameId,
      isActive: achievements.isActive,
      createdAt: achievements.createdAt
    })
    .from(achievements)
    .where(and(...conditions));

    return res.json({ achievements: achievementList });
  } catch (error) {
    console.error('Get achievements error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user's achievements
router.get('/user', async (req, res) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userAchievementList = await db.select({
      id: userAchievements.id,
      unlockedAt: userAchievements.unlockedAt,
      achievement: {
        id: achievements.id,
        name: achievements.name,
        description: achievements.description,
        icon: achievements.icon,
        type: achievements.type,
        xpReward: achievements.xpReward
      }
    })
    .from(userAchievements)
    .innerJoin(achievements, eq(achievements.id, userAchievements.achievementId))
    .where(eq(userAchievements.userId, userId));

    return res.json({ achievements: userAchievementList });
  } catch (error) {
    console.error('Get user achievements error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Unlock achievement for user
router.post('/unlock/:achievementId', async (req, res) => {
  try {
    const achievementId = parseInt(req.params.achievementId);
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Check if achievement exists and is active
    const achievement = await db.select().from(achievements)
      .where(and(eq(achievements.id, achievementId), eq(achievements.isActive, true)))
      .limit(1);

    if (achievement.length === 0) {
      return res.status(404).json({ message: 'Achievement not found' });
    }

    // Check if user already has this achievement
    const existingAchievement = await db.select().from(userAchievements)
      .where(and(eq(userAchievements.userId, userId), eq(userAchievements.achievementId, achievementId)))
      .limit(1);

    if (existingAchievement.length > 0) {
      return res.status(400).json({ message: 'Achievement already unlocked' });
    }

    // Unlock achievement
    await db.insert(userAchievements).values({
      userId,
      achievementId
    });

    // Award XP to user
    const xpReward = achievement[0].xpReward || 0;
    await db.update(users)
      .set({ xp: sql`${users.xp} + ${xpReward}` })
      .where(eq(users.id, userId));

    // Check for level up
    const user = await db.select({ xp: users.xp, level: users.level })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user.length > 0) {
      const currentXp = user[0].xp || 0;
      const currentLevel = user[0].level || 1;
      const xpForNextLevel = currentLevel * 100; // Simple leveling formula

      if (currentXp >= xpForNextLevel) {
        await db.update(users)
          .set({ level: currentLevel + 1 })
          .where(eq(users.id, userId));
      }
    }

    return res.json({ message: 'Achievement unlocked successfully' });
  } catch (error) {
    console.error('Unlock achievement error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get achievement statistics
router.get('/stats', async (req, res) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const stats = await db.select({
      totalAchievements: sql<number>`count(${achievements.id})`,
      unlockedAchievements: sql<number>`count(${userAchievements.id})`,
      totalXp: sql<number>`sum(${achievements.xpReward})`
    })
    .from(achievements)
    .leftJoin(userAchievements, and(
      eq(userAchievements.achievementId, achievements.id),
      eq(userAchievements.userId, userId)
    ))
    .where(eq(achievements.isActive, true));

    return res.json({ stats: stats[0] });
  } catch (error) {
    console.error('Get achievement stats error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const leaderboard = await db.select({
      userId: users.id,
      username: users.username,
      avatar: users.avatar,
      level: users.level,
      xp: users.xp,
      achievementCount: sql<number>`count(${userAchievements.id})`
    })
    .from(users)
    .leftJoin(userAchievements, eq(userAchievements.userId, users.id))
    .groupBy(users.id, users.username, users.avatar, users.level, users.xp)
    .orderBy(desc(users.xp), desc(sql`count(${userAchievements.id})`))
    .limit(10);

    return res.json({ leaderboard });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router; 