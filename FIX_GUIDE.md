# Feature Fix Guide - TravelHub

## Overview
This guide provides the exact pattern to fix all remaining features to meet production standards.

## ✅ Fixed Example: Service Packages Component
Location: `client/src/components/ServicePackages.tsx`

This component demonstrates the COMPLETE pattern required for all features.

---

## 🔧 Required Fixes for All Features

### **Pattern to Follow:**

#### 1. **Add react-hook-form + zod Validation**

```typescript
// ✅ CORRECT - Add at top of file
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Define schema
const formSchema = z.object({
  field1: z.string().min(3, "Field must be at least 3 characters"),
  field2: z.string().min(1, "Field is required"),
  // Add validation for each field
});

// In component
const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
  defaultValues: {
    field1: "",
    field2: "",
  },
});

// ❌ WRONG - Don't use useState for form data
const [formData, setFormData] = useState({ field1: "", field2: "" });
```

#### 2. **Use Form Component for All Forms**

```typescript
// ✅ CORRECT
<Form {...form}>
  <form onSubmit={form.handleSubmit(handleSubmit)}>
    <FormField
      control={form.control}
      name="fieldName"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Label *</FormLabel>
          <FormControl>
            <Input {...field} data-testid="input-field-name" />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </form>
</Form>

// ❌ WRONG - Don't use controlled inputs with useState
<Input
  value={formData.fieldName}
  onChange={(e) => setFormData({ ...formData, fieldName: e.target.value })}
/>
```

#### 3. **Add Complete data-testid Coverage**

```typescript
// ✅ CORRECT - Add to ALL interactive and display elements
<Button data-testid="button-submit">Submit</Button>
<Input data-testid="input-email" />
<div data-testid="text-total-amount">${amount}</div>
<Card data-testid={`card-item-${item.id}`}>
<div data-testid="loading-state">Loading...</div>
<p data-testid="error-message">Error occurred</p>

// For dynamic items, append ID
<div data-testid={`card-package-${package.id}`}>
```

#### 4. **Add Loading and Error States**

```typescript
// ✅ CORRECT
const { data, isLoading, error } = useQuery({
  queryKey: ["/api/endpoint"],
});

return (
  <>
    {isLoading ? (
      <div data-testid="loading-state">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-muted animate-pulse" data-testid={`skeleton-${i}`} />
        ))}
      </div>
    ) : error ? (
      <div data-testid="error-state">
        <p className="text-destructive">Failed to load data. Please try again.</p>
      </div>
    ) : data.length === 0 ? (
      <div data-testid="empty-state">No items found</div>
    ) : (
      // Render data
    )}
  </>
);

// ❌ WRONG - Missing loading/error states
{data.map(item => <Card>{item.name}</Card>)}
```

---

## 📋 Features That Need Fixes

### **1. Provider Earnings (`client/src/pages/provider-earnings.tsx`)**

**Required Changes:**
- [ ] Add zod schema for payout request form
- [ ] Replace useState with react-hook-form
- [ ] Add data-testid to all cards showing earnings
- [ ] Add loading skeletons for earnings cards
- [ ] Add error state for failed queries
- [ ] Add data-testid to payout history items
- [ ] Add empty state for no payouts

**Schema Example:**
```typescript
const payoutFormSchema = z.object({
  amount: z.string()
    .min(1, "Amount is required")
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, 
      "Amount must be positive"),
});
```

### **2. Seasonal Pricing (`client/src/pages/seasonal-pricing.tsx`)**

**Required Changes:**
- [ ] Add zod schema with date validation
- [ ] Replace useState with react-hook-form
- [ ] Add data-testid to all seasonal price cards
- [ ] Add loading state for properties query
- [ ] Add error handling for failed loads
- [ ] Validate end date is after start date

**Schema Example:**
```typescript
const seasonalPriceSchema = z.object({
  propertyId: z.string().min(1, "Property is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  priceAdjustment: z.string()
    .min(1, "Price adjustment is required")
    .refine((val) => !isNaN(parseFloat(val)), "Must be a valid number"),
  seasonType: z.enum(["peak", "off-peak"]),
}).refine((data) => new Date(data.endDate) > new Date(data.startDate), {
  message: "End date must be after start date",
  path: ["endDate"],
});
```

### **3. Disputes (`client/src/pages/disputes.tsx`)**

**Required Changes:**
- [ ] Add zod schema for dispute form
- [ ] Replace useState with react-hook-form
- [ ] Add data-testid to dispute cards
- [ ] Add loading states for bookings/orders queries
- [ ] Add conditional validation (booking OR order required)
- [ ] Add data-testid to type selection

**Schema Example:**
```typescript
const disputeFormSchema = z.object({
  itemType: z.enum(["booking", "order"]),
  bookingId: z.string().optional(),
  orderId: z.string().optional(),
  description: z.string().min(20, "Description must be at least 20 characters"),
}).refine((data) => {
  if (data.itemType === "booking") return !!data.bookingId;
  return !!data.orderId;
}, {
  message: "Please select a booking or order",
  path: ["bookingId"],
});
```

### **4. Admin - Cancellation Management (`client/src/components/admin/CancellationManagement.tsx`)**

**Required Changes:**
- [ ] Add data-testid to all cancellation cards
- [ ] Add loading skeleton
- [ ] Add error state
- [ ] Add data-testid to approve/reject buttons
- [ ] Add empty state message

