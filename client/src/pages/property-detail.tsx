import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import VideoGallery from "@/components/VideoGallery";
import ReviewSystem from "@/components/ReviewSystem";
import BookingCart from "@/components/BookingCart";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Users, Bed, Bath, MapPin, Car, Wifi, Waves, Mountain, Coffee, Tv } from "lucide-react";

export default function PropertyDetail() {
  const [, params] = useRoute('/properties/:id');
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedServices, setSelectedServices] = useState<any[]>([]);

  const propertyId = params?.id;

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

  const { data: property, isLoading: propertyLoading, error: propertyError } = useQuery({
    queryKey: ['/api/properties', propertyId],
    enabled: !!propertyId,
    retry: false,
  });

  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: ['/api/properties', propertyId, 'services'],
    enabled: !!propertyId,
    retry: false,
  });

  const { data: reviews } = useQuery({
    queryKey: ['/api/properties', propertyId, 'reviews'],
    enabled: !!propertyId,
    retry: false,
  });

  const amenityIcons: { [key: string]: any } = {
    parking: Car,
    wifi: Wifi,
    pool: Waves,
    mountain: Mountain,
    coffee: Coffee,
    tv: Tv,
  };

  if (propertyLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          onToggleDarkMode={toggleDarkMode} 
          isDarkMode={isDarkMode} 
          isAuthenticated={isAuthenticated}
          user={user}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-64 mb-4"></div>
            <div className="h-96 bg-muted rounded-2xl mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-32 bg-muted rounded"></div>
                <div className="h-64 bg-muted rounded"></div>
              </div>
              <div className="h-96 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (propertyError || !property) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          onToggleDarkMode={toggleDarkMode} 
          isDarkMode={isDarkMode} 
          isAuthenticated={isAuthenticated}
          user={user}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4" data-testid="text-property-not-found">
              Property Not Found
            </h1>
            <p className="text-muted-foreground mb-6">
              The property you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => window.history.back()} data-testid="button-go-back">
              Go Back
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const mainImage = property.images?.[0] || "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800";

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onToggleDarkMode={toggleDarkMode} 
        isDarkMode={isDarkMode} 
        isAuthenticated={isAuthenticated}
        user={user}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Property Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-property-title">
            {property.title}
          </h1>
          <div className="flex items-center space-x-4 text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span data-testid="text-property-rating">{parseFloat(property.rating).toFixed(1)}</span>
              <span>({property.reviewCount} reviews)</span>
            </div>
            <div className="flex items-center space-x-1">
              <MapPin className="w-4 h-4" />
              <span data-testid="text-property-location">{property.location}</span>
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="mb-8">
          <img 
            src={mainImage}
            alt={property.title}
            className="w-full h-96 object-cover rounded-2xl"
            data-testid="img-property-main"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Property Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Info */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground" data-testid="text-property-details">
                  Property Details
                </h2>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span data-testid="text-property-guests">{property.maxGuests} guests</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Bed className="w-4 h-4" />
                    <span data-testid="text-property-bedrooms">{property.bedrooms} bedrooms</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Bath className="w-4 h-4" />
                    <span data-testid="text-property-bathrooms">{property.bathrooms} bathrooms</span>
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground" data-testid="text-property-description">
                {property.description || "Experience luxury and comfort in this stunning property with world-class amenities and integrated services for the perfect getaway."}
              </p>
            </Card>

            {/* Amenities */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4" data-testid="text-amenities-title">
                Amenities
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {(property.amenities || ['wifi', 'parking', 'pool', 'mountain', 'coffee', 'tv']).map((amenity: string, index: number) => {
                  const IconComponent = amenityIcons[amenity] || Wifi;
                  return (
                    <div key={index} className="flex items-center space-x-2" data-testid={`amenity-${amenity}`}>
                      <IconComponent className="w-5 h-5 text-primary" />
                      <span className="text-foreground capitalize">{amenity}</span>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Video Gallery */}
            <VideoGallery 
              videos={property.videos || []}
              title={property.title}
            />

            {/* Available Services */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4" data-testid="text-services-title">
                Available Services
              </h2>
              {servicesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-muted rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : services && services.length > 0 ? (
                <div className="space-y-4">
                  {services.map((service: any) => (
                    <div 
                      key={service.id} 
                      className="border border-border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
                      data-testid={`service-${service.id}`}
                      onClick={() => {
                        const isSelected = selectedServices.find(s => s.id === service.id);
                        if (isSelected) {
                          setSelectedServices(prev => prev.filter(s => s.id !== service.id));
                        } else {
                          setSelectedServices(prev => [...prev, service]);
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{service.businessName}</h3>
                          <p className="text-sm text-muted-foreground">{service.description}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm">{parseFloat(service.rating).toFixed(1)}</span>
                            <Badge variant="secondary" className="text-xs">
                              {service.hourlyRate ? `$${service.hourlyRate}/hour` : `$${service.fixedRate}/service`}
                            </Badge>
                          </div>
                        </div>
                        <div className="ml-4">
                          <input
                            type="checkbox"
                            checked={!!selectedServices.find(s => s.id === service.id)}
                            onChange={() => {}}
                            className="w-5 h-5"
                            data-testid={`checkbox-service-${service.id}`}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground" data-testid="text-no-services">
                  No services available for this property.
                </p>
              )}
            </Card>

            {/* Reviews */}
            <ReviewSystem 
              reviews={reviews || []}
              propertyId={propertyId}
              canReview={isAuthenticated}
            />
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <BookingCart
                property={property}
                selectedServices={selectedServices}
                onServicesChange={setSelectedServices}
              />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
