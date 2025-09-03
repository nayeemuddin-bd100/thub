import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Calendar, Users, DollarSign, Home, MapPin, Filter } from "lucide-react";

interface SearchFiltersProps {
  filters: {
    location: string;
    checkIn: string;
    checkOut: string;
    guests: string;
    minPrice: string;
    maxPrice: string;
  };
  onFiltersChange: (filters: any) => void;
}

export default function SearchFilters({ filters, onFiltersChange }: SearchFiltersProps) {
  const handleFilterChange = (key: string, value: string | number) => {
    onFiltersChange({
      ...filters,
      [key]: value.toString(),
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      location: '',
      checkIn: '',
      checkOut: '',
      guests: '',
      minPrice: '',
      maxPrice: '',
    });
  };

  const priceRange = [
    parseInt(filters.minPrice) || 0,
    parseInt(filters.maxPrice) || 1000
  ];

  const handlePriceChange = (values: number[]) => {
    onFiltersChange({
      ...filters,
      minPrice: values[0].toString(),
      maxPrice: values[1].toString(),
    });
  };

  return (
    <Card className="p-6 sticky top-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground flex items-center" data-testid="text-filters-title">
          <Filter className="w-5 h-5 mr-2" />
          Filters
        </h2>
        <Button variant="ghost" size="sm" onClick={clearFilters} data-testid="button-clear-filters">
          Clear all
        </Button>
      </div>

      <div className="space-y-6">
        {/* Location */}
        <div>
          <Label htmlFor="location" className="flex items-center text-sm font-medium mb-2">
            <MapPin className="w-4 h-4 mr-2" />
            Location
          </Label>
          <Input
            id="location"
            data-testid="input-filter-location"
            placeholder="Where are you going?"
            value={filters.location}
            onChange={(e) => handleFilterChange('location', e.target.value)}
          />
        </div>

        <Separator />

        {/* Dates */}
        <div className="space-y-4">
          <Label className="flex items-center text-sm font-medium">
            <Calendar className="w-4 h-4 mr-2" />
            Dates
          </Label>
          <div className="space-y-2">
            <div>
              <Label htmlFor="checkin" className="text-xs text-muted-foreground">Check-in</Label>
              <Input
                id="checkin"
                data-testid="input-filter-checkin"
                type="date"
                value={filters.checkIn}
                onChange={(e) => handleFilterChange('checkIn', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <Label htmlFor="checkout" className="text-xs text-muted-foreground">Check-out</Label>
              <Input
                id="checkout"
                data-testid="input-filter-checkout"
                type="date"
                value={filters.checkOut}
                onChange={(e) => handleFilterChange('checkOut', e.target.value)}
                min={filters.checkIn || new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Guests */}
        <div>
          <Label htmlFor="guests" className="flex items-center text-sm font-medium mb-2">
            <Users className="w-4 h-4 mr-2" />
            Guests
          </Label>
          <Input
            id="guests"
            data-testid="input-filter-guests"
            type="number"
            min="1"
            max="20"
            placeholder="Number of guests"
            value={filters.guests}
            onChange={(e) => handleFilterChange('guests', e.target.value)}
          />
        </div>

        <Separator />

        {/* Price Range */}
        <div>
          <Label className="flex items-center text-sm font-medium mb-4">
            <DollarSign className="w-4 h-4 mr-2" />
            Price Range (per night)
          </Label>
          <div className="space-y-4">
            <Slider
              value={priceRange}
              onValueChange={handlePriceChange}
              max={2000}
              min={0}
              step={25}
              className="w-full"
              data-testid="slider-price-range"
            />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span data-testid="text-price-min">${priceRange[0]}</span>
              <span data-testid="text-price-max">${priceRange[1]}+</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="minPrice" className="text-xs text-muted-foreground">Min price</Label>
                <Input
                  id="minPrice"
                  data-testid="input-min-price"
                  type="number"
                  placeholder="$0"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="maxPrice" className="text-xs text-muted-foreground">Max price</Label>
                <Input
                  id="maxPrice"
                  data-testid="input-max-price"
                  type="number"
                  placeholder="$1000+"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Property Type */}
        <div>
          <Label className="flex items-center text-sm font-medium mb-3">
            <Home className="w-4 h-4 mr-2" />
            Property Type
          </Label>
          <div className="space-y-3">
            {[
              { id: 'entire-place', label: 'Entire place' },
              { id: 'private-room', label: 'Private room' },
              { id: 'shared-room', label: 'Shared room' },
              { id: 'hotel', label: 'Hotel room' },
            ].map((type) => (
              <div key={type.id} className="flex items-center space-x-2">
                <Checkbox id={type.id} data-testid={`checkbox-${type.id}`} />
                <Label htmlFor={type.id} className="text-sm">{type.label}</Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Amenities */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Amenities</Label>
          <div className="space-y-3">
            {[
              { id: 'wifi', label: 'Wifi' },
              { id: 'kitchen', label: 'Kitchen' },
              { id: 'parking', label: 'Free parking' },
              { id: 'pool', label: 'Pool' },
              { id: 'gym', label: 'Gym' },
              { id: 'spa', label: 'Hot tub' },
            ].map((amenity) => (
              <div key={amenity.id} className="flex items-center space-x-2">
                <Checkbox id={amenity.id} data-testid={`checkbox-amenity-${amenity.id}`} />
                <Label htmlFor={amenity.id} className="text-sm">{amenity.label}</Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Services Available */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Services Available</Label>
          <div className="space-y-3">
            {[
              { id: 'chef', label: 'Private chef' },
              { id: 'cleaning', label: 'Cleaning service' },
              { id: 'transport', label: 'Transportation' },
              { id: 'guide', label: 'Tour guide' },
              { id: 'spa-service', label: 'Spa services' },
            ].map((service) => (
              <div key={service.id} className="flex items-center space-x-2">
                <Checkbox id={service.id} data-testid={`checkbox-service-${service.id}`} />
                <Label htmlFor={service.id} className="text-sm">{service.label}</Label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
