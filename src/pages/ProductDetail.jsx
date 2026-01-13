import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import * as productService from '../services/productService';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const result = await productService.getProductById(id);
      
      if (result.success) {
        console.log('Product loaded:', result.data); // Debug log
        setProduct(result.data);
      } else {
        toast.error('Product not found');
        navigate('/');
      }
    } catch (err) {
      console.error('Failed to load product', err);
      toast.error('Failed to load product');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    const productWithQuantity = { ...product, quantity };
    addToCart(productWithQuantity);
    toast.success(`${quantity} × ${product.title} added to cart!`);
  };

  const handleWishlistToggle = () => {
    if (!user) {
      toast.error('Please login to add items to wishlist');
      navigate('/login');
      return;
    }
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist(product);
      toast.success(`${product.title} added to wishlist!`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  // Handle images - DummyJSON API returns images array
  const allImages = [];
  
  // Add thumbnail first
  if (product.thumbnail) {
    allImages.push(product.thumbnail);
  }
  
  // Add other images from images array
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    product.images.forEach(img => {
      // Don't duplicate if it's the same as thumbnail
      if (img !== product.thumbnail && !allImages.includes(img)) {
        allImages.push(img);
      }
    });
  }
  
  const images = allImages.length > 0 ? allImages : [product.thumbnail || 'https://via.placeholder.com/600'];
  
  const discountedPrice = product.discountPercentage > 0
    ? product.price / (1 - product.discountPercentage / 100)
    : null;

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="mb-4 sm:mb-8 text-xs sm:text-sm">
          <ol className="flex items-center space-x-2 text-gray-600">
            <li>
              <Link to="/" className="hover:text-primary-600">Home</Link>
            </li>
            <li>›</li>
            <li className="capitalize">{product.category}</li>
            <li>›</li>
            <li className="text-gray-900 truncate max-w-[150px] sm:max-w-none">{product.title}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
          {/* Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="bg-white rounded-xl overflow-hidden border border-gray-200 aspect-square">
              <img
                src={images[selectedImage]}
                alt={product.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/600?text=No+Image';
                }}
              />
            </div>

            {/* Thumbnail Gallery - Only show if more than 1 image */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-4">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? 'border-primary-600 scale-105'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
            
            {/* Debug info - Remove in production */}
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-gray-500 p-2 bg-gray-100 rounded">
                Total images: {images.length}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-4 sm:space-y-6">
            {/* Category & Brand */}
            <div className="flex items-center gap-3 text-xs sm:text-sm">
              <span className="px-2 sm:px-3 py-1 bg-primary-100 text-primary-700 rounded-full font-semibold uppercase">
                {product.category}
              </span>
              {product.brand && (
                <span className="text-gray-600">Brand: {product.brand}</span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
              {product.title}
            </h1>

            {/* Rating & Stock */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-4 h-4 sm:w-5 sm:h-5 ${
                      i < Math.round(product.rating)
                        ? 'text-yellow-500'
                        : 'text-gray-300'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="ml-2 text-sm sm:text-base font-medium text-gray-700">
                  {product.rating.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${
                  product.stock === 0
                    ? 'bg-red-100 text-red-700'
                    : product.stock < 10
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {product.stock === 0 ? 'Out of Stock' : `${product.stock} in stock`}
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="border-t border-b py-4 sm:py-6">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-600">
                  ${product.price.toFixed(2)}
                </span>
                {discountedPrice && (
                  <>
                    <span className="text-lg sm:text-xl text-gray-500 line-through">
                      ${discountedPrice.toFixed(2)}
                    </span>
                    <span className="px-2 py-1 bg-red-600 text-white text-xs sm:text-sm font-bold rounded">
                      {Math.round(product.discountPercentage)}% OFF
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">Description</h2>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Quantity Selector */}
            <div>
              <label className="block text-sm sm:text-base font-semibold text-gray-900 mb-2">
                Quantity
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                  disabled={quantity <= 1}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <span className="text-xl sm:text-2xl font-bold w-12 sm:w-16 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                  disabled={quantity >= product.stock}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 btn-primary py-3 sm:py-4 text-base sm:text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <button
                onClick={handleWishlistToggle}
                className="sm:w-14 sm:h-14 w-full py-3 sm:py-0 border-2 border-primary-600 text-primary-600 rounded-xl hover:bg-primary-50 transition-colors flex items-center justify-center"
              >
                <svg
                  className={`w-6 h-6 ${
                    isInWishlist(product.id) ? 'fill-primary-600' : 'fill-none'
                  }`}
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="sm:hidden ml-2">Add to Wishlist</span>
              </button>
            </div>

            {/* Additional Info */}
            <div className="bg-gray-100 rounded-xl p-4 sm:p-6 space-y-3 text-xs sm:text-sm">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Free shipping on orders over $50</span>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Easy 30-day returns</span>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Secure checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;