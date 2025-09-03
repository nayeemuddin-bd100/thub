import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

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
  };
}

export default function ServiceProviderCard({ provider }: ServiceProviderCardProps) {
  const avatarUrl = provider.user?.profileImageUrl || 
    `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300`;
  
  const rate = provider.hourlyRate ? 
    `$${parseFloat(provider.hourlyRate).toLocaleString()}/hour` :
    `$${parseFloat(provider.fixedRate || '0').toLocaleString()}/service`;

  const availability = Math.random() > 0.5 ? 'Available today' : 'Book now';
  
  return (
    <Card 
      data-testid={`card-provider-${provider.id}`}
      className="bg-card rounded-2xl p-6 border border-border hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-start space-x-4">
        <img 
          src={avatarUrl}
          alt={`${provider.user?.firstName} ${provider.user?.lastName}`}
          className="w-16 h-16 rounded-xl object-cover"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
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
          
          <p className="text-muted-foreground text-sm mb-3" data-testid={`text-provider-description-${provider.id}`}>
            {provider.description}
          </p>
          
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-foreground" data-testid={`text-provider-rate-${provider.id}`}>
              {rate}
            </span>
            <Badge 
              variant={availability === 'Available today' ? 'default' : 'secondary'}
              className="text-xs"
              data-testid={`badge-availability-${provider.id}`}
            >
              {availability}
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
}
