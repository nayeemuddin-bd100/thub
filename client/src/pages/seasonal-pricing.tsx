import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Calendar, Plus, TrendingUp, TrendingDown } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const seasonalPriceSchema = z.object({
  propertyId: z.string().min(1, "Property is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  priceAdjustment: z.string()
    .min(1, "Price adjustment is required")
    .refine((val) => !isNaN(parseFloat(val)), "Must be a valid number"),
  seasonType: z.enum(["peak", "off-peak"]),
}).refine((data) => new Date(data.endDate) > new Date(data.startDate), {
  message: "End date must be after start date",
  path: ["endDate"],
});

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

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const form = useForm<z.infer<typeof seasonalPriceSchema>>({
    resolver: zodResolver(seasonalPriceSchema),
    defaultValues: {
      propertyId: "",
      startDate: "",
      endDate: "",
      priceAdjustment: "",
      seasonType: "peak",
    },
  });

  const { data: properties = [], isLoading: propertiesLoading, error: propertiesError } = useQuery<Property[]>({
    queryKey: ["/api/properties/my-properties"],
  });

  const { data: seasonalPrices = [], isLoading: pricesLoading, error: pricesError } = useQuery<SeasonalPrice[]>({
    queryKey: ["/api/seasonal-pricing"],
  });

  const createSeasonalPriceMutation = useMutation({
    mutationFn: async (data: z.infer<typeof seasonalPriceSchema>) => {
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
      form.reset();
      toast({ title: "Success", description: "Seasonal pricing created!" });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to create seasonal pricing. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: z.infer<typeof seasonalPriceSchema>) => {
    createSeasonalPriceMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onToggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold" data-testid="heading-seasonal-pricing">Seasonal Pricing</h1>
            <p className="text-muted-foreground mt-2">
              Manage peak and off-peak season pricing for your properties
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)} data-testid="button-create-seasonal-price">
            <Plus className="w-4 h-4 mr-2" />
            Add Seasonal Pricing
          </Button>
        </div>

        {pricesLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" data-testid="loading-seasonal-prices">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="h-32 bg-muted rounded animate-pulse" data-testid={`skeleton-seasonal-${i}`} />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : pricesError ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-destructive" data-testid="error-seasonal-prices">
                Failed to load seasonal pricing. Please try again.
              </p>
            </CardContent>
          </Card>
        ) : seasonalPrices.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2" data-testid="empty-seasonal-prices">No Seasonal Pricing Yet</h3>
              <p className="text-muted-foreground mb-4">
                Set up peak and off-peak season pricing to maximize your revenue
              </p>
              <Button onClick={() => setDialogOpen(true)} data-testid="button-add-first-seasonal">
                Add Your First Seasonal Price
              </Button>
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
                    <Badge 
                      variant={price.seasonType === "peak" ? "default" : "secondary"}
                      data-testid={`badge-season-type-${price.id}`}
                    >
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
                    <div className="flex items-center text-muted-foreground" data-testid={`text-dates-${price.id}`}>
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(price.startDate).toLocaleDateString()} -{" "}
                      {new Date(price.endDate).toLocaleDateString()}
                    </div>
                    <p className="text-lg font-semibold" data-testid={`text-price-adjustment-${price.id}`}>
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

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
                            <SelectItem value="loading" disabled>Loading properties...</SelectItem>
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
                  name="seasonType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Season Type *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-season-type">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="peak">Peak Season</SelectItem>
                          <SelectItem value="off-peak">Off-Peak Season</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} data-testid="input-start-date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} data-testid="input-end-date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="priceAdjustment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price Adjustment ($) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="50.00 (positive for increase, negative for decrease)"
                          {...field}
                          data-testid="input-price-adjustment"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} data-testid="button-cancel-seasonal">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createSeasonalPriceMutation.isPending} data-testid="button-submit-seasonal">
                    {createSeasonalPriceMutation.isPending ? "Creating..." : "Create"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Footer />
    </div>
  );
}
