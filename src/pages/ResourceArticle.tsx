import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, Share2, BookOpen, ChevronRight } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { toast } from "sonner";

const articlesData: Record<string, {
  title: string;
  category: string;
  readTime: string;
  date: string;
  image: string;
  content: string[];
  author: { name: string; role: string };
  relatedIds: string[];
}> = {
  "grant-writing-tips": {
    title: "10 Essential Grant Writing Tips for Small Business Success",
    category: "Tips",
    readTime: "8 min read",
    date: "December 1, 2024",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=600&fit=crop",
    author: { name: "Sarah Mitchell", role: "Grant Writing Expert" },
    relatedIds: ["common-mistakes", "federal-grants-guide"],
    content: [
      "## Introduction",
      "Grant writing is both an art and a science. Whether you're a first-time applicant or looking to improve your success rate, these proven strategies will help you craft compelling proposals that stand out from the competition.",
      "## 1. Start with Research",
      "Before you begin writing, thoroughly research the grant opportunity. Understand the funder's priorities, past recipients, and exactly what they're looking for. This foundational step can make or break your application.",
      "## 2. Tell Your Story Compellingly",
      "Funders receive hundreds of applications. What makes yours unique? Share your business journey, challenges overcome, and the impact you've made. Personal stories resonate more than statistics alone.",
      "## 3. Be Specific About Your Goals",
      "Vague objectives won't win grants. Use the SMART framework: Specific, Measurable, Achievable, Relevant, and Time-bound. Show funders exactly how you'll use their investment.",
      "## 4. Demonstrate Community Impact",
      "Grant makers want to see ripple effects. How does your business benefit your local community? Job creation, economic growth, and social impact are powerful selling points.",
      "## 5. Build a Strong Budget",
      "Your budget should be detailed, realistic, and directly tied to your objectives. Include both direct and indirect costs, and be prepared to justify every line item.",
      "## 6. Gather Supporting Documents Early",
      "Don't wait until the deadline to collect financial statements, tax returns, and letters of support. Having these ready reduces stress and ensures completeness.",
      "## 7. Follow Instructions Precisely",
      "This sounds simple, but many applications are rejected for not following guidelines. Page limits, font sizes, required sections—attention to detail matters.",
      "## 8. Use Clear, Jargon-Free Language",
      "Reviewers may not be experts in your industry. Write clearly and explain technical concepts. If a high school student can understand your proposal, you're on the right track.",
      "## 9. Get Feedback Before Submitting",
      "Fresh eyes catch errors and unclear passages. Ask colleagues, mentors, or use AI tools to review your application before the deadline.",
      "## 10. Submit Early",
      "Technical issues happen. Submitting a day or two before the deadline gives you buffer time to resolve any problems and shows professionalism.",
      "## Conclusion",
      "Grant writing success doesn't happen overnight. Each application is a learning experience. Keep refining your approach, and don't be discouraged by rejections—they're part of the journey to funding success.",
    ],
  },
  "success-story-cafe": {
    title: "How Maria's Café Secured $50,000 in Grant Funding",
    category: "Success Story",
    readTime: "5 min read",
    date: "November 28, 2024",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&h=600&fit=crop",
    author: { name: "High Spirit Team", role: "Editorial" },
    relatedIds: ["success-story-tech", "grant-writing-tips"],
    content: [
      "## The Beginning",
      "Maria Rodriguez had always dreamed of opening her own café. After years of working in the food service industry, she finally took the leap in 2021, opening Maria's Café in downtown Austin, Texas.",
      "## The Challenge",
      "Like many small business owners, Maria faced significant challenges. Rising ingredient costs, competition from chain coffee shops, and the need for better equipment threatened her dream. She needed capital to expand but didn't want to take on more debt.",
      "## Discovering High Spirit",
      "\"A friend told me about High Spirit,\" Maria recalls. \"At first, I was skeptical. I didn't even know grants for small businesses like mine existed. I thought grants were only for nonprofits or tech startups.\"",
      "## The Journey",
      "Using High Spirit's AI-powered matching, Maria discovered she was eligible for several grants targeting minority-owned businesses, women entrepreneurs, and local food establishments. She was surprised by how many opportunities matched her profile.",
      "## The Application Process",
      "\"The AI coaching feature was a game-changer,\" Maria explains. \"I'm not a writer, and English is my second language. The tool helped me polish my answers and tell my story in a way that really connected with reviewers.\"",
      "## The Results",
      "Over six months, Maria applied for five grants and won three:",
      "- $25,000 from a state economic development program",
      "- $15,000 from a women-owned business initiative",
      "- $10,000 from a local community foundation",
      "## The Impact",
      "With her grant funding, Maria was able to purchase a commercial espresso machine, expand her seating area, and hire two additional employees. Her revenue has increased by 40% since receiving the funding.",
      "## Advice for Others",
      "\"Don't be afraid to apply,\" Maria advises. \"The worst they can say is no. And with tools like High Spirit, you have support every step of the way. My only regret is not starting sooner.\"",
      "## What's Next",
      "Maria is now working on her next grant application to fund a community job training program at her café. \"This is just the beginning,\" she says with a smile.",
    ],
  },
  "federal-grants-guide": {
    title: "Complete Guide to Federal Small Business Grants in 2024",
    category: "Guide",
    readTime: "12 min read",
    date: "November 25, 2024",
    image: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=1200&h=600&fit=crop",
    author: { name: "David Chen", role: "Policy Analyst" },
    relatedIds: ["state-grants-overview", "grant-writing-tips"],
    content: [
      "## Understanding Federal Grants",
      "Federal grants represent one of the largest sources of funding for small businesses in the United States. Unlike loans, grants don't need to be repaid, making them an attractive option for entrepreneurs looking to grow their businesses.",
      "## Major Federal Grant Programs",
      "### Small Business Innovation Research (SBIR)",
      "The SBIR program is one of the most well-known federal grant programs, with over $3 billion awarded annually. It focuses on research and development projects with commercial potential.",
      "### Small Business Technology Transfer (STTR)",
      "Similar to SBIR, STTR requires partnerships between small businesses and research institutions. It's ideal for businesses developing cutting-edge technologies.",
      "### Community Development Block Grants",
      "These grants, administered through HUD, support economic development in low and moderate-income communities. They can fund business expansion, job creation, and infrastructure improvements.",
      "## Eligibility Requirements",
      "Federal grants typically have specific eligibility criteria:",
      "- Business must be registered and in good standing",
      "- Meet small business size standards (varies by industry)",
      "- U.S.-based operations",
      "- Specific industry or demographic requirements depending on the grant",
      "## The Application Process",
      "Federal grant applications are typically more rigorous than private grants. Expect to provide:",
      "- Detailed business plans",
      "- Financial projections",
      "- Technical specifications (for R&D grants)",
      "- Letters of support",
      "- SAM.gov registration",
      "## Timeline Expectations",
      "Federal grant processes can take 6-12 months from application to funding. Plan accordingly and don't rely on grant funding for immediate needs.",
      "## Tips for Success",
      "1. Register on SAM.gov well in advance",
      "2. Sign up for Grants.gov notifications",
      "3. Start applications early—they're complex",
      "4. Seek help from Small Business Development Centers",
      "5. Review past award recipients for insights",
      "## Resources",
      "- Grants.gov: Primary portal for federal grants",
      "- SBA.gov: Small Business Administration resources",
      "- SBIR.gov: Innovation research program information",
      "## Conclusion",
      "While federal grants are competitive, they offer substantial funding opportunities for prepared businesses. Start your research today and position your business for success.",
    ],
  },
  "common-mistakes": {
    title: "5 Common Grant Application Mistakes to Avoid",
    category: "Tips",
    readTime: "6 min read",
    date: "November 20, 2024",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&h=600&fit=crop",
    author: { name: "Jennifer Park", role: "Grant Consultant" },
    relatedIds: ["grant-writing-tips", "federal-grants-guide"],
    content: [
      "## Introduction",
      "After reviewing thousands of grant applications, certain patterns emerge. Here are the five most common mistakes that lead to rejection—and how to avoid them.",
      "## Mistake #1: Not Reading the Guidelines",
      "It sounds obvious, but a surprising number of applications are rejected because they don't follow basic instructions. Page limits, required attachments, formatting requirements—these details matter.",
      "**Solution:** Create a checklist from the guidelines and verify each item before submitting.",
      "## Mistake #2: Generic, One-Size-Fits-All Applications",
      "Funders can tell when you've copied and pasted from another application. Each grant has unique priorities and selection criteria.",
      "**Solution:** Customize every application. Reference the funder's mission and explain specifically why you're a good fit for their program.",
      "## Mistake #3: Weak or Missing Budget Justification",
      "A budget without explanation raises red flags. Reviewers want to understand not just what you'll spend, but why each expense is necessary.",
      "**Solution:** Include a narrative that connects each budget line to your project goals.",
      "## Mistake #4: Overlooking Eligibility Requirements",
      "Nothing wastes more time than applying for grants you don't qualify for. Some requirements are obvious; others are buried in fine print.",
      "**Solution:** Verify eligibility before investing time in the application. When in doubt, contact the funder.",
      "## Mistake #5: Submitting at the Last Minute",
      "Technical glitches, missing documents, overlooked errors—rushing leads to preventable problems.",
      "**Solution:** Aim to submit at least 48 hours before the deadline. Give yourself time to troubleshoot.",
      "## Bonus: Not Following Up",
      "Many applicants never request feedback after rejection. This information is invaluable for future applications.",
      "**Solution:** Always ask for reviewer comments when available. Use them to strengthen future proposals.",
      "## Conclusion",
      "Grant writing success is often about avoiding common pitfalls as much as excelling in any single area. Eliminate these mistakes, and you'll already be ahead of most applicants.",
    ],
  },
  "success-story-tech": {
    title: "From Garage Startup to $100K Grant Winner",
    category: "Success Story",
    readTime: "7 min read",
    date: "November 15, 2024",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&h=600&fit=crop",
    author: { name: "High Spirit Team", role: "Editorial" },
    relatedIds: ["success-story-cafe", "federal-grants-guide"],
    content: [
      "## The Vision",
      "James Chen started his AI startup in his garage in San Jose. His vision? Using artificial intelligence to help small retailers compete with e-commerce giants through personalized customer experiences.",
      "## Early Struggles",
      "\"We had the technology, but no runway,\" James recalls. \"Traditional VC funding wasn't interested in B2B retail tech at the time. We needed a different path.\"",
      "## The Grant Strategy",
      "James discovered that federal SBIR grants were perfect for his situation—they fund innovative technology development without requiring equity.",
      "## Finding the Right Fit",
      "Using High Spirit, James identified three SBIR programs aligned with his technology:",
      "- NSF's Small Business Innovation Research",
      "- SBA's Growth Accelerator Fund",
      "- A state-level technology commercialization grant",
      "## The Application Journey",
      "\"SBIR applications are intense,\" James admits. \"You need technical documentation, market analysis, and commercialization plans. High Spirit's AI coach helped me translate complex AI concepts into reviewer-friendly language.\"",
      "## Phase I Success",
      "James won a $50,000 Phase I SBIR grant from NSF. This funding allowed him to complete his prototype and validate the technology with real retail partners.",
      "## Building Momentum",
      "The Phase I success opened doors. James went on to win:",
      "- $50,000 Phase II follow-on funding",
      "- $25,000 state commercialization grant",
      "- $25,000 from a private accelerator program",
      "## The Impact",
      "Today, James's company employs 12 people and serves over 100 retail clients. The non-dilutive grant funding allowed him to retain full ownership while proving his concept.",
      "## Lessons Learned",
      "\"Grants aren't just about money,\" James reflects. \"The validation from winning competitive federal grants gave us credibility with customers and future investors. It changed our trajectory.\"",
      "## Advice for Tech Founders",
      "\"If you're building innovative technology, look at SBIR seriously. Yes, the applications take time, but the funding is substantial and completely non-dilutive. Tools like High Spirit make the process much more manageable.\"",
    ],
  },
  "state-grants-overview": {
    title: "State-Level Grants: Hidden Opportunities for Local Businesses",
    category: "Guide",
    readTime: "10 min read",
    date: "November 10, 2024",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&h=600&fit=crop",
    author: { name: "Michelle Torres", role: "Economic Development Specialist" },
    relatedIds: ["federal-grants-guide", "grant-writing-tips"],
    content: [
      "## The Overlooked Opportunity",
      "While federal grants get most of the attention, state-level programs often offer better odds of success and less competition. Many entrepreneurs don't even know these programs exist.",
      "## Why State Grants Matter",
      "State economic development agencies are highly motivated to support local businesses. They have specific goals around job creation, industry diversification, and community development that create unique funding opportunities.",
      "## Types of State Grant Programs",
      "### Economic Development Grants",
      "Most states offer grants for businesses that create jobs or invest in underserved areas. These can range from $5,000 to $500,000+.",
      "### Workforce Training Grants",
      "Many states will pay for employee training programs. These grants offset the cost of developing your team's skills.",
      "### Technology & Innovation Grants",
      "States with tech sectors often have programs to support R&D, commercialization, and tech transfer from universities.",
      "### Industry-Specific Programs",
      "Agriculture, manufacturing, clean energy—many states have targeted programs for priority industries.",
      "## How to Find State Grants",
      "1. Start with your state's economic development agency website",
      "2. Contact your local Small Business Development Center (SBDC)",
      "3. Check with your city or county economic development office",
      "4. Use grant databases that include state programs (like High Spirit)",
      "## State Grant Advantages",
      "- Less competition than federal programs",
      "- Often faster review and funding timelines",
      "- Program officers are typically more accessible",
      "- Many have rolling deadlines rather than annual cycles",
      "## Application Tips",
      "State grants often emphasize local impact. Be prepared to discuss:",
      "- Jobs you'll create or retain",
      "- Investment in the local economy",
      "- Community partnerships",
      "- Long-term commitment to the area",
      "## Example Programs by State",
      "While programs change frequently, here are examples of the types of opportunities available:",
      "- California: California Competes Tax Credit",
      "- Texas: Texas Enterprise Fund",
      "- New York: Excelsior Jobs Program",
      "- Florida: Quick Response Training Program",
      "## Getting Started",
      "The best first step is contacting your local SBDC. These free consulting services can help you navigate available programs and strengthen your applications.",
      "## Conclusion",
      "State grants represent a significant, underutilized funding source. With less competition and more accessible program managers, they're often the best place to start your grant journey.",
    ],
  },
};

