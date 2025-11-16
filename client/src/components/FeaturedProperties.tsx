import { useQuery } from "@tanstack/react-query";
import PropertyCard from "./PropertyCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Sparkles } from "lucide-react";
import { Link } from "wouter";

export default function FeaturedProperties() {
  const { data: properties, isLoading } = useQuery({
    queryKey: ['/api/properties'],
  });

  const featuredProperties = properties?.slice(0, 6) || [];

  if (isLoading) {
    return (
      <section className="relative py-20 bg-gradient-to-b from-muted/30 via-background to-muted/20 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-40 -left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-40 -right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-16">
            <div>
              <div className="h-10 bg-muted rounded-lg w-96 mb-4 animate-pulse"></div>
              <div className="h-6 bg-muted rounded-lg w-[32rem] animate-pulse"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-96 bg-muted rounded-3xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-20 bg-gradient-to-b from-muted/30 via-background to-muted/20 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-40 -left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-40 -right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[50rem] h-[50rem] bg-primary/3 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-6">
          <div>
            <div className="inline-block mb-4">
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium backdrop-blur-sm">
                <MapPin className="w-4 h-4 mr-2" />
                Handpicked Selection
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-3" data-testid="text-featured-title">
              Featured Destinations
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground" data-testid="text-featured-subtitle">
              Handpicked properties with integrated services
            </p>
          </div>
          <Link href="/properties">
            <Button 
              size="lg"
              className="group bg-primary text-primary-foreground hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 hidden md:inline-flex"
              data-testid="button-view-all"
            >
              <span>View all</span>
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          </Link>
        </div>

        {/* Properties Grid - 3 columns on large screens = 2 rows for 6 items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProperties.map((property: any, index: number) => (
            <div
              key={property.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <PropertyCard property={property} />
            </div>
          ))}
        </div>
        
        {featuredProperties.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-block mb-4">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-10 h-10 text-muted-foreground" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No Properties Available
            </h3>
            <p className="text-lg text-muted-foreground mb-6" data-testid="text-no-properties">
              Check back soon for amazing destinations
            </p>
            <Link href="/properties">
              <Button size="lg">
                Browse All Properties
              </Button>
            </Link>
          </div>
        )}

        {/* View All Button - Mobile */}
        <div className="text-center mt-12 md:hidden">
          <Link href="/properties">
            <Button size="lg" className="w-full sm:w-auto group">
              <span>View All Destinations</span>
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Add fade-in-up animation styles */}
      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </section>
  );
}
