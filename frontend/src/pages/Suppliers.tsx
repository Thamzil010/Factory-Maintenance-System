import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Modal } from '../components/Modal';

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', company: '', contact_person: '', phone: '', email: '', address: '' });

  const fetchSuppliers = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/suppliers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuppliers(response.data);
    } catch (error) {
      console.error('Error fetching suppliers', error);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/suppliers`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsModalOpen(false);
      fetchSuppliers();
    } catch (error) {
      alert('Error creating supplier');
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm('Delete this supplier?')) return;
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/suppliers/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchSuppliers();
    } catch (error) {
      alert('Error deleting supplier');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Suppliers</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700">Add Supplier</button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Person</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Info</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {suppliers.map((supplier) => (
              <tr key={supplier.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{supplier.company}</div>
                  <div className="text-sm text-gray-500">{supplier.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {supplier.contact_person || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>{supplier.email}</div>
                  <div>{supplier.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${supplier.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {supplier.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button onClick={() => handleDelete(supplier.id)} className="text-red-600 hover:text-red-900 ml-4">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Supplier">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700">Supplier Name</label><input required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
          <div><label className="block text-sm font-medium text-gray-700">Company Name</label><input required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} /></div>
          <div><label className="block text-sm font-medium text-gray-700">Contact Person</label><input className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" value={formData.contact_person} onChange={e => setFormData({...formData, contact_person: e.target.value})} /></div>
          <div><label className="block text-sm font-medium text-gray-700">Email</label><input type="email" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
          <div><label className="block text-sm font-medium text-gray-700">Phone</label><input className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
          <div><label className="block text-sm font-medium text-gray-700">Address</label><input className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} /></div>
          <div className="pt-4 flex justify-end"><button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700">Save Supplier</button></div>
        </form>
      </Modal>
    </div>
  );
};

export default Suppliers;
