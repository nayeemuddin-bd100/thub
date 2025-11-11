import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { AlertCircle, Plus } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const getDisputeFormSchema = (t: (key: string) => string) => z.object({
  itemType: z.enum(["booking", "order"]),
  bookingId: z.string().optional(),
  orderId: z.string().optional(),
  description: z.string().min(20, t('disputes.description_min')),
}).superRefine((data, ctx) => {
  if (data.itemType === "booking" && !data.bookingId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: t('disputes.select_booking_required'),
      path: ["bookingId"],
    });
  }
  if (data.itemType === "order" && !data.orderId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: t('disputes.select_order_required'),
      path: ["orderId"],
    });
  }
});

type Dispute = {
  id: string;
  bookingId: string;
  orderId: string | null;
  description: string;
  status: string;
  createdAt: string;
};

export default function Disputes() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const disputeFormSchema = getDisputeFormSchema(t);

  const form = useForm<z.infer<typeof disputeFormSchema>>({
    resolver: zodResolver(disputeFormSchema),
    defaultValues: {
      itemType: "booking",
      bookingId: "",
      orderId: "",
      description: "",
    },
  });

  const itemType = form.watch("itemType");

  const { data: disputes = [], isLoading: disputesLoading, error: disputesError } = useQuery<Dispute[]>({
    queryKey: ["/api/disputes"],
  });

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery<any[]>({
    queryKey: ["/api/bookings"],
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery<any[]>({
    queryKey: ["/api/service-orders"],
  });

  const createDisputeMutation = useMutation({
    mutationFn: async (data: z.infer<typeof disputeFormSchema>) => {
      const res = await fetch("/api/disputes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: data.itemType === "booking" ? data.bookingId : null,
          orderId: data.itemType === "order" ? data.orderId : null,
          description: data.description,
        }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create dispute");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/disputes"] });
      setDialogOpen(false);
      form.reset();
      toast({ title: t('common.success'), description: t('disputes.submitted_success') });
    },
    onError: () => {
      toast({ 
        title: t('common.error'), 
        description: t('disputes.submit_failed'),
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: z.infer<typeof disputeFormSchema>) => {
    createDisputeMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onToggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold" data-testid="heading-disputes">{t('disputes.title')}</h1>
            <p className="text-muted-foreground mt-2">{t('disputes.subtitle')}</p>
          </div>
          <Button onClick={() => setDialogOpen(true)} data-testid="button-create-dispute">
            <Plus className="w-4 h-4 mr-2" />
            {t('disputes.file_dispute')}
          </Button>
        </div>

        {disputesLoading ? (
          <div className="space-y-4" data-testid="loading-disputes">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="h-24 bg-muted rounded animate-pulse" data-testid={`skeleton-dispute-${i}`} />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : disputesError ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-destructive" data-testid="error-disputes">
                {t('disputes.failed_load')}
              </p>
            </CardContent>
          </Card>
        ) : disputes.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <AlertCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2" data-testid="empty-disputes">{t('disputes.no_disputes')}</h3>
              <p className="text-muted-foreground mb-4">{t('disputes.no_disputes_desc')}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {disputes.map((dispute) => (
              <Card key={dispute.id} data-testid={`card-dispute-${dispute.id}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg" data-testid={`text-dispute-type-${dispute.id}`}>
                      {dispute.bookingId ? t('disputes.dispute_for_booking') : t('disputes.dispute_for_order')}
                    </CardTitle>
                    <Badge 
                      variant={dispute.status === "pending" ? "secondary" : "default"}
                      data-testid={`badge-status-${dispute.id}`}
                    >
                      {dispute.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-2" data-testid={`text-description-${dispute.id}`}>{dispute.description}</p>
                  <p className="text-xs text-muted-foreground" data-testid={`text-date-${dispute.id}`}>
                    {t('disputes.filed')}: {new Date(dispute.createdAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t('disputes.file_dispute')}</DialogTitle>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="itemType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('disputes.dispute_type')} *</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                          form.setValue("bookingId", "");
                          form.setValue("orderId", "");
                        }} 
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-dispute-type">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="booking">{t('disputes.property_booking')}</SelectItem>
                          <SelectItem value="order">{t('disputes.service_order')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {itemType === "booking" ? (
                  <FormField
                    control={form.control}
                    name="bookingId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('disputes.select_booking')} *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-booking">
                              <SelectValue placeholder={t('disputes.choose_booking')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {bookingsLoading ? (
                              <SelectItem value="loading" disabled>{t('disputes.loading_bookings')}</SelectItem>
                            ) : bookings.length === 0 ? (
                              <SelectItem value="none" disabled>{t('disputes.no_bookings')}</SelectItem>
                            ) : (
                              bookings.map((booking) => (
                                <SelectItem key={booking.id} value={booking.id}>
                                  {booking.bookingCode || booking.id}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <FormField
                    control={form.control}
                    name="orderId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('disputes.select_order')} *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-order">
                              <SelectValue placeholder={t('disputes.choose_order')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {ordersLoading ? (
                              <SelectItem value="loading" disabled>{t('disputes.loading_orders')}</SelectItem>
                            ) : orders.length === 0 ? (
                              <SelectItem value="none" disabled>{t('disputes.no_orders')}</SelectItem>
                            ) : (
                              orders.map((order) => (
                                <SelectItem key={order.id} value={order.id}>
                                  {order.orderCode || order.id}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('disputes.description')} *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t('disputes.description_placeholder')}
                          rows={5}
                          {...field}
                          data-testid="textarea-dispute-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} data-testid="button-cancel-dispute">
                    {t('common.cancel')}
                  </Button>
                  <Button type="submit" disabled={createDisputeMutation.isPending} data-testid="button-submit-dispute">
                    {createDisputeMutation.isPending ? t('disputes.submitting') : t('disputes.submit_dispute')}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Footer />
    </div>
  );
}
