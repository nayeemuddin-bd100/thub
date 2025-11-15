import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, User, MapPin, DollarSign, Package, CheckCircle, XCircle, Clock3, Phone, Mail, AlertCircle, Star } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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
    id?: string;
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
  const { t } = useTranslation();
  const { toast } = useToast();
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);
  const [rating, setRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [cancellationReasons, setCancellationReasons] = useState<Record<string, string>>({});

  const { data: orders, isLoading } = useQuery<ServiceOrder[]>({
    queryKey: ['/api/service-orders/client'],
  });

  const cancelOrderMutation = useMutation({
    mutationFn: async ({ orderId, reason }: { orderId: string; reason: string }) => {
      return await apiRequest('POST', `/api/service-orders/${orderId}/cancel`, { cancellationReason: reason });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/service-orders/client'] });
      toast({
        title: t('common.success'),
        description: 'Order cancelled successfully. Refund will be processed if payment was made.',
      });
      // Clear the cancellation reason for this order
      setCancellationReasons(prev => {
        const newReasons = { ...prev };
        delete newReasons[variables.orderId];
        return newReasons;
      });
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.message || 'Failed to cancel order',
        variant: 'destructive',
      });
    },
  });

  const submitReviewMutation = useMutation({
    mutationFn: async (data: { serviceProviderId: string; rating: number; comment: string }) => {
      return await apiRequest('POST', '/api/reviews', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/service-orders/client'] });
      toast({
        title: t('common.success'),
        description: 'Review submitted successfully',
      });
      setReviewDialogOpen(false);
      setSelectedOrder(null);
      setRating(0);
      setReviewComment('');
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.message || 'Failed to submit review',
        variant: 'destructive',
      });
    },
  });

  const handleCancelOrder = (orderId: string) => {
    const reason = cancellationReasons[orderId] || '';
    if (!reason.trim()) {
      toast({
        title: t('common.error'),
        description: 'Please provide a cancellation reason',
        variant: 'destructive',
      });
      return;
    }
    cancelOrderMutation.mutate({ orderId, reason });
  };

  const handleSubmitReview = () => {
    if (!selectedOrder || rating === 0) {
      toast({
        title: t('common.error'),
        description: 'Please select a rating',
        variant: 'destructive',
      });
      return;
    }
    if (!selectedOrder.serviceProvider) {
      toast({
        title: t('common.error'),
        description: 'Service provider information not found',
        variant: 'destructive',
      });
      return;
    }
    submitReviewMutation.mutate({
      serviceProviderId: selectedOrder.serviceProvider.id!,
      rating,
      comment: reviewComment.trim(),
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { 
        label: t('orders.order_pending'), 
        variant: 'secondary' as const, 
        icon: Clock3,
        description: t('orders.order_pending')
      },
      pending_payment: { 
        label: t('orders.payment_status'), 
        variant: 'outline' as const, 
        icon: AlertCircle,
        description: t('orders.unpaid')
      },
      confirmed: { 
        label: t('orders.order_confirmed'), 
        variant: 'default' as const, 
        icon: CheckCircle,
        description: t('orders.order_confirmed')
      },
      in_progress: { 
        label: t('orders.order_processing'), 
        variant: 'default' as const, 
        icon: Clock,
        description: t('orders.order_processing')
      },
      completed: { 
        label: t('orders.order_completed'), 
        variant: 'default' as const, 
        icon: CheckCircle,
        description: t('orders.order_completed')
      },
      cancelled: { 
        label: t('orders.order_cancelled'), 
        variant: 'destructive' as const, 
        icon: XCircle,
        description: t('orders.order_cancelled')
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
            <p className="text-muted-foreground">{t('common.loading')}</p>
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
        <h1 className="text-3xl font-bold mb-2" data-testid="heading-my-orders">{t('orders.title')}</h1>
        <p className="text-muted-foreground">{t('orders.order_history')}</p>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="active" data-testid="tab-active">
            {t('orders.active_orders')} ({activeOrders.length})
          </TabsTrigger>
          <TabsTrigger value="completed" data-testid="tab-completed">
            {t('dashboard.completed')} ({completedOrders.length})
          </TabsTrigger>
          <TabsTrigger value="cancelled" data-testid="tab-cancelled">
            {t('dashboard.cancelled')} ({cancelledOrders.length})
          </TabsTrigger>
          <TabsTrigger value="all" data-testid="tab-all">
            {t('common.all')} ({orders?.length || 0})
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
                      <p data-testid={`text-no-orders-${tab}`}>{t('orders.no_orders')}</p>
                      <Link href="/services">
                        <Button className="mt-4" data-testid="button-browse-services">
                          {t('home.browse_services')}
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
                          <h3 className="font-semibold mb-3">{t('orders.provider_name')}</h3>
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
                        <div className="mb-4">
                          <h3 className="font-semibold mb-2">{t('book_service.additional_notes')}</h3>
                          <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md" data-testid={`text-instructions-${order.id}`}>
                            {order.specialInstructions}
                          </p>
                        </div>
                      )}

                      {order.status === 'pending_payment' && order.paymentStatus === 'pending' && (
                        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                          <div className="flex items-start justify-between gap-4">
                            <p className="text-sm text-blue-800 dark:text-blue-200 flex-1">
                              <strong>{t('orders.unpaid')}</strong>
                            </p>
                            <Link href={`/pay-service-order/${order.id}`}>
                              <Button size="sm" data-testid={`button-pay-${order.id}`}>
                                {t('dashboard.pay_now')}
                              </Button>
                            </Link>
                          </div>
                        </div>
                      )}

                      {order.status === 'in_progress' && (
                        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                          <p className="text-sm text-green-800 dark:text-green-200">
                            <strong>{t('orders.order_processing')}</strong>
                          </p>
                        </div>
                      )}

                      {order.status === 'completed' && (
                        <div className="mt-4">
                          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md mb-4">
                            <p className="text-sm text-green-800 dark:text-green-200">
                              <strong>{t('orders.order_completed')}</strong>
                            </p>
                          </div>
                          <Button
                            onClick={() => {
                              setSelectedOrder(order);
                              setReviewDialogOpen(true);
                            }}
                            className="w-full"
                            data-testid={`button-review-${order.id}`}
                          >
                            <Star className="h-4 w-4 mr-2" />
                            Leave Review
                          </Button>
                        </div>
                      )}

                      {(order.status === 'pending_payment' || order.status === 'confirmed') && order.paymentStatus !== 'refunded' && (
                        <div className="mt-4">
                          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md mb-4">
                            <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                              <strong>You can cancel this order</strong>
                            </p>
                            <Textarea
                              placeholder="Please provide a reason for cancellation..."
                              value={cancellationReasons[order.id] || ''}
                              onChange={(e) => setCancellationReasons(prev => ({
                                ...prev,
                                [order.id]: e.target.value
                              }))}
                              className="mb-3"
                              data-testid={`textarea-cancel-reason-${order.id}`}
                            />
                            <Button
                              variant="destructive"
                              onClick={() => handleCancelOrder(order.id)}
                              disabled={cancelOrderMutation.isPending}
                              className="w-full"
                              data-testid={`button-cancel-${order.id}`}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              {cancelOrderMutation.isPending ? 'Cancelling...' : 'Cancel Order'}
                            </Button>
                          </div>
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

      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave a Review</DialogTitle>
            <DialogDescription>
              Share your experience with {selectedOrder?.serviceProvider?.businessName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Rating</Label>
              <div className="flex gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                    data-testid={`button-rating-${star}`}
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="review-comment">Comment (optional)</Label>
              <Textarea
                id="review-comment"
                placeholder="Tell us about your experience..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={4}
                data-testid="textarea-review-comment"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSubmitReview}
                disabled={submitReviewMutation.isPending || rating === 0}
                className="flex-1"
                data-testid="button-submit-review"
              >
                {submitReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setReviewDialogOpen(false);
                  setSelectedOrder(null);
                  setRating(0);
                  setReviewComment('');
                }}
                data-testid="button-cancel-review"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
