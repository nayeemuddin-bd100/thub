import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Link2, Plus } from "lucide-react";

const associationSchema = z.object({
  propertyId: z.string().min(1, "Property is required"),
  serviceProviderId: z.string().min(1, "Service provider is required"),
  isRecommended: z.boolean(),
});

type Association = {
  id: string;
  propertyId: string;
  serviceProviderId: string;
  isRecommended: boolean;
  propertyTitle?: string;
  providerName?: string;
};

export default function PropertyServiceAssociation() {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof associationSchema>>({
    resolver: zodResolver(associationSchema),
    defaultValues: {
      propertyId: "",
      serviceProviderId: "",
      isRecommended: false,
    },
  });

  const { data: associations = [], isLoading: associationsLoading, error: associationsError } = useQuery<Association[]>({
    queryKey: ["/api/admin/property-service-associations"],
  });

  const { data: properties = [], isLoading: propertiesLoading } = useQuery<any[]>({
    queryKey: ["/api/properties"],
  });

  const { data: providers = [], isLoading: providersLoading } = useQuery<any[]>({
    queryKey: ["/api/service-providers"],
  });

  const createAssociationMutation = useMutation({
    mutationFn: async (data: z.infer<typeof associationSchema>) => {
      const res = await fetch("/api/admin/property-service-associations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create association");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/property-service-associations"] });
      form.reset();
      toast({ title: "Success", description: "Service provider linked to property!" });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to create association. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: z.infer<typeof associationSchema>) => {
    createAssociationMutation.mutate(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2" data-testid="heading-property-service-associations">
          <Link2 className="w-5 h-5" />
          Property-Service Associations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 p-4 border rounded-lg">
            <h3 className="font-semibold">Add New Association</h3>
            
            <FormField
              control={form.control}
              name="propertyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-property">
                        <SelectValue placeholder="Select property" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {propertiesLoading ? (
                        <SelectItem value="loading" disabled>Loading...</SelectItem>
                      ) : properties.length === 0 ? (
                        <SelectItem value="none" disabled>No properties found</SelectItem>
                      ) : (
                        properties.map((property) => (
                          <SelectItem key={property.id} value={property.id}>
                            {property.title}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="serviceProviderId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Provider *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-provider">
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {providersLoading ? (
                        <SelectItem value="loading" disabled>Loading...</SelectItem>
                      ) : providers.length === 0 ? (
                        <SelectItem value="none" disabled>No providers found</SelectItem>
                      ) : (
                        providers.map((provider) => (
                          <SelectItem key={provider.id} value={provider.id}>
                            {provider.businessName}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isRecommended"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox 
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      data-testid="checkbox-recommended"
                    />
                  </FormControl>
                  <FormLabel className="!mt-0">Mark as Recommended</FormLabel>
                </FormItem>
              )}
            />

            <Button type="submit" disabled={createAssociationMutation.isPending} data-testid="button-create-association">
              <Plus className="w-4 h-4 mr-2" />
              {createAssociationMutation.isPending ? "Adding..." : "Add Association"}
            </Button>
          </form>
        </Form>

        <div>
          <h3 className="font-semibold mb-3">Existing Associations</h3>
          {associationsLoading ? (
            <div className="space-y-2" data-testid="loading-associations">
              {[1, 2].map((i) => (
                <div key={i} className="h-16 bg-muted rounded animate-pulse" data-testid={`skeleton-association-${i}`} />
              ))}
            </div>
          ) : associationsError ? (
            <p className="text-center text-destructive py-4" data-testid="error-associations">
              Failed to load associations
            </p>
          ) : associations.length === 0 ? (
            <p className="text-center text-muted-foreground py-4" data-testid="empty-associations">
              No associations yet
            </p>
          ) : (
            <div className="space-y-2">
              {associations.map((assoc) => (
                <div key={assoc.id} className="flex justify-between items-center p-3 border rounded-lg" data-testid={`association-${assoc.id}`}>
                  <div>
                    <p className="font-medium" data-testid={`text-property-${assoc.id}`}>{assoc.propertyTitle}</p>
                    <p className="text-sm text-muted-foreground" data-testid={`text-provider-${assoc.id}`}>{assoc.providerName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {assoc.isRecommended && <Badge data-testid={`badge-recommended-${assoc.id}`}>Recommended</Badge>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
