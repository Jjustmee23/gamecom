import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Search, 
  Trophy, 
  Gamepad2, 
  Clock, 
  Star,
  UserPlus,
  UserCheck,
  UserX,
  Calendar,
  Award,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

interface User {
  id: number;
  username: string;
  avatar?: string;
  bio?: string;
  level: number;
  xp: number;
  points: number;
  steam_username?: string;
  steam_avatar?: string;
  steam_level?: number;
  last_seen: string;
  created_at: string;
  games_count: number;
  achievements_count: number;
}

interface UserProfile {
  user: User;
  recentGames: Array<{
    id: number;
    name: string;
    header_image?: string;
    playtime: number;
    last_played?: string;
    is_favorite: boolean;
  }>;
  recentAchievements: Array<{
    achievement_name: string;
    achievement_description?: string;
    achievement_icon?: string;
    unlocked_at: string;
    game_name: string;
  }>;
  friendshipStatus?: {
    status: string;
    created_at: string;
  };
}

const WallOfGamers = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('level');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Load users
  const loadUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        sortBy,
        sortOrder
      });

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`/api/users/wall-of-gamers?${params}`);
      const data = await response.json();

      setUsers(data.users);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      toast.error('Failed to load users');
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load user profile
  const loadUserProfile = async (userId: number) => {
    try {
      const response = await fetch(`/api/users/profile/${userId}`);
      const data = await response.json();
      setSelectedUser(data);
      setShowProfileModal(true);
    } catch (error) {
      toast.error('Failed to load user profile');
      console.error('Error loading user profile:', error);
    }
  };

  // Send friend request
  const sendFriendRequest = async (friendId: number) => {
    try {
      const response = await fetch('/api/users/friendship/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendId })
      });

      const data = await response.json();
      toast.success(data.message);
      
      // Refresh user profile to update friendship status
      if (selectedUser) {
        loadUserProfile(selectedUser.user.id);
      }
    } catch (error) {
      toast.error('Failed to send friend request');
      console.error('Error sending friend request:', error);
    }
  };

  // Accept friend request
  const acceptFriendRequest = async (friendId: number) => {
    try {
      const response = await fetch('/api/users/friendship/accept', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendId })
      });

      const data = await response.json();
      toast.success(data.message);
      
      if (selectedUser) {
        loadUserProfile(selectedUser.user.id);
      }
    } catch (error) {
      toast.error('Failed to accept friend request');
      console.error('Error accepting friend request:', error);
    }
  };

  // Reject friend request
  const rejectFriendRequest = async (friendId: number) => {
    try {
      const response = await fetch('/api/users/friendship/reject', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendId })
      });

      const data = await response.json();
      toast.success(data.message);
      
      if (selectedUser) {
        loadUserProfile(selectedUser.user.id);
      }
    } catch (error) {
      toast.error('Failed to reject friend request');
      console.error('Error rejecting friend request:', error);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [currentPage, searchTerm, sortBy, sortOrder]);

  const getFriendshipButton = (user: User, friendshipStatus?: any) => {
    if (!currentUser || currentUser.id === user.id) {
      return null;
    }

    if (!friendshipStatus) {
      return (
        <Button
          size="sm"
          onClick={() => sendFriendRequest(user.id)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add Friend
        </Button>
      );
    }

    if (friendshipStatus.status === 'pending') {
      if (friendshipStatus.user_id === currentUser.id) {
        return (
          <Badge variant="outline" className="bg-yellow-600 text-white">
            Request Sent
          </Badge>
        );
      } else {
        return (
          <div className="flex space-x-2">
            <Button
              size="sm"
              onClick={() => acceptFriendRequest(user.id)}
              className="bg-green-600 hover:bg-green-700"
            >
              <UserCheck className="h-4 w-4 mr-2" />
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => rejectFriendRequest(user.id)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <UserX className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </div>
        );
      }
    }

    if (friendshipStatus.status === 'accepted') {
      return (
        <Badge variant="outline" className="bg-green-600 text-white">
          <UserCheck className="h-4 w-4 mr-2" />
          Friends
        </Badge>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Wall of Gamers</h1>
          <p className="text-gray-400 mt-1">Discover and connect with fellow gamers</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-blue-600 text-white">
            {users.length} Gamers
          </Badge>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search gamers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-gray-400"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white rounded-md px-3 py-2"
            >
              <option value="level">Level</option>
              <option value="xp">XP</option>
              <option value="points">Points</option>
              <option value="username">Username</option>
              <option value="last_seen">Last Seen</option>
            </select>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white rounded-md px-3 py-2"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Users Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <Card 
              key={user.id} 
              className="bg-slate-800 border-slate-700 hover:bg-slate-700 transition-colors cursor-pointer"
              onClick={() => loadUserProfile(user.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                      {user.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt={user.username}
                          className="w-16 h-16 rounded-full"
                        />
                      ) : (
                        <Users className="w-8 h-8 text-primary-foreground" />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-white truncate">
                        {user.username}
                      </h3>
                      <Badge variant="outline" className="bg-purple-600 text-white">
                        Lv {user.level}
                      </Badge>
                    </div>
                    
                    {user.bio && (
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                        {user.bio}
                      </p>
                    )}
                    
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="flex items-center text-sm text-gray-400">
                        <Gamepad2 className="h-4 w-4 mr-1" />
                        {user.games_count} games
                      </div>
                      <div className="flex items-center text-sm text-gray-400">
                        <Trophy className="h-4 w-4 mr-1" />
                        {user.achievements_count} achievements
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(user.last_seen).toLocaleDateString()}
                      </div>
                      
                      {getFriendshipButton(user)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
          >
            Previous
          </Button>
          <span className="text-white">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
          >
            Next
          </Button>
        </div>
      )}

      {/* User Profile Modal */}
      {showProfileModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center">
                    {selectedUser.user.avatar ? (
                      <img 
                        src={selectedUser.user.avatar} 
                        alt={selectedUser.user.username}
                        className="w-20 h-20 rounded-full"
                      />
                    ) : (
                      <Users className="w-10 h-10 text-primary-foreground" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {selectedUser.user.username}
                    </h2>
                    <div className="flex items-center space-x-4 text-gray-400">
                      <span>Level {selectedUser.user.level}</span>
                      <span>{selectedUser.user.points} points</span>
                      <span>{selectedUser.user.xp} XP</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {getFriendshipButton(selectedUser.user, selectedUser.friendshipStatus)}
                  <Button
                    variant="outline"
                    onClick={() => setShowProfileModal(false)}
                    className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                  >
                    ×
                  </Button>
                </div>
              </div>

              {/* Bio */}
              {selectedUser.user.bio && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-2">Bio</h3>
                  <p className="text-gray-300">{selectedUser.user.bio}</p>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-white">{selectedUser.user.games_count}</div>
                  <div className="text-sm text-gray-400">Games</div>
                </div>
                <div className="bg-slate-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-white">{selectedUser.user.achievements_count}</div>
                  <div className="text-sm text-gray-400">Achievements</div>
                </div>
                <div className="bg-slate-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-white">{selectedUser.user.level}</div>
                  <div className="text-sm text-gray-400">Level</div>
                </div>
                <div className="bg-slate-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-white">{selectedUser.user.points}</div>
                  <div className="text-sm text-gray-400">Points</div>
                </div>
              </div>

              {/* Recent Games */}
              {selectedUser.recentGames.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Recent Games</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedUser.recentGames.map((game) => (
                      <div key={game.id} className="bg-slate-700 rounded-lg p-3">
                        {game.header_image && (
                          <img 
                            src={game.header_image} 
                            alt={game.name}
                            className="w-full h-20 object-cover rounded mb-2"
                          />
                        )}
                        <div className="text-sm font-medium text-white truncate">{game.name}</div>
                        <div className="text-xs text-gray-400">{game.playtime}h played</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Achievements */}
              {selectedUser.recentAchievements.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Recent Achievements</h3>
                  <div className="space-y-2">
                    {selectedUser.recentAchievements.map((achievement, index) => (
                      <div key={index} className="bg-slate-700 rounded-lg p-3">
                        <div className="flex items-center space-x-3">
                          <Award className="h-5 w-5 text-yellow-500" />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-white">{achievement.achievement_name}</div>
                            <div className="text-xs text-gray-400">{achievement.game_name}</div>
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(achievement.unlocked_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Member Since */}
              <div className="text-center text-gray-400 text-sm">
                Member since {new Date(selectedUser.user.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WallOfGamers; 