import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Shield, Users, Lock, AlertCircle, CheckCircle, Phone } from "lucide-react";

export default function Safety() {
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <Shield className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-foreground mb-4" data-testid="text-safety-title">
            Safety & Trust
          </h1>
          <p className="text-xl text-muted-foreground">
            Your safety and security are our top priorities
          </p>
        </div>

        <div className="space-y-6">
          <Card className="p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-4">Verified Hosts & Providers</h2>
                <p className="text-muted-foreground mb-4">
                  All hosts and service providers on TravelHub go through a comprehensive verification process before they can list their properties or services. This includes:
                </p>
                <ul className="space-y-2 text-muted-foreground ml-6">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Identity verification with government-issued ID</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Background checks for service providers</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Property ownership or authorization verification</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>License and certification validation where applicable</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>

          <Card className="p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-4">Secure Payments</h2>
                <p className="text-muted-foreground mb-4">
                  Your financial information is protected with industry-leading security measures:
                </p>
                <ul className="space-y-2 text-muted-foreground ml-6">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>256-bit SSL encryption for all transactions</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>PCI DSS compliant payment processing via Stripe</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>We never store your full credit card information</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Secure payment holds until service completion</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>

          <Card className="p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-4">Guest Safety Guidelines</h2>
                <p className="text-muted-foreground mb-4">
                  We encourage all travelers to follow these safety best practices:
                </p>
                <ul className="space-y-2 text-muted-foreground ml-6">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Read reviews and ratings from other travelers</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Communicate through the platform's messaging system</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Verify property details before arrival</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Share your travel plans with trusted contacts</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Keep emergency contact numbers accessible</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>

          <Card className="p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-4">Report & Support</h2>
                <p className="text-muted-foreground mb-4">
                  If you encounter any safety concerns or suspicious activity:
                </p>
                <ul className="space-y-2 text-muted-foreground ml-6 mb-6">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Report directly through the platform</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Contact our 24/7 Trust & Safety team</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>All reports are investigated promptly</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Your identity remains confidential</span>
                  </li>
                </ul>

                <div className="bg-primary/10 p-4 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Phone className="w-5 h-5 text-primary" />
                    <span className="font-semibold text-foreground">Emergency Hotline</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    For urgent safety matters: <a href="tel:+15551234567" className="text-primary font-medium">+1 (555) 123-4567</a>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Available 24/7 in multiple languages
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Privacy & Data Protection</h2>
            <p className="text-muted-foreground mb-4">
              We take your privacy seriously and comply with all applicable data protection regulations:
            </p>
            <ul className="space-y-2 text-muted-foreground ml-6">
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                <span>Your personal information is encrypted and protected</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                <span>We never share your data with third parties without consent</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                <span>You control your data and can request deletion anytime</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                <span>Regular security audits and updates</span>
              </li>
            </ul>
            <p className="text-muted-foreground mt-4">
              Learn more in our <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
            </p>
          </Card>

          <div className="text-sm text-muted-foreground italic">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
