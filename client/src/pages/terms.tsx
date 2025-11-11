import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";

export default function Terms() {
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
        <h1 className="text-4xl font-bold text-foreground mb-6" data-testid="text-terms-title">
          {t('info_pages.terms_title')}
        </h1>
        <p className="text-muted-foreground mb-8">Last updated: October 25, 2025</p>

        <Card className="p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing and using TravelHub, you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">User Accounts</h2>
            <p className="text-muted-foreground mb-4">To use certain features, you must create an account. You agree to:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account</li>
              <li>Notify us of any unauthorized use</li>
              <li>Be responsible for all activities under your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Bookings and Payments</h2>
            <p className="text-muted-foreground">
              All bookings are subject to availability and confirmation. Prices are subject to change without notice. Payment processing is handled securely through our payment partners.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Cancellations and Refunds</h2>
            <p className="text-muted-foreground">
              Cancellation policies vary by property and service provider. Please review the specific cancellation terms before making a booking.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">User Conduct</h2>
            <p className="text-muted-foreground mb-4">You agree not to:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Violate any laws or regulations</li>
              <li>Infringe on others' intellectual property</li>
              <li>Submit false or misleading information</li>
              <li>Interfere with the platform's operation</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Limitation of Liability</h2>
            <p className="text-muted-foreground">
              TravelHub acts as a platform connecting travelers with property owners and service providers. We are not responsible for the quality of accommodations or services provided by third parties.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Contact</h2>
            <p className="text-muted-foreground">
              For questions about these Terms of Service, contact legal@travelhub.com.
            </p>
          </section>
        </Card>
      </main>

      <Footer />
    </div>
  );
}