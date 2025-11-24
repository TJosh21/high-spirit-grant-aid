import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  TrendingUp, 
  FileText, 
  ArrowRight, 
  Target, 
  Zap, 
  Award,
  CheckCircle2,
  Bot,
  Clock,
  Shield,
  Users,
  Calendar as CalendarIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';

const Index = () => {
  const features = [
    {
      icon: Bot,
      title: 'AI-Powered Assistance',
      description: 'Get intelligent writing suggestions and feedback powered by advanced AI to craft compelling grant applications.'
    },
    {
      icon: Target,
      title: 'Smart Grant Matching',
      description: 'Discover funding opportunities perfectly matched to your business profile with our intelligent recommendation system.'
    },
    {
      icon: Clock,
      title: 'Save Time',
      description: 'Reduce application time by up to 70% with automated document generation and smart templates.'
    },
    {
      icon: TrendingUp,
      title: 'Success Tracking',
      description: 'Monitor your application progress, track success rates, and get insights to improve future submissions.'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Work together with your team in real-time with live editing, comments, and task management.'
    },
    {
      icon: Shield,
      title: 'Secure & Compliant',
      description: 'Your data is protected with enterprise-grade security and automatic compliance checks.'
    }
  ];

  const howItWorks = [
    {
      step: '1',
      title: 'Create Your Profile',
      description: 'Tell us about your business and funding needs'
    },
    {
      step: '2',
      title: 'Discover Grants',
      description: 'Get matched with relevant funding opportunities'
    },
    {
      step: '3',
      title: 'Apply with AI',
      description: 'Draft answers with intelligent AI assistance'
    },
    {
      step: '4',
      title: 'Submit & Track',
      description: 'Submit applications and monitor success rates'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Award className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">GrantFlow</span>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link to="/auth">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link to="/auth">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-hover to-accent py-20 md:py-32">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 h-64 w-64 rounded-full bg-primary-foreground blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-accent blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="mb-6 px-4 py-2 bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20">
                <Sparkles className="h-4 w-4 mr-2" />
                AI-Powered Grant Platform
              </Badge>
              
              <h1 className="mb-6 text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground leading-tight">
                Win More Grants with{' '}
                <span className="bg-gradient-to-r from-accent to-accent-hover bg-clip-text text-transparent">
                  AI Assistance
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-primary-foreground/90 mb-10 max-w-3xl mx-auto">
                Discover, apply, and track grant opportunities with intelligent AI that writes better applications in less time.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/auth">
                  <Button size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-premium gap-2 group w-full sm:w-auto">
                    <Zap className="h-5 w-5 group-hover:animate-pulse" />
                    Start Free Trial
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="bg-transparent border-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:border-primary-foreground/50 w-full sm:w-auto"
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Learn More
                </Button>
              </div>

              <div className="mt-12 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary-foreground">70%</div>
                  <div className="text-sm text-primary-foreground/70 mt-1">Time Saved</div>
                </div>
                <div className="text-center border-x border-primary-foreground/20">
                  <div className="text-4xl font-bold text-primary-foreground">2x</div>
                  <div className="text-sm text-primary-foreground/70 mt-1">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary-foreground">500+</div>
                  <div className="text-sm text-primary-foreground/70 mt-1">Active Users</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 px-4 py-2">Features</Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful tools designed to streamline your grant application process from discovery to submission.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-premium transition-all">
                  <CardHeader>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-4">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                    <CardDescription className="text-base">{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-32 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 px-4 py-2">Process</Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              How it works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start winning grants in four simple steps
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {howItWorks.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <Card className="text-center h-full">
                  <CardHeader>
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent mb-4">
                      <span className="text-2xl font-bold text-primary-foreground">{step.step}</span>
                    </div>
                    <CardTitle className="text-lg mb-2">{step.title}</CardTitle>
                    <CardDescription>{step.description}</CardDescription>
                  </CardHeader>
                </Card>
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="h-8 w-8 text-muted-foreground/30" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-primary via-primary-hover to-accent">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-6">
              Ready to win your next grant?
            </h2>
            <p className="text-xl text-primary-foreground/90 mb-10">
              Join hundreds of businesses already using GrantFlow to secure funding.
            </p>
            <Link to="/auth">
              <Button size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-premium gap-2">
                <Sparkles className="h-5 w-5" />
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Award className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold text-foreground">GrantFlow</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 GrantFlow. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
