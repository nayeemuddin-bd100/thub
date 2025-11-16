import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Users, Bed, Car, Heart, MapPin } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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
  const serviceCount = property.serviceCount || 0;
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { data: favorites = [] } = useQuery<any[]>({
    queryKey: ['/api/favorites'],
    enabled: isAuthenticated,
  });

  const isFavorite = Array.isArray(favorites) && favorites.some((fav: any) => fav.propertyId === property.id);

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (isFavorite) {
        const favorite = Array.isArray(favorites) && favorites.find((fav: any) => fav.propertyId === property.id);
        await apiRequest('DELETE', `/api/favorites/${favorite.id}`);
      } else {
        await apiRequest('POST', '/api/favorites', { 
          favoriteType: 'property',
          propertyId: property.id 
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      toast({
        title: isFavorite ? "Removed from favorites" : "Added to favorites",
        description: isFavorite 
          ? "Property removed from your favorites" 
          : "Property added to your favorites",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast({
        title: "Login required",
        description: "Please log in to add favorites",
        variant: "destructive",
      });
      return;
    }
    toggleFavoriteMutation.mutate();
  };
  
  return (
    <Link href={`/properties/${property.id}`}>
      <Card 
        data-testid={`card-property-${property.id}`}
        className="group relative bg-card rounded-3xl overflow-hidden border border-border/50 cursor-pointer transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 hover:border-primary/50"
      >
        {/* Image Container with Overlay */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10 opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
          
          <img 
            src={imageUrl}
            alt={property.title}
            className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
          
          {/* Rating Badge */}
          <div className="absolute top-4 left-4 z-20 flex items-center space-x-1 bg-white/95 dark:bg-black/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-lg">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-bold text-foreground" data-testid={`text-property-rating-${property.id}`}>
              {parseFloat(property.rating).toFixed(1)}
            </span>
          </div>

          {/* Favorite Button */}
          {isAuthenticated && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-20 bg-white/95 dark:bg-black/95 backdrop-blur-md hover:bg-white dark:hover:bg-black transition-all shadow-lg hover:scale-110"
              onClick={handleFavoriteClick}
              data-testid={`button-favorite-${property.id}`}
            >
              <Heart 
                className={`w-5 h-5 transition-all duration-300 ${
                  isFavorite 
                    ? 'fill-red-500 text-red-500 scale-110' 
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              />
            </Button>
          )}

          {/* Service Badge */}
          {serviceCount > 0 && (
            <div className="absolute bottom-4 left-4 z-20">
              <Badge 
                className="bg-primary/90 text-primary-foreground backdrop-blur-md shadow-lg border-0 px-3 py-1.5"
                data-testid={`badge-services-${property.id}`}
              >
                <span className="font-semibold">+{serviceCount} service{serviceCount !== 1 ? 's' : ''}</span>
              </Badge>
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Title and Location */}
          <div>
            <h3 
              className="font-bold text-lg text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors duration-300" 
              data-testid={`text-property-title-${property.id}`}
            >
              {property.title}
            </h3>
            <div className="flex items-center space-x-1.5 text-muted-foreground">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <p className="text-sm line-clamp-1" data-testid={`text-property-location-${property.id}`}>
                {property.location}
              </p>
            </div>
          </div>
          
          {/* Price */}
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-foreground" data-testid={`text-property-price-${property.id}`}>
              ${parseFloat(property.pricePerNight).toLocaleString()}
            </span>
            <span className="text-sm font-medium text-muted-foreground">/ night</span>
          </div>
          
          {/* Amenities */}
          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <div className="flex items-center space-x-1 text-muted-foreground" data-testid={`text-property-guests-${property.id}`}>
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">{property.maxGuests}</span>
            </div>
            <div className="flex items-center space-x-1 text-muted-foreground" data-testid={`text-property-beds-${property.id}`}>
              <Bed className="w-4 h-4" />
              <span className="text-sm font-medium">{property.bedrooms}</span>
            </div>
            <div className="flex items-center space-x-1 text-muted-foreground">
              <Car className="w-4 h-4" />
              <span className="text-sm font-medium">Yes</span>
            </div>
          </div>
        </div>

        {/* Shine Effect on Hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
        </div>
      </Card>
    </Link>
  );
}
