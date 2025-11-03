import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus, Percent, DollarSign, Tag, Calendar, Users, TrendingUp, CheckCircle, XCircle } from "lucide-react";

const promoCodeFormSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters").max(50).toUpperCase(),
  description: z.string().optional(),
  discountType: z.enum(["percentage", "fixed_amount"]),
  discountValue: z.string().min(1, "Discount value is required"),
  minimumPurchase: z.string().optional(),
  maxUses: z.string().optional(),
  validFrom: z.string().min(1, "Start date is required"),
  validUntil: z.string().min(1, "End date is required"),
  applicableTo: z.enum(["all", "properties", "services"]),
  isActive: z.boolean().optional(),
}).refine((data) => {
  const from = new Date(data.validFrom);
  const until = new Date(data.validUntil);
  return until > from;
}, {
  message: "End date must be after start date",
  path: ["validUntil"],
});

type PromoCode = {
  id: string;
  code: string;
  description: string | null;
  discountType: string;
  discountValue: string;
  minimumPurchase: string;
  maxUses: number | null;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  applicableTo: string;
  isActive: boolean;
  createdAt: string;
};

export default function PromotionalCodes() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof promoCodeFormSchema>>({
    resolver: zodResolver(promoCodeFormSchema),
    defaultValues: {
      code: "",
      description: "",
      discountType: "percentage",
      discountValue: "",
      minimumPurchase: "0",
      maxUses: "",
      validFrom: "",
      validUntil: "",
      applicableTo: "all",
      isActive: true,
    },
  });

  const { data: promoCodes = [], isLoading } = useQuery<PromoCode[]>({
    queryKey: ["/api/admin/promo-codes"],
  });

  const createPromoCodeMutation = useMutation({
    mutationFn: async (data: z.infer<typeof promoCodeFormSchema>) => {
      const response = await apiRequest("POST", "/api/admin/promo-codes", {
        code: data.code.toUpperCase(),
        description: data.description || null,
        discountType: data.discountType,
        discountValue: data.discountValue,
        minimumPurchase: data.minimumPurchase || "0",
        maxUses: data.maxUses ? parseInt(data.maxUses) : null,
        validFrom: new Date(data.validFrom).toISOString(),
        validUntil: new Date(data.validUntil).toISOString(),
        applicableTo: data.applicableTo,
        isActive: data.isActive ?? true,
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/promo-codes"] });
      toast({
        title: "Success",
        description: "Promotional code created successfully",
      });
      setDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create promotional code",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof promoCodeFormSchema>) => {
    createPromoCodeMutation.mutate(data);
  };

  const getDiscountDisplay = (code: PromoCode) => {
    if (code.discountType === "percentage") {
      return `${code.discountValue}% OFF`;
    }
    return `$${parseFloat(code.discountValue).toFixed(2)} OFF`;
  };

  const getUsageDisplay = (code: PromoCode) => {
    if (!code.maxUses) return `${code.usedCount} uses`;
    const percentage = (code.usedCount / code.maxUses) * 100;
    return `${code.usedCount} / ${code.maxUses} (${percentage.toFixed(0)}%)`;
  };

  const isExpired = (code: PromoCode) => {
    return new Date(code.validUntil) < new Date();
  };

  const isNotStarted = (code: PromoCode) => {
    return new Date(code.validFrom) > new Date();
  };

  const getStatusBadge = (code: PromoCode) => {
    if (!code.isActive) {
      return <Badge variant="destructive" data-testid={`badge-status-${code.id}`}>Inactive</Badge>;
    }
    if (isExpired(code)) {
      return <Badge variant="secondary" data-testid={`badge-status-${code.id}`}>Expired</Badge>;
    }
    if (isNotStarted(code)) {
      return <Badge variant="outline" data-testid={`badge-status-${code.id}`}>Scheduled</Badge>;
    }
    if (code.maxUses && code.usedCount >= code.maxUses) {
      return <Badge variant="secondary" data-testid={`badge-status-${code.id}`}>Limit Reached</Badge>;
    }
    return <Badge variant="default" data-testid={`badge-status-${code.id}`}>Active</Badge>;
  };

  const activeCodes = promoCodes.filter(code => 
    code.isActive && !isExpired(code) && (!code.maxUses || code.usedCount < code.maxUses)
  );

  const totalUsage = promoCodes.reduce((sum, code) => sum + code.usedCount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold" data-testid="heading-promo-codes">Promotional Codes</h3>
          <p className="text-sm text-muted-foreground">Create and manage discount codes for your platform</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-promo">
              <Plus className="h-4 w-4 mr-2" />
              Create Promo Code
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Promotional Code</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Promo Code *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="SUMMER2024" 
                          {...field}
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                          data-testid="input-code"
                        />
                      </FormControl>
                      <FormDescription>Unique code that customers will enter (auto-converted to uppercase)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Summer sale - 20% off all properties"
                          {...field}
                          data-testid="input-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="discountType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount Type *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-discount-type">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="percentage">Percentage (%)</SelectItem>
                            <SelectItem value="fixed_amount">Fixed Amount ($)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="discountValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount Value *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            placeholder="20"
                            {...field}
                            data-testid="input-discount-value"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="minimumPurchase"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Purchase ($)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            placeholder="0"
                            {...field}
                            data-testid="input-minimum-purchase"
                          />
                        </FormControl>
                        <FormDescription>0 means no minimum</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maxUses"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Uses</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            placeholder="Unlimited"
                            {...field}
                            data-testid="input-max-uses"
                          />
                        </FormControl>
                        <FormDescription>Leave empty for unlimited</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="validFrom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valid From *</FormLabel>
                        <FormControl>
                          <Input 
                            type="datetime-local"
                            {...field}
                            data-testid="input-valid-from"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="validUntil"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valid Until *</FormLabel>
                        <FormControl>
                          <Input 
                            type="datetime-local"
                            {...field}
                            data-testid="input-valid-until"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="applicableTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Applicable To *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-applicable-to">
                            <SelectValue placeholder="Select where code can be used" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="all">All (Properties & Services)</SelectItem>
                          <SelectItem value="properties">Properties Only</SelectItem>
                          <SelectItem value="services">Services Only</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setDialogOpen(false)}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createPromoCodeMutation.isPending}
                    data-testid="button-submit-promo"
                  >
                    {createPromoCodeMutation.isPending ? "Creating..." : "Create Code"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Codes</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-codes">{promoCodes.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeCodes.length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Uses</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-uses">{totalUsage}</div>
            <p className="text-xs text-muted-foreground">
              All time redemptions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Codes</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-active-codes">{activeCodes.length}</div>
            <p className="text-xs text-muted-foreground">
              Available for use
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Promotional Codes</CardTitle>
          <CardDescription>Manage discount codes and track usage</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading promotional codes...</div>
          ) : promoCodes.length === 0 ? (
            <div className="text-center py-12">
              <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Promotional Codes</h3>
              <p className="text-muted-foreground mb-4">Create your first promo code to offer discounts to customers</p>
              <Button onClick={() => setDialogOpen(true)} data-testid="button-create-first-promo">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Code
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Applicable To</TableHead>
                    <TableHead>Valid Period</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promoCodes.map((code) => (
                    <TableRow key={code.id} data-testid={`row-promo-${code.id}`}>
                      <TableCell>
                        <div>
                          <div className="font-bold font-mono" data-testid={`text-code-${code.id}`}>{code.code}</div>
                          {code.description && (
                            <div className="text-xs text-muted-foreground mt-1">{code.description}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {code.discountType === "percentage" ? (
                            <Percent className="h-3 w-3" />
                          ) : (
                            <DollarSign className="h-3 w-3" />
                          )}
                          <span className="font-semibold" data-testid={`text-discount-${code.id}`}>
                            {getDiscountDisplay(code)}
                          </span>
                        </div>
                        {parseFloat(code.minimumPurchase) > 0 && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Min: ${parseFloat(code.minimumPurchase).toFixed(2)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" data-testid={`badge-applicable-${code.id}`}>
                          {code.applicableTo}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(code.validFrom).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(code.validUntil).toLocaleDateString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span className="text-sm" data-testid={`text-usage-${code.id}`}>
                            {getUsageDisplay(code)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(code)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
