import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Briefcase, Users, Heart, Zap, AlertCircle } from "lucide-react";
import type { JobPosting } from "@shared/schema";

const applicationFormSchema = z.object({
  applicantName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional().refine((val) => {
    if (!val || val.trim() === "") return true;
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(val) && val.replace(/\D/g, "").length >= 10;
  }, "Invalid phone number format"),
  coverLetter: z.string().optional().refine((val) => {
    if (!val || val.trim() === "") return true;
    return val.length >= 50;
  }, "Cover letter must be at least 50 characters if provided"),
  resumeUrl: z.string().optional(),
});

type ApplicationFormData = z.infer<typeof applicationFormSchema>;

export default function Careers() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const { data: jobs, isLoading, error } = useQuery<JobPosting[]>({
    queryKey: ['/api/jobs'],
  });

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: {
      applicantName: "",
      email: "",
      phone: "",
      coverLetter: "",
      resumeUrl: "",
    },
  });

  const applicationMutation = useMutation({
    mutationFn: async (data: ApplicationFormData & { jobPostingId: string }) => {
      return await apiRequest('POST', '/api/applications', data);
    },
    onSuccess: () => {
      toast({
        title: "Application submitted!",
        description: "We've received your application and will review it shortly.",
      });
      setIsDialogOpen(false);
      form.reset();
      setSelectedJob(null);
    },
    onError: (error: any) => {
      toast({
        title: "Application failed",
        description: error.message || "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleApplyClick = (job: JobPosting) => {
    setSelectedJob(job);
    setIsDialogOpen(true);
    form.reset();
  };

  const onSubmit = (data: ApplicationFormData) => {
    if (!selectedJob) return;
    
    applicationMutation.mutate({
      ...data,
      jobPostingId: selectedJob.id,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onToggleDarkMode={toggleDarkMode} 
        isDarkMode={isDarkMode} 
        isAuthenticated={isAuthenticated}
        user={user}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4" data-testid="text-careers-title">
            {t('info_pages.careers_title')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="text-careers-subtitle">
            Help us build the future of travel. We're always looking for talented people who share our passion.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Remote First</h3>
            <p className="text-sm text-muted-foreground">
              Work from anywhere in the world with flexible hours
            </p>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Great Team</h3>
            <p className="text-sm text-muted-foreground">
              Collaborate with talented people from diverse backgrounds
            </p>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Heart className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Health Benefits</h3>
            <p className="text-sm text-muted-foreground">
              Comprehensive health coverage for you and your family
            </p>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Growth</h3>
            <p className="text-sm text-muted-foreground">
              Continuous learning and career development opportunities
            </p>
          </Card>
        </div>

        <h2 className="text-2xl font-semibold text-foreground mb-6">Open Positions</h2>
        
        {isLoading && (
          <div className="space-y-4" data-testid="loading-jobs">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="mb-4 md:mb-0 flex-1">
                    <Skeleton className="h-6 w-64 mb-2" />
                    <Skeleton className="h-4 w-96" />
                  </div>
                  <Skeleton className="h-10 w-32" />
                </div>
              </Card>
            ))}
          </div>
        )}

        {error && (
          <Card className="p-8 text-center" data-testid="error-jobs">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Failed to load job postings</h3>
            <p className="text-muted-foreground mb-4">
              We're having trouble loading our open positions. Please try again later.
            </p>
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/jobs'] })} data-testid="button-retry-jobs">
              Try Again
            </Button>
          </Card>
        )}

        {!isLoading && !error && jobs && jobs.length === 0 && (
          <Card className="p-8 text-center" data-testid="empty-jobs">
            <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No open positions at the moment</h3>
            <p className="text-muted-foreground">
              We don't have any open positions right now, but we're always looking for talented people. 
              Feel free to send us a general application below.
            </p>
          </Card>
        )}

        {!isLoading && !error && jobs && jobs.length > 0 && (
          <div className="space-y-4">
            {jobs.map((job, index) => (
              <Card key={job.id} className="p-6" data-testid={`card-position-${index}`}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="mb-4 md:mb-0">
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {job.title}
                    </h3>
                    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                      <span>{job.department}</span>
                      <span>•</span>
                      <span>{job.location}</span>
                      <span>•</span>
                      <span className="capitalize">{job.type.replace('-', ' ')}</span>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleApplyClick(job)} 
                    data-testid={`button-apply-${index}`}
                  >
                    Apply Now
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Card className="p-8 mt-12 text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Don't see a perfect fit?</h2>
          <p className="text-muted-foreground mb-6">
            We're always interested in hearing from talented people. Send us your resume and let us know what you're passionate about.
          </p>
          <Button variant="outline" data-testid="button-general-application">
            Send General Application
          </Button>
        </Card>
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]" data-testid="dialog-application">
          <DialogHeader>
            <DialogTitle data-testid="text-dialog-title">
              Apply for {selectedJob?.title}
            </DialogTitle>
            <DialogDescription data-testid="text-dialog-description">
              Fill out the form below to submit your application. We'll review it and get back to you soon.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="applicantName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Your full name" 
                        {...field} 
                        data-testid="input-applicant-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input 
                        type="email"
                        placeholder="your.email@example.com" 
                        {...field} 
                        data-testid="input-email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="tel"
                        placeholder="+1 (555) 123-4567" 
                        {...field} 
                        data-testid="input-phone"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="coverLetter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cover Letter (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Tell us why you're a great fit for this role..." 
                        rows={6}
                        {...field} 
                        data-testid="input-cover-letter"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="resumeUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resume URL (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="url"
                        placeholder="https://example.com/your-resume.pdf" 
                        {...field} 
                        data-testid="input-resume-url"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                  data-testid="button-cancel-application"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={applicationMutation.isPending}
                  data-testid="button-submit-application"
                >
                  {applicationMutation.isPending ? "Submitting..." : "Submit Application"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
