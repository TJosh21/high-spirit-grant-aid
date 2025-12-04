import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Award, 
  Search, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2,
  Target,
  Clock,
  TrendingUp,
  Bot,
  Bell,
  Shield,
  Building2,
  Users,
  Palette,
  Briefcase,
  Star,
  Play,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '@/components/ThemeToggle';
import { StatCard } from '@/components/ui/stat-card';

const Welcome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/home');
    }
  }, [user, navigate]);

  const features = [
    {
      icon: Search,
      title: 'Smart Grant Search',
      description: 'Discover funding opportunities matched to your business profile with AI-powered recommendations.'
    },
    {
      icon: Bot,
      title: 'AI Writing Coach',
      description: 'Get intelligent suggestions to craft compelling grant applications that win.'
    },
    {
      icon: Target,
      title: 'Application Tracker',
      description: 'Monitor all your applications in one place with status updates and progress tracking.'
    },
    {
      icon: Bell,
      title: 'Deadline Reminders',
      description: 'Never miss an opportunity with automatic alerts for upcoming deadlines.'
    },
    {
      icon: Award,
      title: 'Saved Grants Library',
      description: 'Build your personalized library of potential grants to apply for when ready.'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your data is protected with enterprise-grade security and encryption.'
    }
  ];

  const whoItsFor = [
    { icon: Building2, label: 'Small Businesses', desc: 'Growing companies seeking funding' },
    { icon: Users, label: 'Nonprofits', desc: 'Organizations making an impact' },
    { icon: Palette, label: 'Creators', desc: 'Artists and innovators' },
    { icon: Briefcase, label: 'Consultants', desc: 'Professionals helping clients' }
  ];

  const howItWorks = [
    {
      step: '01',
      title: 'Tell us about your business',
      description: 'Create your profile with basic information about your organization and funding needs.'
    },
    {
      step: '02',
      title: 'Get AI-matched grants',
      description: 'Our intelligent system finds funding opportunities that match your specific criteria.'
    },
    {
      step: '03',
      title: 'Track and apply with confidence',
      description: 'Use our AI coach to write winning applications and track your progress.'
    }
  ];

  const testimonials = [
    {
      quote: "High Spirit helped us secure $50,000 in funding for our nonprofit. The AI coach made writing applications so much easier!",
      author: "Sarah M.",
      role: "Executive Director, Community Foundation",
      rating: 5
    },
    {
      quote: "I was spending hours searching for grants. Now I get matched opportunities delivered to me. Game changer!",
      author: "Marcus T.",
      role: "Small Business Owner",
      rating: 5
    },
    {
      quote: "The deadline reminders alone have saved me from missing countless opportunities. Highly recommend!",
      author: "Jennifer L.",
      role: "Grant Consultant",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Award className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">High Spirit</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <Link to="/features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</Link>
              <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
              <Link to="/grants" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Browse Grants</Link>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link to="/auth" className="hidden sm:block">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link to="/auth">
                <Button size="sm" className="gap-1">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-hover to-[#0a1f3d] py-16 md:py-24 lg:py-32">
        {/* Background effects */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 h-64 w-64 rounded-full bg-primary-foreground blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-accent blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="mb-6 px-4 py-2 bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/15">
                <Sparkles className="h-4 w-4 mr-2" />
                AI-Powered Grant Assistant
              </Badge>
              
              <h1 className="mb-6 text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight tracking-tight">
                Win More Grants with{' '}
                <span className="bg-gradient-to-r from-accent to-accent-hover bg-clip-text text-transparent">
                  AI Assistance
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-primary-foreground/85 mb-10 max-w-2xl mx-auto">
                Discover funding opportunities, track applications, and write winning proposals with High Spirit Grant Assistant.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/auth">
                  <Button size="lg" className="w-full sm:w-auto bg-accent hover:bg-accent-hover text-accent-foreground shadow-lg gap-2 group">
                    <Sparkles className="h-5 w-5" />
                    Start Free Trial
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="w-full sm:w-auto bg-transparent border-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 gap-2"
                >
                  <Play className="h-4 w-4" />
                  Watch Demo
                </Button>
              </div>

              {/* Stats */}
              <div className="mt-16 grid grid-cols-3 gap-6 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary-foreground">70%</div>
                  <div className="text-sm text-primary-foreground/70 mt-1">Time Saved</div>
                </div>
                <div className="text-center border-x border-primary-foreground/20 px-4">
                  <div className="text-3xl md:text-4xl font-bold text-primary-foreground">2x</div>
                  <div className="text-sm text-primary-foreground/70 mt-1">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary-foreground">500+</div>
                  <div className="text-sm text-primary-foreground/70 mt-1">Active Users</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="py-12 md:py-16 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {whoItsFor.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-4"
              >
                <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <item.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{item.label}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4">How It Works</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Start winning grants in 3 simple steps
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our streamlined process makes it easy to find and apply for funding opportunities.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative"
              >
                <Card className="h-full border-2 hover:border-primary/30 transition-colors">
                  <CardHeader>
                    <div className="flex items-center gap-4 mb-2">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold text-lg">
                        {step.step}
                      </div>
                      {index < howItWorks.length - 1 && (
                        <div className="hidden md:block flex-1 h-0.5 bg-border" />
                      )}
                    </div>
                    <CardTitle className="text-lg">{step.title}</CardTitle>
                    <CardDescription className="text-base">{step.description}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4">Features</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful tools designed to streamline your grant application process.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-md transition-shadow group">
                  <CardHeader>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-4 group-hover:bg-primary/15 transition-colors">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg mb-2">{feature.title}</CardTitle>
                    <CardDescription className="text-base">{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / Testimonials */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4">Testimonials</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Trusted by grant seekers everywhere
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="pt-6">
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                      ))}
                    </div>
                    <p className="text-foreground mb-6 italic">"{testimonial.quote}"</p>
                    <div>
                      <p className="font-semibold text-foreground">{testimonial.author}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why High Spirit - Stats */}
      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4">Why High Spirit</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Results that speak for themselves
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <StatCard
              label="Time Saved"
              value="70%"
              icon={Clock}
              variant="elevated"
              tone="success"
            />
            <StatCard
              label="Success Rate"
              value="2x"
              icon={TrendingUp}
              variant="elevated"
              tone="accent"
            />
            <StatCard
              label="Active Users"
              value="500+"
              icon={Users}
              variant="elevated"
              tone="info"
            />
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-12 md:py-16 bg-muted/30 border-y border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-xl font-semibold text-foreground mb-2">Simple, transparent pricing</h3>
          <p className="text-muted-foreground mb-6">No hidden fees. Cancel anytime.</p>
          <Link to="/pricing">
            <Button variant="outline" className="gap-2">
              View Pricing
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary via-primary-hover to-[#0a1f3d]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
              Ready to win your next grant?
            </h2>
            <p className="text-lg text-primary-foreground/85 mb-8 max-w-2xl mx-auto">
              Join hundreds of businesses already using High Spirit to secure funding for their dreams.
            </p>
            <Link to="/auth">
              <Button size="lg" className="bg-accent hover:bg-accent-hover text-accent-foreground shadow-lg gap-2">
                <Sparkles className="h-5 w-5" />
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-background border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Award className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold text-foreground">High Spirit</span>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered grant assistant for serious builders.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2">
                <li><Link to="/features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</Link></li>
                <li><Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link></li>
                <li><Link to="/grants" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Browse Grants</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link></li>
                <li><Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</Link></li>
                <li><Link to="/faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} High Spirit Financial & IT Solutions. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Welcome;
