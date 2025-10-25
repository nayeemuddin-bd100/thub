import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, HelpCircle } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Help() {
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

  const faqs = [
    {
      question: "How do I book a property?",
      answer: "Browse our property listings, select your desired dates and number of guests, then click 'Book Now'. You can add additional services during checkout."
    },
    {
      question: "Can I add services to my booking after I've made it?",
      answer: "Yes! Go to your dashboard, find your booking, and click 'Add Services' to browse and add transportation, dining, or other travel services."
    },
    {
      question: "What is your cancellation policy?",
      answer: "Cancellation policies vary by property and service. Check the specific cancellation terms on the property listing page before booking."
    },
    {
      question: "How do I become a property owner?",
      answer: "Visit your dashboard, switch your role to 'Property Owner', then click 'List Your First Property' to get started."
    },
    {
      question: "How does payment work?",
      answer: "We use Stripe for secure payment processing. Your payment is held securely and only released to hosts after your check-in date."
    },
    {
      question: "What if I have an emergency during my stay?",
      answer: "Our 24/7 emergency support team is always available. Contact us immediately through the emergency hotline listed in your booking confirmation."
    }
  ];

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
          <HelpCircle className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4" data-testid="text-help-title">
            Help Center
          </h1>
          <p className="text-xl text-muted-foreground" data-testid="text-help-subtitle">
            Find answers to common questions
          </p>
        </div>

        <Card className="p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input 
              placeholder="Search for help..." 
              className="pl-10"
              data-testid="input-search-help"
            />
          </div>
        </Card>

        <h2 className="text-2xl font-semibold text-foreground mb-6">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border border-border rounded-lg px-6">
              <AccordionTrigger className="text-foreground hover:no-underline" data-testid={`accordion-faq-${index}`}>
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </main>

      <Footer />
    </div>
  );
}