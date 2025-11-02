import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  ChefHat, 
  Calendar, 
  DollarSign, 
  ClipboardList,
  Plus,
  Trash2,
  Edit,
  Save,
  X
} from "lucide-react";
import type { 
  ServiceProvider, 
  ProviderMenu, 
  MenuItem, 
  ProviderTaskConfig,
  ServiceTask 
} from "@shared/schema";

export default function ProviderConfig() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch provider profile
  const { data: provider, isLoading } = useQuery<ServiceProvider & { category: { name: string } }>({
    queryKey: ["/api/provider/profile"],
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-64"></div>
            <div className="h-96 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-semibold mb-4">Provider Profile Not Found</h2>
            <p className="text-muted-foreground mb-6">
              You need to be approved as a service provider to access this page.
            </p>
            <Button onClick={() => window.location.href = "/dashboard"}>
              Return to Dashboard
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const isChef = provider.category.name.toLowerCase().includes("chef") || 
                 provider.category.name.toLowerCase().includes("cook");
  const isMaid = provider.category.name.toLowerCase().includes("maid") || 
                 provider.category.name.toLowerCase().includes("clean");

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Service Configuration
          </h1>
          <p className="text-muted-foreground">
            Manage your service offerings, pricing, and availability
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">
              <ClipboardList className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            {isChef && (
              <TabsTrigger value="menus">
                <ChefHat className="w-4 h-4 mr-2" />
                Menus
              </TabsTrigger>
            )}
            {isMaid && (
              <TabsTrigger value="tasks">
                <ClipboardList className="w-4 h-4 mr-2" />
                Tasks
              </TabsTrigger>
            )}
            <TabsTrigger value="pricing">
              <DollarSign className="w-4 h-4 mr-2" />
              Pricing
            </TabsTrigger>
            <TabsTrigger value="packages">
              <Plus className="w-4 h-4 mr-2" />
              Packages
            </TabsTrigger>
            <TabsTrigger value="availability">
              <Calendar className="w-4 h-4 mr-2" />
              Availability
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <OverviewTab provider={provider} />
          </TabsContent>

          {isChef && (
            <TabsContent value="menus" className="space-y-6">
              <MenuManagement providerId={provider.id} />
            </TabsContent>
          )}

          {isMaid && (
            <TabsContent value="tasks" className="space-y-6">
              <TaskManagement providerId={provider.id} categoryId={provider.categoryId} />
            </TabsContent>
          )}

          <TabsContent value="pricing" className="space-y-6">
            <PricingManagement provider={provider} />
          </TabsContent>

          <TabsContent value="availability" className="space-y-6">
            <AvailabilityManagement provider={provider} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function OverviewTab({ provider }: { provider: ServiceProvider & { category: { name: string } } }) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    businessName: provider.businessName,
    description: provider.description || "",
    location: provider.location || "",
    whatsappNumber: provider.whatsappNumber || "",
  });

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest("PATCH", `/api/provider/profile`, data);
      return await response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Profile updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/provider/profile"] });
      setIsEditing(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update profile", variant: "destructive" });
    },
  });

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Business Profile</h2>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={() => updateMutation.mutate(formData)}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="businessName">Business Name</Label>
          <Input
            id="businessName"
            value={formData.businessName}
            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
            disabled={!isEditing}
          />
        </div>

        <div>
          <Label htmlFor="category">Service Category</Label>
          <Input
            id="category"
            value={provider.category.name}
            disabled
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            disabled={!isEditing}
            rows={4}
          />
        </div>

        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            disabled={!isEditing}
            placeholder="City, State/Country"
          />
        </div>

        <div>
          <Label htmlFor="whatsapp">WhatsApp Number</Label>
          <Input
            id="whatsapp"
            value={formData.whatsappNumber}
            onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
            disabled={!isEditing}
            placeholder="+1234567890"
          />
        </div>

        <div className="md:col-span-2 pt-4 border-t">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Rating</p>
              <p className="text-2xl font-bold">{parseFloat(provider.rating || "0").toFixed(1)} ⭐</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Reviews</p>
              <p className="text-2xl font-bold">{provider.reviewCount || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant={provider.approvalStatus === "approved" ? "default" : "secondary"}>
                {provider.approvalStatus}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Verified</p>
              <Badge variant={provider.isVerified ? "default" : "secondary"}>
                {provider.isVerified ? "Yes" : "No"}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function MenuManagement({ providerId }: { providerId: string }) {
  const { toast } = useToast();
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [newMenuName, setNewMenuName] = useState("");
  const [newMenuDesc, setNewMenuDesc] = useState("");

  const { data: menus, isLoading } = useQuery<(ProviderMenu & { items: MenuItem[] })[]>({
    queryKey: ["/api/provider/menus", providerId],
  });

  const createMenuMutation = useMutation({
    mutationFn: async (data: { categoryName: string; description: string }) => {
      const response = await apiRequest("POST", "/api/provider/menus", {
        serviceProviderId: providerId,
        ...data,
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Menu category created" });
      queryClient.invalidateQueries({ queryKey: ["/api/provider/menus", providerId] });
      setShowAddMenu(false);
      setNewMenuName("");
      setNewMenuDesc("");
    },
  });

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold">Menu Management</h2>
            <p className="text-muted-foreground">Create menus and add dishes for your chef services</p>
          </div>
          <Button onClick={() => setShowAddMenu(!showAddMenu)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Menu Category
          </Button>
        </div>

        {showAddMenu && (
          <Card className="p-4 mb-6 bg-muted">
            <div className="space-y-4">
              <div>
                <Label htmlFor="menuName">Menu Category Name</Label>
                <Input
                  id="menuName"
                  value={newMenuName}
                  onChange={(e) => setNewMenuName(e.target.value)}
                  placeholder="e.g., Breakfast Menu, Dinner Menu"
                />
              </div>
              <div>
                <Label htmlFor="menuDesc">Description</Label>
                <Textarea
                  id="menuDesc"
                  value={newMenuDesc}
                  onChange={(e) => setNewMenuDesc(e.target.value)}
                  placeholder="Brief description of this menu category"
                  rows={2}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => createMenuMutation.mutate({ 
                    categoryName: newMenuName, 
                    description: newMenuDesc 
                  })}
                  disabled={!newMenuName}
                >
                  Create Category
                </Button>
                <Button variant="outline" onClick={() => setShowAddMenu(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded animate-pulse"></div>
            ))}
          </div>
        ) : menus && menus.length > 0 ? (
          <div className="space-y-4">
            {menus.map((menu) => (
              <MenuCategoryCard key={menu.id} menu={menu} providerId={providerId} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <ChefHat className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No menus created yet. Add your first menu category to get started.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}

function MenuCategoryCard({ 
  menu, 
  providerId 
}: { 
  menu: ProviderMenu & { items: MenuItem[] };
  providerId: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const { toast } = useToast();

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{menu.categoryName}</h3>
          {menu.description && (
            <p className="text-sm text-muted-foreground">{menu.description}</p>
          )}
          <p className="text-sm text-muted-foreground mt-1">
            {menu.items?.length || 0} dishes
          </p>
        </div>
        <Button variant="outline" onClick={() => setExpanded(!expanded)}>
          {expanded ? "Hide" : "Show"} Dishes
        </Button>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t space-y-2">
          {menu.items && menu.items.length > 0 ? (
            menu.items.map((item: MenuItem) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-muted rounded">
                <div>
                  <p className="font-medium">{item.dishName}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  {item.price && (
                    <p className="text-sm font-semibold mt-1">${parseFloat(item.price).toFixed(2)}</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-4">
              No dishes added yet. Click "Add Dish" to get started.
            </p>
          )}
          <Button className="w-full mt-2">
            <Plus className="w-4 h-4 mr-2" />
            Add Dish
          </Button>
        </div>
      )}
    </Card>
  );
}

function TaskManagement({ providerId, categoryId }: { providerId: string; categoryId: string }) {
  const { data: tasks, isLoading } = useQuery<ServiceTask[]>({
    queryKey: ["/api/service-tasks", categoryId],
  });

  const { data: configs } = useQuery<ProviderTaskConfig[]>({
    queryKey: ["/api/provider/tasks", providerId],
  });

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Task Configuration</h2>
      <p className="text-muted-foreground mb-6">
        Enable/disable tasks and set custom pricing for your services
      </p>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
          ))}
        </div>
      ) : tasks && tasks.length > 0 ? (
        <div className="space-y-2">
          {tasks.map((task: ServiceTask) => {
            const config = configs?.find((c: ProviderTaskConfig) => c.taskId === task.id);
            return (
              <TaskConfigRow 
                key={task.id} 
                task={task} 
                config={config}
                providerId={providerId}
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <ClipboardList className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No tasks available for configuration</p>
        </div>
      )}
    </Card>
  );
}

function TaskConfigRow({
  task,
  config,
  providerId,
}: {
  task: ServiceTask;
  config?: ProviderTaskConfig;
  providerId: string;
}) {
  const { toast } = useToast();
  const [enabled, setEnabled] = useState(config?.isEnabled ?? true);
  const [price, setPrice] = useState(config?.customPrice || "");

  const updateMutation = useMutation({
    mutationFn: async (data: { isEnabled: boolean; customPrice?: string }) => {
      const response = await apiRequest("POST", "/api/provider/tasks", {
        serviceProviderId: providerId,
        taskId: task.id,
        ...data,
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Task configuration updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/provider/tasks", providerId] });
    },
  });

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <Switch
            checked={enabled}
            onCheckedChange={(checked) => {
              setEnabled(checked);
              updateMutation.mutate({ isEnabled: checked, customPrice: price });
            }}
          />
          <div>
            <p className="font-medium">{task.taskName}</p>
            {task.description && (
              <p className="text-sm text-muted-foreground">{task.description}</p>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          step="0.01"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          onBlur={() => {
            if (price) {
              updateMutation.mutate({ isEnabled: enabled, customPrice: price });
            }
          }}
          className="w-24"
        />
        <span className="text-sm text-muted-foreground">USD</span>
      </div>
    </div>
  );
}

function PricingManagement({ provider }: { provider: ServiceProvider }) {
  const { toast } = useToast();
  const [hourlyRate, setHourlyRate] = useState(provider.hourlyRate || "");
  const [fixedRate, setFixedRate] = useState(provider.fixedRate || "");

  const updateMutation = useMutation({
    mutationFn: async (data: { hourlyRate?: string; fixedRate?: string }) => {
      const response = await apiRequest("PATCH", "/api/provider/profile", data);
      return await response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Pricing updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/provider/profile"] });
    },
  });

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Pricing Structure</h2>
      <p className="text-muted-foreground mb-6">
        Set your base rates for services
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="hourlyRate">Hourly Rate</Label>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-muted-foreground">$</span>
            <Input
              id="hourlyRate"
              type="number"
              step="0.01"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              placeholder="0.00"
            />
            <span className="text-muted-foreground">/hour</span>
          </div>
        </div>

        <div>
          <Label htmlFor="fixedRate">Fixed Rate</Label>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-muted-foreground">$</span>
            <Input
              id="fixedRate"
              type="number"
              step="0.01"
              value={fixedRate}
              onChange={(e) => setFixedRate(e.target.value)}
              placeholder="0.00"
            />
            <span className="text-muted-foreground">/service</span>
          </div>
        </div>

        <div className="md:col-span-2">
          <Button 
            onClick={() => updateMutation.mutate({ hourlyRate, fixedRate })}
            disabled={!hourlyRate && !fixedRate}
          >
            Save Pricing
          </Button>
        </div>
      </div>
    </Card>
  );
}

function AvailabilityManagement({ provider }: { provider: ServiceProvider }) {
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Availability Calendar</h2>
      <p className="text-muted-foreground mb-6">
        Manage your working hours and availability
      </p>

      <div className="text-center py-12">
        <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground mb-4">
          Availability calendar coming soon
        </p>
        <p className="text-sm text-muted-foreground">
          You'll be able to set your working hours, block dates, and manage your schedule here.
        </p>
      </div>
    </Card>
  );
}
