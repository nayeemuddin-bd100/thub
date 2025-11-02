import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";

export default function TravelExperiences() {
  const { data: providers, isLoading } = useQuery({
    queryKey: ['/api/service-providers'],
  });

  const experiences = providers?.filter((p: any) => {
    const categoryName = p.category?.name?.toLowerCase();
    return categoryName?.includes('tour') || 
           categoryName?.includes('adventure') || 
           categoryName?.includes('activity') ||
           categoryName?.includes('experience');
  }).slice(0, 6) || [];

  if (isLoading) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="h-8 bg-muted rounded w-64 mx-auto mb-4"></div>
            <div className="h-6 bg-muted rounded w-96 mx-auto"></div>
          </div>
          <div className="carousel-scroll flex space-x-6 overflow-x-auto pb-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex-none w-80 h-80 bg-muted rounded-2xl"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4" data-testid="text-experiences-title">
            Curated Experiences
          </h2>
          <p className="text-lg text-muted-foreground" data-testid="text-experiences-subtitle">
            Unique activities and adventures for every traveler
          </p>
        </div>

        <div className="carousel-scroll flex space-x-6 overflow-x-auto pb-4">
          {experiences.map((provider: any) => (
            <Card 
              key={provider.id}
              data-testid={`card-experience-${provider.id}`}
              className="flex-none w-80 bg-card rounded-2xl overflow-hidden border border-border cursor-pointer hover:shadow-md transition-all"
            >
              <img 
                src={provider.profilePhotoUrl || provider.photoUrls?.[0] || 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400'}
                alt={provider.businessName}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="font-semibold text-foreground mb-2" data-testid={`text-experience-title-${provider.id}`}>
                  {provider.businessName}
                </h3>
                <p className="text-muted-foreground text-sm mb-3" data-testid={`text-experience-description-${provider.id}`}>
                  {provider.description || 'Experience unique local activities'}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-foreground" data-testid={`text-experience-price-${provider.id}`}>
                    ${provider.hourlyRate || provider.fixedRate}/person
                  </span>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm" data-testid={`text-experience-rating-${provider.id}`}>
                      {provider.rating || '5.0'} ({provider.reviewCount || 0} reviews)
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        {experiences.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground" data-testid="text-no-experiences">
              No experiences available at the moment.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
