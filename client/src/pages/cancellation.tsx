import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";

export default function Cancellation() {
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
        <h1 className="text-4xl font-bold text-foreground mb-6" data-testid="text-cancellation-title">
          Cancellation Policy
        </h1>
        
        <div className="space-y-6">
          <Card className="p-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Property Bookings</h2>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">Flexible Cancellation</h3>
                <p className="mb-2">
                  Cancel up to 24 hours before check-in for a full refund (minus service fees). Cancellations made within 24 hours of check-in will forfeit the first night's cost.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">Moderate Cancellation</h3>
                <p className="mb-2">
                  Cancel up to 5 days before check-in for a full refund (minus service fees). Cancellations made within 5 days of check-in will receive a 50% refund.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">Strict Cancellation</h3>
                <p className="mb-2">
                  Cancel up to 7 days before check-in for a 50% refund. No refund for cancellations made within 7 days of check-in.
                </p>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg mt-4">
                <p className="text-sm">
                  <strong>Note:</strong> The specific cancellation policy for each property is displayed on the property listing page and during the booking process.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Service Bookings</h2>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">Standard Service Cancellation</h3>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Cancel 48+ hours before service: Full refund</li>
                  <li>Cancel 24-48 hours before service: 50% refund</li>
                  <li>Cancel less than 24 hours before service: No refund</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">Premium Services</h3>
                <p className="mb-2">
                  Some premium services may have different cancellation terms. Please check the specific service details before booking.
                </p>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg mt-4">
                <p className="text-sm">
                  <strong>Weather or Emergency:</strong> In case of severe weather conditions or emergencies, we may offer additional flexibility. Contact our support team for assistance.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">How to Cancel</h2>
            <div className="space-y-4 text-muted-foreground">
              <ol className="list-decimal list-inside space-y-3 ml-2">
                <li>Log in to your TravelHub account</li>
                <li>Go to "My Bookings" or "My Orders" in your dashboard</li>
                <li>Select the booking you wish to cancel</li>
                <li>Click the "Cancel" button</li>
                <li>Confirm your cancellation</li>
              </ol>

              <div className="bg-primary/10 p-4 rounded-lg mt-4">
                <p className="text-sm">
                  <strong>Refund Processing:</strong> Approved refunds are typically processed within 5-10 business days and will be returned to your original payment method.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Special Circumstances</h2>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">Force Majeure</h3>
                <p>
                  In cases of natural disasters, pandemics, government travel restrictions, or other extraordinary circumstances beyond your control, we may provide additional cancellation flexibility on a case-by-case basis.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">Host/Provider Cancellation</h3>
                <p>
                  If a host or service provider cancels your booking, you will receive a full refund including all fees. We may also provide additional compensation or credits depending on the circumstances.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Need Help?</h2>
            <p className="text-muted-foreground mb-4">
              If you have questions about our cancellation policy or need assistance with a cancellation, our support team is here to help.
            </p>
            <p className="text-muted-foreground">
              Contact us through the <a href="/contact" className="text-primary hover:underline">Contact page</a> or via the messaging system in your dashboard.
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
