import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Target, Heart, Users, Award, Sparkles, ArrowRight, Linkedin, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function About() {
  const team = [
    {
      name: "Sarah Johnson",
      role: "Founder & CEO",
      bio: "Former grant writer with 15+ years helping small businesses secure funding.",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&crop=face",
    },
    {
      name: "Marcus Chen",
      role: "Head of Product",
      bio: "Tech entrepreneur passionate about making grant access easier for everyone.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
    },
    {
      name: "Aisha Williams",
      role: "AI & Engineering Lead",
      bio: "PhD in Machine Learning, building the AI that powers High Spirit's recommendations.",
      image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=300&h=300&fit=crop&crop=face",
    },
    {
      name: "David Rodriguez",
      role: "Customer Success",
      bio: "Dedicated to helping every user navigate their grant journey successfully.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
    },
  ];

  const values = [
    {
      icon: Target,
      title: "Mission-Driven",
      description: "We exist to democratize access to funding for small businesses and entrepreneurs who need it most.",
    },
    {
      icon: Heart,
      title: "Community First",
      description: "We build for the underserved communities that traditional systems have overlooked.",
    },
    {
      icon: Users,
      title: "Inclusive by Design",
      description: "Our platform is built to be accessible and helpful for everyone, regardless of background.",
    },
    {
      icon: Award,
      title: "Excellence",
      description: "We strive for the highest quality in everything we do, from our AI to our customer support.",
    },
  ];

  const milestones = [
    { year: "2022", title: "Founded", description: "High Spirit was born from a simple idea: make grant finding easier." },
    { year: "2023", title: "AI Launch", description: "Launched our AI-powered grant matching and coaching features." },
    { year: "2024", title: "10K Users", description: "Reached 10,000 active users and $50M+ in grants tracked." },
    { year: "2025", title: "Expanding", description: "Growing our team and features to serve more entrepreneurs." },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">HS</span>
              </div>
              <span className="font-bold text-lg text-foreground">High Spirit</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/80" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-white/90 text-sm font-medium">Our Story</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Empowering Entrepreneurs<br />to Win More Grants
            </h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              We're on a mission to level the playing field and help small business owners access the funding they deserve.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Why We Built High Spirit
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Every year, billions of dollars in grants go unclaimed. Not because businesses don't deserve them, but because the process of finding and applying for grants is overwhelming, time-consuming, and often inaccessible.
                </p>
                <p>
                  Our founder, Sarah, spent 15 years as a professional grant writer. She saw firsthand how small businesses—especially those led by women and minorities—struggled to compete for funding against larger organizations with dedicated grant teams.
                </p>
                <p>
                  High Spirit was born from a simple belief: <span className="text-foreground font-medium">every entrepreneur deserves a fair shot at funding</span>. We built an AI-powered platform that makes grant discovery, tracking, and application as simple as possible.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl p-8">
                <div className="grid grid-cols-2 gap-4">
                  {milestones.map((milestone, index) => (
                    <Card key={milestone.year} className="border-border/50">
                      <CardContent className="p-4">
                        <div className="text-accent font-bold text-xl mb-1">{milestone.year}</div>
                        <div className="font-semibold text-foreground text-sm mb-1">{milestone.title}</div>
                        <p className="text-xs text-muted-foreground">{milestone.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Our Values</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              These principles guide everything we do at High Spirit.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full border-border/50 hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <value.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{value.title}</h3>
                    <p className="text-sm text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Meet Our Team</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A diverse group of experts united by a passion for helping entrepreneurs succeed.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="group h-full border-border/50 hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <CardContent className="p-0">
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="font-semibold text-foreground text-lg">{member.name}</h3>
                      <p className="text-accent font-medium text-sm mb-2">{member.role}</p>
                      <p className="text-sm text-muted-foreground">{member.bio}</p>
                      <div className="flex gap-2 mt-4">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Linkedin className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Twitter className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary via-primary/90 to-primary/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Start Your Grant Journey?
            </h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              Join thousands of entrepreneurs who are using High Spirit to discover and win grants.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  Contact Us
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-white/60 text-sm">
            © {new Date().getFullYear()} High Spirit Financial & IT Solutions. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
