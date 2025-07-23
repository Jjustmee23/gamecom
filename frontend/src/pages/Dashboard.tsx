import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Gamepad2, 
  Users, 
  Trophy, 
  MessageSquare, 
  TrendingUp, 
  Star,
  Clock,
  Heart,
  Bookmark,
  Activity,
  Award,
  Target
} from 'lucide-react';

interface User {
  id: number;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  role: string;
  level: number;
  xp: number;
  isOnline: boolean;
  lastSeen: string;
  createdAt: string;
}

interface Game {
  id: number;
  name: string;
  coverImage?: string;
  genre?: string;
  platform?: string;
  rating: number;
}

interface UserGame {
  id: number;
  playtime: number;
  isFavorite: boolean;
  isWishlisted: boolean;
  lastPlayed: string;
  game: Game;
}

interface Achievement {
  id: number;
  name: string;
  description: string;
  icon?: string;
  unlockedAt: string;
}

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userGames, setUserGames] = useState<UserGame[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Mock user data since /api/users/profile route doesn't exist
        const mockUser = {
          id: 1,
          username: 'Admin',
          email: 'admin@gamecom.com',
          avatar: undefined,
          bio: 'Gaming enthusiast',
          role: 'admin',
          level: 25,
          xp: 12500,
          isOnline: true,
          lastSeen: new Date().toISOString(),
          createdAt: '2024-01-01T00:00:00Z'
        };

        const mockGames = [
          {
            id: 1,
            playtime: 120,
            isFavorite: true,
            isWishlisted: false,
            lastPlayed: '2024-01-15T10:30:00Z',
            game: {
              id: 1,
              name: 'Cyberpunk 2077',
              coverImage: undefined,
              genre: 'RPG',
              platform: 'PC',
              rating: 4.5
            }
          },
          {
            id: 2,
            playtime: 85,
            isFavorite: false,
            isWishlisted: true,
            lastPlayed: '2024-01-14T15:20:00Z',
            game: {
              id: 2,
              name: 'Elden Ring',
              coverImage: undefined,
              genre: 'Action RPG',
              platform: 'PC',
              rating: 4.8
            }
          }
        ];

        const mockAchievements = [
          {
            id: 1,
            name: 'First Steps',
            description: 'Complete your first game',
            icon: '🎮',
            unlockedAt: '2024-01-10T12:00:00Z'
          },
          {
            id: 2,
            name: 'Social Butterfly',
            description: 'Add 5 friends',
            icon: '👥',
            unlockedAt: '2024-01-12T14:30:00Z'
          }
        ];

        setUser(mockUser);
        setUserGames(mockGames);
        setAchievements(mockAchievements);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">User not found</div>
      </div>
    );
  }

  const totalPlaytime = userGames.reduce((sum, game) => sum + game.playtime, 0);
  const favoriteGames = userGames.filter(game => game.isFavorite);
  const wishlistedGames = userGames.filter(game => game.isWishlisted);
  const recentGames = userGames
    .sort((a, b) => new Date(b.lastPlayed).getTime() - new Date(a.lastPlayed).getTime())
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.username} className="w-16 h-16 rounded-full" />
                ) : (
                  <span className="text-2xl font-bold">{user.username[0].toUpperCase()}</span>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{user.username}</h1>
                <p className="text-gray-300">Level {user.level} • {user.xp} XP</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={user.isOnline ? "default" : "secondary"}>
                {user.isOnline ? "Online" : "Offline"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Games</CardTitle>
              <Gamepad2 className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{userGames.length}</div>
              <p className="text-xs text-gray-400">In your library</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Playtime</CardTitle>
              <Clock className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{Math.round(totalPlaytime / 60)}h</div>
              <p className="text-xs text-gray-400">Total hours played</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Achievements</CardTitle>
              <Trophy className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{achievements.length}</div>
              <p className="text-xs text-gray-400">Unlocked</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Level</CardTitle>
              <Target className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{user.level}</div>
              <p className="text-xs text-gray-400">Current level</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="mr-2 h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Your latest gaming activity</CardDescription>
              </CardHeader>
              <CardContent>
                {recentGames.length > 0 ? (
                  <div className="space-y-4">
                    {recentGames.map((userGame) => (
                      <div key={userGame.id} className="flex items-center space-x-4 p-3 bg-slate-700 rounded-lg">
                        <div className="w-12 h-12 bg-slate-600 rounded flex items-center justify-center">
                          {userGame.game.coverImage ? (
                            <img src={userGame.game.coverImage} alt={userGame.game.name} className="w-12 h-12 rounded" />
                          ) : (
                            <Gamepad2 className="h-6 w-6 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{userGame.game.name}</h4>
                          <p className="text-sm text-gray-400">
                            Last played: {new Date(userGame.lastPlayed).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{Math.round(userGame.playtime / 60)}h</p>
                          <p className="text-xs text-gray-400">played</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Gamepad2 className="mx-auto h-12 w-12 mb-4" />
                    <p>No recent activity</p>
                    <p className="text-sm">Start playing games to see your activity here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
                  <Link to="/games">
                    <Gamepad2 className="mr-2 h-4 w-4" />
                    Browse Games
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full border-slate-600 text-white hover:bg-slate-700">
                  <Link to="/chat">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Open Chat
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full border-slate-600 text-white hover:bg-slate-700">
                  <Link to="/forums">
                    <Users className="mr-2 h-4 w-4" />
                    Visit Forums
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full border-slate-600 text-white hover:bg-slate-700">
                  <Link to="/profile">
                    <Star className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="mr-2 h-5 w-5" />
                  Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                {achievements.length > 0 ? (
                  <div className="space-y-3">
                    {achievements.slice(0, 3).map((achievement) => (
                      <div key={achievement.id} className="flex items-center space-x-3 p-2 bg-slate-700 rounded">
                        <div className="w-8 h-8 bg-yellow-600 rounded flex items-center justify-center">
                          <Trophy className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{achievement.name}</p>
                          <p className="text-xs text-gray-400">{achievement.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-400">
                    <Trophy className="mx-auto h-8 w-8 mb-2" />
                    <p className="text-sm">No achievements yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Favorites */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="mr-2 h-5 w-5" />
                  Favorite Games
                </CardTitle>
              </CardHeader>
              <CardContent>
                {favoriteGames.length > 0 ? (
                  <div className="space-y-2">
                    {favoriteGames.slice(0, 3).map((userGame) => (
                      <div key={userGame.id} className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-slate-600 rounded flex items-center justify-center">
                          <Gamepad2 className="h-3 w-3 text-gray-400" />
                        </div>
                        <span className="text-sm">{userGame.game.name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-400">
                    <Heart className="mx-auto h-8 w-8 mb-2" />
                    <p className="text-sm">No favorite games</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 