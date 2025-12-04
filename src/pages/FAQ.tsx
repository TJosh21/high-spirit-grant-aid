import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, HelpCircle, Search, ArrowRight, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";

export default function FAQ() {
  const [searchQuery, setSearchQuery] = useState("");

  const faqCategories = [
    {
      title: "Getting Started",
      faqs: [
        {
          question: "What is High Spirit Grant Assistant?",
          answer: "High Spirit Grant Assistant is an AI-powered platform designed to help small businesses and entrepreneurs discover, track, and apply for grants. We simplify the grant-finding process by matching you with relevant opportunities based on your business profile and providing AI coaching to strengthen your applications.",
        },
        {
          question: "Is High Spirit free to use?",
          answer: "We offer a free Starter plan that includes basic grant discovery and tracking features. For access to AI coaching, advanced matching, and premium features, we offer Pro and Business plans. You can start with a free trial to explore all features before committing.",
        },
        {
          question: "How do I create an account?",
          answer: "Creating an account is simple! Click 'Get Started' or 'Sign Up' on our homepage, enter your email address, create a password, and complete your business profile. The more details you provide about your business, the better we can match you with relevant grants.",
        },
        {
          question: "Do I need any special qualifications to use High Spirit?",
          answer: "No special qualifications are needed to use High Spirit. Our platform is designed for entrepreneurs and small business owners at any stage. Whether you're just starting out or have an established business, you can benefit from our grant discovery and tracking tools.",
        },
      ],
    },
    {
      title: "Grant Discovery",
      faqs: [
        {
          question: "How does the AI grant matching work?",
          answer: "Our AI analyzes your business profile—including your industry, location, revenue, and ownership characteristics—and compares it against our database of available grants. We calculate a match score for each grant based on your eligibility criteria and present you with the most relevant opportunities.",
        },
        {
          question: "How often is the grant database updated?",
          answer: "Our grant database is updated daily. We continuously monitor grant sources including federal programs (SBIR/STTR), state agencies, corporate foundations, and nonprofit organizations to ensure you have access to the latest opportunities.",
        },
        {
          question: "Can I search for grants by specific criteria?",
          answer: "Yes! You can filter grants by industry, funding amount, deadline, location, and eligibility requirements. Our advanced search allows you to find grants that match your specific needs and qualifications.",
        },
        {
          question: "What types of grants are included?",
          answer: "We include a wide variety of grants: federal small business grants (SBIR, STTR), state and local government grants, corporate grants from companies like FedEx and Amazon, foundation grants, and specialty grants for women-owned, minority-owned, and veteran-owned businesses.",
        },
      ],
    },
    {
      title: "AI Coach & Applications",
      faqs: [
        {
          question: "What is the AI Coach feature?",
          answer: "The AI Coach is your personal grant writing assistant. You provide rough answers to grant application questions, and our AI helps polish your responses, suggests improvements, and ensures your answers are compelling and complete. It's like having a professional grant writer on your team.",
        },
        {
          question: "Will the AI write my entire application for me?",
          answer: "The AI Coach is designed to enhance and refine your answers, not replace your voice entirely. You provide the core content and ideas; the AI helps you express them more clearly and persuasively. This ensures your application remains authentic while being professionally polished.",
        },
        {
          question: "Can I save and reuse application answers?",
          answer: "Yes! High Spirit allows you to save your polished answers and reuse them for similar questions in future applications. This saves time and ensures consistency across your grant applications.",
        },
        {
          question: "How accurate are the AI suggestions?",
          answer: "Our AI is trained on successful grant applications and best practices in grant writing. While the suggestions are highly valuable, we recommend reviewing and customizing them to ensure they accurately represent your business and goals.",
        },
      ],
    },
    {
      title: "Account & Billing",
      faqs: [
        {
          question: "Can I cancel my subscription anytime?",
          answer: "Yes, you can cancel your subscription at any time from your account settings. If you cancel, you'll retain access to premium features until the end of your current billing period. There are no cancellation fees or long-term commitments.",
        },
        {
          question: "What payment methods do you accept?",
          answer: "We accept all major credit cards (Visa, Mastercard, American Express, Discover) and process payments securely through Stripe. For Business and Enterprise plans, we can also accommodate invoice-based payments.",
        },
        {
          question: "Is my data secure?",
          answer: "Absolutely. We use industry-standard encryption (SSL/TLS) for all data transmission and store your information securely. We never share your personal or business information with third parties without your consent. See our Privacy Policy for complete details.",
        },
        {
          question: "Can I upgrade or downgrade my plan?",
          answer: "Yes, you can change your plan at any time. Upgrades take effect immediately, and you'll be charged a prorated amount for the remainder of your billing period. Downgrades take effect at the start of your next billing cycle.",
        },
      ],
    },
    {
      title: "Grant Eligibility",
      faqs: [
        {
          question: "How do I know if I'm eligible for a grant?",
          answer: "Each grant listing on High Spirit includes detailed eligibility requirements. Our AI matching also considers your eligibility when scoring grants. Generally, eligibility depends on factors like business size, industry, location, ownership, and revenue. We recommend reviewing each grant's specific criteria before applying.",
        },
        {
          question: "Do I need to be a registered business to apply for grants?",
          answer: "Most grants require some form of business registration, such as an LLC, corporation, or sole proprietorship. Some grants also require specific certifications like Women-Owned Business Enterprise (WBE) or Minority Business Enterprise (MBE). Requirements vary by grant.",
        },
        {
          question: "Are grants taxable income?",
          answer: "In most cases, business grants are considered taxable income by the IRS. However, tax treatment can vary based on the type of grant and how funds are used. We recommend consulting with a tax professional for guidance specific to your situation.",
        },
        {
          question: "Can I apply for multiple grants at once?",
          answer: "Yes! In fact, we encourage applying to multiple relevant grants to increase your chances of success. High Spirit helps you track all your applications in one place so you can manage multiple submissions efficiently.",
        },
      ],
    },
  ];

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    faqs: category.faqs.filter(
      faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(category => category.faqs.length > 0);

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
              <HelpCircle className="w-4 h-4 text-accent" />
              <span className="text-white/90 text-sm font-medium">Help Center</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
              Find answers to common questions about grants, our platform, and how to maximize your funding success.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-6 text-lg bg-white border-0 shadow-lg"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredCategories.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No results found</h3>
              <p className="text-muted-foreground mb-6">
                We couldn't find any FAQs matching your search. Try different keywords or browse all categories.
              </p>
              <Button onClick={() => setSearchQuery("")} variant="outline">
                Clear Search
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-8">
              {filteredCategories.map((category, categoryIndex) => (
                <motion.div
                  key={category.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
                >
                  <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <span className="text-primary font-bold text-sm">{categoryIndex + 1}</span>
                    </div>
                    {category.title}
                  </h2>
                  
                  <Card className="border-border/50">
                    <CardContent className="p-0">
                      <Accordion type="single" collapsible className="w-full">
                        {category.faqs.map((faq, faqIndex) => (
                          <AccordionItem
                            key={faqIndex}
                            value={`${category.title}-${faqIndex}`}
                            className="border-border/50"
                          >
                            <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50 text-left">
                              <span className="font-medium text-foreground pr-4">{faq.question}</span>
                            </AccordionTrigger>
                            <AccordionContent className="px-6 pb-4 text-muted-foreground">
                              {faq.answer}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Still Have Questions CTA */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Still Have Questions?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Can't find what you're looking for? Our support team is here to help you succeed with your grant journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Contact Support
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline">
                  Get Started Free
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
