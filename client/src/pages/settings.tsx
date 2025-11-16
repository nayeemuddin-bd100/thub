import ActivityLogs from "@/components/admin/ActivityLogs";
import CancellationManagement from "@/components/admin/CancellationManagement";
import CMSSettings from "@/components/admin/CMSSettings";
import CreateStaffAccount from "@/components/admin/CreateStaffAccount";
import EmailTemplates from "@/components/admin/EmailTemplates";
import PlatformSettings from "@/components/admin/PlatformSettings";
import PromotionalCodes from "@/components/admin/PromotionalCodes";
import PropertyServiceAssociation from "@/components/admin/PropertyServiceAssociation";
import TerritoryManagement from "@/components/admin/TerritoryManagement";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { ChevronLeft, ChevronRight, Settings as SettingsIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";

export default function Settings() {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [, setLocation] = useLocation();

    // Only admins can access settings
    if (!user || user.role !== "admin") {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center space-y-4">
                    <h1 className="text-2xl font-bold">Unauthorized</h1>
                    <p className="text-muted-foreground">
                        You don't have permission to access this page.
                    </p>
                    <Button onClick={() => setLocation("/")}>Go Home</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                        <SettingsIcon className="h-8 w-8" />
                        <h1 className="text-3xl font-bold">Settings</h1>
                    </div>
                    <p className="text-muted-foreground">
                        Manage platform settings, content, and configurations
                    </p>
                </div>

                <Tabs defaultValue="platform" className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            className="shrink-0 h-10 w-10"
                            onClick={() => {
                                const container = document.getElementById('settings-tabs-container');
                                if (container) container.scrollBy({ left: -200, behavior: 'smooth' });
                            }}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div id="settings-tabs-container" className="overflow-x-auto scrollbar-hide flex-1">
                            <TabsList className="inline-flex w-max">
                                <TabsTrigger
                                    value="cms"
                                    data-testid="tab-cms-settings"
                                    className="whitespace-nowrap"
                                >
                                    CMS Content
                                </TabsTrigger>
                                <TabsTrigger
                                    value="platform"
                                    data-testid="tab-platform-settings"
                                    className="whitespace-nowrap"
                                >
                                    {t("admin.platform_settings")}
                                </TabsTrigger>
                                <TabsTrigger
                                    value="associations"
                                    data-testid="tab-associations"
                                    className="whitespace-nowrap"
                                >
                                    {t("admin.property_service_assoc")}
                                </TabsTrigger>
                                <TabsTrigger
                                    value="promocodes"
                                    data-testid="tab-promocodes"
                                    className="whitespace-nowrap"
                                >
                                    {t("admin.promo_codes")}
                                </TabsTrigger>
                                <TabsTrigger
                                    value="cancellations"
                                    data-testid="tab-cancellations"
                                    className="whitespace-nowrap"
                                >
                                    {t("admin.cancellations")}
                                </TabsTrigger>
                                <TabsTrigger
                                    value="territories"
                                    data-testid="tab-territories"
                                    className="whitespace-nowrap"
                                >
                                    {t("admin.territories")}
                                </TabsTrigger>
                                <TabsTrigger
                                    value="emails"
                                    data-testid="tab-emails"
                                    className="whitespace-nowrap"
                                >
                                    {t("admin.email_templates")}
                                </TabsTrigger>
                                <TabsTrigger
                                    value="logs"
                                    data-testid="tab-logs"
                                    className="whitespace-nowrap"
                                >
                                    {t("admin.activity_logs")}
                                </TabsTrigger>
                                <TabsTrigger
                                    value="staff"
                                    data-testid="tab-staff"
                                    className="whitespace-nowrap"
                                >
                                    {t("admin_labels.internal_staff")}
                                </TabsTrigger>
                            </TabsList>
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            className="shrink-0 h-10 w-10"
                            onClick={() => {
                                const container = document.getElementById('settings-tabs-container');
                                if (container) container.scrollBy({ left: 200, behavior: 'smooth' });
                            }}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    <TabsContent value="cms" className="space-y-4">
                        <CMSSettings />
                    </TabsContent>

                    <TabsContent value="platform" className="space-y-4">
                        <PlatformSettings />
                    </TabsContent>

                    <TabsContent value="associations" className="space-y-4">
                        <PropertyServiceAssociation />
                    </TabsContent>

                    <TabsContent value="promocodes" className="space-y-4">
                        <PromotionalCodes />
                    </TabsContent>

                    <TabsContent value="cancellations" className="space-y-4">
                        <CancellationManagement />
                    </TabsContent>

                    <TabsContent value="territories" className="space-y-4">
                        <TerritoryManagement />
                    </TabsContent>

                    <TabsContent value="emails" className="space-y-4">
                        <EmailTemplates />
                    </TabsContent>

                    <TabsContent value="logs" className="space-y-4">
                        <ActivityLogs />
                    </TabsContent>

                    <TabsContent value="staff" className="space-y-4">
                        <CreateStaffAccount />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
