import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import WhatsAppBubble from "@/components/WhatsAppBubble";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Register from "@/pages/register";
import WorkWithUs from "@/pages/work-with-us";
import ForcePasswordReset from "@/pages/force-password-reset";
import Home from "@/pages/home";
import Properties from "@/pages/properties";
import PropertyDetail from "@/pages/property-detail";
import Services from "@/pages/services";
import Booking from "@/pages/booking";
import Dashboard from "@/pages/dashboard";
import AdminDashboard from "@/pages/admin";
import ProviderConfig from "@/pages/provider-config";
import ProviderOrders from "@/pages/provider-orders";
import MyServiceOrders from "@/pages/my-service-orders";
import PayServiceOrder from "@/pages/pay-service-order";
import PayBooking from "@/pages/pay-booking";
import ServiceProviderDetails from "@/pages/service-provider-details";
import BookService from "@/pages/book-service";
import About from "@/pages/about";
import Careers from "@/pages/careers";
import Contact from "@/pages/contact";
import Help from "@/pages/help";
import Privacy from "@/pages/privacy";
import Terms from "@/pages/terms";
import Host from "@/pages/host";
import Provider from "@/pages/provider";
import Blog from "@/pages/blog";
import BlogDetail from "@/pages/blog-detail";
import Safety from "@/pages/safety";
import Cancellation from "@/pages/cancellation";
import Resources from "@/pages/resources";
import Community from "@/pages/community";
import Sitemap from "@/pages/sitemap";
import Favorites from "@/pages/favorites";
import LoyaltyPoints from "@/pages/loyalty-points";
import TripPlanning from "@/pages/trip-planning";
import ProviderEarnings from "@/pages/provider-earnings";
import SeasonalPricing from "@/pages/seasonal-pricing";
import Disputes from "@/pages/disputes";
import Messages from "@/pages/messages";
import SupportDashboard from "@/pages/support-dashboard";
import BillingDashboard from "@/pages/billing-dashboard";
import OperationDashboard from "@/pages/operation-dashboard";
import MarketingDashboard from "@/pages/marketing-dashboard";
import CityManagerDashboard from "@/pages/city-manager-dashboard";
import CountryManagerDashboard from "@/pages/country-manager-dashboard";

// Protected route wrapper that redirects to login if not authenticated
function ProtectedRoute({ component: Component, path }: { component: any; path: string }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>;
  }

  if (!isAuthenticated) {
    // Redirect to login with the current path as redirect parameter
    setLocation(`/login?redirect=${encodeURIComponent(path)}`);
    return null;
  }

  return <Component />;
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {/* Auth pages */}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/work-with-us" component={WorkWithUs} />
      <Route path="/force-password-reset/:userId" component={ForcePasswordReset} />
      
      {/* Public pages - accessible to all (CRITICAL: Public browsing without login) */}
      <Route path="/" component={Home} />
      <Route path="/properties" component={Properties} />
      <Route path="/properties/:id" component={PropertyDetail} />
      <Route path="/services" component={Services} />
      <Route path="/service-provider/:id" component={ServiceProviderDetails} />
      <Route path="/book-service/:id" component={BookService} />
      
      {/* Public informational pages */}
      <Route path="/about" component={About} />
      <Route path="/careers" component={Careers} />
      <Route path="/contact" component={Contact} />
      <Route path="/help" component={Help} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/host" component={Host} />
      <Route path="/provider" component={Provider} />
      <Route path="/blog/:slug" component={BlogDetail} />
      <Route path="/blog" component={Blog} />
      <Route path="/safety" component={Safety} />
      <Route path="/cancellation" component={Cancellation} />
      <Route path="/resources" component={Resources} />
      <Route path="/community" component={Community} />
      <Route path="/sitemap" component={Sitemap} />
      
      {/* Payment pages - must be outside auth check to prevent 404 during redirect */}
      <Route path="/pay-booking/:id" component={PayBooking} />
      <Route path="/pay-service-order/:id" component={PayServiceOrder} />
      
      {/* Protected pages - authentication required */}
      <Route path="/booking">{() => <ProtectedRoute component={Booking} path="/booking" />}</Route>
      <Route path="/dashboard">{() => <ProtectedRoute component={Dashboard} path="/dashboard" />}</Route>
      <Route path="/favorites">{() => <ProtectedRoute component={Favorites} path="/favorites" />}</Route>
      <Route path="/loyalty-points">{() => <ProtectedRoute component={LoyaltyPoints} path="/loyalty-points" />}</Route>
      <Route path="/trip-planning">{() => <ProtectedRoute component={TripPlanning} path="/trip-planning" />}</Route>
      <Route path="/provider-earnings">{() => <ProtectedRoute component={ProviderEarnings} path="/provider-earnings" />}</Route>
      <Route path="/seasonal-pricing">{() => <ProtectedRoute component={SeasonalPricing} path="/seasonal-pricing" />}</Route>
      <Route path="/disputes">{() => <ProtectedRoute component={Disputes} path="/disputes" />}</Route>
      <Route path="/messages">{() => <ProtectedRoute component={Messages} path="/messages" />}</Route>
      <Route path="/admin">{() => <ProtectedRoute component={AdminDashboard} path="/admin" />}</Route>
      <Route path="/support-dashboard">{() => <ProtectedRoute component={SupportDashboard} path="/support-dashboard" />}</Route>
      <Route path="/billing-dashboard">{() => <ProtectedRoute component={BillingDashboard} path="/billing-dashboard" />}</Route>
      <Route path="/operation-dashboard">{() => <ProtectedRoute component={OperationDashboard} path="/operation-dashboard" />}</Route>
      <Route path="/marketing-dashboard">{() => <ProtectedRoute component={MarketingDashboard} path="/marketing-dashboard" />}</Route>
      <Route path="/city-manager-dashboard">{() => <ProtectedRoute component={CityManagerDashboard} path="/city-manager-dashboard" />}</Route>
      <Route path="/country-manager-dashboard">{() => <ProtectedRoute component={CountryManagerDashboard} path="/country-manager-dashboard" />}</Route>
      <Route path="/provider-config">{() => <ProtectedRoute component={ProviderConfig} path="/provider-config" />}</Route>
      <Route path="/provider-orders">{() => <ProtectedRoute component={ProviderOrders} path="/provider-orders" />}</Route>
      <Route path="/my-service-orders">{() => <ProtectedRoute component={MyServiceOrders} path="/my-service-orders" />}</Route>
      
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
        <WhatsAppBubble />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
