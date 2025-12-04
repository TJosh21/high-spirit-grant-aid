import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Award, 
  Check,
  ArrowRight,
  Sparkles,
  Zap,
  Crown
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';
import { cn } from '@/lib/utils';

const Pricing = () => {
  const plans = [
    {
      name: 'Starter',
      description: 'Perfect for individuals just getting started',
      price: 'Free',
      period: '',
      icon: Sparkles,
      features: [
        'Browse unlimited grants',
        'Save up to 10 grants',
        'Basic application tracking',
        'Email deadline reminders',
        'Community support'
      ],
      cta: 'Get Started Free',
      variant: 'outline' as const,
      popular: false
    },
    {
      name: 'Pro',
      description: 'For serious grant seekers',
      price: '$29',
      period: '/month',
      icon: Zap,
      features: [
        'Everything in Starter',
        'Unlimited saved grants',
        'AI Writing Coach',
        'Priority grant matching',
        'Advanced analytics',
        'Export applications',
        'Priority email support'
      ],
      cta: 'Start Pro Trial',
      variant: 'default' as const,
      popular: true
    },
    {
      name: 'Business',
      description: 'For teams and organizations',
      price: '$79',
      period: '/month',
      icon: Crown,
      features: [
        'Everything in Pro',
        'Up to 5 team members',
        'Team collaboration tools',
        'Custom grant alerts',
        'API access',
        'Dedicated account manager',
        'Phone support'
      ],
      cta: 'Contact Sales',
      variant: 'outline' as const,
      popular: false
    }
  ];

  const includedInAll = [
    'No hidden fees',
    'Cancel anytime',
    'Data security & encryption',
    'Regular feature updates',
    'Mobile-friendly access'
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
              <Link to="/features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</Link>
              <Link to="/pricing" className="text-sm text-foreground font-medium">Pricing</Link>
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
              Pricing
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-4">
              Simple, transparent pricing
            </h1>
            <p className="text-lg text-primary-foreground/85 max-w-2xl mx-auto">
              Choose the plan that's right for you. No hidden fees, cancel anytime.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="bg-accent text-accent-foreground px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <Card className={cn(
                  "h-full",
                  plan.popular && "border-2 border-accent shadow-lg"
                )}>
                  <CardHeader className="text-center pb-4">
                    <div className={cn(
                      "w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center",
                      plan.popular ? "bg-accent/20" : "bg-primary/10"
                    )}>
                      <plan.icon className={cn(
                        "h-6 w-6",
                        plan.popular ? "text-accent" : "text-primary"
                      )} />
                    </div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                      {plan.period && (
                        <span className="text-muted-foreground">{plan.period}</span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-status-success flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link to="/auth">
                      <Button 
                        variant={plan.variant} 
                        className={cn(
                          "w-full",
                          plan.popular && "bg-accent hover:bg-accent-hover text-accent-foreground"
                        )}
                      >
                        {plan.cta}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Included in All Plans */}
      <section className="py-16 bg-muted/30 border-y border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-xl font-semibold text-foreground text-center mb-8">
            Included in all plans
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            {includedInAll.map((item) => (
              <div key={item} className="flex items-center gap-2 px-4 py-2 bg-background rounded-full border border-border">
                <Check className="h-4 w-4 text-status-success" />
                <span className="text-sm text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Have questions?
          </h2>
          <p className="text-muted-foreground mb-6">
            Check out our FAQ or contact our support team.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/faq">
              <Button variant="outline">View FAQ</Button>
            </Link>
            <Link to="/contact">
              <Button variant="ghost">Contact Support</Button>
            </Link>
          </div>
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

export default Pricing;
