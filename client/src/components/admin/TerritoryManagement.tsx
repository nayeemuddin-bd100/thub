import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { MapPin, Plus, TrendingUp } from "lucide-react";

type Territory = {
  id: string;
  name: string;
  countryManagerId: string | null;
  managerName?: string;
};

export default function TerritoryManagement() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    countryManagerId: "",
  });

  const { data: territories = [] } = useQuery<Territory[]>({
    queryKey: ["/api/admin/territories"],
  });

  const { data: managers = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/country-managers"],
  });

  const createTerritoryMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
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
      setFormData({ name: "", countryManagerId: "" });
      toast({ title: "Success", description: "Territory created!" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTerritoryMutation.mutate(formData);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
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
        {territories.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No territories defined yet</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {territories.map((territory) => (
              <div key={territory.id} className="border rounded-lg p-4" data-testid={`territory-${territory.id}`}>
                <h4 className="font-semibold mb-1">{territory.name}</h4>
                <p className="text-sm text-muted-foreground">
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Territory Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="North America"
                  required
                  data-testid="input-territory-name"
                />
              </div>

              <div>
                <Label>Country Manager</Label>
                <Input
                  value={formData.countryManagerId}
                  onChange={(e) => setFormData({ ...formData, countryManagerId: e.target.value })}
                  placeholder="Manager User ID (optional)"
                  data-testid="input-manager-id"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createTerritoryMutation.isPending} data-testid="button-submit-territory">
                  {createTerritoryMutation.isPending ? "Creating..." : "Create Territory"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
