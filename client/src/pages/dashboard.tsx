import Footer from "@/components/Footer";
import Header from "@/components/Header";
import RoleSwitcher from "@/components/RoleSwitcher";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Booking, type ServiceCategory, type User } from "@shared/schema";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
    Award,
    Bell,
    Building,
    Calendar,
    Check,
    DollarSign,
    Gift,
    Map,
    MapPin,
    Search,
    UserCheck,
    Users,
    X,
    XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { z } from "zod";

interface AdminStats {
    totalUsers: number;
    totalProperties: number;
    totalServiceProviders: number;
    totalBookings: number;
}

// Available property amenities
const AMENITIES = [
    { id: "wifi", label: "WiFi" },
    { id: "parking", label: "Free Parking" },
    { id: "pool", label: "Swimming Pool" },
    { id: "kitchen", label: "Full Kitchen" },
    { id: "ac", label: "Air Conditioning" },
    { id: "heating", label: "Heating" },
    { id: "tv", label: "TV" },
    { id: "washer", label: "Washer" },
    { id: "dryer", label: "Dryer" },
    { id: "gym", label: "Gym/Fitness Center" },
    { id: "hottub", label: "Hot Tub" },
    { id: "balcony", label: "Balcony/Patio" },
    { id: "workspace", label: "Dedicated Workspace" },
    { id: "fireplace", label: "Fireplace" },
    { id: "elevator", label: "Elevator" },
    { id: "petsAllowed", label: "Pets Allowed" },
];

