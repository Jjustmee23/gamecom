import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Users, 
  Gamepad2, 
  Database, 
  RefreshCw, 
  Trash2, 
  RotateCcw,
  Search,
  Filter,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  HardDrive,
  Network,
  Shield,
  Eye,
  EyeOff,
  ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Game {
  id: number;
  steam_id?: number;
  name: string;
  description?: string;
  short_description?: string;
  header_image?: string;
  background_image?: string;
  release_date?: string;
  metacritic_score?: number;
  achievements_count?: number;
  recommendations_total?: number;
  is_free?: boolean;
  price_final_formatted?: string;
  developers?: string[];
  publishers?: string[];
  genres?: string[];
  platforms?: any;
  last_updated?: string;
  created_at?: string;
  deleted_at?: string;
  is_deleted?: boolean;
}

interface ManagementStats {
  overview: {
    total_games: number;
    active_games: number;
    deleted_games: number;
    steam_games: number;
    manual_games: number;
    recently_updated: number;
    needs_update: number;
    avg_age_hours: number;
  };
  topGenres: Array<{ genre: string; count: number }>;
  platforms: Array<{ platform: string; count: number }>;
}

interface CacheStatus {
  cache: {
    total_entries: number;
    total_fetches: number;
    total_errors: number;
    avg_fetches_per_game: number;
    last_fetch_time: string;
    games_with_errors: number;
  };
  recentErrors: Array<{
    steam_id: number;
    last_error: string;
    last_fetched: string;
    error_count: number;
  }>;
  expiredGames: Array<{
    steam_id: number;
    name: string;
    last_updated: string;
  }>;
}

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [games, setGames] = useState<Game[]>([]);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedGames, setSelectedGames] = useState<number[]>([]);
  const [managementStats, setManagementStats] = useState<ManagementStats | null>(null);
  const [cacheStatus, setCacheStatus] = useState<CacheStatus | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showSortByDropdown, setShowSortByDropdown] = useState(false);
  const [showSortOrderDropdown, setShowSortOrderDropdown] = useState(false);

  // Load games
  const loadGames = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        includeDeleted: includeDeleted.toString(),
        sortBy,
        sortOrder
      });

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`/api/games?${params}`);
      const data = await response.json();

      setGames(data.games);
      setFilteredGames(data.games);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      toast.error('Failed to load games');
      console.error('Error loading games:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load management stats
  const loadManagementStats = async () => {
    try {
      const response = await fetch('/api/games/stats/management');
      const data = await response.json();
      setManagementStats(data);
    } catch (error) {
      console.error('Error loading management stats:', error);
    }
  };

  // Load cache status
  const loadCacheStatus = async () => {
    try {
      const response = await fetch('/api/games/cache/status');
      const data = await response.json();
      setCacheStatus(data);
    } catch (error) {
      console.error('Error loading cache status:', error);
    }
  };

  // Bulk operations
  const performBulkOperation = async (action: string) => {
    if (selectedGames.length === 0) {
      toast.error('Please select games first');
      return;
    }

    try {
      const response = await fetch('/api/games/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, gameIds: selectedGames })
      });

      const data = await response.json();
      toast.success(data.message);
      setSelectedGames([]);
      loadGames();
      loadManagementStats();
    } catch (error) {
      toast.error('Failed to perform bulk operation');
      console.error('Error performing bulk operation:', error);
    }
  };

  // Refresh expired games
  const refreshExpiredGames = async () => {
    try {
      const response = await fetch('/api/games/cache/refresh-expired', {
        method: 'POST'
      });
      const data = await response.json();
      toast.success(data.message);
      loadCacheStatus();
      loadGames();
    } catch (error) {
      toast.error('Failed to refresh expired games');
      console.error('Error refreshing expired games:', error);
    }
  };

  // Toggle game selection
  const toggleGameSelection = (gameId: number) => {
    setSelectedGames(prev => 
      prev.includes(gameId) 
        ? prev.filter(id => id !== gameId)
        : [...prev, gameId]
    );
  };

  // Select all games
  const selectAllGames = () => {
    setSelectedGames(games.map(game => game.id));
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedGames([]);
  };

  useEffect(() => {
    loadGames();
    loadManagementStats();
    loadCacheStatus();
  }, [currentPage, includeDeleted, sortBy, sortOrder, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
      <div>
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400 mt-1">Manage your gaming platform</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-green-600 text-white">
            Admin Access
          </Badge>
        </div>
      </div>
      
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="games" className="flex items-center space-x-2">
            <Gamepad2 className="h-4 w-4" />
            <span>Games Management</span>
          </TabsTrigger>
          <TabsTrigger value="cache" className="flex items-center space-x-2">
            <Database className="h-4 w-4" />
            <span>Cache Status</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>User Management</span>
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {managementStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Total Games</CardTitle>
                  <Gamepad2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{managementStats.overview.total_games}</div>
                  <p className="text-xs text-muted-foreground">
                    {managementStats.overview.active_games} active, {managementStats.overview.deleted_games} deleted
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Steam Games</CardTitle>
                  <Network className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{managementStats.overview.steam_games}</div>
                  <p className="text-xs text-muted-foreground">
                    {managementStats.overview.manual_games} manual entries
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Cache Status</CardTitle>
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{managementStats.overview.recently_updated}</div>
                  <p className="text-xs text-muted-foreground">
                    {managementStats.overview.needs_update} need update
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Avg Age</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {Math.round(managementStats.overview.avg_age_hours || 0)}h
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Since last update
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Top Genres */}
          {managementStats && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Top Genres</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {managementStats.topGenres.map((genre, index) => (
                      <div key={genre.genre} className="flex items-center justify-between">
                        <span className="text-gray-300">{genre.genre}</span>
                        <Badge variant="outline">{genre.count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Platforms</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {managementStats.platforms.map((platform, index) => (
                      <div key={platform.platform} className="flex items-center justify-between">
                        <span className="text-gray-300 capitalize">{platform.platform}</span>
                        <Badge variant="outline">{platform.count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Games Management Tab */}
        <TabsContent value="games" className="space-y-6">
          {/* Filters and Actions */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Games Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search and Filters */}
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

                {/* Sort By Dropdown */}
                <div className="relative">
                  <Button
                    variant="outline"
                    onClick={() => setShowSortByDropdown(!showSortByDropdown)}
                    className="w-full justify-between bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                  >
                    {sortBy === 'name' ? 'Name' : 
                     sortBy === 'release_date' ? 'Release Date' :
                     sortBy === 'metacritic_score' ? 'Metacritic Score' :
                     sortBy === 'achievements_count' ? 'Achievements' :
                     sortBy === 'last_updated' ? 'Last Updated' : 'Name'}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  {showSortByDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-slate-700 border border-slate-600 rounded-md shadow-lg">
                      <div className="py-1">
                        {[
                          { value: 'name', label: 'Name' },
                          { value: 'release_date', label: 'Release Date' },
                          { value: 'metacritic_score', label: 'Metacritic Score' },
                          { value: 'achievements_count', label: 'Achievements' },
                          { value: 'last_updated', label: 'Last Updated' }
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              setSortBy(option.value);
                              setShowSortByDropdown(false);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-slate-600"
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Sort Order Dropdown */}
                <div className="relative">
                  <Button
                    variant="outline"
                    onClick={() => setShowSortOrderDropdown(!showSortOrderDropdown)}
                    className="w-full justify-between bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                  >
                    {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  {showSortOrderDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-slate-700 border border-slate-600 rounded-md shadow-lg">
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setSortOrder('asc');
                            setShowSortOrderDropdown(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-slate-600"
                        >
                          Ascending
                        </button>
                        <button
                          onClick={() => {
                            setSortOrder('desc');
                            setShowSortOrderDropdown(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-slate-600"
                        >
                          Descending
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeDeleted"
                    checked={includeDeleted}
                    onCheckedChange={(checked) => setIncludeDeleted(checked as boolean)}
                  />
                  <label htmlFor="includeDeleted" className="text-sm text-gray-300">
                    Include Deleted
                  </label>
                </div>
              </div>

              {/* Bulk Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selectAllGames}
                    className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                  >
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearSelection}
                    className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                  >
                    Clear Selection
                  </Button>
                  {selectedGames.length > 0 && (
                    <Badge variant="outline" className="bg-blue-600 text-white">
                      {selectedGames.length} selected
                    </Badge>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => performBulkOperation('refresh')}
                    disabled={selectedGames.length === 0}
                    className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Selected
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => performBulkOperation('delete')}
                    disabled={selectedGames.length === 0}
                    className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Selected
                  </Button>
                  {includeDeleted && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => performBulkOperation('restore')}
                      disabled={selectedGames.length === 0}
                      className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Restore Selected
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Games List */}
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-700">
                      <tr>
                        <th className="px-4 py-3 text-left">
                          <Checkbox
                            checked={selectedGames.length === games.length && games.length > 0}
                            onCheckedChange={(checked) => checked ? selectAllGames() : clearSelection()}
                          />
                        </th>
                        <th className="px-4 py-3 text-left text-white">Game</th>
                        <th className="px-4 py-3 text-left text-white">Steam ID</th>
                        <th className="px-4 py-3 text-left text-white">Metacritic</th>
                        <th className="px-4 py-3 text-left text-white">Achievements</th>
                        <th className="px-4 py-3 text-left text-white">Last Updated</th>
                        <th className="px-4 py-3 text-left text-white">Status</th>
                        <th className="px-4 py-3 text-left text-white">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {games.map((game) => (
                        <tr key={game.id} className="hover:bg-slate-700">
                          <td className="px-4 py-3">
                            <Checkbox
                              checked={selectedGames.includes(game.id)}
                              onCheckedChange={() => toggleGameSelection(game.id)}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-3">
                              {game.header_image && (
                                <img
                                  src={game.header_image}
                                  alt={game.name}
                                  className="w-12 h-8 object-cover rounded"
                                />
                              )}
                              <div>
                                <div className="text-white font-medium">{game.name}</div>
                                {game.developers && (
                                  <div className="text-sm text-gray-400">
                                    {game.developers.join(', ')}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-300">
                            {game.steam_id || 'Manual'}
                          </td>
                          <td className="px-4 py-3">
                            {game.metacritic_score ? (
                              <Badge variant="outline" className="bg-green-600 text-white">
                                {game.metacritic_score}
                              </Badge>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-300">
                            {game.achievements_count || 0}
                          </td>
                          <td className="px-4 py-3 text-gray-300">
                            {game.last_updated ? new Date(game.last_updated).toLocaleDateString() : '-'}
                          </td>
                          <td className="px-4 py-3">
                            {game.is_deleted ? (
                              <Badge variant="outline" className="bg-red-600 text-white">
                                <Trash2 className="h-3 w-3 mr-1" />
                                Deleted
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-green-600 text-white">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Active
                              </Badge>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => performBulkOperation('refresh')}
                                className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                              >
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                              {game.is_deleted ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => performBulkOperation('restore')}
                                  className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                                >
                                  <RotateCcw className="h-4 w-4" />
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => performBulkOperation('delete')}
                                  className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

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
        </TabsContent>

        {/* Cache Status Tab */}
        <TabsContent value="cache" className="space-y-6">
          {cacheStatus && (
            <>
              {/* Cache Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-white">Total Entries</CardTitle>
                    <Database className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{cacheStatus.cache.total_entries}</div>
                    <p className="text-xs text-muted-foreground">
                      {cacheStatus.cache.total_fetches} total fetches
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-white">Errors</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{cacheStatus.cache.total_errors}</div>
                    <p className="text-xs text-muted-foreground">
                      {cacheStatus.cache.games_with_errors} games affected
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-white">Last Fetch</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      {cacheStatus.cache.last_fetch_time ? 
                        new Date(cacheStatus.cache.last_fetch_time).toLocaleDateString() : 
                        'Never'
                      }
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Average {Math.round(cacheStatus.cache.avg_fetches_per_game || 0)} fetches per game
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Actions */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Cache Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <Button
                      onClick={refreshExpiredGames}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh Expired Games
                    </Button>
                    <Button
                      variant="outline"
                      onClick={loadCacheStatus}
                      className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh Status
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Errors */}
              {cacheStatus.recentErrors.length > 0 && (
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Recent Errors</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {cacheStatus.recentErrors.map((error, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-slate-700 rounded">
                          <div>
                            <div className="text-white">Steam ID: {error.steam_id}</div>
                            <div className="text-sm text-gray-400">{error.last_error}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-400">
                              {new Date(error.last_fetched).toLocaleDateString()}
                            </div>
                            <Badge variant="outline" className="bg-red-600 text-white">
                              {error.error_count} errors
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Expired Games */}
              {cacheStatus.expiredGames.length > 0 && (
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Expired Games</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {cacheStatus.expiredGames.map((game, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-slate-700 rounded">
                          <div>
                            <div className="text-white">{game.name}</div>
                            <div className="text-sm text-gray-400">Steam ID: {game.steam_id}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-400">
                              {new Date(game.last_updated).toLocaleDateString()}
                            </div>
                            <Badge variant="outline" className="bg-yellow-600 text-white">
                              Expired
                            </Badge>
                          </div>
                        </div>
                      ))}
      </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        {/* User Management Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">User management features coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin; 