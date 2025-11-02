import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { MapPin, Plus } from "lucide-react";

const territorySchema = z.object({
  name: z.string().min(1, "Territory name is required"),
  countryManagerId: z.string().optional(),
});

type Territory = {
  id: string;
  name: string;
  countryManagerId: string | null;
  managerName?: string;
};

export default function TerritoryManagement() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof territorySchema>>({
    resolver: zodResolver(territorySchema),
    defaultValues: {
      name: "",
      countryManagerId: "",
    },
  });

  const { data: territories = [], isLoading, error } = useQuery<Territory[]>({
    queryKey: ["/api/admin/territories"],
  });

  const { data: managers = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/country-managers"],
  });

  const createTerritoryMutation = useMutation({
    mutationFn: async (data: z.infer<typeof territorySchema>) => {
      const res = await fetch("/api/admin/territories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create territory");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/territories"] });
      setDialogOpen(false);
      form.reset();
      toast({ title: "Success", description: "Territory created!" });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to create territory.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: z.infer<typeof territorySchema>) => {
    createTerritoryMutation.mutate(data);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2" data-testid="heading-territory-management">
            <MapPin className="w-5 h-5" />
            Territory Management
          </CardTitle>
          <Button size="sm" onClick={() => setDialogOpen(true)} data-testid="button-create-territory">
            <Plus className="w-4 h-4 mr-2" />
            Create Territory
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2" data-testid="loading-territories">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 bg-muted rounded animate-pulse" data-testid={`skeleton-territory-${i}`} />
            ))}
          </div>
        ) : error ? (
          <p className="text-center text-destructive py-8" data-testid="error-territories">
            Failed to load territories
          </p>
        ) : territories.length === 0 ? (
          <p className="text-center text-muted-foreground py-8" data-testid="empty-territories">
            No territories defined yet
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {territories.map((territory) => (
              <div key={territory.id} className="border rounded-lg p-4" data-testid={`territory-${territory.id}`}>
                <h4 className="font-semibold mb-1" data-testid={`text-name-${territory.id}`}>{territory.name}</h4>
                <p className="text-sm text-muted-foreground" data-testid={`text-manager-${territory.id}`}>
                  Manager: {territory.managerName || "Unassigned"}
                </p>
              </div>
            ))}
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Territory</DialogTitle>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Territory Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="North America" {...field} data-testid="input-territory-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="countryManagerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country Manager</FormLabel>
                      <FormControl>
                        <Input placeholder="Manager User ID (optional)" {...field} data-testid="input-manager-id" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} data-testid="button-cancel-territory">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createTerritoryMutation.isPending} data-testid="button-submit-territory">
                    {createTerritoryMutation.isPending ? "Creating..." : "Create Territory"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
