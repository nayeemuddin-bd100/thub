import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Settings } from "lucide-react";

const settingsSchema = z.object({
  commissionRate: z.string()
    .refine((val) => val === "" || !isNaN(parseFloat(val)), "Must be a valid number")
    .refine((val) => val === "" || (parseFloat(val) >= 0 && parseFloat(val) <= 100), "Must be between 0 and 100"),
  platformFee: z.string()
    .refine((val) => val === "" || !isNaN(parseFloat(val)), "Must be a valid number")
    .refine((val) => val === "" || parseFloat(val) >= 0, "Must be non-negative"),
  minBookingAmount: z.string()
    .refine((val) => val === "" || !isNaN(parseFloat(val)), "Must be a valid number")
    .refine((val) => val === "" || parseFloat(val) >= 0, "Must be non-negative"),
});

type PlatformSetting = {
  id: string;
  settingKey: string;
  settingValue: string;
  settingType?: string;
  category?: string;
};

export default function PlatformSettings() {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      commissionRate: "",
      platformFee: "",
      minBookingAmount: "",
    },
  });

  const { data: platformSettings = [], isLoading, error } = useQuery<PlatformSetting[]>({
    queryKey: ["/api/admin/settings"],
  });

  useEffect(() => {
    if (platformSettings.length > 0) {
      const settingsMap = platformSettings.reduce((acc, setting) => {
        acc[setting.settingKey] = setting.settingValue;
        return acc;
      }, {} as any);
      form.reset({
        commissionRate: settingsMap.commissionRate || settingsMap.service_commission_rate || "",
        platformFee: settingsMap.platformFee || settingsMap.platform_fee || "",
        minBookingAmount: settingsMap.minBookingAmount || settingsMap.min_booking_amount || "",
      });
    }
  }, [platformSettings, form]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: z.infer<typeof settingsSchema>) => {
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
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: z.infer<typeof settingsSchema>) => {
    updateSettingsMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4" data-testid="loading-settings">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted rounded animate-pulse" data-testid={`skeleton-setting-${i}`} />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-destructive" data-testid="error-settings">
            Failed to load platform settings. Please try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2" data-testid="heading-platform-settings">
          <Settings className="w-5 h-5" />
          Platform Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="commissionRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Commission Rate (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="15.00"
                      {...field}
                      data-testid="input-commission-rate"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="platformFee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Platform Fee ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="5.00"
                      {...field}
                      data-testid="input-platform-fee"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="minBookingAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Booking Amount ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="50.00"
                      {...field}
                      data-testid="input-min-booking"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={updateSettingsMutation.isPending} data-testid="button-save-settings">
              {updateSettingsMutation.isPending ? "Saving..." : "Save Settings"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
