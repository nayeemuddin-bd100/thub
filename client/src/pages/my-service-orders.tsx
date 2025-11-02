import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, User, MapPin, DollarSign, Package, CheckCircle, XCircle, Clock3, Phone, Mail, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

interface ServiceOrderItem {
  id: string;
  itemType: 'menu_item' | 'task';
  itemName: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
}

interface ServiceOrder {
  id: string;
  orderCode: string;
  serviceDate: string;
  startTime: string;
  endTime?: string;
  duration?: string;
  status: 'pending' | 'pending_payment' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  subtotal: string;
  taxAmount: string;
  totalAmount: string;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  specialInstructions?: string;
  serviceProvider?: {
    businessName: string;
    user?: {
      firstName: string;
      lastName: string;
      phoneNumber?: string;
      email: string;
    };
  };
  items: ServiceOrderItem[];
}

export default function MyServiceOrders() {
  const { data: orders, isLoading } = useQuery<ServiceOrder[]>({
    queryKey: ['/api/service-orders/client'],
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { 
        label: 'Pending Confirmation', 
        variant: 'secondary' as const, 
        icon: Clock3,
        description: 'Waiting for provider to accept'
      },
      pending_payment: { 
        label: 'Payment Required', 
        variant: 'outline' as const, 
        icon: AlertCircle,
        description: 'Please complete payment to confirm'
      },
      confirmed: { 
        label: 'Confirmed', 
        variant: 'default' as const, 
        icon: CheckCircle,
        description: 'Provider has accepted your order'
      },
      in_progress: { 
        label: 'Service in Progress', 
        variant: 'default' as const, 
        icon: Clock,
        description: 'Provider is currently working on your service'
      },
      completed: { 
        label: 'Completed', 
        variant: 'default' as const, 
        icon: CheckCircle,
        description: 'Service has been completed'
      },
      cancelled: { 
        label: 'Cancelled', 
        variant: 'destructive' as const, 
        icon: XCircle,
        description: 'Order was cancelled'
      },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <div className="flex items-center gap-2">
        <Badge variant={config.variant} className="flex items-center gap-1" data-testid={`badge-status-${status}`}>
          <Icon className="h-3 w-3" />
          {config.label}
        </Badge>
        <span className="text-sm text-muted-foreground">{config.description}</span>
      </div>
    );
  };

  const getPaymentBadge = (status: string) => {
    const config = {
      pending: { label: 'Payment Pending', variant: 'secondary' as const },
      paid: { label: 'Paid', variant: 'default' as const },
      refunded: { label: 'Refunded', variant: 'destructive' as const },
    };
    
    const { label, variant } = config[status as keyof typeof config] || config.pending;
    return <Badge variant={variant} data-testid={`badge-payment-${status}`}>{label}</Badge>;
  };

  const filterOrders = (status: string) => {
    if (!orders) return [];
    if (status === 'all') return orders;
    if (status === 'active') return orders.filter(order => 
      ['pending', 'pending_payment', 'confirmed', 'in_progress'].includes(order.status)
    );
    return orders.filter(order => order.status === status);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your orders...</p>
          </div>
        </div>
      </div>
    );
  }

  const activeOrders = filterOrders('active');
  const completedOrders = filterOrders('completed');
  const cancelledOrders = filterOrders('cancelled');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" data-testid="heading-my-orders">My Service Orders</h1>
        <p className="text-muted-foreground">Track your service orders and view order history</p>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="active" data-testid="tab-active">
            Active ({activeOrders.length})
          </TabsTrigger>
          <TabsTrigger value="completed" data-testid="tab-completed">
            Completed ({completedOrders.length})
          </TabsTrigger>
          <TabsTrigger value="cancelled" data-testid="tab-cancelled">
            Cancelled ({cancelledOrders.length})
          </TabsTrigger>
          <TabsTrigger value="all" data-testid="tab-all">
            All ({orders?.length || 0})
          </TabsTrigger>
        </TabsList>

        {['active', 'completed', 'cancelled', 'all'].map(tab => (
          <TabsContent key={tab} value={tab}>
            <div className="space-y-4">
              {filterOrders(tab).length === 0 ? (
                <Card>
                  <CardContent className="py-12">
                    <div className="text-center text-muted-foreground">
                      <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p data-testid={`text-no-orders-${tab}`}>No {tab === 'all' ? '' : tab} orders</p>
                      <Link href="/services">
                        <Button className="mt-4" data-testid="button-browse-services">
                          Browse Services
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                filterOrders(tab).map(order => (
                  <Card key={order.id} data-testid={`card-order-${order.id}`}>
                    <CardHeader>
                      <div className="flex justify-between items-start flex-wrap gap-4">
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-3 mb-3">
                            <span data-testid={`text-order-code-${order.id}`}>Order #{order.orderCode}</span>
                          </CardTitle>
                          <div className="space-y-2">
                            {getStatusBadge(order.status)}
                            <div className="flex items-center gap-2">
                              {getPaymentBadge(order.paymentStatus)}
                            </div>
                          </div>
                          <CardDescription className="mt-4">
                            <div className="flex flex-wrap gap-4">
                              <span className="flex items-center gap-1" data-testid={`text-service-date-${order.id}`}>
                                <Calendar className="h-4 w-4" />
                                {format(new Date(order.serviceDate), 'PPP')}
                              </span>
                              <span className="flex items-center gap-1" data-testid={`text-service-time-${order.id}`}>
                                <Clock className="h-4 w-4" />
                                {order.startTime} {order.endTime && `- ${order.endTime}`}
                              </span>
                            </div>
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold" data-testid={`text-total-${order.id}`}>
                            ${parseFloat(order.totalAmount).toLocaleString()}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Subtotal: ${parseFloat(order.subtotal).toFixed(2)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Tax: ${parseFloat(order.taxAmount).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <h3 className="font-semibold mb-3">Service Provider</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span data-testid={`text-provider-name-${order.id}`} className="font-medium">
                                {order.serviceProvider?.businessName}
                              </span>
                            </div>
                            {order.serviceProvider?.user && (
                              <>
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-muted-foreground" />
                                  <span>
                                    {order.serviceProvider.user.firstName} {order.serviceProvider.user.lastName}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Mail className="h-4 w-4 text-muted-foreground" />
                                  <span>{order.serviceProvider.user.email}</span>
                                </div>
                                {order.serviceProvider.user.phoneNumber && (
                                  <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span>{order.serviceProvider.user.phoneNumber}</span>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>

                        <div>
                          <h3 className="font-semibold mb-3">Order Items</h3>
                          <div className="space-y-2">
                            {order.items.map(item => (
                              <div key={item.id} className="flex justify-between text-sm" data-testid={`item-${item.id}`}>
                                <span>
                                  {item.itemName} {item.quantity > 1 && `(x${item.quantity})`}
                                </span>
                                <span className="font-medium">${parseFloat(item.totalPrice).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {order.specialInstructions && (
                        <div className="mb-4">
                          <h3 className="font-semibold mb-2">Your Instructions</h3>
                          <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md" data-testid={`text-instructions-${order.id}`}>
                            {order.specialInstructions}
                          </p>
                        </div>
                      )}

                      {order.status === 'pending_payment' && order.paymentStatus === 'pending' && (
                        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                          <div className="flex items-start justify-between gap-4">
                            <p className="text-sm text-blue-800 dark:text-blue-200 flex-1">
                              <strong>Payment Required!</strong> Please complete payment to confirm your order.
                            </p>
                            <Link href={`/pay-service-order/${order.id}`}>
                              <Button size="sm" data-testid={`button-pay-${order.id}`}>
                                Pay Now
                              </Button>
                            </Link>
                          </div>
                        </div>
                      )}

                      {order.status === 'in_progress' && (
                        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                          <p className="text-sm text-green-800 dark:text-green-200">
                            <strong>Service in Progress!</strong> Your service provider is currently working on your order.
                          </p>
                        </div>
                      )}

                      {order.status === 'completed' && (
                        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                          <p className="text-sm text-green-800 dark:text-green-200">
                            <strong>Service Completed!</strong> Thank you for using our service. We hope you enjoyed your experience.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
