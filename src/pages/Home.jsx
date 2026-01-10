import { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('');
  const [order, setOrder] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [sortBy, order]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = 'https://dummyjson.com/products?limit=100';
      if (sortBy) {
        url += `&sortBy=${sortBy}&order=${order}`;
      }
      const response = await axios.get(url);
      setProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setOrder('asc');
    }
  };

  const filteredProducts = products.filter((product) =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-primary-700 to-primary-600 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold mb-4">Welcome to M&A SHOP</h1>
          <p className="text-xl text-white/90 mb-8">Discover our premium collection of products</p>
          <div className="max-w-2xl">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-6 py-4 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white/30 shadow-lg text-lg"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">All Products</h2>
            <p className="text-gray-600">{filteredProducts.length} products available</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => handleSort('price')}
              className={`px-5 py-2.5 rounded-lg font-semibold transition-all ${
                sortBy === 'price'
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-primary-600'
              }`}
            >
              Price {sortBy === 'price' && (order === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => handleSort('title')}
              className={`px-5 py-2.5 rounded-lg font-semibold transition-all ${
                sortBy === 'title'
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-primary-600'
              }`}
            >
              Name {sortBy === 'title' && (order === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => handleSort('rating')}
              className={`px-5 py-2.5 rounded-lg font-semibold transition-all ${
                sortBy === 'rating'
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-primary-600'
              }`}
            >
              Rating {sortBy === 'rating' && (order === 'asc' ? '↑' : '↓')}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-xl text-gray-600">No products found matching your search</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
