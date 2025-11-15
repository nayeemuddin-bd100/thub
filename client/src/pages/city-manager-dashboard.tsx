import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Building, Users, CheckCircle, Clock, Check, X, Home, DollarSign, TrendingUp, Package } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';

interface CityManagerStats {
  totalProperties: number;
  totalProviders: number;
  pendingApplications: number;
  totalHosts: number;
}

interface ServiceProvider {
  id: string;
  businessName: string;
  approvalStatus: string;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface ServiceOrder {
  id: string;
  status: string;
  totalAmount: string;
  platformFeeAmount: string;
  providerAmount: string;
  paymentStatus: string;
  serviceDate: string;
  createdAt: string;
  provider?: {
    businessName: string;
  };
  client?: {
    firstName: string;
    lastName: string;
  };
}

interface ServiceOrderSummary {
  totalOrders: number;
  grossVolume: number;
  platformCommission: number;
  providerPayouts: number;
  refundsCount: number;
  pendingCount: number;
  completedCount: number;
  cancelledCount: number;
}

export default function CityManagerDashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  if (!user || user.role !== 'city_manager') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Access denied. City Manager role required.</p>
            <Button onClick={() => navigate('/dashboard')} className="mt-4">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { data: stats, isLoading: loadingStats } = useQuery<CityManagerStats>({
    queryKey: ['/api/city-manager/stats'],
  });

  const { data: providers = [], isLoading: loadingProviders } = useQuery<ServiceProvider[]>({
    queryKey: ['/api/city-manager/providers'],
  });

