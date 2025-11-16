import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Building2, Briefcase } from "lucide-react";

export default function WorkWithUs() {
    const { t } = useTranslation();
    const [, setLocation] = useLocation();
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        role: "",
        firstName: "",
        lastName: "",
        businessName: "",
        phone: "",
        businessAddress: "",
        taxLicense: "",
        bio: "",
        certifications: "",
        portfolio: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const registerMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            const res = await fetch("/api/auth/register-work-with-us", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: data.email,
                    password: data.password,
                    role: data.role,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    businessName: data.businessName,
                    phone: data.phone,
                    businessAddress: data.businessAddress,
                    taxLicense: data.taxLicense,
                    bio: data.bio,
                    certifications: data.certifications
                        ? data.certifications.split(",").map((c) => c.trim())
                        : undefined,
                    portfolio: data.portfolio
                        ? data.portfolio.split(",").map((p) => p.trim())
                        : undefined,
                }),
                credentials: "include",
            });

            if (!res.ok) {
                const error = await res.text();
                throw new Error(error || "Registration failed");
            }

            return res.json();
        },
        onSuccess: (data: any) => {
            toast({
                title: "Application Submitted",
                description: data.message || "Your application has been submitted successfully. You will receive an email once approved.",
            });
            setLocation("/login");
        },
        onError: (error: Error) => {
            toast({
                title: t("auth.registration_failed"),
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.role) {
            toast({
                title: t("common.error"),
                description: "Please select a role",
                variant: "destructive",
            });
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            toast({
                title: t("auth.password_mismatch"),
                description: t("auth.passwords_do_not_match"),
                variant: "destructive",
            });
            return;
        }

        if (formData.password.length < 8) {
            toast({
                title: t("common.error"),
                description: "Password must be at least 8 characters",
                variant: "destructive",
            });
            return;
        }

        registerMutation.mutate(formData);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
            <Card className="w-full max-w-2xl p-8">
                <div className="text-center mb-8">
                    <Building2 className="w-16 h-16 mx-auto text-primary mb-4" />
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                        Work With Us
                    </h1>
                    {!formData.role ? (
                        <p className="text-muted-foreground">
                            Join our team as a City Manager, Host, or Service Provider
                        </p>
                    ) : (
                        <p className="text-muted-foreground">
                            {formData.role === "city_manager" && 
                                "Manage operations and approve hosts & service providers in your city"}
                            {formData.role === "property_owner" && 
                                "List your properties and welcome travelers from around the world"}
                            {formData.role === "service_provider" && 
                                "Offer tours, activities, and services to enhance traveler experiences"}
                        </p>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Role Selection */}
                    <div>
                        <Label htmlFor="role">
                            Select Your Role <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            value={formData.role}
                            onValueChange={(value) =>
                                setFormData({ ...formData, role: value })
                            }
                        >
                            <SelectTrigger data-testid="select-role">
                                <SelectValue placeholder="Choose a role..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="city_manager">
                                    City Manager
                                </SelectItem>
                                <SelectItem value="property_owner">
                                    Host (Property Owner)
                                </SelectItem>
                                <SelectItem value="service_provider">
                                    Service Provider
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                                id="firstName"
                                value={formData.firstName}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        firstName: e.target.value,
                                    })
                                }
                                data-testid="input-firstName"
                            />
                        </div>
                        <div>
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                                id="lastName"
                                value={formData.lastName}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        lastName: e.target.value,
                                    })
                                }
                                data-testid="input-lastName"
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <Label htmlFor="email">
                            Email <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                                setFormData({ ...formData, email: e.target.value })
                            }
                            required
                            data-testid="input-email"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <Label htmlFor="password">
                            Password <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={formData.password}
                                onChange={(e) =>
                                    setFormData({ ...formData, password: e.target.value })
                                }
                                required
                                data-testid="input-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                {showPassword ? (
                                    <EyeOff className="w-4 h-4" />
                                ) : (
                                    <Eye className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <Label htmlFor="confirmPassword">
                            Confirm Password <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                            <Input
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                value={formData.confirmPassword}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        confirmPassword: e.target.value,
                                    })
                                }
                                required
                                data-testid="input-confirmPassword"
                            />
                            <button
                                type="button"
                                onClick={() =>
                                    setShowConfirmPassword(!showConfirmPassword)
                                }
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="w-4 h-4" />
                                ) : (
                                    <Eye className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Role-Specific Information */}
                    {formData.role && (
                        <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Briefcase className="w-5 h-5" />
                                {formData.role === "city_manager" && "Management Information"}
                                {formData.role === "property_owner" && "Property & Business Information"}
                                {formData.role === "service_provider" && "Service Provider Information"}
                            </h3>

                            <div className="space-y-4">
                                {/* Common Fields for All Roles */}
                                <div>
                                    <Label htmlFor="phone">
                                        Phone Number <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                phone: e.target.value,
                                            })
                                        }
                                        placeholder="+1 (555) 123-4567"
                                        required
                                        data-testid="input-phone"
                                    />
                                </div>

                                {/* City Manager Specific Fields */}
                                {formData.role === "city_manager" && (
                                    <>
                                        <div>
                                            <Label htmlFor="businessAddress">
                                                City/Region You'll Manage <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="businessAddress"
                                                value={formData.businessAddress}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        businessAddress: e.target.value,
                                                    })
                                                }
                                                placeholder="e.g., New York, NY"
                                                required
                                                data-testid="input-businessAddress"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="bio">
                                                Management Experience <span className="text-red-500">*</span>
                                            </Label>
                                            <Textarea
                                                id="bio"
                                                value={formData.bio}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        bio: e.target.value,
                                                    })
                                                }
                                                rows={4}
                                                placeholder="Describe your experience in property/hospitality management, team leadership, and relevant skills..."
                                                required
                                                data-testid="input-bio"
                                            />
                                        </div>
                                    </>
                                )}

                                {/* Property Owner (Host) Specific Fields */}
                                {formData.role === "property_owner" && (
                                    <>
                                        <div>
                                            <Label htmlFor="businessName">
                                                Property/Business Name
                                            </Label>
                                            <Input
                                                id="businessName"
                                                value={formData.businessName}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        businessName: e.target.value,
                                                    })
                                                }
                                                placeholder="e.g., Sunset Villa Rentals"
                                                data-testid="input-businessName"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="businessAddress">
                                                Property Location <span className="text-red-500">*</span>
                                            </Label>
                                            <Textarea
                                                id="businessAddress"
                                                value={formData.businessAddress}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        businessAddress: e.target.value,
                                                    })
                                                }
                                                rows={2}
                                                placeholder="Main property address or location"
                                                required
                                                data-testid="input-businessAddress"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="taxLicense">
                                                Tax License / Registration Number
                                            </Label>
                                            <Input
                                                id="taxLicense"
                                                value={formData.taxLicense}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        taxLicense: e.target.value,
                                                    })
                                                }
                                                placeholder="Business registration or tax ID"
                                                data-testid="input-taxLicense"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="bio">
                                                About Your Property/Properties <span className="text-red-500">*</span>
                                            </Label>
                                            <Textarea
                                                id="bio"
                                                value={formData.bio}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        bio: e.target.value,
                                                    })
                                                }
                                                rows={4}
                                                placeholder="Describe your property types (apartment, villa, etc.), number of properties, amenities, and hosting experience..."
                                                required
                                                data-testid="input-bio"
                                            />
                                        </div>
                                    </>
                                )}

                                {/* Service Provider Specific Fields */}
                                {formData.role === "service_provider" && (
                                    <>
                                        <div>
                                            <Label htmlFor="businessName">
                                                Business/Company Name
                                            </Label>
                                            <Input
                                                id="businessName"
                                                value={formData.businessName}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        businessName: e.target.value,
                                                    })
                                                }
                                                placeholder="e.g., ABC Tour Services"
                                                data-testid="input-businessName"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="businessAddress">
                                                Service Area/Location <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="businessAddress"
                                                value={formData.businessAddress}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        businessAddress: e.target.value,
                                                    })
                                                }
                                                placeholder="Cities/regions where you provide services"
                                                required
                                                data-testid="input-businessAddress"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="certifications">
                                                Certifications & Licenses
                                            </Label>
                                            <Input
                                                id="certifications"
                                                value={formData.certifications}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        certifications: e.target.value,
                                                    })
                                                }
                                                placeholder="e.g., Licensed Tour Guide, Certified Chef, Licensed Driver"
                                                data-testid="input-certifications"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="portfolio">
                                                Portfolio/Website Links
                                            </Label>
                                            <Input
                                                id="portfolio"
                                                value={formData.portfolio}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        portfolio: e.target.value,
                                                    })
                                                }
                                                placeholder="Website, Instagram, or portfolio links (comma-separated)"
                                                data-testid="input-portfolio"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="bio">
                                                Service Description & Experience <span className="text-red-500">*</span>
                                            </Label>
                                            <Textarea
                                                id="bio"
                                                value={formData.bio}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        bio: e.target.value,
                                                    })
                                                }
                                                rows={4}
                                                placeholder="Describe the services you offer (tours, transportation, activities, etc.), your experience, and what makes you unique..."
                                                required
                                                data-testid="input-bio"
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={registerMutation.isPending}
                        data-testid="button-submit"
                    >
                        {registerMutation.isPending
                            ? "Submitting..."
                            : "Submit Application"}
                    </Button>

                    <p className="text-sm text-center text-muted-foreground">
                        Your application will be reviewed and you'll receive approval
                        notification via email.
                    </p>

                    <div className="text-center text-sm">
                        <p className="text-muted-foreground">
                            Already have an account?{" "}
                            <a
                                href="/"
                                className="text-primary hover:underline cursor-pointer"
                            >
                                Sign In
                            </a>
                        </p>
                    </div>
                </form>
            </Card>
        </div>
    );
}
