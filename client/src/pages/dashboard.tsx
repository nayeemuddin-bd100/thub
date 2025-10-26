import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar, MapPin, Star, Users, Clock, DollarSign, Building, UserCheck, Search } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Dashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    // Check URL params first
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab) return tab;
    
    // Default tab based on role
    return user?.role === 'admin' ? 'overview' : 'bookings';
  });

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
    } else if (user?.role === 'admin') {
      // Set default tab for admin if not in URL
      setActiveTab('overview');
    }
  }, [user?.role]);

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

  // Admin stats query
  const { data: adminStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admin/stats'],
    enabled: isAuthenticated && user?.role === 'admin',
    retry: false,
  });

  // Admin users query
  const { data: allUsers, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/admin/users'],
    enabled: isAuthenticated && user?.role === 'admin',
    retry: false,
  });

  // State for user search and filter
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Mutation to assign user role
  const assignRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      return await apiRequest('/api/admin/assign-role', {
        method: 'PUT',
        body: JSON.stringify({ userId, role }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      toast({
        title: "Success",
        description: "User role updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user role",
        variant: "destructive",
      });
    },
  });

  // Self-service become provider mutation
  const becomeProviderMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/user/become-provider');
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: "Success!",
        description: user?.role === 'admin' 
          ? "You are now a service provider! Redirecting to admin panel..."
          : "You are now a service provider! Reloading page...",
      });
      setTimeout(() => {
        if (user?.role === 'admin') {
          window.location.href = '/admin';
        } else {
          window.location.reload();
        }
      }, 1500);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upgrade account",
        variant: "destructive",
      });
    },
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
          {user?.role === 'admin' ? (
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview" data-testid="tab-overview">
                <DollarSign className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="users" data-testid="tab-users">
                <Users className="w-4 h-4 mr-2" />
                Users
              </TabsTrigger>
              <TabsTrigger value="properties" data-testid="tab-properties">
                <Building className="w-4 h-4 mr-2" />
                Properties
              </TabsTrigger>
              <TabsTrigger value="services" data-testid="tab-services">
                <UserCheck className="w-4 h-4 mr-2" />
                Services
              </TabsTrigger>
              <TabsTrigger value="profile" data-testid="tab-profile">
                <Users className="w-4 h-4 mr-2" />
                Profile
              </TabsTrigger>
            </TabsList>
          ) : (
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
          )}

          {/* Admin Overview Tab */}
          {user?.role === 'admin' && (
            <TabsContent value="overview" className="space-y-6">
              <h2 className="text-2xl font-semibold text-foreground" data-testid="text-overview-title">
                Platform Overview
              </h2>
              
              {statsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-32 bg-muted rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Users</p>
                        <p className="text-2xl font-bold text-foreground mt-2" data-testid="stat-total-users">
                          {adminStats?.totalUsers || 0}
                        </p>
                      </div>
                      <Users className="w-8 h-8 text-primary" />
                    </div>
                  </Card>
                  
                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Properties</p>
                        <p className="text-2xl font-bold text-foreground mt-2" data-testid="stat-total-properties">
                          {adminStats?.totalProperties || 0}
                        </p>
                      </div>
                      <Building className="w-8 h-8 text-primary" />
                    </div>
                  </Card>
                  
                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Service Providers</p>
                        <p className="text-2xl font-bold text-foreground mt-2" data-testid="stat-total-providers">
                          {adminStats?.totalServiceProviders || 0}
                        </p>
                      </div>
                      <UserCheck className="w-8 h-8 text-primary" />
                    </div>
                  </Card>
                  
                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Bookings</p>
                        <p className="text-2xl font-bold text-foreground mt-2" data-testid="stat-total-bookings">
                          {adminStats?.totalBookings || 0}
                        </p>
                      </div>
                      <Calendar className="w-8 h-8 text-primary" />
                    </div>
                  </Card>
                </div>
              )}
              
              <div className="mt-8">
                <p className="text-muted-foreground text-center">
                  Welcome to the admin dashboard! Use the tabs above to manage users, properties, and services.
                </p>
              </div>
            </TabsContent>
          )}

          {/* Admin Users Tab */}
          {user?.role === 'admin' && (
            <TabsContent value="users" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-foreground" data-testid="text-users-title">
                  User Management
                </h2>
              </div>
              
              {/* Search and Filter */}
              <div className="flex gap-4 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-user-search"
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[200px]" data-testid="select-role-filter">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="property_owner">Property Owner</SelectItem>
                    <SelectItem value="service_provider">Service Provider</SelectItem>
                    <SelectItem value="client">Client</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {usersLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 bg-muted rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : allUsers && allUsers.length > 0 ? (
                <div className="space-y-4">
                  {allUsers
                    .filter((u: any) => {
                      // Search filter
                      const matchesSearch = !searchQuery || 
                        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (u.firstName && u.firstName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                        (u.lastName && u.lastName.toLowerCase().includes(searchQuery.toLowerCase()));
                      
                      // Role filter
                      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
                      
                      return matchesSearch && matchesRole;
                    })
                    .map((u: any) => (
                    <Card key={u.id} className="p-4" data-testid={`card-user-${u.id}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-lg font-semibold text-primary">
                              {u.firstName?.[0] || u.email[0].toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">
                              {u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : 'No name'}
                            </p>
                            <p className="text-sm text-muted-foreground">{u.email}</p>
                            <p className="text-xs text-muted-foreground">
                              Joined {new Date(u.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Select 
                            value={u.role} 
                            onValueChange={(newRole) => assignRoleMutation.mutate({ userId: u.id, role: newRole })}
                            disabled={assignRoleMutation.isPending}
                          >
                            <SelectTrigger className="w-[180px]" data-testid={`select-role-${u.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="client">Client</SelectItem>
                              <SelectItem value="property_owner">Property Owner</SelectItem>
                              <SelectItem value="service_provider">Service Provider</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No Users Found
                  </h3>
                  <p className="text-muted-foreground">
                    {searchQuery || roleFilter !== 'all' ? 'No users match your filters.' : 'No users registered yet.'}
                  </p>
                </div>
              )}
            </TabsContent>
          )}

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
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => window.location.href = `/properties/${booking.propertyId}`}
                          data-testid={`button-view-booking-${booking.id}`}
                        >
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
                  onClick={() => becomeProviderMutation.mutate()}
                  disabled={becomeProviderMutation.isPending}
                >
                  {becomeProviderMutation.isPending ? 'Upgrading...' : 'Become a Provider'}
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
