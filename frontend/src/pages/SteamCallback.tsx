import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const SteamCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const handleSteamCallback = async () => {
      try {
        const token = searchParams.get('token');
        const steamId = searchParams.get('steamId');

        if (!token) {
          setError('No authentication token received from Steam');
          setStatus('error');
          return;
        }

        // Store the token and login
        localStorage.setItem('token', token);
        
        // Update auth context
        if (loginWithToken) {
          await loginWithToken(token);
        }

        setStatus('success');
        toast.success('Successfully logged in with Steam!');
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);

      } catch (error) {
        console.error('Steam callback error:', error);
        setError('Failed to complete Steam authentication');
        setStatus('error');
        toast.error('Steam authentication failed');
      }
    };

    handleSteamCallback();
  }, [searchParams, navigate, loginWithToken]);

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-blue-400 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Completing Steam Login</h2>
            <p className="text-gray-300">Please wait while we complete your authentication...</p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Login Successful!</h2>
            <p className="text-gray-300">You have been successfully logged in with Steam.</p>
            <p className="text-gray-400 text-sm mt-2">Redirecting to dashboard...</p>
          </div>
        );

      case 'error':
        return (
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Authentication Failed</h2>
            <p className="text-gray-300 mb-4">{error}</p>
            <div className="space-y-2">
              <Button
                onClick={() => navigate('/login')}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                Back to Login
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="w-full border-slate-600 text-white hover:bg-slate-700"
              >
                Try Again
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800/50 border-slate-700 text-white">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.63 3.87 10.35 9.08 11.82l.92-3.5-2.5-2.5c1.5-1.5 2.5-3.5 2.5-5.82 0-4.41-3.59-8-8-8s-8 3.59-8 8 3.59 8 8 8c2.32 0 4.32-1 5.82-2.5l2.5 2.5 3.5-.92C22.35 15.87 24 12 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
          </div>
          <CardTitle className="text-2xl">Steam Authentication</CardTitle>
          <CardDescription className="text-gray-300">
            Processing your Steam login
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
};

export default SteamCallback; 