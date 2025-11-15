import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

interface ServiceProvider {
  id: string;
  businessName: string;
  approvalStatus: string;
  rating: number | null;
  availability: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface ServiceBooking {
  id: string;
  status: string;
  createdAt: string;
  scheduledDate: string;
  totalAmount: string;
  client: {
    firstName: string;
    lastName: string;
  };
}

interface AssignJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: ServiceBooking;
  providers: ServiceProvider[];
}

export default function AssignJobDialog({
  open,
  onOpenChange,
  booking,
  providers,
}: AssignJobDialogProps) {
  const [selectedProviderId, setSelectedProviderId] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const assignMutation = useMutation({
    mutationFn: async () => {
      if (!selectedProviderId) {
        throw new Error("Please select a provider");
      }

      const response = await apiRequest("POST", "/api/country-manager/assign-job", {
        serviceBookingId: booking.id,
        serviceProviderId: selectedProviderId,
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/country-manager/bookings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/country-manager/stats"] });
      toast({
        title: "Success",
        description: "Job assigned successfully to provider",
      });
      setSelectedProviderId("");
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign job",
        variant: "destructive",
      });
    },
  });

  const availableProviders = providers.filter(
    (p) => p.approvalStatus === "approved" && p.availability === "available"
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Job to Provider</DialogTitle>
          <DialogDescription>
            Select a service provider to assign this job to. The provider will
            receive a notification and can accept or reject the assignment.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Booking Details</label>
            <div className="text-sm text-muted-foreground">
              <p>
                Client: {booking.client.firstName} {booking.client.lastName}
              </p>
              <p>
                Scheduled: {new Date(booking.scheduledDate).toLocaleDateString()}
              </p>
              <p>Amount: ${booking.totalAmount}</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Select Provider</label>
            <Select
              value={selectedProviderId}
              onValueChange={setSelectedProviderId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a provider..." />
              </SelectTrigger>
              <SelectContent>
                {availableProviders.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground text-center">
                    No available providers
                  </div>
                ) : (
                  availableProviders.map((provider) => (
                    <SelectItem key={provider.id} value={provider.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{provider.businessName}</span>
                        {provider.rating && (
                          <span className="text-xs text-muted-foreground ml-2">
                            ⭐ {provider.rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setSelectedProviderId("");
              onOpenChange(false);
            }}
            disabled={assignMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={() => assignMutation.mutate()}
            disabled={!selectedProviderId || assignMutation.isPending}
          >
            {assignMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Assign Job
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
