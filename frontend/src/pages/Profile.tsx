import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User,
  Edit,
  Save,
  X,
  Camera,
  Mail,
  Phone,
  MapPin,
  Globe,
  Calendar,
  Gamepad2,
  Trophy,
  Users,
  Settings,
  Shield,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Heart,
  Star,
  Award,
  Crown,
  Zap,
  Flame,
  Target,
  Medal,
  Bookmark,
  Share2,
  MoreVertical,
  Plus,
  Trash2,
  Upload,
  Download,
  Link,
  ExternalLink,
  Check,
  X as XIcon
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  location?: string;
  website?: string;
  phone?: string;
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
    showEmail: boolean;
    showPhone: boolean;
    showWebsite: boolean;
    showDateOfBirth: boolean;
    allowFriendRequests: boolean;
    allowMessages: boolean;
    showOnlineStatus: boolean;
  };
  favoriteGames: string[];
  badges: string[];
  socialLinks: {
    steam?: string;
    discord?: string;
    twitter?: string;
    twitch?: string;
    youtube?: string;
    instagram?: string;
  };
  gamingStats: {
    totalPlaytime: number;
    favoriteGenre: string;
    currentGame?: string;
    steamId?: string;
    epicId?: string;
    psnId?: string;
    xboxId?: string;
    nintendoId?: string;
  };
  preferences: {
    theme: 'dark' | 'light' | 'auto';
    language: string;
    timezone: string;
    notifications: {
      email: boolean;
      push: boolean;
      friendRequests: boolean;
      messages: boolean;
      achievements: boolean;
      gameUpdates: boolean;
    };
  };
}

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', name: 'Overview', icon: User },
    { id: 'gaming', name: 'Gaming', icon: Gamepad2 },
    { id: 'social', name: 'Social', icon: Users },
    { id: 'privacy', name: 'Privacy', icon: Shield },
    { id: 'preferences', name: 'Preferences', icon: Settings }
  ];

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      
      // Mock profile data
      const mockProfile: UserProfile = {
        id: id || user?.id || '1',
        username: 'GamerPro123',
        email: 'gamer@example.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=GamerPro123',
        bio: 'Professional gamer and streamer. Love competitive games and building communities!',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1995-03-15',
        location: 'Amsterdam, Netherlands',
        website: 'https://gamerpro.com',
        phone: '+31 6 12345678',
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
          showEmail: false,
          showPhone: false,
          showWebsite: true,
          showDateOfBirth: false,
          allowFriendRequests: true,
          allowMessages: true,
          showOnlineStatus: true
        },
        favoriteGames: ['Cyberpunk 2077', 'Elden Ring', 'Valorant', 'League of Legends'],
        badges: ['Pro Gamer', 'Achievement Hunter', 'Community Helper', 'Streamer'],
        socialLinks: {
          steam: 'steamcommunity.com/id/gamerpro123',
          discord: 'GamerPro#1234',
          twitter: '@gamerpro123',
          twitch: 'twitch.tv/gamerpro123',
          youtube: 'youtube.com/@gamerpro123'
        },
        gamingStats: {
          totalPlaytime: 2500,
          favoriteGenre: 'RPG',
          currentGame: 'Cyberpunk 2077',
          steamId: '76561198123456789',
          epicId: 'epic_gamer_123',
          psnId: 'GamerPro_PSN',
          xboxId: 'GamerPro Xbox'
        },
        preferences: {
          theme: 'dark',
          language: 'English',
          timezone: 'Europe/Amsterdam',
          notifications: {
            email: true,
            push: true,
            friendRequests: true,
            messages: true,
            achievements: true,
            gameUpdates: true
          }
        }
      };

      setProfile(mockProfile);
      setIsOwnProfile(id === user?.id || !id);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      // Save profile logic here
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    fetchProfile(); // Reset to original data
  };

  const updateProfile = (field: string, value: any) => {
    if (!profile) return;
    setProfile(prev => prev ? { ...prev, [field]: value } : null);
  };

  const updatePrivacySetting = (setting: string, value: boolean) => {
    if (!profile) return;
    setProfile(prev => prev ? {
      ...prev,
      privacySettings: {
        ...prev.privacySettings,
        [setting]: value
      }
    } : null);
  };

  const updatePreference = (category: string, setting: string, value: any) => {
    if (!profile) return;
    setProfile(prev => prev ? {
      ...prev,
      preferences: {
        ...prev.preferences,
        [category]: {
          ...prev.preferences[category as keyof typeof prev.preferences],
          [setting]: value
        }
      }
    } : null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Profile not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile.avatar} />
                <AvatarFallback className="bg-slate-600 text-white text-xl">
                  {profile.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
      <div>
                <h1 className="text-3xl font-bold">{profile.username}</h1>
                <p className="text-gray-300">Level {profile.level} • {profile.achievements} achievements</p>
              </div>
            </div>
            
            {isOwnProfile && (
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button onClick={handleCancel} variant="outline" className="border-slate-600 text-white hover:bg-slate-700">
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)} className="bg-purple-600 hover:bg-purple-700">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex items-center gap-1 mb-8 bg-slate-800 rounded-lg p-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Basic Info */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <>
                      <div>
                        <label className="text-sm font-medium text-gray-300">Username</label>
                        <Input
                          value={profile.username}
                          onChange={(e) => updateProfile('username', e.target.value)}
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-300">First Name</label>
                        <Input
                          value={profile.firstName || ''}
                          onChange={(e) => updateProfile('firstName', e.target.value)}
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-300">Last Name</label>
                        <Input
                          value={profile.lastName || ''}
                          onChange={(e) => updateProfile('lastName', e.target.value)}
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-300">Bio</label>
                        <Textarea
                          value={profile.bio || ''}
                          onChange={(e) => updateProfile('bio', e.target.value)}
                          className="bg-slate-700 border-slate-600 text-white"
                          rows={3}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-300">{profile.username}</span>
                      </div>
                      {profile.firstName && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-300">{profile.firstName} {profile.lastName}</span>
                        </div>
                      )}
                      {profile.bio && (
                        <p className="text-sm text-gray-300">{profile.bio}</p>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Contact Info */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <>
                      <div>
                        <label className="text-sm font-medium text-gray-300">Email</label>
                        <Input
                          value={profile.email}
                          onChange={(e) => updateProfile('email', e.target.value)}
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-300">Phone</label>
                        <Input
                          value={profile.phone || ''}
                          onChange={(e) => updateProfile('phone', e.target.value)}
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-300">Website</label>
                        <Input
                          value={profile.website || ''}
                          onChange={(e) => updateProfile('website', e.target.value)}
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-300">{profile.email}</span>
                      </div>
                      {profile.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-300">{profile.phone}</span>
                        </div>
                      )}
                      {profile.website && (
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-gray-400" />
                          <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline">
                            {profile.website}
                          </a>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Stats */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">{profile.level}</div>
                      <div className="text-xs text-gray-400">Level</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-400">{profile.achievements}</div>
                      <div className="text-xs text-gray-400">Achievements</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">{profile.gamesPlayed}</div>
                      <div className="text-xs text-gray-400">Games</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">{profile.friendsCount}</div>
                      <div className="text-xs text-gray-400">Friends</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'gaming' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gaming Stats */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gamepad2 className="h-5 w-5" />
                    Gaming Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <>
                      <div>
                        <label className="text-sm font-medium text-gray-300">Steam ID</label>
                        <Input
                          value={profile.gamingStats.steamId || ''}
                          onChange={(e) => updateProfile('gamingStats', { ...profile.gamingStats, steamId: e.target.value })}
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-300">Epic ID</label>
                        <Input
                          value={profile.gamingStats.epicId || ''}
                          onChange={(e) => updateProfile('gamingStats', { ...profile.gamingStats, epicId: e.target.value })}
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-300">PSN ID</label>
                        <Input
                          value={profile.gamingStats.psnId || ''}
                          onChange={(e) => updateProfile('gamingStats', { ...profile.gamingStats, psnId: e.target.value })}
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-300">Xbox ID</label>
                        <Input
                          value={profile.gamingStats.xboxId || ''}
                          onChange={(e) => updateProfile('gamingStats', { ...profile.gamingStats, xboxId: e.target.value })}
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">Total Playtime</span>
                        <span className="text-sm font-medium">{profile.gamingStats.totalPlaytime} hours</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">Favorite Genre</span>
                        <span className="text-sm font-medium">{profile.gamingStats.favoriteGenre}</span>
                      </div>
                      {profile.gamingStats.currentGame && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-300">Currently Playing</span>
                          <span className="text-sm font-medium">{profile.gamingStats.currentGame}</span>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Favorite Games */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Favorite Games
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profile.favoriteGames.map((game, index) => (
                      <Badge key={index} variant="outline" className="text-sm">
                        {game}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'privacy' && (
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Privacy Settings
                </CardTitle>
                <CardDescription>
                  Control what information is visible to other users
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(profile.privacySettings).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-white">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </p>
                        <p className="text-xs text-gray-400">
                          {value ? 'Visible to others' : 'Private'}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updatePrivacySetting(key, !value)}
                        className={value ? 'text-green-400' : 'text-gray-400'}
                      >
                        {value ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'preferences' && (
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Notifications */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Notifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(profile.preferences.notifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                        <span className="text-sm text-white">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updatePreference('notifications', key, !value)}
                          className={value ? 'text-green-400' : 'text-gray-400'}
                        >
                          {value ? <Check className="h-4 w-4" /> : <XIcon className="h-4 w-4" />}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile; 