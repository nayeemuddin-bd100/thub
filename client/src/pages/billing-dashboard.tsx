import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, TrendingUp, FileText, Download, Home, Percent, RefreshCw, Package } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';

interface PaymentStats {
  totalRevenue: number;
  monthlyRevenue: number;
  totalTransactions: number;
  pendingPayments: number;
  platformCommission: number;
  providerPayouts: number;
  refundsIssued: number;
  refundCount: number;
  currentCommissionRate: number;
}

interface Transaction {
  id: string;
  type: 'booking' | 'service_order';
  amount: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  clientName: string;
}

interface TopService {
  serviceName: string;
  orderCount: number;
  totalRevenue: number;
  commission: number;
}

export default function BillingDashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Check authorization
  if (!user || user.role !== 'billing') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Access denied. Billing role required.</p>
            <Button onClick={() => navigate('/dashboard')} className="mt-4">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { data: stats, isLoading: loadingStats } = useQuery<PaymentStats>({
    queryKey: ['/api/billing/stats'],
  });

  const { data: transactions = [], isLoading: loadingTransactions } = useQuery<Transaction[]>({
    queryKey: ['/api/billing/transactions'],
  });

  const { data: topServices = [], isLoading: loadingTopServices } = useQuery<TopService[]>({
    queryKey: ['/api/billing/top-services'],
  });

  const handleExport = () => {
    const csv = [
      ['ID', 'Type', 'Client', 'Amount', 'Status', 'Payment Status', 'Date'].join(','),
      ...transactions.map(t => [
        t.id,
        t.type,
        t.clientName,
        t.amount,
        t.status,
        t.paymentStatus,
        format(new Date(t.createdAt), 'yyyy-MM-dd')
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `billing-transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Billing Dashboard</h1>
          <p className="text-muted-foreground">Manage payments, revenue, and financial reports</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/')}>
          <Home className="w-4 h-4 mr-2" />
          Home
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingStats ? '...' : `$${Number(stats?.totalRevenue ?? 0).toLocaleString()}`}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingStats ? '...' : `$${Number(stats?.monthlyRevenue ?? 0).toLocaleString()}`}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Platform Commission</CardTitle>
            <Percent className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingStats ? '...' : `$${Number(stats?.platformCommission ?? 0).toLocaleString()}`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Rate: {loadingStats ? '...' : `${stats?.currentCommissionRate || 0}%`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Provider Payouts</CardTitle>
            <DollarSign className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingStats ? '...' : `$${Number(stats?.providerPayouts ?? 0).toLocaleString()}`}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingStats ? '...' : stats?.totalTransactions || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <DollarSign className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingStats ? '...' : stats?.pendingPayments || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Refunds Issued</CardTitle>
            <RefreshCw className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingStats ? '...' : `$${Number(stats?.refundsIssued ?? 0).toLocaleString()}`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {loadingStats ? '...' : `${stats?.refundCount || 0} refunds`}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Commission Rate</CardTitle>
            <Percent className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {loadingStats ? '...' : `${stats?.currentCommissionRate || 0}%`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Current platform rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Services */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Top Performing Services</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingTopServices ? (
            <p className="text-center text-muted-foreground">Loading...</p>
          ) : topServices.length === 0 ? (
            <p className="text-center text-muted-foreground">No service data available</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service Name</TableHead>
                  <TableHead className="text-center">Orders</TableHead>
                  <TableHead className="text-right">Total Revenue</TableHead>
                  <TableHead className="text-right">Commission</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topServices.map((service, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-muted-foreground" />
                        {service.serviceName}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{service.orderCount}</TableCell>
                    <TableCell className="text-right">${Number(service.totalRevenue).toLocaleString()}</TableCell>
                    <TableCell className="text-right text-green-600 font-medium">
                      ${Number(service.commission).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Transactions</CardTitle>
            <Button variant="outline" size="sm" onClick={handleExport} disabled={transactions.length === 0}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="paid">Paid</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingTransactions ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No transactions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-mono text-sm">
                          {transaction.id.substring(0, 8)}...
                        </TableCell>
                        <TableCell className="capitalize">{transaction.type.replace('_', ' ')}</TableCell>
                        <TableCell>{transaction.clientName}</TableCell>
                        <TableCell>${transaction.amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              transaction.paymentStatus === 'paid'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {transaction.paymentStatus}
                          </span>
                        </TableCell>
                        <TableCell>
                          {format(new Date(transaction.createdAt), 'MMM d, yyyy')}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="paid" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.filter((t) => t.paymentStatus === 'paid').length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No paid transactions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions
                      .filter((t) => t.paymentStatus === 'paid')
                      .map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-mono text-sm">
                            {transaction.id.substring(0, 8)}...
                          </TableCell>
                          <TableCell className="capitalize">{transaction.type.replace('_', ' ')}</TableCell>
                          <TableCell>{transaction.clientName}</TableCell>
                          <TableCell>${transaction.amount.toLocaleString()}</TableCell>
                          <TableCell>
                            {format(new Date(transaction.createdAt), 'MMM d, yyyy')}
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
                    <TableHead>ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.filter((t) => t.paymentStatus === 'pending').length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No pending transactions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions
                      .filter((t) => t.paymentStatus === 'pending')
                      .map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-mono text-sm">
                            {transaction.id.substring(0, 8)}...
                          </TableCell>
                          <TableCell className="capitalize">{transaction.type.replace('_', ' ')}</TableCell>
                          <TableCell>{transaction.clientName}</TableCell>
                          <TableCell>${transaction.amount.toLocaleString()}</TableCell>
                          <TableCell>
                            {format(new Date(transaction.createdAt), 'MMM d, yyyy')}
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
