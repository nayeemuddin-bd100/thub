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
import ServicePackages from "@/components/ServicePackages";
import { useTranslation } from "react-i18next";

export default function ProviderConfig() {
  const { t } = useTranslation();
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
            <h2 className="text-2xl font-semibold mb-4">{t('errors.not_found')}</h2>
            <p className="text-muted-foreground mb-6">
              {t('dashboard.service_provider_access_required')}
            </p>
            <Button onClick={() => window.location.href = "/dashboard"}>
              {t('header.dashboard')}
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
            {t('provider_dashboard.settings')}
          </h1>
          <p className="text-muted-foreground">
            {t('dashboard.subtitle')}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">
              <ClipboardList className="w-4 h-4 mr-2" />
              {t('dashboard.overview')}
            </TabsTrigger>
            {isChef && (
              <TabsTrigger value="menus">
                <ChefHat className="w-4 h-4 mr-2" />
                {t('service_provider.menu_items')}
              </TabsTrigger>
            )}
            {isMaid && (
              <TabsTrigger value="tasks">
                <ClipboardList className="w-4 h-4 mr-2" />
                {t('service_provider.tasks')}
              </TabsTrigger>
            )}
            <TabsTrigger value="pricing">
              <DollarSign className="w-4 h-4 mr-2" />
              {t('provider_dashboard.pricing_settings')}
            </TabsTrigger>
            <TabsTrigger value="packages">
              <Plus className="w-4 h-4 mr-2" />
              {t('service_provider.custom_packages')}
            </TabsTrigger>
            <TabsTrigger value="availability">
              <Calendar className="w-4 h-4 mr-2" />
              {t('provider_dashboard.availability_settings')}
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

          <TabsContent value="packages" className="space-y-6">
            <ServicePackages providerId={provider.id} />
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
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    businessName: provider.businessName,
    description: provider.description || "",
    location: provider.location || "",
    whatsappNumber: provider.whatsappNumber || "",
    yearsExperience: provider.yearsExperience || 0,
    languages: (provider.languages as string[]) || [],
    certifications: (provider.certifications as string[]) || [],
    awards: (provider.awards as string[]) || [],
  });
  
  const [newLanguage, setNewLanguage] = useState("");
  const [newCertification, setNewCertification] = useState("");
  const [newAward, setNewAward] = useState("");

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest("PATCH", `/api/provider/profile`, data);
      return await response.json();
    },
    onSuccess: () => {
      toast({ title: t("common.success"), description: t("dashboard.user_role_updated") });
      queryClient.invalidateQueries({ queryKey: ["/api/provider/profile"] });
      setIsEditing(false);
    },
    onError: () => {
      toast({ title: t("common.error"), description: t("errors.generic_error"), variant: "destructive" });
    },
  });

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">{t('dashboard.profile')}</h2>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>
            <Edit className="w-4 h-4 mr-2" />
            {t('common.edit')}
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              <X className="w-4 h-4 mr-2" />
              {t('common.cancel')}
            </Button>
            <Button onClick={() => updateMutation.mutate(formData)}>
              <Save className="w-4 h-4 mr-2" />
              {t('common.save')}
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="businessName">{t('dashboard.business_name_required')}</Label>
          <Input
            id="businessName"
            value={formData.businessName}
            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
            disabled={!isEditing}
          />
        </div>

        <div>
          <Label htmlFor="category">{t('dashboard.service_category_required')}</Label>
          <Input
            id="category"
            value={provider.category.name}
            disabled
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="description">{t('dashboard.description_required')}</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            disabled={!isEditing}
            rows={4}
          />
        </div>

        <div>
          <Label htmlFor="location">{t('properties.location')}</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            disabled={!isEditing}
            placeholder={t('dashboard.location_placeholder')}
          />
        </div>

        <div>
          <Label htmlFor="whatsapp">{t('dashboard.whatsapp_number')}</Label>
          <Input
            id="whatsapp"
            value={formData.whatsappNumber}
            onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
            disabled={!isEditing}
            placeholder="+1234567890"
          />
        </div>

        <div>
          <Label htmlFor="yearsExperience">Years of Experience</Label>
          <Input
            id="yearsExperience"
            type="number"
            min="0"
            value={formData.yearsExperience}
            onChange={(e) => {
              const value = e.target.value;
              const parsed = parseInt(value);
              setFormData({ 
                ...formData, 
                yearsExperience: value === '' ? (provider.yearsExperience || 0) : (isNaN(parsed) ? 0 : parsed)
              });
            }}
            disabled={!isEditing}
            placeholder="0"
          />
        </div>

        {/* Languages Section */}
        <div className="md:col-span-2">
          <Label>Languages Spoken</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.languages.map((lang, index) => (
              <Badge key={index} variant="secondary" className="pr-1">
                {lang}
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => setFormData({
                      ...formData,
                      languages: formData.languages.filter((_, i) => i !== index)
                    })}
                    className="ml-2 hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </Badge>
            ))}
          </div>
          {isEditing && (
            <div className="flex gap-2">
              <Input
                value={newLanguage}
                onChange={(e) => setNewLanguage(e.target.value)}
                placeholder="e.g., English, Spanish"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && newLanguage.trim()) {
                    e.preventDefault();
                    setFormData({ ...formData, languages: [...formData.languages, newLanguage.trim()] });
                    setNewLanguage("");
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (newLanguage.trim()) {
                    setFormData({ ...formData, languages: [...formData.languages, newLanguage.trim()] });
                    setNewLanguage("");
                  }
                }}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Certifications Section */}
        <div className="md:col-span-2">
          <Label>Certifications</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.certifications.map((cert, index) => (
              <Badge key={index} variant="secondary" className="pr-1">
                {cert}
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => setFormData({
                      ...formData,
                      certifications: formData.certifications.filter((_, i) => i !== index)
                    })}
                    className="ml-2 hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </Badge>
            ))}
          </div>
          {isEditing && (
            <div className="flex gap-2">
              <Input
                value={newCertification}
                onChange={(e) => setNewCertification(e.target.value)}
                placeholder="e.g., Certified Professional Chef"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && newCertification.trim()) {
                    e.preventDefault();
                    setFormData({ ...formData, certifications: [...formData.certifications, newCertification.trim()] });
                    setNewCertification("");
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (newCertification.trim()) {
                    setFormData({ ...formData, certifications: [...formData.certifications, newCertification.trim()] });
                    setNewCertification("");
                  }
                }}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Awards Section */}
        <div className="md:col-span-2">
          <Label>Awards & Recognitions</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.awards.map((award, index) => (
              <Badge key={index} variant="secondary" className="pr-1">
                {award}
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => setFormData({
                      ...formData,
                      awards: formData.awards.filter((_, i) => i !== index)
                    })}
                    className="ml-2 hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </Badge>
            ))}
          </div>
          {isEditing && (
            <div className="flex gap-2">
              <Input
                value={newAward}
                onChange={(e) => setNewAward(e.target.value)}
                placeholder="e.g., Best Chef 2024"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && newAward.trim()) {
                    e.preventDefault();
                    setFormData({ ...formData, awards: [...formData.awards, newAward.trim()] });
                    setNewAward("");
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (newAward.trim()) {
                    setFormData({ ...formData, awards: [...formData.awards, newAward.trim()] });
                    setNewAward("");
                  }
                }}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="md:col-span-2 pt-4 border-t">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">{t('properties.rating')}</p>
              <p className="text-2xl font-bold">{parseFloat(provider.rating || "0").toFixed(1)} ⭐</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('properties.reviews')}</p>
              <p className="text-2xl font-bold">{provider.reviewCount || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('orders.order_status')}</p>
              <Badge variant={provider.approvalStatus === "approved" ? "default" : "secondary"}>
                {provider.approvalStatus}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('services.verified')}</p>
              <Badge variant={provider.isVerified ? "default" : "secondary"}>
                {provider.isVerified ? t('common.yes') : t('common.no')}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <VideoUploadSection provider={provider} />
    </Card>
  );
}

