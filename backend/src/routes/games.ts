import { Router } from 'express';
import { Client } from 'pg';
import axios from 'axios';

const router = Router();

// Database connection
const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

// Connect to database
client.connect().catch(console.error);

// Steam API configuration
const STEAM_API_KEY = process.env.STEAM_API_KEY;
const STEAM_API_BASE = 'https://store.steampowered.com/api';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

interface SteamGameData {
  steam_appid: number;
  name: string;
  detailed_description: string;
  short_description: string;
  header_image: string;
  background: string;
  screenshots: Array<{ id: number; path_thumbnail: string; path_full: string }>;
  movies: Array<{ id: number; thumbnail: string; webm: { '480': string; max: string } }>;
  categories: Array<{ id: number; description: string }>;
  genres: Array<{ id: string; description: string }>;
  release_date: { coming_soon: boolean; date: string };
  platforms: { windows: boolean; mac: boolean; linux: boolean };
  metacritic: { score: number; url: string };
  price_overview: {
    currency: string;
    initial: number;
    final: number;
    discount_percent: number;
    initial_formatted: string;
    final_formatted: string;
  };
  dlc: number[];
  requirements: { minimum: string; recommended: string };
  supported_languages: string;
  website: string;
  developers: string[];
  publishers: string[];
  is_free: boolean;
  type: string;
  recommendations: { total: number };
  achievements: number;
}

// Fetch and cache game data from Steam
async function fetchAndCacheGame(steamId: number): Promise<any> {
  try {
    // Check if game exists in cache and is not expired
    const cachedGame = await client.query(
      'SELECT * FROM games WHERE steam_id = $1 AND last_updated > $2',
      [steamId, new Date(Date.now() - CACHE_DURATION)]
    );

    if (cachedGame.rows.length > 0) {
      console.log(`Using cached data for Steam game ${steamId}`);
      return cachedGame.rows[0];
    }

    // Fetch from Steam API
    console.log(`Fetching fresh data for Steam game ${steamId}`);
    const response = await axios.get(`${STEAM_API_BASE}/appdetails?appids=${steamId}&cc=us&l=english`);
    
    if (!response.data[steamId] || !response.data[steamId].success) {
      throw new Error(`Steam API error for game ${steamId}`);
    }

    const steamData: SteamGameData = response.data[steamId].data;
    
    // Prepare game data for database
    const gameData = {
      steam_id: steamId,
      name: steamData.name,
      description: steamData.detailed_description,
      short_description: steamData.short_description,
      header_image: steamData.header_image,
      background_image: steamData.background,
      screenshots: JSON.stringify(steamData.screenshots || []),
      movies: JSON.stringify(steamData.movies || []),
      categories: JSON.stringify(steamData.categories || []),
      genres: JSON.stringify(steamData.genres || []),
      release_date: steamData.release_date?.date || null,
      coming_soon: steamData.release_date?.coming_soon || false,
      platforms: JSON.stringify(steamData.platforms || {}),
      metacritic_score: steamData.metacritic?.score || null,
      metacritic_url: steamData.metacritic?.url || null,
      price_currency: steamData.price_overview?.currency || null,
      price_initial: steamData.price_overview?.initial || null,
      price_final: steamData.price_overview?.final || null,
      price_discount: steamData.price_overview?.discount_percent || null,
      price_initial_formatted: steamData.price_overview?.initial_formatted || null,
      price_final_formatted: steamData.price_overview?.final_formatted || null,
      dlc: JSON.stringify(steamData.dlc || []),
      requirements_minimum: steamData.requirements?.minimum || null,
      requirements_recommended: steamData.requirements?.recommended || null,
      supported_languages: steamData.supported_languages || null,
      website: steamData.website || null,
      developers: JSON.stringify(steamData.developers || []),
      publishers: JSON.stringify(steamData.publishers || []),
      is_free: steamData.is_free || false,
      type: steamData.type || null,
      recommendations_total: steamData.recommendations?.total || 0,
      achievements_count: steamData.achievements || 0,
      last_updated: new Date(),
      steam_store_url: `https://store.steampowered.com/app/${steamId}`
    };

    // Insert or update in database
    const upsertQuery = `
      INSERT INTO games (
        steam_id, name, description, short_description, header_image, background_image,
        screenshots, movies, categories, genres, release_date, coming_soon, platforms,
        metacritic_score, metacritic_url, price_currency, price_initial, price_final,
        price_discount, price_initial_formatted, price_final_formatted, dlc,
        requirements_minimum, requirements_recommended, supported_languages, website,
        developers, publishers, is_free, type, recommendations_total, achievements_count,
        last_updated, steam_store_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34)
      ON CONFLICT (steam_id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        short_description = EXCLUDED.short_description,
        header_image = EXCLUDED.header_image,
        background_image = EXCLUDED.background_image,
        screenshots = EXCLUDED.screenshots,
        movies = EXCLUDED.movies,
        categories = EXCLUDED.categories,
        genres = EXCLUDED.genres,
        release_date = EXCLUDED.release_date,
        coming_soon = EXCLUDED.coming_soon,
        platforms = EXCLUDED.platforms,
        metacritic_score = EXCLUDED.metacritic_score,
        metacritic_url = EXCLUDED.metacritic_url,
        price_currency = EXCLUDED.price_currency,
        price_initial = EXCLUDED.price_initial,
        price_final = EXCLUDED.price_final,
        price_discount = EXCLUDED.price_discount,
        price_initial_formatted = EXCLUDED.price_initial_formatted,
        price_final_formatted = EXCLUDED.price_final_formatted,
        dlc = EXCLUDED.dlc,
        requirements_minimum = EXCLUDED.requirements_minimum,
        requirements_recommended = EXCLUDED.requirements_recommended,
        supported_languages = EXCLUDED.supported_languages,
        website = EXCLUDED.website,
        developers = EXCLUDED.developers,
        publishers = EXCLUDED.publishers,
        is_free = EXCLUDED.is_free,
        type = EXCLUDED.type,
        recommendations_total = EXCLUDED.recommendations_total,
        achievements_count = EXCLUDED.achievements_count,
        last_updated = EXCLUDED.last_updated,
        steam_store_url = EXCLUDED.steam_store_url
      RETURNING *
    `;

    const result = await client.query(upsertQuery, Object.values(gameData));
    console.log(`Successfully cached game ${steamId}: ${steamData.name}`);
    
    return result.rows[0];
  } catch (error) {
    console.error(`Error fetching/caching game ${steamId}:`, error);
    throw error;
  }
}

