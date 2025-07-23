import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  MessageSquare,
  Edit,
  Trash2,
  Plus,
  X,
  Pin,
  Lock,
  Users,
  Calendar,
  Eye,
  ThumbsUp,
  BookOpen,
  FileText,
  Bug,
  Lightbulb,
  Settings,
  Crown,
  Shield,
  Award,
  User,
  Clock,
  TrendingUp,
  Zap,
  Target
} from 'lucide-react';
import toast from 'react-hot-toast';

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

interface WikiPage {
  id: number;
  title: string;
  content: string;
  category: 'overview' | 'walkthrough' | 'tips' | 'faq' | 'mods';
  lastEditedBy: string;
  lastEditedAt: string;
  version: number;
}

interface GameForumProps {
  gameId: number;
  gameName: string;
  userLevel: number;
  userPoints: number;
  canEditWiki: boolean;
}

const GameForum: React.FC<GameForumProps> = ({ 
  gameId, 
  gameName, 
  userLevel, 
  userPoints, 
  canEditWiki 
}) => {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [wikiPages, setWikiPages] = useState<WikiPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'forum' | 'wiki'>('forum');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showPostForm, setShowPostForm] = useState(false);
  const [showWikiForm, setShowWikiForm] = useState(false);
  const [selectedWikiPage, setSelectedWikiPage] = useState<WikiPage | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general' as ForumPost['category']
  });

  const [wikiFormData, setWikiFormData] = useState({
    title: '',
    content: '',
    category: 'overview' as WikiPage['category']
  });

  useEffect(() => {
    fetchForumData();
  }, [gameId]);

  const fetchForumData = async () => {
    try {
      setLoading(true);
      
      // Mock forum posts
      const mockPosts: ForumPost[] = [
        {
          id: 1,
          userId: 1,
          username: 'GameMaster',
          userLevel: 30,
          userPoints: 2000,
          title: 'Complete Beginner Guide',
          content: 'Welcome to the game! This guide will help you get started with the basics...',
          category: 'guide',
          isPinned: true,
          isLocked: false,
          viewCount: 1250,
          replyCount: 45,
          helpfulCount: 89,
          createdAt: '2024-01-10T10:00:00Z'
        },
        {
          id: 2,
          userId: 2,
          username: 'BugHunter',
          userLevel: 15,
          userPoints: 800,
          title: 'Graphics glitch in Chapter 3',
          content: 'I found a bug where the graphics become corrupted during the boss fight...',
          category: 'bug',
          isPinned: false,
          isLocked: false,
          viewCount: 320,
          replyCount: 12,
          helpfulCount: 23,
          createdAt: '2024-01-12T14:30:00Z'
        },
        {
          id: 3,
          userId: 3,
          username: 'ModCreator',
          userLevel: 25,
          userPoints: 1500,
          title: 'Custom Character Mods',
          content: 'I created some custom character mods. Here\'s how to install them...',
          category: 'mod',
          isPinned: false,
          isLocked: false,
          viewCount: 890,
          replyCount: 67,
          helpfulCount: 156,
          createdAt: '2024-01-08T16:45:00Z'
        }
      ];

      // Mock wiki pages
      const mockWikiPages: WikiPage[] = [
        {
          id: 1,
          title: 'Game Overview',
          content: '# Game Overview\n\nThis is the main overview page for the game. It contains basic information about gameplay, story, and features.',
          category: 'overview',
          lastEditedBy: 'GameMaster',
          lastEditedAt: '2024-01-15T09:00:00Z',
          version: 3
        },
        {
          id: 2,
          title: 'Main Story Walkthrough',
          content: '# Main Story Walkthrough\n\n## Chapter 1: The Beginning\n\nStart your journey in the mystical world...',
          category: 'walkthrough',
          lastEditedBy: 'GameMaster',
          lastEditedAt: '2024-01-14T11:30:00Z',
          version: 5
        },
        {
          id: 3,
          title: 'Pro Tips & Tricks',
          content: '# Pro Tips & Tricks\n\n## Combat Tips\n\n- Use the environment to your advantage\n- Timing is everything in boss fights...',
          category: 'tips',
          lastEditedBy: 'ProPlayer',
          lastEditedAt: '2024-01-13T15:20:00Z',
          version: 2
        }
      ];

      setPosts(mockPosts);
      setWikiPages(mockWikiPages);
    } catch (error) {
      console.error('Error fetching forum data:', error);
      toast.error('Failed to load forum data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const newPost: ForumPost = {
        id: posts.length + 1,
        userId: 999,
        username: 'CurrentUser',
        userLevel,
        userPoints,
        title: formData.title,
        content: formData.content,
        category: formData.category,
        isPinned: false,
        isLocked: false,
        viewCount: 0,
        replyCount: 0,
        helpfulCount: 0,
        createdAt: new Date().toISOString()
      };

      setPosts(prev => [newPost, ...prev]);
      setShowPostForm(false);
      setFormData({
        title: '',
        content: '',
        category: 'general'
      });
      toast.success('Post created successfully!');
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    }
  };

  const handleSubmitWiki = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!wikiFormData.title.trim() || !wikiFormData.content.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const newWikiPage: WikiPage = {
        id: wikiPages.length + 1,
        title: wikiFormData.title,
        content: wikiFormData.content,
        category: wikiFormData.category,
        lastEditedBy: 'CurrentUser',
        lastEditedAt: new Date().toISOString(),
        version: 1
      };

      setWikiPages(prev => [...prev, newWikiPage]);
      setShowWikiForm(false);
      setWikiFormData({
        title: '',
        content: '',
        category: 'overview'
      });
      toast.success('Wiki page created successfully!');
    } catch (error) {
      console.error('Error creating wiki page:', error);
      toast.error('Failed to create wiki page');
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'guide': return <BookOpen className="h-4 w-4" />;
      case 'bug': return <Bug className="h-4 w-4" />;
      case 'suggestion': return <Lightbulb className="h-4 w-4" />;
      case 'mod': return <Settings className="h-4 w-4" />;
      case 'wiki': return <FileText className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'guide': return 'bg-blue-600';
      case 'bug': return 'bg-red-600';
      case 'suggestion': return 'bg-yellow-600';
      case 'mod': return 'bg-purple-600';
      case 'wiki': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  const getLevelIcon = (level: number) => {
    if (level >= 50) return <Crown className="h-4 w-4 text-yellow-400" />;
    if (level >= 25) return <Shield className="h-4 w-4 text-blue-400" />;
    if (level >= 10) return <Award className="h-4 w-4 text-green-400" />;
    return <User className="h-4 w-4 text-gray-400" />;
  };

  const filteredPosts = posts.filter(post => 
    selectedCategory === 'all' || post.category === selectedCategory
  );

  const categories = [
    { id: 'all', name: 'All', icon: MessageSquare },
    { id: 'general', name: 'General', icon: MessageSquare },
    { id: 'guide', name: 'Guides', icon: BookOpen },
    { id: 'bug', name: 'Bugs', icon: Bug },
    { id: 'suggestion', name: 'Suggestions', icon: Lightbulb },
    { id: 'mod', name: 'Mods', icon: Settings },
    { id: 'wiki', name: 'Wiki', icon: FileText }
  ];

  const wikiCategories = [
    { id: 'overview', name: 'Overview', icon: BookOpen },
    { id: 'walkthrough', name: 'Walkthrough', icon: Target },
    { id: 'tips', name: 'Tips & Tricks', icon: Zap },
    { id: 'faq', name: 'FAQ', icon: MessageSquare },
    { id: 'mods', name: 'Mods', icon: Settings }
  ];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-800 p-1 rounded-lg">
        {[
          { id: 'forum', label: 'Forum', icon: MessageSquare },
          { id: 'wiki', label: 'Wiki', icon: BookOpen }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Forum Tab */}
      {activeTab === 'forum' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-white">Community Forum</h3>
              <p className="text-gray-400">{posts.length} posts</p>
            </div>
            <Button onClick={() => setShowPostForm(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </Button>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                <category.icon className="h-3 w-3" />
                {category.name}
              </button>
            ))}
          </div>

          {/* New Post Form */}
          {showPostForm && (
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Create New Post</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPostForm(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitPost} className="space-y-4">
                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                      className="bg-slate-700 border-slate-600 text-white text-sm rounded px-3 py-2 w-full"
                    >
                      <option value="general">General Discussion</option>
                      <option value="guide">Guide</option>
                      <option value="bug">Bug Report</option>
                      <option value="suggestion">Suggestion</option>
                      <option value="mod">Mod Discussion</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">Title</label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Post title..."
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">Content</label>
                    <Textarea
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Write your post content..."
                      rows={6}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                      Create Post
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowPostForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Posts List */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="text-gray-400">Loading posts...</div>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No posts yet. Be the first to start a discussion!</p>
              </div>
            ) : (
              filteredPosts.map((post) => (
                <Card key={post.id} className="bg-slate-800 border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
                          {getLevelIcon(post.userLevel)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white">{post.username}</span>
                            <Badge className={`text-xs ${getCategoryColor(post.category)}`}>
                              {getCategoryIcon(post.category)}
                              {post.category}
                            </Badge>
                            {post.isPinned && (
                              <Badge className="bg-yellow-600 text-xs">
                                <Pin className="h-3 w-3 mr-1" />
                                Pinned
                              </Badge>
                            )}
                            {post.isLocked && (
                              <Badge className="bg-red-600 text-xs">
                                <Lock className="h-3 w-3 mr-1" />
                                Locked
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <span>{post.userPoints} points</span>
                            <span>•</span>
                            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <h4 className="text-lg font-semibold text-white mb-2">{post.title}</h4>
                    <p className="text-gray-300 mb-4">{post.content}</p>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {post.viewCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          {post.replyCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-4 w-4" />
                          {post.helpfulCount}
                        </span>
                      </div>
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                        Reply
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* Wiki Tab */}
      {activeTab === 'wiki' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-white">Game Wiki</h3>
              <p className="text-gray-400">{wikiPages.length} pages</p>
            </div>
            {canEditWiki && (
              <Button onClick={() => setShowWikiForm(true)} className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                New Wiki Page
              </Button>
            )}
          </div>

          {/* Wiki Requirements */}
          {!canEditWiki && (
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-yellow-400" />
                  <div>
                    <p className="text-white font-medium">Wiki Edit Requirements</p>
                    <p className="text-gray-400 text-sm">
                      You need at least 50 points and level 10 to edit wiki pages. 
                      Current: {userPoints} points, Level {userLevel}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* New Wiki Form */}
          {showWikiForm && (
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Create Wiki Page</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowWikiForm(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitWiki} className="space-y-4">
                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">Category</label>
                    <select
                      value={wikiFormData.category}
                      onChange={(e) => setWikiFormData(prev => ({ ...prev, category: e.target.value as any }))}
                      className="bg-slate-700 border-slate-600 text-white text-sm rounded px-3 py-2 w-full"
                    >
                      {wikiCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">Title</label>
                    <Input
                      value={wikiFormData.title}
                      onChange={(e) => setWikiFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Wiki page title..."
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">Content (Markdown)</label>
                    <Textarea
                      value={wikiFormData.content}
                      onChange={(e) => setWikiFormData(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Write wiki content in Markdown format..."
                      rows={10}
                      className="bg-slate-700 border-slate-600 text-white font-mono"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button type="submit" className="bg-green-600 hover:bg-green-700">
                      Create Wiki Page
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowWikiForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Wiki Pages */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {wikiPages.map((page) => (
              <Card key={page.id} className="bg-slate-800 border-slate-700 hover:bg-slate-700 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-green-600 text-xs">
                      {page.category}
                    </Badge>
                    <span className="text-xs text-gray-400">v{page.version}</span>
                  </div>
                  <h4 className="font-medium text-white mb-2">{page.title}</h4>
                  <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                    {page.content.replace(/#{1,6}\s+/g, '').substring(0, 100)}...
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>By {page.lastEditedBy}</span>
                    <span>{new Date(page.lastEditedAt).toLocaleDateString()}</span>
                  </div>
                  {canEditWiki && (
                    <div className="flex items-center gap-2 mt-3">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameForum; 