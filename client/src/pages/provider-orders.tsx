import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, User, Phone, Mail, MapPin, DollarSign, Package, CheckCircle, XCircle, Clock3 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";

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
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  subtotal: string;
  taxAmount: string;
  totalAmount: string;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  specialInstructions?: string;
  client?: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
  };
  items: ServiceOrderItem[];
}

export default function ProviderOrders() {
  const { t } = useTranslation();
  const { toast } = useToast();

  const { data: orders, isLoading } = useQuery<ServiceOrder[]>({
    queryKey: ['/api/service-orders/provider'],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      return await apiRequest('PUT', `/api/service-orders/${orderId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/service-orders/provider'] });
      toast({
        title: t("orders.order_status"),
        description: t("provider_dashboard.update_status"),
      });
    },
    onError: () => {
      toast({
        title: t("common.error"),
        description: t("errors.generic_error"),
        variant: "destructive",
      });
    },
  });

  const handleAcceptOrder = (orderId: string) => {
    updateStatusMutation.mutate({ orderId, status: 'confirmed' });
  };

  const handleRejectOrder = (orderId: string) => {
    updateStatusMutation.mutate({ orderId, status: 'cancelled' });
  };

  const handleStartService = (orderId: string) => {
    updateStatusMutation.mutate({ orderId, status: 'in_progress' });
  };

  const handleCompleteService = (orderId: string) => {
    updateStatusMutation.mutate({ orderId, status: 'completed' });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: t('dashboard.pending'), variant: 'secondary' as const, icon: Clock3 },
      confirmed: { label: t('orders.order_confirmed'), variant: 'default' as const, icon: CheckCircle },
      in_progress: { label: t('orders.order_processing'), variant: 'default' as const, icon: Clock },
      completed: { label: t('orders.order_completed'), variant: 'default' as const, icon: CheckCircle },
      cancelled: { label: t('orders.order_cancelled'), variant: 'destructive' as const, icon: XCircle },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1" data-testid={`badge-status-${status}`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getPaymentBadge = (status: string) => {
    const config = {
      pending: { label: t('orders.unpaid'), variant: 'secondary' as const },
      paid: { label: t('orders.paid'), variant: 'default' as const },
      refunded: { label: t('orders.refunded'), variant: 'destructive' as const },
    };
    
    const { label, variant } = config[status as keyof typeof config] || config.pending;
    return <Badge variant={variant} data-testid={`badge-payment-${status}`}>{label}</Badge>;
  };

  const filterOrders = (status: string) => {
    if (!orders) return [];
    if (status === 'all') return orders;
    return orders.filter(order => order.status === status);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">{t('common.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  const pendingOrders = filterOrders('pending');
  const confirmedOrders = filterOrders('confirmed');
  const inProgressOrders = filterOrders('in_progress');
  const completedOrders = filterOrders('completed');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" data-testid="heading-orders">{t('provider_dashboard.my_orders')}</h1>
        <p className="text-muted-foreground">{t('orders.order_history')}</p>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="pending" data-testid="tab-pending">
            {t('dashboard.pending')} ({pendingOrders.length})
          </TabsTrigger>
          <TabsTrigger value="confirmed" data-testid="tab-confirmed">
            {t('orders.order_confirmed')} ({confirmedOrders.length})
          </TabsTrigger>
          <TabsTrigger value="in_progress" data-testid="tab-in-progress">
            {t('orders.order_processing')} ({inProgressOrders.length})
          </TabsTrigger>
          <TabsTrigger value="completed" data-testid="tab-completed">
            {t('dashboard.completed')} ({completedOrders.length})
          </TabsTrigger>
          <TabsTrigger value="all" data-testid="tab-all">
            {t('common.all')} ({orders?.length || 0})
          </TabsTrigger>
        </TabsList>

        {['pending', 'confirmed', 'in_progress', 'completed', 'all'].map(tab => (
          <TabsContent key={tab} value={tab}>
            <div className="space-y-4">
              {filterOrders(tab).length === 0 ? (
                <Card>
                  <CardContent className="py-12">
                    <div className="text-center text-muted-foreground">
                      <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p data-testid={`text-no-orders-${tab}`}>{t('orders.no_orders')}</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                filterOrders(tab).map(order => (
                  <Card key={order.id} data-testid={`card-order-${order.id}`}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-3">
                            <span data-testid={`text-order-code-${order.id}`}>Order #{order.orderCode}</span>
                            {getStatusBadge(order.status)}
                            {getPaymentBadge(order.paymentStatus)}
                          </CardTitle>
                          <CardDescription className="mt-2">
                            <div className="flex flex-wrap gap-4 mt-2">
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
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <h3 className="font-semibold mb-3">{t('provider_dashboard.customer_info')}</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span data-testid={`text-client-name-${order.id}`}>
                                {order.client?.firstName} {order.client?.lastName}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span data-testid={`text-client-email-${order.id}`}>{order.client?.email}</span>
                            </div>
                            {order.client?.phoneNumber && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span data-testid={`text-client-phone-${order.id}`}>{order.client.phoneNumber}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <h3 className="font-semibold mb-3">{t('book_service.order_summary')}</h3>
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
                        <div className="mb-6">
                          <h3 className="font-semibold mb-2">{t('book_service.additional_notes')}</h3>
                          <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md" data-testid={`text-instructions-${order.id}`}>
                            {order.specialInstructions}
                          </p>
                        </div>
                      )}

                      <Separator className="my-4" />

                      <div className="flex gap-2 justify-end">
                        {order.status === 'pending' && (
                          <>
                            <Button
                              variant="outline"
                              onClick={() => handleRejectOrder(order.id)}
                              disabled={updateStatusMutation.isPending}
                              data-testid={`button-reject-${order.id}`}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              {t('provider_dashboard.reject_order')}
                            </Button>
                            <Button
                              onClick={() => handleAcceptOrder(order.id)}
                              disabled={updateStatusMutation.isPending}
                              data-testid={`button-accept-${order.id}`}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              {t('provider_dashboard.accept_order')}
                            </Button>
                          </>
                        )}

                        {order.status === 'confirmed' && (
                          <Button
                            onClick={() => handleStartService(order.id)}
                            disabled={updateStatusMutation.isPending}
                            data-testid={`button-start-${order.id}`}
                          >
                            <Clock className="h-4 w-4 mr-2" />
                            {t('book_service.service_time')}
                          </Button>
                        )}

                        {order.status === 'in_progress' && (
                          <Button
                            onClick={() => handleCompleteService(order.id)}
                            disabled={updateStatusMutation.isPending}
                            data-testid={`button-complete-${order.id}`}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {t('provider_dashboard.mark_completed')}
                          </Button>
                        )}
                      </div>
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
