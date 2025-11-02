import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Check, X } from "lucide-react";

type Cancellation = {
  id: string;
  bookingId: string;
  userId: string;
  reason: string;
  status: string;
  requestDate: string;
  bookingCode?: string;
};

export default function CancellationManagement() {
  const { toast } = useToast();

  const { data: cancellations = [], isLoading, error } = useQuery<Cancellation[]>({
    queryKey: ["/api/admin/cancellations"],
  });

  const updateCancellationMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/admin/cancellations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update cancellation");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/cancellations"] });
      toast({ title: "Success", description: "Cancellation status updated!" });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to update cancellation status.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4" data-testid="loading-cancellations">
        {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-muted rounded-lg" data-testid={`skeleton-cancellation-${i}`} />)}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-destructive" data-testid="error-cancellations">
            Failed to load cancellation requests. Please try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle data-testid="heading-cancellation-management">Cancellation Requests</CardTitle>
      </CardHeader>
      <CardContent>
        {cancellations.length === 0 ? (
          <p className="text-center text-muted-foreground py-8" data-testid="empty-cancellations">
            No cancellation requests
          </p>
        ) : (
          <div className="space-y-4">
            {cancellations.map((cancellation) => (
              <div key={cancellation.id} className="border rounded-lg p-4" data-testid={`cancellation-${cancellation.id}`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold" data-testid={`text-booking-${cancellation.id}`}>
                      Booking: {cancellation.bookingCode || cancellation.bookingId}
                    </p>
                    <p className="text-sm text-muted-foreground" data-testid={`text-date-${cancellation.id}`}>
                      Requested: {new Date(cancellation.requestDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge 
                    variant={cancellation.status === "pending" ? "secondary" : "default"}
                    data-testid={`badge-status-${cancellation.id}`}
                  >
                    {cancellation.status}
                  </Badge>
                </div>
                <p className="text-sm mb-3" data-testid={`text-reason-${cancellation.id}`}>{cancellation.reason}</p>
                {cancellation.status === "pending" && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateCancellationMutation.mutate({ id: cancellation.id, status: "approved" })}
                      data-testid={`button-approve-${cancellation.id}`}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => updateCancellationMutation.mutate({ id: cancellation.id, status: "rejected" })}
                      data-testid={`button-reject-${cancellation.id}`}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
