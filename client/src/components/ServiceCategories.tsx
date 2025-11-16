import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Car, Utensils, Waves, Mountain, Sparkles, Headphones, Home, Camera, Users, Dumbbell } from "lucide-react";

const iconMap = {
  transport: Car,
  dining: Utensils,
  wellness: Waves,
  adventure: Mountain,
  household: Sparkles,
  support: Headphones,
  concierge: Home,
  photography: Camera,
  massage: Users,
  chef: Utensils,
  "spa": Dumbbell,
  "tour": Mountain,
};

// Gradient colors for each category
const categoryColors = [
  { from: 'from-blue-500', to: 'to-cyan-500', icon: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30' },
  { from: 'from-orange-500', to: 'to-red-500', icon: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950/30' },
  { from: 'from-teal-500', to: 'to-emerald-500', icon: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-950/30' },
  { from: 'from-purple-500', to: 'to-pink-500', icon: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/30' },
  { from: 'from-indigo-500', to: 'to-blue-500', icon: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950/30' },
  { from: 'from-green-500', to: 'to-lime-500', icon: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/30' },
  { from: 'from-rose-500', to: 'to-pink-500', icon: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-950/30' },
  { from: 'from-amber-500', to: 'to-yellow-500', icon: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30' },
  { from: 'from-sky-500', to: 'to-blue-500', icon: 'text-sky-600', bg: 'bg-sky-50 dark:bg-sky-950/30' },
  { from: 'from-violet-500', to: 'to-purple-500', icon: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-950/30' },
];

export default function ServiceCategories() {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['/api/service-categories'],
  });

  const defaultCategories = [
    { id: '1', name: 'Concierge', description: 'Personal assistant and concierge services', icon: 'concierge' },
    { id: '2', name: 'Laundry Service', description: 'Laundry and dry cleaning services', icon: 'household' },
    { id: '3', name: 'Maid Service', description: 'Professional cleaning and housekeeping services', icon: 'household' },
    { id: '4', name: 'Massage Therapy', description: 'Professional massage and therapeutic services', icon: 'wellness' },
    { id: '5', name: 'Personal Chef', description: 'In-home chef and meal preparation', icon: 'dining' },
    { id: '6', name: 'Photography', description: 'Professional photography and videography', icon: 'photography' },
    { id: '7', name: 'Private Dining', description: 'Private chef and catering services', icon: 'dining' },
    { id: '8', name: 'Spa & Wellness', description: 'Spa treatments and wellness services', icon: 'wellness' },
    { id: '9', name: 'Tour Guide', description: 'Local tour guides and travel experiences', icon: 'adventure' },
    { id: '10', name: 'Transport', description: 'Airport transfers, car rentals, and transportation', icon: 'transport' },
  ];

  const displayCategories = categories || defaultCategories;

  if (isLoading) {
    return (
      <section className="relative py-20 bg-gradient-to-br from-background via-muted/30 to-background overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="h-10 bg-muted rounded-lg w-96 mx-auto mb-4 animate-pulse"></div>
            <div className="h-6 bg-muted rounded-lg w-[32rem] mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <div key={i} className="h-44 bg-muted rounded-2xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-20 bg-gradient-to-br from-background via-muted/30 to-background overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-primary/3 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium backdrop-blur-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              Premium Services
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 bg-clip-text" data-testid="text-services-title">
            Complete Travel Services
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto" data-testid="text-services-subtitle">
            Everything you need for the perfect trip, all in one place
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {Array.isArray(displayCategories) && displayCategories.slice(0, 10).map((category: any, index: number) => {
            const IconComponent = iconMap[category.icon as keyof typeof iconMap] || Car;
            const colors = categoryColors[index % categoryColors.length];
            
            return (
              <Card 
                key={category.id}
                data-testid={`card-service-${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="group relative bg-card/80 backdrop-blur-sm rounded-2xl p-6 text-center border border-border/50 cursor-pointer overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/50"
                onClick={() => window.location.href = `/services?category=${category.id}`}
              >
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${colors.from} ${colors.to} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                
                {/* Icon Container */}
                <div className="relative">
                  <div className={`w-16 h-16 ${colors.bg} rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                    <IconComponent className={`${colors.icon} w-8 h-8 transition-all duration-300 group-hover:scale-110`} />
                  </div>
                  
                  {/* Decorative Circle */}
                  <div className={`absolute top-0 right-0 w-3 h-3 bg-gradient-to-br ${colors.from} ${colors.to} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                </div>
                
                {/* Content */}
                <div className="relative">
                  <h3 className="font-bold text-foreground mb-2 text-sm group-hover:text-primary transition-colors duration-300">
                    {category.name}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {category.description}
                  </p>
                </div>
                
                {/* Hover Indicator */}
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className={`w-12 h-1 bg-gradient-to-r ${colors.from} ${colors.to} rounded-full`}></div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <button
            onClick={() => window.location.href = '/services'}
            className="group inline-flex items-center px-8 py-4 bg-primary text-primary-foreground rounded-full font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 hover:scale-105"
          >
            <span>Explore All Services</span>
            <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
