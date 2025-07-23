import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Gamepad2, 
  Users, 
  Trophy, 
  MessageSquare, 
  TrendingUp, 
  Star,
  ArrowRight,
  Play
} from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 container mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Welcome to <span className="text-purple-400">GameCom</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              The ultimate gaming community platform. Connect with fellow gamers, 
              manage your game library, earn achievements, and join the conversation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700">
                <Link to="/register">
                  <Play className="mr-2 h-5 w-5" />
                  Get Started
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-black">
                <Link to="/games">
                  <Gamepad2 className="mr-2 h-5 w-5" />
                  Browse Games
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-800/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Everything a Gamer Needs
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              From game management to social features, we've got you covered
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-slate-800/50 border-slate-700 text-white hover:bg-slate-800/70 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <Gamepad2 className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Game Library</CardTitle>
                <CardDescription className="text-gray-300">
                  Manage your game collection, track playtime, and discover new titles
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 text-white hover:bg-slate-800/70 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Social Gaming</CardTitle>
                <CardDescription className="text-gray-300">
                  Connect with friends, join communities, and find gaming partners
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 text-white hover:bg-slate-800/70 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center mb-4">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Achievements</CardTitle>
                <CardDescription className="text-gray-300">
                  Earn badges, complete challenges, and climb the leaderboards
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 text-white hover:bg-slate-800/70 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Real-time Chat</CardTitle>
                <CardDescription className="text-gray-300">
                  Chat with friends and join game-specific discussions
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 text-white hover:bg-slate-800/70 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Game Reviews</CardTitle>
                <CardDescription className="text-gray-300">
                  Rate games, write reviews, and discover what others think
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 text-white hover:bg-slate-800/70 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-pink-600 rounded-lg flex items-center justify-center mb-4">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Personalized</CardTitle>
                <CardDescription className="text-gray-300">
                  Get game recommendations based on your preferences and play history
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-slate-900/50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-purple-400 mb-2">10K+</div>
              <div className="text-gray-300">Active Gamers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-400 mb-2">50K+</div>
              <div className="text-gray-300">Games in Library</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-yellow-400 mb-2">100K+</div>
              <div className="text-gray-300">Achievements Earned</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-400 mb-2">1M+</div>
              <div className="text-gray-300">Messages Sent</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Join the Community?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Start your gaming journey today and connect with millions of players worldwide
          </p>
          <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700">
            <Link to="/register">
              Create Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold text-white mb-4">GameCom</h3>
              <p className="text-gray-300">
                The ultimate gaming community platform for connecting gamers worldwide.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Features</h4>
              <ul className="space-y-2 text-gray-300">
                <li><Link to="/games" className="hover:text-white">Game Library</Link></li>
                <li><Link to="/forums" className="hover:text-white">Forums</Link></li>
                <li><Link to="/chat" className="hover:text-white">Chat</Link></li>
                <li><Link to="/achievements" className="hover:text-white">Achievements</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Community</h4>
              <ul className="space-y-2 text-gray-300">
                <li><Link to="/users" className="hover:text-white">Find Players</Link></li>
                <li><Link to="/friends" className="hover:text-white">Friends</Link></li>
                <li><Link to="/groups" className="hover:text-white">Groups</Link></li>
                <li><Link to="/events" className="hover:text-white">Events</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-gray-300">
                <li><Link to="/help" className="hover:text-white">Help Center</Link></li>
                <li><Link to="/contact" className="hover:text-white">Contact Us</Link></li>
                <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; 2024 GameCom. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home; 