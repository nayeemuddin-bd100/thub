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
  Search
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState('overview');
  const [propertyDialogOpen, setPropertyDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

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
        title: "Success",
        description: editingProperty ? "Property updated successfully" : "Property created successfully",
      });
      setPropertyDialogOpen(false);
      setEditingProperty(null);
      resetPropertyForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save property",
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
        title: "Success",
        description: "Property deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete property",
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

  const handleNewProperty = () => {
    setEditingProperty(null);
    resetPropertyForm();
    setPropertyDialogOpen(true);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-primary">Admin Panel</h1>
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
            <span>Overview</span>
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
            <span>Users</span>
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
            <span>Properties</span>
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
            <Briefcase className="w-5 h-5" />
            <span>Service Providers</span>
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
            <span>Bookings</span>
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
            <span>Settings</span>
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
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Overview Section */}
          {activeSection === 'overview' && (
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-8">Dashboard Overview</h2>
              
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
                        <p className="text-sm text-muted-foreground">Properties</p>
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
                        <p className="text-sm text-muted-foreground">Service Providers</p>
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
                        <p className="text-sm text-muted-foreground">Total Bookings</p>
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
                <h2 className="text-3xl font-bold text-foreground">User Management</h2>
              </div>

              {/* Search and Filter */}
              <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-users"
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
                    <SelectItem value="country_manager">Country Manager</SelectItem>
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
                              <SelectItem value="client">Client</SelectItem>
                              <SelectItem value="property_owner">Property Owner</SelectItem>
                              <SelectItem value="service_provider">Service Provider</SelectItem>
                              <SelectItem value="country_manager">Country Manager</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
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
                <h2 className="text-3xl font-bold text-foreground">Property Management</h2>
                <Dialog open={propertyDialogOpen} onOpenChange={setPropertyDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={handleNewProperty} data-testid="button-add-property">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Property
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingProperty ? 'Edit Property' : 'Add New Property'}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title">Title *</Label>
                        <Input
                          id="title"
                          value={propertyForm.title}
                          onChange={(e) => setPropertyForm({ ...propertyForm, title: e.target.value })}
                          placeholder="Beautiful Beach House"
                          data-testid="input-property-title"
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={propertyForm.description}
                          onChange={(e) => setPropertyForm({ ...propertyForm, description: e.target.value })}
                          placeholder="Describe your property..."
                          rows={3}
                          data-testid="input-property-description"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="location">Location *</Label>
                          <Input
                            id="location"
                            value={propertyForm.location}
                            onChange={(e) => setPropertyForm({ ...propertyForm, location: e.target.value })}
                            placeholder="Miami, FL"
                            data-testid="input-property-location"
                          />
                        </div>
                        <div>
                          <Label htmlFor="pricePerNight">Price per Night ($) *</Label>
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
                          <Label htmlFor="maxGuests">Max Guests *</Label>
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
                          <Label htmlFor="bedrooms">Bedrooms *</Label>
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
                          <Label htmlFor="bathrooms">Bathrooms *</Label>
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
                        <Label htmlFor="amenities">Amenities (comma-separated)</Label>
                        <Input
                          id="amenities"
                          value={propertyForm.amenities}
                          onChange={(e) => setPropertyForm({ ...propertyForm, amenities: e.target.value })}
                          placeholder="WiFi, Pool, Air Conditioning"
                          data-testid="input-property-amenities"
                        />
                      </div>
                      <div>
                        <Label htmlFor="images">Image URLs (comma-separated)</Label>
                        <Textarea
                          id="images"
                          value={propertyForm.images}
                          onChange={(e) => setPropertyForm({ ...propertyForm, images: e.target.value })}
                          placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
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
                          Cancel
                        </Button>
                        <Button
                          onClick={() => savePropertyMutation.mutate(propertyForm)}
                          disabled={savePropertyMutation.isPending || !propertyForm.title || !propertyForm.location || !propertyForm.pricePerNight}
                          data-testid="button-save-property"
                        >
                          {savePropertyMutation.isPending ? 'Saving...' : (editingProperty ? 'Update' : 'Create')}
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
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this property?')) {
                                deletePropertyMutation.mutate(property.id);
                              }
                            }}
                            disabled={deletePropertyMutation.isPending}
                            data-testid={`button-delete-${property.id}`}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-12 text-center">
                  <Building className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Properties Yet</h3>
                  <p className="text-muted-foreground mb-4">Get started by adding your first property</p>
                  <Button onClick={handleNewProperty} data-testid="button-add-first-property">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Property
                  </Button>
                </Card>
              )}
            </div>
          )}

          {/* Services Section */}
          {activeSection === 'services' && (
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-8">Service Provider Management</h2>
              <Card className="p-12 text-center">
                <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Coming Soon</h3>
                <p className="text-muted-foreground">Service provider management will be available here</p>
              </Card>
            </div>
          )}

          {/* Bookings Section */}
          {activeSection === 'bookings' && (
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-8">Booking Management</h2>
              <Card className="p-12 text-center">
                <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Bookings Yet</h3>
                <p className="text-muted-foreground">Bookings will appear here once clients start making reservations</p>
              </Card>
            </div>
          )}

          {/* Settings Section */}
          {activeSection === 'settings' && (
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-8">Settings</h2>
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Account Settings</h3>
                <div className="space-y-4">
                  <div>
                    <Label>Email</Label>
                    <Input value={user?.email} disabled />
                  </div>
                  <div>
                    <Label>Role</Label>
                    <Input value={user?.role} disabled />
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
