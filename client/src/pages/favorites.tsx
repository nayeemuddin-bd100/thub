import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, Home, Briefcase } from "lucide-react";
import { Link, useLocation } from "wouter";
import PropertyCard from "@/components/PropertyCard";
import ServiceProviderCard from "@/components/ServiceProviderCard";
import { useTranslation } from "react-i18next";

export default function FavoritesPage() {
  const { t } = useTranslation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: favorites = [], isLoading: favoritesLoading } = useQuery({
    queryKey: ['/api/favorites'],
    enabled: isAuthenticated,
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['/api/properties'],
  });

  const { data: providers = [] } = useQuery({
    queryKey: ['/api/service-providers'],
  });

  if (authLoading || favoritesLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Skeleton className="h-12 w-64 mb-8" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    setLocation('/login');
    return null;
  }

  const favoriteProperties = properties.filter((prop: any) => 
    favorites.some((fav: any) => fav.propertyId === prop.id)
  );

  const favoriteProviders = providers.filter((prov: any) => 
    favorites.some((fav: any) => fav.serviceProviderId === prov.id)
  );

  const totalFavorites = favoriteProperties.length + favoriteProviders.length;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center space-x-3 mb-8">
          <Heart className="w-8 h-8 text-red-500 fill-current" />
          <h1 className="text-4xl font-bold text-foreground" data-testid="text-favorites-title">
            {t('favorites.title')}
          </h1>
        </div>

        {totalFavorites === 0 ? (
          <Card className="p-12 text-center">
            <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {t('favorites.no_favorites')}
            </h3>
            <p className="text-muted-foreground mb-6">
              {t('favorites.start_exploring')}
            </p>
            <div className="flex justify-center space-x-4">
              <Link href="/properties">
                <button 
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                  data-testid="button-browse-properties"
                >
                  {t('home.browse_properties')}
                </button>
              </Link>
              <Link href="/services">
                <button 
                  className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90"
                  data-testid="button-browse-services"
                >
                  {t('home.browse_services')}
                </button>
              </Link>
            </div>
          </Card>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-8" data-testid="tabs-favorites">
              <TabsTrigger value="all" data-testid="tab-all">
                {t('common.all')} ({totalFavorites})
              </TabsTrigger>
              <TabsTrigger value="properties" data-testid="tab-properties">
                <Home className="w-4 h-4 mr-2" />
                {t('dashboard.properties')} ({favoriteProperties.length})
              </TabsTrigger>
              <TabsTrigger value="providers" data-testid="tab-providers">
                <Briefcase className="w-4 h-4 mr-2" />
                {t('dashboard.service_providers')} ({favoriteProviders.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-8">
              {favoriteProperties.length > 0 && (
                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">
                    {t('dashboard.properties')}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favoriteProperties.map((property: any) => (
                      <PropertyCard key={property.id} property={property} />
                    ))}
                  </div>
                </div>
              )}

              {favoriteProviders.length > 0 && (
                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">
                    {t('dashboard.service_providers')}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {favoriteProviders.map((provider: any) => (
                      <ServiceProviderCard key={provider.id} provider={provider} />
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="properties">
              {favoriteProperties.length === 0 ? (
                <Card className="p-12 text-center">
                  <Home className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {t('favorites.no_favorites')}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {t('favorites.start_exploring')}
                  </p>
                  <Link href="/properties">
                    <button 
                      className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                      data-testid="button-browse-properties-empty"
                    >
                      {t('home.browse_properties')}
                    </button>
                  </Link>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favoriteProperties.map((property: any) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="providers">
              {favoriteProviders.length === 0 ? (
                <Card className="p-12 text-center">
                  <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {t('favorites.no_favorites')}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {t('favorites.start_exploring')}
                  </p>
                  <Link href="/services">
                    <button 
                      className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                      data-testid="button-browse-services-empty"
                    >
                      {t('home.browse_services')}
                    </button>
                  </Link>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {favoriteProviders.map((provider: any) => (
                    <ServiceProviderCard key={provider.id} provider={provider} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
