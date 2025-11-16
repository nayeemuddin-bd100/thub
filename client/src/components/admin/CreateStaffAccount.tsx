import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Mail, User, Briefcase, DollarSign, Settings, Key, RefreshCw, Eye, EyeOff, RotateCcw } from "lucide-react";

interface StaffMember {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  status: string;
  createdAt: string;
}

const roleConfig = {
  billing: {
    label: "Billing",
    icon: DollarSign,
    color: "text-green-600 bg-green-50",
    description: "Manages payments, invoices, and financial operations"
  },
  operation: {
    label: "Operation",
    icon: Settings,
    color: "text-blue-600 bg-blue-50",
    description: "Oversees day-to-day operations and processes"
  },
  marketing: {
    label: "Marketing",
    icon: Briefcase,
    color: "text-purple-600 bg-purple-50",
    description: "Handles marketing campaigns and promotions"
  },
  support: {
    label: "Support",
    icon: User,
    color: "text-orange-600 bg-orange-50",
    description: "Provides customer support and handles user inquiries"
  },
};

export default function CreateStaffAccount() {
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [createdPassword, setCreatedPassword] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [resetPassword, setResetPassword] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    role: "billing" as "billing" | "operation" | "marketing" | "support",
    password: "",
  });

  const { data: users } = useQuery<StaffMember[]>({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const response = await fetch("/api/admin/users", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch users");
      return response.json();
    },
  });

  const staffMembers = users?.filter(
    (user) => ["billing", "operation", "marketing", "support"].includes(user.role)
  ) || [];

  const generateSecurePassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    const charsetLength = charset.length;
    let password = "";
    
    // Use rejection sampling to eliminate modulo bias
    const max = 0x100000000; // 2^32
    const threshold = max - (max % charsetLength);
    
    while (password.length < length) {
      // Generate a fresh random value each iteration
      const randomValue = crypto.getRandomValues(new Uint32Array(1))[0];
      
      // Accept only values below threshold to avoid bias
      if (randomValue < threshold) {
        password += charset.charAt(randomValue % charsetLength);
      }
      // If rejected, the loop continues and generates a new random value
    }
    
    return password;
  };

  const handleAutoGeneratePassword = () => {
    const newPassword = generateSecurePassword();
    setFormData({ ...formData, password: newPassword });
  };

  const createStaffMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest("POST", "/api/admin/create-staff", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setCreatedPassword(formData.password);
      setShowPasswordModal(true);
      setCreateDialogOpen(false);
      setFormData({
        email: "",
        firstName: "",
        lastName: "",
        role: "billing",
        password: "",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create staff account.",
        variant: "destructive",
      });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ userId, password }: { userId: string; password: string }) => {
      return await apiRequest("POST", `/api/admin/reset-password/${userId}`, { password });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Success",
        description: "Password has been reset successfully",
      });
      setResetPasswordDialogOpen(false);
      setSelectedStaffId(null);
      setResetPassword("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reset password",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.firstName || !formData.role) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    if (!formData.password || formData.password.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }
    createStaffMutation.mutate(formData);
  };

  const handleResetPassword = () => {
    if (!selectedStaffId || !resetPassword || resetPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }
    resetPasswordMutation.mutate({ userId: selectedStaffId, password: resetPassword });
  };

  const openResetPasswordDialog = (staffId: string) => {
    setSelectedStaffId(staffId);
    setResetPassword(generateSecurePassword());
    setResetPasswordDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Internal Staff Management</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Create and manage internal staff accounts (Billing, Operation, Marketing)
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Create Staff Account
        </Button>
      </div>

      {/* Staff Members List */}
      <div className="grid gap-4">
        {staffMembers.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-muted-foreground">
              <UserPlus className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No internal staff accounts yet</p>
              <p className="text-sm mt-2">Create your first staff account to get started</p>
            </div>
          </Card>
        ) : (
          staffMembers.map((member) => {
            const config = roleConfig[member.role as keyof typeof roleConfig];
            const Icon = config?.icon || User;
            
            return (
              <Card key={member.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${config?.color || 'bg-gray-100'}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {member.firstName} {member.lastName}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{member.email}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        {config?.description}
                      </p>
                      <div className="flex gap-2 mt-3">
                        <Badge className={config?.color}>
                          {config?.label || member.role}
                        </Badge>
                        <Badge variant="outline">
                          {member.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <div className="text-sm text-muted-foreground">
                      Created: {new Date(member.createdAt).toLocaleDateString()}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openResetPasswordDialog(member.id)}
                      className="flex items-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Reset Password
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Create Staff Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Internal Staff Account</DialogTitle>
            <DialogDescription>
              Create a new account for billing, operation, or marketing staff. 
              Set a temporary password that the staff member must change on first login.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="staff@travelhub.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                type="text"
                placeholder="John"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Doe"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Temporary Password *</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter temporary password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAutoGeneratePassword}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Generate
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Staff member will be required to change this password on first login.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select
                value={formData.role}
                onValueChange={(value: any) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(roleConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <config.icon className="w-4 h-4" />
                        <span>{config.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.role && (
                <p className="text-xs text-muted-foreground">
                  {roleConfig[formData.role].description}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createStaffMutation.isPending}>
                {createStaffMutation.isPending ? "Creating..." : "Create Account"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Password Display Modal */}
      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Staff Account Created Successfully</DialogTitle>
            <DialogDescription>
              Save this temporary password now. It will not be shown again.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Key className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-yellow-900 mb-1">Important</h4>
                  <p className="text-sm text-yellow-800">
                    This is the only time this password will be displayed. 
                    The staff member must change it on first login.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Temporary Password</Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={createdPassword || ""}
                  readOnly
                  className="font-mono text-lg"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (createdPassword) {
                      navigator.clipboard.writeText(createdPassword);
                      toast({
                        title: "Copied",
                        description: "Password copied to clipboard",
                      });
                    }
                  }}
                >
                  Copy
                </Button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-900">
                Please share this password with the staff member manually. They will be required to change it on first login.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => {
                setShowPasswordModal(false);
                setCreatedPassword(null);
                toast({
                  title: "Success",
                  description: "Staff account created successfully",
                });
              }}
            >
              I've Saved the Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={resetPasswordDialogOpen} onOpenChange={setResetPasswordDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Reset Staff Password</DialogTitle>
            <DialogDescription>
              Generate a new temporary password for this staff member. They will be required to change it on next login.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-password">New Temporary Password *</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="reset-password"
                    type={showResetPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={resetPassword}
                    onChange={(e) => setResetPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowResetPassword(!showResetPassword)}
                  >
                    {showResetPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setResetPassword(generateSecurePassword())}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Generate
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Password must be at least 8 characters long. Staff member will be required to change it on next login.
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-900">
                Please share this password with the staff member manually.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setResetPasswordDialogOpen(false);
                setSelectedStaffId(null);
                setResetPassword("");
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleResetPassword}
              disabled={resetPasswordMutation.isPending}
            >
              {resetPasswordMutation.isPending ? "Resetting..." : "Reset Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
