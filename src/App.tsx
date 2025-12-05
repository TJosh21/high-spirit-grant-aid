import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { MobileApp } from "@/mobile/MobileApp";
import { useGrantNotifications } from "@/hooks/useGrantNotifications";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";

// New mobile-first pages
import Welcome from "./pages/Welcome";
import AuthPage from "./pages/AuthPage";
import Pricing from "./pages/Pricing";
import Features from "./pages/Features";
import Contact from "./pages/Contact";
import About from "./pages/About";
import FAQ from "./pages/FAQ";
import Resources from "./pages/Resources";
import ResourceArticle from "./pages/ResourceArticle";
import UserDashboard from "./pages/UserDashboard";
import BrowseGrants from "./pages/BrowseGrants";
import GrantDetails from "./pages/GrantDetails";
import MyGrants from "./pages/MyGrants";
import AICoach from "./pages/AICoach";
import UserProfile from "./pages/UserProfile";

// Legacy pages (keeping for admin/advanced features)
import Onboarding from "./pages/Onboarding";
import Answer from "./pages/Answer";
import Documents from "./pages/Documents";
import AdminDashboard from "./pages/AdminDashboard";
import AdminSettings from "./pages/AdminSettings";
import AdminAnalytics from "./pages/AdminAnalytics";
import NotFound from "./pages/NotFound";
import Analytics from "./pages/Analytics";
import Team from "./pages/Team";
import Calendar from "./pages/Calendar";

const queryClient = new QueryClient();

function AppContent() {
  useGrantNotifications();
  useRealtimeNotifications();
  
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Welcome />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/grants" element={<BrowseGrants />} />
      <Route path="/grants/:id" element={<GrantDetails />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/features" element={<Features />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/about" element={<About />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/resources" element={<Resources />} />
      <Route path="/resources/:articleId" element={<ResourceArticle />} />
      
      {/* Protected user routes */}
      <Route path="/home" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
      <Route path="/my-grants" element={<ProtectedRoute><MyGrants /></ProtectedRoute>} />
      <Route path="/ai-coach" element={<ProtectedRoute><AICoach /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
      
      {/* Legacy/Advanced routes */}
      <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
      <Route path="/answer/:grantSlug/:questionId" element={<ProtectedRoute><Answer /></ProtectedRoute>} />
      <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />
      <Route path="/admin/analytics" element={<ProtectedRoute><AdminAnalytics /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      <Route path="/team" element={<ProtectedRoute><Team /></ProtectedRoute>} />
      <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="high-spirit-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <MobileApp>
              <AppContent />
            </MobileApp>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
