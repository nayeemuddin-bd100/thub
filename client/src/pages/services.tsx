import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import ServiceProviderCard from "@/components/ServiceProviderCard";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Search, MapPin } from "lucide-react";

export default function Services() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [filters, setFilters] = useState({
    categoryId: '',
    location: '',
    search: '',
  });

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    // Parse URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    setFilters({
      categoryId: urlParams.get('category') || '',
      location: urlParams.get('location') || '',
      search: urlParams.get('search') || '',
    });
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

  const { data: categories } = useQuery({
    queryKey: ['/api/service-categories'],
  });

  const buildQueryParams = () => {
    const params = new URLSearchParams();
    if (filters.categoryId) params.append('categoryId', filters.categoryId);
    if (filters.location) params.append('location', filters.location);
    return params.toString();
  };

  const { data: providers, isLoading, error } = useQuery({
    queryKey: ['/api/service-providers', buildQueryParams()],
    queryFn: async () => {
      const queryString = buildQueryParams();
      const response = await fetch(`/api/service-providers${queryString ? `?${queryString}` : ''}`);
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      return response.json();
    },
    retry: false,
  });

  useEffect(() => {
    if (error && isUnauthorizedError(error as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [error, toast]);

  const filteredProviders = providers?.filter((provider: any) => {
    if (!filters.search) return true;
    const searchLower = filters.search.toLowerCase();
    return (
      provider.businessName.toLowerCase().includes(searchLower) ||
      provider.description.toLowerCase().includes(searchLower) ||
      (provider.user?.firstName + ' ' + provider.user?.lastName).toLowerCase().includes(searchLower)
    );
  }) || [];

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.append(k, v);
    });
    window.history.replaceState({}, '', `/services${params.toString() ? `?${params.toString()}` : ''}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onToggleDarkMode={toggleDarkMode} 
        isDarkMode={isDarkMode} 
        isAuthenticated={isAuthenticated}
        user={user}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-services-title">
            Service Providers
          </h1>
          <p className="text-lg text-muted-foreground" data-testid="text-services-subtitle">
            Find trusted professionals to enhance your travel experience
          </p>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                data-testid="input-search-services"
                placeholder="Search services..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filters.categoryId} onValueChange={(value) => handleFilterChange('categoryId', value)}>
              <SelectTrigger data-testid="select-category">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All categories</SelectItem>
                {categories?.map((category: any) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                data-testid="input-location-services"
                placeholder="Location"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="pl-10"
              />
            </div>

            <Button 
              data-testid="button-clear-filters"
              variant="outline" 
              onClick={() => {
                setFilters({ categoryId: '', location: '', search: '' });
                window.history.replaceState({}, '', '/services');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </Card>

        {/* Service Providers Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-2xl animate-pulse" data-testid={`skeleton-service-${i}`}></div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-lg text-destructive" data-testid="text-services-error">
              Failed to load service providers. Please try again.
            </p>
          </div>
        ) : filteredProviders.length > 0 ? (
          <>
            <div className="mb-6">
              <p className="text-muted-foreground" data-testid="text-services-count">
                {filteredProviders.length} service providers found
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProviders.map((provider: any) => (
                <ServiceProviderCard key={provider.id} provider={provider} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground" data-testid="text-no-services">
              No service providers match your search criteria.
            </p>
            <p className="text-muted-foreground mt-2">
              Try adjusting your filters or search terms.
            </p>
          </div>
        )}

        {/* Become a Provider CTA */}
        {isAuthenticated && (
          <Card className="mt-16 p-8 text-center bg-primary/5 border-primary/20">
            <h2 className="text-2xl font-bold text-foreground mb-4" data-testid="text-provider-cta-title">
              Become a Service Provider
            </h2>
            <p className="text-muted-foreground mb-6" data-testid="text-provider-cta-description">
              Share your expertise and earn income by providing services to travelers
            </p>
            <Button 
              data-testid="button-become-provider"
              onClick={() => window.location.href = '/dashboard?tab=provider'}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Get Started
            </Button>
          </Card>
        )}
      </div>

      <Footer />
    </div>
  );
}
