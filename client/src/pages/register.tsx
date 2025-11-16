import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useTranslation } from 'react-i18next';
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Eye, EyeOff } from "lucide-react";

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Get redirect parameter from URL to preserve it when switching to login
  const urlParams = new URLSearchParams(window.location.search);
  const redirectParam = urlParams.get('redirect');
  const loginUrl = redirectParam ? `/login?redirect=${encodeURIComponent(redirectParam)}` : '/login';

  const registerMutation = useMutation({
    mutationFn: async () => {
      if (password !== confirmPassword) {
        throw new Error(t('auth.password_mismatch'));
      }
      if (password.length < 6) {
        throw new Error(t('auth.password_too_short'));
      }
      const response = await apiRequest("POST", "/api/auth/register", {
        email,
        password,
        firstName,
        lastName,
      });
      return await response.json();
    },
    onSuccess: async (registerData: any) => {
      // Fetch user data to check role
      const userResponse = await apiRequest("GET", "/api/auth/user");
      const userData = await userResponse.json();
      queryClient.setQueryData(['/api/auth/user'], userData);
      
      toast({
        title: t('auth.register_success'),
        description: t('auth.register_success'),
      });
      
      // Check for redirect parameter in URL
      const urlParams = new URLSearchParams(window.location.search);
      const redirectTo = urlParams.get('redirect');

      if (redirectTo) {
        // Security: Only allow relative paths (prevent open redirect)
        const decodedRedirect = decodeURIComponent(redirectTo);
        if (decodedRedirect.startsWith('/') && !decodedRedirect.startsWith('//')) {
          // Safe relative redirect
          window.location.href = decodedRedirect;
        } else {
          // Unsafe redirect attempt, use default
          if (userData.role === 'admin') {
            setLocation("/admin");
          } else {
            setLocation("/dashboard");
          }
        }
      } else {
        // Default redirect based on user role (new users are typically clients)
        if (userData.role === 'admin') {
          setLocation("/admin");
        } else {
          setLocation("/dashboard");
        }
      }
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.message || t('auth.register_failed'),
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
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-primary-foreground" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2" data-testid="text-register-title">
            {t('auth.register_title')}
          </h1>
          <p className="text-muted-foreground">{t('home.welcome_guest')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">{t('auth.first_name')}</Label>
              <Input
                id="firstName"
                type="text"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                data-testid="input-firstname"
              />
            </div>
            <div>
              <Label htmlFor="lastName">{t('auth.last_name')}</Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                data-testid="input-lastname"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">{t('auth.email')}</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              data-testid="input-email"
            />
          </div>

          <div>
            <Label htmlFor="password">{t('auth.password')}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                data-testid="input-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                data-testid="button-toggle-password"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <Label htmlFor="confirmPassword">{t('auth.confirm_password')}</Label>
            <Input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              data-testid="input-confirm-password"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={registerMutation.isPending}
            data-testid="button-register"
          >
            {registerMutation.isPending ? t('common.loading') : t('auth.sign_up')}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-muted-foreground">
            {t('auth.have_account')}{" "}
            <Link href={loginUrl}>
              <span className="text-primary hover:underline cursor-pointer" data-testid="link-login">
                {t('auth.sign_in')}
              </span>
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}