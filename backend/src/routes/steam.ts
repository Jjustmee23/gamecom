import express from 'express';
import axios from 'axios';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

const STEAM_API_KEY = process.env.STEAM_API_KEY || '9F55E7961556268BE9A327338F50B893';
const STEAM_API_BASE = 'https://store.steampowered.com/api';
const STEAM_USER_API = 'https://api.steampowered.com';

// Steam API rate limiting
let dailyRequestCount = 0;
const DAILY_LIMIT = 100000; // Steam's daily limit
const REQUESTS_PER_BATCH = 50; // Games per batch

// Reset daily count at midnight
setInterval(() => {
  dailyRequestCount = 0;
}, 24 * 60 * 60 * 1000);

// Rate limiting middleware
const checkRateLimit = (req: express.Request, res: express.Response, next: express.NextFunction): void => {
  if (dailyRequestCount >= DAILY_LIMIT) {
    res.status(429).json({ error: 'Daily Steam API limit reached' });
    return;
  }
  next();
};

// Get popular games from Steam
router.get('/games/popular', checkRateLimit, async (req, res) => {
  try {
    const response = await axios.get(`${STEAM_API_BASE}/featuredcategories/popular`);
    dailyRequestCount++;
    
    if (response.data && response.data.specials) {
      const games = response.data.specials.items.slice(0, REQUESTS_PER_BATCH);
      res.json({ games });
    } else {
      res.json({ games: [] });
    }
  } catch (error) {
    console.error('Error fetching popular games:', error);
    res.status(500).json({ error: 'Failed to fetch popular games' });
  }
});

// Get game details by Steam ID
router.get('/games/:steamId', checkRateLimit, async (req, res) => {
  try {
    const { steamId } = req.params;
    
    // Get basic game info
    const gameResponse = await axios.get(`${STEAM_API_BASE}/appdetails?appids=${steamId}`);
    dailyRequestCount++;
    
    if (!gameResponse.data[steamId] || !gameResponse.data[steamId].success) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    const gameData = gameResponse.data[steamId].data;
    
    // Get additional details
    const [screenshotsResponse, dlcResponse] = await Promise.all([
      axios.get(`${STEAM_API_BASE}/appdetails?appids=${steamId}&filters=screenshots`),
      axios.get(`${STEAM_API_BASE}/appdetails?appids=${steamId}&filters=dlc`)
    ]);
    dailyRequestCount += 2;
    
    const gameDetails = {
      steamId: parseInt(steamId),
      name: gameData.name,
      description: gameData.detailed_description,
      shortDescription: gameData.short_description,
      headerImage: gameData.header_image,
      screenshots: gameData.screenshots || [],
      background: gameData.background,
      movies: gameData.movies || [],
      categories: gameData.categories || [],
      genres: gameData.genres || [],
      releaseDate: gameData.release_date,
      platforms: gameData.platforms || {},
      metacritic: gameData.metacritic,
      price: gameData.price_overview,
      dlc: dlcResponse.data[steamId]?.data?.dlc || [],
      requirements: gameData.pc_requirements || {},
      supportedLanguages: gameData.supported_languages,
      website: gameData.website,
      developers: gameData.developers || [],
      publishers: gameData.publishers || [],
      isFree: gameData.is_free,
      type: gameData.type,
      recommendations: gameData.recommendations?.total || 0,
      achievements: gameData.achievements?.total || 0
    };
    
    res.json(gameDetails);
  } catch (error) {
    console.error('Error fetching game details:', error);
    res.status(500).json({ error: 'Failed to fetch game details' });
  }
});

// Search games on Steam
router.get('/games/search/:query', checkRateLimit, async (req, res) => {
  try {
    const { query } = req.params;
    const { page = 1 } = req.query;
    
    // Steam doesn't have a direct search API, so we'll use the featured games
    // and filter by name (this is a limitation of Steam's API)
    const response = await axios.get(`${STEAM_API_BASE}/featuredcategories/popular`);
    dailyRequestCount++;
    
    if (response.data && response.data.specials) {
      const allGames = response.data.specials.items;
      const filteredGames = allGames.filter((game: any) => 
        game.name.toLowerCase().includes(query.toLowerCase())
      );
      
      const startIndex = (parseInt(page as string) - 1) * 20;
      const games = filteredGames.slice(startIndex, startIndex + 20);
      
      res.json({ 
        games,
        total: filteredGames.length,
        page: parseInt(page as string),
        hasMore: startIndex + 20 < filteredGames.length
      });
    } else {
      res.json({ games: [], total: 0, page: 1, hasMore: false });
    }
  } catch (error) {
    console.error('Error searching games:', error);
    res.status(500).json({ error: 'Failed to search games' });
  }
});

