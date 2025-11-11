import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ArrowLeft, Calendar as CalendarIcon, Clock, DollarSign } from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import type { ServiceProvider } from "@shared/schema";
import { useTranslation } from 'react-i18next';

const bookingSchema = z.object({
  serviceDate: z.date({
    required_error: "Please select a date",
  }),
  startTime: z.string().min(1, "Please select a start time"),
  endTime: z.string().optional(),
  duration: z.number().optional(),
  specialInstructions: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

export default function BookServicePage() {
  const { t } = useTranslation();
  const params = useParams();
  const providerId = params.id;
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [selectionData, setSelectionData] = useState<any>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('serviceSelection');
    if (stored) {
      setSelectionData(JSON.parse(stored));
    }
  }, []);

  const { data: provider, isLoading: providerLoading } = useQuery<ServiceProvider>({
    queryKey: ['/api/service-providers', providerId],
    enabled: !!providerId,
  });

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      specialInstructions: '',
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (data: BookingFormData) => {
      if (!selectionData) {
        throw new Error("No items selected");
      }

      const items = selectionData.items.map((item: any) => ({
        itemType: item.type,
        menuItemId: item.type === 'menu_item' ? item.id : null,
        taskId: item.type === 'task' ? item.id : null,
        itemName: item.name,
        quantity: 1,
        unitPrice: item.price,
        totalPrice: item.price,
      }));

      const payload = {
        serviceProviderId: providerId,
        serviceDate: format(data.serviceDate, 'yyyy-MM-dd'),
        startTime: data.startTime,
        endTime: data.endTime,
        duration: data.duration,
        items,
        specialInstructions: data.specialInstructions,
      };

      const response = await apiRequest('POST', '/api/service-orders', payload);
      return await response.json();
    },
    onSuccess: (order) => {
      toast({
        title: t('book_service.order_success'),
        description: t('book_service.order_code', { code: order.orderCode }) + ' ' + t('book_service.redirecting_payment'),
      });
      sessionStorage.removeItem('serviceSelection');
      queryClient.invalidateQueries({ queryKey: ['/api/service-orders'] });
      
      // Redirect to payment page after a short delay to show the success message
      setTimeout(() => {
        navigate(`/pay-service-order/${order.id}`);
      }, 1500);
    },
    onError: (error: Error) => {
      toast({
        title: t('book_service.order_failed', 'Failed to place order'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: BookingFormData) => {
    createOrderMutation.mutate(data);
  };

  if (!selectionData) {
    return (
      <div className="container mx-auto p-6" data-testid="no-selection-data">
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-gray-500 dark:text-gray-400">
              {t('book_service.no_items_selected', 'No items selected. Please go back and select items first.')}
            </p>
            <div className="flex justify-center mt-4">
              <Button onClick={() => navigate(`/service-provider/${providerId}`)} data-testid="button-back-provider">
                {t('book_service.back_to_provider', 'Back to Provider')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (providerLoading) {
    return (
      <div className="container mx-auto p-6" data-testid="loading-booking">
        <p className="text-center text-gray-500 dark:text-gray-400">{t('common.loading')}</p>
      </div>
    );
  }

  const timeSlots = [
    "07:00", "07:30", "08:00", "08:30", "09:00", "09:30", 
    "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
    "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
    "19:00", "19:30", "20:00", "20:30", "21:00"
  ];

  return (
    <div className="container mx-auto p-6 max-w-4xl" data-testid="book-service-page">
      <Button
        variant="ghost"
        onClick={() => navigate(`/service-provider/${providerId}`)}
        className="mb-4"
        data-testid="button-back-provider"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        {t('book_service.back_to_provider', 'Back to Provider')}
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card data-testid="card-booking-form">
            <CardHeader>
              <CardTitle>{t('book_service.title')} {t('common.with', 'with')} {provider?.businessName}</CardTitle>
              <CardDescription>{t('book_service.select_date_time', 'Select a date and time for your service')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="serviceDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>{t('book_service.service_date')}</FormLabel>
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          className="rounded-md border"
                          data-testid="calendar-service-date"
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('book_service.start_time', 'Start Time')}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-start-time">
                              <SelectValue placeholder={t('book_service.select_start_time', 'Select start time')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {timeSlots.map((time) => (
                              <SelectItem key={time} value={time} data-testid={`option-time-${time}`}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="specialInstructions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('book_service.special_instructions', 'Special Instructions')} ({t('common.optional')})</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t('book_service.special_requests_placeholder', 'Any special requests or instructions...')}
                            {...field}
                            data-testid="textarea-special-instructions"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={createOrderMutation.isPending}
                    data-testid="button-submit-booking"
                  >
                    {createOrderMutation.isPending ? t('book_service.placing_order', 'Placing Order...') : t('book_service.place_order')}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-4" data-testid="card-order-summary">
            <CardHeader>
              <CardTitle>{t('book_service.order_summary')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2" data-testid="text-selected-items">{t('book_service.selected_items', 'Selected Items')} ({selectionData.items.length})</h4>
                <div className="space-y-2">
                  {selectionData.items.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between text-sm" data-testid={`item-summary-${index}`}>
                      <span data-testid={`text-item-name-${index}`}>{item.name}</span>
                      <span data-testid={`text-item-price-${index}`}>${parseFloat(item.price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>{t('book_service.subtotal', 'Subtotal')}</span>
                  <span data-testid="text-subtotal">${selectionData.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>{t('book_service.tax', 'Tax')} (10%)</span>
                  <span data-testid="text-tax">${(selectionData.total * 0.1).toFixed(2)}</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>{t('booking.total')}</span>
                <span data-testid="text-total">${(selectionData.total * 1.1).toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
