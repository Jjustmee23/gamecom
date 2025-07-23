import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft,
  Heart,
  Bookmark,
  Star,
  Calendar,
  Users,
  Award,
  Tag,
  Globe,
  Video,
  Image,
  ExternalLink,
  Play,
  Download,
  Gamepad2,
  Monitor,
  Apple,
  Laptop,
  DollarSign,
  Clock,
  Eye,
  ThumbsUp,
  MessageCircle,
  Share2,
  Trophy,
  MessageSquare,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import GameReviews from '@/components/GameReviews';
import GameForum from '@/components/GameForum';

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
  website?: string;
  lastUpdated?: string;
}

interface Review {
  id: number;
  userId: number;
  username: string;
  userAvatar?: string;
  userLevel: number;
  userPoints: number;
  rating: number;
  title: string;
  content: string;
  pros: string[];
  cons: string[];
  playtime: number;
  isVerified: boolean;
  helpfulCount: number;
  createdAt: string;
  updatedAt?: string;
}

interface ForumPost {
  id: number;
  userId: number;
  username: string;
  userAvatar?: string;
  userLevel: number;
  userPoints: number;
  title: string;
  content: string;
  category: 'general' | 'guide' | 'bug' | 'suggestion' | 'mod' | 'wiki';
  isPinned: boolean;
  isLocked: boolean;
  viewCount: number;
  replyCount: number;
  helpfulCount: number;
  createdAt: string;
  updatedAt?: string;
}

const GameDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'screenshots' | 'achievements' | 'reviews' | 'forum'>('overview');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([]);
  const [userLevel, setUserLevel] = useState(1);
  const [userPoints, setUserPoints] = useState(0);
  const [canWriteReview, setCanWriteReview] = useState(false);
  const [canEditWiki, setCanEditWiki] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showForumForm, setShowForumForm] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);

  useEffect(() => {
    fetchGameDetails();
  }, [id]);

  const fetchGameDetails = async () => {
    try {
      setLoading(true);
      
      // Mock game data - in real app this would fetch from API
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
          description: 'An open-world, action-adventure story set in Night City, a megalopolis obsessed with power, glamour and body modification. You play as V, a mercenary outlaw going after a one-of-a-kind implant that is the key to immortality. You can customize your character\'s cyberware, skillset and playstyle, and explore a vast city where the choices you make shape the story and the world around you.',
          screenshots: [
            'https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/ss_1.jpg',
            'https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/ss_2.jpg',
            'https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/ss_3.jpg',
            'https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/ss_4.jpg'
          ],
          metacritic: 86,
          achievements: 45,
          recommendations: 125000,
          website: 'https://www.cyberpunk.net',
          lastUpdated: '2023-10-27T10:00:00Z'
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
          description: 'A new fantasy action RPG. Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring and become an Elden Lord in the Lands Between. A vast world where open fields with a variety of situations and huge dungeons with complex and three-dimensional designs are seamlessly connected.',
          screenshots: [
            'https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/ss_1.jpg',
            'https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/ss_2.jpg',
            'https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/ss_3.jpg'
          ],
          metacritic: 96,
          achievements: 42,
          recommendations: 98,
          website: 'https://eldenring.com',
          lastUpdated: '2023-10-27T10:00:00Z'
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
          description: 'A 5v5 character-based tactical shooter where precise gunplay meets unique agent abilities. In Valorant, you\'ll be able to choose from a diverse cast of agents, each with their own unique abilities and playstyles.',
          screenshots: [
            'https://cdn.cloudflare.steamstatic.com/steam/apps/1270790/ss_1.jpg',
            'https://cdn.cloudflare.steamstatic.com/steam/apps/1270790/ss_2.jpg'
          ],
          metacritic: 80,
          achievements: 0,
          recommendations: 250000,
          website: 'https://playvalorant.com',
          lastUpdated: '2023-10-27T10:00:00Z'
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
          description: 'From Santa Monica Studio and creative director Cory Barlog comes a new beginning for one of gaming\'s most recognizable icons. Living as a man outside the shadow of the gods, Kratos must adapt to unfamiliar lands, unexpected threats, and a second chance at being a father.',
          screenshots: [
            'https://cdn.cloudflare.steamstatic.com/steam/apps/1593500/ss_1.jpg',
            'https://cdn.cloudflare.steamstatic.com/steam/apps/1593500/ss_2.jpg',
            'https://cdn.cloudflare.steamstatic.com/steam/apps/1593500/ss_3.jpg'
          ],
          metacritic: 93,
          achievements: 36,
          recommendations: 75,
          website: 'https://godofwar.playstation.com',
          lastUpdated: '2023-10-27T10:00:00Z'
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
          description: 'Winner of over 175 Game of the Year Awards and recipient of over 250 perfect scores, Red Dead Redemption 2 is an epic tale of honor and loyalty at the dawn of the modern age.',
          screenshots: [
            'https://cdn.cloudflare.steamstatic.com/steam/apps/1174180/ss_1.jpg',
            'https://cdn.cloudflare.steamstatic.com/steam/apps/1174180/ss_2.jpg',
            'https://cdn.cloudflare.steamstatic.com/steam/apps/1174180/ss_3.jpg'
          ],
          metacritic: 93,
          achievements: 52,
          recommendations: 150000,
          website: 'https://www.rockstargames.com/reddeadredemption2',
          lastUpdated: '2023-10-27T10:00:00Z'
        }
      ];

      const foundGame = mockGames.find(g => g.id === parseInt(id!));
      if (foundGame) {
        setGame(foundGame);
      } else {
        toast.error('Game not found');
        navigate('/games');
      }
    } catch (error) {
      console.error('Error fetching game details:', error);
      toast.error('Failed to load game details');
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = () => {
    toast.success(`${game?.name} added to wishlist`);
  };

  const addToLibrary = () => {
    toast.success(`${game?.name} added to library`);
  };

  const shareGame = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Game link copied to clipboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Game not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Back Button */}
      <div className="flex items-center space-x-4 mb-6">
        <Button
          variant="outline"
          onClick={() => navigate('/games')}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Games</span>
        </Button>
      </div>

      {/* Hero Section */}
      <div className="relative h-96">
        <img
          src={game.coverImage}
          alt={game.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-white mb-2">{game.name}</h1>
                <div className="flex items-center gap-4 text-gray-300 mb-4">
                  {game.developers && game.developers.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {game.developers.join(', ')}
                    </span>
                  )}
                  {game.releaseDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(game.releaseDate).toLocaleDateString()}
                    </span>
                  )}
                  {game.rating && (
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      {game.rating}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={addToWishlist}>
                  <Heart className="h-4 w-4 mr-2" />
                  Wishlist
                </Button>
                <Button variant="default" onClick={addToLibrary}>
                  <Play className="h-4 w-4 mr-2" />
                  {game.isFree ? 'Play Now' : 'Add to Library'}
                </Button>
                <Button variant="outline" onClick={shareGame}>
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="flex border-b border-slate-700 mb-6">
              {[
                { id: 'overview', label: 'Overview', icon: Eye },
                { id: 'screenshots', label: 'Screenshots', icon: Image },
                { id: 'achievements', label: 'Achievements', icon: Award },
                { id: 'reviews', label: 'Reviews', icon: MessageCircle },
                { id: 'forum', label: 'Forum', icon: Users }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">About This Game</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 leading-relaxed">{game.description}</p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Game Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-gray-400 text-sm mb-2">Genre</h4>
                        <p className="text-white">{game.genre}</p>
                      </div>
                      <div>
                        <h4 className="text-gray-400 text-sm mb-2">Platform</h4>
                        <p className="text-white">{game.platform}</p>
                      </div>
                      <div>
                        <h4 className="text-gray-400 text-sm mb-2">Release Date</h4>
                        <p className="text-white">{game.releaseDate ? new Date(game.releaseDate).toLocaleDateString() : 'TBA'}</p>
                      </div>
                      <div>
                        <h4 className="text-gray-400 text-sm mb-2">Price</h4>
                        <p className="text-white">{game.isFree ? 'Free' : game.price}</p>
                      </div>
                      {game.developers && (
                        <div>
                          <h4 className="text-gray-400 text-sm mb-2">Developers</h4>
                          <p className="text-white">{game.developers.join(', ')}</p>
                        </div>
                      )}
                      {game.publishers && (
                        <div>
                          <h4 className="text-gray-400 text-sm mb-2">Publishers</h4>
                          <p className="text-white">{game.publishers.join(', ')}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'screenshots' && (
              <div className="grid grid-cols-2 gap-4">
                {game.screenshots?.map((screenshot, index) => (
                  <img
                    key={index}
                    src={screenshot}
                    alt={`${game.name} screenshot ${index + 1}`}
                    className="w-full rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                  />
                ))}
              </div>
            )}

            {activeTab === 'achievements' && (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Achievements</CardTitle>
                  <CardDescription className="text-gray-400">
                    {game.achievements || 0} achievements available
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Award className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Achievement details coming soon...</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'reviews' && (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Reviews</CardTitle>
                  <CardDescription className="text-gray-400">
                    Community reviews and ratings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Reviews coming soon...</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'forum' && (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Game Forum</CardTitle>
                  <CardDescription className="text-gray-400">
                    Discuss and share your thoughts about {game.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Forum and community features coming soon...</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Game Stats */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Game Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {game.metacritic && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Metacritic</span>
                    <Badge variant="outline" className="bg-green-600 text-white">
                      {game.metacritic}
                    </Badge>
                  </div>
                )}
                {game.achievements && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Achievements</span>
                    <span className="text-white">{game.achievements}</span>
                  </div>
                )}
                {game.recommendations && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Recommendations</span>
                    <span className="text-white">{game.recommendations.toLocaleString()}</span>
                  </div>
                )}
                {game.steamId && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Steam ID</span>
                    <span className="text-white">{game.steamId}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Heart className="h-4 w-4 mr-2" />
                  Add to Wishlist
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Bookmark className="h-4 w-4 mr-2" />
                  Follow Game
                </Button>
                {game.steamId && (
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => window.open(`https://store.steampowered.com/app/${game.steamId}`, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View on Steam
                  </Button>
                )}
                {game.website && (
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => window.open(game.website, '_blank')}
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    Visit Website
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Game Details */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Game Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {game.developers && game.developers.length > 0 && (
                  <div>
                    <span className="text-gray-400 text-sm">Developers</span>
                    <p className="text-white text-sm">{game.developers.join(', ')}</p>
                  </div>
                )}
                {game.publishers && game.publishers.length > 0 && (
                  <div>
                    <span className="text-gray-400 text-sm">Publishers</span>
                    <p className="text-white text-sm">{game.publishers.join(', ')}</p>
                  </div>
                )}
                {game.releaseDate && (
                  <div>
                    <span className="text-gray-400 text-sm">Release Date</span>
                    <p className="text-white text-sm">{new Date(game.releaseDate).toLocaleDateString()}</p>
                  </div>
                )}
                {game.genre && (
                  <div>
                    <span className="text-gray-400 text-sm">Genre</span>
                    <p className="text-white text-sm">{game.genre}</p>
                  </div>
                )}
                {game.platform && (
                  <div>
                    <span className="text-gray-400 text-sm">Platform</span>
                    <p className="text-white text-sm">{game.platform}</p>
                  </div>
                )}
                {game.price && (
                  <div>
                    <span className="text-gray-400 text-sm">Price</span>
                    <p className="text-white text-sm">{game.isFree ? 'Free' : game.price}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Cache Info */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Data Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Last Updated</span>
                  <span className="text-white">
                    {game.lastUpdated ? new Date(game.lastUpdated).toLocaleDateString() : 'Unknown'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Data Source</span>
                  <span className="text-white">Steam API</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Cache Status</span>
                  <Badge variant="outline" className="bg-green-600 text-white text-xs">
                    Cached
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameDetail; 