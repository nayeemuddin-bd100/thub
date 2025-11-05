import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Clock, CreditCard, Trash2, Plus, Minus } from "lucide-react";

interface BookingCartProps {
  property: {
    id: string;
    title: string;
    pricePerNight: string;
    maxGuests: number;
    location: string;
    rating: string;
  };
  selectedServices: any[];
  onServicesChange: (services: any[]) => void;
}

export default function BookingCart({ property, selectedServices, onServicesChange }: BookingCartProps) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1,
  });
  const [showBookingForm, setShowBookingForm] = useState(false);

  const createBookingMutation = useMutation({
    mutationFn: async (booking: any) => {
      return await apiRequest("POST", "/api/bookings", booking);
    },
    onSuccess: async (response) => {
      const booking = await response.json();
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
    if (!bookingData.checkIn || !bookingData.checkOut) {
      return { propertyTotal: 0, servicesTotal: 0, discountAmount: 0, totalAmount: 0, nights: 0 };
    }

    const checkInDate = new Date(bookingData.checkIn);
    const checkOutDate = new Date(bookingData.checkOut);
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (nights <= 0) {
      return { propertyTotal: 0, servicesTotal: 0, discountAmount: 0, totalAmount: 0, nights: 0 };
    }
    
    const propertyTotal = parseFloat(property.pricePerNight) * nights;
    const servicesTotal = selectedServices.reduce((total, service) => {
      const rate = service.duration ? 
        parseFloat(service.hourlyRate || '0') * service.duration :
        parseFloat(service.fixedRate || '0');
      return total + rate;
    }, 0);

    const discountRate = selectedServices.length >= 3 ? 0.1 : selectedServices.length > 0 ? 0.05 : 0;
    const discountAmount = (propertyTotal + servicesTotal) * discountRate;
    const totalAmount = propertyTotal + servicesTotal - discountAmount;

    return { propertyTotal, servicesTotal, discountAmount, totalAmount, nights };
  };

  const handleServiceDurationChange = (serviceId: string, duration: number) => {
    const updatedServices = selectedServices.map(service => 
      service.id === serviceId ? { ...service, duration: Math.max(1, duration) } : service
    );
    onServicesChange(updatedServices);
  };

  const removeService = (serviceId: string) => {
    const updatedServices = selectedServices.filter(service => service.id !== serviceId);
    onServicesChange(updatedServices);
  };

  const handleBooking = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to make a booking.",
        variant: "destructive",
      });
      window.location.href = '/api/login';
      return;
    }

    if (!bookingData.checkIn || !bookingData.checkOut) {
      toast({
        title: "Missing Information",
        description: "Please select check-in and check-out dates.",
        variant: "destructive",
      });
      return;
    }

    if (bookingData.guests > property.maxGuests) {
      toast({
        title: "Too Many Guests",
        description: `This property can accommodate up to ${property.maxGuests} guests.`,
        variant: "destructive",
      });
      return;
    }

    const checkInDate = new Date(bookingData.checkIn);
    const checkOutDate = new Date(bookingData.checkOut);
    
    if (checkOutDate <= checkInDate) {
      toast({
        title: "Invalid Dates",
        description: "Check-out date must be after check-in date.",
        variant: "destructive",
      });
      return;
    }

    createBookingMutation.mutate({
      propertyId: property.id,
      checkIn: bookingData.checkIn,
      checkOut: bookingData.checkOut,
      guests: bookingData.guests,
      services: selectedServices.map(service => ({
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

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-2" data-testid="text-booking-cart-title">
          Book Your Stay
        </h2>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-foreground" data-testid="text-property-price">
            ${parseFloat(property.pricePerNight).toLocaleString()}
          </span>
          <span className="text-sm text-muted-foreground">per night</span>
        </div>
      </div>

      {/* Booking Form */}
      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="checkin" className="text-sm font-medium">Check-in</Label>
            <Input
              id="checkin"
              data-testid="input-booking-checkin"
              type="date"
              value={bookingData.checkIn}
              onChange={(e) => setBookingData(prev => ({ ...prev, checkIn: e.target.value }))}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div>
            <Label htmlFor="checkout" className="text-sm font-medium">Check-out</Label>
            <Input
              id="checkout"
              data-testid="input-booking-checkout"
              type="date"
              value={bookingData.checkOut}
              onChange={(e) => setBookingData(prev => ({ ...prev, checkOut: e.target.value }))}
              min={bookingData.checkIn || new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="guests" className="text-sm font-medium">Guests</Label>
          <Input
            id="guests"
            data-testid="input-booking-guests"
            type="number"
            min="1"
            max={property.maxGuests}
            value={bookingData.guests}
            onChange={(e) => setBookingData(prev => ({ ...prev, guests: parseInt(e.target.value) || 1 }))}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Maximum {property.maxGuests} guests
          </p>
        </div>
      </div>

      {/* Selected Services */}
      {selectedServices.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-foreground mb-3" data-testid="text-selected-services-title">
            Selected Services ({selectedServices.length})
          </h3>
          <div className="space-y-3">
            {selectedServices.map((service, index) => (
              <div key={service.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-foreground text-sm" data-testid={`text-service-name-${index}`}>
                    {service.businessName}
                  </h4>
                  <div className="flex items-center space-x-2 mt-1">
                    {service.hourlyRate && (
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="w-6 h-6"
                          onClick={() => handleServiceDurationChange(service.id, (service.duration || 1) - 1)}
                          disabled={!service.duration || service.duration <= 1}
                          data-testid={`button-decrease-duration-${index}`}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="text-xs min-w-[3rem] text-center">
                          {service.duration || 1}h
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="w-6 h-6"
                          onClick={() => handleServiceDurationChange(service.id, (service.duration || 1) + 1)}
                          data-testid={`button-increase-duration-${index}`}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                    <span className="text-xs text-muted-foreground">
                      ${service.hourlyRate ? 
                        `${parseFloat(service.hourlyRate) * (service.duration || 1)}` : 
                        service.fixedRate
                      }
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-6 h-6 text-destructive hover:text-destructive"
                  onClick={() => removeService(service.id)}
                  data-testid={`button-remove-service-${index}`}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pricing Breakdown */}
      {nights > 0 && (
        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground" data-testid="text-property-nights">
              ${parseFloat(property.pricePerNight).toLocaleString()} × {nights} nights
            </span>
            <span className="text-foreground" data-testid="text-property-subtotal">
              ${propertyTotal.toLocaleString()}
            </span>
          </div>

          {servicesTotal > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground" data-testid="text-services-subtotal-label">
                Services
              </span>
              <span className="text-foreground" data-testid="text-services-subtotal">
                ${servicesTotal.toLocaleString()}
              </span>
            </div>
          )}

          {discountAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground" data-testid="text-discount-label">
                Bundle discount ({selectedServices.length >= 3 ? '10%' : '5%'})
              </span>
              <span className="text-accent" data-testid="text-discount-amount">
                -${discountAmount.toLocaleString()}
              </span>
            </div>
          )}

          <Separator />

          <div className="flex justify-between font-semibold">
            <span className="text-foreground" data-testid="text-total-label">Total</span>
            <span className="text-foreground text-lg" data-testid="text-total-amount">
              ${totalAmount.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* Booking Button */}
      <Button
        className="w-full"
        onClick={handleBooking}
        disabled={createBookingMutation.isPending || nights <= 0}
        data-testid="button-book-now"
      >
        <CreditCard className="w-4 h-4 mr-2" />
        {createBookingMutation.isPending ? 'Processing...' : 
         nights <= 0 ? 'Select Dates' : 
         isAuthenticated ? `Book for ${totalAmount > 0 ? `$${totalAmount.toLocaleString()}` : 'Free'}` : 'Login to Book'}
      </Button>

      {!isAuthenticated && (
        <p className="text-xs text-muted-foreground text-center mt-2" data-testid="text-login-required">
          You'll be redirected to log in
        </p>
      )}

      {/* Property Info */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span data-testid="text-property-info">
            {nights > 0 ? `${nights} night${nights > 1 ? 's' : ''}` : 'Select dates'} in {property.location}
          </span>
        </div>
        
        {selectedServices.length > 0 && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-2">
            <Clock className="w-4 h-4" />
            <span data-testid="text-services-info">
              {selectedServices.length} service{selectedServices.length > 1 ? 's' : ''} selected
            </span>
          </div>
        )}

        <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-2">
          <Users className="w-4 h-4" />
          <span data-testid="text-guests-info">
            {bookingData.guests} guest{bookingData.guests > 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </Card>
  );
}
