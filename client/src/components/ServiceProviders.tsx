import { useQuery } from "@tanstack/react-query";
import ServiceProviderCard from "./ServiceProviderCard";

export default function ServiceProviders() {
  const { data: providers, isLoading } = useQuery({
    queryKey: ['/api/service-providers'],
  });

  const featuredProviders = providers?.slice(0, 6) || [];

  if (isLoading) {
    return (
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="h-8 bg-muted rounded w-64 mx-auto mb-4"></div>
            <div className="h-6 bg-muted rounded w-96 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-2xl"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4" data-testid="text-providers-title">
            Trusted Service Providers
          </h2>
          <p className="text-lg text-muted-foreground" data-testid="text-providers-subtitle">
            Vetted professionals ready to enhance your stay
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProviders.map((provider: any) => (
            <ServiceProviderCard key={provider.id} provider={provider} />
          ))}
        </div>
        
        {featuredProviders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground" data-testid="text-no-providers">
              No service providers available at the moment.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
