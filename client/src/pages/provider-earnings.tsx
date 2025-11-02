import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { DollarSign, TrendingUp, Calendar, CreditCard } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const payoutFormSchema = z.object({
  amount: z.string()
    .min(1, "Amount is required")
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, "Amount must be a positive number"),
});

type Payout = {
  id: string;
  amount: string;
  status: string;
  requestDate: string;
};

export default function ProviderEarnings() {
  const { toast } = useToast();
  const [payoutDialogOpen, setPayoutDialogOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const form = useForm<z.infer<typeof payoutFormSchema>>({
    resolver: zodResolver(payoutFormSchema),
    defaultValues: {
      amount: "",
    },
  });

  const { data: earnings, isLoading: earningsLoading, error: earningsError } = useQuery<{ total: number; thisMonth: number; thisWeek: number }>({
    queryKey: ["/api/provider/earnings"],
  });

  const { data: payouts = [], isLoading: payoutsLoading, error: payoutsError } = useQuery<Payout[]>({
    queryKey: ["/api/provider/payouts"],
  });

  const requestPayoutMutation = useMutation({
    mutationFn: async (data: z.infer<typeof payoutFormSchema>) => {
      const res = await fetch("/api/provider/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: data.amount }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to request payout");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/provider/payouts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/provider/earnings"] });
      setPayoutDialogOpen(false);
      form.reset();
      toast({ title: "Success", description: "Payout request submitted!" });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to submit payout request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: z.infer<typeof payoutFormSchema>) => {
    requestPayoutMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onToggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8" data-testid="heading-earnings">Earnings & Payouts</h1>

        {earningsLoading ? (
          <div className="grid gap-6 md:grid-cols-3 mb-8" data-testid="loading-earnings">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="h-20 bg-muted rounded animate-pulse" data-testid={`skeleton-earnings-${i}`} />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : earningsError ? (
          <Card className="mb-8">
            <CardContent className="text-center py-8">
              <p className="text-destructive" data-testid="error-earnings">
                Failed to load earnings. Please try again.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <Card data-testid="card-total-earnings">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-earnings">
                  ${earnings?.total.toLocaleString() || "0"}
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-month-earnings">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-month-earnings">
                  ${earnings?.thisMonth.toLocaleString() || "0"}
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-week-earnings">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">This Week</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-week-earnings">
                  ${earnings?.thisWeek.toLocaleString() || "0"}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Payout History</h2>
          <Button onClick={() => setPayoutDialogOpen(true)} data-testid="button-request-payout">
            <CreditCard className="w-4 h-4 mr-2" />
            Request Payout
          </Button>
        </div>

{payoutsLoading ? (
          <Card>
            <CardContent className="pt-6" data-testid="loading-payouts">
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-muted rounded animate-pulse" data-testid={`skeleton-payout-${i}`} />
                ))}
              </div>
            </CardContent>
          </Card>
        ) : payoutsError ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-destructive" data-testid="error-payouts">
                Failed to load payout history. Please try again.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              {payouts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground" data-testid="empty-payouts">
                  No payout requests yet
                </div>
              ) : (
                <div className="space-y-4">
                  {payouts.map((payout) => (
                    <div key={payout.id} className="flex justify-between items-center p-4 border rounded-lg" data-testid={`payout-${payout.id}`}>
                      <div>
                        <p className="font-semibold" data-testid={`text-payout-amount-${payout.id}`}>${payout.amount}</p>
                        <p className="text-sm text-muted-foreground" data-testid={`text-payout-date-${payout.id}`}>
                          {new Date(payout.requestDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge 
                        variant={payout.status === "completed" ? "default" : "secondary"}
                        data-testid={`badge-payout-status-${payout.id}`}
                      >
                        {payout.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Dialog open={payoutDialogOpen} onOpenChange={setPayoutDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Payout</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount ($) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Enter amount"
                          {...field}
                          data-testid="input-payout-amount"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setPayoutDialogOpen(false)}
                    data-testid="button-cancel-payout"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={requestPayoutMutation.isPending}
                    data-testid="button-submit-payout"
                  >
                    {requestPayoutMutation.isPending ? "Submitting..." : "Submit Request"}
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
