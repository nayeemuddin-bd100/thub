import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ServiceCategories from "@/components/ServiceCategories";
import FeaturedProperties from "@/components/FeaturedProperties";
import ServiceProviders from "@/components/ServiceProviders";
import TravelExperiences from "@/components/TravelExperiences";
import PropertyAmenities from "@/components/PropertyAmenities";
import TrustSignals from "@/components/TrustSignals";
import BookingDemo from "@/components/BookingDemo";
import UserRoles from "@/components/UserRoles";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Landing() {
  const { t } = useTranslation();
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
      <Header onToggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />
      <HeroSection />
      <ServiceCategories />
      <FeaturedProperties />
      <ServiceProviders />
      <TravelExperiences />
      <PropertyAmenities />
      <TrustSignals />
      <BookingDemo />
      <UserRoles />
      <Footer />
      
      {/* Floating CTA */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button 
          data-testid="button-quick-book"
          className="bg-primary text-primary-foreground px-6 py-3 rounded-full shadow-lg hover:bg-primary/90 transition-all duration-300 flex items-center space-x-2"
          onClick={() => window.location.href = '/api/login'}
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">{t('home.quick_book')}</span>
        </Button>
      </div>
    </div>
  );
}
