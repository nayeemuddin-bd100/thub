import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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

const PaymentForm = ({ bookingId }: { bookingId: string }) => {
  const { t } = useTranslation();
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
          title: t('payment.payment_failed'),
          description: error.message,
          variant: "destructive",
        });
        setIsProcessing(false);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Confirm payment with backend
        await apiRequest('POST', `/api/bookings/${bookingId}/confirm-payment`, {
          paymentIntentId: paymentIntent.id,
        });

        toast({
          title: t('payment.payment_success'),
          description: t('booking.booking_confirmed'),
        });

        // Redirect to bookings page
        setTimeout(() => {
          setLocation('/dashboard?tab=bookings');
        }, 2000);
      }
    } catch (err) {
      toast({
        title: t('common.error'),
        description: t('errors.payment_error'),
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} data-testid="form-payment">
      <div className="space-y-6">
        <div className="min-h-[200px]">
          {!stripe ? (
            <div className="flex items-center justify-center h-40">
              <div className="text-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
              </div>
            </div>
          ) : (
            <PaymentElement 
              options={{
                layout: 'tabs'
              }}
            />
          )}
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard?tab=bookings">
            <Button type="button" variant="outline" className="flex-1" data-testid="button-back">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('dashboard.bookings')}
            </Button>
          </Link>
          <Button 
            type="submit" 
            className="flex-1"
            disabled={!stripe || isProcessing}
            data-testid="button-pay"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            {isProcessing ? t('payment.processing') : t('payment.pay_now')}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default function PayBooking() {
  const { t } = useTranslation();
  const [, params] = useRoute('/pay-booking/:id');
  const bookingId = params?.id;
  const [clientSecret, setClientSecret] = useState("");
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!bookingId) {
      toast({
        title: t('common.error'),
        description: t('errors.not_found'),
        variant: "destructive",
      });
      setLocation('/dashboard?tab=bookings');
      return;
    }

    // Fetch booking details
    const fetchBookingAndCreatePaymentIntent = async () => {
      try {
        // Get booking details
        const bookingRes = await fetch(`/api/bookings/${bookingId}`, {
          credentials: 'include',
        });

        if (!bookingRes.ok) {
          throw new Error(t('errors.booking_error'));
        }

        const booking = await bookingRes.json();
        setBookingDetails(booking);

        // Create payment intent
        const paymentRes = await apiRequest('POST', `/api/bookings/${bookingId}/payment-intent`, {});
        
        if (!paymentRes.ok) {
          const errorData = await paymentRes.json();
          throw new Error(errorData.message || t('errors.payment_error'));
        }
        
        const paymentData = await paymentRes.json();
        
        if (!paymentData.clientSecret) {
          throw new Error(t('errors.payment_error'));
        }
        
        setClientSecret(paymentData.clientSecret);
      } catch (error: any) {
        console.error('Payment initialization error:', error);
        toast({
          title: t('errors.payment_error'),
          description: error.message || t('errors.try_again_later'),
          variant: "destructive",
        });
        // Don't redirect immediately - show error on payment page
        setTimeout(() => {
          setLocation('/dashboard?tab=bookings');
        }, 3000);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookingAndCreatePaymentIntent();
  }, [bookingId, toast, setLocation]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">{t('common.loading')}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!clientSecret && !isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">{t('errors.payment_error')}</CardTitle>
              <CardDescription>{t('errors.try_again_later')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>{t('errors.something_went_wrong')}</strong>
                  </p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside mt-2 space-y-1">
                    <li>{t('booking.booking_failed')}</li>
                    <li>{t('errors.network_error')}</li>
                    <li>{t('errors.server_error')}</li>
                  </ul>
                </div>
                <div className="text-center">
                  <Link href="/dashboard?tab=bookings">
                    <Button data-testid="button-back-to-bookings">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      {t('dashboard.bookings')}
                    </Button>
                  </Link>
                </div>
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
          <h1 className="text-3xl font-bold mb-2" data-testid="heading-payment">{t('payment.title')}</h1>
          <p className="text-muted-foreground">{t('booking.booking_code', { code: bookingDetails?.bookingCode })}</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t('booking.booking_summary')}</CardTitle>
            <CardDescription>{t('booking.payment_details')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('payment.booking_total')}:</span>
                <span data-testid="text-property-total">${parseFloat(bookingDetails?.propertyTotal || '0').toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('services.title')}:</span>
                <span data-testid="text-services-total">${parseFloat(bookingDetails?.servicesTotal || '0').toFixed(2)}</span>
              </div>
              {parseFloat(bookingDetails?.discountAmount || '0') > 0 && (
                <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                  <span>{t('common.discount')}:</span>
                  <span data-testid="text-discount">-${parseFloat(bookingDetails?.discountAmount || '0').toFixed(2)}</span>
                </div>
              )}
              <div className="h-px bg-border" />
              <div className="flex justify-between text-lg font-bold">
                <span>{t('booking.total')}:</span>
                <span data-testid="text-total">${parseFloat(bookingDetails?.totalAmount || '0').toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              {t('payment.payment_details')}
            </CardTitle>
            <CardDescription>{t('payment.pay_securely')}</CardDescription>
          </CardHeader>
          <CardContent>
            {!clientSecret ? (
              <div className="flex items-center justify-center h-40">
                <div className="text-center">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
                </div>
              </div>
            ) : (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <PaymentForm bookingId={bookingId!} />
              </Elements>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200 text-center">
            <strong>🔒 {t('payment.secure_payment')}:</strong> {t('payment.payment_notice')}
          </p>
        </div>
      </div>
    </div>
  );
}
