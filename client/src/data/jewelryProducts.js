// Jewelry Products Data
// Products will be managed through the admin panel

export const jewelryProducts = [];

// Helper functions
export const getFeaturedProducts = () => {
  return jewelryProducts.filter(product => product.featured);
};

export const getProductsByCategory = (category) => {
  return jewelryProducts.filter(product => product.category === category);
};

export const getProductById = (id) => {
  return jewelryProducts.find(product => product.id === id);
};

export const getRandomProducts = (count = 4) => {
  const shuffled = [...jewelryProducts].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
