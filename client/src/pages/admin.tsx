import ActivityLogs from "@/components/admin/ActivityLogs";
import CancellationManagement from "@/components/admin/CancellationManagement";
import CMSSettings from "@/components/admin/CMSSettings";
import CreateStaffAccount from "@/components/admin/CreateStaffAccount";
import EmailTemplates from "@/components/admin/EmailTemplates";
import EnhancedOverview from "@/components/admin/EnhancedOverview";
import PlatformSettings from "@/components/admin/PlatformSettings";
import PromotionalCodes from "@/components/admin/PromotionalCodes";
import PropertyServiceAssociation from "@/components/admin/PropertyServiceAssociation";
import RoleChangeRequests from "@/components/admin/RoleChangeRequests";
import TerritoryManagement from "@/components/admin/TerritoryManagement";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
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
    SidebarDrawer,
    SidebarDrawerClose,
    SidebarDrawerContent,
} from "@/components/ui/sidebar-drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
    Activity,
    Ban,
    Briefcase,
    Building,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Edit,
    Eye,
    FileText,
    Globe,
    Home,
    LayoutDashboard,
    Link2,
    LogOut,
    Mail,
    MapPin,
    Menu,
    Phone,
    Plus,
    Search,
    Settings,
    Tag,
    Trash2,
    User,
    UserCheck,
    UserPlus,
    Users,
    X,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface AdminStats {
    totalUsers: number;
    totalProperties: number;
    totalServiceProviders: number;
    totalBookings: number;
}

interface User {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: string;
    createdAt: string;
    phoneNumber?: string;
    isActive?: boolean;
}

interface Property {
    id: string;
    title: string;
    location: string;
    pricePerNight: number;
    maxGuests: number;
    bedrooms: number;
    bathrooms: number;
    images?: string[];
    amenities?: string[];
}

interface Booking {
    id: string;
    bookingCode?: string;
    propertyId?: string;
    clientId?: string;
    status: string;
    guests?: number;
    checkIn?: string;
    checkOut?: string;
    totalAmount?: number;
    paymentStatus?: string;
    property?: Property;
    client?: User;
    propertyTotal?: number;
    servicesTotal?: number;
    discountAmount?: number;
    serviceBookings?: Array<{
        id: string;
        serviceName: string;
        serviceDate: string;
        price: number;
    }>;
}

interface ServiceProvider {
    id: string;
    userId: string;
    categoryId: string;
    businessName: string;
    description?: string;
    hourlyRate?: number;
    fixedRate?: number;
    location?: string;
    radius?: number;
    certifications?: string[];
    isVerified: boolean;
    isActive: boolean;
    approvalStatus?: string;
    rating?: string;
    reviewCount?: number;
}

interface ServiceCategory {
    id: string;
    name: string;
    description?: string;
    icon?: string;
}

interface ServiceOrder {
    id: string;
    orderCode: string;
    serviceProviderId?: string;
    clientId?: string;
    status: string;
    serviceDate?: string;
    startTime?: string;
    endTime?: string;
    totalAmount?: number;
    paymentStatus?: string;
    specialInstructions?: string;
    createdAt: string;
}

export default function AdminDashboard() {
    const { t } = useTranslation();
    const { user, logout } = useAuth();
    const { toast } = useToast();

    // Helper function to get booking status label
    const getBookingStatusLabel = (status: string) => {
        switch (status) {
            case "pending":
                return t("dashboard.pending");
            case "pending_payment":
                return t("dashboard.pending_payment");
            case "confirmed":
                return t("dashboard.confirmed");
            case "completed":
                return t("dashboard.completed");
            case "cancelled":
                return t("dashboard.cancelled");
            default:
                return t("dashboard.pending");
        }
    };
    const [activeSection, setActiveSection] = useState("overview");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [propertyDialogOpen, setPropertyDialogOpen] = useState(false);
    const [editingProperty, setEditingProperty] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
        null
    );
    const [bookingDetailsDialogOpen, setBookingDetailsDialogOpen] =
        useState(false);
    const [serviceProviderDialogOpen, setServiceProviderDialogOpen] =
        useState(false);
    const [editingProvider, setEditingProvider] = useState<any>(null);
    const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any>(null);

    // Redirect if not admin
    if (user?.role !== "admin") {
        window.location.href = "/dashboard";
        return null;
    }

    // Admin data queries
    const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
        queryKey: ["/api/admin/stats"],
    });

    const { data: users, isLoading: usersLoading } = useQuery<User[]>({
        queryKey: ["/api/admin/users"],
    });

    const { data: properties, isLoading: propertiesLoading } = useQuery<
        Property[]
    >({
        queryKey: ["/api/admin/properties"],
    });

    const { data: bookings, isLoading: bookingsLoading } = useQuery<Booking[]>({
        queryKey: ["/api/admin/bookings"],
    });

    const { data: bookingDetails, isLoading: bookingDetailsLoading } =
        useQuery<Booking>({
            queryKey: ["/api/admin/bookings", selectedBookingId],
            enabled: !!selectedBookingId && bookingDetailsDialogOpen,
        });

    const { data: serviceOrders, isLoading: serviceOrdersLoading } = useQuery<
        ServiceOrder[]
    >({
        queryKey: ["/api/admin/service-orders"],
    });

    const { data: serviceProviders, isLoading: providersLoading } = useQuery<
        ServiceProvider[]
    >({
        queryKey: ["/api/admin/service-providers"],
    });

    const { data: serviceCategories } = useQuery<ServiceCategory[]>({
        queryKey: ["/api/service-categories"],
    });

    // Update booking status mutation
    const updateBookingStatusMutation = useMutation({
        mutationFn: async ({
            bookingId,
            status,
        }: {
            bookingId: string;
            status: string;
        }) => {
            const response = await apiRequest(
                "PATCH",
                `/api/admin/bookings/${bookingId}/status`,
                { status }
            );
            return await response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["/api/admin/bookings"],
            });
            toast({
                title: t("common.success"),
                description: t("admin.booking_status_updated"),
            });
        },
        onError: () => {
            toast({
                title: t("common.error"),
                description: t("errors.booking_status_update_failed"),
                variant: "destructive",
            });
        },
    });

    // Update service order status mutation
    const updateServiceOrderStatusMutation = useMutation({
        mutationFn: async ({
            orderId,
            status,
        }: {
            orderId: string;
            status: string;
        }) => {
            const response = await apiRequest(
                "PATCH",
                `/api/admin/service-orders/${orderId}/status`,
                { status }
            );
            return await response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["/api/admin/service-orders"],
            });
            toast({
                title: t("common.success"),
                description: t("admin.order_status_updated"),
            });
        },
        onError: () => {
            toast({
                title: t("common.error"),
                description: t("errors.order_status_update_failed"),
                variant: "destructive",
            });
        },
    });

    // Property form state
    const [propertyForm, setPropertyForm] = useState({
        title: "",
        description: "",
        location: "",
        pricePerNight: "",
        maxGuests: "",
        bedrooms: "",
        bathrooms: "",
        amenities: "",
        images: "",
    });

    // Service provider form state
    const [providerForm, setProviderForm] = useState({
        userId: "",
        categoryId: "",
        businessName: "",
        description: "",
        hourlyRate: "",
        fixedRate: "",
        location: "",
        radius: "50",
        certifications: "",
        isVerified: false,
        isActive: true,
    });

    // Category form state
    const [categoryForm, setCategoryForm] = useState({
        name: "",
        description: "",
        icon: "",
    });

    // Create/Update property mutation
    const savePropertyMutation = useMutation({
        mutationFn: async (data: any) => {
            const url = editingProperty
                ? `/api/admin/properties/${editingProperty.id}`
                : "/api/admin/properties";

            const propertyData = {
                ...data,
                ownerId: user?.id,
                pricePerNight: parseFloat(data.pricePerNight),
                maxGuests: parseInt(data.maxGuests),
                bedrooms: parseInt(data.bedrooms),
                bathrooms: parseInt(data.bathrooms),
                amenities: data.amenities
                    ? data.amenities.split(",").map((a: string) => a.trim())
                    : [],
                images: data.images
                    ? data.images.split(",").map((i: string) => i.trim())
                    : [],
            };

            return await apiRequest(
                editingProperty ? "PUT" : "POST",
                url,
                propertyData
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["/api/admin/properties"],
            });
            queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
            toast({
                title: t("common.success"),
                description: editingProperty
                    ? t("admin.property_updated")
                    : t("admin.property_created"),
            });
            setPropertyDialogOpen(false);
            setEditingProperty(null);
            resetPropertyForm();
        },
        onError: (error: any) => {
            toast({
                title: t("common.error"),
                description: error.message || t("errors.save_property_failed"),
                variant: "destructive",
            });
        },
    });

    // Delete property mutation
    const deletePropertyMutation = useMutation({
        mutationFn: async (id: string) => {
            return await apiRequest("DELETE", `/api/admin/properties/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["/api/admin/properties"],
            });
            queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
            toast({
                title: t("common.success"),
                description: t("admin.property_deleted"),
            });
        },
        onError: (error: any) => {
            toast({
                title: t("common.error"),
                description:
                    error.message || t("errors.delete_property_failed"),
                variant: "destructive",
            });
        },
    });

    // Assign role mutation
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
                description: t("admin.role_updated"),
            });
        },
        onError: (error: any) => {
            toast({
                title: t("common.error"),
                description: error.message || t("errors.role_update_failed"),
                variant: "destructive",
            });
        },
    });

    // Toggle user active status mutation
    const toggleUserActiveMutation = useMutation({
        mutationFn: async (userId: string) => {
            return await apiRequest("PATCH", `/api/users/${userId}/toggle-active`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
            queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
            toast({
                title: t("common.success"),
                description: "User account status updated successfully",
            });
        },
        onError: (error: any) => {
            toast({
                title: t("common.error"),
                description: error.message || "Failed to update user status",
                variant: "destructive",
            });
        },
    });

    const resetPropertyForm = () => {
        setPropertyForm({
            title: "",
            description: "",
            location: "",
            pricePerNight: "",
            maxGuests: "",
            bedrooms: "",
            bathrooms: "",
            amenities: "",
            images: "",
        });
    };

    const handleEditProperty = (property: any) => {
        setEditingProperty(property);
        setPropertyForm({
            title: property.title || "",
            description: property.description || "",
            location: property.location || "",
            pricePerNight: property.pricePerNight || "",
            maxGuests: property.maxGuests?.toString() || "",
            bedrooms: property.bedrooms?.toString() || "",
            bathrooms: property.bathrooms?.toString() || "",
            amenities: Array.isArray(property.amenities)
                ? property.amenities.join(", ")
                : "",
            images: Array.isArray(property.images)
                ? property.images.join(", ")
                : "",
        });
        setPropertyDialogOpen(true);
    };

    // Service provider mutations
    const saveProviderMutation = useMutation({
        mutationFn: async (data: any) => {
            const url = editingProvider
                ? `/api/admin/service-providers/${editingProvider.id}`
                : "/api/admin/service-providers";

            const method = editingProvider ? "PATCH" : "POST";
            const response = await apiRequest(method, url, data);
            return await response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["/api/admin/service-providers"],
            });
            queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
            toast({
                title: t("common.success"),
                description: editingProvider
                    ? t("admin.provider_updated")
                    : t("admin.provider_created"),
            });
            setServiceProviderDialogOpen(false);
            setEditingProvider(null);
            resetProviderForm();
        },
        onError: (error: any) => {
            toast({
                title: t("common.error"),
                description: error.message || t("errors.save_provider_failed"),
                variant: "destructive",
            });
        },
    });

    const deleteProviderMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await apiRequest(
                "DELETE",
                `/api/admin/service-providers/${id}`
            );
            return await response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["/api/admin/service-providers"],
            });
            queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
            toast({
                title: t("common.success"),
                description: t("admin.provider_deleted"),
            });
        },
        onError: (error: any) => {
            toast({
                title: t("common.error"),
                description:
                    error.message || t("errors.delete_provider_failed"),
                variant: "destructive",
            });
        },
    });

    const approveProviderMutation = useMutation({
        mutationFn: async (providerId: string) => {
            const response = await apiRequest(
                "POST",
                `/api/admin/providers/${providerId}/approve`
            );
            return await response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["/api/admin/service-providers"],
            });
            queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
            toast({
                title: t("common.success"),
                description: t("admin.provider_updated"),
            });
        },
        onError: (error: any) => {
            toast({
                title: t("common.error"),
                description: error.message || "Failed to approve provider",
                variant: "destructive",
            });
        },
    });

    const rejectProviderMutation = useMutation({
        mutationFn: async ({
            providerId,
            reason,
        }: {
            providerId: string;
            reason?: string;
        }) => {
            const response = await apiRequest(
                "POST",
                `/api/admin/providers/${providerId}/reject`,
                { reason }
            );
            return await response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["/api/admin/service-providers"],
            });
            queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
            toast({
                title: t("common.success"),
                description: t("admin.provider_updated"),
            });
        },
        onError: (error: any) => {
            toast({
                title: t("common.error"),
                description: error.message || "Failed to reject provider",
                variant: "destructive",
            });
        },
    });

    // Category mutations
    const saveCategoryMutation = useMutation({
        mutationFn: async (data: any) => {
            const url = editingCategory
                ? `/api/admin/service-categories/${editingCategory.id}`
                : "/api/admin/service-categories";
            const method = editingCategory ? "PATCH" : "POST";
            const response = await apiRequest(method, url, data);
            return await response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["/api/service-categories"],
            });
            toast({
                title: "Success",
                description: editingCategory
                    ? "Category updated successfully"
                    : "Category created successfully",
            });
            setCategoryDialogOpen(false);
            setEditingCategory(null);
            resetCategoryForm();
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.message || "Failed to save category",
                variant: "destructive",
            });
        },
    });

    const deleteCategoryMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await apiRequest(
                "DELETE",
                `/api/admin/service-categories/${id}`
            );
            return await response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["/api/service-categories"],
            });
            toast({
                title: "Success",
                description: "Category deleted successfully",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.message || "Failed to delete category",
                variant: "destructive",
            });
        },
    });

    const resetProviderForm = () => {
        setProviderForm({
            userId: "",
            categoryId: "",
            businessName: "",
            description: "",
            hourlyRate: "",
            fixedRate: "",
            location: "",
            radius: "50",
            certifications: "",
            isVerified: false,
            isActive: true,
        });
    };

    const handleEditProvider = (provider: any) => {
        setEditingProvider(provider);
        setProviderForm({
            userId: provider.userId || "",
            categoryId: provider.categoryId || "",
            businessName: provider.businessName || "",
            description: provider.description || "",
            hourlyRate: provider.hourlyRate || "",
            fixedRate: provider.fixedRate || "",
            location: provider.location || "",
            radius: provider.radius?.toString() || "50",
            certifications: Array.isArray(provider.certifications)
                ? provider.certifications.join(", ")
                : "",
            isVerified: provider.isVerified || false,
            isActive: provider.isActive !== false,
        });
        setServiceProviderDialogOpen(true);
    };

    const handleNewProvider = () => {
        setEditingProvider(null);
        resetProviderForm();
        setServiceProviderDialogOpen(true);
    };

    const handleNewProperty = () => {
        setEditingProvider(null);
        resetPropertyForm();
        setPropertyDialogOpen(true);
    };

    const resetCategoryForm = () => {
        setCategoryForm({
            name: "",
            description: "",
            icon: "",
        });
    };

    const handleEditCategory = (category: any) => {
        setEditingCategory(category);
        setCategoryForm({
            name: category.name || "",
            description: category.description || "",
            icon: category.icon || "",
        });
        setCategoryDialogOpen(true);
    };

    const handleNewCategory = () => {
        setEditingCategory(null);
        resetCategoryForm();
        setCategoryDialogOpen(true);
    };

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            {/* Mobile Menu Button */}
            <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700"
                aria-label="Open menu"
            >
                <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>

            {/* Mobile Drawer */}
            <SidebarDrawer open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SidebarDrawerContent className="bg-white dark:bg-gray-800">
                    <div className="flex flex-col h-full">
                        <div className="p-4 flex items-start justify-between border-b border-gray-200 dark:border-gray-700">
                            <div className="flex-1">
                                <h1 className="text-xl font-bold text-primary">
                                    {t("admin.title")}
                                </h1>
                                <p className="text-xs text-muted-foreground mt-1">
                                    TravelHub
                                </p>
                            </div>
                            <SidebarDrawerClose className="p-2 -mt-1 -mr-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                                <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                            </SidebarDrawerClose>
                        </div>

                        <nav className="flex flex-col flex-1 px-4 space-y-2 overflow-y-auto py-4">
                            <button
                                onClick={() => {
                                    setActiveSection("overview");
                                    setSidebarOpen(false);
                                }}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                                    activeSection === "overview"
                                        ? "bg-primary text-primary-foreground"
                                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                }`}
                            >
                                <LayoutDashboard className="w-5 h-5" />
                                <span className="text-sm">
                                    {t("admin.overview")}
                                </span>
                            </button>

                            <button
                                onClick={() => {
                                    setActiveSection("users");
                                    setSidebarOpen(false);
                                }}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                                    activeSection === "users"
                                        ? "bg-primary text-primary-foreground"
                                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                }`}
                            >
                                <Users className="w-5 h-5" />
                                <span className="text-sm">
                                    {t("admin.users")}
                                </span>
                            </button>

                            <button
                                onClick={() => {
                                    setActiveSection("role-requests");
                                    setSidebarOpen(false);
                                }}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                                    activeSection === "role-requests"
                                        ? "bg-primary text-primary-foreground"
                                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                }`}
                            >
                                <UserCheck className="w-5 h-5" />
                                <span className="text-sm">
                                    Role Requests
                                </span>
                            </button>

                            <button
                                onClick={() => {
                                    setActiveSection("properties");
                                    setSidebarOpen(false);
                                }}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                                    activeSection === "properties"
                                        ? "bg-primary text-primary-foreground"
                                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                }`}
                            >
                                <Building className="w-5 h-5" />
                                <span className="text-sm">
                                    {t("dashboard.properties")}
                                </span>
                            </button>

                            <button
                                onClick={() => {
                                    setActiveSection("providers");
                                    setSidebarOpen(false);
                                }}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                                    activeSection === "providers"
                                        ? "bg-primary text-primary-foreground"
                                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                }`}
                            >
                                <Briefcase className="w-5 h-5" />
                                <span className="text-sm">
                                    {t("dashboard.service_providers")}
                                </span>
                            </button>

                            <button
                                onClick={() => {
                                    setActiveSection("services");
                                    setSidebarOpen(false);
                                }}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                                    activeSection === "services"
                                        ? "bg-primary text-primary-foreground"
                                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                }`}
                            >
                                <Settings className="w-5 h-5" />
                                <span className="text-sm">
                                    {t("dashboard.services")}
                                </span>
                            </button>

                            <button
                                onClick={() => {
                                    setActiveSection("bookings");
                                    setSidebarOpen(false);
                                }}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                                    activeSection === "bookings"
                                        ? "bg-primary text-primary-foreground"
                                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                }`}
                            >
                                <Calendar className="w-5 h-5" />
                                <span className="text-sm">
                                    {t("dashboard.bookings")}
                                </span>
                            </button>

                            <button
                                onClick={() => {
                                    setActiveSection("service-orders");
                                    setSidebarOpen(false);
                                }}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                                    activeSection === "service-orders"
                                        ? "bg-primary text-primary-foreground"
                                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                }`}
                            >
                                <Briefcase className="w-5 h-5" />
                                <span className="text-sm">
                                    {t("admin.service_orders")}
                                </span>
                            </button>

                            <button
                                onClick={() => {
                                    setActiveSection("cms");
                                    setSidebarOpen(false);
                                }}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                                    activeSection === "cms"
                                        ? "bg-primary text-primary-foreground"
                                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                }`}
                            >
                                <FileText className="w-5 h-5" />
                                <span className="text-sm">CMS Content</span>
                            </button>

                            <button
                                onClick={() => {
                                    setActiveSection("platform");
                                    setSidebarOpen(false);
                                }}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                                    activeSection === "platform"
                                        ? "bg-primary text-primary-foreground"
                                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                }`}
                            >
                                <Settings className="w-5 h-5" />
                                <span className="text-sm">{t("admin.platform_settings")}</span>
                            </button>

                            <button
                                onClick={() => {
                                    setActiveSection("associations");
                                    setSidebarOpen(false);
                                }}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                                    activeSection === "associations"
                                        ? "bg-primary text-primary-foreground"
                                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                }`}
                            >
                                <Link2 className="w-5 h-5" />
                                <span className="text-sm">{t("admin.property_service_assoc")}</span>
                            </button>

                            <button
                                onClick={() => {
                                    setActiveSection("promocodes");
                                    setSidebarOpen(false);
                                }}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                                    activeSection === "promocodes"
                                        ? "bg-primary text-primary-foreground"
                                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                }`}
                            >
                                <Tag className="w-5 h-5" />
                                <span className="text-sm">{t("admin.promo_codes")}</span>
                            </button>

                            <button
                                onClick={() => {
                                    setActiveSection("cancellations");
                                    setSidebarOpen(false);
                                }}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                                    activeSection === "cancellations"
                                        ? "bg-primary text-primary-foreground"
                                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                }`}
                            >
                                <Ban className="w-5 h-5" />
                                <span className="text-sm">{t("admin.cancellations")}</span>
                            </button>

                            <button
                                onClick={() => {
                                    setActiveSection("territories");
                                    setSidebarOpen(false);
                                }}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                                    activeSection === "territories"
                                        ? "bg-primary text-primary-foreground"
                                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                }`}
                            >
                                <Globe className="w-5 h-5" />
                                <span className="text-sm">{t("admin.territories")}</span>
                            </button>

                            <button
                                onClick={() => {
                                    setActiveSection("emails");
                                    setSidebarOpen(false);
                                }}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                                    activeSection === "emails"
                                        ? "bg-primary text-primary-foreground"
                                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                }`}
                            >
                                <Mail className="w-5 h-5" />
                                <span className="text-sm">{t("admin.email_templates")}</span>
                            </button>

                            <button
                                onClick={() => {
                                    setActiveSection("logs");
                                    setSidebarOpen(false);
                                }}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                                    activeSection === "logs"
                                        ? "bg-primary text-primary-foreground"
                                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                }`}
                            >
                                <Activity className="w-5 h-5" />
                                <span className="text-sm">{t("admin.activity_logs")}</span>
                            </button>

                            <button
                                onClick={() => {
                                    setActiveSection("staff");
                                    setSidebarOpen(false);
                                }}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                                    activeSection === "staff"
                                        ? "bg-primary text-primary-foreground"
                                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                }`}
                            >
                                <UserPlus className="w-5 h-5" />
                                <span className="text-sm">{t("admin_labels.internal_staff")}</span>
                            </button>
                        </nav>

                        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <span className="text-sm font-semibold text-primary">
                                        {user?.firstName?.[0] ||
                                            user?.email[0].toUpperCase()}
                                    </span>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-foreground truncate">
                                        {user?.firstName && user?.lastName
                                            ? `${user.firstName} ${user.lastName}`
                                            : "Admin"}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">
                                        {user?.email}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    onClick={() => window.location.href = '/'}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    <Home className="w-4 h-4 mr-2" />
                                    {t("common.home")}
                                </Button>
                                <Button
                                    onClick={logout}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    {t("common.logout")}
                                </Button>
                            </div>
                        </div>
                    </div>
                </SidebarDrawerContent>
            </SidebarDrawer>

            {/* Desktop Sidebar */}
            <div className="hidden md:flex md:w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-col">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-primary">
                        {t("admin.title")}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        TravelHub
                    </p>
                </div>

                <nav className="flex flex-col flex-1 px-4 space-y-2 overflow-y-auto">
                    <button
                        onClick={() => setActiveSection("overview")}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                            activeSection === "overview"
                                ? "bg-primary text-primary-foreground"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                    >
                        <LayoutDashboard className="w-5 h-5" />
                        <span className="text-sm">{t("admin.overview")}</span>
                    </button>

                    <button
                        onClick={() => setActiveSection("users")}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                            activeSection === "users"
                                ? "bg-primary text-primary-foreground"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                    >
                        <Users className="w-5 h-5" />
                        <span className="text-sm">{t("admin.users")}</span>
                    </button>

                    <button
                        onClick={() => setActiveSection("role-requests")}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                            activeSection === "role-requests"
                                ? "bg-primary text-primary-foreground"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                        data-testid="nav-role-requests"
                    >
                        <UserCheck className="w-5 h-5" />
                        <span className="text-sm">Role Requests</span>
                    </button>

                    <button
                        onClick={() => setActiveSection("properties")}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                            activeSection === "properties"
                                ? "bg-primary text-primary-foreground"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                    >
                        <Building className="w-5 h-5" />
                        <span className="text-sm">
                            {t("dashboard.properties")}
                        </span>
                    </button>

                    <button
                        onClick={() => setActiveSection("providers")}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                            activeSection === "providers"
                                ? "bg-primary text-primary-foreground"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                        data-testid="nav-providers"
                    >
                        <Briefcase className="w-5 h-5" />
                        <span className="text-sm">
                            {t("dashboard.service_providers")}
                        </span>
                    </button>

                    <button
                        onClick={() => setActiveSection("services")}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                            activeSection === "services"
                                ? "bg-primary text-primary-foreground"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                        data-testid="nav-services"
                    >
                        <Settings className="w-5 h-5" />
                        <span className="text-sm">
                            {t("dashboard.services")}
                        </span>
                    </button>

                    <button
                        onClick={() => setActiveSection("bookings")}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                            activeSection === "bookings"
                                ? "bg-primary text-primary-foreground"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                        data-testid="nav-bookings"
                    >
                        <Calendar className="w-5 h-5" />
                        <span className="text-sm">
                            {t("dashboard.bookings")}
                        </span>
                    </button>

                    <button
                        onClick={() => setActiveSection("service-orders")}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                            activeSection === "service-orders"
                                ? "bg-primary text-primary-foreground"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                        data-testid="nav-service-orders"
                    >
                        <Briefcase className="w-5 h-5" />
                        <span className="text-sm">
                            {t("admin.service_orders")}
                        </span>
                    </button>

                    <button
                        onClick={() => setActiveSection("cms")}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                            activeSection === "cms"
                                ? "bg-primary text-primary-foreground"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                        data-testid="nav-cms"
                    >
                        <FileText className="w-5 h-5" />
                        <span className="text-sm">CMS Content</span>
                    </button>

                    <button
                        onClick={() => setActiveSection("platform")}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                            activeSection === "platform"
                                ? "bg-primary text-primary-foreground"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                        data-testid="nav-platform"
                    >
                        <Settings className="w-5 h-5" />
                        <span className="text-sm">{t("admin.platform_settings")}</span>
                    </button>

                    <button
                        onClick={() => setActiveSection("associations")}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                            activeSection === "associations"
                                ? "bg-primary text-primary-foreground"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                        data-testid="nav-associations"
                    >
                        <Link2 className="w-5 h-5" />
                        <span className="text-sm">{t("admin.property_service_assoc")}</span>
                    </button>

                    <button
                        onClick={() => setActiveSection("promocodes")}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                            activeSection === "promocodes"
                                ? "bg-primary text-primary-foreground"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                        data-testid="nav-promocodes"
                    >
                        <Tag className="w-5 h-5" />
                        <span className="text-sm">{t("admin.promo_codes")}</span>
                    </button>

                    <button
                        onClick={() => setActiveSection("cancellations")}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                            activeSection === "cancellations"
                                ? "bg-primary text-primary-foreground"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                        data-testid="nav-cancellations"
                    >
                        <Ban className="w-5 h-5" />
                        <span className="text-sm">{t("admin.cancellations")}</span>
                    </button>

                    <button
                        onClick={() => setActiveSection("territories")}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                            activeSection === "territories"
                                ? "bg-primary text-primary-foreground"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                        data-testid="nav-territories"
                    >
                        <Globe className="w-5 h-5" />
                        <span className="text-sm">{t("admin.territories")}</span>
                    </button>

                    <button
                        onClick={() => setActiveSection("emails")}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                            activeSection === "emails"
                                ? "bg-primary text-primary-foreground"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                        data-testid="nav-emails"
                    >
                        <Mail className="w-5 h-5" />
                        <span className="text-sm">{t("admin.email_templates")}</span>
                    </button>

                    <button
                        onClick={() => setActiveSection("logs")}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                            activeSection === "logs"
                                ? "bg-primary text-primary-foreground"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                        data-testid="nav-logs"
                    >
                        <Activity className="w-5 h-5" />
                        <span className="text-sm">{t("admin.activity_logs")}</span>
                    </button>

                    <button
                        onClick={() => setActiveSection("staff")}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                            activeSection === "staff"
                                ? "bg-primary text-primary-foreground"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                        data-testid="nav-staff"
                    >
                        <UserPlus className="w-5 h-5" />
                        <span className="text-sm">{t("admin_labels.internal_staff")}</span>
                    </button>
                </nav>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-semibold text-primary">
                                {user?.firstName?.[0] ||
                                    user?.email[0].toUpperCase()}
                            </span>
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground truncate">
                                {user?.firstName && user?.lastName
                                    ? `${user.firstName} ${user.lastName}`
                                    : "Admin"}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                                {user?.email}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={() => window.location.href = '/'}
                            variant="outline"
                            className="flex-1"
                            data-testid="button-home"
                        >
                            <Home className="w-4 h-4 mr-2" />
                            {t("common.home")}
                        </Button>
                        <Button
                            onClick={logout}
                            variant="outline"
                            className="flex-1"
                            data-testid="button-logout"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            {t("common.logout")}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                <div className="p-4 sm:p-6 md:p-8 pt-16 md:pt-8">
                    {/* Overview Section */}
                    {activeSection === "overview" && (
                        <div>
                            <h2 className="text-2xl font-bold text-foreground mb-6 md:mb-8">
                                {t("admin.overview")}
                            </h2>
                            <EnhancedOverview />
                        </div>
                    )}

                    {/* Users Section */}
                    {activeSection === "users" && (
                        <div>
                            <div className="flex items-center justify-between mb-6 sm:mb-8">
                                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                                    {t("admin.user_management")}
                                </h2>
                            </div>

                            {/* Search and Filter */}
                            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                    <Input
                                        type="text"
                                        placeholder={t("admin.search_users")}
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                        className="pl-10"
                                        data-testid="input-search-users"
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
                                                "admin_filters.filter_by_role"
                                            )}
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            {t("admin_filters.all_roles")}
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
                                        <SelectItem value="client">
                                            Client
                                        </SelectItem>
                                        <SelectItem value="property_owner">
                                            Property Owner
                                        </SelectItem>
                                        <SelectItem value="service_provider">
                                            Service Provider
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
                                    </SelectContent>
                                </Select>
                            </div>

                            {usersLoading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map((i) => (
                                        <div
                                            key={i}
                                            className="h-20 bg-muted rounded-lg animate-pulse"
                                        ></div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {(users || [])
                                        .filter((u) => {
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
                                            const matchesRole =
                                                roleFilter === "all" ||
                                                u.role === roleFilter;
                                            return matchesSearch && matchesRole;
                                        })
                                        .map((u) => (
                                            <Card
                                                key={u.id}
                                                className="p-4 sm:p-6"
                                                data-testid={`user-card-${u.id}`}
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
                                                            <div className="flex items-center gap-2">
                                                                <p className="font-semibold text-foreground text-sm sm:text-base truncate">
                                                                    {u.firstName &&
                                                                    u.lastName
                                                                        ? `${u.firstName} ${u.lastName}`
                                                                        : "No name"}
                                                                </p>
                                                                {u.isActive === false && (
                                                                    <Badge variant="destructive" className="text-xs">
                                                                        Inactive
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <p className="text-xs sm:text-sm text-muted-foreground truncate">
                                                                {u.email}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                Joined{" "}
                                                                {new Date(
                                                                    u.createdAt
                                                                ).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col sm:flex-row gap-2">
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
                                                            <SelectItem value="client">
                                                                Client
                                                            </SelectItem>
                                                            <SelectItem value="property_owner">
                                                                Property Owner
                                                            </SelectItem>
                                                            <SelectItem value="service_provider">
                                                                Service Provider
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
                                                        </SelectContent>
                                                    </Select>
                                                    {user?.id !== u.id && (
                                                        <Button
                                                            variant={u.isActive === false ? "default" : "destructive"}
                                                            size="sm"
                                                            onClick={() => {
                                                                if (confirm(
                                                                    u.isActive === false
                                                                        ? `Are you sure you want to activate ${u.email}?`
                                                                        : `Are you sure you want to deactivate ${u.email}? They will not be able to log in.`
                                                                )) {
                                                                    toggleUserActiveMutation.mutate(u.id);
                                                                }
                                                            }}
                                                            data-testid={`button-toggle-active-${u.id}`}
                                                        >
                                                            {u.isActive === false ? "Activate" : "Deactivate"}
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                            </Card>
                                        ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Role Change Requests Section */}
                    {activeSection === "role-requests" && (
                        <div>
                            <RoleChangeRequests />
                        </div>
                    )}

                    {/* Properties Section */}
                    {activeSection === "properties" && (
                        <div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
                                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                                    Property Management
                                </h2>
                                <Dialog
                                    open={propertyDialogOpen}
                                    onOpenChange={setPropertyDialogOpen}
                                >
                                    <DialogTrigger asChild>
                                        <Button
                                            onClick={handleNewProperty}
                                            data-testid="button-add-property"
                                            className="w-full sm:w-auto"
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            {t("admin_buttons.add_property")}
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                        <DialogHeader>
                                            <DialogTitle>
                                                {editingProperty
                                                    ? t(
                                                          "admin_labels.edit_property"
                                                      )
                                                    : t(
                                                          "admin_labels.add_new_property"
                                                      )}
                                            </DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="title">
                                                    {t(
                                                        "property_form.property_name"
                                                    )}{" "}
                                                    *
                                                </Label>
                                                <Input
                                                    id="title"
                                                    value={propertyForm.title}
                                                    onChange={(e) =>
                                                        setPropertyForm({
                                                            ...propertyForm,
                                                            title: e.target
                                                                .value,
                                                        })
                                                    }
                                                    placeholder={t(
                                                        "property_form.property_name_placeholder"
                                                    )}
                                                    data-testid="input-property-title"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="description">
                                                    {t(
                                                        "property_form.description"
                                                    )}
                                                </Label>
                                                <Textarea
                                                    id="description"
                                                    value={
                                                        propertyForm.description
                                                    }
                                                    onChange={(e) =>
                                                        setPropertyForm({
                                                            ...propertyForm,
                                                            description:
                                                                e.target.value,
                                                        })
                                                    }
                                                    placeholder={t(
                                                        "property_form.description_placeholder"
                                                    )}
                                                    rows={3}
                                                    data-testid="input-property-description"
                                                />
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="location">
                                                        {t(
                                                            "property_form.location"
                                                        )}{" "}
                                                        *
                                                    </Label>
                                                    <Input
                                                        id="location"
                                                        value={
                                                            propertyForm.location
                                                        }
                                                        onChange={(e) =>
                                                            setPropertyForm({
                                                                ...propertyForm,
                                                                location:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                        placeholder={t(
                                                            "property_form.location_placeholder"
                                                        )}
                                                        data-testid="input-property-location"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="pricePerNight">
                                                        {t(
                                                            "property_form.price_per_night"
                                                        )}{" "}
                                                        *
                                                    </Label>
                                                    <Input
                                                        id="pricePerNight"
                                                        type="number"
                                                        value={
                                                            propertyForm.pricePerNight
                                                        }
                                                        onChange={(e) =>
                                                            setPropertyForm({
                                                                ...propertyForm,
                                                                pricePerNight:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                        placeholder="150"
                                                        data-testid="input-property-price"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                <div>
                                                    <Label htmlFor="maxGuests">
                                                        {t(
                                                            "property_form.max_guests"
                                                        )}{" "}
                                                        *
                                                    </Label>
                                                    <Input
                                                        id="maxGuests"
                                                        type="number"
                                                        value={
                                                            propertyForm.maxGuests
                                                        }
                                                        onChange={(e) =>
                                                            setPropertyForm({
                                                                ...propertyForm,
                                                                maxGuests:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                        placeholder="4"
                                                        data-testid="input-property-guests"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="bedrooms">
                                                        {t(
                                                            "property_form.bedrooms"
                                                        )}{" "}
                                                        *
                                                    </Label>
                                                    <Input
                                                        id="bedrooms"
                                                        type="number"
                                                        value={
                                                            propertyForm.bedrooms
                                                        }
                                                        onChange={(e) =>
                                                            setPropertyForm({
                                                                ...propertyForm,
                                                                bedrooms:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                        placeholder="2"
                                                        data-testid="input-property-bedrooms"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="bathrooms">
                                                        {t(
                                                            "property_form.bathrooms"
                                                        )}{" "}
                                                        *
                                                    </Label>
                                                    <Input
                                                        id="bathrooms"
                                                        type="number"
                                                        value={
                                                            propertyForm.bathrooms
                                                        }
                                                        onChange={(e) =>
                                                            setPropertyForm({
                                                                ...propertyForm,
                                                                bathrooms:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                        placeholder="2"
                                                        data-testid="input-property-bathrooms"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <Label htmlFor="amenities">
                                                    {t(
                                                        "property_form.amenities"
                                                    )}
                                                </Label>
                                                <Input
                                                    id="amenities"
                                                    value={
                                                        propertyForm.amenities
                                                    }
                                                    onChange={(e) =>
                                                        setPropertyForm({
                                                            ...propertyForm,
                                                            amenities:
                                                                e.target.value,
                                                        })
                                                    }
                                                    placeholder={t(
                                                        "property_form.amenities_placeholder"
                                                    )}
                                                    data-testid="input-property-amenities"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="images">
                                                    {t("property_form.images")}
                                                </Label>
                                                <Textarea
                                                    id="images"
                                                    value={propertyForm.images}
                                                    onChange={(e) =>
                                                        setPropertyForm({
                                                            ...propertyForm,
                                                            images: e.target
                                                                .value,
                                                        })
                                                    }
                                                    placeholder={t(
                                                        "property_form.images_placeholder"
                                                    )}
                                                    rows={2}
                                                    data-testid="input-property-images"
                                                />
                                            </div>
                                            <div className="flex justify-end space-x-2">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => {
                                                        setPropertyDialogOpen(
                                                            false
                                                        );
                                                        setEditingProperty(
                                                            null
                                                        );
                                                        resetPropertyForm();
                                                    }}
                                                    data-testid="button-cancel-property"
                                                >
                                                    {t("common.cancel")}
                                                </Button>
                                                <Button
                                                    onClick={() =>
                                                        savePropertyMutation.mutate(
                                                            propertyForm
                                                        )
                                                    }
                                                    disabled={
                                                        savePropertyMutation.isPending ||
                                                        !propertyForm.title ||
                                                        !propertyForm.location ||
                                                        !propertyForm.pricePerNight
                                                    }
                                                    data-testid="button-save-property"
                                                >
                                                    {savePropertyMutation.isPending
                                                        ? "Saving..."
                                                        : editingProperty
                                                        ? "Update"
                                                        : "Create"}
                                                </Button>
                                            </div>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>

                            {propertiesLoading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[1, 2, 3].map((i) => (
                                        <div
                                            key={i}
                                            className="h-64 bg-muted rounded-lg animate-pulse"
                                        ></div>
                                    ))}
                                </div>
                            ) : properties && properties.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {properties.map((property) => (
                                        <Card
                                            key={property.id}
                                            className="overflow-hidden"
                                            data-testid={`property-card-${property.id}`}
                                        >
                                            <div className="h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                                {property.images &&
                                                property.images[0] ? (
                                                    <img
                                                        src={property.images[0]}
                                                        alt={property.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <Building className="w-16 h-16 text-muted-foreground" />
                                                )}
                                            </div>
                                            <div className="p-4">
                                                <h3 className="font-semibold text-lg text-foreground mb-1">
                                                    {property.title}
                                                </h3>
                                                <p className="text-sm text-muted-foreground mb-2">
                                                    {property.location}
                                                </p>
                                                <p className="text-xl font-bold text-primary mb-3">
                                                    ${property.pricePerNight}
                                                    /night
                                                </p>
                                                <div className="text-sm text-muted-foreground mb-4">
                                                    {property.maxGuests} guests
                                                    · {property.bedrooms} bed ·{" "}
                                                    {property.bathrooms} bath
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleEditProperty(
                                                                property
                                                            )
                                                        }
                                                        data-testid={`button-edit-${property.id}`}
                                                    >
                                                        <Edit className="w-4 h-4 mr-1" />
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => {
                                                            if (
                                                                confirm(
                                                                    "Are you sure you want to delete this property?"
                                                                )
                                                            ) {
                                                                deletePropertyMutation.mutate(
                                                                    property.id
                                                                );
                                                            }
                                                        }}
                                                        disabled={
                                                            deletePropertyMutation.isPending
                                                        }
                                                        data-testid={`button-delete-${property.id}`}
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-1" />
                                                        Delete
                                                    </Button>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <Card className="p-12 text-center">
                                    <Building className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-foreground mb-2">
                                        No Properties Found
                                    </h3>
                                    <p className="text-muted-foreground mb-4">
                                        Add your first property to get started
                                    </p>
                                    <Button
                                        onClick={handleNewProperty}
                                        data-testid="button-add-first-property"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Property
                                    </Button>
                                </Card>
                            )}
                        </div>
                    )}

                    {/* Service Providers Section */}
                    {activeSection === "providers" && (
                        <div>
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
                                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                                    Service Provider Management
                                </h2>
                            </div>

                            <Tabs defaultValue="all" className="space-y-6">
                                <TabsList>
                                    <TabsTrigger value="all">
                                        All Providers
                                    </TabsTrigger>
                                </TabsList>

                                {/* All Providers Tab */}
                                <TabsContent value="all" className="space-y-4">
                                    <div className="flex justify-end mb-4">
                                        <Button
                                            onClick={handleNewProvider}
                                            data-testid="button-add-provider"
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add Provider
                                        </Button>
                                    </div>

                                    <Dialog
                                        open={serviceProviderDialogOpen}
                                        onOpenChange={
                                            setServiceProviderDialogOpen
                                        }
                                    >
                                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                            <DialogHeader>
                                                <DialogTitle>
                                                    {editingProvider
                                                        ? t(
                                                              "admin_labels.edit_service_provider"
                                                          )
                                                        : t(
                                                              "admin_labels.create_service_provider"
                                                          )}
                                                </DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-4">
                                                <div>
                                                    <Label htmlFor="userId">
                                                        {t(
                                                            "admin_buttons.select_user"
                                                        )}{" "}
                                                        *
                                                    </Label>
                                                    <Select
                                                        value={
                                                            providerForm.userId
                                                        }
                                                        onValueChange={(
                                                            value
                                                        ) =>
                                                            setProviderForm({
                                                                ...providerForm,
                                                                userId: value,
                                                            })
                                                        }
                                                    >
                                                        <SelectTrigger data-testid="select-provider-user">
                                                            <SelectValue
                                                                placeholder={t(
                                                                    "admin_filters.select_user"
                                                                )}
                                                            />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {(users || [])
                                                                .filter(
                                                                    (u) =>
                                                                        u.role ===
                                                                            "service_provider" ||
                                                                        u.role ===
                                                                            "admin"
                                                                )
                                                                .map((u) => (
                                                                    <SelectItem
                                                                        key={
                                                                            u.id
                                                                        }
                                                                        value={
                                                                            u.id
                                                                        }
                                                                    >
                                                                        {u.firstName &&
                                                                        u.lastName
                                                                            ? `${u.firstName} ${u.lastName}`
                                                                            : u.email}{" "}
                                                                        (
                                                                        {u.role}
                                                                        )
                                                                    </SelectItem>
                                                                ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {t(
                                                            "admin_filters.select_user_with"
                                                        )}{" "}
                                                        service_provider role
                                                    </p>
                                                </div>
                                                <div>
                                                    <Label htmlFor="categoryId">
                                                        {t(
                                                            "admin_labels.service_category"
                                                        )}{" "}
                                                        *
                                                    </Label>
                                                    <Select
                                                        value={
                                                            providerForm.categoryId
                                                        }
                                                        onValueChange={(
                                                            value
                                                        ) =>
                                                            setProviderForm({
                                                                ...providerForm,
                                                                categoryId:
                                                                    value,
                                                            })
                                                        }
                                                    >
                                                        <SelectTrigger data-testid="select-provider-category">
                                                            <SelectValue
                                                                placeholder={t(
                                                                    "admin_filters.select_category"
                                                                )}
                                                            />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {(
                                                                serviceCategories ||
                                                                []
                                                            ).map(
                                                                (category) => (
                                                                    <SelectItem
                                                                        key={
                                                                            category.id
                                                                        }
                                                                        value={
                                                                            category.id
                                                                        }
                                                                    >
                                                                        {
                                                                            category.name
                                                                        }
                                                                    </SelectItem>
                                                                )
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div>
                                                    <Label htmlFor="businessName">
                                                        Business Name *
                                                    </Label>
                                                    <Input
                                                        id="businessName"
                                                        value={
                                                            providerForm.businessName
                                                        }
                                                        onChange={(e) =>
                                                            setProviderForm({
                                                                ...providerForm,
                                                                businessName:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                        placeholder="e.g., Professional Cleaning Services"
                                                        data-testid="input-provider-name"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="description">
                                                        Description
                                                    </Label>
                                                    <Textarea
                                                        id="description"
                                                        value={
                                                            providerForm.description
                                                        }
                                                        onChange={(e) =>
                                                            setProviderForm({
                                                                ...providerForm,
                                                                description:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                        placeholder={t(
                                                            "admin_placeholders.describe_services"
                                                        )}
                                                        rows={3}
                                                        data-testid="input-provider-description"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <Label htmlFor="hourlyRate">
                                                            Hourly Rate ($)
                                                        </Label>
                                                        <Input
                                                            id="hourlyRate"
                                                            type="number"
                                                            step="0.01"
                                                            value={
                                                                providerForm.hourlyRate
                                                            }
                                                            onChange={(e) =>
                                                                setProviderForm(
                                                                    {
                                                                        ...providerForm,
                                                                        hourlyRate:
                                                                            e
                                                                                .target
                                                                                .value,
                                                                    }
                                                                )
                                                            }
                                                            placeholder="25.00"
                                                            data-testid="input-provider-hourly"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="fixedRate">
                                                            Fixed Rate ($)
                                                        </Label>
                                                        <Input
                                                            id="fixedRate"
                                                            type="number"
                                                            step="0.01"
                                                            value={
                                                                providerForm.fixedRate
                                                            }
                                                            onChange={(e) =>
                                                                setProviderForm(
                                                                    {
                                                                        ...providerForm,
                                                                        fixedRate:
                                                                            e
                                                                                .target
                                                                                .value,
                                                                    }
                                                                )
                                                            }
                                                            placeholder="150.00"
                                                            data-testid="input-provider-fixed"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <Label htmlFor="location">
                                                            Location
                                                        </Label>
                                                        <Input
                                                            id="location"
                                                            value={
                                                                providerForm.location
                                                            }
                                                            onChange={(e) =>
                                                                setProviderForm(
                                                                    {
                                                                        ...providerForm,
                                                                        location:
                                                                            e
                                                                                .target
                                                                                .value,
                                                                    }
                                                                )
                                                            }
                                                            placeholder={t(
                                                                "admin_placeholders.city_state"
                                                            )}
                                                            data-testid="input-provider-location"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="radius">
                                                            Service Radius (km)
                                                        </Label>
                                                        <Input
                                                            id="radius"
                                                            type="number"
                                                            value={
                                                                providerForm.radius
                                                            }
                                                            onChange={(e) =>
                                                                setProviderForm(
                                                                    {
                                                                        ...providerForm,
                                                                        radius: e
                                                                            .target
                                                                            .value,
                                                                    }
                                                                )
                                                            }
                                                            data-testid="input-provider-radius"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <Label htmlFor="certifications">
                                                        Certifications (comma
                                                        separated)
                                                    </Label>
                                                    <Input
                                                        id="certifications"
                                                        value={
                                                            providerForm.certifications
                                                        }
                                                        onChange={(e) =>
                                                            setProviderForm({
                                                                ...providerForm,
                                                                certifications:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                        placeholder={t(
                                                            "admin_placeholders.certifications"
                                                        )}
                                                        data-testid="input-provider-certs"
                                                    />
                                                </div>
                                                <div className="flex items-center space-x-4">
                                                    <div className="flex items-center space-x-2">
                                                        <input
                                                            type="checkbox"
                                                            id="isVerified"
                                                            checked={
                                                                providerForm.isVerified
                                                            }
                                                            onChange={(e) =>
                                                                setProviderForm(
                                                                    {
                                                                        ...providerForm,
                                                                        isVerified:
                                                                            e
                                                                                .target
                                                                                .checked,
                                                                    }
                                                                )
                                                            }
                                                            className="rounded"
                                                            data-testid="checkbox-provider-verified"
                                                        />
                                                        <Label htmlFor="isVerified">
                                                            Verified
                                                        </Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <input
                                                            type="checkbox"
                                                            id="isActive"
                                                            checked={
                                                                providerForm.isActive
                                                            }
                                                            onChange={(e) =>
                                                                setProviderForm(
                                                                    {
                                                                        ...providerForm,
                                                                        isActive:
                                                                            e
                                                                                .target
                                                                                .checked,
                                                                    }
                                                                )
                                                            }
                                                            className="rounded"
                                                            data-testid="checkbox-provider-active"
                                                        />
                                                        <Label htmlFor="isActive">
                                                            Active
                                                        </Label>
                                                    </div>
                                                </div>
                                                <div className="flex justify-end space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => {
                                                            setServiceProviderDialogOpen(
                                                                false
                                                            );
                                                            setEditingProvider(
                                                                null
                                                            );
                                                            resetProviderForm();
                                                        }}
                                                        data-testid="button-cancel-provider"
                                                    >
                                                        {t("common.cancel")}
                                                    </Button>
                                                    <Button
                                                        onClick={() => {
                                                            const certArray =
                                                                providerForm.certifications
                                                                    ? providerForm.certifications
                                                                          .split(
                                                                              ","
                                                                          )
                                                                          .map(
                                                                              (
                                                                                  c
                                                                              ) =>
                                                                                  c.trim()
                                                                          )
                                                                          .filter(
                                                                              Boolean
                                                                          )
                                                                    : [];

                                                            saveProviderMutation.mutate(
                                                                {
                                                                    userId: providerForm.userId,
                                                                    categoryId:
                                                                        providerForm.categoryId,
                                                                    businessName:
                                                                        providerForm.businessName,
                                                                    description:
                                                                        providerForm.description ||
                                                                        null,
                                                                    hourlyRate:
                                                                        providerForm.hourlyRate
                                                                            ? parseFloat(
                                                                                  providerForm.hourlyRate
                                                                              )
                                                                            : null,
                                                                    fixedRate:
                                                                        providerForm.fixedRate
                                                                            ? parseFloat(
                                                                                  providerForm.fixedRate
                                                                              )
                                                                            : null,
                                                                    location:
                                                                        providerForm.location ||
                                                                        null,
                                                                    radius:
                                                                        parseInt(
                                                                            providerForm.radius
                                                                        ) || 50,
                                                                    certifications:
                                                                        certArray,
                                                                    approvalStatus:
                                                                        "approved",
                                                                    isVerified:
                                                                        providerForm.isVerified,
                                                                    isActive:
                                                                        providerForm.isActive,
                                                                }
                                                            );
                                                        }}
                                                        disabled={
                                                            saveProviderMutation.isPending ||
                                                            !providerForm.userId ||
                                                            !providerForm.categoryId ||
                                                            !providerForm.businessName
                                                        }
                                                        data-testid="button-save-provider"
                                                    >
                                                        {saveProviderMutation.isPending
                                                            ? "Saving..."
                                                            : editingProvider
                                                            ? "Update"
                                                            : "Create"}
                                                    </Button>
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>

                                    {providersLoading ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {[1, 2, 3].map((i) => (
                                                <div
                                                    key={i}
                                                    className="h-64 bg-muted rounded-lg animate-pulse"
                                                ></div>
                                            ))}
                                        </div>
                                    ) : serviceProviders &&
                                      serviceProviders.filter(
                                          (p) =>
                                              p.approvalStatus === "approved" ||
                                              !p.approvalStatus
                                      ).length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {serviceProviders
                                                .filter(
                                                    (p) =>
                                                        p.approvalStatus ===
                                                            "approved" ||
                                                        !p.approvalStatus
                                                )
                                                .map((provider) => {
                                                    const category = (
                                                        serviceCategories || []
                                                    ).find(
                                                        (c) =>
                                                            c.id ===
                                                            provider.categoryId
                                                    );
                                                    return (
                                                        <Card
                                                            key={provider.id}
                                                            className="overflow-hidden"
                                                            data-testid={`provider-card-${provider.id}`}
                                                        >
                                                            <div className="p-4">
                                                                <div className="flex items-start justify-between mb-3">
                                                                    <h3 className="font-semibold text-lg text-foreground">
                                                                        {
                                                                            provider.businessName
                                                                        }
                                                                    </h3>
                                                                    <div className="flex gap-1">
                                                                        {provider.isVerified && (
                                                                            <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 text-xs rounded">
                                                                                Verified
                                                                            </span>
                                                                        )}
                                                                        {provider.isActive && (
                                                                            <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 text-xs rounded">
                                                                                Active
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <p className="text-sm text-muted-foreground mb-3">
                                                                    {category?.name ||
                                                                        "Uncategorized"}
                                                                </p>
                                                                {provider.description && (
                                                                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                                                        {
                                                                            provider.description
                                                                        }
                                                                    </p>
                                                                )}
                                                                <div className="space-y-2 text-sm mb-4">
                                                                    {provider.location && (
                                                                        <div className="flex items-center gap-2 text-muted-foreground">
                                                                            <MapPin className="w-4 h-4" />
                                                                            <span>
                                                                                {
                                                                                    provider.location
                                                                                }
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                    <div className="flex gap-4">
                                                                        {provider.hourlyRate && (
                                                                            <div>
                                                                                <span className="text-muted-foreground">
                                                                                    Hourly:{" "}
                                                                                </span>
                                                                                <span className="font-semibold text-foreground">
                                                                                    $
                                                                                    {
                                                                                        provider.hourlyRate
                                                                                    }
                                                                                    /hr
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                                        {provider.fixedRate && (
                                                                            <div>
                                                                                <span className="text-muted-foreground">
                                                                                    Fixed:{" "}
                                                                                </span>
                                                                                <span className="font-semibold text-foreground">
                                                                                    $
                                                                                    {
                                                                                        provider.fixedRate
                                                                                    }
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    {provider.rating &&
                                                                        parseFloat(
                                                                            provider.rating
                                                                        ) >
                                                                            0 && (
                                                                            <div>
                                                                                <span className="text-yellow-500">
                                                                                    ★
                                                                                </span>
                                                                                <span className="ml-1 font-semibold">
                                                                                    {parseFloat(
                                                                                        provider.rating
                                                                                    ).toFixed(
                                                                                        1
                                                                                    )}
                                                                                </span>
                                                                                <span className="text-muted-foreground ml-1">
                                                                                    (
                                                                                    {
                                                                                        provider.reviewCount
                                                                                    }{" "}
                                                                                    reviews)
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() =>
                                                                            handleEditProvider(
                                                                                provider
                                                                            )
                                                                        }
                                                                        data-testid={`button-edit-provider-${provider.id}`}
                                                                    >
                                                                        <Edit className="w-4 h-4 mr-1" />
                                                                        Edit
                                                                    </Button>
                                                                    <Button
                                                                        variant="destructive"
                                                                        size="sm"
                                                                        onClick={() => {
                                                                            if (
                                                                                confirm(
                                                                                    "Are you sure you want to delete this service provider?"
                                                                                )
                                                                            ) {
                                                                                deleteProviderMutation.mutate(
                                                                                    provider.id
                                                                                );
                                                                            }
                                                                        }}
                                                                        disabled={
                                                                            deleteProviderMutation.isPending
                                                                        }
                                                                        data-testid={`button-delete-provider-${provider.id}`}
                                                                    >
                                                                        <Trash2 className="w-4 h-4 mr-1" />
                                                                        Delete
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </Card>
                                                    );
                                                })}
                                        </div>
                                    ) : (
                                        <Card className="p-12 text-center">
                                            <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                            <h3 className="text-lg font-semibold text-foreground mb-2">
                                                No Service Providers Yet
                                            </h3>
                                            <p className="text-muted-foreground mb-4">
                                                Get started by adding your first
                                                service provider
                                            </p>
                                            <Button
                                                onClick={handleNewProvider}
                                                data-testid="button-add-first-provider"
                                            >
                                                <Plus className="w-4 h-4 mr-2" />
                                                Add Provider
                                            </Button>
                                        </Card>
                                    )}
                                </TabsContent>
                            </Tabs>
                        </div>
                    )}

                    {/* Services Section - Categories & Tasks */}
                    {activeSection === "services" && (
                        <div>
                            <h2 className="text-3xl font-bold text-foreground mb-8">
                                {t("admin.services_management")}
                            </h2>

                            <Tabs
                                defaultValue="categories"
                                className="space-y-6"
                            >
                                <TabsList>
                                    <TabsTrigger value="categories">
                                        {t("admin.service_categories")}
                                    </TabsTrigger>
                                    <TabsTrigger value="tasks">
                                        {t("admin.service_tasks")}
                                    </TabsTrigger>
                                </TabsList>

                                {/* Service Categories Tab */}
                                <TabsContent
                                    value="categories"
                                    className="space-y-4"
                                >
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-xl font-semibold">
                                            Service Categories
                                        </h3>
                                        <Button
                                            size="sm"
                                            onClick={handleNewCategory}
                                            data-testid="button-add-category"
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            {t("admin_buttons.add_category")}
                                        </Button>
                                    </div>

                                    <Dialog
                                        open={categoryDialogOpen}
                                        onOpenChange={setCategoryDialogOpen}
                                    >
                                        <DialogContent className="max-w-md">
                                            <DialogHeader>
                                                <DialogTitle>
                                                    {editingCategory
                                                        ? t(
                                                              "admin_labels.edit_category"
                                                          )
                                                        : t(
                                                              "admin_labels.add_new_category"
                                                          )}
                                                </DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-4">
                                                <div>
                                                    <Label htmlFor="categoryName">
                                                        Category Name *
                                                    </Label>
                                                    <Input
                                                        id="categoryName"
                                                        value={
                                                            categoryForm.name
                                                        }
                                                        onChange={(e) =>
                                                            setCategoryForm({
                                                                ...categoryForm,
                                                                name: e.target
                                                                    .value,
                                                            })
                                                        }
                                                        placeholder="e.g., Cleaning Services"
                                                        data-testid="input-category-name"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="categoryDescription">
                                                        Description
                                                    </Label>
                                                    <Textarea
                                                        id="categoryDescription"
                                                        value={
                                                            categoryForm.description
                                                        }
                                                        onChange={(e) =>
                                                            setCategoryForm({
                                                                ...categoryForm,
                                                                description:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                        placeholder={t(
                                                            "admin_placeholders.describe_category"
                                                        )}
                                                        rows={3}
                                                        data-testid="input-category-description"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="categoryIcon">
                                                        Icon (optional)
                                                    </Label>
                                                    <Input
                                                        id="categoryIcon"
                                                        value={
                                                            categoryForm.icon
                                                        }
                                                        onChange={(e) =>
                                                            setCategoryForm({
                                                                ...categoryForm,
                                                                icon: e.target
                                                                    .value,
                                                            })
                                                        }
                                                        placeholder={t(
                                                            "admin_placeholders.icon_name"
                                                        )}
                                                        data-testid="input-category-icon"
                                                    />
                                                </div>
                                                <div className="flex justify-end space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => {
                                                            setCategoryDialogOpen(
                                                                false
                                                            );
                                                            setEditingCategory(
                                                                null
                                                            );
                                                            resetCategoryForm();
                                                        }}
                                                        data-testid="button-cancel-category"
                                                    >
                                                        {t("common.cancel")}
                                                    </Button>
                                                    <Button
                                                        onClick={() =>
                                                            saveCategoryMutation.mutate(
                                                                categoryForm
                                                            )
                                                        }
                                                        disabled={
                                                            saveCategoryMutation.isPending ||
                                                            !categoryForm.name
                                                        }
                                                        data-testid="button-save-category"
                                                    >
                                                        {saveCategoryMutation.isPending
                                                            ? "Saving..."
                                                            : editingCategory
                                                            ? "Update"
                                                            : "Create"}
                                                    </Button>
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>

                                    {serviceCategories &&
                                    serviceCategories.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {serviceCategories.map(
                                                (category) => (
                                                    <Card
                                                        key={category.id}
                                                        className="p-4"
                                                        data-testid={`category-card-${category.id}`}
                                                    >
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <h4 className="font-semibold text-foreground mb-1">
                                                                    {category.icon && (
                                                                        <span className="mr-2">
                                                                            {
                                                                                category.icon
                                                                            }
                                                                        </span>
                                                                    )}
                                                                    {
                                                                        category.name
                                                                    }
                                                                </h4>
                                                                {category.description && (
                                                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                                                        {
                                                                            category.description
                                                                        }
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <div className="flex gap-1">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        handleEditCategory(
                                                                            category
                                                                        )
                                                                    }
                                                                    data-testid={`button-edit-category-${category.id}`}
                                                                >
                                                                    <Edit className="w-4 h-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        if (
                                                                            confirm(
                                                                                "Are you sure you want to delete this category?"
                                                                            )
                                                                        ) {
                                                                            deleteCategoryMutation.mutate(
                                                                                category.id
                                                                            );
                                                                        }
                                                                    }}
                                                                    disabled={
                                                                        deleteCategoryMutation.isPending
                                                                    }
                                                                    data-testid={`button-delete-category-${category.id}`}
                                                                >
                                                                    <Trash2 className="w-4 h-4 text-destructive" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </Card>
                                                )
                                            )}
                                        </div>
                                    ) : (
                                        <Card className="p-8 text-center">
                                            <p className="text-muted-foreground">
                                                No service categories found
                                            </p>
                                        </Card>
                                    )}
                                </TabsContent>

                                {/* Service Tasks Tab */}
                                <TabsContent
                                    value="tasks"
                                    className="space-y-4"
                                >
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-xl font-semibold">
                                            Service Tasks
                                        </h3>
                                        <Button
                                            size="sm"
                                            data-testid="button-add-task"
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add Task
                                        </Button>
                                    </div>

                                    <div className="flex gap-4 mb-4">
                                        <Select defaultValue="all">
                                            <SelectTrigger className="w-[200px]">
                                                <SelectValue
                                                    placeholder={t(
                                                        "admin_filters.filter_by_category"
                                                    )}
                                                />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">
                                                    {t("admin.all_categories")}
                                                </SelectItem>
                                                {(serviceCategories || []).map(
                                                    (category) => (
                                                        <SelectItem
                                                            key={category.id}
                                                            value={category.id}
                                                        >
                                                            {category.name}
                                                        </SelectItem>
                                                    )
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <Card className="p-8 text-center">
                                        <p className="text-muted-foreground">
                                            Service tasks management coming soon
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-2">
                                            This will display all 36+ predefined
                                            maid service tasks and other
                                            service-specific tasks
                                        </p>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        </div>
                    )}

                    {/* Bookings Section */}
                    {activeSection === "bookings" && (
                        <div>
                            <h2 className="text-3xl font-bold text-foreground mb-8">
                                {t("admin.booking_management")}
                            </h2>

                            {bookingsLoading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map((i) => (
                                        <div
                                            key={i}
                                            className="h-24 bg-muted rounded-lg animate-pulse"
                                        ></div>
                                    ))}
                                </div>
                            ) : bookings && bookings.length > 0 ? (
                                <div className="space-y-4">
                                    {bookings.map((booking) => (
                                        <Card
                                            key={booking.id}
                                            className="p-6"
                                            data-testid={`booking-card-${booking.id}`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3
                                                            className="font-semibold text-lg text-foreground"
                                                            data-testid={`booking-code-${booking.id}`}
                                                        >
                                                            Booking:{" "}
                                                            {booking.bookingCode
                                                                ? booking.bookingCode
                                                                      .replace(
                                                                          /undefined/g,
                                                                          ""
                                                                      )
                                                                      .trim()
                                                                : `Booking ${
                                                                      booking.id?.substring(
                                                                          0,
                                                                          8
                                                                      ) || "N/A"
                                                                  }`}
                                                        </h3>
                                                        <Select
                                                            value={
                                                                booking.status ||
                                                                "pending"
                                                            }
                                                            onValueChange={(
                                                                value
                                                            ) =>
                                                                updateBookingStatusMutation.mutate(
                                                                    {
                                                                        bookingId:
                                                                            booking.id,
                                                                        status: value,
                                                                    }
                                                                )
                                                            }
                                                            disabled={
                                                                updateBookingStatusMutation.isPending
                                                            }
                                                        >
                                                            <SelectTrigger
                                                                className="w-[140px] h-7"
                                                                data-testid={`select-status-${booking.id}`}
                                                            >
                                                                <SelectValue
                                                                    placeholder={getBookingStatusLabel(
                                                                        booking.status ||
                                                                            "pending"
                                                                    )}
                                                                />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="pending">
                                                                    {t(
                                                                        "dashboard.pending"
                                                                    )}
                                                                </SelectItem>
                                                                <SelectItem value="pending_payment">
                                                                    Pending
                                                                    Payment
                                                                </SelectItem>
                                                                <SelectItem value="confirmed">
                                                                    {t(
                                                                        "dashboard.confirmed"
                                                                    )}
                                                                </SelectItem>
                                                                <SelectItem value="completed">
                                                                    {t(
                                                                        "dashboard.completed"
                                                                    )}
                                                                </SelectItem>
                                                                <SelectItem value="cancelled">
                                                                    {t(
                                                                        "dashboard.cancelled"
                                                                    )}
                                                                </SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                                                        <div>
                                                            <span className="font-medium">
                                                                Property ID:
                                                            </span>
                                                            <p className="text-foreground">
                                                                {booking.propertyId?.substring(
                                                                    0,
                                                                    8
                                                                )}
                                                                ...
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <span className="font-medium">
                                                                Client ID:
                                                            </span>
                                                            <p className="text-foreground">
                                                                {booking.clientId?.substring(
                                                                    0,
                                                                    8
                                                                )}
                                                                ...
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <span className="font-medium">
                                                                {t(
                                                                    "admin_labels.guests"
                                                                )}
                                                                :
                                                            </span>
                                                            <p className="text-foreground">
                                                                {booking.guests}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <span className="font-medium">
                                                                {t(
                                                                    "admin_labels.total"
                                                                )}
                                                                :
                                                            </span>
                                                            <p className="text-foreground font-semibold">
                                                                $
                                                                {
                                                                    booking.totalAmount
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="mt-3 flex gap-6 text-sm text-muted-foreground">
                                                        <div>
                                                            <span className="font-medium">
                                                                {t(
                                                                    "admin_labels.check_in"
                                                                )}
                                                                :
                                                            </span>
                                                            <span className="ml-2 text-foreground">
                                                                {booking.checkIn
                                                                    ? new Date(
                                                                          booking.checkIn
                                                                      ).toLocaleDateString()
                                                                    : "N/A"}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="font-medium">
                                                                {t(
                                                                    "admin_labels.check_out"
                                                                )}
                                                                :
                                                            </span>
                                                            <span className="ml-2 text-foreground">
                                                                {booking.checkOut
                                                                    ? new Date(
                                                                          booking.checkOut
                                                                      ).toLocaleDateString()
                                                                    : "N/A"}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="font-medium">
                                                                {t(
                                                                    "admin_labels.payment"
                                                                )}
                                                                :
                                                            </span>
                                                            <span
                                                                className={`ml-2 px-2 py-0.5 rounded text-xs ${
                                                                    booking.paymentStatus ===
                                                                    "paid"
                                                                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                                                                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                                                                }`}
                                                            >
                                                                {
                                                                    booking.paymentStatus
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedBookingId(
                                                                booking.id
                                                            );
                                                            setBookingDetailsDialogOpen(
                                                                true
                                                            );
                                                        }}
                                                        data-testid={`button-view-details-${booking.id}`}
                                                    >
                                                        <Eye className="w-4 h-4 mr-1" />
                                                        View Details
                                                    </Button>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <Card className="p-12 text-center">
                                    <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-foreground mb-2">
                                        No Bookings Yet
                                    </h3>
                                    <p className="text-muted-foreground">
                                        Bookings will appear here once clients
                                        start making reservations
                                    </p>
                                </Card>
                            )}

                            {/* Booking Details Modal */}
                            <Dialog
                                open={bookingDetailsDialogOpen}
                                onOpenChange={setBookingDetailsDialogOpen}
                            >
                                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle>
                                            Booking Details
                                        </DialogTitle>
                                    </DialogHeader>

                                    {bookingDetailsLoading ? (
                                        <div className="space-y-4">
                                            <div className="h-48 bg-muted rounded-lg animate-pulse"></div>
                                            <div className="h-24 bg-muted rounded-lg animate-pulse"></div>
                                            <div className="h-24 bg-muted rounded-lg animate-pulse"></div>
                                        </div>
                                    ) : bookingDetails ? (
                                        <div className="space-y-6">
                                            {/* Property Information */}
                                            <div>
                                                <h3 className="text-lg font-semibold text-foreground mb-3">
                                                    Property Information
                                                </h3>
                                                <Card className="p-4">
                                                    {bookingDetails.property
                                                        ?.images &&
                                                        bookingDetails.property
                                                            .images.length >
                                                            0 && (
                                                            <div className="mb-4">
                                                                <img
                                                                    src={
                                                                        bookingDetails
                                                                            .property
                                                                            .images[0]
                                                                    }
                                                                    alt={
                                                                        bookingDetails
                                                                            .property
                                                                            .title
                                                                    }
                                                                    className="w-full h-48 object-cover rounded-lg"
                                                                />
                                                            </div>
                                                        )}
                                                    <h4 className="font-semibold text-foreground mb-2">
                                                        {
                                                            bookingDetails
                                                                .property?.title
                                                        }
                                                    </h4>
                                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                                        <div className="flex items-center gap-2 text-muted-foreground">
                                                            <MapPin className="w-4 h-4" />
                                                            <span>
                                                                {
                                                                    bookingDetails
                                                                        .property
                                                                        ?.location
                                                                }
                                                            </span>
                                                        </div>
                                                        <div className="text-muted-foreground">
                                                            <span className="font-medium">
                                                                Price:
                                                            </span>{" "}
                                                            $
                                                            {
                                                                bookingDetails
                                                                    .property
                                                                    ?.pricePerNight
                                                            }
                                                            /night
                                                        </div>
                                                        <div className="text-muted-foreground">
                                                            <span className="font-medium">
                                                                {t(
                                                                    "admin_labels.max_guests"
                                                                )}
                                                                :
                                                            </span>{" "}
                                                            {
                                                                bookingDetails
                                                                    .property
                                                                    ?.maxGuests
                                                            }
                                                        </div>
                                                        <div className="text-muted-foreground">
                                                            <span className="font-medium">
                                                                Bedrooms:
                                                            </span>{" "}
                                                            {
                                                                bookingDetails
                                                                    .property
                                                                    ?.bedrooms
                                                            }
                                                        </div>
                                                    </div>
                                                </Card>
                                            </div>

                                            {/* Client Information */}
                                            <div>
                                                <h3 className="text-lg font-semibold text-foreground mb-3">
                                                    {t(
                                                        "admin_sections.client_information"
                                                    )}
                                                </h3>
                                                <Card className="p-4">
                                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                                        <div className="flex items-center gap-2 text-muted-foreground">
                                                            <User className="w-4 h-4" />
                                                            <span className="text-foreground font-medium">
                                                                {
                                                                    bookingDetails
                                                                        .client
                                                                        ?.firstName
                                                                }{" "}
                                                                {
                                                                    bookingDetails
                                                                        .client
                                                                        ?.lastName
                                                                }
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-muted-foreground">
                                                            <Mail className="w-4 h-4" />
                                                            <span>
                                                                {
                                                                    bookingDetails
                                                                        .client
                                                                        ?.email
                                                                }
                                                            </span>
                                                        </div>
                                                        {bookingDetails.client
                                                            ?.phoneNumber && (
                                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                                <Phone className="w-4 h-4" />
                                                                <span>
                                                                    {
                                                                        bookingDetails
                                                                            .client
                                                                            .phoneNumber
                                                                    }
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </Card>
                                            </div>

                                            {/* Booking Information */}
                                            <div>
                                                <h3 className="text-lg font-semibold text-foreground mb-3">
                                                    {t(
                                                        "admin_sections.booking_information"
                                                    )}
                                                </h3>
                                                <Card className="p-4">
                                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                                        <div>
                                                            <span className="font-medium text-muted-foreground">
                                                                {t(
                                                                    "admin_labels.booking_code"
                                                                )}
                                                                :
                                                            </span>
                                                            <p className="text-foreground font-mono">
                                                                {bookingDetails.bookingCode
                                                                    ? bookingDetails.bookingCode
                                                                          .replace(
                                                                              /undefined/g,
                                                                              ""
                                                                          )
                                                                          .trim()
                                                                    : bookingDetails.id?.substring(
                                                                          0,
                                                                          8
                                                                      ) ||
                                                                      "N/A"}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <span className="font-medium text-muted-foreground">
                                                                {t(
                                                                    "admin_labels.status"
                                                                )}
                                                                :
                                                            </span>
                                                            <p className="text-foreground">
                                                                <span
                                                                    className={`inline-block px-2 py-1 rounded text-xs ${
                                                                        bookingDetails.status ===
                                                                        "confirmed"
                                                                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                                                                            : bookingDetails.status ===
                                                                              "pending"
                                                                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                                                                            : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100"
                                                                    }`}
                                                                >
                                                                    {
                                                                        bookingDetails.status
                                                                    }
                                                                </span>
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <span className="font-medium text-muted-foreground">
                                                                Check-in:
                                                            </span>
                                                            <p className="text-foreground">
                                                                {bookingDetails.checkIn
                                                                    ? new Date(
                                                                          bookingDetails.checkIn
                                                                      ).toLocaleDateString()
                                                                    : "N/A"}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <span className="font-medium text-muted-foreground">
                                                                Check-out:
                                                            </span>
                                                            <p className="text-foreground">
                                                                {bookingDetails.checkOut
                                                                    ? new Date(
                                                                          bookingDetails.checkOut
                                                                      ).toLocaleDateString()
                                                                    : "N/A"}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <span className="font-medium text-muted-foreground">
                                                                Guests:
                                                            </span>
                                                            <p className="text-foreground">
                                                                {
                                                                    bookingDetails.guests
                                                                }
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <span className="font-medium text-muted-foreground">
                                                                {t(
                                                                    "admin_labels.payment_status"
                                                                )}
                                                                :
                                                            </span>
                                                            <p className="text-foreground">
                                                                <span
                                                                    className={`inline-block px-2 py-1 rounded text-xs ${
                                                                        bookingDetails.paymentStatus ===
                                                                        "paid"
                                                                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                                                                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                                                                    }`}
                                                                >
                                                                    {
                                                                        bookingDetails.paymentStatus
                                                                    }
                                                                </span>
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="mt-4 pt-4 border-t border-border">
                                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                                            <div>
                                                                <span className="font-medium text-muted-foreground">
                                                                    {t(
                                                                        "admin_labels.property_total"
                                                                    )}
                                                                    :
                                                                </span>
                                                                <p className="text-foreground">
                                                                    $
                                                                    {
                                                                        bookingDetails.propertyTotal
                                                                    }
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <span className="font-medium text-muted-foreground">
                                                                    {t(
                                                                        "admin_labels.services_total"
                                                                    )}
                                                                    :
                                                                </span>
                                                                <p className="text-foreground">
                                                                    $
                                                                    {
                                                                        bookingDetails.servicesTotal
                                                                    }
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <span className="font-medium text-muted-foreground">
                                                                    {t(
                                                                        "admin_labels.discount_amount"
                                                                    )}
                                                                    :
                                                                </span>
                                                                <p className="text-foreground">
                                                                    -$
                                                                    {
                                                                        bookingDetails.discountAmount
                                                                    }
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <span className="font-medium text-muted-foreground">
                                                                    {t(
                                                                        "admin_labels.total_amount"
                                                                    )}
                                                                    :
                                                                </span>
                                                                <p className="text-foreground font-semibold text-lg">
                                                                    $
                                                                    {
                                                                        bookingDetails.totalAmount
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Card>
                                            </div>

                                            {/* Service Bookings */}
                                            {bookingDetails.serviceBookings &&
                                                bookingDetails.serviceBookings
                                                    .length > 0 && (
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-foreground mb-3">
                                                            Service Bookings
                                                        </h3>
                                                        <div className="space-y-2">
                                                            {bookingDetails.serviceBookings.map(
                                                                (
                                                                    service: any
                                                                ) => (
                                                                    <Card
                                                                        key={
                                                                            service.id
                                                                        }
                                                                        className="p-3"
                                                                    >
                                                                        <div className="flex justify-between items-center">
                                                                            <div>
                                                                                <p className="font-medium text-foreground">
                                                                                    {
                                                                                        service.serviceName
                                                                                    }
                                                                                </p>
                                                                                <p className="text-sm text-muted-foreground">
                                                                                    {new Date(
                                                                                        service.serviceDate
                                                                                    ).toLocaleDateString()}
                                                                                </p>
                                                                            </div>
                                                                            <div className="text-right">
                                                                                <p className="text-sm text-muted-foreground">
                                                                                    Price:
                                                                                    $
                                                                                    {
                                                                                        service.price
                                                                                    }
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    </Card>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <p className="text-muted-foreground">
                                                No booking details available
                                            </p>
                                        </div>
                                    )}
                                </DialogContent>
                            </Dialog>
                        </div>
                    )}

                    {/* Service Orders Section */}
                    {activeSection === "service-orders" && (
                        <div>
                            <h2 className="text-3xl font-bold text-foreground mb-8">
                                {t("admin.order_management")}
                            </h2>

                            {serviceOrdersLoading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map((i) => (
                                        <div
                                            key={i}
                                            className="h-24 bg-muted rounded-lg animate-pulse"
                                        ></div>
                                    ))}
                                </div>
                            ) : serviceOrders && serviceOrders.length > 0 ? (
                                <div className="space-y-4">
                                    {serviceOrders.map((order) => (
                                        <Card
                                            key={order.id}
                                            className="p-6"
                                            data-testid={`service-order-card-${order.id}`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3
                                                            className="font-semibold text-lg text-foreground"
                                                            data-testid={`order-code-${order.id}`}
                                                        >
                                                            {t("admin_labels.order")}:{" "}
                                                            {order.orderCode}
                                                        </h3>
                                                        <Select
                                                            value={order.status}
                                                            onValueChange={(
                                                                value
                                                            ) =>
                                                                updateServiceOrderStatusMutation.mutate(
                                                                    {
                                                                        orderId:
                                                                            order.id,
                                                                        status: value,
                                                                    }
                                                                )
                                                            }
                                                            disabled={
                                                                updateServiceOrderStatusMutation.isPending
                                                            }
                                                        >
                                                            <SelectTrigger
                                                                className="w-[140px] h-7"
                                                                data-testid={`select-status-${order.id}`}
                                                            >
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="pending">
                                                                    {t(
                                                                        "dashboard.pending"
                                                                    )}
                                                                </SelectItem>
                                                                <SelectItem value="confirmed">
                                                                    {t(
                                                                        "dashboard.confirmed"
                                                                    )}
                                                                </SelectItem>
                                                                <SelectItem value="in_progress">
                                                                    {t(
                                                                        "dashboard.in_progress"
                                                                    )}
                                                                </SelectItem>
                                                                <SelectItem value="completed">
                                                                    {t(
                                                                        "dashboard.completed"
                                                                    )}
                                                                </SelectItem>
                                                                <SelectItem value="cancelled">
                                                                    {t(
                                                                        "dashboard.cancelled"
                                                                    )}
                                                                </SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                                                        <div>
                                                            <span className="font-medium">
                                                                {t("admin_labels.provider_id")}:
                                                            </span>
                                                            <p className="text-foreground">
                                                                {order.serviceProviderId?.substring(
                                                                    0,
                                                                    8
                                                                )}
                                                                ...
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <span className="font-medium">
                                                                {t("admin_labels.client_id")}:
                                                            </span>
                                                            <p className="text-foreground">
                                                                {order.clientId?.substring(
                                                                    0,
                                                                    8
                                                                )}
                                                                ...
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <span className="font-medium">
                                                                {t("admin_labels.service_date")}:
                                                            </span>
                                                            <p className="text-foreground">
                                                                {order.serviceDate
                                                                    ? new Date(
                                                                          order.serviceDate
                                                                      ).toLocaleDateString()
                                                                    : "N/A"}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <span className="font-medium">
                                                                {t(
                                                                    "admin_labels.total"
                                                                )}
                                                                :
                                                            </span>
                                                            <p className="text-foreground font-semibold">
                                                                $
                                                                {
                                                                    order.totalAmount
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="mt-3 flex gap-6 text-sm text-muted-foreground">
                                                        <div>
                                                            <span className="font-medium">
                                                                {t("admin_labels.time")}:
                                                            </span>
                                                            <span className="ml-2 text-foreground">
                                                                {
                                                                    order.startTime
                                                                }
                                                                {order.endTime &&
                                                                    ` - ${order.endTime}`}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="font-medium">
                                                                {t(
                                                                    "admin_labels.payment"
                                                                )}
                                                                :
                                                            </span>
                                                            <span
                                                                className={`ml-2 px-2 py-0.5 rounded text-xs ${
                                                                    order.paymentStatus ===
                                                                    "paid"
                                                                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                                                                        : order.paymentStatus ===
                                                                          "refunded"
                                                                        ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                                                                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                                                                }`}
                                                            >
                                                                {
                                                                    order.paymentStatus
                                                                }
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="font-medium">
                                                                {t("admin_labels.created")}:
                                                            </span>
                                                            <span className="ml-2 text-foreground">
                                                                {new Date(
                                                                    order.createdAt
                                                                ).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {order.specialInstructions && (
                                                        <div className="mt-3 text-sm">
                                                            <span className="font-medium text-muted-foreground">
                                                                {t("admin_labels.special_instructions")}:
                                                            </span>
                                                            <p className="text-foreground mt-1">
                                                                {
                                                                    order.specialInstructions
                                                                }
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <Card className="p-12 text-center">
                                    <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-foreground mb-2">
                                        {t("admin_labels.no_service_orders")}
                                    </h3>
                                    <p className="text-muted-foreground">
                                        {t("admin_labels.service_orders_appear")}
                                    </p>
                                </Card>
                            )}
                        </div>
                    )}

                    {/* CMS Settings Section */}
                    {activeSection === "cms" && (
                        <div>
                            <CMSSettings />
                        </div>
                    )}

                    {/* Platform Settings Section */}
                    {activeSection === "platform" && (
                        <div>
                            <PlatformSettings />
                        </div>
                    )}

                    {/* Associations Section */}
                    {activeSection === "associations" && (
                        <div>
                            <PropertyServiceAssociation />
                        </div>
                    )}

                    {/* Promo Codes Section */}
                    {activeSection === "promocodes" && (
                        <div>
                            <PromotionalCodes />
                        </div>
                    )}

                    {/* Cancellations Section */}
                    {activeSection === "cancellations" && (
                        <div>
                            <CancellationManagement />
                        </div>
                    )}

                    {/* Territories Section */}
                    {activeSection === "territories" && (
                        <div>
                            <TerritoryManagement />
                        </div>
                    )}

                    {/* Email Templates Section */}
                    {activeSection === "emails" && (
                        <div>
                            <EmailTemplates />
                        </div>
                    )}

                    {/* Activity Logs Section */}
                    {activeSection === "logs" && (
                        <div>
                            <ActivityLogs />
                        </div>
                    )}

                    {/* Staff Management Section */}
                    {activeSection === "staff" && (
                        <div>
                            <CreateStaffAccount />
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
