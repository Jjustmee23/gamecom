import { Router } from 'express';
import { db } from '../database/connection';
import { notifications } from '../database/schema';
import { eq } from 'drizzle-orm';
import { and } from 'drizzle-orm';

const router = Router();

// Get user's notifications
router.get('/', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    const { page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userNotifications = await db.select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(notifications.createdAt)
      .limit(Number(limit))
      .offset(offset);

    return res.json({ notifications: userNotifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Mark notification as read
router.put('/:id/read', async (req, res) => {
  try {
    const notificationId = parseInt(req.params.id);
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    await db.update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)));

    return res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification read error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Mark all notifications as read
router.put('/read-all', async (req, res) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId));

    return res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete notification
router.delete('/:id', async (req, res) => {
  try {
    const notificationId = parseInt(req.params.id);
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    await db.delete(notifications)
      .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)));

    return res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Delete notification error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get unread count
router.get('/unread-count', async (req, res) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const unreadCount = await db.select()
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));

    return res.json({ unreadCount: unreadCount.length });
  } catch (error) {
    console.error('Get unread count error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router; 