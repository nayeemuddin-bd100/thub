import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Luggage, Home, Star, Settings } from "lucide-react";

const roles = [
  {
    id: 'client',
    title: 'Traveler',
    description: 'Book accommodations and services for unforgettable trips',
    icon: Luggage,
    buttonText: 'Start Traveling',
    buttonVariant: 'default' as const,
    color: 'primary'
  },
  {
    id: 'property_owner',
    title: 'Property Owner',
    description: 'List your property and earn passive income',
    icon: Home,
    buttonText: 'List Property',
    buttonVariant: 'secondary' as const,
    color: 'accent'
  },
  {
    id: 'service_provider',
    title: 'Service Provider',
    description: 'Offer your expertise to travelers worldwide',
    icon: Star,
    buttonText: 'Become Provider',
    buttonVariant: 'secondary' as const,
    color: 'secondary'
  },
  {
    id: 'admin',
    title: 'Platform Admin',
    description: 'Manage platform operations and quality',
    icon: Settings,
    buttonText: 'Invitation Only',
    buttonVariant: 'outline' as const,
    color: 'muted',
    disabled: true
  },
];

export default function UserRoles() {
  const handleRoleClick = (roleId: string) => {
    if (roleId === 'admin') return;
    window.location.href = '/login';
  };

  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4" data-testid="text-user-roles-title">
            Join Our Community
          </h2>
          <p className="text-lg text-muted-foreground" data-testid="text-user-roles-subtitle">
            Whether you're traveling, hosting, or providing services
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roles.map((role) => {
            const IconComponent = role.icon;
            
            return (
              <Card 
                key={role.id}
                data-testid={`card-role-${role.id}`}
                className="bg-card rounded-2xl p-6 border border-border text-center"
              >
                <div className={`w-16 h-16 bg-${role.color}/10 rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <IconComponent className={`text-${role.color === 'muted' ? 'muted-foreground' : role.color} w-8 h-8`} />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3" data-testid={`text-role-title-${role.id}`}>
                  {role.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4" data-testid={`text-role-description-${role.id}`}>
                  {role.description}
                </p>
                <Button 
                  data-testid={`button-role-${role.id}`}
                  variant={role.buttonVariant}
                  className="w-full"
                  disabled={role.disabled}
                  onClick={() => handleRoleClick(role.id)}
                >
                  {role.buttonText}
                </Button>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
