import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Users, Target, Globe, Award } from "lucide-react";

export default function About() {
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4" data-testid="text-about-title">
            {t('info_pages.about_title')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="text-about-subtitle">
            Revolutionizing travel by bringing together accommodations and services in one seamless platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card className="p-8">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Our Mission</h2>
            <p className="text-muted-foreground">
              To create a comprehensive travel ecosystem that goes beyond traditional accommodation booking by integrating properties with curated travel services, making every journey effortless and memorable.
            </p>
          </Card>

          <Card className="p-8">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Globe className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Our Vision</h2>
            <p className="text-muted-foreground">
              To become the world's most trusted travel platform where travelers, property owners, and service providers connect to create exceptional travel experiences with personalization and trust at the core.
            </p>
          </Card>
        </div>

        <Card className="p-8 mb-12">
          <h2 className="text-2xl font-semibold text-foreground mb-6 text-center">Why Choose TravelHub?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">All-in-One Platform</h3>
              <p className="text-sm text-muted-foreground">
                Book accommodations and add services like transport, dining, and experiences all in one place
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Verified Providers</h3>
              <p className="text-sm text-muted-foreground">
                All property owners and service providers are verified for your safety and peace of mind
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">24/7 Support</h3>
              <p className="text-sm text-muted-foreground">
                Round-the-clock emergency support to ensure you're never alone during your travels
              </p>
            </div>
          </div>
        </Card>

        <div className="text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Our Story</h2>
          <div className="max-w-3xl mx-auto text-muted-foreground space-y-4">
            <p>
              TravelHub was founded with a simple observation: travelers were juggling multiple platforms to book accommodations, arrange transportation, find dining experiences, and organize activities.
            </p>
            <p>
              We set out to change that by creating a comprehensive travel ecosystem where everything you need for the perfect trip is available in one seamless platform. From luxury villas to cozy apartments, from private chefs to adventure guides, TravelHub brings it all together.
            </p>
            <p>
              Today, we're proud to connect thousands of travelers with verified property owners and trusted service providers, making travel planning simpler, safer, and more enjoyable than ever before.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}