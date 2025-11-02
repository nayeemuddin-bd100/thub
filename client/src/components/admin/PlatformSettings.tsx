import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Settings } from "lucide-react";

type PlatformSetting = {
  id: string;
  key: string;
  value: string;
};

export default function PlatformSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    commissionRate: "",
    platformFee: "",
    minBookingAmount: "",
  });

  const { data: platformSettings = [] } = useQuery<PlatformSetting[]>({
    queryKey: ["/api/admin/settings"],
    onSuccess: (data) => {
      const settingsMap = data.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {} as any);
      setSettings({
        commissionRate: settingsMap.commissionRate || "",
        platformFee: settingsMap.platformFee || "",
        minBookingAmount: settingsMap.minBookingAmount || "",
      });
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: typeof settings) => {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update settings");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      toast({ title: "Success", description: "Platform settings updated!" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettingsMutation.mutate(settings);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Platform Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Commission Rate (%)</Label>
            <Input
              type="number"
              step="0.01"
              value={settings.commissionRate}
              onChange={(e) => setSettings({ ...settings, commissionRate: e.target.value })}
              placeholder="15.00"
              data-testid="input-commission-rate"
            />
          </div>

          <div>
            <Label>Platform Fee ($)</Label>
            <Input
              type="number"
              step="0.01"
              value={settings.platformFee}
              onChange={(e) => setSettings({ ...settings, platformFee: e.target.value })}
              placeholder="5.00"
              data-testid="input-platform-fee"
            />
          </div>

          <div>
            <Label>Minimum Booking Amount ($)</Label>
            <Input
              type="number"
              step="0.01"
              value={settings.minBookingAmount}
              onChange={(e) => setSettings({ ...settings, minBookingAmount: e.target.value })}
              placeholder="50.00"
              data-testid="input-min-booking"
            />
          </div>

          <Button type="submit" disabled={updateSettingsMutation.isPending} data-testid="button-save-settings">
            {updateSettingsMutation.isPending ? "Saving..." : "Save Settings"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
