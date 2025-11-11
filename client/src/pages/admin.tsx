import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutDashboard, 
  Users, 
  Building, 
  Briefcase, 
  Calendar,
  Settings,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Search,
  Eye,
  MapPin,
  Mail,
  Phone,
  User
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import CancellationManagement from "@/components/admin/CancellationManagement";
import PlatformSettings from "@/components/admin/PlatformSettings";
import ActivityLogs from "@/components/admin/ActivityLogs";
import PropertyServiceAssociation from "@/components/admin/PropertyServiceAssociation";
import EmailTemplates from "@/components/admin/EmailTemplates";
import TerritoryManagement from "@/components/admin/TerritoryManagement";
import PromotionalCodes from "@/components/admin/PromotionalCodes";
import { useTranslation } from "react-i18next";

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState('overview');
  const [propertyDialogOpen, setPropertyDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [bookingDetailsDialogOpen, setBookingDetailsDialogOpen] = useState(false);
  const [serviceProviderDialogOpen, setServiceProviderDialogOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<any>(null);

  // Redirect if not admin
  if (user?.role !== 'admin') {
    window.location.href = '/dashboard';
    return null;
  }

  // Admin data queries
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admin/stats'],
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/admin/users'],
  });

  const { data: properties, isLoading: propertiesLoading } = useQuery({
    queryKey: ['/api/admin/properties'],
  });

  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['/api/admin/bookings'],
  });

  const { data: bookingDetails, isLoading: bookingDetailsLoading } = useQuery({
    queryKey: ['/api/admin/bookings', selectedBookingId],
    enabled: !!selectedBookingId && bookingDetailsDialogOpen,
  });

  const { data: serviceOrders, isLoading: serviceOrdersLoading } = useQuery({
    queryKey: ['/api/admin/service-orders'],
  });

  const { data: serviceProviders, isLoading: providersLoading } = useQuery({
    queryKey: ['/api/admin/service-providers'],
  });

  const { data: serviceCategories } = useQuery({
    queryKey: ['/api/service-categories'],
  });

  // Update booking status mutation
  const updateBookingStatusMutation = useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: string; status: string }) => {
      const response = await apiRequest('PATCH', `/api/admin/bookings/${bookingId}/status`, { status });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/bookings'] });
      toast({
        title: t('common.success'),
        description: t('admin.booking_status_updated'),
      });
    },
    onError: () => {
      toast({
        title: t('common.error'),
        description: t('errors.booking_status_update_failed'),
        variant: "destructive",
      });
    },
  });

  // Update service order status mutation
  const updateServiceOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const response = await apiRequest('PATCH', `/api/admin/service-orders/${orderId}/status`, { status });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/service-orders'] });
      toast({
        title: t('common.success'),
        description: t('admin.order_status_updated'),
      });
    },
    onError: () => {
      toast({
        title: t('common.error'),
        description: t('errors.order_status_update_failed'),
        variant: "destructive",
      });
    },
  });

  // Property form state
  const [propertyForm, setPropertyForm] = useState({
    title: '',
    description: '',
    location: '',
    pricePerNight: '',
    maxGuests: '',
    bedrooms: '',
    bathrooms: '',
    amenities: '',
    images: '',
  });

  // Service provider form state
  const [providerForm, setProviderForm] = useState({
    userId: '',
    categoryId: '',
    businessName: '',
    description: '',
    hourlyRate: '',
    fixedRate: '',
    location: '',
    radius: '50',
    certifications: '',
    isVerified: false,
    isActive: true,
  });

  // Create/Update property mutation
  const savePropertyMutation = useMutation({
    mutationFn: async (data: any) => {
      const url = editingProperty 
        ? `/api/admin/properties/${editingProperty.id}`
        : '/api/admin/properties';
      
      const propertyData = {
        ...data,
        ownerId: user?.id,
        pricePerNight: parseFloat(data.pricePerNight),
        maxGuests: parseInt(data.maxGuests),
        bedrooms: parseInt(data.bedrooms),
        bathrooms: parseInt(data.bathrooms),
        amenities: data.amenities ? data.amenities.split(',').map((a: string) => a.trim()) : [],
        images: data.images ? data.images.split(',').map((i: string) => i.trim()) : [],
      };

      return await apiRequest(url, {
        method: editingProperty ? 'PUT' : 'POST',
        body: JSON.stringify(propertyData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/properties'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      toast({
        title: t('common.success'),
        description: editingProperty ? t('admin.property_updated') : t('admin.property_created'),
      });
      setPropertyDialogOpen(false);
      setEditingProperty(null);
      resetPropertyForm();
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.message || t('errors.save_property_failed'),
        variant: "destructive",
      });
    },
  });

  // Delete property mutation
  const deletePropertyMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/admin/properties/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/properties'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      toast({
        title: t('common.success'),
        description: t('admin.property_deleted'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.message || t('errors.delete_property_failed'),
        variant: "destructive",
      });
    },
  });

  // Assign role mutation
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
        title: t('common.success'),
        description: t('admin.role_updated'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.message || t('errors.role_update_failed'),
        variant: "destructive",
      });
    },
  });

  const resetPropertyForm = () => {
    setPropertyForm({
      title: '',
      description: '',
      location: '',
      pricePerNight: '',
      maxGuests: '',
      bedrooms: '',
      bathrooms: '',
      amenities: '',
      images: '',
    });
  };

  const handleEditProperty = (property: any) => {
    setEditingProperty(property);
    setPropertyForm({
      title: property.title || '',
      description: property.description || '',
      location: property.location || '',
      pricePerNight: property.pricePerNight || '',
      maxGuests: property.maxGuests?.toString() || '',
      bedrooms: property.bedrooms?.toString() || '',
      bathrooms: property.bathrooms?.toString() || '',
      amenities: Array.isArray(property.amenities) ? property.amenities.join(', ') : '',
      images: Array.isArray(property.images) ? property.images.join(', ') : '',
    });
    setPropertyDialogOpen(true);
  };

  // Service provider mutations
  const saveProviderMutation = useMutation({
    mutationFn: async (data: any) => {
      const url = editingProvider 
        ? `/api/admin/service-providers/${editingProvider.id}`
        : '/api/admin/service-providers';
      
      const method = editingProvider ? 'PATCH' : 'POST';
      const response = await apiRequest(method, url, data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/service-providers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      toast({
        title: t('common.success'),
        description: editingProvider ? t('admin.provider_updated') : t('admin.provider_created'),
      });
      setServiceProviderDialogOpen(false);
      setEditingProvider(null);
      resetProviderForm();
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.message || t('errors.save_provider_failed'),
        variant: "destructive",
      });
    },
  });

  const deleteProviderMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/admin/service-providers/${id}`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/service-providers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      toast({
        title: t('common.success'),
        description: t('admin.provider_deleted'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.message || t('errors.delete_provider_failed'),
        variant: "destructive",
      });
    },
  });

  const resetProviderForm = () => {
    setProviderForm({
      userId: '',
      categoryId: '',
      businessName: '',
      description: '',
      hourlyRate: '',
      fixedRate: '',
      location: '',
      radius: '50',
      certifications: '',
      isVerified: false,
      isActive: true,
    });
  };

  const handleEditProvider = (provider: any) => {
    setEditingProvider(provider);
    setProviderForm({
      userId: provider.userId || '',
      categoryId: provider.categoryId || '',
      businessName: provider.businessName || '',
      description: provider.description || '',
      hourlyRate: provider.hourlyRate || '',
      fixedRate: provider.fixedRate || '',
      location: provider.location || '',
      radius: provider.radius?.toString() || '50',
      certifications: Array.isArray(provider.certifications) ? provider.certifications.join(', ') : '',
      isVerified: provider.isVerified || false,
      isActive: provider.isActive !== false,
    });
    setServiceProviderDialogOpen(true);
  };

  const handleNewProvider = () => {
    setEditingProvider(null);
    resetProviderForm();
    setServiceProviderDialogOpen(true);
  };

  const handleNewProperty = () => {
    setEditingProvider(null);
    resetPropertyForm();
    setPropertyDialogOpen(true);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-primary">{t('admin.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">TravelHub</p>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <button
            onClick={() => setActiveSection('overview')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
              activeSection === 'overview'
                ? 'bg-primary text-primary-foreground'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            data-testid="nav-overview"
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>{t('admin.overview')}</span>
          </button>

          <button
            onClick={() => setActiveSection('users')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
              activeSection === 'users'
                ? 'bg-primary text-primary-foreground'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            data-testid="nav-users"
          >
            <Users className="w-5 h-5" />
            <span>{t('admin.users')}</span>
          </button>

          <button
            onClick={() => setActiveSection('properties')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
              activeSection === 'properties'
                ? 'bg-primary text-primary-foreground'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            data-testid="nav-properties"
          >
            <Building className="w-5 h-5" />
            <span>{t('dashboard.properties')}</span>
          </button>

          <button
            onClick={() => setActiveSection('providers')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
              activeSection === 'providers'
                ? 'bg-primary text-primary-foreground'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            data-testid="nav-providers"
          >
            <Briefcase className="w-5 h-5" />
            <span>{t('dashboard.service_providers')}</span>
          </button>

          <button
            onClick={() => setActiveSection('services')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
              activeSection === 'services'
                ? 'bg-primary text-primary-foreground'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            data-testid="nav-services"
          >
            <Settings className="w-5 h-5" />
            <span>{t('dashboard.services')}</span>
          </button>

          <button
            onClick={() => setActiveSection('bookings')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
              activeSection === 'bookings'
                ? 'bg-primary text-primary-foreground'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            data-testid="nav-bookings"
          >
            <Calendar className="w-5 h-5" />
            <span>{t('dashboard.bookings')}</span>
          </button>

          <button
            onClick={() => setActiveSection('service-orders')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
              activeSection === 'service-orders'
                ? 'bg-primary text-primary-foreground'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            data-testid="nav-service-orders"
          >
            <Briefcase className="w-5 h-5" />
            <span>{t('admin.service_orders')}</span>
          </button>

          <button
            onClick={() => setActiveSection('settings')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
              activeSection === 'settings'
                ? 'bg-primary text-primary-foreground'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            data-testid="nav-settings"
          >
            <Settings className="w-5 h-5" />
            <span>{t('dashboard.settings')}</span>
          </button>
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">
                {user?.firstName?.[0] || user?.email[0].toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'Admin'}
              </p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Button
            onClick={logout}
            variant="outline"
            className="w-full"
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {t('common.logout')}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Overview Section */}
          {activeSection === 'overview' && (
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-8">{t('admin.overview')}</h2>
              
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
                        <p className="text-sm text-muted-foreground">{t('admin.total_users')}</p>
                        <p className="text-3xl font-bold text-foreground mt-2" data-testid="stat-users">
                          {stats?.totalUsers || 0}
                        </p>
                      </div>
                      <Users className="w-12 h-12 text-primary opacity-20" />
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{t('dashboard.properties')}</p>
                        <p className="text-3xl font-bold text-foreground mt-2" data-testid="stat-properties">
                          {stats?.totalProperties || 0}
                        </p>
                      </div>
                      <Building className="w-12 h-12 text-primary opacity-20" />
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{t('dashboard.service_providers')}</p>
                        <p className="text-3xl font-bold text-foreground mt-2" data-testid="stat-providers">
                          {stats?.totalServiceProviders || 0}
                        </p>
                      </div>
                      <Briefcase className="w-12 h-12 text-primary opacity-20" />
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{t('admin.total_bookings')}</p>
                        <p className="text-3xl font-bold text-foreground mt-2" data-testid="stat-bookings">
                          {stats?.totalBookings || 0}
                        </p>
                      </div>
                      <Calendar className="w-12 h-12 text-primary opacity-20" />
                    </div>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* Users Section */}
          {activeSection === 'users' && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-foreground">{t('admin.user_management')}</h2>
              </div>

              {/* Search and Filter */}
              <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type="text"
                    placeholder={t('admin.search_users')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-users"
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[200px]" data-testid="select-role-filter">
                    <SelectValue placeholder={t('admin.filter_by_role')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('admin.all_roles')}</SelectItem>
                    <SelectItem value="admin">{t('admin.admin_role')}</SelectItem>
                    <SelectItem value="property_owner">{t('admin.property_owner_role')}</SelectItem>
                    <SelectItem value="service_provider">{t('admin.service_provider_role')}</SelectItem>
                    <SelectItem value="client">{t('admin.client_role')}</SelectItem>
                    <SelectItem value="country_manager">{t('admin.country_manager_role')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {usersLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-muted rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {users
                    ?.filter((u: any) => {
                      const matchesSearch = !searchQuery || 
                        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (u.firstName && u.firstName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                        (u.lastName && u.lastName.toLowerCase().includes(searchQuery.toLowerCase()));
                      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
                      return matchesSearch && matchesRole;
                    })
                    .map((u: any) => (
                      <Card key={u.id} className="p-4" data-testid={`user-card-${u.id}`}>
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
                          <Select 
                            value={u.role} 
                            onValueChange={(newRole) => assignRoleMutation.mutate({ userId: u.id, role: newRole })}
                            disabled={assignRoleMutation.isPending}
                          >
                            <SelectTrigger className="w-[180px]" data-testid={`select-role-${u.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="client">{t('admin.client_role')}</SelectItem>
                              <SelectItem value="property_owner">{t('admin.property_owner_role')}</SelectItem>
                              <SelectItem value="service_provider">{t('admin.service_provider_role')}</SelectItem>
                              <SelectItem value="country_manager">{t('admin.country_manager_role')}</SelectItem>
                              <SelectItem value="admin">{t('admin.admin_role')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </Card>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* Properties Section */}
          {activeSection === 'properties' && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-foreground">{t('admin.property_management')}</h2>
                <Dialog open={propertyDialogOpen} onOpenChange={setPropertyDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={handleNewProperty} data-testid="button-add-property">
                      <Plus className="w-4 h-4 mr-2" />
                      {t('admin.add_property')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingProperty ? t('admin.edit_property') : t('admin.add_new_property')}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title">{t('property_form.property_name')} *</Label>
                        <Input
                          id="title"
                          value={propertyForm.title}
                          onChange={(e) => setPropertyForm({ ...propertyForm, title: e.target.value })}
                          placeholder={t('property_form.property_name_placeholder')}
                          data-testid="input-property-title"
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">{t('property_form.description')}</Label>
                        <Textarea
                          id="description"
                          value={propertyForm.description}
                          onChange={(e) => setPropertyForm({ ...propertyForm, description: e.target.value })}
                          placeholder={t('property_form.description_placeholder')}
                          rows={3}
                          data-testid="input-property-description"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="location">{t('property_form.location')} *</Label>
                          <Input
                            id="location"
                            value={propertyForm.location}
                            onChange={(e) => setPropertyForm({ ...propertyForm, location: e.target.value })}
                            placeholder={t('property_form.location_placeholder')}
                            data-testid="input-property-location"
                          />
                        </div>
                        <div>
                          <Label htmlFor="pricePerNight">{t('property_form.price_per_night')} *</Label>
                          <Input
                            id="pricePerNight"
                            type="number"
                            value={propertyForm.pricePerNight}
                            onChange={(e) => setPropertyForm({ ...propertyForm, pricePerNight: e.target.value })}
                            placeholder="150"
                            data-testid="input-property-price"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="maxGuests">{t('property_form.max_guests')} *</Label>
                          <Input
                            id="maxGuests"
                            type="number"
                            value={propertyForm.maxGuests}
                            onChange={(e) => setPropertyForm({ ...propertyForm, maxGuests: e.target.value })}
                            placeholder="4"
                            data-testid="input-property-guests"
                          />
                        </div>
                        <div>
                          <Label htmlFor="bedrooms">{t('property_form.bedrooms')} *</Label>
                          <Input
                            id="bedrooms"
                            type="number"
                            value={propertyForm.bedrooms}
                            onChange={(e) => setPropertyForm({ ...propertyForm, bedrooms: e.target.value })}
                            placeholder="2"
                            data-testid="input-property-bedrooms"
                          />
                        </div>
                        <div>
                          <Label htmlFor="bathrooms">{t('property_form.bathrooms')} *</Label>
                          <Input
                            id="bathrooms"
                            type="number"
                            value={propertyForm.bathrooms}
                            onChange={(e) => setPropertyForm({ ...propertyForm, bathrooms: e.target.value })}
                            placeholder="2"
                            data-testid="input-property-bathrooms"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="amenities">{t('property_form.amenities')}</Label>
                        <Input
                          id="amenities"
                          value={propertyForm.amenities}
                          onChange={(e) => setPropertyForm({ ...propertyForm, amenities: e.target.value })}
                          placeholder={t('property_form.amenities_placeholder')}
                          data-testid="input-property-amenities"
                        />
                      </div>
                      <div>
                        <Label htmlFor="images">{t('property_form.images')}</Label>
                        <Textarea
                          id="images"
                          value={propertyForm.images}
                          onChange={(e) => setPropertyForm({ ...propertyForm, images: e.target.value })}
                          placeholder={t('property_form.images_placeholder')}
                          rows={2}
                          data-testid="input-property-images"
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setPropertyDialogOpen(false);
                            setEditingProperty(null);
                            resetPropertyForm();
                          }}
                          data-testid="button-cancel-property"
                        >
                          {t('common.cancel')}
                        </Button>
                        <Button
                          onClick={() => savePropertyMutation.mutate(propertyForm)}
                          disabled={savePropertyMutation.isPending || !propertyForm.title || !propertyForm.location || !propertyForm.pricePerNight}
                          data-testid="button-save-property"
                        >
                          {savePropertyMutation.isPending ? t('common.saving') : (editingProperty ? t('common.update') : t('common.create'))}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {propertiesLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-64 bg-muted rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : properties && properties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {properties.map((property: any) => (
                    <Card key={property.id} className="overflow-hidden" data-testid={`property-card-${property.id}`}>
                      <div className="h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        {property.images && property.images[0] ? (
                          <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover" />
                        ) : (
                          <Building className="w-16 h-16 text-muted-foreground" />
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-lg text-foreground mb-1">{property.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{property.location}</p>
                        <p className="text-xl font-bold text-primary mb-3">${property.pricePerNight}/night</p>
                        <div className="text-sm text-muted-foreground mb-4">
                          {property.maxGuests} guests · {property.bedrooms} bed · {property.bathrooms} bath
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditProperty(property)}
                            data-testid={`button-edit-${property.id}`}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            {t('common.edit')}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              if (confirm(t('admin.confirm_delete_property'))) {
                                deletePropertyMutation.mutate(property.id);
                              }
                            }}
                            disabled={deletePropertyMutation.isPending}
                            data-testid={`button-delete-${property.id}`}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            {t('common.delete')}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-12 text-center">
                  <Building className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">{t('admin.no_properties')}</h3>
                  <p className="text-muted-foreground mb-4">{t('admin.add_first_property')}</p>
                  <Button onClick={handleNewProperty} data-testid="button-add-first-property">
                    <Plus className="w-4 h-4 mr-2" />
                    {t('admin.add_property')}
                  </Button>
                </Card>
              )}
            </div>
          )}

          {/* Service Providers Section */}
          {activeSection === 'providers' && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-foreground">{t('admin.provider_management')}</h2>
              </div>

              <Tabs defaultValue="all" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="all">{t('admin.all_providers')}</TabsTrigger>
                  <TabsTrigger value="pending">
                    {t('admin.pending_applications')}
                    {serviceProviders?.filter((p: any) => p.approvalStatus === 'pending').length > 0 && (
                      <Badge variant="destructive" className="ml-2">
                        {serviceProviders.filter((p: any) => p.approvalStatus === 'pending').length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="rejected">{t('dashboard.rejected')}</TabsTrigger>
                </TabsList>

                {/* All Providers Tab */}
                <TabsContent value="all" className="space-y-4">
                  <div className="flex justify-end mb-4">
                    <Button onClick={handleNewProvider} data-testid="button-add-provider">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Provider
                    </Button>
                  </div>
                
                <Dialog open={serviceProviderDialogOpen} onOpenChange={setServiceProviderDialogOpen}>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingProvider ? 'Edit Service Provider' : 'Create Service Provider'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="userId">User ID *</Label>
                        <Input
                          id="userId"
                          value={providerForm.userId}
                          onChange={(e) => setProviderForm({ ...providerForm, userId: e.target.value })}
                          placeholder="user-id-123"
                          data-testid="input-provider-userid"
                        />
                        <p className="text-xs text-muted-foreground mt-1">User must have service_provider role</p>
                      </div>
                      <div>
                        <Label htmlFor="categoryId">Service Category *</Label>
                        <Select
                          value={providerForm.categoryId}
                          onValueChange={(value) => setProviderForm({ ...providerForm, categoryId: value })}
                        >
                          <SelectTrigger data-testid="select-provider-category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {serviceCategories?.map((category: any) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="businessName">Business Name *</Label>
                        <Input
                          id="businessName"
                          value={providerForm.businessName}
                          onChange={(e) => setProviderForm({ ...providerForm, businessName: e.target.value })}
                          placeholder="e.g., Professional Cleaning Services"
                          data-testid="input-provider-name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={providerForm.description}
                          onChange={(e) => setProviderForm({ ...providerForm, description: e.target.value })}
                          placeholder="Describe the services offered..."
                          rows={3}
                          data-testid="input-provider-description"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                          <Input
                            id="hourlyRate"
                            type="number"
                            step="0.01"
                            value={providerForm.hourlyRate}
                            onChange={(e) => setProviderForm({ ...providerForm, hourlyRate: e.target.value })}
                            placeholder="25.00"
                            data-testid="input-provider-hourly"
                          />
                        </div>
                        <div>
                          <Label htmlFor="fixedRate">Fixed Rate ($)</Label>
                          <Input
                            id="fixedRate"
                            type="number"
                            step="0.01"
                            value={providerForm.fixedRate}
                            onChange={(e) => setProviderForm({ ...providerForm, fixedRate: e.target.value })}
                            placeholder="150.00"
                            data-testid="input-provider-fixed"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            value={providerForm.location}
                            onChange={(e) => setProviderForm({ ...providerForm, location: e.target.value })}
                            placeholder="City, State"
                            data-testid="input-provider-location"
                          />
                        </div>
                        <div>
                          <Label htmlFor="radius">Service Radius (km)</Label>
                          <Input
                            id="radius"
                            type="number"
                            value={providerForm.radius}
                            onChange={(e) => setProviderForm({ ...providerForm, radius: e.target.value })}
                            data-testid="input-provider-radius"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="certifications">Certifications (comma separated)</Label>
                        <Input
                          id="certifications"
                          value={providerForm.certifications}
                          onChange={(e) => setProviderForm({ ...providerForm, certifications: e.target.value })}
                          placeholder="License 1, Certification 2"
                          data-testid="input-provider-certs"
                        />
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="isVerified"
                            checked={providerForm.isVerified}
                            onChange={(e) => setProviderForm({ ...providerForm, isVerified: e.target.checked })}
                            className="rounded"
                            data-testid="checkbox-provider-verified"
                          />
                          <Label htmlFor="isVerified">Verified</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="isActive"
                            checked={providerForm.isActive}
                            onChange={(e) => setProviderForm({ ...providerForm, isActive: e.target.checked })}
                            className="rounded"
                            data-testid="checkbox-provider-active"
                          />
                          <Label htmlFor="isActive">Active</Label>
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setServiceProviderDialogOpen(false);
                            setEditingProvider(null);
                            resetProviderForm();
                          }}
                          data-testid="button-cancel-provider"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => {
                            const certArray = providerForm.certifications
                              ? providerForm.certifications.split(',').map(c => c.trim()).filter(Boolean)
                              : [];
                            
                            saveProviderMutation.mutate({
                              userId: providerForm.userId,
                              categoryId: providerForm.categoryId,
                              businessName: providerForm.businessName,
                              description: providerForm.description || null,
                              hourlyRate: providerForm.hourlyRate ? parseFloat(providerForm.hourlyRate) : null,
                              fixedRate: providerForm.fixedRate ? parseFloat(providerForm.fixedRate) : null,
                              location: providerForm.location || null,
                              radius: parseInt(providerForm.radius) || 50,
                              certifications: certArray,
                              isVerified: providerForm.isVerified,
                              isActive: providerForm.isActive,
                            });
                          }}
                          disabled={saveProviderMutation.isPending || !providerForm.userId || !providerForm.categoryId || !providerForm.businessName}
                          data-testid="button-save-provider"
                        >
                          {saveProviderMutation.isPending ? 'Saving...' : (editingProvider ? 'Update' : 'Create')}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

              {providersLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-64 bg-muted rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : serviceProviders && serviceProviders.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {serviceProviders.map((provider: any) => {
                    const category = serviceCategories?.find((c: any) => c.id === provider.categoryId);
                    return (
                      <Card key={provider.id} className="overflow-hidden" data-testid={`provider-card-${provider.id}`}>
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="font-semibold text-lg text-foreground">{provider.businessName}</h3>
                            <div className="flex gap-1">
                              {provider.isVerified && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 text-xs rounded">
                                  Verified
                                </span>
                              )}
                              {provider.isActive && (
                                <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 text-xs rounded">
                                  Active
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{category?.name || 'Uncategorized'}</p>
                          {provider.description && (
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{provider.description}</p>
                          )}
                          <div className="space-y-2 text-sm mb-4">
                            {provider.location && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <MapPin className="w-4 h-4" />
                                <span>{provider.location}</span>
                              </div>
                            )}
                            <div className="flex gap-4">
                              {provider.hourlyRate && (
                                <div>
                                  <span className="text-muted-foreground">Hourly: </span>
                                  <span className="font-semibold text-foreground">${provider.hourlyRate}/hr</span>
                                </div>
                              )}
                              {provider.fixedRate && (
                                <div>
                                  <span className="text-muted-foreground">Fixed: </span>
                                  <span className="font-semibold text-foreground">${provider.fixedRate}</span>
                                </div>
                              )}
                            </div>
                            {provider.rating && parseFloat(provider.rating) > 0 && (
                              <div>
                                <span className="text-yellow-500">★</span>
                                <span className="ml-1 font-semibold">{parseFloat(provider.rating).toFixed(1)}</span>
                                <span className="text-muted-foreground ml-1">({provider.reviewCount} reviews)</span>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditProvider(provider)}
                              data-testid={`button-edit-provider-${provider.id}`}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this service provider?')) {
                                  deleteProviderMutation.mutate(provider.id);
                                }
                              }}
                              disabled={deleteProviderMutation.isPending}
                              data-testid={`button-delete-provider-${provider.id}`}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card className="p-12 text-center">
                  <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Service Providers Yet</h3>
                  <p className="text-muted-foreground mb-4">Get started by adding your first service provider</p>
                  <Button onClick={handleNewProvider} data-testid="button-add-first-provider">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Provider
                  </Button>
                </Card>
              )}
                </TabsContent>

                {/* Pending Applications Tab */}
                <TabsContent value="pending" className="space-y-4">
                  <p className="text-muted-foreground">Pending provider applications will appear here for admin review.</p>
                </TabsContent>

                {/* Rejected Tab */}
                <TabsContent value="rejected" className="space-y-4">
                  <p className="text-muted-foreground">Rejected provider applications will appear here.</p>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* Services Section - Categories & Tasks */}
          {activeSection === 'services' && (
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-8">{t('admin.services_management')}</h2>
              
              <Tabs defaultValue="categories" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="categories">{t('admin.service_categories')}</TabsTrigger>
                  <TabsTrigger value="tasks">{t('admin.service_tasks')}</TabsTrigger>
                </TabsList>

                {/* Service Categories Tab */}
                <TabsContent value="categories" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold">Service Categories</h3>
                    <Button size="sm" data-testid="button-add-category">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Category
                    </Button>
                  </div>

                  {serviceCategories && serviceCategories.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {serviceCategories.map((category: any) => (
                        <Card key={category.id} className="p-4" data-testid={`category-card-${category.id}`}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-foreground mb-1">{category.name}</h4>
                              {category.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2">{category.description}</p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              data-testid={`button-edit-category-${category.id}`}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card className="p-8 text-center">
                      <p className="text-muted-foreground">No service categories found</p>
                    </Card>
                  )}
                </TabsContent>

                {/* Service Tasks Tab */}
                <TabsContent value="tasks" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold">Service Tasks</h3>
                    <Button size="sm" data-testid="button-add-task">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Task
                    </Button>
                  </div>

                  <div className="flex gap-4 mb-4">
                    <Select defaultValue="all">
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Filter by category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('admin.all_categories')}</SelectItem>
                        {serviceCategories?.map((category: any) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Card className="p-8 text-center">
                    <p className="text-muted-foreground">Service tasks management coming soon</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      This will display all 36+ predefined maid service tasks and other service-specific tasks
                    </p>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* Bookings Section */}
          {activeSection === 'bookings' && (
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-8">{t('admin.booking_management')}</h2>
              
              {bookingsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 bg-muted rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : bookings && bookings.length > 0 ? (
                <div className="space-y-4">
                  {bookings.map((booking: any) => (
                    <Card key={booking.id} className="p-6" data-testid={`booking-card-${booking.id}`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg text-foreground" data-testid={`booking-code-${booking.id}`}>
                              Booking: {booking.bookingCode}
                            </h3>
                            <Select
                              value={booking.status}
                              onValueChange={(value) => updateBookingStatusMutation.mutate({ 
                                bookingId: booking.id, 
                                status: value 
                              })}
                              disabled={updateBookingStatusMutation.isPending}
                            >
                              <SelectTrigger className="w-[140px] h-7" data-testid={`select-status-${booking.id}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">{t('dashboard.pending')}</SelectItem>
                                <SelectItem value="confirmed">{t('dashboard.confirmed')}</SelectItem>
                                <SelectItem value="completed">{t('dashboard.completed')}</SelectItem>
                                <SelectItem value="cancelled">{t('dashboard.cancelled')}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                            <div>
                              <span className="font-medium">Property ID:</span>
                              <p className="text-foreground">{booking.propertyId?.substring(0, 8)}...</p>
                            </div>
                            <div>
                              <span className="font-medium">Client ID:</span>
                              <p className="text-foreground">{booking.clientId?.substring(0, 8)}...</p>
                            </div>
                            <div>
                              <span className="font-medium">Guests:</span>
                              <p className="text-foreground">{booking.guests}</p>
                            </div>
                            <div>
                              <span className="font-medium">Total:</span>
                              <p className="text-foreground font-semibold">${booking.totalAmount}</p>
                            </div>
                          </div>
                          
                          <div className="mt-3 flex gap-6 text-sm text-muted-foreground">
                            <div>
                              <span className="font-medium">Check-in:</span>
                              <span className="ml-2 text-foreground">
                                {new Date(booking.checkIn).toLocaleDateString()}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium">Check-out:</span>
                              <span className="ml-2 text-foreground">
                                {new Date(booking.checkOut).toLocaleDateString()}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium">Payment:</span>
                              <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
                                booking.paymentStatus === 'paid'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                              }`}>
                                {booking.paymentStatus}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedBookingId(booking.id);
                              setBookingDetailsDialogOpen(true);
                            }}
                            data-testid={`button-view-details-${booking.id}`}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-12 text-center">
                  <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Bookings Yet</h3>
                  <p className="text-muted-foreground">Bookings will appear here once clients start making reservations</p>
                </Card>
              )}

              {/* Booking Details Modal */}
              <Dialog open={bookingDetailsDialogOpen} onOpenChange={setBookingDetailsDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Booking Details</DialogTitle>
                  </DialogHeader>
                  
                  {bookingDetailsLoading ? (
                    <div className="space-y-4">
                      <div className="h-48 bg-muted rounded-lg animate-pulse"></div>
                      <div className="h-24 bg-muted rounded-lg animate-pulse"></div>
                      <div className="h-24 bg-muted rounded-lg animate-pulse"></div>
                    </div>
                  ) : bookingDetails ? (
                    <div className="space-y-6">
                      {/* Property Information */}
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-3">Property Information</h3>
                        <Card className="p-4">
                          {bookingDetails.property?.images && bookingDetails.property.images.length > 0 && (
                            <div className="mb-4">
                              <img 
                                src={bookingDetails.property.images[0]} 
                                alt={bookingDetails.property.title}
                                className="w-full h-48 object-cover rounded-lg"
                              />
                            </div>
                          )}
                          <h4 className="font-semibold text-foreground mb-2">{bookingDetails.property?.title}</h4>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <MapPin className="w-4 h-4" />
                              <span>{bookingDetails.property?.location}</span>
                            </div>
                            <div className="text-muted-foreground">
                              <span className="font-medium">Price:</span> ${bookingDetails.property?.pricePerNight}/night
                            </div>
                            <div className="text-muted-foreground">
                              <span className="font-medium">Max Guests:</span> {bookingDetails.property?.maxGuests}
                            </div>
                            <div className="text-muted-foreground">
                              <span className="font-medium">Bedrooms:</span> {bookingDetails.property?.bedrooms}
                            </div>
                          </div>
                        </Card>
                      </div>

                      {/* Client Information */}
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-3">Client Information</h3>
                        <Card className="p-4">
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <User className="w-4 h-4" />
                              <span className="text-foreground font-medium">
                                {bookingDetails.client?.firstName} {bookingDetails.client?.lastName}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Mail className="w-4 h-4" />
                              <span>{bookingDetails.client?.email}</span>
                            </div>
                            {bookingDetails.client?.phoneNumber && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Phone className="w-4 h-4" />
                                <span>{bookingDetails.client.phoneNumber}</span>
                              </div>
                            )}
                          </div>
                        </Card>
                      </div>

                      {/* Booking Information */}
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-3">Booking Information</h3>
                        <Card className="p-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-muted-foreground">Booking Code:</span>
                              <p className="text-foreground font-mono">{bookingDetails.bookingCode}</p>
                            </div>
                            <div>
                              <span className="font-medium text-muted-foreground">Status:</span>
                              <p className="text-foreground">
                                <span className={`inline-block px-2 py-1 rounded text-xs ${
                                  bookingDetails.status === 'confirmed' 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                                    : bookingDetails.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100'
                                }`}>
                                  {bookingDetails.status}
                                </span>
                              </p>
                            </div>
                            <div>
                              <span className="font-medium text-muted-foreground">Check-in:</span>
                              <p className="text-foreground">{new Date(bookingDetails.checkIn).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <span className="font-medium text-muted-foreground">Check-out:</span>
                              <p className="text-foreground">{new Date(bookingDetails.checkOut).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <span className="font-medium text-muted-foreground">Guests:</span>
                              <p className="text-foreground">{bookingDetails.guests}</p>
                            </div>
                            <div>
                              <span className="font-medium text-muted-foreground">Payment Status:</span>
                              <p className="text-foreground">
                                <span className={`inline-block px-2 py-1 rounded text-xs ${
                                  bookingDetails.paymentStatus === 'paid'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                                }`}>
                                  {bookingDetails.paymentStatus}
                                </span>
                              </p>
                            </div>
                          </div>
                          
                          <div className="mt-4 pt-4 border-t border-border">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <span className="font-medium text-muted-foreground">Property Total:</span>
                                <p className="text-foreground">${bookingDetails.propertyTotal}</p>
                              </div>
                              <div>
                                <span className="font-medium text-muted-foreground">Services Total:</span>
                                <p className="text-foreground">${bookingDetails.servicesTotal}</p>
                              </div>
                              <div>
                                <span className="font-medium text-muted-foreground">Discount:</span>
                                <p className="text-foreground">-${bookingDetails.discountAmount}</p>
                              </div>
                              <div>
                                <span className="font-medium text-muted-foreground">Total Amount:</span>
                                <p className="text-foreground font-semibold text-lg">${bookingDetails.totalAmount}</p>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </div>

                      {/* Service Bookings */}
                      {bookingDetails.serviceBookings && bookingDetails.serviceBookings.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-foreground mb-3">Service Bookings</h3>
                          <div className="space-y-2">
                            {bookingDetails.serviceBookings.map((service: any) => (
                              <Card key={service.id} className="p-3">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="font-medium text-foreground">{service.serviceName}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {new Date(service.serviceDate).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm text-muted-foreground">Price: ${service.price}</p>
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No booking details available</p>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          )}

          {/* Service Orders Section */}
          {activeSection === 'service-orders' && (
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-8">{t('admin.order_management')}</h2>
              
              {serviceOrdersLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 bg-muted rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : serviceOrders && serviceOrders.length > 0 ? (
                <div className="space-y-4">
                  {serviceOrders.map((order: any) => (
                    <Card key={order.id} className="p-6" data-testid={`service-order-card-${order.id}`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg text-foreground" data-testid={`order-code-${order.id}`}>
                              Order: {order.orderCode}
                            </h3>
                            <Select
                              value={order.status}
                              onValueChange={(value) => updateServiceOrderStatusMutation.mutate({ 
                                orderId: order.id, 
                                status: value 
                              })}
                              disabled={updateServiceOrderStatusMutation.isPending}
                            >
                              <SelectTrigger className="w-[140px] h-7" data-testid={`select-status-${order.id}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">{t('dashboard.pending')}</SelectItem>
                                <SelectItem value="confirmed">{t('dashboard.confirmed')}</SelectItem>
                                <SelectItem value="in_progress">{t('dashboard.in_progress')}</SelectItem>
                                <SelectItem value="completed">{t('dashboard.completed')}</SelectItem>
                                <SelectItem value="cancelled">{t('dashboard.cancelled')}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                            <div>
                              <span className="font-medium">Provider ID:</span>
                              <p className="text-foreground">{order.serviceProviderId?.substring(0, 8)}...</p>
                            </div>
                            <div>
                              <span className="font-medium">Client ID:</span>
                              <p className="text-foreground">{order.clientId?.substring(0, 8)}...</p>
                            </div>
                            <div>
                              <span className="font-medium">Service Date:</span>
                              <p className="text-foreground">
                                {new Date(order.serviceDate).toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium">Total:</span>
                              <p className="text-foreground font-semibold">${order.totalAmount}</p>
                            </div>
                          </div>
                          
                          <div className="mt-3 flex gap-6 text-sm text-muted-foreground">
                            <div>
                              <span className="font-medium">Time:</span>
                              <span className="ml-2 text-foreground">
                                {order.startTime}{order.endTime && ` - ${order.endTime}`}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium">Payment:</span>
                              <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
                                order.paymentStatus === 'paid'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                                  : order.paymentStatus === 'refunded'
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                              }`}>
                                {order.paymentStatus}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium">Created:</span>
                              <span className="ml-2 text-foreground">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          {order.specialInstructions && (
                            <div className="mt-3 text-sm">
                              <span className="font-medium text-muted-foreground">Special Instructions:</span>
                              <p className="text-foreground mt-1">{order.specialInstructions}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-12 text-center">
                  <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Service Orders Yet</h3>
                  <p className="text-muted-foreground">Service orders will appear here once clients start booking services</p>
                </Card>
              )}
            </div>
          )}

          {/* Settings Section */}
          {activeSection === 'settings' && (
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-8">{t('admin.settings_management')}</h2>
              
              <Tabs defaultValue="platform" className="space-y-6">
                <TabsList className="grid w-full grid-cols-7 lg:w-auto lg:inline-grid">
                  <TabsTrigger value="platform" data-testid="tab-platform-settings">{t('admin.platform_settings')}</TabsTrigger>
                  <TabsTrigger value="associations" data-testid="tab-associations">{t('admin.property_service_assoc')}</TabsTrigger>
                  <TabsTrigger value="promocodes" data-testid="tab-promocodes">{t('admin.promo_codes')}</TabsTrigger>
                  <TabsTrigger value="cancellations" data-testid="tab-cancellations">{t('admin.cancellations')}</TabsTrigger>
                  <TabsTrigger value="territories" data-testid="tab-territories">{t('admin.territories')}</TabsTrigger>
                  <TabsTrigger value="emails" data-testid="tab-emails">{t('admin.email_templates')}</TabsTrigger>
                  <TabsTrigger value="logs" data-testid="tab-logs">{t('admin.activity_logs')}</TabsTrigger>
                </TabsList>

                <TabsContent value="platform" className="space-y-4">
                  <PlatformSettings />
                </TabsContent>

                <TabsContent value="associations" className="space-y-4">
                  <PropertyServiceAssociation />
                </TabsContent>

                <TabsContent value="promocodes" className="space-y-4">
                  <PromotionalCodes />
                </TabsContent>

                <TabsContent value="cancellations" className="space-y-4">
                  <CancellationManagement />
                </TabsContent>

                <TabsContent value="territories" className="space-y-4">
                  <TerritoryManagement />
                </TabsContent>

                <TabsContent value="emails" className="space-y-4">
                  <EmailTemplates />
                </TabsContent>

                <TabsContent value="logs" className="space-y-4">
                  <ActivityLogs />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
