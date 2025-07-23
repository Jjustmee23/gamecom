-- Add some test games
INSERT INTO games (name, description, genre, platform, rating, total_ratings) VALUES
('The Witcher 3: Wild Hunt', 'An action role-playing game with a vast open world', 'RPG', 'PC', 95, 1500),
('Cyberpunk 2077', 'An open-world action-adventure story', 'RPG', 'PC', 78, 1200),
('Red Dead Redemption 2', 'An epic tale of life in America at the dawn of the modern age', 'Action', 'PC', 92, 2000),
('Grand Theft Auto V', 'An action-adventure game set in the fictional state of San Andreas', 'Action', 'PC', 96, 3000),
('Elden Ring', 'An action role-playing game developed by FromSoftware', 'RPG', 'PC', 94, 1800),
('God of War', 'An action-adventure game based on ancient mythology', 'Action', 'PlayStation', 94, 1600),
('The Last of Us Part II', 'An action-adventure game set in a post-apocalyptic world', 'Action', 'PlayStation', 93, 1400),
('Minecraft', 'A sandbox video game focused on building and exploration', 'Sandbox', 'PC', 88, 5000),
('Fortnite', 'A battle royale game with building mechanics', 'Battle Royale', 'PC', 85, 8000),
('League of Legends', 'A multiplayer online battle arena game', 'MOBA', 'PC', 82, 12000),
('Counter-Strike 2', 'A tactical first-person shooter game', 'FPS', 'PC', 87, 6000),
('Valorant', 'A tactical first-person hero shooter game', 'FPS', 'PC', 83, 4000);

-- Add some test users (passwords are hashed versions of 'password123')
INSERT INTO users (username, email, password, role, level, xp) VALUES
('admin', 'admin@gamecom.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2O', 'admin', 50, 10000),
('moderator', 'mod@gamecom.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2O', 'moderator', 25, 5000),
('gamer1', 'gamer1@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2O', 'user', 15, 3000),
('gamer2', 'gamer2@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2O', 'user', 8, 1500),
('gamer3', 'gamer3@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2O', 'user', 12, 2500);

-- Add some user games (library entries)
INSERT INTO user_games (user_id, game_id, playtime, is_favorite, is_wishlisted, last_played) VALUES
(3, 1, 120, true, false, NOW() - INTERVAL '2 days'),
(3, 2, 80, false, true, NOW() - INTERVAL '5 days'),
(3, 3, 200, true, false, NOW() - INTERVAL '1 day'),
(4, 1, 150, true, false, NOW() - INTERVAL '3 days'),
(4, 4, 300, false, false, NOW() - INTERVAL '1 week'),
(5, 5, 180, true, false, NOW() - INTERVAL '4 days'),
(5, 6, 90, false, true, NOW() - INTERVAL '2 weeks');

-- Add some achievements
INSERT INTO achievements (name, description, type, xp_reward) VALUES
('First Steps', 'Complete your first game', 'game', 100),
('Social Butterfly', 'Add 10 friends', 'social', 200),
('Game Collector', 'Add 50 games to your library', 'game', 500),
('Review Master', 'Write 10 game reviews', 'community', 300),
('Level Up', 'Reach level 10', 'custom', 150);

-- Add some user achievements
INSERT INTO user_achievements (user_id, achievement_id, unlocked_at) VALUES
(3, 1, NOW() - INTERVAL '30 days'),
(3, 2, NOW() - INTERVAL '20 days'),
(4, 1, NOW() - INTERVAL '25 days'),
(5, 1, NOW() - INTERVAL '15 days'),
(5, 4, NOW() - INTERVAL '10 days');

-- Add some friendships
INSERT INTO friendships (requester_id, addressee_id, status, created_at) VALUES
(3, 4, 'accepted', NOW() - INTERVAL '15 days'),
(3, 5, 'accepted', NOW() - INTERVAL '10 days'),
(4, 5, 'pending', NOW() - INTERVAL '5 days');

-- Add some game reviews
INSERT INTO game_reviews (game_id, user_id, rating, review, created_at) VALUES
(1, 3, 5, 'Amazing game! The story and world are incredible.', NOW() - INTERVAL '20 days'),
(1, 4, 4, 'Great RPG with fantastic graphics.', NOW() - INTERVAL '18 days'),
(2, 3, 3, 'Good game but has some bugs.', NOW() - INTERVAL '15 days'),
(3, 5, 5, 'One of the best games I have ever played!', NOW() - INTERVAL '12 days'),
(4, 4, 5, 'Classic game that never gets old.', NOW() - INTERVAL '25 days'); 