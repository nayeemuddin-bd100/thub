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

  const { data: cancellations = [], isLoading } = useQuery<Cancellation[]>({
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
  });

  if (isLoading) {
    return <div className="animate-pulse space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-24 bg-muted rounded-lg" />)}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cancellation Requests</CardTitle>
      </CardHeader>
      <CardContent>
        {cancellations.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No cancellation requests</p>
        ) : (
          <div className="space-y-4">
            {cancellations.map((cancellation) => (
              <div key={cancellation.id} className="border rounded-lg p-4" data-testid={`cancellation-${cancellation.id}`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold">Booking: {cancellation.bookingCode || cancellation.bookingId}</p>
                    <p className="text-sm text-muted-foreground">
                      Requested: {new Date(cancellation.requestDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={cancellation.status === "pending" ? "secondary" : "default"}>
                    {cancellation.status}
                  </Badge>
                </div>
                <p className="text-sm mb-3">{cancellation.reason}</p>
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