**No form needed** - only uses buttons for approve/reject.

### **5. Admin - Platform Settings (`client/src/components/admin/PlatformSettings.tsx`)**

**Required Changes:**
- [ ] Add zod schema for settings
- [ ] Replace useState with react-hook-form
- [ ] Add data-testid to all inputs
- [ ] Add loading state while fetching settings
- [ ] Add validation for numeric values

**Schema Example:**
```typescript
const settingsSchema = z.object({
  commissionRate: z.string()
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0 && parseFloat(val) <= 100,
      "Commission rate must be between 0 and 100"),
  platformFee: z.string()
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0,
      "Platform fee must be positive"),
  minBookingAmount: z.string()
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0,
      "Minimum amount must be positive"),
});
```

### **6. Admin - Activity Logs (`client/src/components/admin/ActivityLogs.tsx`)**

**No form** - Only displays data. Required changes:
- [ ] Add data-testid to each log item
- [ ] Add data-testid to search input
- [ ] Add loading skeleton
- [ ] Add error state
- [ ] Add empty state

### **7. Admin - Property-Service Association (`client/src/components/admin/PropertyServiceAssociation.tsx`)**

**Required Changes:**
- [ ] Add zod schema
- [ ] Replace useState with react-hook-form
- [ ] Add data-testid to all selects
- [ ] Add data-testid to checkbox
- [ ] Add loading states for properties/providers
- [ ] Add data-testid to association cards

**Schema Example:**
```typescript
const associationSchema = z.object({
  propertyId: z.string().min(1, "Property is required"),
  serviceProviderId: z.string().min(1, "Service provider is required"),
  isRecommended: z.boolean(),
});
```

### **8. Admin - Email Templates (`client/src/components/admin/EmailTemplates.tsx`)**

**Required Changes:**
- [ ] Add zod schema
- [ ] Replace useState with react-hook-form
- [ ] Add data-testid to all inputs
- [ ] Add loading state
- [ ] Add data-testid to template cards

**Schema Example:**
```typescript
const templateSchema = z.object({
  name: z.string().min(3, "Template name must be at least 3 characters"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  body: z.string().min(20, "Body must be at least 20 characters"),
  variables: z.string().optional(),
});
```

### **9. Admin - Territory Management (`client/src/components/admin/TerritoryManagement.tsx`)**

**Required Changes:**
- [ ] Add zod schema
- [ ] Replace useState with react-hook-form
- [ ] Add data-testid to inputs
- [ ] Add loading state
- [ ] Add data-testid to territory cards

**Schema Example:**
```typescript
const territorySchema = z.object({
  name: z.string().min(2, "Territory name must be at least 2 characters"),
  countryManagerId: z.string().optional(),
});
```

---

## 🎯 Quick Checklist for Each Feature

Before marking a feature as complete, verify:

- [ ] ✅ react-hook-form with zodResolver implemented
- [ ] ✅ Zod schema with proper validation rules
- [ ] ✅ All inputs use FormField component
- [ ] ✅ Loading state with skeletons/spinners
- [ ] ✅ Error state with user-friendly message
- [ ] ✅ Empty state when no data
- [ ] ✅ All buttons have data-testid
- [ ] ✅ All inputs have data-testid
- [ ] ✅ All display elements have data-testid
- [ ] ✅ Form resets after successful submission
- [ ] ✅ Mutation includes error handling
- [ ] ✅ Query keys are invalidated after mutation

---

## 💡 Common Patterns

### **Select with Form**
```typescript
<FormField
  control={form.control}
  name="fieldName"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Label *</FormLabel>
      <Select onValueChange={field.onChange} value={field.value}>
        <FormControl>
          <SelectTrigger data-testid="select-field">
            <SelectValue placeholder="Choose..." />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.id} value={item.id}>
              {item.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>
```

### **Textarea with Form**
```typescript
<FormField
  control={form.control}
  name="description"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Description *</FormLabel>
      <FormControl>
        <Textarea
          {...field}
          rows={4}
          placeholder="Enter description..."
          data-testid="textarea-description"
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

### **Checkbox with Form**
```typescript
<FormField
  control={form.control}
  name="isRecommended"
  render={({ field }) => (
    <FormItem className="flex items-center space-x-2">
      <FormControl>
        <input
          type="checkbox"
          checked={field.value}
          onChange={field.onChange}
          data-testid="checkbox-recommended"
        />
      </FormControl>
      <FormLabel>Mark as recommended</FormLabel>
    </FormItem>
  )}
/>
```

---

## 🚀 Implementation Order (Recommended)

1. ✅ **Service Packages** (COMPLETE - Use as reference)
2. **Provider Earnings** (Has form + complex display)
3. **Seasonal Pricing** (Has form with date validation)
4. **Disputes** (Has conditional validation)
5. **Platform Settings** (Admin - simpler form)
6. **Property-Service Association** (Admin - has checkbox)
7. **Email Templates** (Admin - straightforward)
8. **Territory Management** (Admin - simple)
9. **Activity Logs** (No form - just display)
10. **Cancellation Management** (No form - just buttons)

---

## 📝 Testing After Fixes

After fixing each feature, test:
1. Form validation (submit empty, submit invalid)
2. Loading state appears
3. Error state appears on API failure
4. Success flow works end-to-end
5. All data-testid attributes present

---

**Reference Implementation**: See `client/src/components/ServicePackages.tsx` for the complete, correct pattern.
