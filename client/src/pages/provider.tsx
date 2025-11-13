import { useState, useEffect } from "react";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, Calendar, Star, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Provider() {
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
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4" data-testid="text-provider-title">
            {t('provider_dashboard.become_provider')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            {t('dashboard.subtitle')}
          </p>
          {isAuthenticated ? (
            <Button 
              size="lg" 
              data-testid="button-start-providing"
              onClick={() => {
                const redirectUrl = user?.role === 'admin' ? '/admin' : '/dashboard?tab=services';
                window.location.href = redirectUrl;
              }}
            >
              {t('provider.become_provider')}
            </Button>
          ) : (
            <Button size="lg" onClick={() => window.location.href = "/login"} data-testid="button-start-providing">
              {t('provider.become_provider')}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="p-6 text-center">
            <Briefcase className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">{t('services.services_offered')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('provider_dashboard.services_description')}
            </p>
          </Card>

          <Card className="p-6 text-center">
            <Calendar className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">{t('provider_dashboard.flexible_schedule')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('provider_dashboard.schedule_description')}
            </p>
          </Card>

          <Card className="p-6 text-center">
            <Star className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">{t('provider_dashboard.build_reputation')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('provider_dashboard.reputation_description')}
            </p>
          </Card>

          <Card className="p-6 text-center">
            <TrendingUp className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">{t('provider_dashboard.grow_revenue')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('provider_dashboard.revenue_description')}
            </p>
          </Card>
        </div>

        <Card className="p-8">
          <h2 className="text-2xl font-semibold text-foreground mb-6">{t('dashboard.service_categories')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <div>
                <h3 className="font-semibold text-foreground">{t('service_provider.transport_services')}</h3>
                <p className="text-sm text-muted-foreground">{t('service_provider.transport_description')}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <div>
                <h3 className="font-semibold text-foreground">{t('service_provider.dining_experiences')}</h3>
                <p className="text-sm text-muted-foreground">{t('service_provider.dining_description')}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <div>
                <h3 className="font-semibold text-foreground">{t('service_provider.wellness_spa')}</h3>
                <p className="text-sm text-muted-foreground">{t('service_provider.wellness_description')}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <div>
                <h3 className="font-semibold text-foreground">{t('service_provider.adventure_tours')}</h3>
                <p className="text-sm text-muted-foreground">{t('service_provider.adventure_description')}</p>
              </div>
            </div>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
