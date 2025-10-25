import { useState, useEffect } from "react";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, Calendar, Star, TrendingUp } from "lucide-react";

export default function Provider() {
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
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4" data-testid="text-provider-title">
            Become a Service Provider
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Offer your services to travelers and grow your business with TravelHub
          </p>
          {isAuthenticated ? (
            <Link href="/dashboard?tab=services">
              <Button size="lg" data-testid="button-start-providing">
                Start Providing Services
              </Button>
            </Link>
          ) : (
            <Button size="lg" onClick={() => window.location.href = "/api/login"} data-testid="button-start-providing">
              Start Providing Services
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="p-6 text-center">
            <Briefcase className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">Diverse Services</h3>
            <p className="text-sm text-muted-foreground">
              Offer transport, dining, wellness, adventure, or household services
            </p>
          </Card>

          <Card className="p-6 text-center">
            <Calendar className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">Flexible Schedule</h3>
            <p className="text-sm text-muted-foreground">
              Set your own availability and manage bookings on your terms
            </p>
          </Card>

          <Card className="p-6 text-center">
            <Star className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">Build Reputation</h3>
            <p className="text-sm text-muted-foreground">
              Earn reviews and ratings to attract more clients
            </p>
          </Card>

          <Card className="p-6 text-center">
            <TrendingUp className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">Grow Revenue</h3>
            <p className="text-sm text-muted-foreground">
              Access a large customer base and increase your earnings
            </p>
          </Card>
        </div>

        <Card className="p-8">
          <h2 className="text-2xl font-semibold text-foreground mb-6">Service Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <div>
                <h3 className="font-semibold text-foreground">Transport Services</h3>
                <p className="text-sm text-muted-foreground">Airport transfers, car rentals, private drivers</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <div>
                <h3 className="font-semibold text-foreground">Dining Experiences</h3>
                <p className="text-sm text-muted-foreground">Private chefs, local cuisine tours, catering</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <div>
                <h3 className="font-semibold text-foreground">Wellness & Spa</h3>
                <p className="text-sm text-muted-foreground">Massage, yoga, fitness training, spa services</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <div>
                <h3 className="font-semibold text-foreground">Adventure & Tours</h3>
                <p className="text-sm text-muted-foreground">Guided tours, outdoor activities, experiences</p>
              </div>
            </div>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
