DO $$ BEGIN
 CREATE TYPE "achievement_type" AS ENUM('game', 'social', 'community', 'custom');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "friendship_status" AS ENUM('pending', 'accepted', 'blocked');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "notification_type" AS ENUM('friend_request', 'message', 'achievement', 'challenge', 'system');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "user_role" AS ENUM('user', 'moderator', 'admin');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "achievements" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"icon" text,
	"type" "achievement_type" DEFAULT 'custom',
	"game_id" integer,
	"xp_reward" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "challenges" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"game_id" integer,
	"xp_reward" integer DEFAULT 0,
	"start_date" timestamp,
	"end_date" timestamp,
	"is_active" boolean DEFAULT true,
	"created_by" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chat_room_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"room_id" integer,
	"user_id" integer,
	"is_admin" boolean DEFAULT false,
	"joined_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chat_rooms" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100),
	"is_group" boolean DEFAULT false,
	"game_id" integer,
	"created_by" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "forum_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"topic_id" integer,
	"author_id" integer,
	"content" text NOT NULL,
	"is_edited" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "forum_topics" (
	"id" serial PRIMARY KEY NOT NULL,
	"forum_id" integer,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"author_id" integer,
	"is_pinned" boolean DEFAULT false,
	"is_locked" boolean DEFAULT false,
	"view_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "forums" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"game_id" integer,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "friendships" (
	"id" serial PRIMARY KEY NOT NULL,
	"requester_id" integer,
	"addressee_id" integer,
	"status" "friendship_status" DEFAULT 'pending',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "game_reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"game_id" integer,
	"user_id" integer,
	"rating" integer NOT NULL,
	"review" text,
	"is_helpful" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "games" (
	"id" serial PRIMARY KEY NOT NULL,
	"steam_app_id" integer,
	"name" varchar(255) NOT NULL,
	"description" text,
	"cover_image" text,
	"genre" varchar(100),
	"platform" varchar(50),
	"release_date" timestamp,
	"rating" integer DEFAULT 0,
	"total_ratings" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "games_steam_app_id_unique" UNIQUE("steam_app_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"room_id" integer,
	"sender_id" integer,
	"content" text NOT NULL,
	"message_type" varchar(20) DEFAULT 'text',
	"is_edited" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"type" "notification_type" NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text,
	"data" json,
	"is_read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_achievements" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"achievement_id" integer,
	"unlocked_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_challenges" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"challenge_id" integer,
	"is_completed" boolean DEFAULT false,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_games" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"game_id" integer,
	"playtime" integer DEFAULT 0,
	"is_favorite" boolean DEFAULT false,
	"is_wishlisted" boolean DEFAULT false,
	"last_played" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"steam_id" varchar(50),
	"username" varchar(50) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255),
	"avatar" text,
	"bio" text,
	"role" "user_role" DEFAULT 'user',
	"level" integer DEFAULT 1,
	"xp" integer DEFAULT 0,
	"is_online" boolean DEFAULT false,
	"last_seen" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_steam_id_unique" UNIQUE("steam_id"),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "achievements" ADD CONSTRAINT "achievements_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "challenges" ADD CONSTRAINT "challenges_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "challenges" ADD CONSTRAINT "challenges_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat_room_members" ADD CONSTRAINT "chat_room_members_room_id_chat_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "chat_rooms"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat_room_members" ADD CONSTRAINT "chat_room_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat_rooms" ADD CONSTRAINT "chat_rooms_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chat_rooms" ADD CONSTRAINT "chat_rooms_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "forum_posts" ADD CONSTRAINT "forum_posts_topic_id_forum_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "forum_topics"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "forum_posts" ADD CONSTRAINT "forum_posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "forum_topics" ADD CONSTRAINT "forum_topics_forum_id_forums_id_fk" FOREIGN KEY ("forum_id") REFERENCES "forums"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "forum_topics" ADD CONSTRAINT "forum_topics_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "forums" ADD CONSTRAINT "forums_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "friendships" ADD CONSTRAINT "friendships_requester_id_users_id_fk" FOREIGN KEY ("requester_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "friendships" ADD CONSTRAINT "friendships_addressee_id_users_id_fk" FOREIGN KEY ("addressee_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "game_reviews" ADD CONSTRAINT "game_reviews_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "game_reviews" ADD CONSTRAINT "game_reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "messages" ADD CONSTRAINT "messages_room_id_chat_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "chat_rooms"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievement_id_achievements_id_fk" FOREIGN KEY ("achievement_id") REFERENCES "achievements"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_challenges" ADD CONSTRAINT "user_challenges_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_challenges" ADD CONSTRAINT "user_challenges_challenge_id_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "challenges"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_games" ADD CONSTRAINT "user_games_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_games" ADD CONSTRAINT "user_games_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
