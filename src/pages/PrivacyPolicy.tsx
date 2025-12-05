import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Calendar } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground py-16 md:py-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.05%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="bg-accent text-accent-foreground mb-4">
              <Shield className="w-3 h-3 mr-1" />
              Legal
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Privacy Policy
            </h1>
            <p className="text-lg text-primary-foreground/80 flex items-center justify-center gap-2">
              <Calendar className="w-4 h-4" />
              Last updated: December 5, 2024
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-8 md:p-12 prose prose-slate max-w-none">
              <h2 className="text-2xl font-bold text-primary mb-4">1. Introduction</h2>
              <p className="text-muted-foreground mb-6">
                High Spirit Grant Assistant ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our grant discovery and application assistance platform.
              </p>

              <h2 className="text-2xl font-bold text-primary mb-4">2. Information We Collect</h2>
              <h3 className="text-lg font-semibold text-primary mb-2">Personal Information</h3>
              <p className="text-muted-foreground mb-4">
                When you create an account, we may collect:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-2">
                <li>Name and email address</li>
                <li>Business name and description</li>
                <li>Business industry and stage</li>
                <li>Location (state/region)</li>
                <li>Annual revenue range</li>
                <li>Demographic information (optional)</li>
              </ul>

              <h3 className="text-lg font-semibold text-primary mb-2">Usage Information</h3>
              <p className="text-muted-foreground mb-6">
                We automatically collect certain information when you use our platform, including grants you view, save, or apply to; AI coaching sessions and responses; application progress and status updates; and device and browser information.
              </p>

              <h2 className="text-2xl font-bold text-primary mb-4">3. How We Use Your Information</h2>
              <p className="text-muted-foreground mb-4">We use your information to:</p>
              <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-2">
                <li>Provide personalized grant recommendations</li>
                <li>Power our AI coaching features</li>
                <li>Track your application progress</li>
                <li>Send relevant notifications and updates</li>
                <li>Improve our services and user experience</li>
                <li>Communicate important platform updates</li>
              </ul>

              <h2 className="text-2xl font-bold text-primary mb-4">4. Information Sharing</h2>
              <p className="text-muted-foreground mb-6">
                We do not sell your personal information. We may share information with service providers who assist in operating our platform, when required by law, or with your consent. Grant applications are submitted directly to the respective funding organizations.
              </p>

              <h2 className="text-2xl font-bold text-primary mb-4">5. Data Security</h2>
              <p className="text-muted-foreground mb-6">
                We implement industry-standard security measures to protect your data, including encryption in transit and at rest, secure authentication, and regular security assessments. However, no method of transmission over the Internet is 100% secure.
              </p>

              <h2 className="text-2xl font-bold text-primary mb-4">6. Your Rights</h2>
              <p className="text-muted-foreground mb-4">You have the right to:</p>
              <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-2">
                <li>Access your personal information</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Opt-out of marketing communications</li>
                <li>Export your data</li>
              </ul>

              <h2 className="text-2xl font-bold text-primary mb-4">7. Cookies</h2>
              <p className="text-muted-foreground mb-6">
                We use cookies and similar technologies to maintain your session, remember your preferences, and analyze platform usage. You can control cookie settings through your browser.
              </p>

              <h2 className="text-2xl font-bold text-primary mb-4">8. Children's Privacy</h2>
              <p className="text-muted-foreground mb-6">
                Our platform is not intended for users under 18 years of age. We do not knowingly collect information from children.
              </p>

              <h2 className="text-2xl font-bold text-primary mb-4">9. Changes to This Policy</h2>
              <p className="text-muted-foreground mb-6">
                We may update this Privacy Policy from time to time. We will notify you of significant changes by email or through the platform.
              </p>

              <h2 className="text-2xl font-bold text-primary mb-4">10. Contact Us</h2>
              <p className="text-muted-foreground">
                If you have questions about this Privacy Policy, please contact us at{" "}
                <a href="mailto:privacy@highspirit.com" className="text-accent hover:underline">
                  privacy@highspirit.com
                </a>
                {" "}or through our{" "}
                <a href="/contact" className="text-accent hover:underline">
                  Contact page
                </a>.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;