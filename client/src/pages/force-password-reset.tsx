import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation, useRoute, Redirect } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Key, Eye, EyeOff } from "lucide-react";

export default function ForcePasswordReset() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [, params] = useRoute("/force-password-reset/:userId");
  const [showTempPassword, setShowTempPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    temporaryPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest("POST", "/api/auth/force-password-reset", {
        userId: params?.userId,
        temporaryPassword: data.temporaryPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Password changed successfully. Redirecting to dashboard...",
      });
      // Redirect based on role
      setTimeout(() => {
        if (data.user?.role === "admin") {
          navigate("/admin");
        } else if (data.user?.role === "billing") {
          navigate("/billing-dashboard");
        } else if (data.user?.role === "operation") {
          navigate("/operation-dashboard");
        } else if (data.user?.role === "marketing") {
          navigate("/marketing-dashboard");
        } else if (data.user?.role === "support") {
          navigate("/dashboard");
        } else if (data.user?.role === "country_manager") {
          navigate("/dashboard");
        } else if (data.user?.role === "city_manager") {
          navigate("/dashboard");
        } else {
          navigate("/dashboard");
        }
      }, 1000);
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

    if (!formData.temporaryPassword || !formData.newPassword || !formData.confirmPassword) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (formData.newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }

    resetPasswordMutation.mutate(formData);
  };

  if (!params?.userId) {
    return <Redirect to="/login" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-yellow-100 rounded-full">
              <Key className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Change Your Password</CardTitle>
          <CardDescription>
            For security reasons, you must change your temporary password before continuing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-yellow-900 text-sm mb-1">Password Requirements</h4>
                <ul className="text-xs text-yellow-800 space-y-1">
                  <li>• At least 8 characters long</li>
                  <li>• Mix of letters, numbers, and special characters recommended</li>
                  <li>• Cannot be the same as your temporary password</li>
                </ul>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="temporaryPassword">Temporary Password</Label>
              <div className="relative">
                <Input
                  id="temporaryPassword"
                  type={showTempPassword ? "text" : "password"}
                  placeholder="Enter your temporary password"
                  value={formData.temporaryPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, temporaryPassword: e.target.value })
                  }
                  required
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowTempPassword(!showTempPassword)}
                >
                  {showTempPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter your new password"
                  value={formData.newPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, newPassword: e.target.value })
                  }
                  required
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your new password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  required
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={resetPasswordMutation.isPending}
            >
              {resetPasswordMutation.isPending ? "Changing Password..." : "Change Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
