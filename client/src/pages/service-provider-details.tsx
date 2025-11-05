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
  ArrowLeft,
  Calendar,
  Package,
  MessageCircle,
  Award,
  Languages,
  ImageIcon
} from "lucide-react";
import { useState } from "react";
import { format, parseISO } from "date-fns";
import type { ServiceProvider } from "@shared/schema";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

interface MenuItemData {
  id: string;
  dishName: string;
  description: string | null;
  price: string | null;
  ingredients: string[];
  dietaryTags: string[];
}

interface MenuData {
  id: string;
  categoryName: string;
  description: string | null;
  items: MenuItemData[];
}

interface TaskData {
  id: string;
  taskName: string;
  description: string | null;
  effectivePrice: string;
  customPrice?: string;
  defaultDuration: number | null;
}

export default function ServiceProviderDetailsPage() {
  const params = useParams();
  const providerId = params.id;
  const [, navigate] = useLocation();
  
  const [selectedMenuItems, setSelectedMenuItems] = useState<Set<string>>(new Set());
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [clientProvidedMaterials, setClientProvidedMaterials] = useState<Set<string>>(new Set());

  const { data: provider, isLoading: providerLoading } = useQuery<ServiceProvider>({
    queryKey: ['/api/service-providers', providerId],
    enabled: !!providerId,
  });

  const { data: menus, isLoading: menusLoading } = useQuery<MenuData[]>({
    queryKey: ['/api/public/provider', providerId, 'menus'],
    enabled: !!providerId,
  });

  const { data: tasks, isLoading: tasksLoading } = useQuery<TaskData[]>({
    queryKey: ['/api/public/provider', providerId, 'tasks'],
    enabled: !!providerId,
  });

  const { data: materials } = useQuery<Array<{
    id: string;
    name: string;
    category: string;
    unitCost: string;
    unit: string;
    isClientProvided: boolean;
  }>>({
    queryKey: ['/api/public/provider', providerId, 'materials'],
    enabled: !!providerId,
  });

  const { data: reviews } = useQuery<Array<{
    id: string;
    clientName: string;
    rating: number;
    comment: string;
    createdAt: string;
  }>>({
    queryKey: ['/api/service-providers', providerId, 'reviews'],
    enabled: !!providerId,
  });

  const { data: availability } = useQuery<Array<{
    id: string;
    date: string;
    isAvailable: boolean;
    startTime: string | null;
    endTime: string | null;
    maxBookings: number | null;
  }>>({
    queryKey: ['/api/provider/availability', providerId],
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
        menu.items?.forEach((item) => {
          if (selectedMenuItems.has(item.id)) {
            total += parseFloat(item.price || '0');
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
    const selectedItems: Array<{
      type: string;
      id: string;
      name: string;
      price: string | null;
    }> = [];
    
    if (menus) {
      menus.forEach(menu => {
        menu.items?.forEach((item) => {
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
      clientProvidedMaterials: Array.from(clientProvidedMaterials),
      selectedDate,
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
              <span className="font-semibold" data-testid="text-rating">{provider.rating ? Number(provider.rating).toFixed(1) : 'N/A'}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400" data-testid="text-review-count">
                ({provider.reviewCount} reviews)
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="flex items-center gap-2" data-testid="provider-location">
              <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span data-testid="text-location">{provider.location}</span>
            </div>
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
          
          <div className="mt-4 pt-4 border-t border-border">
            <Button
              onClick={() => navigate(`/messages?user=${provider.userId}`)}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              data-testid="button-message-provider"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Send Message
            </Button>
          </div>
        </CardContent>
      </Card>

      {provider.photoUrls && Array.isArray(provider.photoUrls) && provider.photoUrls.length > 0 && (
        <Card className="mb-6" data-testid="card-photo-gallery">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Photo Gallery
            </CardTitle>
            <CardDescription>View our work and business environment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {(provider.photoUrls as string[]).map((url: string, index: number) => (
                <div
                  key={index}
                  className="aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
                  data-testid={`gallery-image-${index}`}
                >
                  <img
                    src={url}
                    alt={`${provider.businessName} - Photo ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    data-testid={`img-gallery-${index}`}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {(provider.yearsExperience || (Array.isArray(provider.languages) && provider.languages.length > 0) || (Array.isArray(provider.certifications) && provider.certifications.length > 0) || (Array.isArray(provider.awards) && provider.awards.length > 0)) && (
        <Card className="mb-6" data-testid="card-provider-extended-info">
          <CardHeader>
            <CardTitle>About the Provider</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {provider.yearsExperience && (
                <div className="flex items-start gap-3" data-testid="provider-experience">
                  <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-1" />
                  <div>
                    <p className="font-semibold">Experience</p>
                    <p className="text-gray-600 dark:text-gray-300" data-testid="text-years-experience">
                      {provider.yearsExperience} years in the industry
                    </p>
                  </div>
                </div>
              )}
              
              {Array.isArray(provider.languages) && provider.languages.length > 0 && (
                <div className="flex items-start gap-3" data-testid="provider-languages">
                  <Languages className="h-5 w-5 text-green-600 dark:text-green-400 mt-1" />
                  <div>
                    <p className="font-semibold">Languages</p>
                    <p className="text-gray-600 dark:text-gray-300" data-testid="text-languages">
                      {(provider.languages as string[]).join(', ')}
                    </p>
                  </div>
                </div>
              )}
              
              {Array.isArray(provider.certifications) && provider.certifications.length > 0 && (
                <div className="flex items-start gap-3" data-testid="provider-certifications">
                  <Award className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-1" />
                  <div>
                    <p className="font-semibold">Certifications</p>
                    <div className="space-y-1" data-testid="list-certifications">
                      {(provider.certifications as any[]).map((cert: any, index: number) => (
                        <p key={index} className="text-gray-600 dark:text-gray-300">
                          • {typeof cert === 'string' ? cert : cert.name}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {Array.isArray(provider.awards) && provider.awards.length > 0 && (
                <div className="flex items-start gap-3" data-testid="provider-awards">
                  <Award className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-1" />
                  <div>
                    <p className="font-semibold">Awards & Recognition</p>
                    <div className="space-y-1" data-testid="list-awards">
                      {(provider.awards as any[]).map((award: any, index: number) => (
                        <p key={index} className="text-gray-600 dark:text-gray-300">
                          • {typeof award === 'string' ? award : award.name}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mb-6" data-testid="card-availability-calendar">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Availability Calendar
          </CardTitle>
          <CardDescription>
            View available dates for booking this provider
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <CalendarComponent
                mode="single"
                selected={selectedDate ? parseISO(selectedDate) : undefined}
                onSelect={(date) => setSelectedDate(date ? format(date, 'yyyy-MM-dd') : null)}
                modifiers={{
                  available: availability?.filter(a => a.isAvailable).map(a => parseISO(a.date)) || [],
                  unavailable: availability?.filter(a => !a.isAvailable).map(a => parseISO(a.date)) || [],
                }}
                modifiersStyles={{
                  available: {
                    backgroundColor: 'rgb(34, 197, 94)',
                    color: 'white',
                    fontWeight: 'bold',
                  },
                  unavailable: {
                    backgroundColor: 'rgb(239, 68, 68)',
                    color: 'white',
                    opacity: 0.6,
                  },
                }}
                className="rounded-md border"
                data-testid="availability-calendar"
              />
            </div>
            <div className="md:w-64 space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Legend</h3>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded" />
                    <span className="text-sm">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 opacity-60 rounded" />
                    <span className="text-sm">Unavailable</span>
                  </div>
                </div>
              </div>
              
              {selectedDate && availability && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Selected Date</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300" data-testid="text-selected-date">
                    {format(parseISO(selectedDate), 'MMMM d, yyyy')}
                  </p>
                  {(() => {
                    const dayAvailability = availability.find(a => a.date === selectedDate);
                    return dayAvailability ? (
                      <div className="mt-2">
                        <Badge variant={dayAvailability.isAvailable ? "default" : "destructive"} data-testid="badge-availability-status">
                          {dayAvailability.isAvailable ? 'Available' : 'Unavailable'}
                        </Badge>
                        {dayAvailability.isAvailable && dayAvailability.startTime && dayAvailability.endTime && (
                          <p className="text-sm mt-2 text-gray-600 dark:text-gray-300" data-testid="text-time-slots">
                            {dayAvailability.startTime} - {dayAvailability.endTime}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 mt-2">No information available</p>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {materials && materials.length > 0 && (
        <Card className="mb-6" data-testid="card-materials">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Materials & Ingredients
            </CardTitle>
            <CardDescription>
              Select which items you'll provide to reduce costs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {materials.map((material) => (
                <div
                  key={material.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                  data-testid={`material-${material.id}`}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={clientProvidedMaterials.has(material.id)}
                      onCheckedChange={(checked) => {
                        const newSet = new Set(clientProvidedMaterials);
                        if (checked) {
                          newSet.add(material.id);
                        } else {
                          newSet.delete(material.id);
                        }
                        setClientProvidedMaterials(newSet);
                      }}
                      data-testid={`checkbox-material-${material.id}`}
                    />
                    <div>
                      <p className="font-medium" data-testid={`text-material-name-${material.id}`}>
                        {material.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {material.category}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium" data-testid={`text-material-cost-${material.id}`}>
                      ${parseFloat(material.unitCost).toFixed(2)}/{material.unit}
                    </p>
                    {clientProvidedMaterials.has(material.id) && (
                      <Badge variant="secondary" className="text-xs mt-1">
                        You provide
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {clientProvidedMaterials.size > 0 && (
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                  You're providing {clientProvidedMaterials.size} item{clientProvidedMaterials.size !== 1 ? 's' : ''} - this will reduce your total cost!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {reviews && reviews.length > 0 && (
        <Card className="mb-6" data-testid="card-reviews">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Client Reviews
            </CardTitle>
            <CardDescription>
              See what others are saying about this provider
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reviews.slice(0, 5).map((review) => (
                <div
                  key={review.id}
                  className="border-b last:border-0 pb-4 last:pb-0"
                  data-testid={`review-${review.id}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium" data-testid={`text-review-client-${review.id}`}>
                        {review.clientName}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300 dark:text-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {format(new Date(review.createdAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300" data-testid={`text-review-comment-${review.id}`}>
                    {review.comment}
                  </p>
                </div>
              ))}
            </div>
            {reviews.length > 5 && (
              <Button variant="outline" className="w-full mt-4" data-testid="button-view-all-reviews">
                View all {reviews.length} reviews
              </Button>
            )}
          </CardContent>
        </Card>
      )}

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
                      {menu.items?.map((item) => (
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
                                {item.ingredients && Array.isArray(item.ingredients) && item.ingredients.length > 0 && (
                                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2" data-testid={`text-item-ingredients-${item.id}`}>
                                    Ingredients: {item.ingredients.join(', ')}
                                  </p>
                                )}
                                {item.dietaryTags && Array.isArray(item.dietaryTags) && item.dietaryTags.length > 0 && (
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
                                ${parseFloat(item.price || '0').toFixed(2)}
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
                          {task.defaultDuration && (
                            <div className="flex items-center gap-2 mt-1">
                              <Clock className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-500 dark:text-gray-500" data-testid={`text-task-duration-${task.id}`}>
                                ~{task.defaultDuration} min
                              </span>
                            </div>
                          )}
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