// Change Password Form Component
function ChangePasswordForm() {
    const { toast } = useToast();
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const passwordSchema = z.object({
        currentPassword: z.string().min(1, "Current password is required"),
        newPassword: z.string().min(6, "Password must be at least 6 characters"),
        confirmPassword: z.string().min(1, "Please confirm your password"),
    }).refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

    const form = useForm({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    const changePasswordMutation = useMutation({
        mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
            const response = await fetch("/api/auth/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
                credentials: "include",
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || "Failed to change password");
            }
            
            return result;
        },
        onSuccess: () => {
            toast({
                title: "Success",
                description: "Password changed successfully",
            });
            form.reset();
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const onSubmit = (data: z.infer<typeof passwordSchema>) => {
        changePasswordMutation.mutate({
            currentPassword: data.currentPassword,
            newPassword: data.newPassword,
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="currentPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Current Password</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Input
                                        type={showCurrentPassword ? "text" : "password"}
                                        placeholder="Enter current password"
                                        {...field}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    >
                                        {showCurrentPassword ? (
                                            <X className="h-4 w-4" />
                                        ) : (
                                            <Check className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Input
                                        type={showNewPassword ? "text" : "password"}
                                        placeholder="Enter new password (min 6 characters)"
                                        {...field}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                    >
                                        {showNewPassword ? (
                                            <X className="h-4 w-4" />
                                        ) : (
                                            <Check className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Confirm New Password</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Input
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Confirm new password"
                                        {...field}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? (
                                            <X className="h-4 w-4" />
                                        ) : (
                                            <Check className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button
                    type="submit"
                    disabled={changePasswordMutation.isPending}
                    className="w-full"
                >
                    {changePasswordMutation.isPending ? "Changing Password..." : "Change Password"}
                </Button>
            </form>
        </Form>
    );
}

function ApprovalsTab({ toast, user }: { toast: any, user: any }) {
    const { data: pendingUsers, isLoading, refetch } = useQuery({
        queryKey: ["/api/approvals/pending"],
        queryFn: async () => {
            const response = await apiRequest("GET", "/api/approvals/pending");
            return response.json();
        },
    });

    const approveMutation = useMutation({
        mutationFn: async (userId: string) => {
            const response = await apiRequest("POST", `/api/approvals/approve/${userId}`);
            return response.json();
        },
        onSuccess: () => {
            toast({
                title: "Success",
                description: "User approved successfully",
            });
            refetch();
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.message || "Failed to approve user",
                variant: "destructive",
            });
        },
    });

    const rejectMutation = useMutation({
        mutationFn: async (userId: string) => {
            const response = await apiRequest("POST", `/api/approvals/reject/${userId}`);
            return response.json();
        },
        onSuccess: () => {
            toast({
                title: "Success",
                description: "User rejected successfully",
            });
            refetch();
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.message || "Failed to reject user",
                variant: "destructive",
            });
        },
    });

    const roleTitle = user?.role === 'country_manager' ? 'City Managers' : 'Hosts & Service Providers';

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold text-foreground mb-2">
                    Pending Approvals
                </h2>
                <p className="text-muted-foreground">
                    Review and approve or reject {roleTitle} applications
                </p>
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-32 bg-muted rounded-lg animate-pulse"></div>
                    ))}
                </div>
            ) : !pendingUsers || pendingUsers.length === 0 ? (
                <Card className="p-12 text-center">
                    <UserCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                        No Pending Approvals
                    </h3>
                    <p className="text-muted-foreground">
                        There are no pending {roleTitle} waiting for approval at this time.
                    </p>
                </Card>
            ) : (
                <div className="space-y-4">
                    {pendingUsers.map((pendingUser: any) => (
                        <Card key={pendingUser.id} className="p-6">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-lg font-semibold text-foreground">
                                            {pendingUser.firstName} {pendingUser.lastName}
                                        </h3>
                                        <Badge variant="outline" className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400">
                                            Pending
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        <strong>Email:</strong> {pendingUser.email}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        <strong>Role:</strong> {pendingUser.role?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        <strong>Applied:</strong> {new Date(pendingUser.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="default"
                                        onClick={() => approveMutation.mutate(pendingUser.id)}
                                        disabled={approveMutation.isPending || rejectMutation.isPending}
                                    >
                                        <Check className="w-4 h-4 mr-2" />
                                        Approve
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={() => rejectMutation.mutate(pendingUser.id)}
                                        disabled={approveMutation.isPending || rejectMutation.isPending}
                                    >
                                        <X className="w-4 h-4 mr-2" />
                                        Reject
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

function CreateStaffForm({ toast }: { toast: any }) {
    const [selectedRole, setSelectedRole] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    return (
        <div className="max-w-2xl mx-auto">
            <Card className="p-6">
                <h2 className="text-2xl font-semibold text-foreground mb-6">
                    Create Internal Staff Account
                </h2>
                <p className="text-muted-foreground mb-6">
                    Create accounts for internal roles such as Billing, Operation, Marketing, Accounts, and Country Manager. The staff member will receive an email with their login credentials.
                </p>
                
                <form onSubmit={async (e) => {
                    e.preventDefault();
                    setIsSubmitting(true);
                    const formData = new FormData(e.currentTarget);
                    const data = {
                        email: formData.get('email') as string,
                        firstName: formData.get('firstName') as string,
                        lastName: formData.get('lastName') as string,
                        role: selectedRole,
                    };

                    try {
                        await apiRequest('POST', '/api/admin/create-staff', data);

                        toast({
                            title: "Success",
                            description: "Staff account created successfully. Credentials sent via email.",
                        });
                        e.currentTarget.reset();
                        setSelectedRole("");
                    } catch (error) {
                        toast({
                            title: "Error",
                            description: error instanceof Error ? error.message : "Failed to create staff account",
                            variant: "destructive",
                        });
                    } finally {
                        setIsSubmitting(false);
                    }
                }}>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    First Name *
                                </label>
                                <Input
                                    name="firstName"
                                    required
                                    placeholder="John"
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Last Name *
                                </label>
                                <Input
                                    name="lastName"
                                    required
                                    placeholder="Doe"
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Email *
                            </label>
                            <Input
                                name="email"
                                type="email"
                                required
                                placeholder="john.doe@travelhub.com"
                                disabled={isSubmitting}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Role *
                            </label>
                            <Select value={selectedRole} onValueChange={setSelectedRole} required disabled={isSubmitting}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="billing">Billing</SelectItem>
                                    <SelectItem value="operation">Operation</SelectItem>
                                    <SelectItem value="marketing">Marketing</SelectItem>
                                    <SelectItem value="accounts">Accounts</SelectItem>
                                    <SelectItem value="country_manager">Country Manager</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="bg-muted/50 rounded-lg p-4">
                            <p className="text-sm text-muted-foreground">
                                <strong>Note:</strong> A temporary password will be automatically generated and sent to the staff member's email. They should change it upon first login.
                            </p>
                        </div>

                        <Button type="submit" className="w-full" disabled={isSubmitting || !selectedRole}>
                            {isSubmitting ? "Creating..." : "Create Staff Account"}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}

export default function Dashboard() {
    const { t } = useTranslation();
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const { toast } = useToast();
    const [location, setLocation] = useLocation();
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [activeTab, setActiveTab] = useState(() => {
        // Check URL params first
        const urlParams = new URLSearchParams(window.location.search);
        const tab = urlParams.get("tab");
        if (tab) return tab;

        // Default tab - will be updated in useEffect when user loads
        return "bookings";
    });

    // Handle contact support query parameter on mount
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const contactSupport = urlParams.get("contactSupport");
        
        if (contactSupport === "true") {
            setContactSupportDialogOpen(true);
            // Clean up URL parameter
            const newUrl = window.location.pathname + (urlParams.has('tab') ? `?tab=${urlParams.get('tab')}` : '');
            window.history.replaceState({}, '', newUrl);
        }
    }, []); // Run once on mount

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme === "dark") {
            setIsDarkMode(true);
            document.documentElement.classList.add("dark");
        }

        // Parse URL parameters for active tab
        const urlParams = new URLSearchParams(window.location.search);
        const tab = urlParams.get("tab");
        
        if (tab) {
            setActiveTab(tab);
        } else if (user) {
            // Set default tab based on role once user is loaded
            setActiveTab(user.role === "admin" ? "overview" : "bookings");
        }
    }, [user]);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            toast({
                title: t("errors.unauthorized"),
                description: t("dashboard.login_required_message"),
                variant: "destructive",
            });
            setTimeout(() => {
                window.location.href = "/login";
            }, 500);
        }
    }, [isAuthenticated, authLoading, toast, t]);

    const toggleDarkMode = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);

        if (newMode) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    };

    const {
        data: bookings,
        isLoading: bookingsLoading,
        error: bookingsError,
    } = useQuery<Booking[]>({
        queryKey: ["/api/bookings"],
        enabled: isAuthenticated,
        retry: false,
    });

    // Admin stats query
    const { data: adminStats, isLoading: statsLoading } = useQuery<AdminStats>({
        queryKey: ["/api/admin/stats"],
        enabled: isAuthenticated && user?.role === "admin",
        retry: false,
    });

    // Admin users query
    const { data: allUsers, isLoading: usersLoading } = useQuery<User[]>({
        queryKey: ["/api/admin/users"],
        enabled: isAuthenticated && user?.role === "admin",
        retry: false,
    });

    // Admin cancellations query
    const {
        data: cancellations,
        isLoading: cancellationsLoading,
        refetch: refetchCancellations,
    } = useQuery<any[]>({
        queryKey: ["/api/admin/cancellations"],
        enabled: isAuthenticated && user?.role === "admin",
        retry: false,
    });

    // User cancellations query (for non-admin users)
    const {
        data: userCancellations,
        isLoading: userCancellationsLoading,
    } = useQuery<Array<{ id: string; bookingId: string; status: string; bookingCode?: string }>>({
        queryKey: ["/api/cancellations"],
        enabled: isAuthenticated,
        retry: false,
    });

    // State for user search and filter
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState<string>("all");


    // State for property modal
    const [propertyDialogOpen, setPropertyDialogOpen] = useState(false);

    // State for service modal
    const [serviceDialogOpen, setServiceDialogOpen] = useState(false);

    // State for contact support modal
    const [contactSupportDialogOpen, setContactSupportDialogOpen] = useState(false);

    // State for booking cancellation dialog
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [selectedBookingForCancel, setSelectedBookingForCancel] = useState<
        string | null
    >(null);


    // Service categories query
    const { data: serviceCategories } = useQuery<ServiceCategory[]>({
        queryKey: ["/api/service-categories"],
        enabled: isAuthenticated,
    });

    // Service providers query
    const { data: serviceProviders, isLoading: serviceProvidersLoading } = useQuery<any[]>({
        queryKey: ["/api/service-providers"],
        enabled: isAuthenticated,
    });

    // Loyalty points query
    const { data: loyaltyPoints } = useQuery<{
        id: string;
        availablePoints: number;
        lifetimeEarned: number;
    }>({
        queryKey: ["/api/loyalty-points"],
        enabled: isAuthenticated && user?.role !== "admin",
        retry: false,
    });

    // Trip plans query
    const { data: tripPlans } = useQuery<any[]>({
        queryKey: ["/api/trip-plans"],
        enabled: isAuthenticated && user?.role !== "admin",
        retry: false,
    });

    // Notifications query
    const { data: notifications, isLoading: notificationsLoading } = useQuery<any[]>({
        queryKey: ["/api/notifications"],
        enabled: isAuthenticated,
        retry: false,
    });

    // Mark notification as read mutation
    const markNotificationAsReadMutation = useMutation({
        mutationFn: async (notificationId: string) => {
            return await apiRequest("PATCH", `/api/notifications/${notificationId}/read`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
            queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
        },
        onError: (error) => {
            console.error("Error marking notification as read:", error);
            toast({
                title: "Error",
                description: "Failed to mark notification as read",
                variant: "destructive",
            });
        },
    });

    // Cancellation form schema
    const cancellationFormSchema = z.object({
        reason: z
            .string()
            .min(10, t("dashboard.cancellation_reason_min_length")),
    });

    const cancellationForm = useForm<z.infer<typeof cancellationFormSchema>>({
        resolver: zodResolver(cancellationFormSchema),
        defaultValues: {
            reason: "",
        },
    });

    // Property form schema
    const propertyFormSchema = z.object({
        title: z.string().min(3, "Title must be at least 3 characters"),
        description: z.string().optional(),
        location: z.string().min(2, "Location is required"),
        pricePerNight: z.coerce.number().positive("Price must be greater than 0"),
        maxGuests: z.coerce.number().int().positive("Max guests must be at least 1"),
        bedrooms: z.coerce.number().int().positive("Bedrooms must be at least 1"),
        bathrooms: z.coerce.number().int().positive("Bathrooms must be at least 1"),
        latitude: z.preprocess((val) => {
            if (val === "" || val === null || val === undefined) return undefined;
            return Number(val);
        }, z.number().optional()),
        longitude: z.preprocess((val) => {
            if (val === "" || val === null || val === undefined) return undefined;
            return Number(val);
        }, z.number().optional()),
        amenities: z.array(z.string()).default([]),
        images: z.array(z.string()).default([]),
        videos: z.array(z.string()).default([]),
        isActive: z.boolean().default(true),
    });

    type PropertyFormValues = z.infer<typeof propertyFormSchema>;

    const propertyForm = useForm<PropertyFormValues>({
        resolver: zodResolver(propertyFormSchema),
        defaultValues: {
            title: "",
            description: "",
            location: "",
            pricePerNight: 0,
            maxGuests: 1,
            bedrooms: 1,
            bathrooms: 1,
            latitude: undefined,
            longitude: undefined,
            amenities: [],
            images: [],
            videos: [],
            isActive: true,
        },
    });

    // Service form schema
    const serviceFormSchema = z.object({
        categoryId: z.string().min(1, "Category is required"),
        businessName: z.string().min(2, "Business name must be at least 2 characters"),
        description: z.string().min(10, "Description must be at least 10 characters"),
        hourlyRate: z.coerce.number().positive("Hourly rate must be greater than 0").optional().or(z.literal(0)),
        location: z.string().optional(),
    });

    type ServiceFormValues = z.infer<typeof serviceFormSchema>;

    const serviceForm = useForm<ServiceFormValues>({
        resolver: zodResolver(serviceFormSchema),
        defaultValues: {
            categoryId: "",
            businessName: "",
            description: "",
            hourlyRate: undefined,
            location: "",
        },
    });

    // Mutation to assign user role
    const assignRoleMutation = useMutation({
        mutationFn: async ({
            userId,
            role,
        }: {
            userId: string;
            role: string;
        }) => {
            return await apiRequest("PUT", "/api/admin/assign-role", {
                userId,
                role,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
            queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
            toast({
                title: t("common.success"),
                description: t("dashboard.user_role_updated"),
            });
        },
        onError: (error: any) => {
            toast({
                title: t("common.error"),
                description: error.message || t("dashboard.failed_update_role"),
                variant: "destructive",
            });
        },
    });

    // Property creation mutation
    const createPropertyMutation = useMutation({
        mutationFn: async (formData: PropertyFormValues) => {
            return await apiRequest("POST", "/api/properties", {
                title: formData.title,
                description: formData.description || "",
                location: formData.location,
                pricePerNight: formData.pricePerNight,
                maxGuests: formData.maxGuests,
                bedrooms: formData.bedrooms,
                bathrooms: formData.bathrooms,
                latitude: formData.latitude,
                longitude: formData.longitude,
                amenities: formData.amenities || [],
                images: formData.images || [],
                videos: formData.videos || [],
                isActive: formData.isActive ?? true,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
            queryClient.invalidateQueries({ queryKey: ["/api/properties/owner"] });
            setPropertyDialogOpen(false);
            propertyForm.reset();
            toast({
                title: "Success!",
                description: "Your property has been added successfully.",
            });
        },
        onError: (error: any) => {
            toast({
                title: t("common.error"),
                description: error.message || "Failed to add property",
                variant: "destructive",
            });
        },
    });

    // Property queries and mutations
    const { data: ownerProperties = [] } = useQuery({
        queryKey: ["/api/properties/owner"],
        enabled: user?.role === "property_owner" || user?.role === "admin",
    });

    const deletePropertyMutation = useMutation({
        mutationFn: async (propertyId: string) => {
            return await apiRequest("DELETE", `/api/properties/${propertyId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/properties/owner"] });
            toast({
                title: "Property deleted",
                description: "Your property has been deleted successfully.",
            });
        },
        onError: (error: any) => {
            toast({
                title: t("common.error"),
                description: error.message || "Failed to delete property",
                variant: "destructive",
            });
        },
    });

    // Service creation mutation
    const createServiceMutation = useMutation({
        mutationFn: async (formData: ServiceFormValues) => {
            const response = await apiRequest("POST", "/api/service-providers", {
                categoryId: formData.categoryId,
                businessName: formData.businessName,
                description: formData.description,
                hourlyRate: formData.hourlyRate,
                location: formData.location || "",
            });
            return await response.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["/api/service-providers"] });
            setServiceDialogOpen(false);
            serviceForm.reset();
            toast({
                title: "Service Submitted!",
                description: data.message || "Your service application has been submitted for approval. A city or country manager will review it soon.",
            });
        },
        onError: (error: any) => {
            toast({
                title: t("common.error"),
                description: error.message || "Failed to add service",
                variant: "destructive",
            });
        },
    });

    // Contact support form schema
    const contactSupportFormSchema = z.object({
        message: z.string().min(10, "Message must be at least 10 characters"),
    });

    type ContactSupportFormValues = z.infer<typeof contactSupportFormSchema>;

    const contactSupportForm = useForm<ContactSupportFormValues>({
        resolver: zodResolver(contactSupportFormSchema),
        defaultValues: {
            message: "",
        },
    });

    // Contact support mutation
    const contactSupportMutation = useMutation({
        mutationFn: async (formData: ContactSupportFormValues) => {
            return await apiRequest("POST", "/api/contact/support", {
                message: formData.message,
            });
        },
        onSuccess: () => {
            setContactSupportDialogOpen(false);
            contactSupportForm.reset();
            toast({
                title: "Success!",
                description: "Your message has been sent to support. We'll get back to you soon.",
            });
        },
        onError: (error: any) => {
            toast({
                title: t("common.error"),
                description: error.message || "Failed to send message",
                variant: "destructive",
            });
        },
    });

    const handleContactSupportSubmit = (values: ContactSupportFormValues) => {
        contactSupportMutation.mutate(values);
    };

    // Booking cancellation mutation
    const cancelBookingMutation = useMutation({
        mutationFn: async ({
            bookingId,
            reason,
        }: {
            bookingId: string;
            reason: string;
        }) => {
            return await apiRequest(
                "POST",
                `/api/bookings/${bookingId}/cancel`,
                { reason }
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
            setCancelDialogOpen(false);
            setSelectedBookingForCancel(null);
            cancellationForm.reset();
            toast({
                title: t("dashboard.cancellation_requested"),
                description: t("dashboard.cancellation_pending_message"),
            });
        },
        onError: (error: any) => {
            toast({
                title: t("common.error"),
                description:
                    error.message || t("dashboard.failed_request_cancellation"),
                variant: "destructive",
            });
        },
    });

    const handleCancelBooking = (
        values: z.infer<typeof cancellationFormSchema>
    ) => {
        if (selectedBookingForCancel) {
            cancelBookingMutation.mutate({
                bookingId: selectedBookingForCancel,
                reason: values.reason,
            });
        }
    };

    // Admin: Update cancellation status mutation
    const updateCancellationMutation = useMutation({
        mutationFn: async ({
            cancellationId,
            status,
            rejectionReason,
        }: {
            cancellationId: string;
            status: "approved" | "rejected";
            rejectionReason?: string;
        }) => {
            return await apiRequest(
                "PATCH",
                `/api/admin/cancellations/${cancellationId}`,
                { status, rejectionReason }
            );
        },
        onSuccess: () => {
            refetchCancellations();
            toast({
                title: t("common.success"),
                description: t("dashboard.cancellation_updated_successfully"),
            });
        },
        onError: (error: any) => {
            toast({
                title: t("common.error"),
                description:
                    error.message || t("dashboard.failed_update_cancellation"),
                variant: "destructive",
            });
        },
    });

    useEffect(() => {
        if (bookingsError && isUnauthorizedError(bookingsError as Error)) {
            toast({
                title: t("errors.unauthorized"),
                description: t("dashboard.logged_out_message"),
                variant: "destructive",
            });
            setTimeout(() => {
                window.location.href = "/login";
            }, 500);
        }
    }, [bookingsError, toast, t]);

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        const url = new URL(window.location.href);
        url.searchParams.set("tab", tab);
        window.history.replaceState({}, "", url.toString());
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "pending_payment":
                return "secondary";
            case "confirmed":
                return "default";
            case "completed":
                return "secondary";
            case "cancelled":
                return "destructive";
            default:
                return "outline";
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Header
                    onToggleDarkMode={toggleDarkMode}
                    isDarkMode={isDarkMode}
                    isAuthenticated={isAuthenticated}
                    user={user}
                />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-muted rounded w-64 mb-8"></div>
                        <div className="h-96 bg-muted rounded-2xl"></div>
                    </div>
                </div>
            </div>
        );
    }

    // Show "Awaiting Approval" message for pending users
    if (user?.status === "pending") {
        return (
            <div className="min-h-screen bg-background">
                <Header
                    onToggleDarkMode={toggleDarkMode}
                    isDarkMode={isDarkMode}
                    isAuthenticated={isAuthenticated}
                    user={user}
                />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <Card className="max-w-2xl mx-auto p-12 text-center">
                        <div className="mb-6">
                            <div className="w-24 h-24 rounded-full bg-yellow-100 dark:bg-yellow-900/20 mx-auto flex items-center justify-center mb-6">
                                <UserCheck className="w-12 h-12 text-yellow-600 dark:text-yellow-500" />
                            </div>
                            <h2 className="text-3xl font-bold text-foreground mb-4">
                                Awaiting Approval
                            </h2>
                            <p className="text-lg text-muted-foreground mb-6">
                                Your account application is currently under review. You will be notified via email once your account has been approved.
                            </p>
                            <div className="bg-muted/50 rounded-lg p-6 mb-6">
                                <p className="text-sm text-muted-foreground">
                                    <strong>Account Status:</strong> Pending
                                    <br />
                                    <strong>Role:</strong> {user.role?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    <br />
                                    <strong>Email:</strong> {user.email}
                                </p>
                            </div>
                            <p className="text-sm text-muted-foreground mb-8">
                                If you have any questions, please contact support at{" "}
                                <a href="mailto:support@travelhub.com" className="text-primary hover:underline">
                                    support@travelhub.com
                                </a>
                            </p>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    fetch("/api/auth/logout", { method: "POST" });
                                    window.location.href = "/";
                                }}
                            >
                                Sign Out
                            </Button>
                        </div>
                    </Card>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Header
                onToggleDarkMode={toggleDarkMode}
                isDarkMode={isDarkMode}
                isAuthenticated={isAuthenticated}
                user={user}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1
                        className="text-3xl font-bold text-foreground mb-2"
                        data-testid="text-dashboard-title"
                    >
                        {t("dashboard.welcome", {
                            name: user?.firstName || t("dashboard.traveler"),
                        })}
                    </h1>
                    <p
                        className="text-lg text-muted-foreground"
                        data-testid="text-dashboard-subtitle"
                    >
                        {t("dashboard.subtitle")}
                    </p>
                </div>

                {/* Dashboard Tabs */}
                <Tabs
                    value={activeTab}
                    onValueChange={handleTabChange}
                    className="space-y-6"
                >
                    {user?.role === "admin" ? (
                        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-8 gap-2">
                            <TabsTrigger
                                value="overview"
                                data-testid="tab-overview"
                                className="text-xs sm:text-sm"
                            >
                                <DollarSign className="w-4 h-4 sm:mr-2" />
                                <span className="hidden sm:inline">
                                    Overview
                                </span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="users"
                                data-testid="tab-users"
                                className="text-xs sm:text-sm"
                            >
                                <Users className="w-4 h-4 sm:mr-2" />
                                <span className="hidden sm:inline">Users</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="create-staff"
                                data-testid="tab-create-staff"
                                className="text-xs sm:text-sm"
                            >
                                <UserCheck className="w-4 h-4 sm:mr-2" />
                                <span className="hidden sm:inline">
                                    Create Staff
                                </span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="cancellations"
                                data-testid="tab-cancellations"
                                className="text-xs sm:text-sm"
                            >
                                <XCircle className="w-4 h-4 sm:mr-2" />
                                <span className="hidden sm:inline">
                                    Cancellations
                                </span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="properties"
                                data-testid="tab-properties"
                                className="text-xs sm:text-sm"
                            >
                                <Building className="w-4 h-4 sm:mr-2" />
                                <span className="hidden sm:inline">
                                    Properties
                                </span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="services"
                                data-testid="tab-services"
                                className="text-xs sm:text-sm"
                            >
                                <UserCheck className="w-4 h-4 sm:mr-2" />
                                <span className="hidden sm:inline">
                                    Services
                                </span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="notifications"
                                data-testid="tab-notifications"
                                className="text-xs sm:text-sm"
                            >
                                <Bell className="w-4 h-4 sm:mr-2" />
                                <span className="hidden sm:inline">
                                    Notifications
                                </span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="profile"
                                data-testid="tab-profile"
                                className="text-xs sm:text-sm"
                            >
                                <Users className="w-4 h-4 sm:mr-2" />
                                <span className="hidden sm:inline">
                                    Profile
                                </span>
                            </TabsTrigger>
                        </TabsList>
                    ) : (
                        <TabsList className={`grid w-full ${
                            user?.role === 'client' ? 'grid-cols-3' :
                            user?.role === 'property_owner' || user?.role === 'service_provider' ? 'grid-cols-4' :
                            user?.role === 'country_manager' || user?.role === 'city_manager' ? 'grid-cols-4' :
                            'grid-cols-5'
                        }`}>
                            <TabsTrigger
                                value="bookings"
                                data-testid="tab-bookings"
                            >
                                <Calendar className="w-4 h-4 mr-2" />
                                {t("dashboard.my_bookings")}
                            </TabsTrigger>
                            {/* Show Properties tab only for property_owner */}
                            {user?.role === 'property_owner' && (
                                <TabsTrigger
                                    value="properties"
                                    data-testid="tab-properties"
                                >
                                    <Building className="w-4 h-4 mr-2" />
                                    {t("dashboard.my_properties")}
                                </TabsTrigger>
                            )}
                            {/* Show Services tab only for service_provider */}
                            {user?.role === 'service_provider' && (
                                <TabsTrigger
                                    value="services"
                                    data-testid="tab-services"
                                >
                                    <UserCheck className="w-4 h-4 mr-2" />
                                    {t("dashboard.my_services")}
                                </TabsTrigger>
                            )}
                            {/* Show Approvals tab for Country Manager and City Manager */}
                            {(user?.role === 'country_manager' || user?.role === 'city_manager') && (
                                <TabsTrigger
                                    value="approvals"
                                    data-testid="tab-approvals"
                                >
                                    <UserCheck className="w-4 h-4 mr-2" />
                                    Approvals
                                </TabsTrigger>
                            )}
                            <TabsTrigger
                                value="notifications"
                                data-testid="tab-notifications"
                            >
                                <Bell className="w-4 h-4 mr-2" />
                                Notifications
                            </TabsTrigger>
                            <TabsTrigger
                                value="profile"
                                data-testid="tab-profile"
                            >
                                <Users className="w-4 h-4 mr-2" />
                                {t("dashboard.profile")}
                            </TabsTrigger>
                        </TabsList>
                    )}

                    {/* Admin Overview Tab */}
                    {user?.role === "admin" && (
                        <TabsContent value="overview" className="space-y-6">
                            <h2
                                className="text-2xl font-semibold text-foreground"
                                data-testid="text-overview-title"
                            >
                                {t("dashboard.platform_overview")}
                            </h2>

                            {statsLoading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div
                                            key={i}
                                            className="h-32 bg-muted rounded-lg animate-pulse"
                                        ></div>
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                                    <Card className="p-4 sm:p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs sm:text-sm text-muted-foreground">
                                                    {t("admin.total_users")}
                                                </p>
                                                <p
                                                    className="text-xl sm:text-2xl font-bold text-foreground mt-2"
                                                    data-testid="stat-total-users"
                                                >
                                                    {adminStats?.totalUsers ||
                                                        0}
                                                </p>
                                            </div>
                                            <Users className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                                        </div>
                                    </Card>

                                    <Card className="p-4 sm:p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs sm:text-sm text-muted-foreground">
                                                    {t("dashboard.properties")}
                                                </p>
                                                <p
                                                    className="text-xl sm:text-2xl font-bold text-foreground mt-2"
                                                    data-testid="stat-total-properties"
                                                >
                                                    {adminStats?.totalProperties ||
                                                        0}
                                                </p>
                                            </div>
                                            <Building className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                                        </div>
                                    </Card>

                                    <Card className="p-4 sm:p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs sm:text-sm text-muted-foreground">
                                                    {t(
                                                        "dashboard.service_providers"
                                                    )}
                                                </p>
                                                <p
                                                    className="text-xl sm:text-2xl font-bold text-foreground mt-2"
                                                    data-testid="stat-total-providers"
                                                >
                                                    {adminStats?.totalServiceProviders ||
                                                        0}
                                                </p>
                                            </div>
                                            <UserCheck className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                                        </div>
                                    </Card>

                                    <Card className="p-4 sm:p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs sm:text-sm text-muted-foreground">
                                                    {t(
                                                        "dashboard.total_bookings"
                                                    )}
                                                </p>
                                                <p
                                                    className="text-xl sm:text-2xl font-bold text-foreground mt-2"
                                                    data-testid="stat-total-bookings"
                                                >
                                                    {adminStats?.totalBookings ||
                                                        0}
                                                </p>
                                            </div>
                                            <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                                        </div>
                                    </Card>
                                </div>
                            )}

                            <div className="mt-8">
                                <p className="text-muted-foreground text-center">
                                    {t("dashboard.admin_welcome_message")}
                                </p>
                            </div>
                        </TabsContent>
                    )}

                    {/* Admin Create Staff Tab */}
                    {user?.role === "admin" && (
                        <TabsContent value="create-staff" className="space-y-6">
                            <CreateStaffForm toast={toast} />
                        </TabsContent>
                    )}

                    {/* Admin Users Tab */}
                    {user?.role === "admin" && (
                        <TabsContent value="users" className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2
                                    className="text-2xl font-semibold text-foreground"
                                    data-testid="text-users-title"
                                >
                                    {t("admin.user_management")}
                                </h2>
                            </div>

                            {/* Search and Filter */}
                            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                    <Input
                                        type="text"
                                        placeholder={t(
                                            "dashboard.search_by_name_email"
                                        )}
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                        className="pl-10"
                                        data-testid="input-user-search"
                                    />
                                </div>
                                <Select
                                    value={roleFilter}
                                    onValueChange={setRoleFilter}
                                >
                                    <SelectTrigger
                                        className="w-full sm:w-[200px]"
                                        data-testid="select-role-filter"
                                    >
                                        <SelectValue
                                            placeholder={t(
                                                "dashboard.filter_by_role"
                                            )}
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            {t("dashboard.all_roles")}
                                        </SelectItem>
                                        <SelectItem value="admin">
                                            Admin
                                        </SelectItem>
                                        <SelectItem value="billing">
                                            Billing
                                        </SelectItem>
                                        <SelectItem value="operation">
                                            Operation
                                        </SelectItem>
                                        <SelectItem value="marketing">
                                            Marketing
                                        </SelectItem>
                                        <SelectItem value="country_manager">
                                            Country Manager
                                        </SelectItem>
                                        <SelectItem value="city_manager">
                                            City Manager
                                        </SelectItem>
                                        <SelectItem value="operation_support">
                                            Operation Support
                                        </SelectItem>
                                        <SelectItem value="property_owner">
                                            Property Owner
                                        </SelectItem>
                                        <SelectItem value="service_provider">
                                            Service Provider
                                        </SelectItem>
                                        <SelectItem value="client">
                                            Client
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {usersLoading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map((i) => (
                                        <div
                                            key={i}
                                            className="h-24 bg-muted rounded-lg animate-pulse"
                                        ></div>
                                    ))}
                                </div>
                            ) : allUsers && allUsers.length > 0 ? (
                                <div className="space-y-4">
                                    {allUsers
                                        .filter((u: any) => {
                                            // Search filter
                                            const matchesSearch =
                                                !searchQuery ||
                                                u.email
                                                    .toLowerCase()
                                                    .includes(
                                                        searchQuery.toLowerCase()
                                                    ) ||
                                                (u.firstName &&
                                                    u.firstName
                                                        .toLowerCase()
                                                        .includes(
                                                            searchQuery.toLowerCase()
                                                        )) ||
                                                (u.lastName &&
                                                    u.lastName
                                                        .toLowerCase()
                                                        .includes(
                                                            searchQuery.toLowerCase()
                                                        ));

                                            // Role filter
                                            const matchesRole =
                                                roleFilter === "all" ||
                                                u.role === roleFilter;

                                            return matchesSearch && matchesRole;
                                        })
                                        .map((u: any) => (
                                            <Card
                                                key={u.id}
                                                className="p-4 sm:p-6"
                                                data-testid={`card-user-${u.id}`}
                                            >
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                                    <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                            <span className="text-base sm:text-lg font-semibold text-primary">
                                                                {u
                                                                    .firstName?.[0] ||
                                                                    u.email[0].toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="font-semibold text-foreground text-sm sm:text-base truncate">
                                                                {u.firstName &&
                                                                u.lastName
                                                                    ? `${u.firstName} ${u.lastName}`
                                                                    : t(
                                                                          "dashboard.no_name"
                                                                      )}
                                                            </p>
                                                            <p className="text-xs sm:text-sm text-muted-foreground truncate">
                                                                {u.email}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {t(
                                                                    "dashboard.joined"
                                                                )}{" "}
                                                                {new Date(
                                                                    u.createdAt
                                                                ).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2 sm:space-x-4">
                                                        <Select
                                                            value={u.role}
                                                            onValueChange={(
                                                                newRole
                                                            ) =>
                                                                assignRoleMutation.mutate(
                                                                    {
                                                                        userId: u.id,
                                                                        role: newRole,
                                                                    }
                                                                )
                                                            }
                                                            disabled={
                                                                assignRoleMutation.isPending
                                                            }
                                                        >
                                                            <SelectTrigger
                                                                className="w-full sm:w-[180px]"
                                                                data-testid={`select-role-${u.id}`}
                                                            >
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="admin">
                                                                    Admin
                                                                </SelectItem>
                                                                <SelectItem value="billing">
                                                                    Billing
                                                                </SelectItem>
                                                                <SelectItem value="operation">
                                                                    Operation
                                                                </SelectItem>
                                                                <SelectItem value="marketing">
                                                                    Marketing
                                                                </SelectItem>
                                                                <SelectItem value="country_manager">
                                                                    Country Manager
                                                                </SelectItem>
                                                                <SelectItem value="city_manager">
                                                                    City Manager
                                                                </SelectItem>
                                                                <SelectItem value="operation_support">
                                                                    Operation Support
                                                                </SelectItem>
                                                                <SelectItem value="property_owner">
                                                                    Property Owner
                                                                </SelectItem>
                                                                <SelectItem value="service_provider">
                                                                    Service Provider
                                                                </SelectItem>
                                                                <SelectItem value="client">
                                                                    Client
                                                                </SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-foreground mb-2">
                                        {t("dashboard.no_users_found")}
                                    </h3>
                                    <p className="text-muted-foreground">
                                        {searchQuery || roleFilter !== "all"
                                            ? t(
                                                  "dashboard.no_users_match_filters"
                                              )
                                            : t(
                                                  "dashboard.no_users_registered"
                                              )}
                                    </p>
                                </div>
                            )}
                        </TabsContent>
                    )}

                    {/* Admin Cancellations Tab */}
                    {user?.role === "admin" && (
                        <TabsContent
                            value="cancellations"
                            className="space-y-6"
                        >
                            <div className="flex items-center justify-between">
                                <h2
                                    className="text-2xl font-semibold text-foreground"
                                    data-testid="text-cancellations-title"
                                >
                                    {t("dashboard.cancellation_requests")}
                                </h2>
                            </div>

                            {cancellationsLoading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map((i) => (
                                        <div
                                            key={i}
                                            className="h-32 bg-muted rounded-lg animate-pulse"
                                            data-testid={`skeleton-cancellation-${i}`}
                                        ></div>
                                    ))}
                                </div>
                            ) : cancellations && cancellations.length > 0 ? (
                                <div className="space-y-4">
                                    {cancellations.map((cancellation: any) => (
                                        <Card
                                            key={cancellation.id}
                                            className="p-4 sm:p-6"
                                            data-testid={`card-cancellation-${cancellation.id}`}
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2 mb-3">
                                                        <h3
                                                            className="text-base sm:text-lg font-semibold text-foreground"
                                                            data-testid={`text-cancellation-booking-${cancellation.id}`}
                                                        >
                                                            {t(
                                                                "dashboard.booking_label"
                                                            )}{" "}
                                                            {cancellation
                                                                .booking
                                                                ?.bookingCode ||
                                                                "N/A"}
                                                        </h3>
                                                        <Badge
                                                            variant={
                                                                cancellation.status ===
                                                                "pending"
                                                                    ? "default"
                                                                    : cancellation.status ===
                                                                      "approved"
                                                                    ? "outline"
                                                                    : "destructive"
                                                            }
                                                            data-testid={`badge-cancellation-status-${cancellation.id}`}
                                                        >
                                                            {
                                                                cancellation.status
                                                            }
                                                        </Badge>
                                                    </div>

                                                    <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-muted-foreground">
                                                        <div className="break-words">
                                                            <span className="font-semibold text-foreground">
                                                                {t(
                                                                    "dashboard.client"
                                                                )}
                                                                :
                                                            </span>{" "}
                                                            {cancellation.client
                                                                ?.email ||
                                                                "N/A"}
                                                        </div>
                                                        <div className="break-words">
                                                            <span className="font-semibold text-foreground">
                                                                {t(
                                                                    "dashboard.reason"
                                                                )}
                                                                :
                                                            </span>{" "}
                                                            {
                                                                cancellation.reason
                                                            }
                                                        </div>
                                                        {cancellation.rejectionReason && (
                                                            <div className="break-words">
                                                                <span className="font-semibold text-foreground">
                                                                    {t(
                                                                        "dashboard.rejection_reason"
                                                                    )}
                                                                    :
                                                                </span>{" "}
                                                                {
                                                                    cancellation.rejectionReason
                                                                }
                                                            </div>
                                                        )}
                                                        <div>
                                                            <span className="font-semibold text-foreground">
                                                                {t(
                                                                    "dashboard.requested_at"
                                                                )}
                                                                :
                                                            </span>{" "}
                                                            {new Date(
                                                                cancellation.createdAt
                                                            ).toLocaleString()}
                                                        </div>
                                                    </div>
                                                </div>

                                                {cancellation.status ===
                                                    "pending" && (
                                                    <div className="flex flex-row gap-2 w-full sm:w-auto sm:ml-4">
                                                        <Button
                                                            size="sm"
                                                            variant="default"
                                                            className="flex-1 sm:flex-none"
                                                            onClick={() => {
                                                                updateCancellationMutation.mutate(
                                                                    {
                                                                        cancellationId:
                                                                            cancellation.id,
                                                                        status: "approved",
                                                                    }
                                                                );
                                                            }}
                                                            disabled={
                                                                updateCancellationMutation.isPending
                                                            }
                                                            data-testid={`button-approve-${cancellation.id}`}
                                                        >
                                                            <Check className="w-4 h-4 sm:mr-1" />
                                                            <span className="hidden sm:inline">
                                                                {t(
                                                                    "dashboard.approve"
                                                                )}
                                                            </span>
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            className="flex-1 sm:flex-none"
                                                            onClick={() => {
                                                                const reason =
                                                                    prompt(
                                                                        t(
                                                                            "dashboard.rejection_reason_prompt"
                                                                        )
                                                                    );
                                                                if (reason) {
                                                                    updateCancellationMutation.mutate(
                                                                        {
                                                                            cancellationId:
                                                                                cancellation.id,
                                                                            status: "rejected",
                                                                            rejectionReason:
                                                                                reason,
                                                                        }
                                                                    );
                                                                }
                                                            }}
                                                            disabled={
                                                                updateCancellationMutation.isPending
                                                            }
                                                            data-testid={`button-reject-${cancellation.id}`}
                                                        >
                                                            <X className="w-4 h-4 sm:mr-1" />
                                                            <span className="hidden sm:inline">
                                                                {t(
                                                                    "dashboard.reject"
                                                                )}
                                                            </span>
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <XCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                    <h3
                                        className="text-lg font-semibold text-foreground mb-2"
                                        data-testid="text-no-cancellations-title"
                                    >
                                        {t(
                                            "dashboard.no_cancellation_requests"
                                        )}
                                    </h3>
                                    <p className="text-muted-foreground">
                                        {t(
                                            "dashboard.no_pending_cancellations"
                                        )}
                                    </p>
                                </div>
                            )}
                        </TabsContent>
                    )}

                    {/* My Bookings */}
                    <TabsContent value="bookings" className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2
                                className="text-2xl font-semibold text-foreground"
                                data-testid="text-bookings-title"
                            >
                                {t("dashboard.my_bookings")}
                            </h2>
                            <Button
                                data-testid="button-new-booking"
                                onClick={() =>
                                    (window.location.href = "/properties")
                                }
                            >
                                {t("dashboard.book_new_stay")}
                            </Button>
                        </div>

                        {/* Loyalty Points Card */}
                        {loyaltyPoints && (
                            <Card
                                className="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-6 cursor-pointer hover:shadow-lg transition-shadow"
                                onClick={() =>
                                    (window.location.href = "/loyalty-points")
                                }
                                data-testid="card-loyalty-points"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Gift className="w-5 h-5" />
                                            <h3 className="text-lg font-semibold">
                                                {t("dashboard.loyalty_rewards")}
                                            </h3>
                                        </div>
                                        <p className="text-blue-100 text-sm mb-3">
                                            {t(
                                                "dashboard.loyalty_rewards_description"
                                            )}
                                        </p>
                                        <div className="flex items-baseline gap-4">
                                            <div>
                                                <p
                                                    className="text-3xl font-bold"
                                                    data-testid="text-dashboard-points"
                                                >
                                                    {loyaltyPoints?.availablePoints?.toLocaleString() ||
                                                        "0"}
                                                </p>
                                                <p className="text-blue-100 text-sm">
                                                    {t(
                                                        "dashboard.available_points"
                                                    )}
                                                </p>
                                            </div>
                                            <div>
                                                <p
                                                    className="text-xl font-semibold"
                                                    data-testid="text-dashboard-lifetime"
                                                >
                                                    {loyaltyPoints?.lifetimeEarned?.toLocaleString() ||
                                                        "0"}
                                                </p>
                                                <p className="text-blue-100 text-sm">
                                                    {t(
                                                        "dashboard.lifetime_earned"
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <Award className="w-16 h-16 opacity-20" />
                                </div>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="mt-4"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        window.location.href =
                                            "/loyalty-points";
                                    }}
                                    data-testid="button-view-loyalty-details"
                                >
                                    {t("dashboard.view_details")} →
                                </Button>
                            </Card>
                        )}

                        {/* Trip Planning Card */}
                        {tripPlans && tripPlans.length > 0 && (
                            <Card
                                className="bg-gradient-to-br from-green-500 to-teal-600 text-white p-6 cursor-pointer hover:shadow-lg transition-shadow"
                                onClick={() =>
                                    (window.location.href = "/trip-planning")
                                }
                                data-testid="card-trip-planning"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Map className="w-5 h-5" />
                                            <h3 className="text-lg font-semibold">
                                                {t("dashboard.trip_planning")}
                                            </h3>
                                        </div>
                                        <p className="text-green-100 text-sm mb-3">
                                            {t(
                                                "dashboard.trip_planning_description"
                                            )}
                                        </p>
                                        <div className="flex items-baseline gap-4">
                                            <div>
                                                <p
                                                    className="text-3xl font-bold"
                                                    data-testid="text-dashboard-trip-count"
                                                >
                                                    {tripPlans.length}
                                                </p>
                                                <p className="text-green-100 text-sm">
                                                    {t(
                                                        "dashboard.active_trips"
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <Calendar className="w-16 h-16 opacity-20" />
                                </div>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="mt-4"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        window.location.href = "/trip-planning";
                                    }}
                                    data-testid="button-view-trips"
                                >
                                    {t("dashboard.view_trips")} →
                                </Button>
                            </Card>
                        )}

                        {/* Export Payment History Button */}
                        {bookings && bookings.length > 0 && (
                            <div className="flex justify-end mb-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        window.location.href = '/api/payments/export';
                                    }}
                                    data-testid="button-export-payment-history"
                                >
                                    <DollarSign className="w-4 h-4 mr-2" />
                                    {t("dashboard.export_payment_history") || "Export Payment History"}
                                </Button>
                            </div>
                        )}

                        {bookingsLoading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className="h-32 bg-muted rounded-lg animate-pulse"
                                        data-testid={`skeleton-booking-${i}`}
                                    ></div>
                                ))}
                            </div>
                        ) : bookings && bookings.length > 0 ? (
                            <div className="space-y-4">
                                {bookings.map((booking: any) => (
                                    <Card
                                        key={booking.id}
                                        className="p-6"
                                        data-testid={`card-booking-${booking.id}`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <h3
                                                        className="text-lg font-semibold text-foreground"
                                                        data-testid={`text-booking-code-${booking.id}`}
                                                    >
                                                        {t(
                                                            "dashboard.booking_label"
                                                        )}{" "}
                                                        {booking.bookingCode}
                                                    </h3>
                                                    <Badge
                                                        variant={getStatusColor(
                                                            booking.status
                                                        )}
                                                        data-testid={`badge-booking-status-${booking.id}`}
                                                    >
                                                        {booking.status}
                                                    </Badge>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                                                    <div className="flex items-center space-x-2">
                                                        <Calendar className="w-4 h-4" />
                                                        <span
                                                            data-testid={`text-booking-dates-${booking.id}`}
                                                        >
                                                            {new Date(
                                                                booking.checkIn
                                                            ).toLocaleDateString()}{" "}
                                                            -{" "}
                                                            {new Date(
                                                                booking.checkOut
                                                            ).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Users className="w-4 h-4" />
                                                        <span
                                                            data-testid={`text-booking-guests-${booking.id}`}
                                                        >
                                                            {booking.guests}{" "}
                                                            {t(
                                                                "dashboard.guests_label"
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <DollarSign className="w-4 h-4" />
                                                        <span
                                                            data-testid={`text-booking-total-${booking.id}`}
                                                        >
                                                            $
                                                            {parseFloat(
                                                                booking.totalAmount
                                                            ).toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex space-x-2">
                                                {booking.status ===
                                                    "pending_payment" &&
                                                    booking.paymentStatus ===
                                                        "pending" && (
                                                        <Button
                                                            size="sm"
                                                            onClick={() =>
                                                                (window.location.href = `/pay-booking/${booking.id}`)
                                                            }
                                                            data-testid={`button-pay-booking-${booking.id}`}
                                                        >
                                                            {t(
                                                                "dashboard.pay_now"
                                                            )}
                                                        </Button>
                                                    )}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        (window.location.href = `/properties/${booking.propertyId}`)
                                                    }
                                                    data-testid={`button-view-booking-${booking.id}`}
                                                >
                                                    {t(
                                                        "dashboard.view_details_button"
                                                    )}
                                                </Button>
                                                {booking.status === "confirmed" && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            toast({
                                                                title: t("dashboard.modify_booking_title") || "Modify Booking",
                                                                description: t("dashboard.modify_booking_message") || "To modify your booking (dates, guests, etc.), please contact support or use the modification request form.",
                                                            });
                                                        }}
                                                        data-testid={`button-modify-booking-${booking.id}`}
                                                    >
                                                        {t("dashboard.modify_button") || "Modify"}
                                                    </Button>
                                                )}
                                                {(booking.status ===
                                                    "confirmed" ||
                                                    booking.status ===
                                                        "pending_payment") &&
                                                    !userCancellations?.some(
                                                        (c) =>
                                                            c.bookingId === booking.id &&
                                                            c.status === "approved"
                                                    ) && (
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedBookingForCancel(
                                                                booking.id
                                                            );
                                                            setCancelDialogOpen(
                                                                true
                                                            );
                                                        }}
                                                        data-testid={`button-cancel-booking-${booking.id}`}
                                                    >
                                                        {t("common.cancel")}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                <h3
                                    className="text-lg font-semibold text-foreground mb-2"
                                    data-testid="text-no-bookings-title"
                                >
                                    {t("dashboard.no_bookings_yet")}
                                </h3>
                                <p
                                    className="text-muted-foreground mb-6"
                                    data-testid="text-no-bookings-description"
                                >
                                    {t("dashboard.start_journey_message")}
                                </p>
                                <Button
                                    data-testid="button-browse-properties"
                                    onClick={() =>
                                        (window.location.href = "/properties")
                                    }
                                >
                                    {t("dashboard.browse_properties")}
                                </Button>
                            </div>
                        )}
                    </TabsContent>

                    {/* Approvals Tab - For Country Manager and City Manager */}
                    {(user?.role === 'country_manager' || user?.role === 'city_manager') && (
                        <TabsContent value="approvals" className="space-y-6">
                            <ApprovalsTab toast={toast} user={user} />
                        </TabsContent>
                    )}

                    {/* My Properties - Only for property_owner */}
                    {user?.role === 'property_owner' && (<>
                    <TabsContent value="properties" className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2
                                className="text-2xl font-semibold text-foreground"
                                data-testid="text-properties-title"
                            >
                                {t("dashboard.my_properties")}
                            </h2>
                            <Button 
                                data-testid="button-add-property"
                                onClick={() => setPropertyDialogOpen(true)}
                            >
                                {t("dashboard.add_property")}
                            </Button>
                        </div>

                        {user?.role === "property_owner" ||
                        user?.role === "admin" ? (
                            ownerProperties.length > 0 ? (
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {ownerProperties.map((property: any) => (
                                        <Card key={property.id} className="overflow-hidden">
                                            <div className="aspect-video bg-muted relative">
                                                {property.images && property.images.length > 0 ? (
                                                    <img
                                                        src={property.images[0]}
                                                        alt={property.title}
                                                        className="object-cover w-full h-full"
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full">
                                                        <Building className="w-12 h-12 text-muted-foreground" />
                                                    </div>
                                                )}
                                                <div className="absolute top-2 right-2">
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => {
                                                            if (confirm("Are you sure you want to delete this property?")) {
                                                                deletePropertyMutation.mutate(property.id);
                                                            }
                                                        }}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <CardContent className="p-4">
                                                <h3 className="font-semibold text-lg mb-2">{property.title}</h3>
                                                <p className="text-sm text-muted-foreground mb-2">{property.location}</p>
                                                <div className="flex justify-between items-center">
                                                    <span className="font-bold text-lg">${property.pricePerNight}/night</span>
                                                    <span className="text-sm text-muted-foreground">{property.maxGuests} guests</span>
                                                </div>
                                                {property.amenities && property.amenities.length > 0 && (
                                                    <div className="mt-2 text-xs text-muted-foreground">
                                                        {property.amenities.length} amenities
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Building className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                    <h3
                                        className="text-lg font-semibold text-foreground mb-2"
                                        data-testid="text-no-properties-title"
                                    >
                                        {t("dashboard.no_properties_listed")}
                                    </h3>
                                    <p
                                        className="text-muted-foreground mb-6"
                                        data-testid="text-no-properties-description"
                                    >
                                        {t("dashboard.start_earning_property")}
                                    </p>
                                    <Button 
                                        data-testid="button-list-first-property"
                                        onClick={() => setPropertyDialogOpen(true)}
                                    >
                                        {t("dashboard.list_first_property")}
                                    </Button>
                                </div>
                            )
                        ) : (
                            <Card className="p-8 text-center">
                                <Building className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                <h3
                                    className="text-lg font-semibold text-foreground mb-2"
                                    data-testid="text-not-property-owner"
                                >
                                    {t(
                                        "dashboard.property_owner_access_required"
                                    )}
                                </h3>
                                <p className="text-muted-foreground">
                                    {t(
                                        "dashboard.property_owner_upgrade_message"
                                    )}
                                </p>
                            </Card>
                        )}
                    </TabsContent>
                    </>)}

                    {/* My Services - Only for service_provider */}
                    {user?.role === 'service_provider' && (<>
                    <TabsContent value="services" className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2
                                className="text-2xl font-semibold text-foreground"
                                data-testid="text-services-title"
                            >
                                {t("dashboard.my_services")}
                            </h2>
                            {(user?.role === "service_provider" ||
                            user?.role === "admin") && (
                                <Button 
                                    data-testid="button-add-service"
                                    onClick={() => setServiceDialogOpen(true)}
                                >
                                    {t("dashboard.add_service")}
                                </Button>
                            )}
                        </div>

                        {user?.role === "service_provider" ||
                        user?.role === "admin" ? (
                            <>
                                {serviceProvidersLoading ? (
                                    <div className="space-y-4">
                                        {[1, 2, 3].map((i) => (
                                            <div
                                                key={i}
                                                className="h-32 bg-muted rounded-lg animate-pulse"
                                            ></div>
                                        ))}
                                    </div>
                                ) : (() => {
                                    const myServices = serviceProviders?.filter(
                                        (sp: any) => sp.userId === user?.id
                                    ) || [];
                                    return myServices.length > 0 ? (
                                        <div className="space-y-4">
                                            {myServices.map((service: any) => (
                                                <Card key={service.id} className="p-6">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-3">
                                                                <h3 className="text-lg font-semibold text-foreground">
                                                                    {service.businessName}
                                                                </h3>
                                                                <Badge
                                                                    variant={
                                                                        service.approvalStatus === "approved"
                                                                            ? "default"
                                                                            : service.approvalStatus === "pending"
                                                                            ? "secondary"
                                                                            : "destructive"
                                                                    }
                                                                >
                                                                    {service.approvalStatus === "pending" 
                                                                        ? "⏳ Pending Approval" 
                                                                        : service.approvalStatus === "approved" 
                                                                        ? "✓ Approved" 
                                                                        : "✗ Rejected"}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-muted-foreground text-sm mb-3">
                                                                {service.description}
                                                            </p>
                                                            <div className="flex flex-wrap gap-4 text-sm">
                                                                {service.category && (
                                                                    <div className="flex items-center gap-1">
                                                                        <span className="font-medium">Category:</span>
                                                                        <span className="text-muted-foreground">{service.category.name}</span>
                                                                    </div>
                                                                )}
                                                                {service.hourlyRate && (
                                                                    <div className="flex items-center gap-1">
                                                                        <DollarSign className="w-4 h-4" />
                                                                        <span className="text-muted-foreground">
                                                                            ${parseFloat(service.hourlyRate).toFixed(2)}/hour
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                {service.location && (
                                                                    <div className="flex items-center gap-1">
                                                                        <MapPin className="w-4 h-4" />
                                                                        <span className="text-muted-foreground">{service.location}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {service.approvalStatus === "pending" && (
                                                                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                                                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                                                        🕐 Your service is awaiting approval from a city or country manager. You'll be notified once it's reviewed.
                                                                    </p>
                                                                </div>
                                                            )}
                                                            {service.approvalStatus === "rejected" && service.rejectionReason && (
                                                                <div className="mt-3 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                                                                    <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-1">
                                                                        Rejection Reason:
                                                                    </p>
                                                                    <p className="text-sm text-red-600 dark:text-red-400">
                                                                        {service.rejectionReason}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <UserCheck className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                            <h3
                                                className="text-lg font-semibold text-foreground mb-2"
                                                data-testid="text-no-services-title"
                                            >
                                                {t("dashboard.no_services_listed")}
                                            </h3>
                                            <p
                                                className="text-muted-foreground mb-6"
                                                data-testid="text-no-services-description"
                                            >
                                                {t("dashboard.start_earning_service")}
                                            </p>
                                            <Button 
                                                data-testid="button-list-first-service"
                                                onClick={() => setServiceDialogOpen(true)}
                                            >
                                                {t("dashboard.list_first_service")}
                                            </Button>
                                        </div>
                                    );
                                })()}
                            </>
                        ) : (
                            <Card className="p-8 text-center">
                                <UserCheck className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                <h3
                                    className="text-lg font-semibold text-foreground mb-2"
                                    data-testid="text-not-service-provider"
                                >
                                    {t(
                                        "dashboard.service_provider_access_required"
                                    )}
                                </h3>
                                <p className="text-muted-foreground">
                                    Service provider features require a separate service provider account. 
                                    Please register at <a href="/register-provider" className="text-primary hover:underline">register-provider</a> to offer your services.
                                </p>
                            </Card>
                        )}
                    </TabsContent>
                    </>)}

                    {/* Notifications */}
                    <TabsContent value="notifications" className="space-y-6">
                        <h2 className="text-2xl font-semibold text-foreground">
                            Notifications
                        </h2>

                        {notificationsLoading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className="h-24 bg-muted rounded-lg animate-pulse"
                                    ></div>
                                ))}
                            </div>
                        ) : notifications && notifications.length > 0 ? (
                            <div className="space-y-4">
                                {notifications.map((notification: any) => (
                                    <Card
                                        key={notification.id}
                                        className={`p-4 ${
                                            !notification.isRead
                                                ? "border-primary bg-primary/5"
                                                : ""
                                        }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h3 className="font-semibold text-foreground">
                                                        {notification.title}
                                                    </h3>
                                                    {!notification.isRead && (
                                                        <Badge
                                                            variant="default"
                                                            className="text-xs"
                                                        >
                                                            New
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-muted-foreground text-sm mb-2">
                                                    {notification.message}
                                                </p>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Badge variant="outline">
                                                        {notification.type}
                                                    </Badge>
                                                    <span>
                                                        {new Date(
                                                            notification.createdAt
                                                        ).toLocaleDateString()}{" "}
                                                        {new Date(
                                                            notification.createdAt
                                                        ).toLocaleTimeString()}
                                                    </span>
                                                </div>
                                            </div>
                                            {!notification.isRead && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        markNotificationAsReadMutation.mutate(
                                                            notification.id
                                                        )
                                                    }
                                                    disabled={
                                                        markNotificationAsReadMutation.isPending
                                                    }
                                                >
                                                    <Check className="w-4 h-4 mr-1" />
                                                    Mark as read
                                                </Button>
                                            )}
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card className="p-8 text-center">
                                <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-foreground mb-2">
                                    No Notifications
                                </h3>
                                <p className="text-muted-foreground">
                                    You're all caught up! You'll receive notifications here for bookings, messages, and important updates.
                                </p>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Profile */}
                    <TabsContent value="profile" className="space-y-6">
                        <h2
                            className="text-2xl font-semibold text-foreground"
                            data-testid="text-profile-title"
                        >
                            {t("dashboard.profile_settings")}
                        </h2>

                        <Card className="p-6">
                            <div className="flex items-center space-x-6 mb-6">
                                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                                    {user?.profileImageUrl ? (
                                        <img
                                            src={user.profileImageUrl}
                                            alt="Profile"
                                            className="w-20 h-20 rounded-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-2xl font-bold text-primary">
                                            {user?.firstName?.[0]?.toUpperCase() ||
                                                "U"}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <h3
                                        className="text-xl font-semibold text-foreground"
                                        data-testid="text-profile-name"
                                    >
                                        {user?.firstName} {user?.lastName}
                                    </h3>
                                    <p
                                        className="text-muted-foreground"
                                        data-testid="text-profile-email"
                                    >
                                        {user?.email}
                                    </p>
                                    <Badge
                                        variant="outline"
                                        data-testid="text-profile-role"
                                    >
                                        {user?.role
                                            ?.replace("_", " ")
                                            .toUpperCase()}
                                    </Badge>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-foreground">
                                        {t("auth.first_name")}
                                    </label>
                                    <p
                                        className="text-muted-foreground"
                                        data-testid="text-profile-firstname"
                                    >
                                        {user?.firstName ||
                                            t("dashboard.not_provided")}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-foreground">
                                        {t("auth.last_name")}
                                    </label>
                                    <p
                                        className="text-muted-foreground"
                                        data-testid="text-profile-lastname"
                                    >
                                        {user?.lastName ||
                                            t("dashboard.not_provided")}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-foreground">
                                        {t("auth.email")}
                                    </label>
                                    <p
                                        className="text-muted-foreground"
                                        data-testid="text-profile-email-detail"
                                    >
                                        {user?.email ||
                                            t("dashboard.not_provided")}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-foreground">
                                        {t("dashboard.member_since")}
                                    </label>
                                    <p
                                        className="text-muted-foreground"
                                        data-testid="text-profile-member-since"
                                    >
                                        {user?.createdAt
                                            ? new Date(
                                                  user.createdAt
                                              ).toLocaleDateString()
                                            : t("dashboard.unknown")}
                                    </p>
                                </div>
                            </div>
                        </Card>

                        {/* Change Password */}
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold text-foreground mb-4">
                                Change Password
                            </h3>
                            <ChangePasswordForm />
                        </Card>

                        {/* Role Switcher */}
                        <RoleSwitcher />
                    </TabsContent>
                </Tabs>
            </div>

            {/* Booking Cancellation Dialog */}
            <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {t("dashboard.cancel_booking")}
                        </DialogTitle>
                        <DialogDescription>
                            {t("dashboard.cancel_booking_description")}
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...cancellationForm}>
                        <form
                            onSubmit={cancellationForm.handleSubmit(
                                handleCancelBooking
                            )}
                            className="space-y-4"
                        >
                            <FormField
                                control={cancellationForm.control}
                                name="reason"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {t(
                                                "dashboard.cancellation_reason_required"
                                            )}
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder={t(
                                                    "dashboard.cancellation_reason_placeholder"
                                                )}
                                                rows={5}
                                                {...field}
                                                data-testid="textarea-cancel-reason"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end space-x-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setCancelDialogOpen(false);
                                        setSelectedBookingForCancel(null);
                                        cancellationForm.reset();
                                    }}
                                    disabled={cancelBookingMutation.isPending}
                                    data-testid="button-cancel-request"
                                >
                                    {t("common.back")}
                                </Button>
                                <Button
                                    type="submit"
                                    variant="destructive"
                                    disabled={cancelBookingMutation.isPending}
                                    data-testid="button-submit-cancellation"
                                >
                                    {cancelBookingMutation.isPending
                                        ? t("dashboard.submitting")
                                        : t("dashboard.submit_cancellation")}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Property Creation Modal */}
            <Dialog open={propertyDialogOpen} onOpenChange={setPropertyDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Add New Property</DialogTitle>
                        <DialogDescription>
                            List your property to start earning. Fill in the basic details below.
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...propertyForm}>
                        <form
                            onSubmit={propertyForm.handleSubmit((values) =>
                                createPropertyMutation.mutate(values)
                            )}
                            className="space-y-4"
                        >
                            <FormField
                                control={propertyForm.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Property Title *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Cozy 2BR apartment in downtown" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={propertyForm.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Describe your property..." rows={3} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={propertyForm.control}
                                name="location"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Location *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="City, Country" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={propertyForm.control}
                                    name="pricePerNight"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Price per Night ($) *</FormLabel>
                                            <FormControl>
                                                <Input type="number" min="1" step="0.01" placeholder="100" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={propertyForm.control}
                                    name="maxGuests"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Max Guests *</FormLabel>
                                            <FormControl>
                                                <Input type="number" min="1" placeholder="2" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={propertyForm.control}
                                    name="bedrooms"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Bedrooms *</FormLabel>
                                            <FormControl>
                                                <Input type="number" min="1" placeholder="1" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={propertyForm.control}
                                    name="bathrooms"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Bathrooms *</FormLabel>
                                            <FormControl>
                                                <Input type="number" min="1" placeholder="1" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* GPS Coordinates */}
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={propertyForm.control}
                                    name="latitude"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Latitude (Optional)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.000001" placeholder="37.7749" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={propertyForm.control}
                                    name="longitude"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Longitude (Optional)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.000001" placeholder="-122.4194" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Amenities */}
                            <FormField
                                control={propertyForm.control}
                                name="amenities"
                                render={() => (
                                    <FormItem>
                                        <FormLabel>Amenities</FormLabel>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                                            {AMENITIES.map((amenity) => (
                                                <FormField
                                                    key={amenity.id}
                                                    control={propertyForm.control}
                                                    name="amenities"
                                                    render={({ field }) => {
                                                        return (
                                                            <FormItem
                                                                key={amenity.id}
                                                                className="flex flex-row items-start space-x-2 space-y-0"
                                                            >
                                                                <FormControl>
                                                                    <Checkbox
                                                                        checked={field.value?.includes(amenity.id)}
                                                                        onCheckedChange={(checked) => {
                                                                            return checked
                                                                                ? field.onChange([...field.value, amenity.id])
                                                                                : field.onChange(
                                                                                      field.value?.filter(
                                                                                          (value) => value !== amenity.id
                                                                                      )
                                                                                  );
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                                <FormLabel className="text-sm font-normal cursor-pointer">
                                                                    {amenity.label}
                                                                </FormLabel>
                                                            </FormItem>
                                                        );
                                                    }}
                                                />
                                            ))}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end space-x-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setPropertyDialogOpen(false);
                                        propertyForm.reset();
                                    }}
                                    disabled={createPropertyMutation.isPending}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={createPropertyMutation.isPending}>
                                    {createPropertyMutation.isPending ? "Adding..." : "Add Property"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Service Creation Modal */}
            <Dialog open={serviceDialogOpen} onOpenChange={setServiceDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Add New Service</DialogTitle>
                        <DialogDescription>
                            Submit your service application. Once approved by a city or country manager, your service will be visible to clients.
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...serviceForm}>
                        <form
                            onSubmit={serviceForm.handleSubmit((values) =>
                                createServiceMutation.mutate(values)
                            )}
                            className="space-y-4"
                        >
                            <FormField
                                control={serviceForm.control}
                                name="categoryId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Service Category *</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {serviceCategories?.map((category: any) => (
                                                    <SelectItem key={category.id} value={category.id}>
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={serviceForm.control}
                                name="businessName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Business Name *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Your business name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={serviceForm.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description *</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Describe your service..."
                                                rows={4}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={serviceForm.control}
                                    name="hourlyRate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Hourly Rate ($)</FormLabel>
                                            <FormControl>
                                                <Input type="number" min="1" step="0.01" placeholder="50" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={serviceForm.control}
                                    name="location"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Location</FormLabel>
                                            <FormControl>
                                                <Input placeholder="City, Country" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="flex justify-end space-x-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setServiceDialogOpen(false);
                                        serviceForm.reset();
                                    }}
                                    disabled={createServiceMutation.isPending}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={createServiceMutation.isPending}>
                                    {createServiceMutation.isPending ? "Adding..." : "Add Service"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Contact Support Modal */}
            <Dialog open={contactSupportDialogOpen} onOpenChange={setContactSupportDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Contact Support</DialogTitle>
                        <DialogDescription>
                            Send a message to our support team and we'll get back to you as soon as possible.
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...contactSupportForm}>
                        <form
                            onSubmit={contactSupportForm.handleSubmit(handleContactSupportSubmit)}
                            className="space-y-4"
                        >
                            <FormField
                                control={contactSupportForm.control}
                                name="message"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Your Message *</FormLabel>
                                        <FormControl>
                                            <Textarea 
                                                placeholder="Describe your issue or question..." 
                                                rows={5} 
                                                {...field} 
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end space-x-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setContactSupportDialogOpen(false);
                                        contactSupportForm.reset();
                                    }}
                                    disabled={contactSupportMutation.isPending}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={contactSupportMutation.isPending}>
                                    {contactSupportMutation.isPending ? "Sending..." : "Send Message"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <Footer />
        </div>
    );
}
