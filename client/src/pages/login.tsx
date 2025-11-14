import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "wouter";

export default function Login() {
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const { t } = useTranslation();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const loginMutation = useMutation({
        mutationFn: async () => {
            const response = await apiRequest("POST", "/api/auth/login", {
                email,
                password,
            });
            return await response.json();
        },
        onSuccess: async (loginData: any) => {
            // Fetch user data to check role
            const userResponse = await apiRequest("GET", "/api/auth/user");
            const userData = await userResponse.json();
            queryClient.setQueryData(["/api/auth/user"], userData);

            toast({
                title: t("auth.login_success"),
                description: t("auth.login_success"),
            });

            // Redirect based on user role
            if (userData.role === "admin") {
                setLocation("/admin");
            } else {
                setLocation("/dashboard");
            }
        },
        onError: (error: any) => {
            // Parse error message from API response
            let errorMessage = t("auth.login_failed");

            if (error.message) {
                // Extract JSON from error message (format: "401: {"message":"Invalid email or password"}")
                try {
                    const match = error.message.match(/\{.*\}/);
                    if (match) {
                        const errorData = JSON.parse(match[0]);
                        errorMessage = errorData.message || errorMessage;
                    }
                } catch (e) {
                    // If parsing fails, use the full error message
                    errorMessage = error.message.includes("Invalid")
                        ? error.message.split(": ")[1] || error.message
                        : errorMessage;
                }
            }

            toast({
                title: t("common.error"),
                description: errorMessage,
                variant: "destructive",
            });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        loginMutation.mutate();
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
            <Card className="w-full max-w-md p-8">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                        <svg
                            className="w-10 h-10 text-primary-foreground"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                    </div>
                    <h1
                        className="text-2xl font-bold text-foreground mb-2"
                        data-testid="text-login-title"
                    >
                        {t("auth.login_title")}
                    </h1>
                    <p className="text-muted-foreground">{t("auth.sign_in")}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="email">{t("auth.email")}</Label>
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
                        <Label htmlFor="password">{t("auth.password")}</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
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
                                {showPassword ? (
                                    <EyeOff className="w-4 h-4" />
                                ) : (
                                    <Eye className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={loginMutation.isPending}
                        data-testid="button-login"
                    >
                        {loginMutation.isPending
                            ? t("common.loading")
                            : t("auth.sign_in")}
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm">
                    <p className="text-muted-foreground">
                        {t("auth.no_account")}{" "}
                        <Link href="/register">
                            <span
                                className="text-primary hover:underline cursor-pointer"
                                data-testid="link-register"
                            >
                                {t("auth.sign_up")}
                            </span>
                        </Link>
                    </p>
                </div>
            </Card>
        </div>
    );
}
