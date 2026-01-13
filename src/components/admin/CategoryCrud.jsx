import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import * as categoryService from '../../services/categoryService';

const CategoryCrud = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const result = await categoryService.getAllCategories();
      
      if (result.success) {
        setCategories(result.data || []);
      } else {
        toast.error(result.error || 'Failed to load categories');
      }
    } catch (error) {
      toast.error('Failed to load categories');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-primary-700 mb-2">Product Categories</h3>
          <p className="text-sm text-gray-600">
            Categories are fetched from the DummyJSON API and are read-only.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="loading-spinner"></div>
          </div>
        ) : categories.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No categories found</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <div
                key={category.slug}
                className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900 capitalize">{category.name}</h4>
                    <p className="text-xs text-gray-500 mt-1">Slug: {category.slug}</p>
                  </div>
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">API Information</p>
              <p>Categories are managed by DummyJSON API. You can view all available categories here, but cannot modify them directly.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryCrud;
