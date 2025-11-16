import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Users, MessageSquare, Heart, Award, Globe, Calendar } from "lucide-react";

export default function Community() {
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
          <Users className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4" data-testid="text-community-title">
            TravelHub Community
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Connect with travelers, hosts, and service providers from around the world
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">150K+</h3>
            <p className="text-muted-foreground">Community Members</p>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">95%</h3>
            <p className="text-muted-foreground">Satisfaction Rate</p>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">500K+</h3>
            <p className="text-muted-foreground">Verified Reviews</p>
          </Card>
        </div>

        <div className="space-y-6 mb-12">
          <Card className="p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-foreground mb-3">Community Forums</h2>
                <p className="text-muted-foreground mb-4">
                  Connect with fellow travelers, share experiences, and get advice from our vibrant community.
                </p>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="border border-border rounded-lg p-4">
                    <h4 className="font-semibold text-foreground mb-2">Travel Tips & Guides</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Share and discover insider tips for destinations worldwide
                    </p>
                    <span className="text-xs text-primary">12.5K members</span>
                  </div>
                  <div className="border border-border rounded-lg p-4">
                    <h4 className="font-semibold text-foreground mb-2">Host Success Stories</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Learn from successful hosts and share your journey
                    </p>
                    <span className="text-xs text-primary">8.2K members</span>
                  </div>
                  <div className="border border-border rounded-lg p-4">
                    <h4 className="font-semibold text-foreground mb-2">Service Provider Network</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Connect with other service providers and grow together
                    </p>
                    <span className="text-xs text-primary">5.7K members</span>
                  </div>
                  <div className="border border-border rounded-lg p-4">
                    <h4 className="font-semibold text-foreground mb-2">General Discussion</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Off-topic conversations and community hangout
                    </p>
                    <span className="text-xs text-primary">20.1K members</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-foreground mb-3">Community Events</h2>
                <p className="text-muted-foreground mb-4">
                  Join virtual and in-person events to network and learn from experts.
                </p>
                <div className="space-y-3">
                  <div className="border-l-4 border-primary pl-4 py-2">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-semibold text-foreground">Host Webinar: Maximizing Occupancy</h4>
                      <span className="text-sm text-muted-foreground">Dec 15, 2025</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Learn strategies to boost your property's bookings</p>
                  </div>
                  <div className="border-l-4 border-primary pl-4 py-2">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-semibold text-foreground">Travel Photography Workshop</h4>
                      <span className="text-sm text-muted-foreground">Dec 20, 2025</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Improve your listing photos with pro tips</p>
                  </div>
                  <div className="border-l-4 border-primary pl-4 py-2">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-semibold text-foreground">Provider Networking Meetup</h4>
                      <span className="text-sm text-muted-foreground">Jan 10, 2026</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Connect with local service providers in your area</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Award className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-foreground mb-3">Recognition & Rewards</h2>
                <p className="text-muted-foreground mb-4">
                  We celebrate outstanding members of our community who go above and beyond.
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border border-border rounded-lg">
                    <div className="text-3xl mb-2">🏆</div>
                    <h4 className="font-semibold text-foreground mb-1">Superhost</h4>
                    <p className="text-sm text-muted-foreground">Exceptional hospitality</p>
                  </div>
                  <div className="text-center p-4 border border-border rounded-lg">
                    <div className="text-3xl mb-2">⭐</div>
                    <h4 className="font-semibold text-foreground mb-1">Top Provider</h4>
                    <p className="text-sm text-muted-foreground">Outstanding service quality</p>
                  </div>
                  <div className="text-center p-4 border border-border rounded-lg">
                    <div className="text-3xl mb-2">💎</div>
                    <h4 className="font-semibold text-foreground mb-1">Verified Expert</h4>
                    <p className="text-sm text-muted-foreground">Community contributor</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Community Guidelines</h2>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start">
                <Heart className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                <span>Treat all members with respect and kindness</span>
              </li>
              <li className="flex items-start">
                <Heart className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                <span>Share knowledge and help others succeed</span>
              </li>
              <li className="flex items-start">
                <Heart className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                <span>Keep conversations constructive and relevant</span>
              </li>
              <li className="flex items-start">
                <Heart className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                <span>Protect privacy and personal information</span>
              </li>
              <li className="flex items-start">
                <Heart className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                <span>Report any concerns to moderators</span>
              </li>
            </ul>
          </Card>

          <Card className="p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Get Involved</h2>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Become a Moderator</h4>
                <p className="text-sm text-muted-foreground">
                  Help maintain a positive community environment
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Share Your Story</h4>
                <p className="text-sm text-muted-foreground">
                  Inspire others with your TravelHub journey
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Join Local Meetups</h4>
                <p className="text-sm text-muted-foreground">
                  Connect with community members in your city
                </p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-8 bg-primary/5 border-primary/20 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-3">Join Our Community</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Whether you're a traveler, host, or service provider, there's a place for you in the TravelHub community.
          </p>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