// Get user's Steam profile
router.get('/user/profile/:steamId', checkRateLimit, async (req, res) => {
  try {
    const { steamId } = req.params;
    
    const response = await axios.get(`${STEAM_USER_API}/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_API_KEY}&steamids=${steamId}`);
    dailyRequestCount++;
    
    if (response.data.response.players.length === 0) {
      return res.status(404).json({ error: 'Steam profile not found' });
    }
    
    const player = response.data.response.players[0];
    
    // Get user's owned games
    const gamesResponse = await axios.get(`${STEAM_USER_API}/IPlayerService/GetOwnedGames/v1/?key=${STEAM_API_KEY}&steamid=${steamId}&include_appinfo=1&include_played_free_games=1`);
    dailyRequestCount++;
    
    const steamProfile = {
      steamId: player.steamid,
      username: player.personaname,
      realName: player.realname,
      avatar: player.avatar,
      avatarMedium: player.avatarmedium,
      avatarFull: player.avatarfull,
      profileUrl: player.profileurl,
      country: player.loccountrycode,
      state: player.locstatecode,
      city: player.loccityid,
      lastLogoff: player.lastlogoff,
      timeCreated: player.timecreated,
      gameExtraInfo: player.gameextrainfo,
      gameId: player.gameid,
      primaryClanId: player.primaryclanid,
      clanId: player.primaryclanid,
      personaState: player.personastate,
      personaStateFlags: player.personastateflags,
      commentPermission: player.commentpermission,
      visibilityState: player.profilestate,
      ownedGames: gamesResponse.data.response.games || [],
      gameCount: gamesResponse.data.response.game_count || 0
    };
    
    res.json(steamProfile);
  } catch (error) {
    console.error('Error fetching Steam profile:', error);
    res.status(500).json({ error: 'Failed to fetch Steam profile' });
  }
});

// Get user's Steam achievements for a game
router.get('/user/:steamId/achievements/:appId', checkRateLimit, async (req, res) => {
  try {
    const { steamId, appId } = req.params;
    
    const response = await axios.get(`${STEAM_USER_API}/ISteamUserStats/GetPlayerAchievements/v1/?key=${STEAM_API_KEY}&steamid=${steamId}&appid=${appId}&l=english`);
    dailyRequestCount++;
    
    if (!response.data.playerstats.success) {
      return res.status(404).json({ error: 'Achievements not found or game not owned' });
    }
    
    res.json(response.data.playerstats);
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
});

// Get user's Steam friends
router.get('/user/:steamId/friends', checkRateLimit, async (req, res) => {
  try {
    const { steamId } = req.params;
    
    const response = await axios.get(`${STEAM_USER_API}/ISteamUser/GetFriendList/v1/?key=${STEAM_API_KEY}&steamid=${steamId}&relationship=friend`);
    dailyRequestCount++;
    
    if (!response.data.friendslist) {
      return res.json({ friends: [] });
    }
    
    // Get details for all friends
    const friendIds = response.data.friendslist.friends.map((f: any) => f.steamid).join(',');
    const friendsResponse = await axios.get(`${STEAM_USER_API}/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_API_KEY}&steamids=${friendIds}`);
    dailyRequestCount++;
    
    res.json({ friends: friendsResponse.data.response.players });
  } catch (error) {
    console.error('Error fetching friends:', error);
    res.status(500).json({ error: 'Failed to fetch friends' });
  }
});

// Get Steam API usage stats
router.get('/stats', (req, res) => {
  res.json({
    dailyRequestCount,
    dailyLimit: DAILY_LIMIT,
    remainingRequests: DAILY_LIMIT - dailyRequestCount,
    requestsPerBatch: REQUESTS_PER_BATCH
  });
});

// Steam OAuth callback
router.get('/auth/callback', async (req, res) => {
  try {
    const { openid_assoc_handle, openid_sig, openid_signed, openid_ns, openid_mode } = req.query;
    
    if (openid_mode !== 'id_res') {
      return res.status(400).json({ error: 'Invalid OAuth response' });
    }
    
    // Verify Steam OpenID response
    const verifyResponse = await axios.post('https://steamcommunity.com/openid/login', {
      'openid.assoc_handle': openid_assoc_handle,
      'openid.sig': openid_sig,
      'openid.signed': openid_signed,
      'openid.ns': openid_ns,
      'openid.mode': 'check_authentication'
    });
    
    if (verifyResponse.data.includes('is_valid:true')) {
      // Extract Steam ID from the signed data
      const steamId = req.query['openid.claimed_id']?.toString().split('/').pop();
      
      if (steamId) {
        // Get Steam profile
        const profileResponse = await axios.get(`${STEAM_USER_API}/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_API_KEY}&steamids=${steamId}`);
        dailyRequestCount++;
        
        const player = profileResponse.data.response.players[0];
        
        // Here you would typically:
        // 1. Find or create user in your database
        // 2. Link Steam account to user
        // 3. Generate JWT token
        // 4. Redirect to frontend with token
        
        res.json({
          success: true,
          steamId,
          steamProfile: player
        });
      } else {
        res.status(400).json({ error: 'Could not extract Steam ID' });
      }
    } else {
      res.status(400).json({ error: 'Steam authentication failed' });
    }
  } catch (error) {
    console.error('Steam OAuth error:', error);
    res.status(500).json({ error: 'Steam authentication failed' });
  }
});

export default router; 