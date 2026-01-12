import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import db from '../utils/db';
import ProductCard from '../components/ProductCard';
import Sidebar from '../components/Sidebar';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    categories: [],
    priceMin: null,
    priceMax: null,
    sortBy: '',
    minRating: null,
    inStock: false,
    search: ''
  });
  const [searchParams] = useSearchParams();

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    const searchQuery = searchParams.get('search');
    if (searchQuery) {
      setFilters(prev => ({ ...prev, search: searchQuery }));
    }
  }, [searchParams]);

  useEffect(() => {
    applyFilters();
  }, [products, filters]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const all = await db.listAllProducts();
      setProducts(all);
    } catch (err) {
      console.error('Failed to load products', err);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(p => 
        (p.title || p.name || '').toLowerCase().includes(searchLower) ||
        (p.description || '').toLowerCase().includes(searchLower) ||
        (p.brand || '').toLowerCase().includes(searchLower) ||
        (p.category || '').toLowerCase().includes(searchLower)
      );
    }

    // Category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter(p => {
        const categoryMatch = filters.categories.includes(p.categoryId);
        // Also check by category name for remote products
        const cats = db.listCategories();
        const categoryNames = filters.categories.map(id => {
          const cat = cats.find(c => c.id === id);
          return cat ? cat.name.toLowerCase() : '';
        });
        const productCategoryLower = (p.category || '').toLowerCase();
        return categoryMatch || categoryNames.some(name => productCategoryLower.includes(name) || name.includes(productCategoryLower));
      });
    }

    // Price filter
    if (filters.priceMin !== null) {
      filtered = filtered.filter(p => (p.price || 0) >= filters.priceMin);
    }
    if (filters.priceMax !== null) {
      filtered = filtered.filter(p => (p.price || 0) <= filters.priceMax);
    }

    // Rating filter
    if (filters.minRating) {
      filtered = filtered.filter(p => (p.rating || 0) >= filters.minRating);
    }

    // Stock filter
    if (filters.inStock) {
      filtered = filtered.filter(p => (p.stock || 0) > 0);
    }

    // Sorting
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'price-asc':
          filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
          break;
        case 'price-desc':
          filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
          break;
        case 'name-asc':
          filtered.sort((a, b) => (a.title || a.name || '').localeCompare(b.title || b.name || ''));
          break;
        case 'name-desc':
          filtered.sort((a, b) => (b.title || b.name || '').localeCompare(a.title || a.name || ''));
          break;
        case 'rating-desc':
          filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        case 'discount-desc':
          filtered.sort((a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0));
          break;
        default:
          break;
      }
    }

    setFilteredProducts(filtered);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-700 to-primary-600 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to M&A SHOP</h1>
          <p className="text-xl text-white/90">Discover amazing products at great prices</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-72 flex-shrink-0 hidden md:block">
            <Sidebar onFilterChange={handleFilterChange} filters={filters} />
          </div>

          {/* Mobile Sidebar */}
          <div className="md:hidden">
            <Sidebar onFilterChange={handleFilterChange} filters={filters} />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {filters.search ? `Search Results for "${filters.search}"` : 'All Products'}
                </h2>
                <p className="text-gray-600 mt-1">
                  {loading ? 'Loading...' : `${filteredProducts.length} products found`}
                </p>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="loading-spinner"></div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
                  <svg
                    className="w-10 h-10 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your filters or search terms</p>
                <button
                  onClick={() => setFilters({
                    categories: [],
                    priceMin: null,
                    priceMax: null,
                    sortBy: '',
                    minRating: null,
                    inStock: false,
                    search: ''
                  })}
                  className="btn-primary"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;