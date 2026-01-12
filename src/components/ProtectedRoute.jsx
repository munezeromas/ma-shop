import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-50">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // DEBUG: Log user info
  console.log('ProtectedRoute - User:', user);
  console.log('ProtectedRoute - Required roles:', roles);
  console.log('ProtectedRoute - User role:', user.role);

  if (roles) {
    const allowed = Array.isArray(roles) ? roles : [roles];
    if (!user.role || !allowed.includes(user.role)) {
      console.log('ProtectedRoute - Access denied, redirecting to home');
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;