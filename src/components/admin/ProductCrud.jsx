import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import db from '../../utils/db';
import confirmToast from '../../utils/confirmToast';

const ProductCrud = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    categoryId: '',
    brand: '',
    stock: '',
    thumbnail: '',
    description: '',
    rating: 0,
    discountPercentage: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const prods = await db.listAllProducts();
      const cats = db.listCategories();
      setProducts(prods);
      setCategories(cats);
    } catch (error) {
      toast.error('Failed to load data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        await db.updateProduct(editingId, formData);
        toast.success('Product updated successfully');
      } else {
        await db.addProduct(formData);
        toast.success('Product created successfully');
      }
      resetForm();
      loadData();
    } catch (error) {
      toast.error(error.message || 'Operation failed');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name || product.title,
      price: product.price,
      categoryId: product.categoryId || '',
      brand: product.brand || '',
      stock: product.stock || 0,
      thumbnail: product.thumbnail || '',
      description: product.description || '',
      rating: product.rating || 0,
      discountPercentage: product.discountPercentage || 0,
    });
  };

  const handleDelete = async (product) => {
    const confirmed = await confirmToast({
      title: 'Delete Product',
      description: `Are you sure you want to delete "${product.name || product.title}"?`,
      confirmText: 'Delete',
    });

    if (!confirmed) return;

    setLoading(true);
    try {
      await db.removeProduct(product.id);
      toast.success('Product deleted successfully');
      loadData();
    } catch (error) {
      toast.error('Failed to delete product');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: '',
      price: '',
      categoryId: '',
      brand: '',
      stock: '',
      thumbnail: '',
      description: '',
      rating: 0,
      discountPercentage: 0,
    });
  };

  return (
    <div className="space-y-6">
      {/* Form */}
      <div className="card p-6">
        <h3 className="text-xl font-bold text-primary-700 mb-4">
          {editingId ? 'Edit Product' : 'Create New Product'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Product Name *</label>
              <input
                type="text"
                className="input-field"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="label">Price *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="input-field"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>

          <div>
  <label className="label">Category</label>
  <select
    className="input-field"
    value={formData.categoryId}
    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
  >
    <option value="">-- Select Category --</option>
    {categories.map((cat) => (
      <option key={cat.slug || cat.id} value={cat.slug || cat.id}>
        {cat.name}
      </option>
    ))}
  </select>
      </div>

            <div>
              <label className="label">Brand</label>
              <input
                type="text"
                className="input-field"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              />
            </div>

            <div>
              <label className="label">Stock *</label>
              <input
                type="number"
                min="0"
                className="input-field"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="label">Discount %</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                className="input-field"
                value={formData.discountPercentage}
                onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })}
              />
            </div>

            <div>
              <label className="label">Rating (0-5)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                className="input-field"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
              />
            </div>

            <div>
              <label className="label">Thumbnail URL</label>
              <input
                type="url"
                className="input-field"
                value={formData.thumbnail}
                onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="label">Description</label>
              <textarea
                className="input-field"
                rows="3"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : editingId ? 'Update Product' : 'Create Product'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="btn-secondary" disabled={loading}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Products List */}
      <div className="card p-6">
        <h3 className="text-xl font-bold text-primary-700 mb-4">Products</h3>
        {loading && !products.length ? (
          <div className="flex justify-center py-8">
            <div className="loading-spinner"></div>
          </div>
        ) : products.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No products found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Image</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Stock</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Source</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <img
                        src={product.thumbnail || 'https://via.placeholder.com/50'}
                        alt={product.name || product.title}
                        className="w-12 h-12 object-cover rounded"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/50';
                        }}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{product.name || product.title}</div>
                      <div className="text-sm text-gray-500">{product.brand}</div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-primary-600">
                      ${Number(product.price).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          product.stock === 0
                            ? 'bg-red-100 text-red-800'
                            : product.stock < 10
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          product.source === 'local'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {product.source || 'local'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-primary-600 hover:text-primary-800 font-medium text-sm"
                        disabled={loading}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product)}
                        className="text-red-600 hover:text-red-800 font-medium text-sm"
                        disabled={loading}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCrud;