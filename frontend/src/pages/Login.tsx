import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Gamepad2, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (error) {
      // Error is already handled by the AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800/50 border-slate-700 text-white">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gamepad2 className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription className="text-gray-300">
            Sign in to your GameCom account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-gray-400"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <Alert className="bg-red-500/10 border-red-500/20">
                  <AlertDescription className="text-red-400">
                    {errors.email.message}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="pl-10 pr-10 bg-slate-700 border-slate-600 text-white placeholder:text-gray-400"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <Alert className="bg-red-500/10 border-red-500/20">
                  <AlertDescription className="text-red-400">
                    {errors.password.message}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-600" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-800 px-2 text-gray-400">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <Button
                variant="outline"
                className="w-full border-slate-600 text-white hover:bg-slate-700"
                onClick={async () => {
                  try {
                    const response = await fetch('/api/auth/steam');
                    const data = await response.json();
                    if (data.authUrl) {
                      window.location.href = data.authUrl;
                    }
                  } catch (error) {
                    console.error('Steam login error:', error);
                  }
                }}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.63 3.87 10.35 9.08 11.82l.92-3.5-2.5-2.5c1.5-1.5 2.5-3.5 2.5-5.82 0-4.41-3.59-8-8-8s-8 3.59-8 8 3.59 8 8 8c2.32 0 4.32-1 5.82-2.5l2.5 2.5 3.5-.92C22.35 15.87 24 12 24 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                Continue with Steam
              </Button>
            </div>
          </div>

          <div className="mt-6 text-center text-gray-300">
            Don't have an account?{' '}
            <Link to="/register" className="text-purple-400 hover:text-purple-300 font-medium">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login; 