import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { UserCheck, Crown, Home, Briefcase, User } from "lucide-react";

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

export default function RoleSwitcher() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState((user as any)?.role || "client");

  const changeRoleMutation = useMutation({
    mutationFn: async (newRole: string) => {
      await apiRequest("PUT", "/api/auth/change-role", { role: newRole });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: "Role Updated",
        description: `You are now a ${roleConfig[selectedRole as keyof typeof roleConfig]?.label}`,
      });
    },
    onError: (error) => {
      console.error("Role change error:", error);
      toast({
        title: "Error",
        description: "Failed to change role. Please try again.",
        variant: "destructive",
      });
    },
  });

  const currentRoleConfig = roleConfig[(user as any)?.role as keyof typeof roleConfig] || roleConfig.client;
  const CurrentRoleIcon = currentRoleConfig.icon;

  const handleRoleChange = () => {
    if (selectedRole !== (user as any)?.role) {
      changeRoleMutation.mutate(selectedRole);
    }
  };

  if (!user) return null;

  return (
    <Card className="p-6 bg-card border-border" data-testid="card-role-switcher">
      <div className="flex items-center gap-4 mb-4">
        <div className={`p-3 rounded-lg ${currentRoleConfig.color}`}>
          <CurrentRoleIcon className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Current Role</h3>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" data-testid="badge-current-role">
              {currentRoleConfig.label}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {currentRoleConfig.description}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Switch to Role:
          </label>
          <Select value={selectedRole} onValueChange={setSelectedRole}>
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

        <Button
          onClick={handleRoleChange}
          disabled={selectedRole === (user as any)?.role || changeRoleMutation.isPending}
          className="w-full"
          data-testid="button-change-role"
        >
          <UserCheck className="w-4 h-4 mr-2" />
          {changeRoleMutation.isPending ? "Updating..." : "Update Role"}
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