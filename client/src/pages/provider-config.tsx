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
  X,
  Home,
  Upload,
  Image as ImageIcon,
  User,
  Briefcase,
  Check,
  AlertCircle
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

  const isChef = provider.category?.name?.toLowerCase().includes("chef") || 
                 provider.category?.name?.toLowerCase().includes("cook");
  const isMaid = provider.category?.name?.toLowerCase().includes("maid") || 
                 provider.category?.name?.toLowerCase().includes("clean");

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {t('provider_dashboard.settings')}
            </h1>
            <p className="text-muted-foreground">
              {t('dashboard.subtitle')}
            </p>
          </div>
          <Button variant="outline" onClick={() => window.location.href = '/'}>
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">
              <ClipboardList className="w-4 h-4 mr-2" />
              {t('dashboard.overview')}
            </TabsTrigger>
            <TabsTrigger value="assignments">
              <Briefcase className="w-4 h-4 mr-2" />
              Job Assignments
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

          <TabsContent value="assignments" className="space-y-6">
            <JobAssignmentsTab providerId={provider.id} />
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

      <ProfilePhotoSection provider={provider} />
      <PortfolioImagesSection provider={provider} />
      <VideoUploadSection provider={provider} />
    </Card>
  );
}

function ProfilePhotoSection({ provider }: { provider: ServiceProvider }) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(provider.profilePhotoUrl || "");

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 10MB",
        variant: "destructive",
      });
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/provider/upload-profile-photo', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      setPhotoUrl(data.photoUrl);
      
      toast({ 
        title: "Success", 
        description: "Profile photo uploaded successfully" 
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/provider/profile"] });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload profile photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = async () => {
    try {
      await apiRequest("PATCH", `/api/provider/profile`, { profilePhotoUrl: null });
      setPhotoUrl("");
      toast({ title: "Profile photo removed" });
      queryClient.invalidateQueries({ queryKey: ["/api/provider/profile"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove profile photo",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-6 mt-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <User className="w-5 h-5" />
        Profile Photo
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        Upload a professional profile photo (max 10MB)
      </p>

      {photoUrl ? (
        <div className="space-y-4">
          <img 
            src={photoUrl} 
            alt="Profile" 
            className="w-32 h-32 rounded-full object-cover border-4 border-primary"
          />
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => document.getElementById('profile-photo-input')?.click()}
              disabled={uploading}
            >
              <Upload className="w-4 h-4 mr-2" />
              Change Photo
            </Button>
            <Button 
              variant="destructive" 
              onClick={removePhoto}
              disabled={uploading}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remove
            </Button>
          </div>
          <Input
            id="profile-photo-input"
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            disabled={uploading}
            className="hidden"
          />
        </div>
      ) : (
        <div>
          <Input
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            disabled={uploading}
            className="max-w-md"
          />
          {uploading && <p className="text-sm text-muted-foreground mt-2">Uploading...</p>}
        </div>
      )}
    </Card>
  );
}

function PortfolioImagesSection({ provider }: { provider: ServiceProvider }) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<string[]>(
    Array.isArray(provider.photoUrls) ? provider.photoUrls : []
  );

  const handleImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (files.length > 10) {
      toast({
        title: "Too many files",
        description: "You can upload up to 10 images at once",
        variant: "destructive",
      });
      return;
    }

    for (const file of Array.from(files)) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 10MB`,
          variant: "destructive",
        });
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not an image file`,
          variant: "destructive",
        });
        return;
      }
    }

    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('images', file);
      });

      const response = await fetch('/api/provider/upload-portfolio', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      setImages(data.allImageUrls);
      
      if (data.rejectedFiles && data.rejectedFiles.length > 0) {
        toast({ 
          title: "Partial Upload", 
          description: `${data.imageUrls.length} image(s) uploaded. ${data.rejectedFiles.length} file(s) rejected (invalid format).`,
          variant: "default"
        });
      } else {
        toast({ 
          title: "Success", 
          description: `${data.imageUrls.length} image(s) uploaded successfully` 
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/provider/profile"] });
      
      // Reset file input
      e.target.value = '';
    } catch (error: any) {
      const errorMessage = error.message || "Failed to upload images. Please try again.";
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (imageUrl: string) => {
    try {
      const response = await fetch('/api/provider/portfolio-image', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      });

      if (!response.ok) throw new Error('Delete failed');

      const data = await response.json();
      setImages(data.photoUrls);
      toast({ title: "Image removed successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/provider/profile"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove image",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-6 mt-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <ImageIcon className="w-5 h-5" />
        Portfolio Images
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        Upload images showcasing your work (max 10MB each, up to 10 images at once)
      </p>

      <div className="space-y-4">
        <div>
          <Input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImagesUpload}
            disabled={uploading}
            className="max-w-md"
          />
          {uploading && <p className="text-sm text-muted-foreground mt-2">Uploading...</p>}
        </div>

        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
            {images.map((imageUrl, index) => (
              <div key={index} className="relative group">
                <img 
                  src={imageUrl} 
                  alt={`Portfolio ${index + 1}`} 
                  className="w-full h-48 object-cover rounded-lg border"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(imageUrl)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {images.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed rounded-lg">
            <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No portfolio images yet</p>
            <p className="text-sm text-muted-foreground">Upload images to showcase your work</p>
          </div>
        )}
      </div>
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
            <span className="text-muted-foreground">{t('dashboard.per_hour')}</span>
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
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [maxBookings, setMaxBookings] = useState(1);
  const [notes, setNotes] = useState("");
  const [editingSlot, setEditingSlot] = useState<any>(null);

  const { data: availabilitySlots = [], isLoading } = useQuery({
    queryKey: ["/api/provider/availability", provider.id],
    queryFn: async () => {
      const response = await fetch(`/api/provider/availability/${provider.id}`);
      if (!response.ok) throw new Error("Failed to fetch availability");
      return response.json();
    },
  });

  const createSlotMutation = useMutation({
    mutationFn: async (slotData: any) => {
      const response = await fetch("/api/provider/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(slotData),
      });
      if (!response.ok) throw new Error("Failed to create availability slot");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Availability slot added" });
      queryClient.invalidateQueries({ queryKey: ["/api/provider/availability", provider.id] });
      resetForm();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add availability slot", variant: "destructive" });
    },
  });

  const updateSlotMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`/api/provider/availability/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update availability slot");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Availability slot updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/provider/availability", provider.id] });
      resetForm();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update availability slot", variant: "destructive" });
    },
  });

  const deleteSlotMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/provider/availability/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete availability slot");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Availability slot deleted" });
      queryClient.invalidateQueries({ queryKey: ["/api/provider/availability", provider.id] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete availability slot", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setShowAddSlot(false);
    setEditingSlot(null);
    setStartTime("09:00");
    setEndTime("17:00");
    setMaxBookings(1);
    setNotes("");
  };

  const handleAddSlot = () => {
    if (!selectedDate) {
      toast({ title: "Error", description: "Please select a date", variant: "destructive" });
      return;
    }

    if (startTime >= endTime) {
      toast({ title: "Error", description: "End time must be after start time", variant: "destructive" });
      return;
    }

    // Format date in local timezone to avoid timezone shifts
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const localDateString = `${year}-${month}-${day}`;

    const slotData = {
      date: localDateString,
      startTime,
      endTime,
      maxBookings,
      notes: notes || undefined,
      isAvailable: true,
    };

    if (editingSlot) {
      updateSlotMutation.mutate({ id: editingSlot.id, data: slotData });
    } else {
      createSlotMutation.mutate(slotData);
    }
  };

  const handleEditSlot = (slot: any) => {
    setEditingSlot(slot);
    // Parse date in local timezone to avoid UTC shift
    const [year, month, day] = slot.date.split('-').map(Number);
    setSelectedDate(new Date(year, month - 1, day));
    setStartTime(slot.startTime);
    setEndTime(slot.endTime);
    setMaxBookings(slot.maxBookings || 1);
    setNotes(slot.notes || "");
    setShowAddSlot(true);
  };

  const selectedDateSlots = availabilitySlots.filter((slot: any) => {
    if (!selectedDate) return false;
    // Parse slot date in local timezone to avoid UTC shift
    const [year, month, day] = slot.date.split('-').map(Number);
    const slotDate = new Date(year, month - 1, day);
    return slotDate.toDateString() === selectedDate.toDateString();
  });

  const datesWithAvailability = availabilitySlots.map((slot: any) => new Date(slot.date));

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold">{t('provider_dashboard.calendar')}</h2>
          <p className="text-muted-foreground">
            {t('provider_dashboard.availability_settings')}
          </p>
        </div>
        <Button onClick={() => setShowAddSlot(!showAddSlot)}>
          {showAddSlot ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          {showAddSlot ? "Cancel" : "Add Availability"}
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Select Date</h3>
          <div className="border rounded-lg p-4">
            <input
              type="date"
              className="w-full p-2 border rounded"
              value={selectedDate ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}` : ''}
              onChange={(e) => {
                if (e.target.value) {
                  // Parse date in local timezone
                  const [year, month, day] = e.target.value.split('-').map(Number);
                  setSelectedDate(new Date(year, month - 1, day));
                }
              }}
            />
          </div>

          {selectedDate && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">
                Availability for {selectedDate.toLocaleDateString()}
              </h3>
              {selectedDateSlots.length === 0 ? (
                <p className="text-muted-foreground text-sm">No availability slots set for this date</p>
              ) : (
                <div className="space-y-2">
                  {selectedDateSlots.map((slot: any) => (
                    <div key={slot.id} className="border rounded-lg p-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{slot.startTime} - {slot.endTime}</p>
                        <p className="text-sm text-muted-foreground">
                          Max bookings: {slot.maxBookings || 1}
                          {slot.notes && ` • ${slot.notes}`}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditSlot(slot)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => deleteSlotMutation.mutate(slot.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {showAddSlot && (
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {editingSlot ? "Edit" : "Add"} Availability Slot
            </h3>
            <div className="space-y-4">
              <div>
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div>
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
              <div>
                <Label>Max Bookings</Label>
                <Input
                  type="number"
                  min="1"
                  value={maxBookings}
                  onChange={(e) => setMaxBookings(parseInt(e.target.value))}
                />
              </div>
              <div>
                <Label>Notes (Optional)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special notes about this time slot"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddSlot} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  {editingSlot ? "Update" : "Add"} Slot
                </Button>
                {editingSlot && (
                  <Button variant="outline" onClick={resetForm}>
                    Cancel Edit
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {availabilitySlots.length === 0 && !isLoading && (
        <div className="text-center py-12 mt-6 border-2 border-dashed rounded-lg">
          <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-2">No availability slots set</p>
          <p className="text-sm text-muted-foreground">
            Click "Add Availability" to start setting your available times
          </p>
        </div>
      )}
    </Card>
  );
}


function JobAssignmentsTab({ providerId }: { providerId: string }) {
  const { toast } = useToast();
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const { data: assignments = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/provider/job-assignments"],
  });

  const acceptMutation = useMutation({
    mutationFn: async (assignmentId: string) => {
      const response = await apiRequest("POST", `/api/provider/job-assignments/${assignmentId}/accept`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/provider/job-assignments"] });
      toast({
        title: "Success",
        description: "Job assignment accepted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to accept job assignment",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async () => {
      if (!selectedAssignment || !rejectionReason.trim()) {
        throw new Error("Rejection reason is required");
      }
      const response = await apiRequest("POST", `/api/provider/job-assignments/${selectedAssignment.id}/reject`, {
        reason: rejectionReason,
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/provider/job-assignments"] });
      toast({
        title: "Job Rejected",
        description: "Job assignment has been rejected",
      });
      setRejectDialogOpen(false);
      setSelectedAssignment(null);
      setRejectionReason("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reject job assignment",
        variant: "destructive",
      });
    },
  });

  const pendingAssignments = assignments.filter((a) => a.status === "pending");
  const acceptedAssignments = assignments.filter((a) => a.status === "accepted");
  const rejectedAssignments = assignments.filter((a) => a.status === "rejected");

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Job Assignments</h2>
        <p className="text-muted-foreground mb-6">
          Manage jobs assigned to you by the Country Manager. Accept or reject assignments as needed.
        </p>

        <Tabs defaultValue="pending">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="pending">
              Pending ({pendingAssignments.length})
            </TabsTrigger>
            <TabsTrigger value="accepted">
              Accepted ({acceptedAssignments.length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({rejectedAssignments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {isLoading ? (
              <p className="text-center text-muted-foreground">Loading assignments...</p>
            ) : pendingAssignments.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No pending job assignments</p>
              </div>
            ) : (
              pendingAssignments.map((assignment) => (
                <Card key={assignment.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">Pending Assignment</Badge>
                        <span className="text-sm text-muted-foreground">
                          Assigned on {new Date(assignment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="font-semibold mb-2">New Job Assignment</h3>
                      <p className="text-sm text-muted-foreground">
                        You have been assigned a new job. Please review and accept or reject this assignment.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={() => acceptMutation.mutate(assignment.id)}
                      disabled={acceptMutation.isPending}
                      className="flex-1"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Accept
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        setSelectedAssignment(assignment);
                        setRejectDialogOpen(true);
                      }}
                      disabled={rejectMutation.isPending}
                      className="flex-1"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="accepted" className="space-y-4">
            {acceptedAssignments.length === 0 ? (
              <div className="text-center py-12">
                <Check className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No accepted assignments</p>
              </div>
            ) : (
              acceptedAssignments.map((assignment) => (
                <Card key={assignment.id} className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-green-500">Accepted</Badge>
                    <span className="text-sm text-muted-foreground">
                      Accepted on {assignment.respondedAt ? new Date(assignment.respondedAt).toLocaleDateString() : "N/A"}
                    </span>
                  </div>
                  <h3 className="font-semibold">Job Assignment</h3>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            {rejectedAssignments.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No rejected assignments</p>
              </div>
            ) : (
              rejectedAssignments.map((assignment) => (
                <Card key={assignment.id} className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="destructive">Rejected</Badge>
                    <span className="text-sm text-muted-foreground">
                      Rejected on {assignment.respondedAt ? new Date(assignment.respondedAt).toLocaleDateString() : "N/A"}
                    </span>
                  </div>
                  <h3 className="font-semibold mb-2">Job Assignment</h3>
                  <p className="text-sm text-muted-foreground">
                    Reason: {assignment.rejectionReason}
                  </p>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </Card>

      {rejectDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6 m-4">
            <h3 className="text-lg font-semibold mb-4">Reject Job Assignment</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Please provide a reason for rejecting this job assignment.
            </p>
            <Textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="mb-4"
              rows={4}
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setRejectDialogOpen(false);
                  setSelectedAssignment(null);
                  setRejectionReason("");
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => rejectMutation.mutate()}
                disabled={!rejectionReason.trim() || rejectMutation.isPending}
                className="flex-1"
              >
                Reject
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

