import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Heart, 
  Bookmark,
  Star,
  Clock,
  Gamepad2,
  Monitor,
  Zap,
  Laptop,
  Apple,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Eye,
  EyeOff,
  MoreVertical,
  Download,
  Play,
  Users,
  Calendar,
  DollarSign,
  Award,
  Tag,
  Globe,
  Video,
  Image,
  ExternalLink,
  ArrowLeft,
  Home,
  ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';

interface SteamGame {
  steamId: number;
  name: string;
  description: string;
  shortDescription: string;
  headerImage: string;
  screenshots: Array<{ id: number; path_thumbnail: string; path_full: string }>;
  background: string;
  movies: Array<{ id: number; thumbnail: string; webm: { '480': string; max: string } }>;
  categories: Array<{ id: number; description: string }>;
  genres: Array<{ id: string; description: string }>;
  releaseDate: { comingSoon: boolean; date: string };
  platforms: { windows: boolean; mac: boolean; linux: boolean };
  metacritic: { score: number; url: string };
  price: { currency: string; initial: number; final: number; discountPercent: number; initialFormatted: string; finalFormatted: string };
  dlc: number[];
  requirements: { minimum: string; recommended: string };
  supportedLanguages: string;
  website: string;
  developers: string[];
  publishers: string[];
  isFree: boolean;
  type: string;
  recommendations: number;
  achievements: number;
}

interface Game {
  id: number;
  name: string;
  coverImage?: string;
  genre?: string;
  platform?: string;
  rating: number;
  steamId?: number;
  price?: string;
  isFree?: boolean;
  releaseDate?: string;
  developers?: string[];
  publishers?: string[];
  description?: string;
  screenshots?: string[];
  metacritic?: number;
  achievements?: number;
  recommendations?: number;
  userAchievements?: {
    unlocked: number;
    total: number;
    unlockedAchievements?: Array<{
      id: string;
      name: string;
      description: string;
      icon: string;
      unlockedAt: string;
    }>;
  };
}

