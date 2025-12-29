import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Layers, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error('Invalid email or password');
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success('Welcome back!');
          navigate('/');
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          if (error.message.includes('already registered')) {
            toast.error('This email is already registered');
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success('Account created! Welcome to your knowledge space.');
          navigate('/');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/20 via-background to-accent/20 items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="p-3 rounded-2xl bg-primary/20 backdrop-blur-sm">
              <Layers className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-gradient">SPACE</h1>
          </div>
          <p className="text-xl text-muted-foreground mb-8">
            Your hierarchical knowledge workspace. Organize thoughts into Spaces, Folders, Outlines, and Documents.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {['Spaces', 'Folders', 'Outlines', 'Documents', 'AI Chat'].map((feature) => (
              <span
                key={feature}
                className="px-4 py-2 rounded-full bg-card/50 border border-border/50 text-sm text-foreground/80"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="p-2 rounded-xl bg-primary/20">
              <Layers className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-gradient">SPACE</h1>
          </div>

          <div className="glass rounded-2xl p-8 border border-border/50">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">
                {isLogin ? 'Welcome back' : 'Create your space'}
              </h2>
              <p className="text-muted-foreground">
                {isLogin
                  ? 'Enter your credentials to access your workspace'
                  : 'Start organizing your knowledge today'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full group"
                disabled={loading}
              >
                {loading ? (
                  <span className="animate-pulse">Please wait...</span>
                ) : (
                  <>
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {isLogin ? (
                  <>
                    New here?{' '}
                    <span className="text-primary font-medium">Create an account</span>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <span className="text-primary font-medium">Sign in</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3" />
            Powered by AI-enhanced knowledge management
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
