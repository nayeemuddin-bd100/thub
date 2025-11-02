import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Plus, Package } from "lucide-react";

const packageFormSchema = z.object({
  name: z.string().min(3, "Package name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.string().min(1, "Price is required").refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, "Price must be a positive number"),
  recurrenceInterval: z.string(),
});

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

  const form = useForm<z.infer<typeof packageFormSchema>>({
    resolver: zodResolver(packageFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      recurrenceInterval: "none",
    },
  });

  const { data: packages = [], isLoading, error } = useQuery<ServicePackage[]>({
    queryKey: ["/api/provider/packages", providerId],
  });

  const createPackageMutation = useMutation({
    mutationFn: async (data: z.infer<typeof packageFormSchema>) => {
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
      form.reset();
      toast({ title: "Success", description: "Package created successfully!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create package", variant: "destructive" });
    },
  });

  const handleSubmit = (data: z.infer<typeof packageFormSchema>) => {
    createPackageMutation.mutate(data);
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
        <div className="grid gap-4 md:grid-cols-2" data-testid="loading-packages">
          {[1, 2].map((i) => (
            <div key={i} className="h-40 bg-muted rounded-lg animate-pulse" data-testid={`skeleton-package-${i}`} />
          ))}
        </div>
      ) : error ? (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-destructive" data-testid="error-packages">Failed to load packages. Please try again.</p>
          </CardContent>
        </Card>
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

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Package Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Weekend Chef Special" {...field} data-testid="input-package-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe what's included in this package..."
                        rows={3}
                        {...field}
                        data-testid="textarea-package-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Package Price ($) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="299.99"
                        {...field}
                        data-testid="input-package-price"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="recurrenceInterval"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recurrence Interval</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-recurrence">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">One-Time Package</SelectItem>
                        <SelectItem value="daily">Daily Recurring</SelectItem>
                        <SelectItem value="weekly">Weekly Recurring</SelectItem>
                        <SelectItem value="monthly">Monthly Recurring</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} data-testid="button-cancel-package">
                  Cancel
                </Button>
                <Button type="submit" disabled={createPackageMutation.isPending} data-testid="button-submit-package">
                  {createPackageMutation.isPending ? "Creating..." : "Create Package"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
