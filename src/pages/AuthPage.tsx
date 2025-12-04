import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Award, 
  Loader2, 
  Mail,
  Lock,
  User,
  ArrowLeft,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

type AuthMode = 'login' | 'signup' | 'forgot';

const AuthPage = () => {
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/home');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login')) {
            toast.error('Invalid email or password');
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success('Welcome back!');
          navigate('/home');
        }
      } else if (mode === 'signup') {
        if (password !== confirmPassword) {
          toast.error('Passwords do not match');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          toast.error('Password must be at least 6 characters');
          setLoading(false);
          return;
        }
        if (!name.trim()) {
          toast.error('Please enter your name');
          setLoading(false);
          return;
        }

        const { error } = await signUp(email, password, name);
        if (error) {
          if (error.message.includes('already registered')) {
            toast.error('An account with this email already exists');
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success('Account created! You can now sign in.');
          setMode('login');
        }
      } else if (mode === 'forgot') {
        const { supabase } = await import('@/integrations/supabase/client');
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth`
        });
        if (error) {
          toast.error(error.message);
        } else {
          setForgotSent(true);
          toast.success('Check your email for reset instructions');
        }
      }
    } catch (error: any) {
      toast.error('An unexpected error occurred');
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    "Discover grants matched to your business",
    "Track applications in one place",
    "Get AI help to write winning answers",
    "Never miss a deadline again"
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      {/* Left Panel - Hero (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary-hover to-[#0a1f3d] relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 h-64 w-64 rounded-full bg-primary-foreground blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 h-96 w-96 rounded-full bg-accent blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center p-12 lg:p-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link to="/" className="flex items-center gap-2 mb-12">
              <Award className="h-10 w-10 text-primary-foreground" />
              <span className="text-2xl font-bold text-primary-foreground">High Spirit</span>
            </Link>
            
            <Badge className="mb-6 px-4 py-2 bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20 w-fit">
              <Sparkles className="h-4 w-4 mr-2" />
              AI-Powered Grant Assistant
            </Badge>
            
            <h1 className="text-4xl lg:text-5xl font-bold text-primary-foreground mb-6 leading-tight">
              Win more grants with intelligent assistance
            </h1>
            
            <p className="text-lg text-primary-foreground/80 mb-8">
              Join hundreds of businesses using High Spirit to discover, track, and win funding opportunities.
            </p>
            
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-center gap-3 text-primary-foreground/90"
                >
                  <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0" />
                  <span>{benefit}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col min-h-screen lg:min-h-0">
        {/* Mobile Header */}
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border lg:hidden">
          <div className="px-4 h-14 flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="h-5 w-5 text-muted-foreground" />
              <Award className="h-7 w-7 text-primary" />
              <span className="text-lg font-bold text-foreground">High Spirit</span>
            </Link>
          </div>
        </header>

        {/* Desktop Back Link */}
        <div className="hidden lg:block p-6">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-fit">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back to home</span>
          </Link>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md"
          >
            <Card className="border-0 shadow-lg lg:border lg:shadow-xl">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl">
                  {mode === 'login' && 'Welcome Back'}
                  {mode === 'signup' && 'Create Account'}
                  {mode === 'forgot' && 'Reset Password'}
                </CardTitle>
                <CardDescription className="text-base">
                  {mode === 'login' && 'Sign in to continue to your grant dashboard'}
                  {mode === 'signup' && 'Start finding and tracking grants today'}
                  {mode === 'forgot' && 'Enter your email to receive reset instructions'}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-4">
                {mode === 'forgot' && forgotSent ? (
                  <div className="text-center py-4">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                      <Mail className="h-8 w-8 text-primary" />
                    </div>
                    <p className="text-muted-foreground mb-6">
                      Check your email for a link to reset your password.
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => { setMode('login'); setForgotSent(false); }}
                    >
                      Back to Sign In
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {mode === 'signup' && (
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="name"
                            type="text"
                            placeholder="John Smith"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="pl-10 h-12"
                            required
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10 h-12"
                          required
                        />
                      </div>
                    </div>

                    {mode !== 'forgot' && (
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10 pr-10 h-12"
                            required
                            minLength={6}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {mode === 'signup' && (
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="confirmPassword"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="pl-10 h-12"
                            required
                            minLength={6}
                          />
                        </div>
                      </div>
                    )}

                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => setMode('forgot')}
                        className="text-sm text-primary hover:underline"
                      >
                        Forgot password?
                      </button>
                    )}

                    <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {mode === 'login' ? 'Signing in...' : mode === 'signup' ? 'Creating account...' : 'Sending...'}
                        </>
                      ) : (
                        <>
                          {mode === 'login' && 'Sign In'}
                          {mode === 'signup' && 'Create Account'}
                          {mode === 'forgot' && 'Send Reset Link'}
                        </>
                      )}
                    </Button>

                    <div className="text-center text-sm pt-2">
                      {mode === 'login' && (
                        <p className="text-muted-foreground">
                          Don't have an account?{' '}
                          <button
                            type="button"
                            onClick={() => setMode('signup')}
                            className="text-primary hover:underline font-medium"
                          >
                            Sign up
                          </button>
                        </p>
                      )}
                      {mode === 'signup' && (
                        <p className="text-muted-foreground">
                          Already have an account?{' '}
                          <button
                            type="button"
                            onClick={() => setMode('login')}
                            className="text-primary hover:underline font-medium"
                          >
                            Sign in
                          </button>
                        </p>
                      )}
                      {mode === 'forgot' && (
                        <button
                          type="button"
                          onClick={() => setMode('login')}
                          className="text-primary hover:underline font-medium"
                        >
                          Back to Sign In
                        </button>
                      )}
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>

            {/* Browse Grants Link */}
            <p className="text-center text-sm text-muted-foreground mt-6">
              Just browsing?{' '}
              <Link to="/grants" className="text-primary hover:underline font-medium">
                Explore grants without signing in
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
