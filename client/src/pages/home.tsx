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

            {/* Work With Us Section */}
            <section className="py-16 bg-gradient-to-r from-primary/10 to-primary/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                            Join Our Growing Team
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Become a part of TravelHub's success story. We're looking for passionate individuals to help us revolutionize the travel industry.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* City Manager */}
                        <div className="bg-card rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow border border-border">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-foreground mb-2">
                                City Manager
                            </h3>
                            <p className="text-muted-foreground mb-4">
                                Lead operations and manage hosts & service providers in your city
                            </p>
                            <Link href="/work-with-us">
                                <Button className="w-full" variant="outline">
                                    Apply Now
                                </Button>
                            </Link>
                        </div>

                        {/* Property Owner */}
                        <div className="bg-card rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow border border-border">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-foreground mb-2">
                                Become a Host
                            </h3>
                            <p className="text-muted-foreground mb-4">
                                List your properties and welcome travelers from around the world
                            </p>
                            <Link href="/work-with-us">
                                <Button className="w-full" variant="outline">
                                    List Your Property
                                </Button>
                            </Link>
                        </div>

                        {/* Service Provider */}
                        <div className="bg-card rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow border border-border">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-foreground mb-2">
                                Service Provider
                            </h3>
                            <p className="text-muted-foreground mb-4">
                                Offer tours, activities, and services to enhance traveler experiences
                            </p>
                            <Link href="/work-with-us">
                                <Button className="w-full" variant="outline">
                                    Join as Provider
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="text-center mt-12">
                        <Link href="/work-with-us">
                            <Button size="lg" className="px-8">
                                Explore All Opportunities →
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

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
