import { Card } from "@/components/ui/card";
import { Headphones, Shield, Lock } from "lucide-react";

const trustFeatures = [
  {
    id: '1',
    title: '24/7 Support',
    description: 'Round-the-clock assistance in multiple languages whenever you need help',
    icon: Headphones,
    color: 'primary'
  },
  {
    id: '2',
    title: 'Verified Providers',
    description: 'All service providers are thoroughly vetted with background checks and certifications',
    icon: Shield,
    color: 'accent'
  },
  {
    id: '3',
    title: 'Secure Payments',
    description: 'End-to-end encrypted transactions with flexible cancellation policies',
    icon: Lock,
    color: 'secondary'
  },
];

const stats = [
  { label: 'Happy Travelers', value: '50K+', color: 'primary' },
  { label: 'Properties', value: '10K+', color: 'accent' },
  { label: 'Service Providers', value: '5K+', color: 'secondary' },
  { label: 'Average Rating', value: '4.9', color: 'primary' },
];

export default function TrustSignals() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4" data-testid="text-trust-title">
            Travel with Confidence
          </h2>
          <p className="text-lg text-muted-foreground" data-testid="text-trust-subtitle">
            Your safety and satisfaction are our top priorities
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {trustFeatures.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <Card 
                key={feature.id}
                data-testid={`card-trust-${feature.id}`}
                className="bg-card rounded-2xl p-8 text-center border border-border"
              >
                <div className={`w-16 h-16 bg-${feature.color}/10 rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <IconComponent className={`text-${feature.color} w-8 h-8`} />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3" data-testid={`text-trust-feature-title-${feature.id}`}>
                  {feature.title}
                </h3>
                <p className="text-muted-foreground" data-testid={`text-trust-feature-description-${feature.id}`}>
                  {feature.description}
                </p>
              </Card>
            );
          })}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center" data-testid={`stat-${index}`}>
              <div className={`text-3xl md:text-4xl font-bold text-${stat.color} mb-2`} data-testid={`stat-value-${index}`}>
                {stat.value}
              </div>
              <div className="text-muted-foreground" data-testid={`stat-label-${index}`}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