// Batch fetch popular games
async function fetchPopularGames(): Promise<any[]> {
  try {
    // Get popular game IDs (you can expand this list)
    const popularGameIds = [
      1091500, // Cyberpunk 2077
      1245620, // Elden Ring
      1270790, // Valorant
      1593500, // God of War
      1174180, // Red Dead Redemption 2
      570,     // Dota 2
      730,     // Counter-Strike 2
      252490,  // Rust
      578080,  // PUBG
      271590,  // Grand Theft Auto V
      440,     // Team Fortress 2
      8930,    // Sid Meier's Civilization V
      105600,  // Terraria
      220,     // Half-Life 2
      4000,    // Garry's Mod
    ];

    const games = [];
    for (const steamId of popularGameIds) {
      try {
        const game = await fetchAndCacheGame(steamId);
        games.push(game);
        // Add delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to fetch game ${steamId}:`, error);
        continue;
      }
    }

    return games;
  } catch (error) {
    console.error('Error fetching popular games:', error);
    throw error;
  }
}

// Get all games with pagination and management options
router.get('/', async (req: any, res: any) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      search, 
      genre, 
      platform, 
      refresh = false,
      includeDeleted = false,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;
    
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    // Refresh cache if requested
    if (refresh === 'true') {
      console.log('Refreshing game cache...');
      await fetchPopularGames();
    }

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    // Handle deleted games
    if (includeDeleted !== 'true') {
      whereClause += ` AND deleted_at IS NULL`;
    }

    if (search) {
      whereClause += ` AND name ILIKE $${paramIndex}`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (genre) {
      whereClause += ` AND genres::text ILIKE $${paramIndex}`;
      params.push(`%${genre}%`);
      paramIndex++;
    }

    if (platform) {
      whereClause += ` AND platforms::text ILIKE $${paramIndex}`;
      params.push(`%${platform}%`);
      paramIndex++;
    }

    // Validate sort parameters
    const allowedSortFields = ['name', 'release_date', 'metacritic_score', 'achievements_count', 'recommendations_total', 'created_at', 'last_updated'];
    const allowedSortOrders = ['asc', 'desc'];
    
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'name';
    const sortDirection = allowedSortOrders.includes(sortOrder.toLowerCase()) ? sortOrder.toUpperCase() : 'ASC';

    // Get total count
    const countResult = await client.query(
      `SELECT COUNT(*) FROM games ${whereClause}`,
      params
    );
    const totalCount = parseInt(countResult.rows[0].count);

    // Get games with full metadata and soft delete info
    const gamesResult = await client.query(
      `SELECT 
        id, steam_id, name, description, short_description, header_image, background_image,
        screenshots, movies, categories, genres, release_date, coming_soon, platforms,
        metacritic_score, metacritic_url, price_currency, price_initial, price_final,
        price_discount, price_initial_formatted, price_final_formatted, dlc,
        requirements_minimum, requirements_recommended, supported_languages, website,
        developers, publishers, is_free, type, recommendations_total, achievements_count,
        last_updated, steam_store_url, created_at, deleted_at,
        CASE WHEN deleted_at IS NOT NULL THEN true ELSE false END as is_deleted
       FROM games ${whereClause} 
       ORDER BY ${sortField} ${sortDirection}
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, parseInt(limit as string), offset]
    );

    const totalPages = Math.ceil(totalCount / parseInt(limit as string));

    return res.json({
      games: gamesResult.rows,
      pagination: {
        currentPage: parseInt(page as string),
        totalPages,
        totalCount,
        limit: parseInt(limit as string)
      },
      filters: {
        search,
        genre,
        platform,
        includeDeleted: includeDeleted === 'true',
        sortBy: sortField,
        sortOrder: sortDirection
      }
    });
  } catch (error) {
    console.error('Error fetching games:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Soft delete a game
router.delete('/:id', async (req: any, res: any) => {
  try {
    const gameId = parseInt(req.params.id);
    const { permanent = false } = req.query;

    if (permanent === 'true') {
      // Permanent delete
      const result = await client.query(
        'DELETE FROM games WHERE id = $1 RETURNING *',
        [gameId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Game not found' });
      }

      return res.json({ 
        message: 'Game permanently deleted',
        game: result.rows[0]
      });
    } else {
      // Soft delete
      const result = await client.query(
        'UPDATE games SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
        [gameId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Game not found' });
      }

      return res.json({ 
        message: 'Game soft deleted',
        game: result.rows[0]
      });
    }
  } catch (error) {
    console.error('Error deleting game:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Restore a soft deleted game
router.patch('/:id/restore', async (req: any, res: any) => {
  try {
    const gameId = parseInt(req.params.id);

    const result = await client.query(
      'UPDATE games SET deleted_at = NULL WHERE id = $1 AND deleted_at IS NOT NULL RETURNING *',
      [gameId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Game not found or not deleted' });
    }

    return res.json({ 
      message: 'Game restored successfully',
      game: result.rows[0]
    });
  } catch (error) {
    console.error('Error restoring game:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Bulk operations
router.post('/bulk', async (req: any, res: any) => {
  try {
    const { action, gameIds } = req.body;

    if (!action || !gameIds || !Array.isArray(gameIds)) {
      return res.status(400).json({ message: 'Invalid request body' });
    }

    let query = '';
    let message = '';

    switch (action) {
      case 'delete':
        query = 'UPDATE games SET deleted_at = CURRENT_TIMESTAMP WHERE id = ANY($1)';
        message = 'Games soft deleted successfully';
        break;
      case 'restore':
        query = 'UPDATE games SET deleted_at = NULL WHERE id = ANY($1) AND deleted_at IS NOT NULL';
        message = 'Games restored successfully';
        break;
      case 'permanent_delete':
        query = 'DELETE FROM games WHERE id = ANY($1)';
        message = 'Games permanently deleted';
        break;
      case 'refresh':
        // Refresh cache for specific games
        const games = await client.query(
          'SELECT steam_id FROM games WHERE id = ANY($1) AND steam_id IS NOT NULL',
          [gameIds]
        );
        
        const steamIds = games.rows.map(row => row.steam_id);
        await fetchPopularGames(); // Use fetchPopularGames for batch refresh
        
        return res.json({ 
          message: 'Games refreshed successfully',
          refreshedCount: steamIds.length
        });
      default:
        return res.status(400).json({ message: 'Invalid action' });
    }

    const result = await client.query(query, [gameIds]);
    
    return res.json({ 
      message,
      affectedCount: result.rowCount
    });
  } catch (error) {
    console.error('Error performing bulk operation:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get games management statistics
router.get('/stats/management', async (req: any, res: any) => {
  try {
    const stats = await client.query(`
      SELECT 
        COUNT(*) as total_games,
        COUNT(CASE WHEN deleted_at IS NULL THEN 1 END) as active_games,
        COUNT(CASE WHEN deleted_at IS NOT NULL THEN 1 END) as deleted_games,
        COUNT(CASE WHEN steam_id IS NOT NULL THEN 1 END) as steam_games,
        COUNT(CASE WHEN steam_id IS NULL THEN 1 END) as manual_games,
        COUNT(CASE WHEN last_updated > NOW() - INTERVAL '24 hours' THEN 1 END) as recently_updated,
        COUNT(CASE WHEN last_updated <= NOW() - INTERVAL '24 hours' THEN 1 END) as needs_update,
        AVG(EXTRACT(EPOCH FROM (NOW() - last_updated))/3600) as avg_age_hours
      FROM games
    `);

    const genreStats = await client.query(`
      SELECT 
        jsonb_array_elements_text(genres) as genre,
        COUNT(*) as count
      FROM games 
      WHERE deleted_at IS NULL AND genres IS NOT NULL
      GROUP BY genre
      ORDER BY count DESC
      LIMIT 10
    `);

    const platformStats = await client.query(`
      SELECT 
        jsonb_object_keys(platforms) as platform,
        COUNT(*) as count
      FROM games 
      WHERE deleted_at IS NULL AND platforms IS NOT NULL
      GROUP BY platform
      ORDER BY count DESC
    `);

    return res.json({
      overview: stats.rows[0],
      topGenres: genreStats.rows,
      platforms: platformStats.rows
    });
  } catch (error) {
    console.error('Error fetching management stats:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get cache status and management info
router.get('/cache/status', async (req: any, res: any) => {
  try {
    const cacheStats = await client.query(`
      SELECT 
        COUNT(*) as total_entries,
        SUM(fetch_count) as total_fetches,
        SUM(error_count) as total_errors,
        AVG(fetch_count) as avg_fetches_per_game,
        MAX(last_fetched) as last_fetch_time,
        COUNT(CASE WHEN error_count > 0 THEN 1 END) as games_with_errors
      FROM game_cache_status
    `);

    const recentErrors = await client.query(`
      SELECT steam_id, last_error, last_fetched, error_count
      FROM game_cache_status 
      WHERE error_count > 0 
      ORDER BY last_fetched DESC 
      LIMIT 10
    `);

    const expiredGames = await client.query(`
      SELECT steam_id, name, last_updated
      FROM games 
      WHERE last_updated < NOW() - INTERVAL '24 hours' 
      AND steam_id IS NOT NULL 
      AND deleted_at IS NULL
      ORDER BY last_updated ASC
      LIMIT 20
    `);

    return res.json({
      cache: cacheStats.rows[0],
      recentErrors: recentErrors.rows,
      expiredGames: expiredGames.rows
    });
  } catch (error) {
    console.error('Error fetching cache status:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Force refresh all expired games
router.post('/cache/refresh-expired', async (req: any, res: any) => {
  try {
    const expiredGames = await client.query(`
      SELECT steam_id FROM games 
      WHERE last_updated < NOW() - INTERVAL '24 hours' 
      AND steam_id IS NOT NULL 
      AND deleted_at IS NULL
    `);

    const steamIds = expiredGames.rows.map(row => row.steam_id);
    
    if (steamIds.length === 0) {
      return res.json({ 
        message: 'No expired games found',
        refreshedCount: 0
      });
    }

    await fetchPopularGames(); // Use fetchPopularGames for batch refresh

    return res.json({ 
      message: 'Expired games refreshed successfully',
      refreshedCount: steamIds.length
    });
  } catch (error) {
    console.error('Error refreshing expired games:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get game by ID
router.get('/:id', async (req: any, res: any) => {
  try {
    const gameId = parseInt(req.params.id);

    const gameResult = await client.query(
      'SELECT * FROM games WHERE id = $1',
      [gameId]
    );

    if (gameResult.rows.length === 0) {
      return res.status(404).json({ message: 'Game not found' });
    }

    const game = gameResult.rows[0];

    // Get reviews for this game
    const reviewsResult = await client.query(
      `SELECT gr.*, u.username, u.avatar 
       FROM game_reviews gr 
       JOIN users u ON gr.user_id = u.id 
       WHERE gr.game_id = $1 
       ORDER BY gr.created_at DESC`,
      [gameId]
    );

    return res.json({
      game,
      reviews: reviewsResult.rows
    });
  } catch (error) {
    console.error('Error fetching game:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Add game to user library
router.post('/:id/library', async (req: any, res: any) => {
  try {
    const userId = req.user?.id;
    const gameId = parseInt(req.params.id);
    const { isFavorite = false, isWishlisted = false } = req.body;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Check if game exists
    const gameResult = await client.query(
      'SELECT id FROM games WHERE id = $1',
      [gameId]
    );

    if (gameResult.rows.length === 0) {
      return res.status(404).json({ message: 'Game not found' });
    }

    // Check if already in library
    const existingResult = await client.query(
      'SELECT id FROM user_games WHERE user_id = $1 AND game_id = $2',
      [userId, gameId]
    );

    if (existingResult.rows.length > 0) {
      return res.status(400).json({ message: 'Game already in library' });
    }

    // Add to library
    await client.query(
      `INSERT INTO user_games (user_id, game_id, is_favorite, is_wishlisted, last_played) 
       VALUES ($1, $2, $3, $4, NOW())`,
      [userId, gameId, isFavorite, isWishlisted]
    );

    return res.json({ message: 'Game added to library successfully' });
  } catch (error) {
    console.error('Error adding game to library:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Update game in user library
router.put('/:id/library', async (req: any, res: any) => {
  try {
    const userId = req.user?.id;
    const gameId = parseInt(req.params.id);
    const { isFavorite, isWishlisted, playtime } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const updateResult = await client.query(
      `UPDATE user_games 
       SET is_favorite = COALESCE($1, is_favorite),
           is_wishlisted = COALESCE($2, is_wishlisted),
           playtime = COALESCE($3, playtime),
           last_played = NOW()
       WHERE user_id = $4 AND game_id = $5`,
      [isFavorite, isWishlisted, playtime, userId, gameId]
    );

    if (updateResult.rowCount === 0) {
      return res.status(404).json({ message: 'Game not found in library' });
    }

    return res.json({ message: 'Game library updated successfully' });
  } catch (error) {
    console.error('Error updating game in library:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Remove game from user library
router.delete('/:id/library', async (req: any, res: any) => {
  try {
    const userId = req.user?.id;
    const gameId = parseInt(req.params.id);

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const deleteResult = await client.query(
      'DELETE FROM user_games WHERE user_id = $1 AND game_id = $2',
      [userId, gameId]
    );

    if (deleteResult.rowCount === 0) {
      return res.status(404).json({ message: 'Game not found in library' });
    }

    return res.json({ message: 'Game removed from library successfully' });
  } catch (error) {
    console.error('Error removing game from library:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user's game library
router.get('/library/user', async (req: any, res: any) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const libraryResult = await client.query(
      `SELECT ug.*, g.name, g.cover_image, g.genre, g.platform, g.rating 
       FROM user_games ug 
       JOIN games g ON ug.game_id = g.id 
       WHERE ug.user_id = $1 
       ORDER BY ug.last_played DESC`,
      [userId]
    );

    return res.json({
      library: libraryResult.rows
    });
  } catch (error) {
    console.error('Error fetching user library:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Add game review
router.post('/:id/reviews', async (req: any, res: any) => {
  try {
    const userId = req.user?.id;
    const gameId = parseInt(req.params.id);
    const { rating, review } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Check if user already reviewed this game
    const existingReview = await client.query(
      'SELECT id FROM game_reviews WHERE user_id = $1 AND game_id = $2',
      [userId, gameId]
    );

    if (existingReview.rows.length > 0) {
      return res.status(400).json({ message: 'You have already reviewed this game' });
    }

    // Add review
    await client.query(
      'INSERT INTO game_reviews (game_id, user_id, rating, review) VALUES ($1, $2, $3, $4)',
      [gameId, userId, rating, review]
    );

    // Update game rating
    await client.query(
      `UPDATE games 
       SET rating = (SELECT AVG(rating) FROM game_reviews WHERE game_id = $1),
           total_ratings = (SELECT COUNT(*) FROM game_reviews WHERE game_id = $1)
       WHERE id = $1`,
      [gameId]
    );

    return res.json({ message: 'Review added successfully' });
  } catch (error) {
    console.error('Error adding review:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router; 