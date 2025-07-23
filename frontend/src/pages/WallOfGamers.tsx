import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users,
  Search,
  Filter,
  UserPlus,
  UserCheck,
  UserX,
  Crown,
  Trophy,
  Gamepad2,
  Star,
  Heart,
  MessageSquare,
  Eye,
  EyeOff,
  Settings,
  Shield,
  Lock,
  Unlock,
  Calendar,
  MapPin,
  Globe,
  Award,
  TrendingUp,
  Activity,
  Zap,
  Flame,
  Target,
  Medal,
  Bookmark,
  Share2,
  MoreVertical
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

interface GamerProfile {
  id: string;
  username: string;
  avatar?: string;
  bio?: string;
  location?: string;
  joinDate: Date;
  level: number;
  totalXP: number;
  achievements: number;
  gamesPlayed: number;
  friendsCount: number;
  isOnline: boolean;
  lastSeen?: Date;
  isPublic: boolean;
  privacySettings: {
    showLevel: boolean;
    showAchievements: boolean;
    showGames: boolean;
    showFriends: boolean;
    showLocation: boolean;
    showJoinDate: boolean;
    allowFriendRequests: boolean;
    allowMessages: boolean;
  };
  favoriteGames: string[];
  badges: string[];
  isFriend: boolean;
  friendRequestSent: boolean;
  friendRequestReceived: boolean;
}

