import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import WhatsAppBubble from "@/components/WhatsAppBubble";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Register from "@/pages/register";
import RegisterHost from "@/pages/register-host";
import RegisterProvider from "@/pages/register-provider";
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
import Press from "@/pages/press";
import Blog from "@/pages/blog";
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

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {/* Auth pages */}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/register-host" component={RegisterHost} />
      <Route path="/register-provider" component={RegisterProvider} />
      
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
      <Route path="/press" component={Press} />
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
      {isAuthenticated && (
        <>
          <Route path="/booking" component={Booking} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/favorites" component={Favorites} />
          <Route path="/loyalty-points" component={LoyaltyPoints} />
          <Route path="/trip-planning" component={TripPlanning} />
          <Route path="/provider-earnings" component={ProviderEarnings} />
          <Route path="/seasonal-pricing" component={SeasonalPricing} />
          <Route path="/disputes" component={Disputes} />
          <Route path="/messages" component={Messages} />
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/support-dashboard" component={SupportDashboard} />
          <Route path="/billing-dashboard" component={BillingDashboard} />
          <Route path="/operation-dashboard" component={OperationDashboard} />
          <Route path="/marketing-dashboard" component={MarketingDashboard} />
          <Route path="/city-manager-dashboard" component={CityManagerDashboard} />
          <Route path="/country-manager-dashboard" component={CountryManagerDashboard} />
          <Route path="/provider-config" component={ProviderConfig} />
          <Route path="/provider-orders" component={ProviderOrders} />
          <Route path="/my-service-orders" component={MyServiceOrders} />
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
        <WhatsAppBubble />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
