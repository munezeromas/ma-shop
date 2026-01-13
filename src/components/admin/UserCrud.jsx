import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import * as userService from '../../services/userService';
import confirmToast from '../../utils/confirmToast';

const UserCrud = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    age: '',
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const result = await userService.getAllUsers({ limit: 50 });
      
      if (result.success) {
        setUsers(result.data.users || []);
      } else {
        toast.error(result.error || 'Failed to load users');
      }
    } catch (error) {
      toast.error('Failed to load users');
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
        const result = await userService.updateUser(editingId, formData);
        if (result.success) {
          toast.success('User updated');
          
          // Update local state
          setUsers(prev => prev.map(u => 
            u.id === editingId ? { ...u, ...result.data } : u
          ));
        } else {
          toast.error(result.error || 'Failed to update user');
        }
      } else {
        const result = await userService.addUser(formData);
        if (result.success) {
          toast.success('User created');
          
          // Add to local state
          setUsers(prev => [result.data, ...prev]);
        } else {
          toast.error(result.error || 'Failed to create user');
        }
      }
      resetForm();
    } catch (error) {
      toast.error('Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingId(user.id);
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      age: user.age || '',
    });
  };

  const handleDelete = async (user) => {
    const confirmed = await confirmToast({
      title: 'Delete User',
      description: `Delete user "${user.firstName} ${user.lastName}"?`,
      confirmText: 'Delete',
    });

    if (!confirmed) return;

    setLoading(true);
    try {
      const result = await userService.deleteUser(user.id);
      if (result.success) {
        toast.success('User deleted');
        
        // Remove from local state
        setUsers(prev => prev.filter(u => u.id !== user.id));
      } else {
        toast.error(result.error || 'Failed to delete user');
      }
    } catch (error) {
      toast.error('Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      age: '',
    });
  };

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h3 className="text-xl font-bold mb-4">{editingId ? 'Edit User' : 'Create User'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">First Name *</label>
              <input
                type="text"
                className="input-field"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Last Name *</label>
              <input
                type="text"
                className="input-field"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Email *</label>
              <input
                type="email"
                className="input-field"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Phone</label>
              <input
                type="tel"
                className="input-field"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Age</label>
              <input
                type="number"
                className="input-field"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                min="1"
                max="150"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : editingId ? 'Update User' : 'Create User'}
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
        <h3 className="text-xl font-bold mb-4">Users</h3>
        {loading && !users.length ? (
          <div className="flex justify-center py-8">
            <div className="loading-spinner"></div>
          </div>
        ) : users.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No users found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Avatar</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Phone</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <img
                        src={user.image || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}`}
                        alt={`${user.firstName} ${user.lastName}`}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{user.firstName} {user.lastName}</div>
                      <div className="text-sm text-gray-500">@{user.username}</div>
                    </td>
                    <td className="px-4 py-3 text-sm">{user.email}</td>
                    <td className="px-4 py-3 text-sm">{user.phone}</td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-primary-600 hover:text-primary-800 font-medium text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user)}
                        className="text-red-600 hover:text-red-800 font-medium text-sm"
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

export default UserCrud;
