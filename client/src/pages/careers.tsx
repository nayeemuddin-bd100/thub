import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, Users, Heart, Zap } from "lucide-react";

export default function Careers() {
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

  const openPositions = [
    {
      title: "Senior Full Stack Engineer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
    },
    {
      title: "Product Designer",
      department: "Design",
      location: "Remote",
      type: "Full-time",
    },
    {
      title: "Customer Success Manager",
      department: "Support",
      location: "Hybrid",
      type: "Full-time",
    },
    {
      title: "Marketing Manager",
      department: "Marketing",
      location: "Remote",
      type: "Full-time",
    },
  ];

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
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4" data-testid="text-careers-title">
            {t('info_pages.careers_title')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="text-careers-subtitle">
            Help us build the future of travel. We're always looking for talented people who share our passion.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Remote First</h3>
            <p className="text-sm text-muted-foreground">
              Work from anywhere in the world with flexible hours
            </p>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Great Team</h3>
            <p className="text-sm text-muted-foreground">
              Collaborate with talented people from diverse backgrounds
            </p>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Heart className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Health Benefits</h3>
            <p className="text-sm text-muted-foreground">
              Comprehensive health coverage for you and your family
            </p>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Growth</h3>
            <p className="text-sm text-muted-foreground">
              Continuous learning and career development opportunities
            </p>
          </Card>
        </div>

        <h2 className="text-2xl font-semibold text-foreground mb-6">Open Positions</h2>
        <div className="space-y-4">
          {openPositions.map((position, index) => (
            <Card key={index} className="p-6" data-testid={`card-position-${index}`}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="mb-4 md:mb-0">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {position.title}
                  </h3>
                  <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                    <span>{position.department}</span>
                    <span>•</span>
                    <span>{position.location}</span>
                    <span>•</span>
                    <span>{position.type}</span>
                  </div>
                </div>
                <Button data-testid={`button-apply-${index}`}>
                  Apply Now
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-8 mt-12 text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Don't see a perfect fit?</h2>
          <p className="text-muted-foreground mb-6">
            We're always interested in hearing from talented people. Send us your resume and let us know what you're passionate about.
          </p>
          <Button variant="outline" data-testid="button-general-application">
            Send General Application
          </Button>
        </Card>
      </main>

      <Footer />
    </div>
  );
}