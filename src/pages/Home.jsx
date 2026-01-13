import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import * as productService from '../services/productService';
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
      handleSearch(searchQuery);
    }
  }, [searchParams]);

  useEffect(() => {
    applyFilters();
  }, [products, filters]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const result = await productService.getAllProducts({ limit: 0 });
      
      if (result.success) {
        setProducts(result.data.products || []);
      } else {
        toast.error(result.error || 'Failed to load products');
      }
    } catch (err) {
      console.error('Failed to load products', err);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    if (!query || query.trim() === '') {
      setFilters(prev => ({ ...prev, search: '' }));
      return;
    }

    setLoading(true);
    try {
      const result = await productService.searchProducts(query, { limit: 0 });
      
      if (result.success) {
        setProducts(result.data.products || []);
        setFilters(prev => ({ ...prev, search: query }));
      } else {
        toast.error('Search failed');
      }
    } catch (err) {
      console.error('Search failed', err);
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    // Category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter(p => {
        const productCategory = (p.category || '').toLowerCase();
        return filters.categories.some(cat => 
          productCategory === cat.toLowerCase() || 
          productCategory.includes(cat.toLowerCase())
        );
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
          filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
          break;
        case 'name-desc':
          filtered.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
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
      <div className="bg-gradient-to-r from-primary-700 to-primary-600 text-white py-8 md:py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-4">Welcome to M&A SHOP</h1>
          <p className="text-lg md:text-xl text-white/90">Discover amazing products at great prices</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          {/* Desktop Sidebar */}
          <div className="hidden md:block w-72 flex-shrink-0">
            <Sidebar onFilterChange={handleFilterChange} filters={filters} />
          </div>

          {/* Mobile Sidebar (rendered via Sidebar component's mobile UI) */}
          <div className="md:hidden">
            <Sidebar onFilterChange={handleFilterChange} filters={filters} />
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Results Header */}
            <div className="mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                {filters.search ? `Search Results for "${filters.search}"` : 'All Products'}
              </h2>
              <p className="text-sm md:text-base text-gray-600 mt-1">
                {loading ? 'Loading...' : `${filteredProducts.length} products found`}
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center py-12 md:py-20">
                <div className="loading-spinner"></div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12 md:py-20 bg-white rounded-xl border border-gray-200">
                <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gray-100 rounded-full mb-4 md:mb-6">
                  <svg
                    className="w-8 h-8 md:w-10 md:h-10 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">No products found</h3>
                <p className="text-sm md:text-base text-gray-600 mb-4">Try adjusting your filters or search terms</p>
                <button
                  onClick={() => {
                    setFilters({
                      categories: [],
                      priceMin: null,
                      priceMax: null,
                      sortBy: '',
                      minRating: null,
                      inStock: false,
                      search: ''
                    });
                    loadProducts();
                  }}
                  className="btn-primary text-sm md:text-base"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
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