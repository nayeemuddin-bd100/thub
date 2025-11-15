import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Home, Briefcase, Clock, XCircle, AlertCircle } from "lucide-react";

interface RoleChangeRequest {
  id: string;
  requestedRole: string;
  status: "pending" | "approved" | "rejected";
  requestNote?: string;
  adminNote?: string;
  requestedAt: string;
  reviewedAt?: string;
}

export default function RoleSwitcher() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const userRole = (user as any)?.role;
  
  // Only show for clients
  if (!user || userRole !== "client") return null;
  
  // Fetch pending/latest role change request
  const { data: roleChangeRequest } = useQuery<RoleChangeRequest | null>({
    queryKey: ['/api/my-role-change-request'],
    queryFn: async () => {
      const response = await fetch('/api/my-role-change-request', { credentials: 'include' });
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Failed to fetch role change request');
      }
      return response.json();
    },
    enabled: !!user,
  });

  const submitRequestMutation = useMutation({
    mutationFn: async (requestedRole: string) => {
      await apiRequest("POST", "/api/role-change-request", { requestedRole });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/my-role-change-request'] });
      toast({
        title: "Request Submitted",
        description: "Your role change request has been submitted for admin approval.",
      });
    },
    onError: (error: any) => {
      console.error("Role change request error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit role change request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const hasPendingRequest = roleChangeRequest?.status === "pending";
  const hasRejectedRequest = roleChangeRequest?.status === "rejected";

  const handleBecomeHost = () => {
    submitRequestMutation.mutate("property_owner");
  };

  const handleBecomeProvider = () => {
    submitRequestMutation.mutate("service_provider");
  };

  return (
    <Card className="p-6 bg-card border-border" data-testid="card-role-switcher">
      <div className="mb-4">
        <h3 className="font-semibold text-foreground text-lg">Expand Your Role</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Want to list properties or offer services? Request additional roles below.
        </p>
      </div>

      {hasPendingRequest && (
        <Alert className="mb-4 bg-yellow-50 border-yellow-200">
          <AlertCircle className="h-4 w-4 text-yellow-700" />
          <AlertDescription className="text-yellow-800">
            Your request to become a <strong>{roleChangeRequest?.requestedRole === 'property_owner' ? 'Property Owner' : 'Service Provider'}</strong> is pending admin approval.
          </AlertDescription>
        </Alert>
      )}

      {hasRejectedRequest && (
        <Alert className="mb-4 bg-red-50 border-red-200">
          <XCircle className="h-4 w-4 text-red-700" />
          <AlertDescription className="text-red-800">
            Your previous role change request was rejected. 
            {roleChangeRequest?.adminNote && (
              <p className="mt-1 text-sm"><strong>Reason:</strong> {roleChangeRequest.adminNote}</p>
            )}
            You can submit a new request below.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Become Host */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950">
              <Home className="w-5 h-5 text-green-700 dark:text-green-300" />
            </div>
            <div>
              <h4 className="font-medium text-foreground">Property Owner</h4>
              <p className="text-xs text-muted-foreground">List and manage properties</p>
            </div>
          </div>
          <ul className="text-xs text-muted-foreground space-y-1 mb-3">
            <li>• List unlimited properties</li>
            <li>• Set pricing and availability</li>
            <li>• Manage bookings</li>
          </ul>
          <Button
            onClick={handleBecomeHost}
            disabled={hasPendingRequest || submitRequestMutation.isPending}
            className="w-full"
            variant="default"
            data-testid="button-become-host"
          >
            {hasPendingRequest && roleChangeRequest?.requestedRole === 'property_owner' ? (
              <>
                <Clock className="w-4 h-4 mr-2" />
                Pending Approval
              </>
            ) : (
              <>
                <Home className="w-4 h-4 mr-2" />
                {submitRequestMutation.isPending ? "Submitting..." : "Become Host"}
              </>
            )}
          </Button>
        </div>

        {/* Become Provider */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950">
              <Briefcase className="w-5 h-5 text-purple-700 dark:text-purple-300" />
            </div>
            <div>
              <h4 className="font-medium text-foreground">Service Provider</h4>
              <p className="text-xs text-muted-foreground">Offer travel services</p>
            </div>
          </div>
          <ul className="text-xs text-muted-foreground space-y-1 mb-3">
            <li>• Offer professional services</li>
            <li>• Set your rates</li>
            <li>• Build your reputation</li>
          </ul>
          <Button
            onClick={handleBecomeProvider}
            disabled={hasPendingRequest || submitRequestMutation.isPending}
            className="w-full"
            variant="default"
            data-testid="button-become-provider"
          >
            {hasPendingRequest && roleChangeRequest?.requestedRole === 'service_provider' ? (
              <>
                <Clock className="w-4 h-4 mr-2" />
                Pending Approval
              </>
            ) : (
              <>
                <Briefcase className="w-4 h-4 mr-2" />
                {submitRequestMutation.isPending ? "Submitting..." : "Become Provider"}
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}