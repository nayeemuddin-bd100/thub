const amenities = [
  {
    id: '1',
    title: 'Private Pools',
    description: 'Relax in your own infinity pool with stunning views',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300'
  },
  {
    id: '2',
    title: 'Smart Technology',
    description: 'Control lighting, temperature, and entertainment with ease',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300'
  },
  {
    id: '3',
    title: 'Private Gym',
    description: 'Stay fit with state-of-the-art exercise equipment',
    image: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300'
  },
  {
    id: '4',
    title: 'Gourmet Kitchen',
    description: 'Professional-grade appliances for culinary enthusiasts',
    image: 'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300'
  },
];

export default function PropertyAmenities() {
  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4" data-testid="text-amenities-title">
            Premium Amenities
          </h2>
          <p className="text-lg text-muted-foreground" data-testid="text-amenities-subtitle">
            Every comfort and convenience you could want
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {amenities.map((amenity) => (
            <div key={amenity.id} className="text-center" data-testid={`card-amenity-${amenity.id}`}>
              <img 
                src={amenity.image}
                alt={amenity.title}
                className="w-full h-48 object-cover rounded-2xl mb-4"
              />
              <h3 className="text-xl font-semibold text-foreground mb-2" data-testid={`text-amenity-title-${amenity.id}`}>
                {amenity.title}
              </h3>
              <p className="text-muted-foreground" data-testid={`text-amenity-description-${amenity.id}`}>
                {amenity.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
