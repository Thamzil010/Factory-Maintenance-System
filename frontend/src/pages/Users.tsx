import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Modal } from '../components/Modal';

const Users = () => {
  const [users, setUsers] = useState<any[]>([]);
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'TECHNICIAN' });

  const fetchUsers = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get('${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users', error);
    }
  };

  useEffect(() => {
    if (currentUser.role === 'ADMIN') {
      fetchUsers();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      await axios.post('${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/users', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsModalOpen(false);
      setFormData({ name: '', email: '', password: '', role: 'TECHNICIAN' });
      fetchUsers();
    } catch (error) {
      alert('Error creating user');
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm('Delete this user?')) return;
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/users/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchUsers();
    } catch (error) {
      alert('Error deleting user. Make sure they do not have active maintenance tasks.');
    }
  };

  if (currentUser.role !== 'ADMIN') {
    return <div className="p-6 text-red-600 font-bold">Admin access required to view this page.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Users</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700">Add User</button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((u: any) => (
              <tr key={u.id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{u.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                  {currentUser.id !== u.id && (
                    <button onClick={() => handleDelete(u.id)} className="text-red-600 hover:text-red-900">Delete</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add User">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700">Name</label><input required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
          <div><label className="block text-sm font-medium text-gray-700">Email</label><input required type="email" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
          <div><label className="block text-sm font-medium text-gray-700">Password</label><input required type="password" minLength={6} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} /></div>
          <div><label className="block text-sm font-medium text-gray-700">Role</label>
            <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
              <option value="ADMIN">ADMIN</option>
              <option value="TECHNICIAN">TECHNICIAN</option>
              <option value="MANAGER">MANAGER</option>
            </select>
          </div>
          <div className="pt-4 flex justify-end"><button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700">Save User</button></div>
        </form>
      </Modal>
    </div>
  );
};

export default Users;
