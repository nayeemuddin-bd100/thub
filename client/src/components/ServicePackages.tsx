import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Plus, Package, Trash2 } from "lucide-react";

type ServicePackage = {
  id: string;
  serviceProviderId: string;
  name: string;
  description: string;
  price: string;
  recurrenceInterval: string | null;
  isActive: boolean;
};

export default function ServicePackages({ providerId }: { providerId: string }) {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    recurrenceInterval: "none",
  });

  const { data: packages = [], isLoading } = useQuery<ServicePackage[]>({
    queryKey: ["/api/provider/packages", providerId],
  });

  const createPackageMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch("/api/provider/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          recurrenceInterval: data.recurrenceInterval === "none" ? null : data.recurrenceInterval,
        }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create package");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/provider/packages", providerId] });
      setDialogOpen(false);
      setFormData({ name: "", description: "", price: "", recurrenceInterval: "none" });
      toast({ title: "Success", description: "Package created successfully!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create package", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPackageMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold">Service Packages & Bundles</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Create package deals and recurring service options
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} data-testid="button-create-package">
          <Plus className="w-4 h-4 mr-2" />
          Create Package
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-40 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : packages.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Packages Yet</h3>
            <p className="text-muted-foreground mb-4">Create package deals to attract more customers</p>
            <Button onClick={() => setDialogOpen(true)}>Create Your First Package</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {packages.map((pkg) => (
            <Card key={pkg.id} data-testid={`card-package-${pkg.id}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{pkg.name}</CardTitle>
                    <div className="flex gap-2 mt-2">
                      <Badge variant={pkg.isActive ? "default" : "secondary"}>
                        {pkg.isActive ? "Active" : "Inactive"}
                      </Badge>
                      {pkg.recurrenceInterval && (
                        <Badge variant="outline">{pkg.recurrenceInterval}</Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-2xl font-bold">${pkg.price}</p>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{pkg.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Service Package</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Package Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Weekend Chef Special"
                required
                data-testid="input-package-name"
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what's included in this package..."
                rows={3}
                required
                data-testid="textarea-package-description"
              />
            </div>

            <div>
              <Label htmlFor="price">Package Price ($) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="299.99"
                required
                data-testid="input-package-price"
              />
            </div>

            <div>
              <Label htmlFor="recurrence">Recurrence Interval</Label>
              <Select
                value={formData.recurrenceInterval}
                onValueChange={(value) => setFormData({ ...formData, recurrenceInterval: value })}
              >
                <SelectTrigger data-testid="select-recurrence">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">One-Time Package</SelectItem>
                  <SelectItem value="daily">Daily Recurring</SelectItem>
                  <SelectItem value="weekly">Weekly Recurring</SelectItem>
                  <SelectItem value="monthly">Monthly Recurring</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createPackageMutation.isPending} data-testid="button-submit-package">
                {createPackageMutation.isPending ? "Creating..." : "Create Package"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
