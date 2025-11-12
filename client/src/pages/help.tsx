import { useState, useEffect, useMemo } from "react";
import { useTranslation } from 'react-i18next';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, HelpCircle, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Help() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

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

  const filteredFaqs = useMemo(() => {
    if (!debouncedSearchQuery.trim()) {
      return faqs;
    }
    
    const query = debouncedSearchQuery.toLowerCase();
    return faqs.filter(faq => 
      faq.question.toLowerCase().includes(query) ||
      faq.answer.toLowerCase().includes(query)
    );
  }, [debouncedSearchQuery]);

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => {
      if (part.toLowerCase() === query.toLowerCase()) {
        return <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">{part}</mark>;
      }
      return part;
    });
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setDebouncedSearchQuery("");
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
          <HelpCircle className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4" data-testid="text-help-title">
            {t('info_pages.help_title')}
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
              className="pl-10 pr-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search-help"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                onClick={handleClearSearch}
                data-testid="button-clear-search"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </Card>

        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground mb-2">Frequently Asked Questions</h2>
          {debouncedSearchQuery.trim() && (
            <p className="text-sm text-muted-foreground" data-testid="text-results-count">
              Showing {filteredFaqs.length} result{filteredFaqs.length !== 1 ? 's' : ''} for '{debouncedSearchQuery}'
            </p>
          )}
        </div>

        {filteredFaqs.length === 0 ? (
          <Card className="p-12 text-center">
            <HelpCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-foreground mb-2" data-testid="text-no-results">
              No results found
            </h3>
            <p className="text-muted-foreground mb-4">
              We couldn't find any FAQs matching "{debouncedSearchQuery}"
            </p>
            <Button onClick={handleClearSearch} variant="outline" data-testid="button-clear-search-no-results">
              Clear search
            </Button>
          </Card>
        ) : (
          <Accordion type="single" collapsible className="space-y-4">
            {filteredFaqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border border-border rounded-lg px-6">
                <AccordionTrigger className="text-foreground hover:no-underline" data-testid={`accordion-faq-${index}`}>
                  {highlightText(faq.question, debouncedSearchQuery)}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {highlightText(faq.answer, debouncedSearchQuery)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </main>

      <Footer />
    </div>
  );
}