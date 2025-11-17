import { useState } from "react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Heart } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ServiceProviderCardProps {
  provider: {
    id: string;
    businessName: string;
    description: string;
    hourlyRate?: string;
    fixedRate?: string;
    rating: string;
    isVerified: boolean;
    user?: {
      firstName: string;
      lastName: string;
      profileImageUrl?: string;
    };
    category?: {
      id: string;
      name: string;
      description?: string;
      icon?: string;
    };
  };
}

export default function ServiceProviderCard({ provider }: ServiceProviderCardProps) {
  const avatarUrl = provider.user?.profileImageUrl || 
    `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300`;
  const { user, isAuthenticated } = useAuth();
  const { formatPrice } = useCurrency();
  const { toast } = useToast();
  
  const rate = provider.hourlyRate ? 
    `${formatPrice(parseFloat(provider.hourlyRate))}/hour` :
    `${formatPrice(parseFloat(provider.fixedRate || '0'))}/service`;

  const { data: favorites = [] } = useQuery<any[]>({
    queryKey: ['/api/favorites'],
    enabled: isAuthenticated,
  });

  const isFavorite = favorites.some((fav: any) => fav.serviceProviderId === provider.id);

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (isFavorite) {
        const favorite = favorites.find((fav: any) => fav.serviceProviderId === provider.id);
        await apiRequest('DELETE', `/api/favorites/${favorite.id}`);
      } else {
        await apiRequest('POST', '/api/favorites', { 
          favoriteType: 'service_provider',
          serviceProviderId: provider.id 
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      toast({
        title: isFavorite ? "Removed from favorites" : "Added to favorites",
        description: isFavorite 
          ? "Provider removed from your favorites" 
          : "Provider added to your favorites",
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
    <Link href={`/service-provider/${provider.id}`} data-testid={`link-provider-${provider.id}`}>
      <Card 
        data-testid={`card-provider-${provider.id}`}
        className="bg-card rounded-2xl p-6 border border-border hover:shadow-md transition-all cursor-pointer relative"
      >
      {isAuthenticated && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 bg-white/90 dark:bg-black/90 hover:bg-white dark:hover:bg-black transition-all shadow-md"
          onClick={handleFavoriteClick}
          data-testid={`button-favorite-provider-${provider.id}`}
        >
          <Heart 
            className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-700 dark:text-gray-300'}`}
          />
        </Button>
      )}
      <div className="flex items-start space-x-4">
        <img 
          src={avatarUrl}
          alt={`${provider.user?.firstName} ${provider.user?.lastName}`}
          className="w-16 h-16 rounded-xl object-cover"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-foreground" data-testid={`text-provider-name-${provider.id}`}>
              {provider.user?.firstName} {provider.user?.lastName}
            </h3>
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium" data-testid={`text-provider-rating-${provider.id}`}>
                {parseFloat(provider.rating).toFixed(1)}
              </span>
            </div>
          </div>
          
          {provider.category && (
            <p className="text-xs text-primary font-medium mb-2" data-testid={`text-provider-category-${provider.id}`}>
              {provider.category.name}
            </p>
          )}
          
          <p className="text-muted-foreground text-sm mb-3" data-testid={`text-provider-description-${provider.id}`}>
            {provider.description}
          </p>
          
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-foreground" data-testid={`text-provider-rate-${provider.id}`}>
              {rate}
            </span>
            {provider.isVerified && (
              <Badge 
                variant="default"
                className="text-xs"
                data-testid={`badge-verified-${provider.id}`}
              >
                Verified
              </Badge>
            )}
          </div>
        </div>
      </div>
      </Card>
    </Link>
  );
}
