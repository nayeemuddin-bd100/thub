import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Calendar, Users, Clock, MapPin, Star, CreditCard } from "lucide-react";

export default function Booking() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [bookingData, setBookingData] = useState({
    propertyId: '',
    checkIn: '',
    checkOut: '',
    guests: 1,
    services: [] as any[],
  });

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    // Parse URL parameters for quick booking
    const urlParams = new URLSearchParams(window.location.search);
    const propertyId = urlParams.get('propertyId');
    const checkIn = urlParams.get('checkIn');
    const checkOut = urlParams.get('checkOut');
    const guests = urlParams.get('guests');

    if (propertyId) {
      setBookingData(prev => ({
        ...prev,
        propertyId,
        checkIn: checkIn || '',
        checkOut: checkOut || '',
        guests: guests ? parseInt(guests) : 1,
      }));
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You need to be logged in to make a booking. Redirecting...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

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

  const { data: property } = useQuery({
    queryKey: ['/api/properties', bookingData.propertyId],
    enabled: !!bookingData.propertyId,
    retry: false,
  });

  const { data: properties } = useQuery({
    queryKey: ['/api/properties'],
    enabled: !bookingData.propertyId,
    retry: false,
  });

  const createBookingMutation = useMutation({
    mutationFn: async (booking: any) => {
      const response = await apiRequest("POST", "/api/bookings", booking);
      return await response.json();
    },
    onSuccess: (booking) => {
      toast({
        title: "Booking Confirmed!",
        description: `Your booking code is ${booking.bookingCode}. Redirecting to payment...`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      
      // Redirect to payment page after a short delay to show the success message
      setTimeout(() => {
        window.location.href = `/pay-booking/${booking.id}`;
      }, 1500);
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Booking Failed",
        description: "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    },
  });

  const calculateTotals = () => {
    if (!property || !bookingData.checkIn || !bookingData.checkOut) {
      return { propertyTotal: 0, servicesTotal: 0, discountAmount: 0, totalAmount: 0, nights: 0 };
    }

    const checkInDate = new Date(bookingData.checkIn);
    const checkOutDate = new Date(bookingData.checkOut);
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const propertyTotal = parseFloat(property.pricePerNight) * nights;
    const servicesTotal = bookingData.services.reduce((total, service) => {
      const rate = service.duration ? 
        parseFloat(service.hourlyRate || '0') * service.duration :
        parseFloat(service.fixedRate || '0');
      return total + rate;
    }, 0);

    const discountRate = bookingData.services.length >= 3 ? 0.1 : bookingData.services.length > 0 ? 0.05 : 0;
    const discountAmount = (propertyTotal + servicesTotal) * discountRate;
    const totalAmount = propertyTotal + servicesTotal - discountAmount;

    return { propertyTotal, servicesTotal, discountAmount, totalAmount, nights };
  };

  const handleBooking = () => {
    if (!bookingData.propertyId || !bookingData.checkIn || !bookingData.checkOut) {
      toast({
        title: "Missing Information",
        description: "Please select a property and dates.",
        variant: "destructive",
      });
      return;
    }

    createBookingMutation.mutate({
      propertyId: bookingData.propertyId,
      checkIn: bookingData.checkIn,
      checkOut: bookingData.checkOut,
      guests: bookingData.guests,
      services: bookingData.services.map(service => ({
        serviceProviderId: service.id,
        serviceName: service.businessName,
        serviceDate: new Date(bookingData.checkIn),
        duration: service.duration || null,
        rate: service.hourlyRate || service.fixedRate,
        total: service.duration ? 
          parseFloat(service.hourlyRate || '0') * service.duration :
          parseFloat(service.fixedRate || '0'),
        status: 'pending',
      })),
    });
  };

  const { propertyTotal, servicesTotal, discountAmount, totalAmount, nights } = calculateTotals();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          onToggleDarkMode={toggleDarkMode} 
          isDarkMode={isDarkMode} 
          isAuthenticated={isAuthenticated}
          user={user}
        />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-64 mb-8"></div>
            <div className="h-96 bg-muted rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onToggleDarkMode={toggleDarkMode} 
        isDarkMode={isDarkMode} 
        isAuthenticated={isAuthenticated}
        user={user}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-booking-title">
            Complete Your Booking
          </h1>
          <p className="text-lg text-muted-foreground" data-testid="text-booking-subtitle">
            Review your selection and confirm your reservation
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Selection */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4" data-testid="text-property-selection">
                Select Property
              </h2>
              {property ? (
                <div className="flex items-center space-x-4 p-4 border border-border rounded-lg">
                  <img 
                    src={property.images?.[0] || "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=150"}
                    alt={property.title}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground" data-testid="text-selected-property-name">
                      {property.title}
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span data-testid="text-selected-property-location">{property.location}</span>
                    </div>
                    <div className="flex items-center space-x-1 mt-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm" data-testid="text-selected-property-rating">
                        {parseFloat(property.rating).toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-foreground" data-testid="text-selected-property-price">
                      ${parseFloat(property.pricePerNight).toLocaleString()}/night
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-muted-foreground mb-4">No property selected. Choose from our featured properties:</p>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {properties?.slice(0, 5).map((prop: any) => (
                      <div 
                        key={prop.id}
                        className="flex items-center space-x-4 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50"
                        onClick={() => setBookingData(prev => ({ ...prev, propertyId: prop.id }))}
                        data-testid={`property-option-${prop.id}`}
                      >
                        <img 
                          src={prop.images?.[0] || "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=80"}
                          alt={prop.title}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground">{prop.title}</h4>
                          <p className="text-sm text-muted-foreground">{prop.location}</p>
                        </div>
                        <div className="text-sm font-semibold text-foreground">
                          ${parseFloat(prop.pricePerNight).toLocaleString()}/night
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Booking Details */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4" data-testid="text-booking-details">
                Booking Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="check-in">Check-in Date</Label>
                  <Input
                    id="check-in"
                    data-testid="input-checkin"
                    type="date"
                    value={bookingData.checkIn}
                    onChange={(e) => setBookingData(prev => ({ ...prev, checkIn: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <Label htmlFor="check-out">Check-out Date</Label>
                  <Input
                    id="check-out"
                    data-testid="input-checkout"
                    type="date"
                    value={bookingData.checkOut}
                    onChange={(e) => setBookingData(prev => ({ ...prev, checkOut: e.target.value }))}
                    min={bookingData.checkIn || new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <Label htmlFor="guests">Number of Guests</Label>
                  <Input
                    id="guests"
                    data-testid="input-guests"
                    type="number"
                    min="1"
                    max={property?.maxGuests || 10}
                    value={bookingData.guests}
                    onChange={(e) => setBookingData(prev => ({ ...prev, guests: parseInt(e.target.value) || 1 }))}
                  />
                </div>
              </div>
            </Card>

            {/* Selected Services */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4" data-testid="text-selected-services">
                Selected Services
              </h2>
              {bookingData.services.length > 0 ? (
                <div className="space-y-3">
                  {bookingData.services.map((service, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <h4 className="font-medium text-foreground">{service.businessName}</h4>
                        <p className="text-sm text-muted-foreground">{service.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">
                          ${service.hourlyRate ? `${service.hourlyRate}/hour` : service.fixedRate}
                        </p>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setBookingData(prev => ({
                            ...prev,
                            services: prev.services.filter((_, i) => i !== index)
                          }))}
                          data-testid={`button-remove-service-${index}`}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground" data-testid="text-no-services-selected">
                  No services selected. You can add services from the property page.
                </p>
              )}
            </Card>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-foreground mb-4" data-testid="text-booking-summary">
                Booking Summary
              </h2>
              
              {property && bookingData.checkIn && bookingData.checkOut ? (
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground" data-testid="text-property-nights">
                      Property ({nights} nights)
                    </span>
                    <span className="text-foreground" data-testid="text-property-total">
                      ${propertyTotal.toLocaleString()}
                    </span>
                  </div>
                  
                  {servicesTotal > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground" data-testid="text-services-total-label">
                        Services
                      </span>
                      <span className="text-foreground" data-testid="text-services-total-value">
                        ${servicesTotal.toLocaleString()}
                      </span>
                    </div>
                  )}
                  
                  {discountAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground" data-testid="text-discount-label">
                        Bundle Discount ({bookingData.services.length >= 3 ? '10%' : '5%'})
                      </span>
                      <span className="text-accent" data-testid="text-discount-value">
                        -${discountAmount.toLocaleString()}
                      </span>
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div className="flex justify-between">
                    <span className="font-semibold text-foreground" data-testid="text-total-label">
                      Total
                    </span>
                    <span className="font-bold text-foreground text-lg" data-testid="text-total-amount">
                      ${totalAmount.toLocaleString()}
                    </span>
                  </div>

                  <Button 
                    data-testid="button-confirm-booking"
                    className="w-full mt-6"
                    onClick={handleBooking}
                    disabled={createBookingMutation.isPending || !property}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    {createBookingMutation.isPending ? 'Processing...' : 'Confirm Booking'}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground" data-testid="text-incomplete-booking">
                    Please select a property and dates to see pricing
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
