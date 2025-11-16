import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, FileText, Video, HelpCircle, Download, ExternalLink } from "lucide-react";

export default function Resources() {
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
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4" data-testid="text-resources-title">
            Resources & Guides
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to make the most of TravelHub
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <BookOpen className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Getting Started</h3>
            <p className="text-muted-foreground mb-4">
              New to TravelHub? Learn the basics and start your journey.
            </p>
            <Button variant="link" className="p-0">
              Read Guide <ExternalLink className="w-4 h-4 ml-1" />
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <FileText className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Host Handbook</h3>
            <p className="text-muted-foreground mb-4">
              Complete guide for property owners and hosts.
            </p>
            <Button variant="link" className="p-0">
              Download PDF <Download className="w-4 h-4 ml-1" />
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <Video className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Video Tutorials</h3>
            <p className="text-muted-foreground mb-4">
              Step-by-step video guides for all features.
            </p>
            <Button variant="link" className="p-0">
              Watch Now <ExternalLink className="w-4 h-4 ml-1" />
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <HelpCircle className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">FAQ</h3>
            <p className="text-muted-foreground mb-4">
              Answers to frequently asked questions.
            </p>
            <Link href="/help">
              <Button variant="link" className="p-0">
                View FAQ <ExternalLink className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <BookOpen className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Provider Guide</h3>
            <p className="text-muted-foreground mb-4">
              Resources for service providers and partners.
            </p>
            <Button variant="link" className="p-0">
              Learn More <ExternalLink className="w-4 h-4 ml-1" />
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <FileText className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Best Practices</h3>
            <p className="text-muted-foreground mb-4">
              Tips and strategies for success on TravelHub.
            </p>
            <Button variant="link" className="p-0">
              Read More <ExternalLink className="w-4 h-4 ml-1" />
            </Button>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">For Travelers</h2>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>How to search and book properties</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>Adding services to your booking</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>Understanding pricing and fees</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>Payment methods and security</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>Cancellation policies</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>Leaving reviews and ratings</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>Travel safety tips</span>
              </li>
            </ul>
          </Card>

          <Card className="p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">For Hosts & Providers</h2>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>Creating your first listing</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>Setting competitive prices</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>Professional photography tips</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>Managing bookings and calendar</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>Communication best practices</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>Handling guest requests</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>Getting paid and taxes</span>
              </li>
            </ul>
          </Card>
        </div>

        <Card className="p-8 mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-4">Popular Topics</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Account & Settings</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">Creating an account</a></li>
                <li><a href="#" className="hover:text-primary">Profile settings</a></li>
                <li><a href="#" className="hover:text-primary">Notification preferences</a></li>
                <li><a href="#" className="hover:text-primary">Language settings</a></li>
                <li><a href="#" className="hover:text-primary">Privacy settings</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Payments & Refunds</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">Payment methods</a></li>
                <li><a href="#" className="hover:text-primary">How refunds work</a></li>
                <li><a href="#" className="hover:text-primary">Currency conversion</a></li>
                <li><a href="#" className="hover:text-primary">Receipt and invoices</a></li>
                <li><a href="#" className="hover:text-primary">Promotional codes</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Booking & Services</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">How to book</a></li>
                <li><a href="#" className="hover:text-primary">Instant vs request booking</a></li>
                <li><a href="#" className="hover:text-primary">Modifying bookings</a></li>
                <li><a href="#" className="hover:text-primary">Adding services</a></li>
                <li><a href="#" className="hover:text-primary">Check-in process</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Safety & Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/safety" className="hover:text-primary">Safety guidelines</Link></li>
                <li><a href="#" className="hover:text-primary">Reporting issues</a></li>
                <li><Link href="/contact" className="hover:text-primary">Contact support</Link></li>
                <li><a href="#" className="hover:text-primary">Emergency procedures</a></li>
                <li><a href="#" className="hover:text-primary">Insurance options</a></li>
              </ul>
            </div>
          </div>
        </Card>

        <Card className="p-8 bg-primary/5 border-primary/20">
          <div className="flex items-center gap-4">
            <HelpCircle className="w-12 h-12 text-primary flex-shrink-0" />
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Can't find what you're looking for?</h3>
              <p className="text-muted-foreground mb-4">
                Our support team is here to help you with any questions or concerns.
              </p>
              <div className="flex gap-3">
                <Link href="/contact">
                  <Button>Contact Support</Button>
                </Link>
                <Link href="/help">
                  <Button variant="outline">Visit Help Center</Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
