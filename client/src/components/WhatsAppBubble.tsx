import { useState } from "react";
import { SiWhatsapp } from "react-icons/si";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function WhatsAppBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const businessNumber = "18495815558";
  const businessName = "TravelHub";

  const handleWhatsAppClick = () => {
    const message = `Hi! I need help with TravelHub.`;
    window.open(
      `https://api.whatsapp.com/send?phone=${businessNumber}&text=${encodeURIComponent(message)}`,
      '_blank'
    );
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating bubble - positioned to the left of Quick Book button */}
      <div className="fixed bottom-6 right-24 z-50">
        {isOpen && (
          <Card className="mb-4 p-4 w-64 shadow-lg animate-in slide-in-from-bottom-2">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                  <SiWhatsapp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{businessName}</h3>
                  <p className="text-xs text-muted-foreground">Typically replies instantly</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsOpen(false)}
                data-testid="button-close-whatsapp-bubble"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Chat with us on WhatsApp for quick support!
            </p>
            <Button
              onClick={handleWhatsAppClick}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              data-testid="button-start-whatsapp-chat"
            >
              <SiWhatsapp className="w-4 h-4 mr-2" />
              Start Chat
            </Button>
          </Card>
        )}
        
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="h-14 w-14 rounded-full bg-green-600 hover:bg-green-700 shadow-lg"
          data-testid="button-whatsapp-bubble"
        >
          <SiWhatsapp className="w-6 h-6 text-white" />
        </Button>
      </div>
    </>
  );
}
