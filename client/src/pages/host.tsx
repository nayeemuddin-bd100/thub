import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, DollarSign, Users, Shield } from "lucide-react";

export default function Host() {
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
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4" data-testid="text-host-title">
            {t('host.title')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8" data-testid="text-host-subtitle">
            {t('host.subtitle')}
          </p>
          {isAuthenticated ? (
            <Link href="/dashboard?tab=properties">
              <Button size="lg" data-testid="button-get-started">
                {t('host.get_started')}
              </Button>
            </Link>
          ) : (
            <Button size="lg" onClick={() => window.location.href = "/api/login"} data-testid="button-get-started">
              {t('host.get_started')}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Home className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">{t('host.easy_setup')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('host.easy_setup_desc')}
            </p>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">{t('host.earn_more')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('host.earn_more_desc')}
            </p>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">{t('host.global_reach')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('host.global_reach_desc')}
            </p>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">{t('host.protected')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('host.protected_desc')}
            </p>
          </Card>
        </div>

        <Card className="p-8">
          <h2 className="text-2xl font-semibold text-foreground mb-6">{t('host.how_it_works')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold mb-4">
                1
              </div>
              <h3 className="font-semibold text-foreground mb-2">{t('host.create_listing')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('host.create_listing_desc')}
              </p>
            </div>

            <div>
              <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold mb-4">
                2
              </div>
              <h3 className="font-semibold text-foreground mb-2">{t('host.welcome_guests')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('host.welcome_guests_desc')}
              </p>
            </div>

            <div>
              <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold mb-4">
                3
              </div>
              <h3 className="font-semibold text-foreground mb-2">{t('host.get_paid')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('host.get_paid_desc')}
              </p>
            </div>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
}