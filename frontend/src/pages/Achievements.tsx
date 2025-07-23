import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy,
  Award,
  Star,
  Target,
  Zap,
  Users,
  MessageSquare,
  Heart,
  Bookmark,
  Gamepad2,
  Calendar,
  Clock,
  TrendingUp,
  Crown,
  Medal,
  Shield,
  Sword,
  Flame,
  Sparkles,
  Gem,
  Diamond,
  Lock,
  Unlock,
  CheckCircle,
  XCircle,
  Filter,
  Search,
  Grid3X3,
  List,
  RefreshCw,
  Download,
  Upload,
  Settings,
  BarChart3,
  Activity
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  category: 'social' | 'gaming' | 'community' | 'steam' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xpReward: number;
  isUnlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
  steamId?: number;
  gameName?: string;
}

interface SteamAchievement {
  steamId: number;
  gameName: string;
  achievements: Array<{
    name: string;
    description: string;
    icon: string;
    isUnlocked: boolean;
    unlockedAt?: string;
  }>;
}

interface UserStats {
  totalAchievements: number;
  unlockedAchievements: number;
  totalXP: number;
  level: number;
  steamGames: number;
  steamAchievements: number;
  socialScore: number;
  gamingScore: number;
  communityScore: number;
}

const Achievements: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [steamAchievements, setSteamAchievements] = useState<SteamAchievement[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);
  const [loadingSteam, setLoadingSteam] = useState(false);
  const [showSteamOnly, setShowSteamOnly] = useState(false);
  const [isSteamConnected, setIsSteamConnected] = useState(false);
  const [steamProfile, setSteamProfile] = useState<any>(null);
  const [selectedGame, setSelectedGame] = useState<string>('all');
  const [userGames, setUserGames] = useState<any[]>([]);
  const [loadingGames, setLoadingGames] = useState(false);

  const categories = [
    { id: 'all', name: 'All', icon: Trophy },
    { id: 'social', name: 'Social', icon: Users },
    { id: 'gaming', name: 'Gaming', icon: Gamepad2 },
    { id: 'community', name: 'Community', icon: MessageSquare },
    { id: 'steam', name: 'Steam', icon: Award },
    { id: 'special', name: 'Special', icon: Crown }
  ];

  const rarities = [
    { id: 'all', name: 'All Rarities', color: 'text-gray-400' },
    { id: 'common', name: 'Common', color: 'text-gray-300' },
    { id: 'rare', name: 'Rare', color: 'text-blue-400' },
    { id: 'epic', name: 'Epic', color: 'text-purple-400' },
    { id: 'legendary', name: 'Legendary', color: 'text-yellow-400' }
  ];

  useEffect(() => {
    fetchAchievements();
    checkSteamConnection();
  }, []);

  const checkSteamConnection = async () => {
    try {
      // Check if user has Steam connected
      const response = await fetch('/api/auth/steam/status');
      if (response.ok) {
        const data = await response.json();
        setIsSteamConnected(data.connected);
        if (data.connected) {
          setSteamProfile(data.profile);
          fetchUserGames();
        }
      }
    } catch (error) {
      console.error('Error checking Steam connection:', error);
    }
  };

  const connectSteamAccount = () => {
    // Redirect to Steam OAuth
    window.location.href = '/api/auth/steam';
  };

  const fetchUserGames = async () => {
    if (!isSteamConnected) return;
    
    setLoadingGames(true);
    try {
      const response = await fetch('/api/steam/user/games');
      if (response.ok) {
        const data = await response.json();
        setUserGames(data.games || []);
      }
    } catch (error) {
      console.error('Error fetching user games:', error);
      toast.error('Failed to load Steam games');
    } finally {
      setLoadingGames(false);
    }
  };

  const fetchGameAchievements = async (gameId: string) => {
    if (!isSteamConnected) {
      toast.error('Please connect your Steam account first');
      return;
    }

    setLoadingSteam(true);
    try {
      const response = await fetch(`/api/steam/games/${gameId}/achievements`);
      if (response.ok) {
        const data = await response.json();
        const gameAchievements: SteamAchievement = {
          steamId: parseInt(gameId),
          gameName: data.gameName,
          achievements: data.achievements.map((achievement: any) => ({
            name: achievement.name,
            description: achievement.description,
            icon: achievement.icon,
            isUnlocked: achievement.achieved === 1,
            unlockedAt: achievement.achieved === 1 ? achievement.unlocktime : undefined
          }))
        };
        
        setSteamAchievements(prev => {
          const existing = prev.find(g => g.steamId === parseInt(gameId));
          if (existing) {
            return prev.map(g => g.steamId === parseInt(gameId) ? gameAchievements : g);
          } else {
            return [...prev, gameAchievements];
          }
        });
        
        toast.success(`Loaded ${gameAchievements.achievements.length} achievements for ${gameAchievements.gameName}`);
      } else {
        toast.error('Failed to load game achievements');
      }
    } catch (error) {
      console.error('Error fetching game achievements:', error);
      toast.error('Failed to load game achievements');
    } finally {
      setLoadingSteam(false);
    }
  };

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      
      // Mock achievements data
      const mockAchievements: Achievement[] = [
        {
          id: 1,
          name: 'First Steps',
          description: 'Complete your first game',
          icon: '🎮',
          category: 'gaming',
          rarity: 'common',
          xpReward: 100,
          isUnlocked: true,
          unlockedAt: '2024-01-10T12:00:00Z'
        },
        {
          id: 2,
          name: 'Social Butterfly',
          description: 'Add 5 friends to your network',
          icon: '👥',
          category: 'social',
          rarity: 'common',
          xpReward: 150,
          isUnlocked: true,
          unlockedAt: '2024-01-12T14:30:00Z'
        },
        {
          id: 3,
          name: 'Achievement Hunter',
          description: 'Unlock 10 achievements',
          icon: '🏆',
          category: 'gaming',
          rarity: 'rare',
          xpReward: 300,
          isUnlocked: true,
          unlockedAt: '2024-01-15T16:45:00Z'
        },
        {
          id: 4,
          name: 'Community Helper',
          description: 'Help 10 other users',
          icon: '🤝',
          category: 'community',
          rarity: 'rare',
          xpReward: 250,
          isUnlocked: false,
          progress: 7,
          maxProgress: 10
        },
        {
          id: 5,
          name: 'Steam Master',
          description: 'Connect your Steam account and sync achievements',
          icon: '🎯',
          category: 'steam',
          rarity: 'epic',
          xpReward: 500,
          isUnlocked: false
        },
        {
          id: 6,
          name: 'Chat Champion',
          description: 'Send 100 messages in community chat',
          icon: '💬',
          category: 'social',
          rarity: 'common',
          xpReward: 200,
          isUnlocked: false,
          progress: 45,
          maxProgress: 100
        },
        {
          id: 7,
          name: 'Game Collector',
          description: 'Add 25 games to your library',
          icon: '📚',
          category: 'gaming',
          rarity: 'rare',
          xpReward: 400,
          isUnlocked: false,
          progress: 12,
          maxProgress: 25
        },
        {
          id: 8,
          name: 'Forum Legend',
          description: 'Create 10 forum posts with 50+ likes',
          icon: '📝',
          category: 'community',
          rarity: 'epic',
          xpReward: 600,
          isUnlocked: false,
          progress: 3,
          maxProgress: 10
        },
        {
          id: 9,
          name: 'Steam Veteran',
          description: 'Unlock 100 Steam achievements',
          icon: '🔥',
          category: 'steam',
          rarity: 'legendary',
          xpReward: 1000,
          isUnlocked: false,
          progress: 23,
          maxProgress: 100
        },
        {
          id: 10,
          name: 'Early Adopter',
          description: 'Join the platform during beta',
          icon: '⭐',
          category: 'special',
          rarity: 'legendary',
          xpReward: 800,
          isUnlocked: true,
          unlockedAt: '2024-01-01T00:00:00Z'
        }
      ];

      const mockUserStats: UserStats = {
        totalAchievements: 10,
        unlockedAchievements: 3,
        totalXP: 550,
        level: 5,
        steamGames: 8,
        steamAchievements: 23,
        socialScore: 45,
        gamingScore: 67,
        communityScore: 23
      };

      setAchievements(mockAchievements);
      setUserStats(mockUserStats);
    } catch (error) {
      console.error('Error fetching achievements:', error);
      toast.error('Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };

  const fetchSteamAchievements = async () => {
    try {
      setLoadingSteam(true);
      
      // Mock Steam achievements
      const mockSteamAchievements: SteamAchievement[] = [
        {
          steamId: 1091500,
          gameName: 'Cyberpunk 2077',
          achievements: [
            {
              name: 'The Wandering Fool',
              description: 'Complete the prologue',
              icon: '🎭',
              isUnlocked: true,
              unlockedAt: '2024-01-15T10:30:00Z'
            },
            {
              name: 'Gun Fu',
              description: 'Kill 3 enemies in quick succession with a pistol',
              icon: '🔫',
              isUnlocked: true,
              unlockedAt: '2024-01-16T14:20:00Z'
            },
            {
              name: 'V for Vendetta',
              description: 'Complete all gigs and NCPD Scanner Hustles in Watson',
              icon: '⚡',
              isUnlocked: false
            }
          ]
        },
        {
          steamId: 1245620,
          gameName: 'Elden Ring',
          achievements: [
            {
              name: 'Elden Ring',
              description: 'Earn the title of Elden Lord',
              icon: '👑',
              isUnlocked: false
            },
            {
              name: 'Age of the Stars',
              description: 'Earn the Age of Stars ending',
              icon: '⭐',
              isUnlocked: false
            }
          ]
        }
      ];

      setSteamAchievements(mockSteamAchievements);
      toast.success('Steam achievements loaded!');
    } catch (error) {
      console.error('Error fetching Steam achievements:', error);
      toast.error('Failed to load Steam achievements');
    } finally {
      setLoadingSteam(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-300';
      case 'rare': return 'text-blue-400';
      case 'epic': return 'text-purple-400';
      case 'legendary': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-600';
      case 'rare': return 'border-blue-600';
      case 'epic': return 'border-purple-600';
      case 'legendary': return 'border-yellow-600';
      default: return 'border-gray-600';
    }
  };

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat ? cat.icon : Trophy;
  };

  const filteredAchievements = achievements.filter(achievement => {
    const matchesCategory = selectedCategory === 'all' || achievement.category === selectedCategory;
    const matchesRarity = selectedRarity === 'all' || achievement.rarity === selectedRarity;
    return matchesCategory && matchesRarity;
  });

  const renderAchievementCard = (achievement: Achievement) => (
    <Card 
      key={achievement.id} 
      className={`bg-slate-800 border-slate-700 hover:bg-slate-700 transition-colors ${
        achievement.isUnlocked ? 'border-green-600' : getRarityBorder(achievement.rarity)
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`text-3xl ${achievement.isUnlocked ? 'opacity-100' : 'opacity-50'}`}>
            {achievement.icon}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={`font-semibold text-sm ${achievement.isUnlocked ? 'text-white' : 'text-gray-400'}`}>
                {achievement.name}
              </h3>
              {achievement.isUnlocked && (
                <CheckCircle className="h-4 w-4 text-green-400" />
              )}
            </div>
            
            <p className="text-xs text-gray-400 mb-2">
              {achievement.description}
            </p>
            
            <div className="flex items-center gap-2 mb-2">
              <Badge 
                variant="outline" 
                className={`text-xs ${getRarityColor(achievement.rarity)}`}
              >
                {achievement.rarity.toUpperCase()}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {achievement.category.toUpperCase()}
              </Badge>
              <div className="flex items-center gap-1 text-xs text-yellow-400">
                <Star className="h-3 w-3" />
                {achievement.xpReward} XP
              </div>
            </div>
            
            {achievement.progress !== undefined && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Progress</span>
                  <span>{achievement.progress}/{achievement.maxProgress}</span>
                </div>
                <div className="relative h-1 w-full overflow-hidden rounded-full bg-gray-700">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-300 ease-out"
                    style={{ width: `${Math.min(Math.max((achievement.progress / (achievement.maxProgress || 1)) * 100, 0), 100)}%` }}
                  />
                </div>
              </div>
            )}
            
            {achievement.isUnlocked && achievement.unlockedAt && (
              <p className="text-xs text-green-400 mt-2">
                Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderSteamAchievementCard = (steamAchievement: SteamAchievement) => (
    <Card key={steamAchievement.steamId} className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gamepad2 className="h-5 w-5 text-blue-400" />
          {steamAchievement.gameName}
        </CardTitle>
        <CardDescription>
          {steamAchievement.achievements.filter(a => a.isUnlocked).length} / {steamAchievement.achievements.length} achievements unlocked
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {steamAchievement.achievements.map((achievement, index) => (
            <div 
              key={index}
              className={`flex items-center gap-3 p-2 rounded ${
                achievement.isUnlocked ? 'bg-green-900/20 border border-green-600/30' : 'bg-slate-700/50'
              }`}
            >
              <div className={`text-2xl ${achievement.isUnlocked ? 'opacity-100' : 'opacity-50'}`}>
                {achievement.icon}
              </div>
              <div className="flex-1">
                <h4 className={`text-sm font-medium ${achievement.isUnlocked ? 'text-white' : 'text-gray-400'}`}>
                  {achievement.name}
                </h4>
                <p className="text-xs text-gray-400">{achievement.description}</p>
                {achievement.isUnlocked && achievement.unlockedAt && (
                  <p className="text-xs text-green-400">
                    Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
              {achievement.isUnlocked ? (
                <CheckCircle className="h-4 w-4 text-green-400" />
              ) : (
                <Lock className="h-4 w-4 text-gray-500" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading achievements...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Trophy className="h-8 w-8 text-yellow-400" />
                Achievements
              </h1>
              <p className="text-gray-300">Track your progress and unlock rewards</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={fetchSteamAchievements}
                disabled={loadingSteam}
                variant="outline"
                className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loadingSteam ? 'animate-spin' : ''}`} />
                {loadingSteam ? 'Loading...' : 'Sync Steam'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Steam Connection Section */}
        {!isSteamConnected && (
          <Card className="bg-slate-800 border-slate-700 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gamepad2 className="h-5 w-5 text-blue-400" />
                Connect Steam Account
              </CardTitle>
              <CardDescription>
                Connect your Steam account to see your game achievements and stats
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-gray-300 mb-2">
                    By connecting your Steam account, you can:
                  </p>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• View achievements from all your Steam games</li>
                    <li>• Track progress on individual games</li>
                    <li>• See which achievements you've unlocked</li>
                    <li>• Compare stats with other players</li>
                  </ul>
                </div>
                <div className="ml-6">
                  <Button 
                    onClick={connectSteamAccount}
                    className="bg-blue-600 hover:bg-blue-700"
                    size="lg"
                  >
                    <Gamepad2 className="h-5 w-5 mr-2" />
                    Connect Steam Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Steam Profile Section */}
        {isSteamConnected && steamProfile && (
          <Card className="bg-slate-800 border-slate-700 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gamepad2 className="h-5 w-5 text-blue-400" />
                Steam Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <img
                  src={steamProfile.avatarfull}
                  alt={steamProfile.personaname}
                  className="w-16 h-16 rounded-full"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">{steamProfile.personaname}</h3>
                  <p className="text-gray-400">Steam ID: {steamProfile.steamid}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                    <span>Games: {userGames.length}</span>
                    <span>Level: {steamProfile.level || 'N/A'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={fetchUserGames}
                    disabled={loadingGames}
                    variant="outline"
                    size="sm"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${loadingGames ? 'animate-spin' : ''}`} />
                    {loadingGames ? 'Loading...' : 'Refresh Games'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Game Selection Section */}
        {isSteamConnected && userGames.length > 0 && (
          <Card className="bg-slate-800 border-slate-700 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-green-400" />
                Select Game for Achievements
              </CardTitle>
              <CardDescription>
                Choose a game to view and load its achievements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userGames.slice(0, 12).map((game) => (
                  <Card 
                    key={game.appid} 
                    className={`bg-slate-700 border-slate-600 cursor-pointer hover:bg-slate-600 transition-colors ${
                      selectedGame === game.appid.toString() ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedGame(game.appid.toString())}
                  >
                    <div className="relative">
                      <img
                        src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header.jpg`}
                        alt={game.name}
                        className="w-full h-24 object-cover rounded-t-lg"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-blue-600 text-xs">
                          {game.playtime_forever ? `${Math.round(game.playtime_forever / 60)}h` : '0h'}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <h4 className="font-medium text-white text-sm mb-2 truncate">
                        {game.name}
                      </h4>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          fetchGameAchievements(game.appid.toString());
                        }}
                        disabled={loadingSteam}
                        className="w-full"
                      >
                        {loadingSteam ? (
                          <>
                            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          <>
                            <Trophy className="h-3 w-3 mr-1" />
                            Load Achievements
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {userGames.length > 12 && (
                <div className="text-center mt-4">
                  <p className="text-gray-400 text-sm">
                    Showing first 12 games. Connect to see all {userGames.length} games.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Stats Overview */}
        {userStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Total XP</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{userStats.totalXP.toLocaleString()}</div>
                <p className="text-xs text-gray-400">Level {userStats.level}</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Achievements</CardTitle>
                <Trophy className="h-4 w-4 text-yellow-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {userStats.unlockedAchievements}/{userStats.totalAchievements}
                </div>
                <p className="text-xs text-gray-400">
                  {Math.round((userStats.unlockedAchievements / userStats.totalAchievements) * 100)}% complete
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Steam Games</CardTitle>
                <Gamepad2 className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{userStats.steamGames}</div>
                <p className="text-xs text-gray-400">{userStats.steamAchievements} achievements</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Community Score</CardTitle>
                <Activity className="h-4 w-4 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {userStats.socialScore + userStats.gamingScore + userStats.communityScore}
                </div>
                <p className="text-xs text-gray-400">Total score</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-wrap gap-4">
            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-sm"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>

            {/* Rarity Filter */}
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-gray-400" />
              <select
                value={selectedRarity}
                onChange={(e) => setSelectedRarity(e.target.value)}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-sm"
              >
                {rarities.map(rarity => (
                  <option key={rarity.id} value={rarity.id}>{rarity.name}</option>
                ))}
              </select>
            </div>

            {/* View Mode */}
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

            {/* Steam Toggle */}
            <Button
              variant={showSteamOnly ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowSteamOnly(!showSteamOnly)}
            >
              <Gamepad2 className="h-4 w-4 mr-2" />
              Steam Only
            </Button>
          </div>
        </div>

        {/* Achievements Grid */}
        {!showSteamOnly && (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {filteredAchievements.map(renderAchievementCard)}
          </div>
        )}

        {/* Steam Achievements */}
        {showSteamOnly && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Gamepad2 className="h-6 w-6 text-blue-400" />
                Steam Achievements
              </h2>
              <Button
                onClick={fetchSteamAchievements}
                disabled={loadingSteam}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loadingSteam ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
            
            {steamAchievements.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {steamAchievements.map(renderSteamAchievementCard)}
              </div>
            ) : (
              <div className="text-center py-12">
                <Gamepad2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">No Steam achievements</h3>
                <p className="text-gray-400">Connect your Steam account to see your achievements</p>
                <Button className="mt-4" onClick={connectSteamAccount}>
                  <Gamepad2 className="h-4 w-4 mr-2" />
                  Connect Steam
                </Button>
              </div>
            )}
          </div>
        )}

        {filteredAchievements.length === 0 && !showSteamOnly && (
          <div className="text-center py-12">
            <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No achievements found</h3>
            <p className="text-gray-400">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Achievements; 