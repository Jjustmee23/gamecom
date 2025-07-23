import { Client } from 'pg';
import axios from 'axios';

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

const STEAM_API_KEY = process.env.STEAM_API_KEY;
const STEAM_API_BASE = 'https://store.steampowered.com/api';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export class GameCacheService {
  private static instance: GameCacheService;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): GameCacheService {
    if (!GameCacheService.instance) {
      GameCacheService.instance = new GameCacheService();
    }
    return GameCacheService.instance;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      await client.connect();
      this.isInitialized = true;
      console.log('GameCacheService initialized');
    } catch (error) {
      console.error('Failed to initialize GameCacheService:', error);
      throw error;
    }
  }

  async fetchAndCacheGame(steamId: number): Promise<any> {
    try {
      // Check cache first
      const cachedGame = await this.getCachedGame(steamId);
      if (cachedGame && this.isCacheValid(cachedGame.last_updated)) {
        console.log(`Using cached data for Steam game ${steamId}`);
        return cachedGame;
      }

      // Fetch from Steam API
      console.log(`Fetching fresh data for Steam game ${steamId}`);
      const steamData = await this.fetchFromSteamAPI(steamId);
      
      // Cache the data
      const cachedData = await this.cacheGameData(steamId, steamData);
      
      // Update cache status
      await this.updateCacheStatus(steamId, true);
      
      return cachedData;
    } catch (error) {
      console.error(`Error fetching/caching game ${steamId}:`, error);
      await this.updateCacheStatus(steamId, false, error.message);
      throw error;
    }
  }

  private async getCachedGame(steamId: number): Promise<any> {
    const result = await client.query(
      'SELECT * FROM games WHERE steam_id = $1',
      [steamId]
    );
    return result.rows[0] || null;
  }

  private isCacheValid(lastUpdated: string): boolean {
    const lastUpdateTime = new Date(lastUpdated).getTime();
    return (Date.now() - lastUpdateTime) < CACHE_DURATION;
  }

  private async fetchFromSteamAPI(steamId: number): Promise<any> {
    const response = await axios.get(`${STEAM_API_BASE}/appdetails?appids=${steamId}&cc=us&l=english`);
    
    if (!response.data[steamId] || !response.data[steamId].success) {
      throw new Error(`Steam API error for game ${steamId}`);
    }

    return response.data[steamId].data;
  }

  private async cacheGameData(steamId: number, steamData: any): Promise<any> {
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
  }

  private async updateCacheStatus(steamId: number, success: boolean, error?: string) {
    const query = `
      INSERT INTO game_cache_status (steam_id, last_fetched, fetch_count, error_count, last_error)
      VALUES ($1, $2, 1, $3, $4)
      ON CONFLICT (steam_id) DO UPDATE SET
        last_fetched = EXCLUDED.last_fetched,
        fetch_count = game_cache_status.fetch_count + 1,
        error_count = game_cache_status.error_count + $3,
        last_error = EXCLUDED.last_error
    `;

    await client.query(query, [
      steamId,
      new Date(),
      success ? 0 : 1,
      error || null
    ]);
  }

  async batchFetchGames(steamIds: number[]): Promise<any[]> {
    const games = [];
    
    for (const steamId of steamIds) {
      try {
        const game = await this.fetchAndCacheGame(steamId);
        games.push(game);
        
        // Rate limiting - wait 1 second between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to fetch game ${steamId}:`, error);
        continue;
      }
    }

    return games;
  }

  async refreshExpiredCache(): Promise<void> {
    console.log('Refreshing expired cache...');
    
    const expiredGames = await client.query(`
      SELECT steam_id FROM games 
      WHERE last_updated < $1 AND steam_id IS NOT NULL
    `, [new Date(Date.now() - CACHE_DURATION)]);

    const steamIds = expiredGames.rows.map(row => row.steam_id);
    
    if (steamIds.length > 0) {
      console.log(`Found ${steamIds.length} expired games, refreshing...`);
      await this.batchFetchGames(steamIds);
    }
  }

  async getCacheStats(): Promise<any> {
    const stats = await client.query(`
      SELECT 
        COUNT(*) as total_games,
        COUNT(CASE WHEN last_updated > $1 THEN 1 END) as fresh_games,
        COUNT(CASE WHEN last_updated <= $1 THEN 1 END) as expired_games,
        AVG(EXTRACT(EPOCH FROM (NOW() - last_updated))/3600) as avg_age_hours
      FROM games
    `, [new Date(Date.now() - CACHE_DURATION)]);

    const cacheStatus = await client.query(`
      SELECT 
        COUNT(*) as total_entries,
        SUM(fetch_count) as total_fetches,
        SUM(error_count) as total_errors,
        AVG(fetch_count) as avg_fetches_per_game
      FROM game_cache_status
    `);

    return {
      games: stats.rows[0],
      cache: cacheStatus.rows[0]
    };
  }

  async cleanup(): Promise<void> {
    if (this.isInitialized) {
      await client.end();
      this.isInitialized = false;
    }
  }
}

export default GameCacheService; 