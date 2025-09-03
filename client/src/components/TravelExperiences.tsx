import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";

const experiences = [
  {
    id: '1',
    title: 'Private Wine Tasting',
    description: 'Exclusive vineyard tour with expert sommelier',
    price: 150,
    rating: 4.9,
    reviews: 127,
    image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400'
  },
  {
    id: '2',
    title: 'Authentic Cooking Class',
    description: 'Learn traditional recipes from local chefs',
    price: 85,
    rating: 4.8,
    reviews: 89,
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400'
  },
  {
    id: '3',
    title: 'Rock Climbing Adventure',
    description: 'Guided climbing with all equipment included',
    price: 120,
    rating: 4.7,
    reviews: 203,
    image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400'
  },
  {
    id: '4',
    title: 'Historical Walking Tour',
    description: 'Discover ancient architecture and local stories',
    price: 45,
    rating: 4.6,
    reviews: 156,
    image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73a0e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400'
  },
  {
    id: '5',
    title: 'Surfing Lessons',
    description: 'Professional instruction for all skill levels',
    price: 95,
    rating: 4.8,
    reviews: 94,
    image: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400'
  },
  {
    id: '6',
    title: 'Watercolor Workshop',
    description: 'Create beautiful landscape paintings',
    price: 65,
    rating: 4.9,
    reviews: 73,
    image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400'
  },
];

export default function TravelExperiences() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4" data-testid="text-experiences-title">
            Curated Experiences
          </h2>
          <p className="text-lg text-muted-foreground" data-testid="text-experiences-subtitle">
            Unique activities and adventures for every traveler
          </p>
        </div>

        <div className="carousel-scroll flex space-x-6 overflow-x-auto pb-4">
          {experiences.map((experience) => (
            <Card 
              key={experience.id}
              data-testid={`card-experience-${experience.id}`}
              className="flex-none w-80 bg-card rounded-2xl overflow-hidden border border-border cursor-pointer hover:shadow-md transition-all"
            >
              <img 
                src={experience.image}
                alt={experience.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="font-semibold text-foreground mb-2" data-testid={`text-experience-title-${experience.id}`}>
                  {experience.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-3" data-testid={`text-experience-description-${experience.id}`}>
                  {experience.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-foreground" data-testid={`text-experience-price-${experience.id}`}>
                    ${experience.price}/person
                  </span>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm" data-testid={`text-experience-rating-${experience.id}`}>
                      {experience.rating} ({experience.reviews} reviews)
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
