import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Home, Building, Briefcase, Users, Settings, FileText, HelpCircle } from "lucide-react";

export default function Sitemap() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onToggleDarkMode={toggleDarkMode} 
        isDarkMode={isDarkMode} 
        isAuthenticated={isAuthenticated}
        user={user}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4" data-testid="text-sitemap-title">
            Site Map
          </h1>
          <p className="text-xl text-muted-foreground">
            Navigate through all pages on TravelHub
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Home className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Main Pages</h2>
            </div>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link href="/" className="hover:text-primary">Home</Link></li>
              <li><Link href="/properties" className="hover:text-primary">Browse Properties</Link></li>
              <li><Link href="/services" className="hover:text-primary">Find Services</Link></li>
              <li><Link href="/blog" className="hover:text-primary">Blog</Link></li>
            </ul>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Account</h2>
            </div>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link href="/login" className="hover:text-primary">Log In</Link></li>
              <li><Link href="/register" className="hover:text-primary">Sign Up</Link></li>
              {isAuthenticated && (
                <>
                  <li><Link href="/dashboard" className="hover:text-primary">Dashboard</Link></li>
                  <li><Link href="/favorites" className="hover:text-primary">Favorites</Link></li>
                  <li><Link href="/messages" className="hover:text-primary">Messages</Link></li>
                </>
              )}
            </ul>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Building className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">For Hosts</h2>
            </div>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link href="/host" className="hover:text-primary">Become a Host</Link></li>
              <li><Link href="/work-with-us" className="hover:text-primary">Work With Us</Link></li>
              {isAuthenticated && (
                <>
                  <li><Link href="/seasonal-pricing" className="hover:text-primary">Seasonal Pricing</Link></li>
                </>
              )}
            </ul>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Briefcase className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">For Providers</h2>
            </div>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link href="/provider" className="hover:text-primary">Become a Provider</Link></li>
              {isAuthenticated && (
                <>
                  <li><Link href="/provider-config" className="hover:text-primary">Provider Configuration</Link></li>
                  <li><Link href="/provider-earnings" className="hover:text-primary">Earnings</Link></li>
                  <li><Link href="/provider-orders" className="hover:text-primary">My Orders</Link></li>
                </>
              )}
            </ul>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Company</h2>
            </div>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary">About Us</Link></li>
              <li><Link href="/careers" className="hover:text-primary">Careers</Link></li>
              <li><Link href="/press" className="hover:text-primary">Press</Link></li>
              <li><Link href="/community" className="hover:text-primary">Community</Link></li>
            </ul>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <HelpCircle className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Support</h2>
            </div>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link href="/help" className="hover:text-primary">Help Center</Link></li>
              <li><Link href="/contact" className="hover:text-primary">Contact Us</Link></li>
              <li><Link href="/safety" className="hover:text-primary">Safety</Link></li>
              <li><Link href="/resources" className="hover:text-primary">Resources</Link></li>
            </ul>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Settings className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Legal</h2>
            </div>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link href="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-primary">Terms of Service</Link></li>
              <li><Link href="/cancellation" className="hover:text-primary">Cancellation Policy</Link></li>
            </ul>
          </Card>

          {isAuthenticated && (
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">My Account</h2>
              </div>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link href="/dashboard" className="hover:text-primary">Dashboard</Link></li>
                <li><Link href="/my-service-orders" className="hover:text-primary">My Service Orders</Link></li>
                <li><Link href="/loyalty-points" className="hover:text-primary">Loyalty Points</Link></li>
                <li><Link href="/trip-planning" className="hover:text-primary">Trip Planning</Link></li>
                <li><Link href="/disputes" className="hover:text-primary">Disputes</Link></li>
              </ul>
            </Card>
          )}

          {isAuthenticated && user?.role === 'admin' && (
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Settings className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">Admin</h2>
              </div>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link href="/admin" className="hover:text-primary">Admin Dashboard</Link></li>
              </ul>
            </Card>
          )}
        </div>

        <Card className="p-8 mt-12 bg-muted/50">
          <p className="text-center text-muted-foreground">
            Can't find what you're looking for? Try using the search or{" "}
            <Link href="/contact" className="text-primary hover:underline">contact our support team</Link>.
          </p>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
