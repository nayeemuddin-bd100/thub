import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function BookingDemo() {
  return (
    <section className="py-16 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4" data-testid="text-booking-demo-title">
            Seamless Booking Experience
          </h2>
          <p className="text-lg text-muted-foreground" data-testid="text-booking-demo-subtitle">
            Book your property and services in just a few clicks
          </p>
        </div>

        {/* Booking Flow Demo */}
        <Card className="bg-card rounded-2xl border border-border p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Property Selection */}
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-4" data-testid="text-property-selection">
                1. Select Your Property
              </h3>
              <Card className="border border-border rounded-xl p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-muted rounded-lg"></div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground" data-testid="text-demo-property-name">
                      Luxury Beach Villa
                    </h4>
                    <p className="text-muted-foreground text-sm" data-testid="text-demo-property-location">
                      Malibu, California
                    </p>
                    <p className="text-lg font-bold text-foreground mt-1" data-testid="text-demo-property-price">
                      $450/night
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Service Selection */}
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-4" data-testid="text-service-selection">
                2. Add Services
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-foreground" data-testid="text-service-chef">Private Chef</span>
                  <span className="text-primary font-semibold" data-testid="text-service-chef-price">+$85/hour</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-foreground" data-testid="text-service-transfer">Airport Transfer</span>
                  <span className="text-primary font-semibold" data-testid="text-service-transfer-price">+$120</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-foreground" data-testid="text-service-housekeeping">Daily Housekeeping</span>
                  <span className="text-primary font-semibold" data-testid="text-service-housekeeping-price">+$50/day</span>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Summary */}
          <Card className="mt-8 p-6 bg-muted rounded-xl">
            <h4 className="text-lg font-semibold text-foreground mb-4" data-testid="text-booking-summary">
              Booking Summary
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground" data-testid="text-property-cost">Property (3 nights)</span>
                <span className="text-foreground" data-testid="text-property-cost-value">$1,350</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground" data-testid="text-services-cost">Services</span>
                <span className="text-foreground" data-testid="text-services-cost-value">$590</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground" data-testid="text-bundle-discount">Bundle Discount (10%)</span>
                <span className="text-accent" data-testid="text-bundle-discount-value">-$194</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between">
                <span className="font-semibold text-foreground" data-testid="text-total-label">Total</span>
                <span className="font-bold text-foreground text-lg" data-testid="text-total-value">$1,746</span>
              </div>
            </div>
            
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground" data-testid="text-booking-code-label">Booking Code</span>
                <Badge variant="outline" className="font-mono" data-testid="text-booking-code-value">
                  TH-B44X9Z
                </Badge>
              </div>
              <Button 
                data-testid="button-confirm-booking"
                className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
              >
                Confirm Booking
              </Button>
            </div>
          </Card>
        </Card>
      </div>
    </section>
  );
}
