import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Calendar, Clock, ArrowRight, BookOpen, Lightbulb, Trophy, TrendingUp } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

const articles = [
  {
    id: "grant-writing-tips",
    title: "10 Essential Grant Writing Tips for Small Business Success",
    excerpt: "Learn the proven strategies that successful grant applicants use to craft compelling proposals that stand out from the competition.",
    category: "Tips",
    readTime: "8 min read",
    date: "December 1, 2024",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop",
    featured: true,
  },
  {
    id: "success-story-cafe",
    title: "How Maria's Café Secured $50,000 in Grant Funding",
    excerpt: "Discover how a local coffee shop owner used High Spirit to find and win multiple small business grants to expand her operations.",
    category: "Success Story",
    readTime: "5 min read",
    date: "November 28, 2024",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop",
    featured: true,
  },
  {
    id: "federal-grants-guide",
    title: "Complete Guide to Federal Small Business Grants in 2024",
    excerpt: "Everything you need to know about federal grant programs, eligibility requirements, and application timelines.",
    category: "Guide",
    readTime: "12 min read",
    date: "November 25, 2024",
    image: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=600&h=400&fit=crop",
    featured: false,
  },
  {
    id: "common-mistakes",
    title: "5 Common Grant Application Mistakes to Avoid",
    excerpt: "Don't let these frequent errors derail your funding chances. Learn what reviewers look for and how to avoid rejection.",
    category: "Tips",
    readTime: "6 min read",
    date: "November 20, 2024",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&h=400&fit=crop",
    featured: false,
  },
  {
    id: "success-story-tech",
    title: "From Garage Startup to $100K Grant Winner",
    excerpt: "Tech entrepreneur James Chen shares his journey from bootstrapping to securing substantial grant funding for his AI startup.",
    category: "Success Story",
    readTime: "7 min read",
    date: "November 15, 2024",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&h=400&fit=crop",
    featured: false,
  },
  {
    id: "state-grants-overview",
    title: "State-Level Grants: Hidden Opportunities for Local Businesses",
    excerpt: "Many entrepreneurs overlook state grants. Here's how to find and apply for funding programs in your state.",
    category: "Guide",
    readTime: "10 min read",
    date: "November 10, 2024",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&h=400&fit=crop",
    featured: false,
  },
];

const categories = [
  { name: "All", icon: BookOpen },
  { name: "Tips", icon: Lightbulb },
  { name: "Success Story", icon: Trophy },
  { name: "Guide", icon: TrendingUp },
];

const Resources = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredArticles = articles.filter((article) => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All" || article.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredArticles = articles.filter((a) => a.featured);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground py-16 md:py-24">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.05%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="bg-accent text-accent-foreground mb-4">
              <BookOpen className="w-3 h-3 mr-1" />
              Resources & Insights
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Grant Tips & Success Stories
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-8">
              Expert advice, proven strategies, and inspiring stories to help you succeed in your grant applications.
            </p>
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 bg-white text-foreground border-0 shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      {!searchQuery && activeCategory === "All" && (
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-8">Featured Articles</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {featuredArticles.map((article) => (
                <Link key={article.id} to={`/resources/${article.id}`}>
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full">
                    <div className="relative h-48 md:h-56">
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover"
                      />
                      <Badge className="absolute top-4 left-4 bg-accent text-accent-foreground">
                        {article.category}
                      </Badge>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-primary mb-2 line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-muted-foreground mb-4 line-clamp-2">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {article.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {article.readTime}
                          </span>
                        </div>
                        <ArrowRight className="w-5 h-5 text-accent" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Category Filter & All Articles */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Button
                  key={cat.name}
                  variant={activeCategory === cat.name ? "default" : "outline"}
                  onClick={() => setActiveCategory(cat.name)}
                  className="gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {cat.name}
                </Button>
              );
            })}
          </div>

          {/* Articles Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <Link key={article.id} to={`/resources/${article.id}`}>
                <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full">
                  <div className="relative h-40">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                    <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground text-xs">
                      {article.category}
                    </Badge>
                  </div>
                  <CardContent className="p-5">
                    <h3 className="text-lg font-bold text-primary mb-2 line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {article.readTime}
                      </span>
                      <span>{article.date}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {filteredArticles.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-primary mb-2">No articles found</h3>
              <p className="text-muted-foreground">Try adjusting your search or category filter.</p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-12 md:py-16 bg-gradient-to-r from-primary to-primary/90">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto text-center p-8 md:p-12 bg-white/95 backdrop-blur">
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">
              Get Grant Tips in Your Inbox
            </h2>
            <p className="text-muted-foreground mb-6">
              Subscribe to receive weekly grant opportunities, tips, and success stories directly to your email.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                className="h-12"
              />
              <Button className="h-12 px-8 bg-accent hover:bg-accent/90 text-accent-foreground">
                Subscribe
              </Button>
            </div>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Resources;
