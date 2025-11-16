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
    isPrimary?: boolean;
}

interface ProviderCategory extends ServiceCategory {
    isPrimary: boolean;
}

interface ServiceProvider {
    id: string;
    businessName: string;
    location?: string;
}

export default function ProviderServiceCategoriesManager({
    provider,
}: {
    provider: ServiceProvider;
}) {
    const { toast } = useToast();
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

    // Fetch all available categories
    const { data: allCategories } = useQuery<ServiceCategory[]>({
        queryKey: ["/api/service-categories"],
    });

    // Fetch provider's current categories
    const { data: providerCategories, isLoading } = useQuery<ProviderCategory[]>({
        queryKey: [`/api/providers/${provider.id}/categories`],
        enabled: !!provider.id,
    });

    // Add category mutation
    const addCategoryMutation = useMutation({
        mutationFn: async (categoryId: string) => {
            await apiRequest("POST", `/api/providers/${provider.id}/categories`, {
                categoryId,
                isPrimary: false,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [`/api/providers/${provider.id}/categories`],
            });
            queryClient.invalidateQueries({
                queryKey: ["/api/admin/service-providers"],
            });
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
            await apiRequest(
                "DELETE",
                `/api/providers/${provider.id}/categories/${categoryId}`
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [`/api/providers/${provider.id}/categories`],
            });
            queryClient.invalidateQueries({
                queryKey: ["/api/admin/service-providers"],
            });
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
            await apiRequest(
                "PUT",
                `/api/providers/${provider.id}/categories/${categoryId}/primary`
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [`/api/providers/${provider.id}/categories`],
            });
            queryClient.invalidateQueries({
                queryKey: ["/api/admin/service-providers"],
            });
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
                "Are you sure you want to remove this service category from this provider?"
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

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Service Categories</CardTitle>
                        <CardDescription>
                            Manage the services offered by {provider.businessName}
                        </CardDescription>
                    </div>
                    <Button
                        size="sm"
                        onClick={() => setAddDialogOpen(true)}
                        disabled={availableCategories.length === 0}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Category
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <p className="text-sm text-muted-foreground">Loading categories...</p>
                ) : !providerCategories || providerCategories.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        No service categories assigned yet.
                    </p>
                ) : (
                    <div className="space-y-2">
                        {providerCategories.map((category) => (
                            <div
                                key={category.id}
                                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    {category.icon && (
                                        <span className="text-2xl">{category.icon}</span>
                                    )}
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{category.name}</span>
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
                                                ? "Cannot remove the last category"
                                                : "Remove category"
                                        }
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>

            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Service Category</DialogTitle>
                        <DialogDescription>
                            Select a service category to add to {provider.businessName}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Select
                            value={selectedCategoryId}
                            onValueChange={setSelectedCategoryId}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableCategories.map((category) => (
                                    <SelectItem key={category.id} value={category.id}>
                                        <div className="flex items-center gap-2">
                                            {category.icon && <span>{category.icon}</span>}
                                            <span>{category.name}</span>
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
                            {addCategoryMutation.isPending ? "Adding..." : "Add Category"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
