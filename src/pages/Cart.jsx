import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import db from '../utils/db.js';
import { useAuth } from '../context/AuthContext';
import confirmToast from '../utils/confirmToast.js';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleUpdateQuantity = (item, newQuantity) => {
    if (newQuantity < 1) {
      toast.error('Quantity must be at least 1');
      return;
    }
    if (item.stock && newQuantity > item.stock) {
      toast.error(`Only ${item.stock} items available`);
      return;
    }
    updateQuantity(item.id, newQuantity);
    toast.success('Quantity updated');
  };

  const handleRemoveItem = (item) => {
    confirmToast({ 
      title: 'Remove item?', 
      description: `Remove ${item.title || item.name} from cart?`, 
      confirmText: 'Remove' 
    }).then(ok => {
      if (!ok) return toast('Cancelled', { icon: '✖️' });
      removeFromCart(item.id);
      toast.success(`${item.title || item.name} removed from cart`);
    });
  };

  const handleClearCart = async () => {
    const ok = await confirmToast({ 
      title: 'Clear cart?', 
      description: 'Remove all items from cart?' 
    });
    if (!ok) return toast('Cancelled', { icon: '✖️' });
    clearCart();
    toast.success('Cart cleared');
  };

  const handleCheckout = () => {
    if (!user) {
      toast.error('Please login to checkout');
      navigate('/login', { state: { from: '/cart' } });
      return;
    }
    if (cartItems.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    const order = {
      items: cartItems,
      total: getCartTotal(),
      userId: user.id,
      timestamp: new Date().toISOString()
    };
    
    // Save order to localStorage
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));

    // Log activity
    db.logActivity({
      actor: user.username,
      type: 'checkout',
      message: `User ${user.username} placed an order`,
      details: order,
    });

    clearCart();
    toast.success('🎉 Order placed successfully!');
    navigate('/');
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-50">
        <div className="text-center animate-scale-in">
          <div className="inline-block p-8 bg-gradient-to-br from-primary-100 to-accent-100 rounded-full mb-6">
            <svg
              className="w-32 h-32 text-primary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="text-4xl font-display font-bold gradient-text mb-4">
            Your cart is empty
          </h2>
          <p className="text-gray-600 mb-8 font-medium">
            Looks like you haven't added anything yet
          </p>
          <Link to="/" className="btn-primary inline-block">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = getCartTotal();
  const tax = +(subtotal * 0.1).toFixed(2);
  const total = +(subtotal + tax).toFixed(2);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
          <p className="text-gray-600">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex gap-6">
                  <div className="w-32 h-32 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={item.thumbnail || 'https://via.placeholder.com/200'}
                      alt={item.title || item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/200?text=No+Image';
                      }}
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          {item.title || item.name}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <span className="font-medium">{item.category || 'Uncategorized'}</span>
                          {item.brand && <span>• {item.brand}</span>}
                        </div>
                        {item.stock <= 5 && item.stock > 0 && (
                          <p className="text-sm text-orange-600 font-semibold mt-1">
                            Only {item.stock} left in stock!
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item)}
                        className="text-gray-400 hover:text-red-600 transition-colors p-2"
                        aria-label="Remove item"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div>
                        <div className="text-2xl font-bold text-primary-600">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                        {item.discountPercentage > 0 && (
                          <div className="text-sm text-gray-500">
                            <span className="line-through">
                              ${((item.price / (1 - item.discountPercentage / 100)) * item.quantity).toFixed(2)}
                            </span>
                            <span className="ml-2 text-green-600 font-semibold">
                              {Math.round(item.discountPercentage)}% OFF
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                          className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                          disabled={item.quantity <= 1}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <span className="text-lg font-semibold w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                          className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                          disabled={item.stock && item.quantity >= item.stock}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={handleClearCart}
              className="w-full py-3 px-4 border-2 border-red-500 text-red-500 rounded-xl font-bold hover:bg-red-50 transition-all duration-300"
            >
              Clear Cart
            </button>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-20">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (10%)</span>
                  <span className="font-semibold">${tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-xl font-bold text-gray-900">
                    <span>Total</span>
                    <span className="text-primary-600">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {!user && (
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800 font-medium">
                    Please login to proceed with checkout
                  </p>
                </div>
              )}

              <button
                onClick={handleCheckout}
                className="w-full btn-primary text-lg py-4"
              >
                {user ? 'Proceed to Checkout' : 'Login to Checkout'}
              </button>

              <Link
                to="/"
                className="mt-6 block text-center text-primary-600 hover:text-primary-700 font-semibold"
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;