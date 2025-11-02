import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Mail, Plus } from "lucide-react";

const emailTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  subject: z.string().min(1, "Subject line is required"),
  body: z.string().min(10, "Email body must be at least 10 characters"),
  variables: z.string().optional(),
});

type EmailTemplate = {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string;
};

export default function EmailTemplates() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof emailTemplateSchema>>({
    resolver: zodResolver(emailTemplateSchema),
    defaultValues: {
      name: "",
      subject: "",
      body: "",
      variables: "",
    },
  });

  const { data: templates = [], isLoading, error } = useQuery<EmailTemplate[]>({
    queryKey: ["/api/admin/email-templates"],
  });

  const createTemplateMutation = useMutation({
    mutationFn: async (data: z.infer<typeof emailTemplateSchema>) => {
      const res = await fetch("/api/admin/email-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create template");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/email-templates"] });
      setDialogOpen(false);
      form.reset();
      toast({ title: "Success", description: "Email template created!" });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to create email template.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: z.infer<typeof emailTemplateSchema>) => {
    createTemplateMutation.mutate(data);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2" data-testid="heading-email-templates">
            <Mail className="w-5 h-5" />
            Email Templates
          </CardTitle>
          <Button size="sm" onClick={() => setDialogOpen(true)} data-testid="button-create-template">
            <Plus className="w-4 h-4 mr-2" />
            Create Template
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3" data-testid="loading-templates">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted rounded animate-pulse" data-testid={`skeleton-template-${i}`} />
            ))}
          </div>
        ) : error ? (
          <p className="text-center text-destructive py-8" data-testid="error-templates">
            Failed to load email templates
          </p>
        ) : templates.length === 0 ? (
          <p className="text-center text-muted-foreground py-8" data-testid="empty-templates">
            No email templates yet
          </p>
        ) : (
          <div className="space-y-3">
            {templates.map((template) => (
              <div key={template.id} className="border rounded-lg p-4" data-testid={`template-${template.id}`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold" data-testid={`text-name-${template.id}`}>{template.name}</p>
                    <p className="text-sm text-muted-foreground" data-testid={`text-subject-${template.id}`}>{template.subject}</p>
                  </div>
                  {template.variables && (
                    <Badge variant="outline" data-testid={`badge-variables-${template.id}`}>
                      {template.variables.split(",").length} variables
                    </Badge>
                  )}
                </div>
                <p className="text-sm line-clamp-2" data-testid={`text-body-${template.id}`}>{template.body}</p>
              </div>
            ))}
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Email Template</DialogTitle>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Template Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Booking Confirmation" {...field} data-testid="input-template-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject Line *</FormLabel>
                      <FormControl>
                        <Input placeholder="Your booking at {{propertyName}} is confirmed!" {...field} data-testid="input-template-subject" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="body"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Body *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Use {{variableName}} for dynamic content..." 
                          rows={8}
                          {...field} 
                          data-testid="textarea-template-body" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="variables"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Available Variables (comma-separated)</FormLabel>
                      <FormControl>
                        <Input placeholder="userName,propertyName,bookingCode,checkIn" {...field} data-testid="input-template-variables" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} data-testid="button-cancel-template">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createTemplateMutation.isPending} data-testid="button-submit-template">
                    {createTemplateMutation.isPending ? "Creating..." : "Create Template"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
