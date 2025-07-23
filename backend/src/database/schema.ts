import { pgTable, serial, text, varchar, integer, boolean, timestamp, json, uuid, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { Client } from 'pg';

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

export async function createTables() {
  try {
    await client.connect();

    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        avatar VARCHAR(255),
        bio TEXT,
        level INTEGER DEFAULT 1,
        xp INTEGER DEFAULT 0,
        points INTEGER DEFAULT 0,
        role VARCHAR(20) DEFAULT 'user',
        status VARCHAR(20) DEFAULT 'active',
        steam_id VARCHAR(50),
        steam_username VARCHAR(100),
        steam_avatar VARCHAR(255),
        steam_level INTEGER,
        last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Games table with extensive metadata and soft delete
    await client.query(`
      CREATE TABLE IF NOT EXISTS games (
        id SERIAL PRIMARY KEY,
        steam_id INTEGER UNIQUE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        short_description TEXT,
        header_image VARCHAR(500),
        background_image VARCHAR(500),
        screenshots JSONB,
        movies JSONB,
        categories JSONB,
        genres JSONB,
        release_date DATE,
        coming_soon BOOLEAN DEFAULT false,
        platforms JSONB,
        metacritic_score INTEGER,
        metacritic_url VARCHAR(500),
        price_currency VARCHAR(10),
        price_initial INTEGER,
        price_final INTEGER,
        price_discount INTEGER,
        price_initial_formatted VARCHAR(50),
        price_final_formatted VARCHAR(50),
        dlc JSONB,
        requirements_minimum TEXT,
        requirements_recommended TEXT,
        supported_languages TEXT,
        website VARCHAR(500),
        developers JSONB,
        publishers JSONB,
        is_free BOOLEAN DEFAULT false,
        type VARCHAR(50),
        recommendations_total INTEGER DEFAULT 0,
        achievements_count INTEGER DEFAULT 0,
        steam_store_url VARCHAR(500),
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        deleted_by INTEGER REFERENCES users(id),
        deletion_reason TEXT
      )
    `);

    // Game reviews table
    await client.query(`
      CREATE TABLE IF NOT EXISTS game_reviews (
        id SERIAL PRIMARY KEY,
        game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        pros JSONB,
        cons JSONB,
        playtime INTEGER DEFAULT 0,
        helpful_count INTEGER DEFAULT 0,
        is_verified BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(game_id, user_id)
      )
    `);

    // Game forum posts table
    await client.query(`
      CREATE TABLE IF NOT EXISTS game_forum_posts (
        id SERIAL PRIMARY KEY,
        game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        category VARCHAR(50) NOT NULL,
        is_pinned BOOLEAN DEFAULT false,
        is_locked BOOLEAN DEFAULT false,
        view_count INTEGER DEFAULT 0,
        reply_count INTEGER DEFAULT 0,
        helpful_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Game wiki pages table
    await client.query(`
      CREATE TABLE IF NOT EXISTS game_wiki_pages (
        id SERIAL PRIMARY KEY,
        game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        category VARCHAR(50) NOT NULL,
        version INTEGER DEFAULT 1,
        last_edited_by INTEGER REFERENCES users(id),
        last_edited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(game_id, title)
      )
    `);

    // User game library table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_game_library (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
        playtime INTEGER DEFAULT 0,
        last_played TIMESTAMP,
        is_favorite BOOLEAN DEFAULT false,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, game_id)
      )
    `);

    // User game achievements table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_game_achievements (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
        achievement_name VARCHAR(255) NOT NULL,
        achievement_description TEXT,
        achievement_icon VARCHAR(500),
        is_unlocked BOOLEAN DEFAULT false,
        unlocked_at TIMESTAMP,
        steam_achievement_id VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, game_id, achievement_name)
      )
    `);

    // Game cache status table
    await client.query(`
      CREATE TABLE IF NOT EXISTS game_cache_status (
        id SERIAL PRIMARY KEY,
        steam_id INTEGER UNIQUE,
        last_fetched TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fetch_count INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        error_count INTEGER DEFAULT 0,
        last_error TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Friendships table
    await client.query(`
      CREATE TABLE IF NOT EXISTS friendships (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        friend_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, friend_id)
      )
    `);

    // Create indexes for better performance
    await client.query(`CREATE INDEX IF NOT EXISTS idx_games_steam_id ON games(steam_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_games_name ON games(name)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_games_release_date ON games(release_date)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_games_metacritic_score ON games(metacritic_score)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_games_last_updated ON games(last_updated)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_game_reviews_game_id ON game_reviews(game_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_game_reviews_user_id ON game_reviews(user_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_game_forum_posts_game_id ON game_forum_posts(game_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_user_game_library_user_id ON user_game_library(user_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_user_game_achievements_user_id ON user_game_achievements(user_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_friendships_user_id ON friendships(user_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_friendships_friend_id ON friendships(friend_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status)`);

    console.log('Database tables created successfully');
  } catch (error) {
    console.error('Error creating database tables:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Enums
export const userRoleEnum = pgEnum('user_role', ['user', 'moderator', 'admin']);
export const friendshipStatusEnum = pgEnum('friendship_status', ['pending', 'accepted', 'blocked']);
export const achievementTypeEnum = pgEnum('achievement_type', ['game', 'social', 'community', 'custom']);
export const notificationTypeEnum = pgEnum('notification_type', ['friend_request', 'message', 'achievement', 'challenge', 'system']);

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  steamId: varchar('steam_id', { length: 50 }).unique(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }),
  avatar: text('avatar'),
  bio: text('bio'),
  role: userRoleEnum('role').default('user'),
  level: integer('level').default(1),
  xp: integer('xp').default(0),
  isOnline: boolean('is_online').default(false),
  lastSeen: timestamp('last_seen').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Games table
export const games = pgTable('games', {
  id: serial('id').primaryKey(),
  steamAppId: integer('steam_app_id').unique(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  coverImage: text('cover_image'),
  genre: varchar('genre', { length: 100 }),
  platform: varchar('platform', { length: 50 }),
  releaseDate: timestamp('release_date'),
  rating: integer('rating').default(0),
  totalRatings: integer('total_ratings').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// User Games (library)
export const userGames = pgTable('user_games', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  gameId: integer('game_id').references(() => games.id, { onDelete: 'cascade' }),
  playtime: integer('playtime').default(0),
  isFavorite: boolean('is_favorite').default(false),
  isWishlisted: boolean('is_wishlisted').default(false),
  lastPlayed: timestamp('last_played'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Achievements table
export const achievements = pgTable('achievements', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  icon: text('icon'),
  type: achievementTypeEnum('type').default('custom'),
  gameId: integer('game_id').references(() => games.id, { onDelete: 'cascade' }),
  xpReward: integer('xp_reward').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// User Achievements
export const userAchievements = pgTable('user_achievements', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  achievementId: integer('achievement_id').references(() => achievements.id, { onDelete: 'cascade' }),
  unlockedAt: timestamp('unlocked_at').defaultNow(),
});

// Friendships table
export const friendships = pgTable('friendships', {
  id: serial('id').primaryKey(),
  requesterId: integer('requester_id').references(() => users.id, { onDelete: 'cascade' }),
  addresseeId: integer('addressee_id').references(() => users.id, { onDelete: 'cascade' }),
  status: friendshipStatusEnum('status').default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Chat Rooms
export const chatRooms = pgTable('chat_rooms', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }),
  isGroup: boolean('is_group').default(false),
  gameId: integer('game_id').references(() => games.id, { onDelete: 'cascade' }),
  createdBy: integer('created_by').references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
});

// Chat Room Members
export const chatRoomMembers = pgTable('chat_room_members', {
  id: serial('id').primaryKey(),
  roomId: integer('room_id').references(() => chatRooms.id, { onDelete: 'cascade' }),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  isAdmin: boolean('is_admin').default(false),
  joinedAt: timestamp('joined_at').defaultNow(),
});

// Messages table
export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  roomId: integer('room_id').references(() => chatRooms.id, { onDelete: 'cascade' }),
  senderId: integer('sender_id').references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  messageType: varchar('message_type', { length: 20 }).default('text'),
  isEdited: boolean('is_edited').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Forums table
export const forums = pgTable('forums', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  gameId: integer('game_id').references(() => games.id, { onDelete: 'cascade' }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Forum Topics
export const forumTopics = pgTable('forum_topics', {
  id: serial('id').primaryKey(),
  forumId: integer('forum_id').references(() => forums.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  authorId: integer('author_id').references(() => users.id, { onDelete: 'cascade' }),
  isPinned: boolean('is_pinned').default(false),
  isLocked: boolean('is_locked').default(false),
  viewCount: integer('view_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Forum Posts
export const forumPosts = pgTable('forum_posts', {
  id: serial('id').primaryKey(),
  topicId: integer('topic_id').references(() => forumTopics.id, { onDelete: 'cascade' }),
  authorId: integer('author_id').references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  isEdited: boolean('is_edited').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Notifications table
export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  type: notificationTypeEnum('type').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message'),
  data: json('data'),
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// Game Reviews
export const gameReviews = pgTable('game_reviews', {
  id: serial('id').primaryKey(),
  gameId: integer('game_id').references(() => games.id, { onDelete: 'cascade' }),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  rating: integer('rating').notNull(),
  review: text('review'),
  isHelpful: integer('is_helpful').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Challenges table
export const challenges = pgTable('challenges', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  gameId: integer('game_id').references(() => games.id, { onDelete: 'cascade' }),
  xpReward: integer('xp_reward').default(0),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  isActive: boolean('is_active').default(true),
  createdBy: integer('created_by').references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
});

// User Challenges
export const userChallenges = pgTable('user_challenges', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  challengeId: integer('challenge_id').references(() => challenges.id, { onDelete: 'cascade' }),
  isCompleted: boolean('is_completed').default(false),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  userGames: many(userGames),
  userAchievements: many(userAchievements),
  friendshipsAsRequester: many(friendships, { relationName: 'requester' }),
  friendshipsAsAddressee: many(friendships, { relationName: 'addressee' }),
  messages: many(messages),
  notifications: many(notifications),
  gameReviews: many(gameReviews),
  challenges: many(challenges),
  userChallenges: many(userChallenges),
}));

export const gamesRelations = relations(games, ({ many }) => ({
  userGames: many(userGames),
  achievements: many(achievements),
  chatRooms: many(chatRooms),
  forums: many(forums),
  gameReviews: many(gameReviews),
  challenges: many(challenges),
}));

export const achievementsRelations = relations(achievements, ({ one, many }) => ({
  game: one(games, {
    fields: [achievements.gameId],
    references: [games.id],
  }),
  userAchievements: many(userAchievements),
}));

export const friendshipsRelations = relations(friendships, ({ one }) => ({
  requester: one(users, {
    fields: [friendships.requesterId],
    references: [users.id],
    relationName: 'requester',
  }),
  addressee: one(users, {
    fields: [friendships.addresseeId],
    references: [users.id],
    relationName: 'addressee',
  }),
}));

export const chatRoomsRelations = relations(chatRooms, ({ one, many }) => ({
  game: one(games, {
    fields: [chatRooms.gameId],
    references: [games.id],
  }),
  createdByUser: one(users, {
    fields: [chatRooms.createdBy],
    references: [users.id],
  }),
  members: many(chatRoomMembers),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  room: one(chatRooms, {
    fields: [messages.roomId],
    references: [chatRooms.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
})); 