const Games: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [steamGames, setSteamGames] = useState<SteamGame[]>([]);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedPrice, setSelectedPrice] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<string>('name');
  const [loading, setLoading] = useState(true);
  const [loadingSteam, setLoadingSteam] = useState(false);
  const [showSteamGames, setShowSteamGames] = useState(false);
  const [selectedGame, setSelectedGame] = useState<SteamGame | null>(null);
  const [showGameModal, setShowGameModal] = useState(false);
  const [hoveredGame, setHoveredGame] = useState<Game | null>(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();
  const [showGenreDropdown, setShowGenreDropdown] = useState(false);
  const [showPlatformDropdown, setShowPlatformDropdown] = useState(false);

  const genres = [
    'Action', 'Adventure', 'RPG', 'Strategy', 'Simulation', 'Sports', 'Racing', 'Puzzle', 'Indie', 'Casual'
  ];

  const platforms = [
    { id: 'pc', name: 'PC', icon: Monitor },
    { id: 'mac', name: 'macOS', icon: Apple },
    { id: 'linux', name: 'Linux', icon: Laptop },
    { id: 'steam', name: 'Steam', icon: Gamepad2 }
  ];

  const priceRanges = [
    { id: 'free', name: 'Free', icon: DollarSign },
    { id: 'under10', name: 'Under $10', icon: DollarSign },
    { id: 'under25', name: 'Under $25', icon: DollarSign },
    { id: 'under50', name: 'Under $50', icon: DollarSign },
    { id: 'over50', name: '$50+', icon: DollarSign }
  ];

  useEffect(() => {
    fetchGames();
  }, []);

  useEffect(() => {
    filterGames();
  }, [games, searchTerm, selectedGenre, selectedPlatform, selectedPrice, sortBy]);

  const fetchGames = async () => {
    try {
      setLoading(true);
      
      // Mock games data since Steam API is temporarily disabled
      const mockGames: Game[] = [
        {
          id: 1,
          name: 'Cyberpunk 2077',
          coverImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/header.jpg',
          genre: 'RPG',
          platform: 'PC',
          rating: 4.5,
          steamId: 1091500,
          price: '€59.99',
          isFree: false,
          releaseDate: '2020-12-10',
          developers: ['CD Projekt Red'],
          publishers: ['CD Projekt'],
          description: 'An open-world, action-adventure story set in Night City, a megalopolis obsessed with power, glamour and body modification.',
          metacritic: 86,
          achievements: 45,
          recommendations: 125000,
          userAchievements: {
            unlocked: 12,
            total: 45,
            unlockedAchievements: [
              {
                id: '1',
                name: 'The Wandering Fool',
                description: 'Complete the prologue',
                icon: '🏆',
                unlockedAt: '2024-01-15'
              },
              {
                id: '2',
                name: 'Street Cred',
                description: 'Reach Street Cred level 50',
                icon: '⭐',
                unlockedAt: '2024-01-20'
              }
            ]
          }
        },
        {
          id: 2,
          name: 'Elden Ring',
          coverImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/header.jpg',
          genre: 'Action RPG',
          platform: 'PC',
          rating: 4.8,
          steamId: 1245620,
          price: '€59.99',
          isFree: false,
          releaseDate: '2022-02-25',
          developers: ['FromSoftware'],
          publishers: ['Bandai Namco'],
          description: 'A new fantasy action RPG. Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring.',
          metacritic: 96,
          achievements: 42,
          recommendations: 98,
          userAchievements: {
            unlocked: 0,
            total: 42
          }
        },
        {
          id: 3,
          name: 'Valorant',
          coverImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1270790/header.jpg',
          genre: 'FPS',
          platform: 'PC',
          rating: 4.2,
          steamId: 1270790,
          price: 'Free',
          isFree: true,
          releaseDate: '2020-06-02',
          developers: ['Riot Games'],
          publishers: ['Riot Games'],
          description: 'A 5v5 character-based tactical shooter where precise gunplay meets unique agent abilities.',
          metacritic: 80,
          achievements: 0,
          recommendations: 250000
        },
        {
          id: 4,
          name: 'God of War',
          coverImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1593500/header.jpg',
          genre: 'Action Adventure',
          platform: 'PC',
          rating: 4.7,
          steamId: 1593500,
          price: '€49.99',
          isFree: false,
          releaseDate: '2022-01-14',
          developers: ['Santa Monica Studio'],
          publishers: ['Sony Interactive Entertainment'],
          description: 'From Santa Monica Studio and creative director Cory Barlog comes a new beginning for one of gaming\'s most recognizable icons.',
          metacritic: 93,
          achievements: 36,
          recommendations: 75,
          userAchievements: {
            unlocked: 8,
            total: 36,
            unlockedAchievements: [
              {
                id: '1',
                name: 'The Journey Begins',
                description: 'Complete the tutorial',
                icon: '🎯',
                unlockedAt: '2024-02-10'
              }
            ]
          }
        },
        {
          id: 5,
          name: 'Red Dead Redemption 2',
          coverImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1174180/header.jpg',
          genre: 'Action Adventure',
          platform: 'PC',
          rating: 4.6,
          steamId: 1174180,
          price: '€59.99',
          isFree: false,
          releaseDate: '2019-12-05',
          developers: ['Rockstar Games'],
          publishers: ['Rockstar Games'],
          description: 'Winner of over 175 Game of the Year Awards and recipient of over 250 perfect scores, Red Dead Redemption 2 is an epic tale of honor and loyalty.',
          metacritic: 93,
          achievements: 52,
          recommendations: 150000,
          userAchievements: {
            unlocked: 25,
            total: 52,
            unlockedAchievements: [
              {
                id: '1',
                name: 'Lending a Hand',
                description: 'Complete all optional Honor story missions',
                icon: '🤝',
                unlockedAt: '2023-12-01'
              },
              {
                id: '2',
                name: 'Breaking and Entering',
                description: 'Rob a total of $50 from homesteads',
                icon: '💰',
                unlockedAt: '2023-12-05'
              }
            ]
          }
        }
      ];
      
      setGames(mockGames);
      setFilteredGames(mockGames);
    } catch (error) {
      console.error('Error fetching games:', error);
      toast.error('Failed to load games');
    } finally {
      setLoading(false);
    }
  };

  const fetchSteamGames = async () => {
    try {
      setLoadingSteam(true);
      setShowSteamGames(true);
      
      // Mock Steam games data since Steam API is temporarily disabled
      const mockSteamGames: SteamGame[] = [
        {
          steamId: 1091500,
          name: 'Cyberpunk 2077',
          description: 'An open-world, action-adventure story set in Night City, a megalopolis obsessed with power, glamour and body modification.',
          shortDescription: 'An open-world, action-adventure story set in Night City.',
          headerImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/header.jpg',
          screenshots: [
            {
              id: 1,
              path_thumbnail: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/ss_1.jpg',
              path_full: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/ss_1.jpg'
            }
          ],
          background: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/page_bg_generated_v6b.jpg',
          movies: [],
          categories: [{ id: 1, description: 'Single-player' }],
          genres: [{ id: '1', description: 'RPG' }],
          releaseDate: { comingSoon: false, date: '10 Dec, 2020' },
          platforms: { windows: true, mac: false, linux: false },
          metacritic: { score: 86, url: 'https://www.metacritic.com/game/pc/cyberpunk-2077' },
          price: { currency: 'EUR', initial: 5999, final: 5999, discountPercent: 0, initialFormatted: '€59.99', finalFormatted: '€59.99' },
          dlc: [],
          requirements: { minimum: 'Windows 10', recommended: 'Windows 10' },
          supportedLanguages: 'English',
          website: 'https://www.cyberpunk.net',
          developers: ['CD Projekt Red'],
          publishers: ['CD Projekt'],
          isFree: false,
          type: 'game',
          recommendations: 125000,
          achievements: 45
        },
        {
          steamId: 1245620,
          name: 'Elden Ring',
          description: 'A new fantasy action RPG. Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring.',
          shortDescription: 'A new fantasy action RPG.',
          headerImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/header.jpg',
          screenshots: [
            {
              id: 1,
              path_thumbnail: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/ss_1.jpg',
              path_full: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/ss_1.jpg'
            }
          ],
          background: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/page_bg_generated_v6b.jpg',
          movies: [],
          categories: [{ id: 1, description: 'Single-player' }],
          genres: [{ id: '1', description: 'Action RPG' }],
          releaseDate: { comingSoon: false, date: '25 Feb, 2022' },
          platforms: { windows: true, mac: false, linux: false },
          metacritic: { score: 96, url: 'https://www.metacritic.com/game/pc/elden-ring' },
          price: { currency: 'EUR', initial: 5999, final: 5999, discountPercent: 0, initialFormatted: '€59.99', finalFormatted: '€59.99' },
          dlc: [],
          requirements: { minimum: 'Windows 10', recommended: 'Windows 10' },
          supportedLanguages: 'English',
          website: 'https://en.bandainamcoent.eu/elden-ring',
          developers: ['FromSoftware'],
          publishers: ['Bandai Namco'],
          isFree: false,
          type: 'game',
          recommendations: 98,
          achievements: 42
        }
      ];
      
      setSteamGames(mockSteamGames);
      toast.success(`Loaded ${mockSteamGames.length} popular Steam games`);
    } catch (error) {
      console.error('Error fetching Steam games:', error);
      toast.error('Failed to load Steam games');
    } finally {
      setLoadingSteam(false);
    }
  };

  const fetchGameDetails = async (steamId: number) => {
    try {
      const response = await fetch(`/api/steam/games/${steamId}`);
      if (response.ok) {
        const gameDetails = await response.json();
        setSelectedGame(gameDetails);
        setShowGameModal(true);
      } else {
        toast.error('Failed to load game details');
      }
    } catch (error) {
      console.error('Error fetching game details:', error);
      toast.error('Failed to load game details');
    }
  };

  const filterGames = () => {
    let filtered = games;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(game =>
        game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.genre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.developers?.some(dev => dev.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Genre filter
    if (selectedGenre !== 'all') {
      filtered = filtered.filter(game => game.genre === selectedGenre);
    }

    // Platform filter
    if (selectedPlatform !== 'all') {
      filtered = filtered.filter(game => {
        if (selectedPlatform === 'steam') return game.steamId;
        return game.platform?.toLowerCase().includes(selectedPlatform);
      });
    }

    // Price filter
    if (selectedPrice !== 'all') {
      filtered = filtered.filter(game => {
        if (selectedPrice === 'free') return game.isFree;
        // Add more price filtering logic here
        return true;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'releaseDate':
          return new Date(b.releaseDate || '').getTime() - new Date(a.releaseDate || '').getTime();
        case 'price':
          return (a.price || '').localeCompare(b.price || '');
        default:
          return 0;
      }
    });

    setFilteredGames(filtered);
  };

  const addToWishlist = (game: Game) => {
    toast.success(`${game.name} added to wishlist`);
  };

  const addToLibrary = (game: Game) => {
    toast.success(`${game.name} added to library`);
  };

  const renderGameCard = (game: Game) => (
    <Card 
      key={game.id} 
      className="bg-slate-800 border-slate-700 hover:bg-slate-700 transition-all duration-300 cursor-pointer group relative overflow-hidden" 
      onClick={() => navigate(`/game/${game.id}`)}
      onMouseEnter={(e) => {
        setHoveredGame(game);
        setHoverPosition({ x: e.clientX, y: e.clientY });
      }}
      onMouseLeave={() => setHoveredGame(null)}
    >
      <div className="relative">
        <img
          src={game.coverImage || '/placeholder-game.jpg'}
          alt={game.name}
          className="w-full h-48 object-cover rounded-t-lg transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center">
          <div className="text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Eye className="h-8 w-8 text-white mx-auto mb-2" />
            <p className="text-white text-sm font-medium">View Details</p>
          </div>
        </div>
        
        <div className="absolute top-2 right-2 flex gap-1">
          {game.steamId && (
            <Badge variant="secondary" className="bg-blue-600">
              <svg className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.63 3.87 10.35 9.08 11.82l.92-3.5-2.5-2.5c1.5-1.5 2.5-3.5 2.5-5.82 0-4.41-3.59-8-8-8s-8 3.59-8 8 3.59 8 8 8c2.32 0 4.32-1 5.82-2.5l2.5 2.5 3.5-.92C22.35 15.87 24 12 24 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              Steam
            </Badge>
          )}
          {game.isFree && (
            <Badge variant="default" className="bg-green-600">
              FREE
            </Badge>
          )}
        </div>
        <div className="absolute bottom-2 left-2">
          {game.rating && (
            <div className="flex items-center gap-1 bg-black bg-opacity-50 px-2 py-1 rounded">
              <Star className="h-3 w-3 text-yellow-400 fill-current" />
              <span className="text-white text-sm">{game.rating}</span>
            </div>
          )}
        </div>
      </div>
      
      <CardContent className="p-4">
        <CardTitle className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{game.name}</CardTitle>
        
        <div className="flex items-center gap-2 mb-2">
          {game.genre && (
            <Badge variant="outline" className="text-xs">
              {game.genre}
            </Badge>
          )}
          {game.platform && (
            <Badge variant="outline" className="text-xs">
              {game.platform}
            </Badge>
          )}
        </div>

        {game.description && (
          <p className="text-gray-300 text-sm mb-3 line-clamp-2">
            {game.description}
          </p>
        )}

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4 text-sm text-gray-400">
            {game.developers && game.developers.length > 0 && (
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {game.developers[0]}
              </span>
            )}
            {game.releaseDate && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(game.releaseDate).getFullYear()}
              </span>
            )}
          </div>
          {game.price && !game.isFree && (
            <span className="text-green-400 font-semibold">{game.price}</span>
          )}
        </div>

        {/* Achievements Status */}
        {game.userAchievements && game.userAchievements.total > 0 && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-400">Achievements</span>
              <span className="text-white">
                {game.userAchievements.unlocked}/{game.userAchievements.total}
              </span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(game.userAchievements.unlocked / game.userAchievements.total) * 100}%` }}
              />
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs bg-green-600 text-white">
                {game.userAchievements.unlocked} Unlocked
              </Badge>
              <Badge variant="outline" className="text-xs bg-slate-600 text-gray-300">
                {game.userAchievements.total - game.userAchievements.unlocked} To Go
              </Badge>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              addToWishlist(game);
            }}
            className="flex-1"
          >
            <Heart className="h-3 w-3 mr-1" />
            Wishlist
          </Button>
          <Button
            size="sm"
            variant="default"
            onClick={(e) => {
              e.stopPropagation();
              addToLibrary(game);
            }}
            className="flex-1"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add
          </Button>
          {game.steamId && (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                fetchGameDetails(game.steamId!);
              }}
            >
              <MoreVertical className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderSteamGameCard = (game: SteamGame) => (
    <Card key={game.steamId} className="bg-slate-800 border-slate-700 hover:bg-slate-700 transition-colors cursor-pointer" onClick={() => navigate(`/game/${game.steamId}`)}>
      <div className="relative">
        <img
          src={game.headerImage}
          alt={game.name}
          className="w-full h-48 object-cover rounded-t-lg"
        />
        <div className="absolute top-2 right-2 flex gap-1">
          <Badge variant="secondary" className="bg-blue-600">
            <Gamepad2 className="h-3 w-3 mr-1" />
            Steam
          </Badge>
          {game.isFree && (
            <Badge variant="default" className="bg-green-600">
              FREE
            </Badge>
          )}
          {game.price?.discountPercent > 0 && (
            <Badge variant="destructive">
              -{game.price.discountPercent}%
            </Badge>
          )}
        </div>
        <div className="absolute bottom-2 left-2">
          {game.metacritic?.score && (
            <div className="flex items-center gap-1 bg-black bg-opacity-50 px-2 py-1 rounded">
              <Award className="h-3 w-3 text-yellow-400" />
              <span className="text-white text-sm">{game.metacritic.score}</span>
            </div>
          )}
        </div>
      </div>
      
      <CardContent className="p-4">
        <CardTitle className="text-lg font-bold text-white mb-2">{game.name}</CardTitle>
        
        <div className="flex items-center gap-2 mb-2">
          {game.genres.map(genre => (
            <Badge key={genre.id} variant="outline" className="text-xs">
              {genre.description}
            </Badge>
          ))}
        </div>

        <p className="text-gray-300 text-sm mb-3 line-clamp-2">
          {game.shortDescription}
        </p>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4 text-sm text-gray-400">
            {game.developers.length > 0 && (
              <span>{game.developers[0]}</span>
            )}
            {game.releaseDate && (
              <span>{new Date(game.releaseDate.date).getFullYear()}</span>
            )}
          </div>
          <div className="text-right">
            {game.isFree ? (
              <span className="text-green-400 font-semibold">FREE</span>
            ) : (
              <div>
                {game.price?.discountPercent > 0 && (
                  <span className="text-gray-400 line-through text-sm mr-2">
                    {game.price.initialFormatted}
                  </span>
                )}
                <span className="text-green-400 font-semibold">
                  {game.price?.finalFormatted}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => addToWishlist({ id: game.steamId, name: game.name } as Game)}
            className="flex-1"
          >
            <Heart className="h-3 w-3 mr-1" />
            Wishlist
          </Button>
          <Button
            size="sm"
            variant="default"
            onClick={() => fetchGameDetails(game.steamId)}
            className="flex-1"
          >
            <Eye className="h-3 w-3 mr-1" />
            Details
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.open(`https://store.steampowered.com/app/${game.steamId}`, '_blank')}
          >
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading games...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Back Button */}
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          onClick={() => navigate('/dashboard')}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate('/')}
          className="flex items-center space-x-2"
        >
          <Home className="h-4 w-4" />
          <span>Home</span>
        </Button>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Games Library</h1>
          <p className="text-gray-400 mt-1">Discover and explore amazing games</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-blue-600 text-white">
            {filteredGames.length} Games
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search games..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-gray-400"
              />
            </div>
            
            {/* Genre Dropdown */}
            <div className="relative">
              <Button
                variant="outline"
                onClick={() => setShowGenreDropdown(!showGenreDropdown)}
                className="w-full justify-between bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
              >
                {selectedGenre || 'All Genres'}
                <ChevronDown className="h-4 w-4" />
              </Button>
              {showGenreDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-slate-700 border border-slate-600 rounded-md shadow-lg">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setSelectedGenre('');
                        setShowGenreDropdown(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-slate-600"
                    >
                      All Genres
                    </button>
                    {['action', 'adventure', 'rpg', 'strategy', 'sports', 'racing', 'simulation', 'indie'].map((genre) => (
                      <button
                        key={genre}
                        onClick={() => {
                          setSelectedGenre(genre);
                          setShowGenreDropdown(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-slate-600 capitalize"
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Platform Dropdown */}
            <div className="relative">
              <Button
                variant="outline"
                onClick={() => setShowPlatformDropdown(!showPlatformDropdown)}
                className="w-full justify-between bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
              >
                {selectedPlatform || 'All Platforms'}
                <ChevronDown className="h-4 w-4" />
              </Button>
              {showPlatformDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-slate-700 border border-slate-600 rounded-md shadow-lg">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setSelectedPlatform('');
                        setShowPlatformDropdown(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-slate-600"
                    >
                      All Platforms
                    </button>
                    {['pc', 'playstation', 'xbox', 'nintendo', 'mobile'].map((platform) => (
                      <button
                        key={platform}
                        onClick={() => {
                          setSelectedPlatform(platform);
                          setShowPlatformDropdown(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-slate-600 capitalize"
                      >
                        {platform}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedGenre('');
                setSelectedPlatform('');
              }}
              className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search games..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-700"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-md"
            >
              <option value="name">Sort by Name</option>
              <option value="rating">Sort by Rating</option>
              <option value="releaseDate">Sort by Release Date</option>
              <option value="price">Sort by Price</option>
            </select>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            {/* Genre Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-sm"
              >
                <option value="all">All Genres</option>
                {genres.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </div>

            {/* Platform Filter */}
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4 text-gray-400" />
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-sm"
              >
                <option value="all">All Platforms</option>
                {platforms.map(platform => (
                  <option key={platform.id} value={platform.id}>{platform.name}</option>
                ))}
              </select>
            </div>

            {/* Price Filter */}
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-gray-400" />
              <select
                value={selectedPrice}
                onChange={(e) => setSelectedPrice(e.target.value)}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-sm"
              >
                <option value="all">All Prices</option>
                {priceRanges.map(range => (
                  <option key={range.id} value={range.id}>{range.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Games Grid */}
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
            : 'grid-cols-1'
        }`}>
          {showSteamGames ? (
            steamGames.map(renderSteamGameCard)
          ) : (
            filteredGames.map(renderGameCard)
          )}
        </div>

        {filteredGames.length === 0 && !showSteamGames && (
          <div className="text-center py-12">
            <Gamepad2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No games found</h3>
            <p className="text-gray-400">Try adjusting your search or filters</p>
          </div>
        )}

        {steamGames.length === 0 && showSteamGames && !loadingSteam && (
          <div className="text-center py-12">
            <svg className="h-16 w-16 text-gray-400 mx-auto mb-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.63 3.87 10.35 9.08 11.82l.92-3.5-2.5-2.5c1.5-1.5 2.5-3.5 2.5-5.82 0-4.41-3.59-8-8-8s-8 3.59-8 8 3.59 8 8 8c2.32 0 4.32-1 5.82-2.5l2.5 2.5 3.5-.92C22.35 15.87 24 12 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No Steam games found</h3>
            <p className="text-gray-400">Try loading Steam games again</p>
          </div>
        )}
      </div>

      {/* Game Details Modal */}
      {showGameModal && selectedGame && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <img
                src={selectedGame.headerImage}
                alt={selectedGame.name}
                className="w-full h-64 object-cover rounded-t-lg"
              />
              <Button
                onClick={() => setShowGameModal(false)}
                variant="outline"
                size="sm"
                className="absolute top-4 right-4 bg-black bg-opacity-50"
              >
                ×
              </Button>
            </div>
            
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{selectedGame.name}</h2>
                  <div className="flex items-center gap-2 mb-2">
                    {selectedGame.genres.map(genre => (
                      <Badge key={genre.id} variant="outline">
                        {genre.description}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  {selectedGame.isFree ? (
                    <span className="text-2xl font-bold text-green-400">FREE</span>
                  ) : (
                    <div>
                      {selectedGame.price?.discountPercent > 0 && (
                        <span className="text-gray-400 line-through text-lg">
                          {selectedGame.price.initialFormatted}
                        </span>
                      )}
                      <span className="text-2xl font-bold text-green-400">
                        {selectedGame.price?.finalFormatted}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                  <div 
                    className="text-gray-300 text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: selectedGame.description }}
                  />
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Details</h3>
                  <div className="space-y-2 text-sm text-gray-300">
                    {selectedGame.developers.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Developer:</span>
                        <span>{selectedGame.developers.join(', ')}</span>
                      </div>
                    )}
                    {selectedGame.publishers.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Publisher:</span>
                        <span>{selectedGame.publishers.join(', ')}</span>
                      </div>
                    )}
                    {selectedGame.releaseDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(selectedGame.releaseDate.date).toLocaleDateString()}</span>
                      </div>
                    )}
                    {selectedGame.metacritic?.score && (
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        <span>Metacritic: {selectedGame.metacritic.score}</span>
                      </div>
                    )}
                    {selectedGame.achievements > 0 && (
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        <span>{selectedGame.achievements} Achievements</span>
                      </div>
                    )}
                    {selectedGame.recommendations > 0 && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{selectedGame.recommendations} Recommendations</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {selectedGame.screenshots.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-2">Screenshots</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {selectedGame.screenshots.slice(0, 8).map((screenshot, index) => (
                      <img
                        key={index}
                        src={screenshot.path_thumbnail}
                        alt={`Screenshot ${index + 1}`}
                        className="w-full h-24 object-cover rounded cursor-pointer hover:opacity-80"
                        onClick={() => window.open(screenshot.path_full, '_blank')}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4">
                <Button
                  onClick={() => addToWishlist({ id: selectedGame.steamId, name: selectedGame.name } as Game)}
                  variant="outline"
                  className="flex-1"
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Add to Wishlist
                </Button>
                <Button
                  onClick={() => addToLibrary({ id: selectedGame.steamId, name: selectedGame.name } as Game)}
                  variant="default"
                  className="flex-1"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Library
                </Button>
                <Button
                  onClick={() => window.open(`https://store.steampowered.com/app/${selectedGame.steamId}`, '_blank')}
                  variant="outline"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View on Steam
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hover Modal */}
      {hoveredGame && (
        <div 
          className="fixed z-50 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl p-4 max-w-sm w-full pointer-events-none"
          style={{
            left: hoverPosition.x + 20,
            top: hoverPosition.y - 100,
            transform: 'translateY(-50%)'
          }}
        >
          <div className="flex items-start gap-3">
            <img
              src={hoveredGame.coverImage}
              alt={hoveredGame.name}
              className="w-16 h-16 object-cover rounded"
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold text-sm mb-1 truncate">
                {hoveredGame.name}
              </h3>
              <p className="text-gray-400 text-xs mb-2 line-clamp-2">
                {hoveredGame.description}
              </p>
              
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                {hoveredGame.developers && hoveredGame.developers.length > 0 && (
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {hoveredGame.developers[0]}
                  </span>
                )}
                {hoveredGame.releaseDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(hoveredGame.releaseDate).getFullYear()}
                  </span>
                )}
              </div>

              {/* Achievements Status */}
              {hoveredGame.userAchievements && hoveredGame.userAchievements.total > 0 && (
                <div className="mb-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-400">Achievements</span>
                    <span className="text-white">
                      {hoveredGame.userAchievements.unlocked}/{hoveredGame.userAchievements.total}
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-1.5">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-1.5 rounded-full"
                      style={{ width: `${(hoveredGame.userAchievements.unlocked / hoveredGame.userAchievements.total) * 100}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Badge variant="outline" className="text-xs bg-green-600 text-white px-1 py-0.5">
                      {hoveredGame.userAchievements.unlocked} Done
                    </Badge>
                    <Badge variant="outline" className="text-xs bg-slate-600 text-gray-300 px-1 py-0.5">
                      {hoveredGame.userAchievements.total - hoveredGame.userAchievements.unlocked} To Go
                    </Badge>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {hoveredGame.genre && (
                    <Badge variant="outline" className="text-xs">
                      {hoveredGame.genre}
                    </Badge>
                  )}
                  {hoveredGame.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-400 fill-current" />
                      <span className="text-white text-xs">{hoveredGame.rating}</span>
                    </div>
                  )}
                </div>
                {hoveredGame.price && !hoveredGame.isFree && (
                  <span className="text-green-400 font-semibold text-sm">{hoveredGame.price}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Games; 