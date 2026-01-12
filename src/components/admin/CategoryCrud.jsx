import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import db from '../../utils/db';
import confirmToast from '../../utils/confirmToast';

const CategoryCrud = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '' });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = () => {
    try {
      const cats = db.listCategories();
      setCategories(cats);
    } catch (error) {
      toast.error('Failed to load categories');
      console.error(error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        db.updateCategory(editingId, { name: formData.name });
        toast.success('Category updated');
      } else {
        db.addCategory({ name: formData.name });
        toast.success('Category created');
      }
      resetForm();
      loadCategories();
    } catch (error) {
      toast.error(error.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category) => {
    setEditingId(category.id);
    setFormData({ name: category.name });
  };

  const handleDelete = async (category) => {
    const confirmed = await confirmToast({
      title: 'Delete Category',
      description: `Delete "${category.name}"?`,
      confirmText: 'Delete',
    });

    if (!confirmed) return;

    try {
      db.removeCategory(category.id);
      toast.success('Category deleted');
      loadCategories();
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: '' });
  };

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h3 className="text-xl font-bold mb-4">{editingId ? 'Edit Category' : 'Create Category'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Category Name *</label>
            <input
              type="text"
              className="input-field"
              value={formData.name}
              onChange={(e) => setFormData({ name: e.target.value })}
              placeholder="e.g., Electronics"
              required
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : editingId ? 'Update' : 'Create'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="btn-secondary">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card p-6">
        <h3 className="text-xl font-bold mb-4">Categories</h3>
        {categories.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No categories found</p>
        ) : (
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="font-medium">{category.name}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="text-primary-600 hover:text-primary-800 font-medium text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(category)}
                    className="text-red-600 hover:text-red-800 font-medium text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryCrud;