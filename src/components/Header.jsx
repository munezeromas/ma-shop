import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import SearchBar from './SearchBar';
import db from '../utils/db';

const Header = () => {
  const { user, logout } = useAuth();
  const { getCartCount } = useCart();
  const { wishlistItems } = useWishlist();
  const navigate = useNavigate();

  const handleSearch = (query) => {
    // Search will be handled by Home component via URL params
    navigate(`/?search=${encodeURIComponent(query)}`);
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const avatarUrl = user ? (user.avatar || db.getAvatarUrl(user.username)) : null;

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="flex items-center justify-center w-10 h-10 bg-primary-600 rounded-lg group-hover:bg-primary-700 transition-colors">
              <img src="/logo.svg" alt="M&A SHOP" className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900">M&A SHOP</span>
              <p className="text-xs text-gray-500">Your shop</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">Shop</Link>
            <Link to="/categories" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">Categories</Link>
            {/* Only show admin dashboard link to admin users */}
            {user && user.role === 'admin' && (
              <Link to="/admin" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">Dashboard</Link>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            <SearchBar onSearch={handleSearch} />

            <Link to="/wishlist" className="relative p-2 text-gray-700 hover:text-primary-600 transition-colors" aria-label="Wishlist">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {wishlistItems.length > 0 && <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{wishlistItems.length}</span>}
            </Link>

            <Link to="/cart" className="relative p-2 text-gray-700 hover:text-primary-600 transition-colors" aria-label="Shopping Cart">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              {getCartCount() > 0 && <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{getCartCount()}</span>}
            </Link>

            {user ? (
              <div className="flex items-center space-x-3 ml-2">
                <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 bg-primary-50 rounded-lg">
                  <img src={avatarUrl} alt={user.username} className="w-8 h-8 rounded-full object-cover" />
                  <span className="text-sm font-semibold text-gray-900">{user.firstName} {user.lastName}</span>
                  {user.role === 'admin' && <span className="ml-2 text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded">admin</span>}
                </div>
                <button onClick={handleLogout} className="text-gray-700 hover:text-red-600 font-medium transition-colors px-3 py-1.5 hover:bg-red-50 rounded-lg">Logout</button>
              </div>
            ) : (
              <Link to="/login" className="btn-primary text-sm py-2 px-6">Login</Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;