import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Briefcase, CheckCircle, Clock, TrendingUp, Check, X, Home, DollarSign, Package, RefreshCw, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import AssignJobDialog from '@/components/AssignJobDialog';

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

export default function CountryManagerDashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<ServiceBooking | null>(null);
  const [reassignDialogOpen, setReassignDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

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

  const { data: jobAssignments = [], isLoading: loadingJobAssignments } = useQuery<any[]>({
    queryKey: ['/api/country-manager/job-assignments'],
  });

  const { data: serviceOrdersData, isLoading: loadingServiceOrders } = useQuery<{
    orders: ServiceOrder[];
    summary: ServiceOrderSummary;
  }>({
    queryKey: ['/api/country-manager/service-orders', { include: 'summary' }],
    queryFn: async () => {
      const response = await fetch('/api/country-manager/service-orders?include=summary');
      if (!response.ok) throw new Error('Failed to fetch service orders');
      return response.json();
    },
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

  const cancelAssignmentMutation = useMutation({
    mutationFn: async (assignmentId: string) => {
      const response = await apiRequest('POST', `/api/country-manager/job-assignments/${assignmentId}/cancel`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/country-manager/job-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/country-manager/stats'] });
      toast({ title: 'Success', description: 'Job assignment cancelled successfully' });
      setCancelDialogOpen(false);
      setSelectedAssignment(null);
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to cancel job assignment', variant: 'destructive' });
    },
  });

  const reassignMutation = useMutation({
    mutationFn: async ({ assignmentId, serviceProviderId }: { assignmentId: string; serviceProviderId: string }) => {
      const response = await apiRequest('POST', `/api/country-manager/job-assignments/${assignmentId}/reassign`, { serviceProviderId });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/country-manager/job-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/country-manager/stats'] });
      toast({ title: 'Success', description: 'Job reassigned successfully' });
      setReassignDialogOpen(false);
      setSelectedAssignment(null);
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to reassign job', variant: 'destructive' });
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
                  {loadingJobAssignments ? (
                    <p className="text-center text-muted-foreground">Loading job assignments...</p>
                  ) : jobAssignments.filter((a: any) => a.status === 'pending').length === 0 ? (
                    <p className="text-center text-muted-foreground">No pending assignments</p>
                  ) : (
                    jobAssignments
                      .filter((a: any) => a.status === 'pending')
                      .slice(0, 10)
                      .map((assignment: any) => (
                        <div key={assignment.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium">
                              {assignment.client ? `${assignment.client.firstName} ${assignment.client.lastName}` : 'Client'}
                            </p>
                            <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                              {assignment.status}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium mb-1">
                            Service: {assignment.serviceBooking?.serviceName || 'N/A'}
                          </p>
                          <p className="text-sm text-muted-foreground mb-1">
                            Provider: {assignment.provider?.businessName || 'N/A'}
                          </p>
                          <p className="text-sm text-muted-foreground mb-2">
                            Service Date: {assignment.serviceBooking?.serviceDate ? format(new Date(assignment.serviceBooking.serviceDate), 'PPp') : 'N/A'}
                          </p>
                          <p className="text-sm font-medium text-green-600 mb-3">
                            ${parseFloat(assignment.serviceBooking?.total || '0').toFixed(2)}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              onClick={() => {
                                setSelectedAssignment(assignment);
                                setReassignDialogOpen(true);
                              }}
                            >
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Reassign
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="flex-1"
                              onClick={() => {
                                setSelectedAssignment(assignment);
                                setCancelDialogOpen(true);
                              }}
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="assigned" className="mt-4">
                <div className="space-y-4">
                  {loadingJobAssignments ? (
                    <p className="text-center text-muted-foreground">Loading job assignments...</p>
                  ) : jobAssignments.filter((a: any) => a.status === 'accepted').length === 0 ? (
                    <p className="text-center text-muted-foreground">No assigned jobs</p>
                  ) : (
                    jobAssignments
                      .filter((a: any) => a.status === 'accepted')
                      .slice(0, 10)
                      .map((assignment: any) => (
                        <div key={assignment.id} className="border rounded-lg p-4 bg-green-50">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium">
                              {assignment.client ? `${assignment.client.firstName} ${assignment.client.lastName}` : 'Client'}
                            </p>
                            <Badge variant="outline" className="bg-green-100 text-green-800">
                              {assignment.status}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium mb-1">
                            Service: {assignment.serviceBooking?.serviceName || 'N/A'}
                          </p>
                          <p className="text-sm text-muted-foreground mb-1">
                            Provider: {assignment.provider?.businessName || 'N/A'}
                          </p>
                          <p className="text-sm text-muted-foreground mb-2">
                            Service Date: {assignment.serviceBooking?.serviceDate ? format(new Date(assignment.serviceBooking.serviceDate), 'PPp') : 'N/A'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Accepted: {assignment.respondedAt ? format(new Date(assignment.respondedAt), 'PPp') : 'N/A'}
                          </p>
                        </div>
                      ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="completed" className="mt-4">
                <div className="space-y-4">
                  {loadingJobAssignments ? (
                    <p className="text-center text-muted-foreground">Loading job assignments...</p>
                  ) : jobAssignments.filter((a: any) => a.status === 'completed').length === 0 ? (
                    <p className="text-center text-muted-foreground">No completed jobs</p>
                  ) : (
                    jobAssignments
                      .filter((a: any) => a.status === 'completed')
                      .slice(0, 10)
                      .map((assignment: any) => (
                        <div key={assignment.id} className="border rounded-lg p-4 bg-blue-50">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium">
                              {assignment.client ? `${assignment.client.firstName} ${assignment.client.lastName}` : 'Client'}
                            </p>
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              {assignment.status}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium mb-1">
                            Service: {assignment.serviceBooking?.serviceName || 'N/A'}
                          </p>
                          <p className="text-sm text-muted-foreground mb-1">
                            Provider: {assignment.provider?.businessName || 'N/A'}
                          </p>
                          <p className="text-sm text-muted-foreground mb-2">
                            Completed: {assignment.completedAt ? format(new Date(assignment.completedAt), 'PPp') : 'N/A'}
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
          <CardTitle>Country-wide Service Bookings</CardTitle>
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
                          {order.serviceDate ? format(new Date(order.serviceDate), 'MMM d, yyyy') : 'N/A'}
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
                          {order.serviceDate ? format(new Date(order.serviceDate), 'MMM d, yyyy') : 'N/A'}
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
                          {order.serviceDate ? format(new Date(order.serviceDate), 'MMM d, yyyy') : 'N/A'}
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
                          {order.serviceDate ? format(new Date(order.serviceDate), 'MMM d, yyyy') : 'N/A'}
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

      {selectedBooking && (
        <AssignJobDialog
          open={assignDialogOpen}
          onOpenChange={setAssignDialogOpen}
          booking={selectedBooking}
          providers={providers}
        />
      )}

      {reassignDialogOpen && selectedAssignment && !loadingProviders && providers && providers.length > 0 && (
        <AssignJobDialog
          open={reassignDialogOpen}
          onOpenChange={(open) => {
            setReassignDialogOpen(open);
            if (!open) {
              setSelectedAssignment(null);
            }
          }}
          booking={{
            id: selectedAssignment.serviceBooking?.bookingId || selectedAssignment.serviceBookingId || selectedAssignment.id,
            status: selectedAssignment.status || 'pending',
            createdAt: selectedAssignment.createdAt || new Date().toISOString(),
            scheduledDate: selectedAssignment.serviceBooking?.serviceDate,
            totalAmount: selectedAssignment.serviceBooking?.total || '0',
            client: {
              firstName: selectedAssignment.client?.firstName || '',
              lastName: selectedAssignment.client?.lastName || '',
            }
          }}
          providers={providers}
          onAssign={async (serviceProviderId: string) => {
            await reassignMutation.mutateAsync({
              assignmentId: selectedAssignment.id,
              serviceProviderId,
            });
          }}
          isReassign={true}
          currentProvider={selectedAssignment.provider?.businessName}
        />
      )}

      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Job Assignment?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this job assignment? This will remove the assignment and the service booking will need to be reassigned to another provider.
              {selectedAssignment && (
                <div className="mt-3 p-3 bg-muted rounded-md">
                  <p className="text-sm"><strong>Service:</strong> {selectedAssignment.serviceBooking?.serviceName}</p>
                  <p className="text-sm"><strong>Provider:</strong> {selectedAssignment.provider?.businessName}</p>
                  <p className="text-sm"><strong>Client:</strong> {selectedAssignment.client?.firstName} {selectedAssignment.client?.lastName}</p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, Keep It</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedAssignment) {
                  cancelAssignmentMutation.mutate(selectedAssignment.id);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, Cancel Assignment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
