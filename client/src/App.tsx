import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Home from "@/pages/home";
import Properties from "@/pages/properties";
import PropertyDetail from "@/pages/property-detail";
import Services from "@/pages/services";
import Booking from "@/pages/booking";
import Dashboard from "@/pages/dashboard";
import AdminDashboard from "@/pages/admin";
import ProviderConfig from "@/pages/provider-config";
import About from "@/pages/about";
import Careers from "@/pages/careers";
import Contact from "@/pages/contact";
import Help from "@/pages/help";
import Privacy from "@/pages/privacy";
import Terms from "@/pages/terms";
import Host from "@/pages/host";
import Provider from "@/pages/provider";
import Press from "@/pages/press";
import Blog from "@/pages/blog";
import Safety from "@/pages/safety";
import Cancellation from "@/pages/cancellation";
import Resources from "@/pages/resources";
import Community from "@/pages/community";
import Sitemap from "@/pages/sitemap";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {/* Auth pages */}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      {/* Public pages - accessible to all (CRITICAL: Public browsing without login) */}
      <Route path="/" component={Home} />
      <Route path="/properties" component={Properties} />
      <Route path="/properties/:id" component={PropertyDetail} />
      <Route path="/services" component={Services} />
      
      {/* Public informational pages */}
      <Route path="/about" component={About} />
      <Route path="/careers" component={Careers} />
      <Route path="/contact" component={Contact} />
      <Route path="/help" component={Help} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/host" component={Host} />
      <Route path="/provider" component={Provider} />
      <Route path="/press" component={Press} />
      <Route path="/blog" component={Blog} />
      <Route path="/safety" component={Safety} />
      <Route path="/cancellation" component={Cancellation} />
      <Route path="/resources" component={Resources} />
      <Route path="/community" component={Community} />
      <Route path="/sitemap" component={Sitemap} />
      
      {/* Protected pages - authentication required */}
      {isAuthenticated && (
        <>
          <Route path="/booking" component={Booking} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/provider-config" component={ProviderConfig} />
        </>
      )}
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
