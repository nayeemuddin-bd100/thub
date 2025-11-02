import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Link2, Plus, Trash2 } from "lucide-react";

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
  const [formData, setFormData] = useState({
    propertyId: "",
    serviceProviderId: "",
    isRecommended: false,
  });

  const { data: associations = [] } = useQuery<Association[]>({
    queryKey: ["/api/admin/property-service-associations"],
  });

  const { data: properties = [] } = useQuery<any[]>({
    queryKey: ["/api/properties"],
  });

  const { data: providers = [] } = useQuery<any[]>({
    queryKey: ["/api/service-providers"],
  });

  const createAssociationMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
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
      setFormData({ propertyId: "", serviceProviderId: "", isRecommended: false });
      toast({ title: "Success", description: "Service provider linked to property!" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createAssociationMutation.mutate(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="w-5 h-5" />
          Property-Service Associations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
          <h3 className="font-semibold">Add New Association</h3>
          
          <div>
            <Label>Property *</Label>
            <Select
              value={formData.propertyId}
              onValueChange={(value) => setFormData({ ...formData, propertyId: value })}
            >
              <SelectTrigger data-testid="select-property">
                <SelectValue placeholder="Select property" />
              </SelectTrigger>
              <SelectContent>
                {properties.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Service Provider *</Label>
            <Select
              value={formData.serviceProviderId}
              onValueChange={(value) => setFormData({ ...formData, serviceProviderId: value })}
            >
              <SelectTrigger data-testid="select-provider">
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                {providers.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id}>
                    {provider.businessName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="recommended"
              checked={formData.isRecommended}
              onChange={(e) => setFormData({ ...formData, isRecommended: e.target.checked })}
              data-testid="checkbox-recommended"
            />
            <Label htmlFor="recommended">Mark as Recommended</Label>
          </div>

          <Button type="submit" disabled={createAssociationMutation.isPending} data-testid="button-create-association">
            <Plus className="w-4 h-4 mr-2" />
            {createAssociationMutation.isPending ? "Adding..." : "Add Association"}
          </Button>
        </form>

        <div>
          <h3 className="font-semibold mb-3">Existing Associations</h3>
          {associations.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No associations yet</p>
          ) : (
            <div className="space-y-2">
              {associations.map((assoc) => (
                <div key={assoc.id} className="flex justify-between items-center p-3 border rounded-lg" data-testid={`association-${assoc.id}`}>
                  <div>
                    <p className="font-medium">{assoc.propertyTitle}</p>
                    <p className="text-sm text-muted-foreground">{assoc.providerName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {assoc.isRecommended && <Badge>Recommended</Badge>}
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
