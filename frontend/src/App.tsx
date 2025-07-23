import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/contexts/AuthContext';
import { SocketProvider } from '@/contexts/SocketContext';

// Pages
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import Profile from '@/pages/Profile';
import Games from '@/pages/Games';
import GameDetail from '@/pages/GameDetail';
import Forums from '@/pages/Forums';
import ForumDetail from '@/pages/ForumDetail';
import Chat from '@/pages/Chat';
import Admin from '@/pages/Admin';
import SteamCallback from '@/pages/SteamCallback';
import Achievements from '@/pages/Achievements';
import WallOfGamers from '@/pages/WallOfGamers';

// Components
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="gamecom-theme">
        <AuthProvider>
          <SocketProvider>
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <div className="min-h-screen bg-background text-foreground">
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/auth/steam/callback" element={<SteamCallback />} />
                  
                  {/* Routes with Layout */}
                  <Route path="/games" element={
                    <Layout>
                      <Games />
                    </Layout>
                  } />
                  <Route path="/game/:id" element={
                    <Layout>
                      <GameDetail />
                    </Layout>
                  } />
                  <Route path="/forums" element={
                    <Layout>
                      <Forums />
                    </Layout>
                  } />
                  <Route path="/forums/:id" element={
                    <Layout>
                      <ForumDetail />
                    </Layout>
                  } />
                  <Route path="/achievements" element={
                    <Layout>
                      <Achievements />
                    </Layout>
                  } />
                  
                  {/* Protected routes */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Layout>
                        <Dashboard />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <Layout>
                        <Profile />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  <Route path="/profile/:id" element={
                    <ProtectedRoute>
                      <Layout>
                        <Profile />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  <Route path="/chat" element={
                    <ProtectedRoute>
                      <Layout>
                        <Chat />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  <Route path="/wall-of-gamers" element={
                    <ProtectedRoute>
                      <Layout>
                        <WallOfGamers />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  <Route path="/admin" element={
                    <ProtectedRoute adminOnly>
                      <Layout>
                        <Admin />
                      </Layout>
                    </ProtectedRoute>
                  } />
                </Routes>
                
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: 'hsl(var(--background))',
                      color: 'hsl(var(--foreground))',
                      border: '1px solid hsl(var(--border))',
                    },
                  }}
                />
              </div>
            </Router>
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App; 