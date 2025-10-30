import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Users, Bed, Car } from "lucide-react";
import { Link } from "wouter";

interface PropertyCardProps {
  property: {
    id: string;
    title: string;
    location: string;
    pricePerNight: string;
    maxGuests: number;
    bedrooms: number;
    rating: string;
    images: string[];
    amenities?: string[];
    serviceCount?: number;
  };
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const imageUrl = property.images?.[0] || "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600";
  const serviceCount = property.serviceCount || 0; // Real service count from database
  
  return (
    <Link href={`/properties/${property.id}`}>
      <Card 
        data-testid={`card-property-${property.id}`}
        className="bg-card rounded-2xl overflow-hidden border border-border group cursor-pointer hover:shadow-lg transition-all"
      >
        <div className="relative">
          <img 
            src={imageUrl}
            alt={property.title}
            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        
        <div className="p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-foreground" data-testid={`text-property-title-${property.id}`}>
              {property.title}
            </h3>
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium" data-testid={`text-property-rating-${property.id}`}>
                {parseFloat(property.rating).toFixed(1)}
              </span>
            </div>
          </div>
          
          <p className="text-muted-foreground text-sm mb-3" data-testid={`text-property-location-${property.id}`}>
            {property.location}
          </p>
          
          <div className="flex items-center justify-between mb-3">
            <span className="text-lg font-bold text-foreground" data-testid={`text-property-price-${property.id}`}>
              ${parseFloat(property.pricePerNight).toLocaleString()} 
              <span className="text-sm font-normal text-muted-foreground"> / night</span>
            </span>
            {serviceCount > 0 && (
              <Badge variant="secondary" className="text-xs" data-testid={`badge-services-${property.id}`}>
                +{serviceCount} service{serviceCount !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
            <span className="flex items-center space-x-1" data-testid={`text-property-guests-${property.id}`}>
              <Users className="w-4 h-4" />
              <span>{property.maxGuests} guests</span>
            </span>
            <span className="flex items-center space-x-1" data-testid={`text-property-beds-${property.id}`}>
              <Bed className="w-4 h-4" />
              <span>{property.bedrooms} beds</span>
            </span>
            <span className="flex items-center space-x-1">
              <Car className="w-4 h-4" />
              <span>Parking</span>
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
