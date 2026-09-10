import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Modal } from '../components/Modal';

const Warranties = () => {
  const [warranties, setWarranties] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [machines, setMachines] = useState<any[]>([]);
  const [parts, setParts] = useState<any[]>([]);

  const [activeTab, setActiveTab] = useState<'MACHINE' | 'SPARE_PART'>('MACHINE');
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedWarranty, setSelectedWarranty] = useState<any>(null);

  // Form
  const [formData, setFormData] = useState({
    warrantyType: 'MACHINE',
    machineId: '',
    sparePartId: '',
    supplierId: '',
    purchaseDate: '',
    start_date: '',
    end_date: '',
    notes: ''
  });

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [warRes, supRes, machRes, partRes] = await Promise.all([
        axios.get('${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/warranties', { headers }),
        axios.get('${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/suppliers', { headers }),
        axios.get('${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/machines', { headers }),
        axios.get('${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/spare-parts', { headers }),
      ]);
      setWarranties(warRes.data);
      setSuppliers(supRes.data);
      setMachines(machRes.data);
      setParts(partRes.data);
    } catch (error) {
      console.error('Error fetching data', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setFormData({
      warrantyType: 'MACHINE',
      machineId: machines.length > 0 ? machines[0].id : '',
      sparePartId: parts.length > 0 ? parts[0].id : '',
      supplierId: suppliers.length > 0 ? suppliers[0].id : '',
      purchaseDate: '',
      start_date: '',
      end_date: '',
      notes: ''
    });
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleWarrantyTypeChange = (type: string) => {
    setFormData(prev => ({
      ...prev,
      warrantyType: type,
      machineId: type === 'MACHINE' && machines.length > 0 ? machines[0].id : '',
      sparePartId: type === 'SPARE_PART' && parts.length > 0 ? parts[0].id : '',
      supplierId: suppliers.length > 0 ? suppliers[0].id : '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const payload: any = {
        warrantyType: formData.warrantyType,
        supplierId: formData.supplierId,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
        notes: formData.notes
      };

      if (formData.warrantyType === 'MACHINE') {
        payload.machineId = formData.machineId;
      } else {
        payload.sparePartId = formData.sparePartId;
        if (formData.purchaseDate) {
          payload.purchaseDate = new Date(formData.purchaseDate).toISOString();
        }
      }

      await axios.post('${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/warranties', payload, { headers: { Authorization: `Bearer ${token}` } });
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      alert('Error creating warranty');
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm('Delete this warranty?')) return;
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/warranties/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchData();
    } catch (error) {
      alert('Error deleting warranty');
    }
  };

  const openDetails = (warranty: any) => {
    setSelectedWarranty(warranty);
    setIsDetailModalOpen(true);
  };

  const filteredWarranties = warranties.filter(w => {
    if (w.warrantyType !== activeTab) return false;
    if (statusFilter !== 'ALL' && w.status !== statusFilter) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (activeTab === 'MACHINE') {
        return (
          w.machine?.name?.toLowerCase().includes(q) ||
          w.machine?.code?.toLowerCase().includes(q) ||
          w.supplier?.name?.toLowerCase().includes(q)
        );
      } else {
        return (
          w.sparePart?.name?.toLowerCase().includes(q) ||
          w.sparePart?.code?.toLowerCase().includes(q) ||
          w.supplier?.name?.toLowerCase().includes(q)
        );
      }
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'ACTIVE': return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">ACTIVE</span>;
      case 'EXPIRED': return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">EXPIRED</span>;
      case 'UPCOMING': return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">UPCOMING</span>;
      default: return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Warranties</h1>
        <button onClick={handleOpenAdd} className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700">+ Add Warranty</button>
      </div>

      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow space-x-4">
        <div className="flex space-x-2">
          <button 
            className={`px-4 py-2 font-medium rounded-md ${activeTab === 'MACHINE' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}
            onClick={() => setActiveTab('MACHINE')}
          >
            Machine Warranties
          </button>
          <button 
            className={`px-4 py-2 font-medium rounded-md ${activeTab === 'SPARE_PART' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}
            onClick={() => setActiveTab('SPARE_PART')}
          >
            Spare Part Warranties
          </button>
        </div>
        
        <div className="flex space-x-4">
          <input 
            type="text" 
            placeholder="Search..." 
            className="border-gray-300 rounded-md shadow-sm border p-2"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select 
            className="border-gray-300 rounded-md shadow-sm border p-2"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="EXPIRED">Expired</option>
            <option value="UPCOMING">Upcoming</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {activeTab === 'MACHINE' ? (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Machine Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Machine ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Manufacturer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Warranty Provider</th>
                </>
              ) : (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Spare Part Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Part Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purchased From</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purchase Date</th>
                </>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredWarranties.map((warranty) => (
              <tr key={warranty.id}>
                {activeTab === 'MACHINE' ? (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{warranty.machine?.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{warranty.machine?.code}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{warranty.machine?.manufacturer}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{warranty.supplier?.name}</td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{warranty.sparePart?.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{warranty.sparePart?.code}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{warranty.sparePart?.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{warranty.supplier?.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {warranty.purchaseDate ? new Date(warranty.purchaseDate).toLocaleDateString() : 'N/A'}
                    </td>
                  </>
                )}
                
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(warranty.start_date).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(warranty.end_date).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(warranty.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                  <button onClick={() => openDetails(warranty)} className="text-blue-600 hover:text-blue-900 font-bold">View</button>
                  <button onClick={() => handleDelete(warranty.id)} className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
            {filteredWarranties.length === 0 && (
              <tr>
                <td colSpan={10} className="px-6 py-4 text-center text-gray-500">No warranties found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Warranty">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Warranty Type</label>
            <div className="mt-2 flex space-x-4">
              <label className="inline-flex items-center">
                <input type="radio" className="form-radio text-blue-600" value="MACHINE" checked={formData.warrantyType === 'MACHINE'} onChange={() => handleWarrantyTypeChange('MACHINE')} />
                <span className="ml-2">Machine Warranty</span>
              </label>
              <label className="inline-flex items-center">
                <input type="radio" className="form-radio text-blue-600" value="SPARE_PART" checked={formData.warrantyType === 'SPARE_PART'} onChange={() => handleWarrantyTypeChange('SPARE_PART')} />
                <span className="ml-2">Spare Part Warranty</span>
              </label>
            </div>
          </div>

          {formData.warrantyType === 'MACHINE' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Machine</label>
              <select required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" value={formData.machineId} onChange={e => setFormData({...formData, machineId: e.target.value})}>
                {machines.map(m => <option key={m.id} value={m.id}>{m.name} ({m.code}) - {m.manufacturer}</option>)}
              </select>
            </div>
          )}

          {formData.warrantyType === 'SPARE_PART' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">Spare Part</label>
                <select required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" value={formData.sparePartId} onChange={e => setFormData({...formData, sparePartId: e.target.value})}>
                  {parts.map(p => <option key={p.id} value={p.id}>{p.name} ({p.code})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Purchase Date</label>
                <input required type="date" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" value={formData.purchaseDate} onChange={e => setFormData({...formData, purchaseDate: e.target.value})} />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              {formData.warrantyType === 'MACHINE' ? 'Supplier / Warranty Provider' : 'Purchased From'}
            </label>
            <select required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" value={formData.supplierId} onChange={e => setFormData({...formData, supplierId: e.target.value})}>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Warranty Start Date</label>
              <input required type="date" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Warranty End Date</label>
              <input required type="date" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Notes / Warranty Document (optional)</label>
            <textarea className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
          </div>

          <div className="pt-4 flex justify-end">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700">Save</button>
          </div>
        </form>
      </Modal>

      {selectedWarranty && (
        <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title={`${selectedWarranty.warrantyType === 'MACHINE' ? 'MACHINE' : 'SPARE PART'} WARRANTY DETAILS`}>
          <div className="space-y-6 text-sm">
            
            {selectedWarranty.warrantyType === 'MACHINE' ? (
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="grid grid-cols-2 gap-4">
                  <div><span className="font-semibold text-gray-600 block">Machine Name:</span> <span className="text-gray-900 text-base">{selectedWarranty.machine?.name}</span></div>
                  <div><span className="font-semibold text-gray-600 block">Machine ID:</span> <span className="text-gray-900 text-base">{selectedWarranty.machine?.code}</span></div>
                  <div><span className="font-semibold text-gray-600 block">Manufacturer:</span> {selectedWarranty.machine?.manufacturer}</div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="grid grid-cols-2 gap-4">
                  <div><span className="font-semibold text-gray-600 block">Spare Part Name:</span> <span className="text-gray-900 text-base">{selectedWarranty.sparePart?.name}</span></div>
                  <div><span className="font-semibold text-gray-600 block">Part Number:</span> <span className="text-gray-900 text-base">{selectedWarranty.sparePart?.code}</span></div>
                  <div><span className="font-semibold text-gray-600 block">Category:</span> {selectedWarranty.sparePart?.category}</div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 border-b pb-4">
              <div>
                <span className="font-semibold text-gray-600 block">
                  {selectedWarranty.warrantyType === 'MACHINE' ? 'Warranty Provider:' : 'Purchased From:'}
                </span> 
                <span className="text-gray-900">{selectedWarranty.supplier?.name}</span>
              </div>
              {selectedWarranty.warrantyType === 'SPARE_PART' && (
                <div>
                  <span className="font-semibold text-gray-600 block">Purchase Date:</span> 
                  {selectedWarranty.purchaseDate ? new Date(selectedWarranty.purchaseDate).toLocaleDateString() : 'N/A'}
                </div>
              )}
              <div><span className="font-semibold text-gray-600 block">Warranty Start:</span> {new Date(selectedWarranty.start_date).toLocaleDateString()}</div>
              <div><span className="font-semibold text-gray-600 block">Warranty End:</span> {new Date(selectedWarranty.end_date).toLocaleDateString()}</div>
              <div><span className="font-semibold text-gray-600 block">Status:</span> {getStatusBadge(selectedWarranty.status)}</div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 mb-2 border-b pb-1">Supplier Contact Information</h4>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div><span className="font-semibold text-gray-500">Supplier Name:</span> {selectedWarranty.supplier?.name}</div>
                <div><span className="font-semibold text-gray-500">Company:</span> {selectedWarranty.supplier?.company}</div>
                <div><span className="font-semibold text-gray-500">Contact Person:</span> {selectedWarranty.supplier?.contact_person || 'N/A'}</div>
                <div><span className="font-semibold text-gray-500">Phone:</span> {selectedWarranty.supplier?.phone || 'N/A'}</div>
                <div className="col-span-2"><span className="font-semibold text-gray-500">Email:</span> {selectedWarranty.supplier?.email || 'N/A'}</div>
              </div>
            </div>

          </div>
        </Modal>
      )}
    </div>
  );
};

export default Warranties;
