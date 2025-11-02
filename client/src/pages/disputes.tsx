import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { AlertCircle, Plus } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type Dispute = {
  id: string;
  bookingId: string;
  orderId: string | null;
  description: string;
  status: string;
  createdAt: string;
};

export default function Disputes() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [formData, setFormData] = useState({
    bookingId: "",
    orderId: "",
    description: "",
    itemType: "booking",
  });

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const { data: disputes = [] } = useQuery<Dispute[]>({
    queryKey: ["/api/disputes"],
  });

  const { data: bookings = [] } = useQuery<any[]>({
    queryKey: ["/api/bookings"],
  });

  const { data: orders = [] } = useQuery<any[]>({
    queryKey: ["/api/service-orders"],
  });

  const createDisputeMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
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
      setFormData({ bookingId: "", orderId: "", description: "", itemType: "booking" });
      toast({ title: "Success", description: "Dispute submitted successfully!" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createDisputeMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onToggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Disputes</h1>
            <p className="text-muted-foreground mt-2">Manage and track your dispute cases</p>
          </div>
          <Button onClick={() => setDialogOpen(true)} data-testid="button-create-dispute">
            <Plus className="w-4 h-4 mr-2" />
            File a Dispute
          </Button>
        </div>

        {disputes.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <AlertCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Disputes</h3>
              <p className="text-muted-foreground mb-4">You haven't filed any disputes yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {disputes.map((dispute) => (
              <Card key={dispute.id} data-testid={`card-dispute-${dispute.id}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">
                      Dispute for {dispute.bookingId ? "Booking" : "Order"}
                    </CardTitle>
                    <Badge variant={dispute.status === "pending" ? "secondary" : "default"}>
                      {dispute.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-2">{dispute.description}</p>
                  <p className="text-xs text-muted-foreground">
                    Filed: {new Date(dispute.createdAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>File a Dispute</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Dispute Type *</Label>
                <Select
                  value={formData.itemType}
                  onValueChange={(value) => setFormData({ ...formData, itemType: value, bookingId: "", orderId: "" })}
                >
                  <SelectTrigger data-testid="select-dispute-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="booking">Property Booking</SelectItem>
                    <SelectItem value="order">Service Order</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.itemType === "booking" ? (
                <div>
                  <Label>Select Booking *</Label>
                  <Select
                    value={formData.bookingId}
                    onValueChange={(value) => setFormData({ ...formData, bookingId: value })}
                  >
                    <SelectTrigger data-testid="select-booking">
                      <SelectValue placeholder="Choose a booking" />
                    </SelectTrigger>
                    <SelectContent>
                      {bookings.map((booking) => (
                        <SelectItem key={booking.id} value={booking.id}>
                          {booking.bookingCode || booking.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div>
                  <Label>Select Order *</Label>
                  <Select
                    value={formData.orderId}
                    onValueChange={(value) => setFormData({ ...formData, orderId: value })}
                  >
                    <SelectTrigger data-testid="select-order">
                      <SelectValue placeholder="Choose an order" />
                    </SelectTrigger>
                    <SelectContent>
                      {orders.map((order) => (
                        <SelectItem key={order.id} value={order.id}>
                          {order.orderCode || order.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label>Description *</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your issue in detail..."
                  rows={5}
                  required
                  data-testid="textarea-dispute-description"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createDisputeMutation.isPending} data-testid="button-submit-dispute">
                  {createDisputeMutation.isPending ? "Submitting..." : "Submit Dispute"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Footer />
    </div>
  );
}
