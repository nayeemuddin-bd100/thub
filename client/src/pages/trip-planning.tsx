import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar, MapPin, Plus, Trash2, Hotel, Utensils, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const createTripSchema = z.object({
  name: z.string().min(3, "Trip name must be at least 3 characters"),
  description: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  destination: z.string().min(2, "Destination is required"),
});

const addItemSchema = z.object({
  itemType: z.enum(["property", "service"]),
  itemId: z.string().min(1, "Please select an item"),
});

type TripPlan = {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string;
  destination: string;
};

type TripPlanItem = {
  id: string;
  tripPlanId: string;
  itemType: "property" | "service";
  itemId: string;
  propertyTitle?: string;
  providerBusinessName?: string;
};

type Property = {
  id: string;
  title: string;
};

type ServiceProvider = {
  id: string;
  businessName: string;
};

export default function TripPlanning() {
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [addItemDialogOpen, setAddItemDialogOpen] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [itemType, setItemType] = useState<"property" | "service">("property");
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const createForm = useForm({
    resolver: zodResolver(createTripSchema),
    defaultValues: {
      name: "",
      description: "",
      startDate: "",
      endDate: "",
      destination: "",
    },
  });

  const addItemForm = useForm({
    resolver: zodResolver(addItemSchema),
    defaultValues: {
      itemType: "property" as const,
      itemId: "",
    },
  });

  const { data: tripPlans = [], isLoading: tripsLoading } = useQuery<TripPlan[]>({
    queryKey: ["/api/trip-plans"],
  });

  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  const { data: providers = [] } = useQuery<ServiceProvider[]>({
    queryKey: ["/api/service-providers"],
  });

  const createTripMutation = useMutation({
    mutationFn: async (data: z.infer<typeof createTripSchema>) => {
      return await apiRequest("/api/trip-plans", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trip-plans"] });
      setCreateDialogOpen(false);
      createForm.reset();
      toast({
        title: "Trip Created",
        description: "Your trip plan has been created successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create trip plan. Please try again.",
        variant: "destructive",
      });
    },
  });

  const addItemMutation = useMutation({
    mutationFn: async ({ tripId, data }: { tripId: string; data: z.infer<typeof addItemSchema> }) => {
      return await apiRequest(`/api/trip-plans/${tripId}/items`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trip-plans"] });
      setAddItemDialogOpen(false);
      addItemForm.reset();
      toast({
        title: "Item Added",
        description: "Item added to your trip successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add item to trip. Please try again.",
        variant: "destructive",
      });
    },
  });

  const { data: selectedTripDetails } = useQuery<{ tripPlan: TripPlan; items: TripPlanItem[] }>({
    queryKey: ["/api/trip-plans", selectedTripId],
    enabled: !!selectedTripId,
  });

  const handleCreateTrip = (data: z.infer<typeof createTripSchema>) => {
    createTripMutation.mutate(data);
  };

  const handleAddItem = (data: z.infer<typeof addItemSchema>) => {
    if (selectedTripId) {
      addItemMutation.mutate({ tripId: selectedTripId, data });
    }
  };

  const openAddItemDialog = (tripId: string) => {
    setSelectedTripId(tripId);
    setAddItemDialogOpen(true);
  };

  if (tripsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header onToggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading your trips...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onToggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Trip Planning</h1>
            <p className="text-muted-foreground mt-2">Plan your perfect getaway with properties and services</p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)} data-testid="button-create-trip">
            <Plus className="h-4 w-4 mr-2" />
            Create New Trip
          </Button>
        </div>

        {tripPlans.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Trip Plans Yet</h3>
              <p className="text-muted-foreground mb-4">
                Start planning your next adventure by creating a trip!
              </p>
              <Button onClick={() => setCreateDialogOpen(true)} data-testid="button-create-first-trip">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Trip
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tripPlans.map((trip) => (
              <Card key={trip.id} className="hover:shadow-lg transition-shadow" data-testid={`card-trip-${trip.id}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="line-clamp-1" data-testid={`text-trip-name-${trip.id}`}>
                        {trip.name}
                      </CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        {trip.destination}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      {format(new Date(trip.startDate), "MMM d, yyyy")} - {format(new Date(trip.endDate), "MMM d, yyyy")}
                    </div>

                    {trip.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{trip.description}</p>
                    )}

                    <div className="pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => openAddItemDialog(trip.id)}
                        data-testid={`button-add-item-${trip.id}`}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Property or Service
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create Trip Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Trip</DialogTitle>
              <DialogDescription>
                Plan your next adventure by creating a trip itinerary
              </DialogDescription>
            </DialogHeader>

            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(handleCreateTrip)} className="space-y-4">
                <FormField
                  control={createForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trip Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Summer Vacation 2025" {...field} data-testid="input-trip-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="destination"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destination *</FormLabel>
                      <FormControl>
                        <Input placeholder="Paris, France" {...field} data-testid="input-destination" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
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
                    control={createForm.control}
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
                  control={createForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us about your trip plans..."
                          rows={3}
                          {...field}
                          data-testid="textarea-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setCreateDialogOpen(false);
                      createForm.reset();
                    }}
                    disabled={createTripMutation.isPending}
                    data-testid="button-cancel-create"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createTripMutation.isPending}
                    data-testid="button-submit-trip"
                  >
                    {createTripMutation.isPending ? "Creating..." : "Create Trip"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Add Item Dialog */}
        <Dialog open={addItemDialogOpen} onOpenChange={setAddItemDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add to Trip</DialogTitle>
              <DialogDescription>
                Add a property or service to your trip itinerary
              </DialogDescription>
            </DialogHeader>

            <Form {...addItemForm}>
              <form onSubmit={addItemForm.handleSubmit(handleAddItem)} className="space-y-4">
                <FormField
                  control={addItemForm.control}
                  name="itemType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item Type *</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          setItemType(value as "property" | "service");
                          addItemForm.setValue("itemId", "");
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-item-type">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="property">Property</SelectItem>
                          <SelectItem value="service">Service Provider</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={addItemForm.control}
                  name="itemId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {itemType === "property" ? "Select Property *" : "Select Service Provider *"}
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-item">
                            <SelectValue placeholder={`Choose a ${itemType}`} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {itemType === "property" ? (
                            properties.length > 0 ? (
                              properties.map((property) => (
                                <SelectItem key={property.id} value={property.id}>
                                  <div className="flex items-center">
                                    <Hotel className="h-4 w-4 mr-2" />
                                    {property.title}
                                  </div>
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-properties" disabled>
                                No properties available
                              </SelectItem>
                            )
                          ) : (
                            providers.length > 0 ? (
                              providers.map((provider) => (
                                <SelectItem key={provider.id} value={provider.id}>
                                  <div className="flex items-center">
                                    <Utensils className="h-4 w-4 mr-2" />
                                    {provider.businessName}
                                  </div>
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-providers" disabled>
                                No service providers available
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setAddItemDialogOpen(false);
                      addItemForm.reset();
                    }}
                    disabled={addItemMutation.isPending}
                    data-testid="button-cancel-add"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={addItemMutation.isPending}
                    data-testid="button-submit-item"
                  >
                    {addItemMutation.isPending ? "Adding..." : "Add to Trip"}
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
