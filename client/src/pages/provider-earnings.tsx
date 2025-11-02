import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { DollarSign, TrendingUp, Calendar, CreditCard } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type Payout = {
  id: string;
  amount: string;
  status: string;
  requestDate: string;
};

export default function ProviderEarnings() {
  const { toast } = useToast();
  const [payoutDialogOpen, setPayoutDialogOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const { data: earnings } = useQuery<{ total: number; thisMonth: number; thisWeek: number }>({
    queryKey: ["/api/provider/earnings"],
  });

  const { data: payouts = [] } = useQuery<Payout[]>({
    queryKey: ["/api/provider/payouts"],
  });

  const requestPayoutMutation = useMutation({
    mutationFn: async (amount: string) => {
      const res = await fetch("/api/provider/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to request payout");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/provider/payouts"] });
      setPayoutDialogOpen(false);
      setPayoutAmount("");
      toast({ title: "Success", description: "Payout request submitted!" });
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Header onToggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Earnings & Payouts</h1>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
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

          <Card>
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

          <Card>
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

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Payout History</h2>
          <Button onClick={() => setPayoutDialogOpen(true)} data-testid="button-request-payout">
            <CreditCard className="w-4 h-4 mr-2" />
            Request Payout
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            {payouts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No payout requests yet
              </div>
            ) : (
              <div className="space-y-4">
                {payouts.map((payout) => (
                  <div key={payout.id} className="flex justify-between items-center p-4 border rounded-lg" data-testid={`payout-${payout.id}`}>
                    <div>
                      <p className="font-semibold">${payout.amount}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(payout.requestDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={payout.status === "completed" ? "default" : "secondary"}>
                      {payout.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={payoutDialogOpen} onOpenChange={setPayoutDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Payout</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Amount ($)</Label>
                <Input
                  type="number"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  placeholder="Enter amount"
                  data-testid="input-payout-amount"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setPayoutDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => requestPayoutMutation.mutate(payoutAmount)}
                  disabled={!payoutAmount || requestPayoutMutation.isPending}
                  data-testid="button-submit-payout"
                >
                  {requestPayoutMutation.isPending ? "Submitting..." : "Submit Request"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Footer />
    </div>
  );
}
