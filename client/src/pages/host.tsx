import { useState, useEffect } from "react";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, DollarSign, Users, Shield } from "lucide-react";

export default function Host() {
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
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4" data-testid="text-host-title">
            Become a Property Owner
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8" data-testid="text-host-subtitle">
            List your property on TravelHub and reach millions of travelers worldwide
          </p>
          {isAuthenticated ? (
            <Link href="/dashboard?tab=properties">
              <Button size="lg" data-testid="button-get-started">
                Get Started
              </Button>
            </Link>
          ) : (
            <Button size="lg" onClick={() => window.location.href = "/api/login"} data-testid="button-get-started">
              Get Started
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Home className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Easy Setup</h3>
            <p className="text-sm text-muted-foreground">
              List your property in minutes with our simple onboarding process
            </p>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Earn More</h3>
            <p className="text-sm text-muted-foreground">
              Competitive rates and no hidden fees means more money in your pocket
            </p>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Global Reach</h3>
            <p className="text-sm text-muted-foreground">
              Connect with travelers from around the world looking for their perfect stay
            </p>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Protected</h3>
            <p className="text-sm text-muted-foreground">
              Host protection insurance and 24/7 support keep you covered
            </p>
          </Card>
        </div>

        <Card className="p-8">
          <h2 className="text-2xl font-semibold text-foreground mb-6">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold mb-4">
                1
              </div>
              <h3 className="font-semibold text-foreground mb-2">Create Your Listing</h3>
              <p className="text-sm text-muted-foreground">
                Add photos, set your price, and describe what makes your property special
              </p>
            </div>

            <div>
              <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold mb-4">
                2
              </div>
              <h3 className="font-semibold text-foreground mb-2">Welcome Guests</h3>
              <p className="text-sm text-muted-foreground">
                Accept bookings, communicate with guests, and provide an amazing experience
              </p>
            </div>

            <div>
              <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold mb-4">
                3
              </div>
              <h3 className="font-semibold text-foreground mb-2">Get Paid</h3>
              <p className="text-sm text-muted-foreground">
                Receive secure payments directly to your account after guest check-in
              </p>
            </div>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
}