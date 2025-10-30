import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useRoute, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CreditCard } from "lucide-react";
import { Link } from "wouter";

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const PaymentForm = ({ orderId }: { orderId: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
        setIsProcessing(false);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Confirm payment with backend
        await apiRequest('POST', `/api/service-orders/${orderId}/confirm-payment`, {
          paymentIntentId: paymentIntent.id,
        });

        toast({
          title: "Payment Successful",
          description: "Thank you for your payment! Your order has been confirmed.",
        });

        // Redirect to orders page
        setTimeout(() => {
          setLocation('/my-service-orders');
        }, 2000);
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to process payment",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} data-testid="form-payment">
      <div className="space-y-6">
        <PaymentElement />
        <div className="flex gap-3">
          <Link href="/my-service-orders">
            <Button type="button" variant="outline" className="flex-1" data-testid="button-back">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Button>
          </Link>
          <Button 
            type="submit" 
            className="flex-1"
            disabled={!stripe || isProcessing}
            data-testid="button-pay"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            {isProcessing ? 'Processing...' : 'Pay Now'}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default function PayServiceOrder() {
  const [, params] = useRoute('/pay-service-order/:id');
  const orderId = params?.id;
  const [clientSecret, setClientSecret] = useState("");
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!orderId) {
      toast({
        title: "Error",
        description: "Invalid order ID",
        variant: "destructive",
      });
      setLocation('/my-service-orders');
      return;
    }

    // Fetch order details
    const fetchOrderAndCreatePaymentIntent = async () => {
      try {
        // Get order details
        const orderRes = await fetch(`/api/service-orders/${orderId}`, {
          credentials: 'include',
        });

        if (!orderRes.ok) {
          throw new Error('Failed to fetch order');
        }

        const order = await orderRes.json();
        setOrderDetails(order);

        // Create payment intent
        const paymentRes = await apiRequest('POST', `/api/service-orders/${orderId}/payment-intent`, {});
        const paymentData = await paymentRes.json();
        setClientSecret(paymentData.clientSecret);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to initialize payment",
          variant: "destructive",
        });
        setLocation('/my-service-orders');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderAndCreatePaymentIntent();
  }, [orderId, toast, setLocation]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading payment...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">Unable to process payment</p>
                <Link href="/my-service-orders">
                  <Button data-testid="button-back-to-orders">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Orders
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2" data-testid="heading-payment">Complete Payment</h1>
          <p className="text-muted-foreground">Order #{orderDetails?.orderCode}</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
            <CardDescription>Review your order details before payment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span data-testid="text-subtotal">${parseFloat(orderDetails?.subtotal || '0').toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax:</span>
                <span data-testid="text-tax">${parseFloat(orderDetails?.taxAmount || '0').toFixed(2)}</span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span data-testid="text-total">${parseFloat(orderDetails?.totalAmount || '0').toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
            <CardDescription>Enter your payment information securely</CardDescription>
          </CardHeader>
          <CardContent>
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PaymentForm orderId={orderId!} />
            </Elements>
          </CardContent>
        </Card>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            <strong>Secure Payment:</strong> All transactions are encrypted and processed securely by Stripe.
          </p>
        </div>
      </div>
    </div>
  );
}
