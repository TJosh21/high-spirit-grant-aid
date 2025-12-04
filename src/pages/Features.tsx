import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Award, 
  Search,
  Bot,
  Target,
  Bell,
  Shield,
  BarChart3,
  FileText,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';

const Features = () => {
  const mainFeatures = [
    {
      icon: Search,
      title: 'Smart Grant Search',
      description: 'Our AI-powered search engine analyzes your business profile and matches you with the most relevant funding opportunities from our comprehensive database.',
      benefits: [
        'Personalized grant recommendations',
        'Filter by amount, deadline, eligibility',
        'Daily new grant alerts',
        'Save searches for quick access'
      ]
    },
    {
      icon: Bot,
      title: 'AI Writing Coach',
      description: 'Get intelligent assistance to craft compelling grant applications. Our AI coach helps you write, edit, and polish your answers to maximize your chances of success.',
      benefits: [
        'Smart writing suggestions',
        'Grammar and tone improvements',
        'Industry-specific language',
        'Application templates'
      ]
    },
    {
      icon: Target,
      title: 'Application Tracker',
      description: 'Keep all your grant applications organized in one place. Track status, deadlines, and progress with our intuitive CRM-style dashboard.',
      benefits: [
        'Visual progress tracking',
        'Status updates and notes',
        'Application history',
        'Success rate analytics'
      ]
    },
    {
      icon: Bell,
      title: 'Deadline Reminders',
      description: 'Never miss an important deadline again. Our smart notification system keeps you informed about upcoming due dates and new opportunities.',
      benefits: [
        'Email notifications',
        'Custom reminder schedules',
        'Calendar integration',
        'Priority alerts for saved grants'
      ]
    }
  ];

  const additionalFeatures = [
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Track your grant application success rate and identify areas for improvement.'
    },
    {
      icon: FileText,
      title: 'Document Library',
      description: 'Store and organize commonly used documents for faster applications.'
    },
    {
      icon: Clock,
      title: 'Time Tracking',
      description: 'See how much time you save with our AI-powered assistance.'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Your data is protected with industry-standard encryption and security.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <Award className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">High Spirit</span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link to="/features" className="text-sm text-foreground font-medium">Features</Link>
              <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
              <Link to="/grants" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Browse Grants</Link>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link to="/auth" className="hidden sm:block">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link to="/auth">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary via-primary-hover to-[#0a1f3d]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge className="mb-6 px-4 py-2 bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20">
              Features
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-4">
              Powerful tools for grant success
            </h1>
            <p className="text-lg text-primary-foreground/85 max-w-2xl mx-auto">
              Everything you need to discover, apply for, and win more grants.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Features */}
      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {mainFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className={`flex flex-col ${index % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'} gap-8 md:gap-16 items-center`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground">{feature.title}</h3>
                  </div>
                  <p className="text-lg text-muted-foreground mb-6">
                    {feature.description}
                  </p>
                  <ul className="space-y-3">
                    {feature.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-status-success flex-shrink-0" />
                        <span className="text-foreground">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex-1">
                  <Card className="p-8 bg-muted/30 border-2 border-dashed border-border">
                    <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center">
                      <feature.icon className="h-16 w-16 text-primary/50" />
                    </div>
                  </Card>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features Grid */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              And much more...
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {additionalFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full text-center">
                  <CardHeader>
                    <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary via-primary-hover to-[#0a1f3d]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
              Ready to get started?
            </h2>
            <p className="text-lg text-primary-foreground/85 mb-8">
              Start your free trial today and see how High Spirit can help you win more grants.
            </p>
            <Link to="/auth">
              <Button size="lg" className="bg-accent hover:bg-accent-hover text-accent-foreground shadow-lg gap-2">
                <Sparkles className="h-5 w-5" />
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-background border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Award className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold text-foreground">High Spirit</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} High Spirit Financial & IT Solutions. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Features;
