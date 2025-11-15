import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Briefcase, CheckCircle, Clock, TrendingUp, Check, X, Home } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';

interface CountryManagerStats {
  totalProviders: number;
  totalBookings: number;
  pendingAssignments: number;
  completedAssignments: number;
}

interface ServiceProvider {
  id: string;
  businessName: string;
  approvalStatus: string;
  rating: number | null;
  availability: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface ServiceBooking {
  id: string;
  status: string;
  createdAt: string;
  scheduledDate: string;
  totalAmount: string;
  client: {
    firstName: string;
    lastName: string;
  };
}

export default function CountryManagerDashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  if (!user || user.role !== 'country_manager') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Access denied. Country Manager role required.</p>
            <Button onClick={() => navigate('/dashboard')} className="mt-4">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { data: stats, isLoading: loadingStats } = useQuery<CountryManagerStats>({
    queryKey: ['/api/country-manager/stats'],
  });

  const { data: providers = [], isLoading: loadingProviders } = useQuery<ServiceProvider[]>({
    queryKey: ['/api/country-manager/providers'],
  });

  const { data: bookings = [], isLoading: loadingBookings } = useQuery<ServiceBooking[]>({
    queryKey: ['/api/country-manager/bookings'],
  });

  const approveMutation = useMutation({
    mutationFn: async (providerId: string) => {
      const response = await apiRequest('POST', `/api/country-manager/providers/${providerId}/approve`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/country-manager/providers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/country-manager/stats'] });
      toast({ title: 'Success', description: 'Provider approved successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to approve provider', variant: 'destructive' });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ providerId, reason }: { providerId: string; reason?: string }) => {
      const response = await apiRequest('POST', `/api/country-manager/providers/${providerId}/reject`, { reason });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/country-manager/providers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/country-manager/stats'] });
      toast({ title: 'Success', description: 'Provider rejected' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to reject provider', variant: 'destructive' });
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Country Manager Dashboard</h1>
          <p className="text-muted-foreground">Manage regional operations, assign jobs, and monitor provider performance</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/')}>
          <Home className="w-4 h-4 mr-2" />
          Home
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Providers</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingStats ? '...' : stats?.totalProviders || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Briefcase className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingStats ? '...' : stats?.totalBookings || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Assignments</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingStats ? '...' : stats?.pendingAssignments || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed Assignments</CardTitle>
            <CheckCircle className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingStats ? '...' : stats?.completedAssignments || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Service Providers in Region</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loadingProviders ? (
                <p className="text-center text-muted-foreground">Loading providers...</p>
              ) : providers.length === 0 ? (
                <p className="text-center text-muted-foreground">No service providers found</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Business Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {providers.slice(0, 10).map((provider) => (
                      <TableRow key={provider.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{provider.businessName}</p>
                            <p className="text-sm text-muted-foreground">
                              {provider.user.firstName} {provider.user.lastName}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={provider.approvalStatus === 'approved' ? 'default' : 'secondary'}
                          >
                            {provider.approvalStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {provider.rating ? `⭐ ${parseFloat(provider.rating.toString()).toFixed(1)}` : 'No rating'}
                        </TableCell>
                        <TableCell>
                          {provider.approvalStatus === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => approveMutation.mutate(provider.id)}
                                disabled={approveMutation.isPending}
                              >
                                <Check className="w-3 h-3 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => rejectMutation.mutate({ providerId: provider.id, reason: 'Not qualified' })}
                                disabled={rejectMutation.isPending}
                              >
                                <X className="w-3 h-3 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Job Assignment Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pending">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="assigned">Assigned</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="mt-4">
                <div className="space-y-4">
                  {loadingBookings ? (
                    <p className="text-center text-muted-foreground">Loading bookings...</p>
                  ) : bookings.filter(b => b.status === 'pending').length === 0 ? (
                    <p className="text-center text-muted-foreground">No pending assignments</p>
                  ) : (
                    bookings
                      .filter(b => b.status === 'pending')
                      .slice(0, 5)
                      .map((booking) => (
                        <div key={booking.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium">
                              {booking.client.firstName} {booking.client.lastName}
                            </p>
                            <Badge variant="outline">{booking.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Scheduled: {format(new Date(booking.scheduledDate), 'PPp')}
                          </p>
                          <Button size="sm" className="w-full">
                            Assign Provider
                          </Button>
                        </div>
                      ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="assigned" className="mt-4">
                <div className="space-y-4">
                  {bookings.filter(b => b.status === 'confirmed').length === 0 ? (
                    <p className="text-center text-muted-foreground">No assigned jobs</p>
                  ) : (
                    bookings
                      .filter(b => b.status === 'confirmed')
                      .slice(0, 5)
                      .map((booking) => (
                        <div key={booking.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium">
                              {booking.client.firstName} {booking.client.lastName}
                            </p>
                            <Badge>{booking.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Scheduled: {format(new Date(booking.scheduledDate), 'PPp')}
                          </p>
                        </div>
                      ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="completed" className="mt-4">
                <div className="space-y-4">
                  {bookings.filter(b => b.status === 'completed').length === 0 ? (
                    <p className="text-center text-muted-foreground">No completed jobs</p>
                  ) : (
                    bookings
                      .filter(b => b.status === 'completed')
                      .slice(0, 5)
                      .map((booking) => (
                        <div key={booking.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium">
                              {booking.client.firstName} {booking.client.lastName}
                            </p>
                            <Badge variant="secondary">{booking.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Completed: {format(new Date(booking.createdAt), 'PPp')}
                          </p>
                        </div>
                      ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Regional Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 border rounded-lg">
              <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats?.completedAssignments || 0}</p>
              <p className="text-sm text-muted-foreground">Jobs Completed</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats?.totalProviders || 0}</p>
              <p className="text-sm text-muted-foreground">Active Providers</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Clock className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats?.pendingAssignments || 0}</p>
              <p className="text-sm text-muted-foreground">Awaiting Assignment</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
