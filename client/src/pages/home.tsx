import FeaturedProperties from "@/components/FeaturedProperties";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ServiceCategories from "@/components/ServiceCategories";
import ServiceProviders from "@/components/ServiceProviders";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";

export default function Home() {
    const { user, isAuthenticated } = useAuth();
    const { t } = useTranslation();
    const [isDarkMode, setIsDarkMode] = useState(false);

    const userName =
        user && typeof user === "object" && "firstName" in user
            ? user.firstName
            : null;

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme === "dark") {
            setIsDarkMode(true);
            document.documentElement.classList.add("dark");
        }
    }, []);

    const toggleDarkMode = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);

        if (newMode) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
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

            {/* Welcome Section */}
            {isAuthenticated && (
                <section className="py-8 bg-muted/30">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h1 className="text-3xl font-bold text-foreground mb-2">
                                {userName
                                    ? t("home.welcome_back", { name: userName })
                                    : t("home.welcome_guest")}
                            </h1>
                            <p className="text-lg text-muted-foreground">
                                {t("home.next_adventure")}
                            </p>
                        </div>
                    </div>
                </section>
            )}

            <HeroSection />
            <ServiceCategories />
            <FeaturedProperties />
            <ServiceProviders />
            <Footer />

            {/* Floating CTA */}
            <div className="fixed bottom-6 right-6 z-50">
                <Link href="/booking">
                    <Button
                        data-testid="button-quick-book"
                        className="bg-primary text-primary-foreground px-6 py-3 rounded-full shadow-lg hover:bg-primary/90 transition-all duration-300 flex items-center space-x-2"
                    >
                        <Plus className="w-4 h-4" />
                        {/* <span className="hidden sm:inline">{t('home.quick_book')}</span> */}
                    </Button>
                </Link>
            </div>
        </div>
    );
}
