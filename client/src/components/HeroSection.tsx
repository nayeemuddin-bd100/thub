import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";
import { Link } from "wouter";

export default function HeroSection() {
  const [searchData, setSearchData] = useState({
    location: '',
    checkIn: '',
    checkOut: '',
    guests: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setSearchData(prev => ({ ...prev, [field]: value }));
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchData.location) params.append('location', searchData.location);
    if (searchData.checkIn) params.append('checkIn', searchData.checkIn);
    if (searchData.checkOut) params.append('checkOut', searchData.checkOut);
    if (searchData.guests) params.append('guests', searchData.guests);
    
    window.location.href = `/properties?${params.toString()}`;
  };

  return (
    <section className="relative">
      {/* Hero Background Image */}
      <div className="h-[600px] sm:h-[550px] md:h-[500px] relative overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2071&h=1000" 
          alt="Luxury villa with infinity pool" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/40"></div>
      </div>

      {/* Hero Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight" data-testid="text-hero-title">
            Your Complete Travel Ecosystem
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 text-white/90 px-2" data-testid="text-hero-subtitle">
            Book stunning accommodations and curated experiences in one seamless platform
          </p>
          
          {/* Search Widget */}
          <div className="floating-search bg-card rounded-2xl p-4 sm:p-6 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-left">
                <Label className="block text-sm font-medium text-muted-foreground mb-1">Where</Label>
                <Input
                  data-testid="input-location"
                  type="text"
                  placeholder="Search destinations"
                  value={searchData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="border-0 bg-transparent text-foreground placeholder-muted-foreground focus:outline-none focus:ring-0"
                />
              </div>
              <div className="text-left">
                <Label className="block text-sm font-medium text-muted-foreground mb-1">Check-in</Label>
                <Input
                  data-testid="input-checkin"
                  type="date"
                  value={searchData.checkIn}
                  onChange={(e) => handleInputChange('checkIn', e.target.value)}
                  className="border-0 bg-transparent text-foreground focus:outline-none focus:ring-0"
                />
              </div>
              <div className="text-left">
                <Label className="block text-sm font-medium text-muted-foreground mb-1">Check-out</Label>
                <Input
                  data-testid="input-checkout"
                  type="date"
                  value={searchData.checkOut}
                  onChange={(e) => handleInputChange('checkOut', e.target.value)}
                  className="border-0 bg-transparent text-foreground focus:outline-none focus:ring-0"
                />
              </div>
              <div className="flex items-end">
                <Button 
                  data-testid="button-search"
                  onClick={handleSearch}
                  className="w-full bg-primary text-primary-foreground py-3 px-6 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
