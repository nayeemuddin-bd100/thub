import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useTranslation } from 'react-i18next';
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Eye, EyeOff, Building2 } from "lucide-react";

export default function RegisterHost() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useTranslation();
  
  // Basic fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Host-specific fields (all optional)
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [taxLicense, setTaxLicense] = useState("");
  const [bio, setBio] = useState("");

  const registerMutation = useMutation({
    mutationFn: async () => {
      if (password !== confirmPassword) {
        throw new Error(t('auth.password_mismatch'));
      }
      if (password.length < 6) {
        throw new Error(t('auth.password_too_short'));
      }
      const response = await apiRequest("POST", "/api/auth/register-host", {
        email,
        password,
        firstName,
        lastName,
        businessName: businessName || undefined,
        phone: phone || undefined,
        businessAddress: businessAddress || undefined,
        taxLicense: taxLicense || undefined,
        bio: bio || undefined,
      });
      return await response.json();
    },
    onSuccess: async () => {
      // Fetch user data to check role
      const userResponse = await apiRequest("GET", "/api/auth/user");
      const userData = await userResponse.json();
      queryClient.setQueryData(['/api/auth/user'], userData);
      
      toast({
        title: "Host Account Created!",
        description: "You can now list your properties and start earning.",
      });
      
      setLocation("/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.message || "Failed to create host account",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-2xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2" data-testid="text-register-host-title">
            Register as a Host
          </h1>
          <p className="text-muted-foreground">List your properties and start earning</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">{t('auth.first_name')} *</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">{t('auth.last_name')} *</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="email">{t('auth.email')} *</Label>
            <Input
              id="email"
              type="email"
              placeholder="host@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="password">{t('auth.password')} *</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <Label htmlFor="confirmPassword">{t('auth.confirm_password')} *</Label>
            <Input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {/* Host-Specific Information */}
          <div className="border-t pt-4 mt-6">
            <h3 className="text-lg font-semibold mb-3">Host Profile (Optional)</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  type="text"
                  placeholder="Your Property Business Name"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="businessAddress">Business Address</Label>
                <Textarea
                  id="businessAddress"
                  placeholder="123 Main St, City, State, ZIP"
                  rows={2}
                  value={businessAddress}
                  onChange={(e) => setBusinessAddress(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="taxLicense">Tax/License Number</Label>
                <Input
                  id="taxLicense"
                  type="text"
                  placeholder="Business license or tax ID"
                  value={taxLicense}
                  onChange={(e) => setTaxLicense(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="bio">Bio/Description</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell guests about yourself and your properties..."
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={registerMutation.isPending}
            data-testid="button-register-host"
          >
            {registerMutation.isPending ? t('common.loading') : "Create Host Account"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm space-y-2">
          <p className="text-muted-foreground">
            {t('auth.have_account')}{" "}
            <Link href="/login">
              <span className="text-primary hover:underline cursor-pointer">
                {t('auth.sign_in')}
              </span>
            </Link>
          </p>
          <p className="text-muted-foreground">
            Want to register as a client?{" "}
            <Link href="/register">
              <span className="text-primary hover:underline cursor-pointer">
                Client Registration
              </span>
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
