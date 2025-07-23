import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  Star,
  ThumbsUp,
  MessageCircle,
  User,
  Crown,
  Shield,
  Award,
  Clock,
  Edit,
  Trash2,
  Plus,
  X,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Users,
  Calendar,
  Play,
  Target,
  Zap
} from 'lucide-react';
import toast from 'react-hot-toast';

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

interface GameReviewsProps {
  gameId: number;
  gameName: string;
  userLevel: number;
  userPoints: number;
  canWriteReview: boolean;
}

const GameReviews: React.FC<GameReviewsProps> = ({ 
  gameId, 
  gameName, 
  userLevel, 
  userPoints, 
  canWriteReview 
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'rating' | 'helpful'>('recent');
  const [filterRating, setFilterRating] = useState<number>(0);

  // Form state
  const [formData, setFormData] = useState({
    rating: 5,
    title: '',
    content: '',
    pros: '',
    cons: '',
    playtime: 0
  });

  useEffect(() => {
    fetchReviews();
  }, [gameId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      // Mock reviews data
      const mockReviews: Review[] = [
        {
          id: 1,
          userId: 1,
          username: 'GamingMaster',
          userLevel: 25,
          userPoints: 1500,
          rating: 5,
          title: 'Absolutely Amazing Game!',
          content: 'This game exceeded all my expectations. The graphics are stunning, the gameplay is smooth, and the story is captivating. I can\'t recommend it enough!',
          pros: ['Amazing graphics', 'Great story', 'Smooth gameplay'],
          cons: ['Long loading times'],
          playtime: 120,
          isVerified: true,
          helpfulCount: 45,
          createdAt: '2024-01-15T10:30:00Z'
        },
        {
          id: 2,
          userId: 2,
          username: 'GameReviewer',
          userLevel: 15,
          userPoints: 800,
          rating: 4,
          title: 'Solid Game with Minor Issues',
          content: 'Overall a great game with some minor technical issues. The combat system is well-designed and the world is beautiful.',
          pros: ['Good combat', 'Beautiful world'],
          cons: ['Some bugs', 'Repetitive side quests'],
          playtime: 85,
          isVerified: true,
          helpfulCount: 23,
          createdAt: '2024-01-10T14:20:00Z'
        },
        {
          id: 3,
          userId: 3,
          username: 'NewPlayer',
          userLevel: 5,
          userPoints: 200,
          rating: 3,
          title: 'Decent but Overhyped',
          content: 'The game is okay but I think it was overhyped. The graphics are good but the gameplay feels repetitive after a while.',
          pros: ['Good graphics'],
          cons: ['Repetitive gameplay', 'Overhyped'],
          playtime: 40,
          isVerified: false,
          helpfulCount: 8,
          createdAt: '2024-01-05T09:15:00Z'
        }
      ];
      setReviews(mockReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const newReview: Review = {
        id: reviews.length + 1,
        userId: 999, // Current user ID
        username: 'CurrentUser',
        userLevel,
        userPoints,
        rating: formData.rating,
        title: formData.title,
        content: formData.content,
        pros: formData.pros.split(',').map(p => p.trim()).filter(p => p),
        cons: formData.cons.split(',').map(c => c.trim()).filter(c => c),
        playtime: formData.playtime,
        isVerified: userLevel >= 10,
        helpfulCount: 0,
        createdAt: new Date().toISOString()
      };

      setReviews(prev => [newReview, ...prev]);
      setShowForm(false);
      setFormData({
        rating: 5,
        title: '',
        content: '',
        pros: '',
        cons: '',
        playtime: 0
      });
      toast.success('Review submitted successfully!');
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    }
  };

  const handleHelpful = (reviewId: number) => {
    setReviews(prev => 
      prev.map(review => 
        review.id === reviewId 
          ? { ...review, helpfulCount: review.helpfulCount + 1 }
          : review
      )
    );
    toast.success('Marked as helpful!');
  };

  const getLevelIcon = (level: number) => {
    if (level >= 50) return <Crown className="h-4 w-4 text-yellow-400" />;
    if (level >= 25) return <Shield className="h-4 w-4 text-blue-400" />;
    if (level >= 10) return <Award className="h-4 w-4 text-green-400" />;
    return <User className="h-4 w-4 text-gray-400" />;
  };

  const getLevelColor = (level: number) => {
    if (level >= 50) return 'text-yellow-400';
    if (level >= 25) return 'text-blue-400';
    if (level >= 10) return 'text-green-400';
    return 'text-gray-400';
  };

  const sortedReviews = [...reviews]
    .filter(review => filterRating === 0 || review.rating === filterRating)
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'helpful':
          return b.helpfulCount - a.helpfulCount;
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white">Reviews</h3>
          <p className="text-gray-400">{reviews.length} reviews</p>
        </div>
        {canWriteReview && (
          <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Write Review
          </Button>
        )}
      </div>

      {/* Requirements Info */}
      {!canWriteReview && (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              <div>
                <p className="text-white font-medium">Review Requirements</p>
                <p className="text-gray-400 text-sm">
                  You need at least 10 points and level 5 to write reviews. 
                  Current: {userPoints} points, Level {userLevel}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Review Form */}
      {showForm && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Write a Review</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowForm(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              {/* Rating */}
              <div>
                <label className="text-white text-sm font-medium mb-2 block">Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                      className="text-2xl hover:scale-110 transition-transform"
                    >
                      <Star 
                        className={`h-6 w-6 ${
                          star <= formData.rating 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-400'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="text-white text-sm font-medium mb-2 block">Review Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Summarize your experience..."
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              {/* Content */}
              <div>
                <label className="text-white text-sm font-medium mb-2 block">Review Content</label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Share your detailed thoughts about the game..."
                  rows={4}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              {/* Pros & Cons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-white text-sm font-medium mb-2 block">Pros (comma-separated)</label>
                  <Input
                    value={formData.pros}
                    onChange={(e) => setFormData(prev => ({ ...prev, pros: e.target.value }))}
                    placeholder="Great graphics, smooth gameplay..."
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-white text-sm font-medium mb-2 block">Cons (comma-separated)</label>
                  <Input
                    value={formData.cons}
                    onChange={(e) => setFormData(prev => ({ ...prev, cons: e.target.value }))}
                    placeholder="Long loading times, bugs..."
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>

              {/* Playtime */}
              <div>
                <label className="text-white text-sm font-medium mb-2 block">Hours Played</label>
                <Input
                  type="number"
                  value={formData.playtime}
                  onChange={(e) => setFormData(prev => ({ ...prev, playtime: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                  className="bg-slate-700 border-slate-600 text-white w-32"
                />
              </div>

              <div className="flex items-center gap-2">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Submit Review
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-700 border-slate-600 text-white text-sm rounded px-2 py-1"
          >
            <option value="recent">Most Recent</option>
            <option value="rating">Highest Rating</option>
            <option value="helpful">Most Helpful</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm">Filter:</span>
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(parseInt(e.target.value))}
            className="bg-slate-700 border-slate-600 text-white text-sm rounded px-2 py-1"
          >
            <option value={0}>All Ratings</option>
            <option value={5}>5 Stars</option>
            <option value={4}>4 Stars</option>
            <option value={3}>3 Stars</option>
            <option value={2}>2 Stars</option>
            <option value={1}>1 Star</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-400">Loading reviews...</div>
          </div>
        ) : sortedReviews.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No reviews yet. Be the first to review this game!</p>
          </div>
        ) : (
          sortedReviews.map((review) => (
            <Card key={review.id} className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                {/* Review Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
                      {getLevelIcon(review.userLevel)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{review.username}</span>
                        <Badge variant="outline" className={`text-xs ${getLevelColor(review.userLevel)}`}>
                          Level {review.userLevel}
                        </Badge>
                        {review.isVerified && (
                          <Badge className="bg-green-600 text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span>{review.userPoints} points</span>
                        <span>•</span>
                        <span>{review.playtime}h played</span>
                        <span>•</span>
                        <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= review.rating 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-400'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Review Content */}
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-white mb-2">{review.title}</h4>
                  <p className="text-gray-300 leading-relaxed">{review.content}</p>
                </div>

                {/* Pros & Cons */}
                {(review.pros.length > 0 || review.cons.length > 0) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {review.pros.length > 0 && (
                      <div>
                        <h5 className="text-green-400 font-medium mb-2">Pros</h5>
                        <ul className="space-y-1">
                          {review.pros.map((pro, index) => (
                            <li key={index} className="text-sm text-gray-300 flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {review.cons.length > 0 && (
                      <div>
                        <h5 className="text-red-400 font-medium mb-2">Cons</h5>
                        <ul className="space-y-1">
                          {review.cons.map((con, index) => (
                            <li key={index} className="text-sm text-gray-300 flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                              {con}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Review Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleHelpful(review.id)}
                    className="text-gray-400 hover:text-white"
                  >
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Helpful ({review.helpfulCount})
                  </Button>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <MessageCircle className="h-4 w-4" />
                    Reply
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default GameReviews; 