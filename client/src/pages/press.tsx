import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Mail, Calendar } from "lucide-react";

export default function Press() {
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

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4" data-testid="text-press-title">
            Press & Media
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Latest news, announcements, and media resources from TravelHub
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 text-center">
            <Mail className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">Media Inquiries</h3>
            <p className="text-sm text-muted-foreground mb-4">
              For press inquiries and interviews
            </p>
            <a href="mailto:press@travelhub.com" className="text-primary hover:underline text-sm">
              press@travelhub.com
            </a>
          </Card>

          <Card className="p-6 text-center">
            <Download className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">Press Kit</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Download our brand assets
            </p>
            <Button variant="outline" size="sm">
              Download Kit
            </Button>
          </Card>

          <Card className="p-6 text-center">
            <Calendar className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">Latest Updates</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Stay informed about TravelHub
            </p>
            <Button variant="outline" size="sm">
              Subscribe
            </Button>
          </Card>
        </div>

        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-foreground mb-6">Recent Press Releases</h2>

          <Card className="p-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-2">
                  TravelHub Launches Integrated Travel Services Platform
                </h3>
                <p className="text-sm text-muted-foreground">
                  November 2025 • Press Release
                </p>
              </div>
            </div>
            <p className="text-muted-foreground mb-4">
              TravelHub today announced the launch of its revolutionary platform that seamlessly integrates property accommodations with local travel services. The platform enables travelers to book not only their stay but also curated experiences, transportation, and professional services all in one place.
            </p>
            <p className="text-muted-foreground mb-4">
              "We're transforming how people plan and experience travel," said the TravelHub team. "By bringing together accommodations and services, we're creating a comprehensive travel ecosystem that makes every journey effortless and memorable."
            </p>
            <Button variant="link" className="p-0">
              Read full release →
            </Button>
          </Card>

          <Card className="p-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-2">
                  TravelHub Expands Service Provider Network
                </h3>
                <p className="text-sm text-muted-foreground">
                  October 2025 • Press Release
                </p>
              </div>
            </div>
            <p className="text-muted-foreground mb-4">
              TravelHub has expanded its network of verified service providers to include transportation, dining experiences, wellness services, and adventure tours. This expansion enables travelers to create fully customized itineraries tailored to their preferences.
            </p>
            <Button variant="link" className="p-0">
              Read full release →
            </Button>
          </Card>

          <Card className="p-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-2">
                  TravelHub Introduces Multi-Language Support
                </h3>
                <p className="text-sm text-muted-foreground">
                  September 2025 • Press Release
                </p>
              </div>
            </div>
            <p className="text-muted-foreground mb-4">
              In response to growing international demand, TravelHub now offers full platform support in English, Spanish, and French, making travel planning accessible to millions more users worldwide.
            </p>
            <Button variant="link" className="p-0">
              Read full release →
            </Button>
          </Card>
        </div>

        <Card className="p-8 mt-12">
          <h2 className="text-2xl font-bold text-foreground mb-4">About TravelHub</h2>
          <p className="text-muted-foreground mb-4">
            TravelHub is a comprehensive travel platform that revolutionizes how people plan and experience travel by integrating property accommodations with curated local services. Founded in 2025, our mission is to create a seamless travel ecosystem where travelers, property owners, and service providers connect to create exceptional experiences.
          </p>
          <p className="text-muted-foreground mb-4">
            With a focus on personalization, trust, and convenience, TravelHub serves travelers in multiple countries and supports multiple languages, making global travel more accessible and enjoyable.
          </p>
          
          <div className="border-t border-border pt-6 mt-6">
            <h3 className="font-semibold text-foreground mb-3">Media Contact</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>TravelHub Press Team</p>
              <p>Email: press@travelhub.com</p>
              <p>Phone: +1 (555) 123-4567</p>
            </div>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
