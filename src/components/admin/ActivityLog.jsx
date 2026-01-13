import { useState, useEffect } from 'react';

// Helper function to get activities from localStorage
const getActivities = () => {
  try {
    const raw = localStorage.getItem('ma_shop_activities');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const ActivityLog = () => {
  const [activities, setActivities] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = () => {
    try {
      const logs = getActivities();
      setActivities(logs);
    } catch (error) {
      console.error('Failed to load activities:', error);
    }
  };

  const filteredActivities = filter === 'all' 
    ? activities 
    : activities.filter(a => a.type?.includes(filter));

  const getActivityIcon = (type) => {
    if (type?.includes('login')) return '🔐';
    if (type?.includes('product')) return '📦';
    if (type?.includes('user')) return '👤';
    if (type?.includes('category')) return '📁';
    if (type?.includes('checkout')) return '💳';
    return '📋';
  };

  const getActivityColor = (type) => {
    if (type?.includes('delete')) return 'text-red-600 bg-red-50';
    if (type?.includes('create') || type?.includes('add')) return 'text-green-600 bg-green-50';
    if (type?.includes('update')) return 'text-blue-600 bg-blue-50';
    if (type?.includes('login')) return 'text-purple-600 bg-purple-50';
    if (type?.includes('checkout')) return 'text-orange-600 bg-orange-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Activity Log</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded text-sm ${filter === 'all' ? 'bg-primary-600 text-white' : 'bg-gray-100'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('login')}
            className={`px-3 py-1 rounded text-sm ${filter === 'login' ? 'bg-primary-600 text-white' : 'bg-gray-100'}`}
          >
            Login
          </button>
          <button
            onClick={() => setFilter('product')}
            className={`px-3 py-1 rounded text-sm ${filter === 'product' ? 'bg-primary-600 text-white' : 'bg-gray-100'}`}
          >
            Products
          </button>
          <button
            onClick={() => setFilter('user')}
            className={`px-3 py-1 rounded text-sm ${filter === 'user' ? 'bg-primary-600 text-white' : 'bg-gray-100'}`}
          >
            Users
          </button>
        </div>
      </div>

      {filteredActivities.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="font-medium">No activities found</p>
          <p className="text-sm mt-2">Activities will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredActivities.map((activity) => (
            <div
              key={activity.id}
              className={`p-4 rounded-lg border ${getActivityColor(activity.type)}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{getActivityIcon(activity.type)}</span>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{activity.message}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <span>👤 {activity.actor}</span>
                    <span>📅 {new Date(activity.timestamp).toLocaleString()}</span>
                    {activity.type && (
                      <span className="px-2 py-0.5 bg-white rounded text-xs font-semibold">
                        {activity.type}
                      </span>
                    )}
                  </div>
                  {activity.details && (
                    <details className="mt-2">
                      <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-900">
                        View details
                      </summary>
                      <pre className="mt-2 p-2 bg-white rounded text-xs overflow-x-auto">
                        {JSON.stringify(activity.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityLog;