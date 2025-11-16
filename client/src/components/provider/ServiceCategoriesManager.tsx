import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Star } from "lucide-react";

interface ServiceCategory {
    id: string;
    name: string;
    description?: string;
    icon?: string;
}

interface ProviderCategory extends ServiceCategory {
    isPrimary: boolean;
}

interface ServiceProvider {
    id: string;
    businessName: string;
}

export default function ServiceCategoriesManager() {
    const { toast } = useToast();
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

    // Fetch provider's profile
    const { data: provider } = useQuery<ServiceProvider>({
        queryKey: ["/api/provider/profile"],
    });

    // Fetch all available categories
    const { data: allCategories } = useQuery<ServiceCategory[]>({
        queryKey: ["/api/service-categories"],
    });

    // Fetch provider's current categories
    const { data: providerCategories, isLoading } = useQuery<ProviderCategory[]>({
        queryKey: [`/api/providers/${provider?.id}/categories`],
        enabled: !!provider?.id,
    });

    // Add category mutation
    const addCategoryMutation = useMutation({
        mutationFn: async (categoryId: string) => {
            if (!provider) throw new Error("Provider not found");
            await apiRequest("POST", `/api/providers/${provider.id}/categories`, {
                categoryId,
                isPrimary: false,
            });
        },
        onSuccess: () => {
            if (provider) {
                queryClient.invalidateQueries({
                    queryKey: [`/api/providers/${provider.id}/categories`],
                });
                queryClient.invalidateQueries({
                    queryKey: ["/api/provider/profile"],
                });
            }
            toast({
                title: "Success",
                description: "Service category added successfully",
            });
            setAddDialogOpen(false);
            setSelectedCategoryId("");
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.message || "Failed to add category",
                variant: "destructive",
            });
        },
    });

    // Remove category mutation
    const removeCategoryMutation = useMutation({
        mutationFn: async (categoryId: string) => {
            if (!provider) throw new Error("Provider not found");
            await apiRequest(
                "DELETE",
                `/api/providers/${provider.id}/categories/${categoryId}`
            );
        },
        onSuccess: () => {
            if (provider) {
                queryClient.invalidateQueries({
                    queryKey: [`/api/providers/${provider.id}/categories`],
                });
                queryClient.invalidateQueries({
                    queryKey: ["/api/provider/profile"],
                });
            }
            toast({
                title: "Success",
                description: "Service category removed successfully",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.message || "Failed to remove category",
                variant: "destructive",
            });
        },
    });

    // Set primary category mutation
    const setPrimaryMutation = useMutation({
        mutationFn: async (categoryId: string) => {
            if (!provider) throw new Error("Provider not found");
            await apiRequest(
                "PUT",
                `/api/providers/${provider.id}/categories/${categoryId}/primary`
            );
        },
        onSuccess: () => {
            if (provider) {
                queryClient.invalidateQueries({
                    queryKey: [`/api/providers/${provider.id}/categories`],
                });
                queryClient.invalidateQueries({
                    queryKey: ["/api/provider/profile"],
                });
            }
            toast({
                title: "Success",
                description: "Primary service category updated successfully",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.message || "Failed to update primary category",
                variant: "destructive",
            });
        },
    });

    const handleAddCategory = () => {
        if (!selectedCategoryId) {
            toast({
                title: "Error",
                description: "Please select a category",
                variant: "destructive",
            });
            return;
        }
        addCategoryMutation.mutate(selectedCategoryId);
    };

    const handleRemoveCategory = (categoryId: string) => {
        if (
            window.confirm(
                "Are you sure you want to remove this service category? This may affect your visibility to potential clients."
            )
        ) {
            removeCategoryMutation.mutate(categoryId);
        }
    };

    const handleSetPrimary = (categoryId: string) => {
        setPrimaryMutation.mutate(categoryId);
    };

    // Filter out categories that are already assigned
    const availableCategories =
        allCategories?.filter(
            (cat) =>
                !providerCategories?.some((provCat) => provCat.id === cat.id)
        ) || [];

    if (!provider) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>My Service Categories</CardTitle>
                        <CardDescription>
                            Manage the services you offer to clients
                        </CardDescription>
                    </div>
                    <Button
                        size="sm"
                        onClick={() => setAddDialogOpen(true)}
                        disabled={availableCategories.length === 0}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Service
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <p className="text-sm text-muted-foreground">Loading services...</p>
                ) : !providerCategories || providerCategories.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-sm text-muted-foreground mb-4">
                            You haven't added any service categories yet.
                        </p>
                        <Button
                            size="sm"
                            onClick={() => setAddDialogOpen(true)}
                            disabled={availableCategories.length === 0}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Your First Service
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {providerCategories.map((category) => (
                            <div
                                key={category.id}
                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    {category.icon && (
                                        <span className="text-3xl">{category.icon}</span>
                                    )}
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-lg">
                                                {category.name}
                                            </span>
                                            {category.isPrimary && (
                                                <Badge variant="default" className="flex items-center gap-1">
                                                    <Star className="w-3 h-3 fill-current" />
                                                    Primary
                                                </Badge>
                                            )}
                                        </div>
                                        {category.description && (
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {category.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {!category.isPrimary && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleSetPrimary(category.id)}
                                            disabled={setPrimaryMutation.isPending}
                                        >
                                            <Star className="w-4 h-4 mr-1" />
                                            Set Primary
                                        </Button>
                                    )}
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => handleRemoveCategory(category.id)}
                                        disabled={
                                            removeCategoryMutation.isPending ||
                                            providerCategories.length === 1
                                        }
                                        title={
                                            providerCategories.length === 1
                                                ? "You must have at least one service category"
                                                : "Remove service"
                                        }
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                        
                        {providerCategories.length > 0 && (
                            <div className="pt-4 border-t">
                                <p className="text-xs text-muted-foreground">
                                    💡 Tip: Your primary service category is featured prominently to clients.
                                    Choose the service you're most experienced in.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>

            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Service Category</DialogTitle>
                        <DialogDescription>
                            Select a service category to add to your profile. This will make
                            you visible to clients looking for this type of service.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Select
                            value={selectedCategoryId}
                            onValueChange={setSelectedCategoryId}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a service category" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableCategories.map((category) => (
                                    <SelectItem key={category.id} value={category.id}>
                                        <div className="flex items-center gap-2">
                                            {category.icon && <span>{category.icon}</span>}
                                            <div>
                                                <div className="font-medium">{category.name}</div>
                                                {category.description && (
                                                    <div className="text-xs text-muted-foreground">
                                                        {category.description}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setAddDialogOpen(false);
                                setSelectedCategoryId("");
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAddCategory}
                            disabled={!selectedCategoryId || addCategoryMutation.isPending}
                        >
                            {addCategoryMutation.isPending ? "Adding..." : "Add Service"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
