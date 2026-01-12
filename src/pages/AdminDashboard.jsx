import { useState, useEffect } from 'react';
import ProductCrud from '../components/admin/ProductCrud';
import CategoryCrud from '../components/admin/CategoryCrud';
import UserCrud from '../components/admin/UserCrud';
import ActivityLog from '../components/admin/ActivityLog';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const tabs = ['Products', 'Categories', 'Users', 'Activity'];
  const [tab, setTab] = useState('Products');
  const { user } = useAuth();

  useEffect(() => {
    document.title = 'Admin Dashboard - M&A SHOP';
  }, []);
console.log('ProductCrud', ProductCrud, typeof ProductCrud, Object.keys(ProductCrud || {}));
console.log('CategoryCrud', CategoryCrud, typeof CategoryCrud, Object.keys(CategoryCrud || {}));
console.log('UserCrud', UserCrud, typeof UserCrud, Object.keys(UserCrud || {}));
console.log('ActivityLog', ActivityLog, typeof ActivityLog, Object.keys(ActivityLog || {}));
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="text-sm text-gray-600">Signed in as <strong>{user.firstName} {user.lastName}</strong> ({user.username})</div>
      </div>

      <div className="mb-6">
        <div className="flex space-x-2">
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded ${tab === t ? 'bg-primary-600 text-white' : 'bg-gray-100'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {tab === 'Products' && <ProductCrud />}
        {tab === 'Categories' && <CategoryCrud />}
        {tab === 'Users' && <UserCrud />}
        {tab === 'Activity' && <ActivityLog />}
      </div>
    </div>
  );
};

export default AdminDashboard;