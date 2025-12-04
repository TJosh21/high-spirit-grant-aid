import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Award, Search, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import MobileLayout from '@/components/MobileLayout';
import AppHeader from '@/components/AppHeader';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Welcome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/home');
    }
  }, [user, navigate]);

  const benefits = [
    "Discover grants matched to your business",
    "Track applications in one place",
    "Get AI help to write winning answers",
    "Never miss a deadline again"
  ];

  return (
    <MobileLayout>
      <AppHeader />
      
      <div className="min-h-[calc(100vh-8rem)] flex flex-col">
        {/* Hero Section */}
        <section className="flex-1 flex flex-col justify-center px-6 py-8 bg-gradient-to-br from-primary via-primary-hover to-accent">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-full bg-primary-foreground/10">
                <Award className="h-12 w-12 text-primary-foreground" />
              </div>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              High Spirit Grant Assistant
            </h1>
            
            <p className="text-lg text-primary-foreground/90 mb-8 max-w-md mx-auto">
              Find, track, and win more business grants with AI-powered assistance.
            </p>

            <div className="space-y-3 mb-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="flex items-center gap-3 text-primary-foreground/90 justify-center"
                >
                  <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0" />
                  <span className="text-sm">{benefit}</span>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-col gap-3 max-w-xs mx-auto">
              <Link to="/auth">
                <Button 
                  size="lg" 
                  className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90 gap-2"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              
              <Link to="/grants">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="w-full bg-transparent border-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 gap-2"
                >
                  <Search className="h-4 w-4" />
                  Browse Grants
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Quick Features */}
        <section className="px-6 py-8 bg-background">
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center">
                <Search className="h-5 w-5 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground">Find Grants</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-accent/10 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-accent" />
              </div>
              <p className="text-xs text-muted-foreground">AI Coach</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-status-success/10 flex items-center justify-center">
                <Award className="h-5 w-5 text-status-success" />
              </div>
              <p className="text-xs text-muted-foreground">Win More</p>
            </div>
          </div>
        </section>
      </div>
    </MobileLayout>
  );
};

export default Welcome;
