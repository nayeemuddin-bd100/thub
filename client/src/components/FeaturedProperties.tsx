import { useQuery } from "@tanstack/react-query";
import PropertyCard from "./PropertyCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function FeaturedProperties() {
  const { data: properties, isLoading } = useQuery({
    queryKey: ['/api/properties'],
  });

  const featuredProperties = properties?.slice(0, 4) || [];

  if (isLoading) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <div className="h-8 bg-muted rounded w-64 mb-2"></div>
              <div className="h-6 bg-muted rounded w-96"></div>
            </div>
          </div>
          <div className="property-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 bg-muted rounded-2xl"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2" data-testid="text-featured-title">
              Featured Destinations
            </h2>
            <p className="text-lg text-muted-foreground" data-testid="text-featured-subtitle">
              Handpicked properties with integrated services
            </p>
          </div>
          <Link href="/properties">
            <Button variant="ghost" className="hidden md:flex items-center space-x-2 text-primary hover:text-primary/80 font-semibold" data-testid="button-view-all">
              <span>View all</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="property-grid">
          {featuredProperties.map((property: any) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
        
        {featuredProperties.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground" data-testid="text-no-properties">
              No properties available at the moment.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
