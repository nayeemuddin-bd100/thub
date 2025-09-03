import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RoleSwitcher from "@/components/RoleSwitcher";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Star, Users, Clock, DollarSign, Building, UserCheck } from "lucide-react";

export default function Dashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("bookings");

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    // Parse URL parameters for active tab
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You need to be logged in to access the dashboard. Redirecting...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

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

  const { data: bookings, isLoading: bookingsLoading, error: bookingsError } = useQuery({
    queryKey: ['/api/bookings'],
    enabled: isAuthenticated,
    retry: false,
  });

  useEffect(() => {
    if (bookingsError && isUnauthorizedError(bookingsError as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [bookingsError, toast]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.replaceState({}, '', url.toString());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'default';
      case 'completed': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  if (authLoading) {
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
            <div className="h-8 bg-muted rounded w-64 mb-8"></div>
            <div className="h-96 bg-muted rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onToggleDarkMode={toggleDarkMode} 
        isDarkMode={isDarkMode} 
        isAuthenticated={isAuthenticated}
        user={user}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-dashboard-title">
            Welcome, {user?.firstName || 'Traveler'}!
          </h1>
          <p className="text-lg text-muted-foreground" data-testid="text-dashboard-subtitle">
            Manage your bookings, properties, and services
          </p>
        </div>

        {/* Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="bookings" data-testid="tab-bookings">
              <Calendar className="w-4 h-4 mr-2" />
              My Bookings
            </TabsTrigger>
            <TabsTrigger value="properties" data-testid="tab-properties">
              <Building className="w-4 h-4 mr-2" />
              My Properties
            </TabsTrigger>
            <TabsTrigger value="services" data-testid="tab-services">
              <UserCheck className="w-4 h-4 mr-2" />
              My Services
            </TabsTrigger>
            <TabsTrigger value="profile" data-testid="tab-profile">
              <Users className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
          </TabsList>

          {/* My Bookings */}
          <TabsContent value="bookings" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-foreground" data-testid="text-bookings-title">
                My Bookings
              </h2>
              <Button data-testid="button-new-booking" onClick={() => window.location.href = '/properties'}>
                Book New Stay
              </Button>
            </div>

            {bookingsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" data-testid={`skeleton-booking-${i}`}></div>
                ))}
              </div>
            ) : bookings && bookings.length > 0 ? (
              <div className="space-y-4">
                {bookings.map((booking: any) => (
                  <Card key={booking.id} className="p-6" data-testid={`card-booking-${booking.id}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-foreground" data-testid={`text-booking-code-${booking.id}`}>
                            Booking {booking.bookingCode}
                          </h3>
                          <Badge variant={getStatusColor(booking.status)} data-testid={`badge-booking-status-${booking.id}`}>
                            {booking.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span data-testid={`text-booking-dates-${booking.id}`}>
                              {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4" />
                            <span data-testid={`text-booking-guests-${booking.id}`}>
                              {booking.guests} guests
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-4 h-4" />
                            <span data-testid={`text-booking-total-${booking.id}`}>
                              ${parseFloat(booking.totalAmount).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" data-testid={`button-view-booking-${booking.id}`}>
                          View Details
                        </Button>
                        {booking.status === 'pending' && (
                          <Button variant="destructive" size="sm" data-testid={`button-cancel-booking-${booking.id}`}>
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2" data-testid="text-no-bookings-title">
                  No Bookings Yet
                </h3>
                <p className="text-muted-foreground mb-6" data-testid="text-no-bookings-description">
                  Start your journey by booking your first stay
                </p>
                <Button data-testid="button-browse-properties" onClick={() => window.location.href = '/properties'}>
                  Browse Properties
                </Button>
              </div>
            )}
          </TabsContent>

          {/* My Properties */}
          <TabsContent value="properties" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-foreground" data-testid="text-properties-title">
                My Properties
              </h2>
              {user?.role === 'property_owner' || user?.role === 'admin' ? (
                <Button data-testid="button-add-property">
                  Add Property
                </Button>
              ) : (
                <Button 
                  data-testid="button-become-host"
                  onClick={() => toast({
                    title: "Role Change Required",
                    description: "Contact admin to become a property owner.",
                  })}
                >
                  Become a Host
                </Button>
              )}
            </div>

            {user?.role === 'property_owner' || user?.role === 'admin' ? (
              <div className="text-center py-12">
                <Building className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2" data-testid="text-no-properties-title">
                  No Properties Listed
                </h3>
                <p className="text-muted-foreground mb-6" data-testid="text-no-properties-description">
                  Start earning by listing your first property
                </p>
                <Button data-testid="button-list-first-property">
                  List Your First Property
                </Button>
              </div>
            ) : (
              <Card className="p-8 text-center">
                <Building className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2" data-testid="text-not-property-owner">
                  Property Owner Access Required
                </h3>
                <p className="text-muted-foreground mb-6">
                  To list properties, you need to have a property owner role. Contact our support team to upgrade your account.
                </p>
                <Button variant="outline" data-testid="button-contact-support">
                  Contact Support
                </Button>
              </Card>
            )}
          </TabsContent>

          {/* My Services */}
          <TabsContent value="services" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-foreground" data-testid="text-services-title">
                My Services
              </h2>
              {user?.role === 'service_provider' || user?.role === 'admin' ? (
                <Button data-testid="button-add-service">
                  Add Service
                </Button>
              ) : (
                <Button 
                  data-testid="button-become-provider"
                  onClick={() => toast({
                    title: "Role Change Required",
                    description: "Contact admin to become a service provider.",
                  })}
                >
                  Become a Provider
                </Button>
              )}
            </div>

            {user?.role === 'service_provider' || user?.role === 'admin' ? (
              <div className="text-center py-12">
                <UserCheck className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2" data-testid="text-no-services-title">
                  No Services Listed
                </h3>
                <p className="text-muted-foreground mb-6" data-testid="text-no-services-description">
                  Start earning by offering your first service
                </p>
                <Button data-testid="button-list-first-service">
                  List Your First Service
                </Button>
              </div>
            ) : (
              <Card className="p-8 text-center">
                <UserCheck className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2" data-testid="text-not-service-provider">
                  Service Provider Access Required
                </h3>
                <p className="text-muted-foreground mb-6">
                  To offer services, you need to have a service provider role. Contact our support team to upgrade your account.
                </p>
                <Button variant="outline" data-testid="button-contact-support-services">
                  Contact Support
                </Button>
              </Card>
            )}
          </TabsContent>

          {/* Profile */}
          <TabsContent value="profile" className="space-y-6">
            <h2 className="text-2xl font-semibold text-foreground" data-testid="text-profile-title">
              Profile Settings
            </h2>
            
            <Card className="p-6">
              <div className="flex items-center space-x-6 mb-6">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                  {user?.profileImageUrl ? (
                    <img 
                      src={user.profileImageUrl} 
                      alt="Profile" 
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-primary">
                      {user?.firstName?.[0]?.toUpperCase() || 'U'}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground" data-testid="text-profile-name">
                    {user?.firstName} {user?.lastName}
                  </h3>
                  <p className="text-muted-foreground" data-testid="text-profile-email">
                    {user?.email}
                  </p>
                  <Badge variant="outline" data-testid="text-profile-role">
                    {user?.role?.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">First Name</label>
                  <p className="text-muted-foreground" data-testid="text-profile-firstname">
                    {user?.firstName || 'Not provided'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Last Name</label>
                  <p className="text-muted-foreground" data-testid="text-profile-lastname">
                    {user?.lastName || 'Not provided'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <p className="text-muted-foreground" data-testid="text-profile-email-detail">
                    {user?.email || 'Not provided'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Member Since</label>
                  <p className="text-muted-foreground" data-testid="text-profile-member-since">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
              </div>
            </Card>
            
            {/* Role Switcher */}
            <RoleSwitcher />
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}