  const { data: serviceOrdersData, isLoading: loadingServiceOrders } = useQuery<{
    orders: ServiceOrder[];
    summary: ServiceOrderSummary;
  }>({
    queryKey: ['/api/city-manager/service-orders', { include: 'summary' }],
    queryFn: async () => {
      const response = await fetch('/api/city-manager/service-orders?include=summary');
      if (!response.ok) throw new Error('Failed to fetch service orders');
      return response.json();
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (providerId: string) => {
      const response = await apiRequest('POST', `/api/city-manager/providers/${providerId}/approve`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/city-manager/providers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/city-manager/stats'] });
      toast({ title: 'Success', description: 'Provider approved successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to approve provider', variant: 'destructive' });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ providerId, reason }: { providerId: string; reason?: string }) => {
      const response = await apiRequest('POST', `/api/city-manager/providers/${providerId}/reject`, { reason });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/city-manager/providers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/city-manager/stats'] });
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
          <h1 className="text-3xl font-bold mb-2">City Manager Dashboard</h1>
          <p className="text-muted-foreground">Recruit and manage hosts and service providers in your city</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/')}>
          <Home className="w-4 h-4 mr-2" />
          Home
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingStats ? '...' : stats?.totalProperties || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Service Providers</CardTitle>
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
            <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingStats ? '...' : stats?.pendingApplications || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Hosts</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingStats ? '...' : stats?.totalHosts || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Provider Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business Name</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Applied</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingProviders ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">Loading...</TableCell>
                    </TableRow>
                  ) : providers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No provider applications found
                      </TableCell>
                    </TableRow>
                  ) : (
                    providers.map((provider) => (
                      <TableRow key={provider.id}>
                        <TableCell className="font-medium">{provider.businessName}</TableCell>
                        <TableCell>
                          {provider.user.firstName} {provider.user.lastName}
                        </TableCell>
                        <TableCell>{provider.user.email}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              provider.approvalStatus === 'approved'
                                ? 'bg-green-100 text-green-800'
                                : provider.approvalStatus === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {provider.approvalStatus}
                          </span>
                        </TableCell>
                        <TableCell>
                          {format(new Date(provider.createdAt), 'MMM d, yyyy')}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="pending" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business Name</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {providers
                    .filter((p) => p.approvalStatus === 'pending')
                    .map((provider) => (
                      <TableRow key={provider.id}>
                        <TableCell className="font-medium">{provider.businessName}</TableCell>
                        <TableCell>
                          {provider.user.firstName} {provider.user.lastName}
                        </TableCell>
                        <TableCell>{provider.user.email}</TableCell>
                        <TableCell>
                          {format(new Date(provider.createdAt), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => approveMutation.mutate(provider.id)}
                              disabled={approveMutation.isPending}
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => rejectMutation.mutate({ providerId: provider.id, reason: 'Not qualified' })}
                              disabled={rejectMutation.isPending}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="approved" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business Name</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Approved</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {providers
                    .filter((p) => p.approvalStatus === 'approved')
                    .map((provider) => (
                      <TableRow key={provider.id}>
                        <TableCell className="font-medium">{provider.businessName}</TableCell>
                        <TableCell>
                          {provider.user.firstName} {provider.user.lastName}
                        </TableCell>
                        <TableCell>{provider.user.email}</TableCell>
                        <TableCell>
                          {format(new Date(provider.createdAt), 'MMM d, yyyy')}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="rejected" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business Name</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rejected</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {providers
                    .filter((p) => p.approvalStatus === 'rejected')
                    .map((provider) => (
                      <TableRow key={provider.id}>
                        <TableCell className="font-medium">{provider.businessName}</TableCell>
                        <TableCell>
                          {provider.user.firstName} {provider.user.lastName}
                        </TableCell>
                        <TableCell>{provider.user.email}</TableCell>
                        <TableCell>
                          {format(new Date(provider.createdAt), 'MMM d, yyyy')}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 mt-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Service Orders</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingServiceOrders ? '...' : serviceOrdersData?.summary?.totalOrders || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Gross Volume</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${loadingServiceOrders ? '...' : Number(serviceOrdersData?.summary?.grossVolume ?? 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Platform Commission</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${loadingServiceOrders ? '...' : Number(serviceOrdersData?.summary?.platformCommission ?? 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Provider Payouts</CardTitle>
            <DollarSign className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${loadingServiceOrders ? '...' : Number(serviceOrdersData?.summary?.providerPayouts ?? 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingServiceOrders ? '...' : serviceOrdersData?.summary?.pendingCount || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingServiceOrders ? '...' : serviceOrdersData?.summary?.completedCount || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cancelled Orders</CardTitle>
            <X className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingServiceOrders ? '...' : serviceOrdersData?.summary?.cancelledCount || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Refunds Issued</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingServiceOrders ? '...' : serviceOrdersData?.summary?.refundsCount || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service Bookings in City</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Service Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingServiceOrders ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">Loading...</TableCell>
                    </TableRow>
                  ) : (serviceOrdersData?.orders || []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No service orders found
                      </TableCell>
                    </TableRow>
                  ) : (
                    (serviceOrdersData?.orders || []).slice(0, 10).map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          {order.client ? `${order.client.firstName} ${order.client.lastName}` : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {order.provider?.businessName || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {format(new Date(order.serviceDate), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>${parseFloat(order.totalAmount).toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              order.status === 'completed' ? 'default' :
                              order.status === 'cancelled' ? 'destructive' :
                              'secondary'
                            }
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              order.paymentStatus === 'paid' ? 'default' :
                              order.paymentStatus === 'refunded' ? 'destructive' :
                              'secondary'
                            }
                          >
                            {order.paymentStatus}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="pending" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Service Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(serviceOrdersData?.orders || [])
                    .filter((o) => o.status === 'pending' || o.status === 'pending_payment' || o.status === 'pending_acceptance')
                    .slice(0, 10)
                    .map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          {order.client ? `${order.client.firstName} ${order.client.lastName}` : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {order.provider?.businessName || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {format(new Date(order.serviceDate), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>${parseFloat(order.totalAmount).toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{order.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="completed" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Service Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Commission</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(serviceOrdersData?.orders || [])
                    .filter((o) => o.status === 'completed')
                    .slice(0, 10)
                    .map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          {order.client ? `${order.client.firstName} ${order.client.lastName}` : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {order.provider?.businessName || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {format(new Date(order.serviceDate), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>${parseFloat(order.totalAmount).toFixed(2)}</TableCell>
                        <TableCell className="text-green-600">
                          ${parseFloat(order.platformFeeAmount).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="cancelled" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Service Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(serviceOrdersData?.orders || [])
                    .filter((o) => o.status === 'cancelled')
                    .slice(0, 10)
                    .map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          {order.client ? `${order.client.firstName} ${order.client.lastName}` : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {order.provider?.businessName || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {format(new Date(order.serviceDate), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>${parseFloat(order.totalAmount).toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={order.paymentStatus === 'refunded' ? 'destructive' : 'secondary'}>
                            {order.paymentStatus}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
