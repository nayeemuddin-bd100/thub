import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { UserCheck, Crown, Home, Briefcase, User, Clock, XCircle, AlertCircle } from "lucide-react";

const roleConfig = {
  client: {
    label: "Client",
    description: "Book properties and services",
    icon: User,
    color: "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
  },
  property_owner: {
    label: "Property Owner",
    description: "Manage and list properties",
    icon: Home,
    color: "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300"
  },
  service_provider: {
    label: "Service Provider",
    description: "Offer travel services",
    icon: Briefcase,
    color: "bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300"
  },
  admin: {
    label: "Admin",
    description: "Platform administration",
    icon: Crown,
    color: "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300"
  }
};

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
  const [selectedRole, setSelectedRole] = useState((user as any)?.role || "client");
  const [requestNote, setRequestNote] = useState("");

  // Only show for eligible roles
  const eligibleRoles = ["client", "property_owner", "service_provider"];
  const userRole = (user as any)?.role;
  
  // Fetch pending/latest role change request
  const { data: roleChangeRequest, isLoading: loadingRequest } = useQuery<RoleChangeRequest | null>({
    queryKey: ['/api/my-role-change-request'],
    enabled: !!user && eligibleRoles.includes(userRole),
  });

  const submitRequestMutation = useMutation({
    mutationFn: async (data: { requestedRole: string; requestNote?: string }) => {
      await apiRequest("POST", "/api/role-change-request", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/my-role-change-request'] });
      setRequestNote("");
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

  const currentRoleConfig = roleConfig[userRole as keyof typeof roleConfig] || roleConfig.client;
  const CurrentRoleIcon = currentRoleConfig.icon;

  const handleSubmitRequest = () => {
    if (selectedRole !== userRole) {
      submitRequestMutation.mutate({
        requestedRole: selectedRole,
        requestNote: requestNote.trim() || undefined,
      });
    }
  };

  // Hide component for non-eligible roles
  if (!user || !eligibleRoles.includes(userRole)) return null;

  const hasPendingRequest = roleChangeRequest?.status === "pending";
  const hasRejectedRequest = roleChangeRequest?.status === "rejected";

  return (
    <Card className="p-6 bg-card border-border" data-testid="card-role-switcher">
      <div className="flex items-center gap-4 mb-4">
        <div className={`p-3 rounded-lg ${currentRoleConfig.color}`}>
          <CurrentRoleIcon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">Current Role</h3>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" data-testid="badge-current-role">
              {currentRoleConfig.label}
            </Badge>
            {hasPendingRequest && (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                <Clock className="w-3 h-3 mr-1" />
                Request Pending
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {currentRoleConfig.description}
          </p>
        </div>
      </div>

      {hasPendingRequest && (
        <Alert className="mb-4 bg-yellow-50 border-yellow-200">
          <AlertCircle className="h-4 w-4 text-yellow-700" />
          <AlertDescription className="text-yellow-800">
            Your request to become a <strong>{roleConfig[roleChangeRequest?.requestedRole as keyof typeof roleConfig]?.label}</strong> is pending admin approval.
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

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Request Role Change:
          </label>
          <Select 
            value={selectedRole} 
            onValueChange={setSelectedRole}
            disabled={hasPendingRequest}
          >
            <SelectTrigger data-testid="select-role">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="client" data-testid="select-item-client">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Client
                </div>
              </SelectItem>
              <SelectItem value="property_owner" data-testid="select-item-property-owner">
                <div className="flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  Property Owner
                </div>
              </SelectItem>
              <SelectItem value="service_provider" data-testid="select-item-service-provider">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Service Provider
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {!hasPendingRequest && (
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Reason for Request (Optional):
            </label>
            <Textarea
              placeholder="Tell us why you want to change your role..."
              value={requestNote}
              onChange={(e) => setRequestNote(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
        )}

        <Button
          onClick={handleSubmitRequest}
          disabled={selectedRole === userRole || hasPendingRequest || submitRequestMutation.isPending}
          className="w-full"
          data-testid="button-change-role"
        >
          <UserCheck className="w-4 h-4 mr-2" />
          {submitRequestMutation.isPending ? "Submitting..." : "Submit Request"}
        </Button>
      </div>

      <div className="mt-4 p-4 bg-muted/50 rounded-lg">
        <h4 className="text-sm font-medium text-foreground mb-2">Role Benefits:</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          {selectedRole === 'client' && (
            <>
              <li>• Browse and book properties</li>
              <li>• Add services to bookings</li>
              <li>• Leave reviews and ratings</li>
            </>
          )}
          {selectedRole === 'property_owner' && (
            <>
              <li>• List and manage properties</li>
              <li>• Set pricing and availability</li>
              <li>• Respond to booking requests</li>
            </>
          )}
          {selectedRole === 'service_provider' && (
            <>
              <li>• Offer travel services</li>
              <li>• Manage service bookings</li>
              <li>• Set rates and availability</li>
            </>
          )}
        </ul>
      </div>
    </Card>
  );
}