const ResourceArticle = () => {
  const { articleId } = useParams<{ articleId: string }>();
  const article = articleId ? articlesData[articleId] : null;

  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: article?.title,
          url: shareUrl,
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!");
    }
  };

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-16 text-center">
          <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-primary mb-2">Article Not Found</h1>
          <p className="text-muted-foreground mb-6">The article you're looking for doesn't exist.</p>
          <Link to="/resources">
            <Button>Back to Resources</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const relatedArticles = article.relatedIds
    .map((id) => ({ id, ...articlesData[id] }))
    .filter((a) => a.title);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Image */}
      <div className="relative h-64 md:h-96 w-full">
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </div>

      <div className="container mx-auto px-4 -mt-32 relative z-10">
        <article className="max-w-3xl mx-auto">
          {/* Article Header */}
          <Card className="p-6 md:p-10 mb-8">
            <div className="flex items-center justify-between mb-4">
              <Link to="/resources">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Resources
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleShare} className="gap-2">
                <Share2 className="w-4 h-4" />
                Share
              </Button>
            </div>

            <Badge className="bg-accent text-accent-foreground mb-4">
              {article.category}
            </Badge>

            <h1 className="text-2xl md:text-4xl font-bold text-primary mb-4">
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {article.date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {article.readTime}
              </span>
            </div>

            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                {article.author.name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-primary">{article.author.name}</p>
                <p className="text-sm text-muted-foreground">{article.author.role}</p>
              </div>
            </div>
          </Card>

          {/* Article Content */}
          <Card className="p-6 md:p-10 mb-8">
            <div className="prose prose-lg max-w-none">
              {article.content.map((paragraph, index) => {
                if (paragraph.startsWith("## ")) {
                  return (
                    <h2 key={index} className="text-xl md:text-2xl font-bold text-primary mt-8 mb-4 first:mt-0">
                      {paragraph.replace("## ", "")}
                    </h2>
                  );
                }
                if (paragraph.startsWith("### ")) {
                  return (
                    <h3 key={index} className="text-lg md:text-xl font-semibold text-primary mt-6 mb-3">
                      {paragraph.replace("### ", "")}
                    </h3>
                  );
                }
                if (paragraph.startsWith("- ")) {
                  return (
                    <li key={index} className="text-muted-foreground ml-4 mb-2">
                      {paragraph.replace("- ", "")}
                    </li>
                  );
                }
                if (paragraph.startsWith("**")) {
                  return (
                    <p key={index} className="text-muted-foreground mb-4 font-semibold">
                      {paragraph.replace(/\*\*/g, "")}
                    </p>
                  );
                }
                return (
                  <p key={index} className="text-muted-foreground mb-4 leading-relaxed">
                    {paragraph}
                  </p>
                );
              })}
            </div>
          </Card>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <div className="mb-16">
              <h2 className="text-xl font-bold text-primary mb-6">Related Articles</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {relatedArticles.map((related) => (
                  <Link key={related.id} to={`/resources/${related.id}`}>
                    <Card className="p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                      <div className="flex gap-4">
                        <img
                          src={related.image}
                          alt={related.title}
                          className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <Badge className="bg-accent/20 text-accent-foreground text-xs mb-2">
                            {related.category}
                          </Badge>
                          <h3 className="font-semibold text-primary line-clamp-2 text-sm">
                            {related.title}
                          </h3>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                            <Clock className="w-3 h-3" />
                            {related.readTime}
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>
      </div>

      <Footer />
    </div>
  );
};

export default ResourceArticle;
