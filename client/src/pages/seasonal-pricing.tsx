import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Calendar, Plus, TrendingUp, TrendingDown } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type SeasonalPrice = {
  id: string;
  propertyId: string;
  startDate: string;
  endDate: string;
  priceAdjustment: string;
  seasonType: string;
};

type Property = {
  id: string;
  title: string;
  pricePerNight: string;
};

export default function SeasonalPricing() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [formData, setFormData] = useState({
    propertyId: "",
    startDate: "",
    endDate: "",
    priceAdjustment: "",
    seasonType: "peak",
  });

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: ["/api/properties/my-properties"],
  });

  const { data: seasonalPrices = [] } = useQuery<SeasonalPrice[]>({
    queryKey: ["/api/seasonal-pricing"],
  });

  const createSeasonalPriceMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch("/api/seasonal-pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create seasonal price");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/seasonal-pricing"] });
      setDialogOpen(false);
      setFormData({ propertyId: "", startDate: "", endDate: "", priceAdjustment: "", seasonType: "peak" });
      toast({ title: "Success", description: "Seasonal pricing created!" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createSeasonalPriceMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onToggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Seasonal Pricing</h1>
            <p className="text-muted-foreground mt-2">
              Manage peak and off-peak season pricing for your properties
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)} data-testid="button-create-seasonal-price">
            <Plus className="w-4 h-4 mr-2" />
            Add Seasonal Pricing
          </Button>
        </div>

        {seasonalPrices.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Seasonal Pricing Yet</h3>
              <p className="text-muted-foreground mb-4">
                Set up peak and off-peak season pricing to maximize your revenue
              </p>
              <Button onClick={() => setDialogOpen(true)}>Add Your First Seasonal Price</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {seasonalPrices.map((price) => (
              <Card key={price.id} data-testid={`card-seasonal-${price.id}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">
                      {properties.find((p) => p.id === price.propertyId)?.title || "Property"}
                    </CardTitle>
                    <Badge variant={price.seasonType === "peak" ? "default" : "secondary"}>
                      {price.seasonType === "peak" ? (
                        <TrendingUp className="w-3 h-3 mr-1" />
                      ) : (
                        <TrendingDown className="w-3 h-3 mr-1" />
                      )}
                      {price.seasonType}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(price.startDate).toLocaleDateString()} -{" "}
                      {new Date(price.endDate).toLocaleDateString()}
                    </div>
                    <p className="text-lg font-semibold">
                      {parseFloat(price.priceAdjustment) > 0 ? "+" : ""}${price.priceAdjustment} per night
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Seasonal Pricing</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                <Label>Season Type *</Label>
                <Select
                  value={formData.seasonType}
                  onValueChange={(value) => setFormData({ ...formData, seasonType: value })}
                >
                  <SelectTrigger data-testid="select-season-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="peak">Peak Season</SelectItem>
                    <SelectItem value="off-peak">Off-Peak Season</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date *</Label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                    data-testid="input-start-date"
                  />
                </div>
                <div>
                  <Label>End Date *</Label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                    data-testid="input-end-date"
                  />
                </div>
              </div>

              <div>
                <Label>Price Adjustment ($) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.priceAdjustment}
                  onChange={(e) => setFormData({ ...formData, priceAdjustment: e.target.value })}
                  placeholder="50.00 (positive for increase, negative for decrease)"
                  required
                  data-testid="input-price-adjustment"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createSeasonalPriceMutation.isPending} data-testid="button-submit-seasonal">
                  {createSeasonalPriceMutation.isPending ? "Creating..." : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Footer />
    </div>
  );
}