const WallOfGamers: React.FC = () => {
  const { user } = useAuth();
  const [gamers, setGamers] = useState<GamerProfile[]>([]);
  const [filteredGamers, setFilteredGamers] = useState<GamerProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('level');
  const [loading, setLoading] = useState(true);
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);

  const filters = [
    { id: 'all', name: 'All Gamers', icon: Users },
    { id: 'online', name: 'Online Now', icon: Activity },
    { id: 'friends', name: 'My Friends', icon: UserCheck },
    { id: 'new', name: 'New Members', icon: Calendar },
    { id: 'top', name: 'Top Players', icon: Crown }
  ];

  const sortOptions = [
    { id: 'level', name: 'Level' },
    { id: 'achievements', name: 'Achievements' },
    { id: 'games', name: 'Games Played' },
    { id: 'friends', name: 'Friends' },
    { id: 'joinDate', name: 'Join Date' }
  ];

  useEffect(() => {
    fetchGamers();
  }, []);

  useEffect(() => {
    filterAndSortGamers();
  }, [gamers, searchQuery, selectedFilter, sortBy]);

  const fetchGamers = async () => {
    try {
      setLoading(true);
      
      // Mock data
      const mockGamers: GamerProfile[] = [
        {
          id: '1',
          username: 'GamerPro123',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=GamerPro123',
          bio: 'Professional gamer and streamer. Love competitive games!',
          location: 'Amsterdam, Netherlands',
          joinDate: new Date('2023-01-15'),
          level: 85,
          totalXP: 125000,
          achievements: 342,
          gamesPlayed: 156,
          friendsCount: 89,
          isOnline: true,
          isPublic: true,
          privacySettings: {
            showLevel: true,
            showAchievements: true,
            showGames: true,
            showFriends: true,
            showLocation: true,
            showJoinDate: true,
            allowFriendRequests: true,
            allowMessages: true
          },
          favoriteGames: ['Cyberpunk 2077', 'Elden Ring', 'Valorant'],
          badges: ['Pro Gamer', 'Achievement Hunter', 'Community Helper'],
          isFriend: false,
          friendRequestSent: false,
          friendRequestReceived: false
        },
        {
          id: '2',
          username: 'SteamMaster',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SteamMaster',
          bio: 'Steam enthusiast with 500+ games in library',
          location: 'Rotterdam, Netherlands',
          joinDate: new Date('2022-08-20'),
          level: 67,
          totalXP: 89000,
          achievements: 289,
          gamesPlayed: 234,
          friendsCount: 156,
          isOnline: true,
          isPublic: true,
          privacySettings: {
            showLevel: true,
            showAchievements: true,
            showGames: true,
            showFriends: true,
            showLocation: true,
            showJoinDate: true,
            allowFriendRequests: true,
            allowMessages: false
          },
          favoriteGames: ['Steam Games', 'Indie Games', 'RPGs'],
          badges: ['Steam Veteran', 'Game Collector', 'Indie Lover'],
          isFriend: true,
          friendRequestSent: false,
          friendRequestReceived: false
        },
        {
          id: '3',
          username: 'ConsoleKing',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ConsoleKing',
          bio: 'Console gaming expert. PS5 and Xbox Series X owner.',
          location: 'Utrecht, Netherlands',
          joinDate: new Date('2023-03-10'),
          level: 45,
          totalXP: 67000,
          achievements: 198,
          gamesPlayed: 89,
          friendsCount: 34,
          isOnline: false,
          lastSeen: new Date(Date.now() - 3600000),
          isPublic: true,
          privacySettings: {
            showLevel: true,
            showAchievements: true,
            showGames: true,
            showFriends: false,
            showLocation: true,
            showJoinDate: false,
            allowFriendRequests: true,
            allowMessages: true
          },
          favoriteGames: ['God of War', 'Halo', 'Spider-Man'],
          badges: ['Console Master', 'Trophy Hunter'],
          isFriend: false,
          friendRequestSent: true,
          friendRequestReceived: false
        },
        {
          id: '4',
          username: 'PCGamer',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PCGamer',
          bio: 'PC gaming enthusiast. Building custom rigs and playing at 1440p.',
          location: 'Eindhoven, Netherlands',
          joinDate: new Date('2022-12-05'),
          level: 92,
          totalXP: 145000,
          achievements: 456,
          gamesPlayed: 312,
          friendsCount: 203,
          isOnline: true,
          isPublic: false,
          privacySettings: {
            showLevel: false,
            showAchievements: false,
            showGames: false,
            showFriends: false,
            showLocation: false,
            showJoinDate: false,
            allowFriendRequests: false,
            allowMessages: false
          },
          favoriteGames: ['PC Exclusives', 'FPS Games', 'Strategy'],
          badges: ['PC Master', 'FPS Pro', 'Strategy Expert'],
          isFriend: false,
          friendRequestSent: false,
          friendRequestReceived: false
        }
      ];

      setGamers(mockGamers);
    } catch (error) {
      console.error('Error fetching gamers:', error);
      toast.error('Failed to load gamers');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortGamers = () => {
    let filtered = gamers.filter(gamer => {
      const matchesSearch = gamer.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           gamer.bio?.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchesSearch) return false;
      
      switch (selectedFilter) {
        case 'online':
          return gamer.isOnline;
        case 'friends':
          return gamer.isFriend;
        case 'new':
          const oneMonthAgo = new Date();
          oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
          return gamer.joinDate > oneMonthAgo;
        case 'top':
          return gamer.level >= 50;
        default:
          return true;
      }
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'level':
          return b.level - a.level;
        case 'achievements':
          return b.achievements - a.achievements;
        case 'games':
          return b.gamesPlayed - a.gamesPlayed;
        case 'friends':
          return b.friendsCount - a.friendsCount;
        case 'joinDate':
          return b.joinDate.getTime() - a.joinDate.getTime();
        default:
          return 0;
      }
    });

    setFilteredGamers(filtered);
  };

  const sendFriendRequest = (gamerId: string) => {
    setGamers(prev => 
      prev.map(gamer => 
        gamer.id === gamerId 
          ? { ...gamer, friendRequestSent: true }
          : gamer
      )
    );
    toast.success('Friend request sent!');
  };

  const acceptFriendRequest = (gamerId: string) => {
    setGamers(prev => 
      prev.map(gamer => 
        gamer.id === gamerId 
          ? { ...gamer, isFriend: true, friendRequestReceived: false }
          : gamer
      )
    );
    toast.success('Friend request accepted!');
  };

  const declineFriendRequest = (gamerId: string) => {
    setGamers(prev => 
      prev.map(gamer => 
        gamer.id === gamerId 
          ? { ...gamer, friendRequestReceived: false }
          : gamer
      )
    );
    toast.success('Friend request declined');
  };

  const removeFriend = (gamerId: string) => {
    setGamers(prev => 
      prev.map(gamer => 
        gamer.id === gamerId 
          ? { ...gamer, isFriend: false }
          : gamer
      )
    );
    toast.success('Friend removed');
  };

  const getStatusColor = (isOnline: boolean) => {
    return isOnline ? 'bg-green-500' : 'bg-gray-500';
  };

  const getLevelColor = (level: number) => {
    if (level >= 80) return 'text-purple-400';
    if (level >= 60) return 'text-blue-400';
    if (level >= 40) return 'text-green-400';
    if (level >= 20) return 'text-yellow-400';
    return 'text-gray-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading gamers...</div>
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
                <Users className="h-8 w-8 text-purple-400" />
                Wall of Gamers
              </h1>
              <p className="text-gray-300">Discover and connect with fellow gamers</p>
            </div>
            <Button
              onClick={() => setShowPrivacySettings(!showPrivacySettings)}
              variant="outline"
              className="border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white"
            >
              <Settings className="h-4 w-4 mr-2" />
              Privacy Settings
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters and Search */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search gamers by username or bio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-gray-400"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            {filters.map(filter => {
              const Icon = filter.icon;
              return (
                <Button
                  key={filter.id}
                  variant={selectedFilter === filter.id ? 'default' : 'outline'}
                  onClick={() => setSelectedFilter(filter.id)}
                  className="border-slate-600 text-white hover:bg-slate-700"
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {filter.name}
                </Button>
              );
            })}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1 bg-slate-800 border border-slate-700 rounded text-sm"
            >
              {sortOptions.map(option => (
                <option key={option.id} value={option.id}>{option.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Gamers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredGamers.map(gamer => (
            <Card key={gamer.id} className="bg-slate-800 border-slate-700 hover:bg-slate-750 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={gamer.avatar} />
                        <AvatarFallback className="bg-slate-600 text-white">
                          {gamer.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-800 ${getStatusColor(gamer.isOnline)}`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-white">{gamer.username}</CardTitle>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${getLevelColor(gamer.level)}`}>
                          Level {gamer.level}
                        </span>
                        {!gamer.isPublic && (
                          <Lock className="h-3 w-3 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {gamer.friendRequestReceived ? (
                      <>
                        <Button
                          size="sm"
                          onClick={() => acceptFriendRequest(gamer.id)}
                          className="h-6 w-6 p-0 bg-green-600 hover:bg-green-700"
                        >
                          <UserCheck className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => declineFriendRequest(gamer.id)}
                          className="h-6 w-6 p-0 border-red-600 text-red-400 hover:bg-red-600"
                        >
                          <UserX className="h-3 w-3" />
                        </Button>
                      </>
                    ) : gamer.isFriend ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeFriend(gamer.id)}
                        className="h-6 w-6 p-0 border-red-600 text-red-400 hover:bg-red-600"
                      >
                        <UserX className="h-3 w-3" />
                      </Button>
                    ) : gamer.friendRequestSent ? (
                      <Badge variant="secondary" className="text-xs">
                        Request Sent
                      </Badge>
                    ) : gamer.privacySettings.allowFriendRequests ? (
                      <Button
                        size="sm"
                        onClick={() => sendFriendRequest(gamer.id)}
                        className="h-6 w-6 p-0 bg-blue-600 hover:bg-blue-700"
                      >
                        <UserPlus className="h-3 w-3" />
                      </Button>
                    ) : null}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {/* Bio */}
                {gamer.bio && (
                  <p className="text-sm text-gray-300 line-clamp-2">{gamer.bio}</p>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {gamer.privacySettings.showAchievements && (
                    <div className="flex items-center gap-1">
                      <Trophy className="h-3 w-3 text-yellow-400" />
                      <span className="text-gray-400">{gamer.achievements} achievements</span>
                    </div>
                  )}
                  {gamer.privacySettings.showGames && (
                    <div className="flex items-center gap-1">
                      <Gamepad2 className="h-3 w-3 text-blue-400" />
                      <span className="text-gray-400">{gamer.gamesPlayed} games</span>
                    </div>
                  )}
                  {gamer.privacySettings.showFriends && (
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-green-400" />
                      <span className="text-gray-400">{gamer.friendsCount} friends</span>
                    </div>
                  )}
                  {gamer.privacySettings.showLocation && gamer.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-red-400" />
                      <span className="text-gray-400">{gamer.location}</span>
                    </div>
                  )}
                </div>

                {/* Favorite Games */}
                {gamer.favoriteGames.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Favorite Games:</p>
                    <div className="flex flex-wrap gap-1">
                      {gamer.favoriteGames.slice(0, 2).map((game, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {game}
                        </Badge>
                      ))}
                      {gamer.favoriteGames.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{gamer.favoriteGames.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Badges */}
                {gamer.badges.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Badges:</p>
                    <div className="flex flex-wrap gap-1">
                      {gamer.badges.slice(0, 2).map((badge, index) => (
                        <Badge key={index} className="text-xs bg-purple-600">
                          {badge}
                        </Badge>
                      ))}
                      {gamer.badges.length > 2 && (
                        <Badge className="text-xs bg-purple-600">
                          +{gamer.badges.length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-700">
                  {gamer.privacySettings.allowMessages && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 border-slate-600 text-white hover:bg-slate-700"
                    >
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Message
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-slate-600 text-white hover:bg-slate-700"
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredGamers.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No gamers found</h3>
            <p className="text-gray-400">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WallOfGamers; 