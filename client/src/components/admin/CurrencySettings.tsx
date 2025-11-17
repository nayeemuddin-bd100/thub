import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, RefreshCw } from "lucide-react";

interface CurrencySetting {
  code: string;
  name: string;
  symbol: string;
  isEnabled: boolean;
  displayOrder: number;
}

export default function CurrencySettings() {
  const { toast } = useToast();
  const [isInitializing, setIsInitializing] = useState(false);

  // Fetch currency settings
  const { data: settings = [], isLoading, refetch } = useQuery<CurrencySetting[]>({
    queryKey: ["/api/admin/currencies/settings"],
    retry: false,
  });

  // Initialize currency settings
  const initializeMutation = useMutation({
    mutationFn: async () => {
      setIsInitializing(true);
      const response = await apiRequest("POST", "/api/admin/currencies/settings/init", {});
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/currencies/settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/currencies/enabled"] });
      toast({
        title: "Success",
        description: "Currency settings initialized successfully",
      });
      refetch();
      setIsInitializing(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to initialize currency settings",
        variant: "destructive",
      });
      setIsInitializing(false);
    },
  });

  // Toggle currency enabled status
  const toggleMutation = useMutation({
    mutationFn: async ({ code, isEnabled }: { code: string; isEnabled: boolean }) => {
      const response = await apiRequest("PATCH", `/api/admin/currencies/settings/${code}`, { isEnabled });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/currencies/settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/currencies/enabled"] });
      toast({
        title: "Success",
        description: "Currency status updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update currency status",
        variant: "destructive",
      });
    },
  });

  const handleToggle = (code: string, currentStatus: boolean) => {
    toggleMutation.mutate({ code, isEnabled: !currentStatus });
  };

  const handleInitialize = () => {
    initializeMutation.mutate();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Currency Management</CardTitle>
          <CardDescription>Control which currencies are available across the platform</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>Currency Management</CardTitle>
          <CardDescription>
            Control which currencies are available for bookings, services, and payments
          </CardDescription>
        </div>
        <div className="flex gap-2">
          {settings.length === 0 && (
            <Button
              onClick={handleInitialize}
              disabled={isInitializing}
              variant="default"
            >
              {isInitializing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Initializing...
                </>
              ) : (
                "Initialize Currencies"
              )}
            </Button>
          )}
          <Button
            onClick={() => refetch()}
            variant="outline"
            size="icon"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {settings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              No currency settings found. Click "Initialize Currencies" to set up all supported currencies.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {settings.map((currency) => (
                <div
                  key={currency.code}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{currency.symbol}</span>
                        <div>
                          <Label className="font-semibold">{currency.code}</Label>
                          <p className="text-sm text-muted-foreground">{currency.name}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={currency.isEnabled}
                    onCheckedChange={() => handleToggle(currency.code, currency.isEnabled)}
                    disabled={toggleMutation.isPending}
                  />
                </div>
              ))}
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Enabled currencies will be available in the currency selector throughout the platform.
                Disabled currencies will be hidden from users but existing data using those currencies will remain intact.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
