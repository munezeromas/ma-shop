import { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://dummyjson.com/products/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryProducts = async (category) => {
    setProductsLoading(true);
    setSelectedCategory(category);
    try {
      const response = await axios.get(`https://dummyjson.com/products/category/${category.slug}`);
      setProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching category products:', error);
    } finally {
      setProductsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-primary-700 to-primary-600 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold mb-4">Browse Categories</h1>
          <p className="text-xl text-white/90">Explore our carefully curated collections</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-12">
            {categories.map((category) => (
              <button
                key={category.slug}
                onClick={() => fetchCategoryProducts(category)}
                className={`p-6 rounded-xl text-center transition-all font-semibold ${
                  selectedCategory?.slug === category.slug
                    ? 'bg-primary-600 text-white shadow-xl scale-105'
                    : 'bg-white border-2 border-gray-200 text-gray-900 hover:border-primary-600 hover:shadow-lg'
                }`}
              >
                <h3 className="text-lg capitalize">
                  {category.name}
                </h3>
              </button>
            ))}
          </div>
        )}

        {selectedCategory && (
          <div className="mt-12">
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-gray-900 capitalize mb-2">
                {selectedCategory.name}
              </h2>
              <p className="text-gray-600 text-lg">{products.length} products available</p>
            </div>

            {productsLoading ? (
              <div className="flex justify-center py-20">
                <div className="loading-spinner"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        )}

        {!selectedCategory && !loading && (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-100 rounded-full mb-6">
              <svg
                className="w-10 h-10 text-primary-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Select a Category</h3>
            <p className="text-gray-600">Choose from our collection above to view products</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;
