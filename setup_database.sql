-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  steam_id VARCHAR(50) UNIQUE,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255),
  avatar TEXT,
  bio TEXT,
  role user_role DEFAULT 'user',
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create games table
CREATE TABLE IF NOT EXISTS games (
  id SERIAL PRIMARY KEY,
  steam_app_id INTEGER UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  cover_image TEXT,
  genre VARCHAR(100),
  platform VARCHAR(50),
  release_date TIMESTAMP,
  rating INTEGER DEFAULT 0,
  total_ratings INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create user_games table
CREATE TABLE IF NOT EXISTS user_games (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
  playtime INTEGER DEFAULT 0,
  is_favorite BOOLEAN DEFAULT false,
  is_wishlisted BOOLEAN DEFAULT false,
  last_played TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon TEXT,
  type achievement_type DEFAULT 'custom',
  game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
  xp_reward INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  achievement_id INTEGER REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP DEFAULT NOW()
);

-- Create friendships table
CREATE TABLE IF NOT EXISTS friendships (
  id SERIAL PRIMARY KEY,
  requester_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  addressee_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  status friendship_status DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create chat_rooms table
CREATE TABLE IF NOT EXISTS chat_rooms (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  is_group BOOLEAN DEFAULT false,
  game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
  created_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create chat_room_members table
CREATE TABLE IF NOT EXISTS chat_room_members (
  id SERIAL PRIMARY KEY,
  room_id INTEGER REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  is_admin BOOLEAN DEFAULT false,
  joined_at TIMESTAMP DEFAULT NOW()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  room_id INTEGER REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text',
  is_edited BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create forums table
CREATE TABLE IF NOT EXISTS forums (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create forum_topics table
CREATE TABLE IF NOT EXISTS forum_topics (
  id SERIAL PRIMARY KEY,
  forum_id INTEGER REFERENCES forums(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  author_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create forum_posts table
CREATE TABLE IF NOT EXISTS forum_posts (
  id SERIAL PRIMARY KEY,
  topic_id INTEGER REFERENCES forum_topics(id) ON DELETE CASCADE,
  author_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_edited BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  data JSON,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create game_reviews table
CREATE TABLE IF NOT EXISTS game_reviews (
  id SERIAL PRIMARY KEY,
  game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL,
  review TEXT,
  is_helpful INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create challenges table
CREATE TABLE IF NOT EXISTS challenges (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
  xp_reward INTEGER DEFAULT 0,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create user_challenges table
CREATE TABLE IF NOT EXISTS user_challenges (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  challenge_id INTEGER REFERENCES challenges(id) ON DELETE CASCADE,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
); 