function VideoUploadSection({ provider }: { provider: ServiceProvider }) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [videoUrl, setVideoUrl] = useState(provider.videoUrl || "");

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Video must be less than 50MB",
        variant: "destructive",
      });
      return;
    }

    if (!file.type.startsWith('video/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a video file",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('video', file);

      const response = await fetch('/api/provider/upload-video', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      setVideoUrl(data.videoUrl);
      
      await apiRequest("PATCH", `/api/provider/profile`, { videoUrl: data.videoUrl });
      
      toast({ 
        title: "Success", 
        description: "Video uploaded successfully" 
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/provider/profile"] });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeVideo = async () => {
    try {
      await apiRequest("PATCH", `/api/provider/profile`, { videoUrl: null });
      setVideoUrl("");
      toast({ title: "Video removed" });
      queryClient.invalidateQueries({ queryKey: ["/api/provider/profile"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove video",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-6 mt-6">
      <h3 className="text-lg font-semibold mb-4">Introduction Video</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Upload a video to introduce yourself and showcase your services (max 50MB)
      </p>

      {videoUrl ? (
        <div className="space-y-4">
          <video 
            src={videoUrl} 
            controls 
            className="w-full max-w-2xl rounded-lg border"
          />
          <Button 
            variant="destructive" 
            onClick={removeVideo}
            disabled={uploading}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Remove Video
          </Button>
        </div>
      ) : (
        <div>
          <Input
            type="file"
            accept="video/*"
            onChange={handleVideoUpload}
            disabled={uploading}
            className="max-w-md"
          />
          {uploading && <p className="text-sm text-muted-foreground mt-2">Uploading...</p>}
        </div>
      )}
    </Card>
  );
}

function MenuManagement({ providerId }: { providerId: string }) {
  const { t } = useTranslation();
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
      toast({ title: t("common.success"), description: t("common.create") });
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
            <h2 className="text-2xl font-semibold">{t('service_provider.menu_items')}</h2>
            <p className="text-muted-foreground">{t('services.services_offered')}</p>
          </div>
          <Button onClick={() => setShowAddMenu(!showAddMenu)}>
            <Plus className="w-4 h-4 mr-2" />
            {t('common.create')}
          </Button>
        </div>

        {showAddMenu && (
          <Card className="p-4 mb-6 bg-muted">
            <div className="space-y-4">
              <div>
                <Label htmlFor="menuName">{t('dashboard.service_category_required')}</Label>
                <Input
                  id="menuName"
                  value={newMenuName}
                  onChange={(e) => setNewMenuName(e.target.value)}
                  placeholder={t('dashboard.service_category_required')}
                />
              </div>
              <div>
                <Label htmlFor="menuDesc">{t('dashboard.description_required')}</Label>
                <Textarea
                  id="menuDesc"
                  value={newMenuDesc}
                  onChange={(e) => setNewMenuDesc(e.target.value)}
                  placeholder={t('dashboard.description_placeholder')}
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
                  {t('common.create')}
                </Button>
                <Button variant="outline" onClick={() => setShowAddMenu(false)}>
                  {t('common.cancel')}
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
              {t('common.no_results')}
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
  const { t } = useTranslation();
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
            {menu.items?.length || 0} {t('service_provider.menu_items')}
          </p>
        </div>
        <Button variant="outline" onClick={() => setExpanded(!expanded)}>
          {expanded ? t('property_detail.show_less') : t('property_detail.show_more')}
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
              {t('common.no_results')}
            </p>
          )}
          <Button className="w-full mt-2">
            <Plus className="w-4 h-4 mr-2" />
            {t('common.create')}
          </Button>
        </div>
      )}
    </Card>
  );
}

function TaskManagement({ providerId, categoryId }: { providerId: string; categoryId: string }) {
  const { t } = useTranslation();
  const { data: tasks, isLoading } = useQuery<ServiceTask[]>({
    queryKey: ["/api/service-tasks", categoryId],
  });

  const { data: configs } = useQuery<ProviderTaskConfig[]>({
    queryKey: ["/api/provider/tasks", providerId],
  });

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold mb-4">{t('service_provider.tasks')}</h2>
      <p className="text-muted-foreground mb-6">
        {t('provider_dashboard.pricing_settings')}
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
          <p className="text-muted-foreground">{t('common.no_results')}</p>
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
  const { t } = useTranslation();
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
      toast({ title: t("common.success"), description: t("provider_dashboard.update_status") });
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
          placeholder={t('services.price_range')}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          onBlur={() => {
            if (price) {
              updateMutation.mutate({ isEnabled: enabled, customPrice: price });
            }
          }}
          className="w-24"
        />
        <span className="text-sm text-muted-foreground">{t('payment.payment_amount')}</span>
      </div>
    </div>
  );
}

function PricingManagement({ provider }: { provider: ServiceProvider }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [hourlyRate, setHourlyRate] = useState(provider.hourlyRate || "");
  const [fixedRate, setFixedRate] = useState(provider.fixedRate || "");

  const updateMutation = useMutation({
    mutationFn: async (data: { hourlyRate?: string; fixedRate?: string }) => {
      const response = await apiRequest("PATCH", "/api/provider/profile", data);
      return await response.json();
    },
    onSuccess: () => {
      toast({ title: t("common.success"), description: t("provider_dashboard.update_status") });
      queryClient.invalidateQueries({ queryKey: ["/api/provider/profile"] });
    },
  });

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold mb-4">{t('provider_dashboard.pricing_settings')}</h2>
      <p className="text-muted-foreground mb-6">
        {t('services.price_range')}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="hourlyRate">{t('dashboard.hourly_rate_usd')}</Label>
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
            <span className="text-muted-foreground">{t('book_service.hours')}</span>
          </div>
        </div>

        <div>
          <Label htmlFor="fixedRate">{t('dashboard.fixed_rate_usd')}</Label>
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
            <span className="text-muted-foreground">{t('services.services_offered')}</span>
          </div>
        </div>

        <div className="md:col-span-2">
          <Button 
            onClick={() => updateMutation.mutate({ hourlyRate, fixedRate })}
            disabled={!hourlyRate && !fixedRate}
          >
            {t('common.save')}
          </Button>
        </div>
      </div>
    </Card>
  );
}

function AvailabilityManagement({ provider }: { provider: ServiceProvider }) {
  const { t } = useTranslation();
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold mb-4">{t('provider_dashboard.calendar')}</h2>
      <p className="text-muted-foreground mb-6">
        {t('provider_dashboard.availability_settings')}
      </p>

      <div className="text-center py-12">
        <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground mb-4">
          {t('common.loading')}
        </p>
        <p className="text-sm text-muted-foreground">
          {t('provider_dashboard.availability_settings')}
        </p>
      </div>
    </Card>
  );
}
