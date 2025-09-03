import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Car, Utensils, Waves, Mountain, Fan, Headphones } from "lucide-react";

const iconMap = {
  transport: Car,
  dining: Utensils,
  wellness: Waves,
  adventure: Mountain,
  household: Fan,
  support: Headphones,
};

export default function ServiceCategories() {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['/api/service-categories'],
  });

  const defaultCategories = [
    { id: '1', name: 'Transport', description: 'Cars, rides & transfers', icon: 'transport' },
    { id: '2', name: 'Dining', description: 'Chefs & local cuisine', icon: 'dining' },
    { id: '3', name: 'Wellness', description: 'Spa & fitness', icon: 'wellness' },
    { id: '4', name: 'Adventure', description: 'Tours & experiences', icon: 'adventure' },
    { id: '5', name: 'Household', description: 'Cleaning & services', icon: 'household' },
    { id: '6', name: '24/7 Support', description: 'Emergency assistance', icon: 'support' },
  ];

  const displayCategories = categories || defaultCategories;

  if (isLoading) {
    return (
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="h-8 bg-muted rounded w-64 mx-auto mb-4"></div>
            <div className="h-6 bg-muted rounded w-96 mx-auto"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-xl"></div>
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
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4" data-testid="text-services-title">
            Complete Travel Services
          </h2>
          <p className="text-lg text-muted-foreground" data-testid="text-services-subtitle">
            Everything you need for the perfect trip, all in one place
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {displayCategories?.map((category: any) => {
            const IconComponent = iconMap[category.icon as keyof typeof iconMap] || Car;
            
            return (
              <Card 
                key={category.id}
                data-testid={`card-service-${category.name.toLowerCase()}`}
                className="service-card bg-card rounded-xl p-6 text-center border border-border cursor-pointer hover:shadow-md transition-all"
                onClick={() => window.location.href = `/services?category=${category.id}`}
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <IconComponent className="text-primary w-6 h-6" />
                </div>
                <h3 className="font-semibold text-foreground">{category.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
