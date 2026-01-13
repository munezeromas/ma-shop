import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import * as productService from '../../services/productService';
import * as categoryService from '../../services/categoryService';
import confirmToast from '../../utils/confirmToast';

const ProductCrud = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    category: '',
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
      const prodsResult = await productService.getAllProducts({ limit: 0 });
      if (prodsResult.success) {
        setProducts(prodsResult.data.products || []);
      }

      const catsResult = await categoryService.getAllCategories();
      if (catsResult.success) {
        setCategories(catsResult.data || []);
      }
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
        const result = await productService.updateProduct(editingId, formData);
        if (result.success) {
          toast.success('Product updated');
          setProducts(prev => prev.map(p => p.id === editingId ? { ...p, ...result.data } : p));
        } else {
          toast.error(result.error);
        }
      } else {
        const result = await productService.addProduct(formData);
        if (result.success) {
          toast.success('Product created');
          setProducts(prev => [result.data, ...prev]);
        } else {
          toast.error(result.error);
        }
      }
      resetForm();
    } catch (error) {
      toast.error('Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setFormData({
      title: product.title || '',
      price: product.price || '',
      category: product.category || '',
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
      description: `Delete "${product.title}"?`,
      confirmText: 'Delete',
    });
    if (!confirmed) return;

    setLoading(true);
    try {
      const result = await productService.deleteProduct(product.id);
      if (result.success) {
        toast.success('Product deleted');
        setProducts(prev => prev.filter(p => p.id !== product.id));
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Failed to delete');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title: '',
      price: '',
      category: '',
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
      <div className="card p-6">
        <h3 className="text-xl font-bold text-primary-700 mb-4">
          {editingId ? 'Edit Product' : 'Create Product'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Product Name *</label>
              <input type="text" className="input-field" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
            </div>
            <div>
              <label className="label">Price *</label>
              <input type="number" step="0.01" min="0" className="input-field" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
            </div>
            <div>
              <label className="label">Category</label>
              <select className="input-field" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                <option value="">-- Select --</option>
                {categories.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Brand</label>
              <input type="text" className="input-field" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} />
            </div>
            <div>
              <label className="label">Stock *</label>
              <input type="number" min="0" className="input-field" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} required />
            </div>
            <div>
              <label className="label">Discount %</label>
              <input type="number" step="0.01" min="0" max="100" className="input-field" value={formData.discountPercentage} onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })} />
            </div>
            <div>
              <label className="label">Rating (0-5)</label>
              <input type="number" step="0.1" min="0" max="5" className="input-field" value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: e.target.value })} />
            </div>
            <div>
              <label className="label">Thumbnail URL</label>
              <input type="url" className="input-field" value={formData.thumbnail} onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })} placeholder="https://..." />
            </div>
            <div className="md:col-span-2">
              <label className="label">Description</label>
              <textarea className="input-field" rows="3" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving...' : editingId ? 'Update' : 'Create'}</button>
            {editingId && <button type="button" onClick={resetForm} className="btn-secondary" disabled={loading}>Cancel</button>}
          </div>
        </form>
      </div>

      <div className="card p-6">
        <h3 className="text-xl font-bold text-primary-700 mb-4">Products</h3>
        {loading && !products.length ? (
          <div className="flex justify-center py-8"><div className="loading-spinner"></div></div>
        ) : products.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No products</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Image</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Stock</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3"><img src={p.thumbnail || 'https://placehold.co/50'} alt={p.title} className="w-12 h-12 object-cover rounded" onError={(e) => e.target.src = 'https://placehold.co/50'} /></td>
                    <td className="px-4 py-3"><div className="font-medium">{p.title}</div><div className="text-sm text-gray-500">{p.brand}</div></td>
                    <td className="px-4 py-3 font-semibold text-primary-600">${Number(p.price).toFixed(2)}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 text-xs rounded-full ${p.stock === 0 ? 'bg-red-100 text-red-800' : p.stock < 10 ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>{p.stock}</span></td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button onClick={() => handleEdit(p)} className="text-primary-600 hover:text-primary-800 text-sm font-medium">Edit</button>
                      <button onClick={() => handleDelete(p)} className="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
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
