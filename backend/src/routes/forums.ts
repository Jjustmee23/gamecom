import { Router } from 'express';
import { db } from '../database/connection';
import { forums, forumTopics, forumPosts, users } from '../database/schema';
import { eq, and } from 'drizzle-orm';

const router = Router();

// Get all forums
router.get('/', async (req, res) => {
  try {
    const forumList = await db.select({
      id: forums.id,
      name: forums.name,
      description: forums.description,
      isActive: forums.isActive,
      createdAt: forums.createdAt
    })
    .from(forums)
    .where(eq(forums.isActive, true));

    return res.json({ forums: forumList });
  } catch (error) {
    console.error('Get forums error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get forum by ID with topics
router.get('/:id', async (req, res) => {
  try {
    const forumId = parseInt(req.params.id);
    const { page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const forum = await db.select().from(forums).where(eq(forums.id, forumId)).limit(1);
    
    if (forum.length === 0) {
      return res.status(404).json({ message: 'Forum not found' });
    }

    const topics = await db.select({
      id: forumTopics.id,
      title: forumTopics.title,
      isPinned: forumTopics.isPinned,
      isLocked: forumTopics.isLocked,
      viewCount: forumTopics.viewCount,
      createdAt: forumTopics.createdAt,
      author: {
        id: users.id,
        username: users.username,
        avatar: users.avatar
      }
    })
    .from(forumTopics)
    .innerJoin(users, eq(users.id, forumTopics.authorId))
    .where(eq(forumTopics.forumId, forumId))
    .orderBy(forumTopics.isPinned, forumTopics.createdAt)
    .limit(Number(limit))
    .offset(offset);

    return res.json({ 
      forum: forum[0],
      topics: topics
    });
  } catch (error) {
    console.error('Get forum error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new topic
router.post('/:id/topics', async (req, res) => {
  try {
    const forumId = parseInt(req.params.id);
    const userId = (req as any).user?.id;
    const { title, content } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const [newTopic] = await db.insert(forumTopics).values({
      forumId,
      title,
      content,
      authorId: userId
    }).returning();

    return res.status(201).json({ 
      message: 'Topic created successfully',
      topic: newTopic 
    });
  } catch (error) {
    console.error('Create topic error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get topic by ID with posts
router.get('/topics/:id', async (req, res) => {
  try {
    const topicId = parseInt(req.params.id);
    const { page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const topic = await db.select({
      id: forumTopics.id,
      title: forumTopics.title,
      content: forumTopics.content,
      isPinned: forumTopics.isPinned,
      isLocked: forumTopics.isLocked,
      viewCount: forumTopics.viewCount,
      createdAt: forumTopics.createdAt,
      author: {
        id: users.id,
        username: users.username,
        avatar: users.avatar
      }
    })
    .from(forumTopics)
    .innerJoin(users, eq(users.id, forumTopics.authorId))
    .where(eq(forumTopics.id, topicId))
    .limit(1);

    if (topic.length === 0) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    // Increment view count
    await db.update(forumTopics)
      .set({ viewCount: (topic[0].viewCount || 0) + 1 })
      .where(eq(forumTopics.id, topicId));

    const posts = await db.select({
      id: forumPosts.id,
      content: forumPosts.content,
      isEdited: forumPosts.isEdited,
      createdAt: forumPosts.createdAt,
      author: {
        id: users.id,
        username: users.username,
        avatar: users.avatar
      }
    })
    .from(forumPosts)
    .innerJoin(users, eq(users.id, forumPosts.authorId))
    .where(eq(forumPosts.topicId, topicId))
    .orderBy(forumPosts.createdAt)
    .limit(Number(limit))
    .offset(offset);

    return res.json({ 
      topic: topic[0],
      posts: posts
    });
  } catch (error) {
    console.error('Get topic error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Add post to topic
router.post('/topics/:id/posts', async (req, res) => {
  try {
    const topicId = parseInt(req.params.id);
    const userId = (req as any).user?.id;
    const { content } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    // Check if topic is locked
    const topic = await db.select({ isLocked: forumTopics.isLocked })
      .from(forumTopics)
      .where(eq(forumTopics.id, topicId))
      .limit(1);

    if (topic.length === 0) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    if (topic[0].isLocked) {
      return res.status(403).json({ message: 'Topic is locked' });
    }

    const [newPost] = await db.insert(forumPosts).values({
      topicId,
      content,
      authorId: userId
    }).returning();

    return res.status(201).json({ 
      message: 'Post added successfully',
      post: newPost 
    });
  } catch (error) {
    console.error('Add post error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Update post
router.put('/posts/:id', async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const userId = (req as any).user?.id;
    const { content } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    // Check if user owns the post
    const post = await db.select().from(forumPosts)
      .where(and(eq(forumPosts.id, postId), eq(forumPosts.authorId, userId)))
      .limit(1);

    if (post.length === 0) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await db.update(forumPosts)
      .set({ content, isEdited: true, updatedAt: new Date() })
      .where(eq(forumPosts.id, postId));

    return res.json({ message: 'Post updated successfully' });
  } catch (error) {
    console.error('Update post error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete post
router.delete('/posts/:id', async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Check if user owns the post or is admin
    const user = await db.select({ role: users.role })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const post = await db.select().from(forumPosts)
      .where(eq(forumPosts.id, postId))
      .limit(1);

    if (post.length === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const canDelete = user[0]?.role === 'admin' || post[0].authorId === userId;

    if (!canDelete) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await db.delete(forumPosts).where(eq(forumPosts.id, postId));

    return res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Search topics
router.get('/search/topics', async (req, res) => {
  try {
    const { q } = req.query;
    const { page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ message: 'Search query required' });
    }

    const searchResults = await db.select({
      id: forumTopics.id,
      title: forumTopics.title,
      viewCount: forumTopics.viewCount,
      createdAt: forumTopics.createdAt,
      forum: {
        id: forums.id,
        name: forums.name
      },
      author: {
        id: users.id,
        username: users.username
      }
    })
    .from(forumTopics)
    .innerJoin(forums, eq(forums.id, forumTopics.forumId))
    .innerJoin(users, eq(users.id, forumTopics.authorId))
    .where(eq(forumTopics.title, q))
    .orderBy(forumTopics.createdAt)
    .limit(Number(limit))
    .offset(offset);

    return res.json({ topics: searchResults });
  } catch (error) {
    console.error('Search topics error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router; 