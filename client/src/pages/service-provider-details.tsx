import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Star, 
  MapPin, 
  Phone, 
  DollarSign, 
  Clock, 
  ChefHat, 
  ClipboardList, 
  ShoppingCart,
  ArrowLeft
} from "lucide-react";
import { useState } from "react";
import type { ServiceProvider, MenuItem, ServiceTask } from "@shared/schema";

export default function ServiceProviderDetailsPage() {
  const params = useParams();
  const providerId = params.id;
  const [, navigate] = useLocation();
  
  const [selectedMenuItems, setSelectedMenuItems] = useState<Set<string>>(new Set());
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());

  const { data: provider, isLoading: providerLoading } = useQuery<ServiceProvider>({
    queryKey: ['/api/service-providers', providerId],
    enabled: !!providerId,
  });

  const { data: menus, isLoading: menusLoading } = useQuery<Array<any>>({
    queryKey: ['/api/public/provider', providerId, 'menus'],
    enabled: !!providerId,
  });

  const { data: tasks, isLoading: tasksLoading } = useQuery<Array<ServiceTask & { customPrice?: string; effectivePrice: string }>>({
    queryKey: ['/api/public/provider', providerId, 'tasks'],
    enabled: !!providerId,
  });

  const toggleMenuItem = (itemId: string) => {
    const newSelection = new Set(selectedMenuItems);
    if (newSelection.has(itemId)) {
      newSelection.delete(itemId);
    } else {
      newSelection.add(itemId);
    }
    setSelectedMenuItems(newSelection);
  };

  const toggleTask = (taskId: string) => {
    const newSelection = new Set(selectedTasks);
    if (newSelection.has(taskId)) {
      newSelection.delete(taskId);
    } else {
      newSelection.add(taskId);
    }
    setSelectedTasks(newSelection);
  };

  const calculateTotal = () => {
    let total = 0;
    
    // Add menu items
    if (menus) {
      menus.forEach(menu => {
        menu.items?.forEach((item: MenuItem) => {
          if (selectedMenuItems.has(item.id)) {
            total += parseFloat(item.price);
          }
        });
      });
    }
    
    // Add tasks
    if (tasks) {
      tasks.forEach(task => {
        if (selectedTasks.has(task.id)) {
          total += parseFloat(task.effectivePrice);
        }
      });
    }
    
    return total;
  };

  const handleProceedToBooking = () => {
    const selectedItems = [];
    
    if (menus) {
      menus.forEach(menu => {
        menu.items?.forEach((item: MenuItem) => {
          if (selectedMenuItems.has(item.id)) {
            selectedItems.push({
              type: 'menu_item',
              id: item.id,
              name: item.dishName,
              price: item.price,
            });
          }
        });
      });
    }
    
    if (tasks) {
      tasks.forEach(task => {
        if (selectedTasks.has(task.id)) {
          selectedItems.push({
            type: 'task',
            id: task.id,
            name: task.taskName,
            price: task.effectivePrice,
          });
        }
      });
    }
    
    // Store selection and navigate to booking page
    sessionStorage.setItem('serviceSelection', JSON.stringify({
      providerId,
      items: selectedItems,
      total: calculateTotal(),
    }));
    
    navigate(`/book-service/${providerId}`);
  };

  if (providerLoading) {
    return (
      <div className="container mx-auto p-6" data-testid="loading-provider">
        <p className="text-center text-gray-500 dark:text-gray-400">Loading provider details...</p>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="container mx-auto p-6" data-testid="provider-not-found">
        <p className="text-center text-red-600 dark:text-red-400">Provider not found</p>
      </div>
    );
  }

  const totalSelected = selectedMenuItems.size + selectedTasks.size;
  const totalPrice = calculateTotal();

  return (
    <div className="container mx-auto p-6 max-w-6xl" data-testid="provider-details-page">
      <Button
        variant="ghost"
        onClick={() => navigate('/')}
        className="mb-4"
        data-testid="button-back-home"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Home
      </Button>

      <Card className="mb-6" data-testid="card-provider-info">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-3xl" data-testid="text-provider-name">{provider.businessName}</CardTitle>
              <CardDescription className="mt-2" data-testid="text-provider-description">{provider.description}</CardDescription>
            </div>
            <div className="flex items-center gap-1" data-testid="provider-rating">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold" data-testid="text-rating">{provider.rating?.toFixed(1) || 'N/A'}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400" data-testid="text-review-count">
                ({provider.reviewCount} reviews)
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2" data-testid="provider-location">
              <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span data-testid="text-location">{provider.location}</span>
            </div>
            {provider.whatsappNumber && (
              <div className="flex items-center gap-2" data-testid="provider-whatsapp">
                <Phone className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <span data-testid="text-whatsapp">{provider.whatsappNumber}</span>
              </div>
            )}
            <div className="flex items-center gap-2" data-testid="provider-rates">
              <DollarSign className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              {provider.hourlyRate && (
                <span data-testid="text-hourly-rate">${provider.hourlyRate}/hr</span>
              )}
              {provider.fixedRate && (
                <span data-testid="text-fixed-rate">${provider.fixedRate} fixed</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue={menus && menus.length > 0 ? "menu" : "tasks"} className="space-y-4">
        {menus && menus.length > 0 && (
          <TabsList>
            <TabsTrigger value="menu" data-testid="tab-menu">
              <ChefHat className="h-4 w-4 mr-2" />
              Menu
            </TabsTrigger>
            <TabsTrigger value="tasks" data-testid="tab-tasks">
              <ClipboardList className="h-4 w-4 mr-2" />
              Services
            </TabsTrigger>
          </TabsList>
        )}

        {menus && menus.length > 0 && (
          <TabsContent value="menu" className="space-y-4">
            {menusLoading ? (
              <p className="text-center text-gray-500 dark:text-gray-400" data-testid="loading-menus">Loading menu...</p>
            ) : (
              menus.map((menu) => (
                <Card key={menu.id} data-testid={`card-menu-${menu.id}`}>
                  <CardHeader>
                    <CardTitle data-testid={`text-menu-name-${menu.id}`}>{menu.categoryName}</CardTitle>
                    {menu.description && (
                      <CardDescription data-testid={`text-menu-description-${menu.id}`}>{menu.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {menu.items?.map((item: MenuItem) => (
                        <div
                          key={item.id}
                          className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                          onClick={() => toggleMenuItem(item.id)}
                          data-testid={`card-menu-item-${item.id}`}
                        >
                          <Checkbox
                            checked={selectedMenuItems.has(item.id)}
                            onCheckedChange={() => toggleMenuItem(item.id)}
                            data-testid={`checkbox-menu-item-${item.id}`}
                          />
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-semibold" data-testid={`text-item-name-${item.id}`}>{item.dishName}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1" data-testid={`text-item-description-${item.id}`}>
                                  {item.description}
                                </p>
                                {item.ingredients && (
                                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2" data-testid={`text-item-ingredients-${item.id}`}>
                                    Ingredients: {item.ingredients.join(', ')}
                                  </p>
                                )}
                                {item.dietaryTags && item.dietaryTags.length > 0 && (
                                  <div className="flex gap-1 mt-2">
                                    {item.dietaryTags.map((tag: string) => (
                                      <Badge key={tag} variant="secondary" className="text-xs" data-testid={`badge-tag-${tag}`}>
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <span className="font-bold text-lg" data-testid={`text-item-price-${item.id}`}>
                                ${parseFloat(item.price).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        )}

        <TabsContent value="tasks" className="space-y-4">
          {tasksLoading ? (
            <p className="text-center text-gray-500 dark:text-gray-400" data-testid="loading-tasks">Loading services...</p>
          ) : tasks && tasks.length > 0 ? (
            <Card data-testid="card-available-tasks">
              <CardHeader>
                <CardTitle>Available Services</CardTitle>
                <CardDescription>Select the services you need</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                      onClick={() => toggleTask(task.id)}
                      data-testid={`card-task-${task.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={selectedTasks.has(task.id)}
                          onCheckedChange={() => toggleTask(task.id)}
                          data-testid={`checkbox-task-${task.id}`}
                        />
                        <div>
                          <p className="font-medium" data-testid={`text-task-name-${task.id}`}>{task.taskName}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400" data-testid={`text-task-description-${task.id}`}>
                            {task.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500 dark:text-gray-500" data-testid={`text-task-duration-${task.id}`}>
                              ~{task.estimatedDuration} min
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold" data-testid={`text-task-price-${task.id}`}>
                          ${parseFloat(task.effectivePrice).toFixed(2)}
                        </p>
                        {task.customPrice && (
                          <p className="text-xs text-green-600 dark:text-green-400" data-testid={`text-custom-price-${task.id}`}>
                            Provider pricing
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card data-testid="no-tasks-available">
              <CardContent className="py-8">
                <p className="text-center text-gray-500 dark:text-gray-400">
                  No services configured yet
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {totalSelected > 0 && (
        <Card className="mt-6 sticky bottom-4 shadow-lg" data-testid="card-selection-summary">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400" data-testid="text-items-selected">
                  {totalSelected} item{totalSelected !== 1 ? 's' : ''} selected
                </p>
                <p className="text-2xl font-bold" data-testid="text-total-price">
                  ${totalPrice.toFixed(2)}
                </p>
              </div>
              <Button 
                onClick={handleProceedToBooking}
                size="lg"
                data-testid="button-proceed-booking"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Proceed to Booking
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
