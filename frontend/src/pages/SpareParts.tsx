import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Modal } from '../components/Modal';

const SpareParts = () => {
  const [parts, setParts] = useState<any[]>([]);
  
  // Modals state
  const [isNewPartModalOpen, setIsNewPartModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  
  // Form Data state
  const [newPartFormData, setNewPartFormData] = useState({ name: '', code: '', category: '', quantity: 0, min_stock: 0, unit_price: 0, unit: 'pcs', location: 'Warehouse A' });
  const [stockFormData, setStockFormData] = useState({ quantity_change: 0, reference_id: '', remarks: '' });
  
  // Active selection
  const [selectedPart, setSelectedPart] = useState<any>(null);
  const [stockActionType, setStockActionType] = useState<'PURCHASE' | 'ISSUE'>('PURCHASE');
  const [historyData, setHistoryData] = useState<any[]>([]);

  const fetchParts = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/spare-parts`, { headers: { Authorization: `Bearer ${token}` } });
      setParts(response.data);
    } catch (error) {
      console.error('Error fetching spare parts', error);
    }
  };

  useEffect(() => { fetchParts(); }, []);

  const handleCreatePart = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/spare-parts`, newPartFormData, { headers: { Authorization: `Bearer ${token}` } });
      setIsNewPartModalOpen(false);
      alert('Spare part created successfully');
      fetchParts();
    } catch (error) {
      alert('Error creating part');
    }
  };

  const handleStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (stockFormData.quantity_change <= 0) {
      alert('Quantity must be greater than 0');
      return;
    }

    const token = localStorage.getItem('token');
    const change = stockActionType === 'PURCHASE' ? stockFormData.quantity_change : -stockFormData.quantity_change;

    try {
      await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/spare-parts/${selectedPart.id}/stock`, {
        quantity_change: change,
        movement_type: stockActionType,
        reference_id: stockFormData.reference_id,
        remarks: stockFormData.remarks
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      setIsStockModalOpen(false);
      alert(`Successfully ${stockActionType === 'PURCHASE' ? 'added' : 'issued'} stock.`);
      fetchParts();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error updating stock');
    }
  };

  const fetchHistory = async (part: any) => {
    setSelectedPart(part);
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/spare-parts/${part.id}/history`, { headers: { Authorization: `Bearer ${token}` } });
      setHistoryData(response.data);
      setIsHistoryModalOpen(true);
    } catch (error) {
      alert('Error fetching history');
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm('Delete this part? This will also delete its stock movement history.')) return;
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/spare-parts/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchParts();
    } catch (error) {
      alert('Error deleting part');
    }
  };

  const openStockModal = (part: any, type: 'PURCHASE' | 'ISSUE') => {
    setSelectedPart(part);
    setStockActionType(type);
    setStockFormData({ quantity_change: 0, reference_id: '', remarks: '' });
    setIsStockModalOpen(true);
  };

  const getStatusBadge = (quantity: number, minStock: number) => {
    if (quantity === 0) {
      return <span className="px-2 py-1 bg-gray-200 text-gray-800 rounded-full text-xs font-medium">Out of Stock</span>;
    }
    if (quantity <= minStock) {
      return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Low Stock</span>;
    }
    return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">In Stock</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Spare Parts Inventory</h1>
        <button onClick={() => setIsNewPartModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700">Add New Part</button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name / Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock / Min</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier / Warranty</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {parts.map((part) => {
              const activeWarranty = part.warranties && part.warranties.length > 0 ? part.warranties[0] : null;
              return (
              <tr key={part.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{part.name}</div>
                  <div className="text-sm text-gray-500">{part.code}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{part.category}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${part.quantity <= part.min_stock ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                    {part.quantity} {part.unit}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{part.unit_price}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {activeWarranty ? (
                    (() => {
                      let calcStatus = 'ACTIVE';
                      const now = new Date();
                      now.setHours(0, 0, 0, 0);
                      const endDate = new Date(activeWarranty.end_date);
                      endDate.setHours(0, 0, 0, 0);
                      if (endDate < now) calcStatus = 'EXPIRED';

                      return (
                        <div>
                          <div className="text-gray-800 font-medium">Purchased From: {activeWarranty.supplier?.name}</div>
                          <div className="mt-1">
                            <span className={`font-semibold ${calcStatus === 'EXPIRED' ? 'text-red-600' : 'text-green-600'}`}>{calcStatus}</span>
                            <div className="text-xs text-gray-500">{new Date(activeWarranty.start_date).toLocaleDateString()} - {new Date(activeWarranty.end_date).toLocaleDateString()}</div>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <div>
                      <div className="text-gray-800 font-medium">{part.supplier ? `Supplier: ${part.supplier.name}` : ''}</div>
                      <span className="text-gray-400">No Warranty</span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right space-x-2">
                  <button onClick={() => openStockModal(part, 'PURCHASE')} className="text-green-600 hover:text-green-900">Add Stock</button>
                  <span className="text-gray-300">|</span>
                  <button onClick={() => openStockModal(part, 'ISSUE')} className="text-blue-600 hover:text-blue-900">Issue</button>
                  <span className="text-gray-300">|</span>
                  <button onClick={() => fetchHistory(part)} className="text-gray-600 hover:text-gray-900">History</button>
                  <span className="text-gray-300">|</span>
                  <button onClick={() => handleDelete(part.id)} className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            );
            })}
          </tbody>
        </table>
      </div>

      {/* CREATE PART MODAL */}
      <Modal isOpen={isNewPartModalOpen} onClose={() => setIsNewPartModalOpen(false)} title="Add New Spare Part">
        <form onSubmit={handleCreatePart} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700">Name</label><input required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" value={newPartFormData.name} onChange={e => setNewPartFormData({...newPartFormData, name: e.target.value})} /></div>
          <div><label className="block text-sm font-medium text-gray-700">Code</label><input required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" value={newPartFormData.code} onChange={e => setNewPartFormData({...newPartFormData, code: e.target.value})} /></div>
          <div><label className="block text-sm font-medium text-gray-700">Category</label><input required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" value={newPartFormData.category} onChange={e => setNewPartFormData({...newPartFormData, category: e.target.value})} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700">Unit</label><input required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" value={newPartFormData.unit} onChange={e => setNewPartFormData({...newPartFormData, unit: e.target.value})} /></div>
            <div><label className="block text-sm font-medium text-gray-700">Location</label><input required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" value={newPartFormData.location} onChange={e => setNewPartFormData({...newPartFormData, location: e.target.value})} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700">Initial Stock</label><input type="number" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" value={newPartFormData.quantity} onChange={e => setNewPartFormData({...newPartFormData, quantity: parseInt(e.target.value)})} /></div>
            <div><label className="block text-sm font-medium text-gray-700">Min Stock Level</label><input type="number" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" value={newPartFormData.min_stock} onChange={e => setNewPartFormData({...newPartFormData, min_stock: parseInt(e.target.value)})} /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700">Unit Price</label><input type="number" step="0.01" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" value={newPartFormData.unit_price} onChange={e => setNewPartFormData({...newPartFormData, unit_price: parseFloat(e.target.value)})} /></div>
          <div className="pt-4 flex justify-end"><button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700">Save Part</button></div>
        </form>
      </Modal>

      {/* STOCK TRANSACTION MODAL */}
      {selectedPart && (
        <Modal isOpen={isStockModalOpen} onClose={() => setIsStockModalOpen(false)} title={stockActionType === 'PURCHASE' ? 'Add Stock (Purchase)' : 'Issue Stock'}>
          <form onSubmit={handleStockSubmit} className="space-y-4">
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm font-medium text-gray-700">Part: {selectedPart.name} ({selectedPart.code})</p>
              <p className="text-sm text-gray-500">Current Stock: {selectedPart.quantity} {selectedPart.unit}</p>
            </div>
            
            <div><label className="block text-sm font-medium text-gray-700">Quantity to {stockActionType === 'PURCHASE' ? 'Add' : 'Issue'}</label>
              <input type="number" min="1" max={stockActionType === 'ISSUE' ? selectedPart.quantity : undefined} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" value={stockFormData.quantity_change} onChange={e => setStockFormData({...stockFormData, quantity_change: parseInt(e.target.value)})} />
            </div>
            
            <div><label className="block text-sm font-medium text-gray-700">{stockActionType === 'PURCHASE' ? 'Invoice / PO Number' : 'Machine / Work Order'}</label>
              <input className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" value={stockFormData.reference_id} onChange={e => setStockFormData({...stockFormData, reference_id: e.target.value})} placeholder={stockActionType === 'PURCHASE' ? 'e.g. INV-2026-09' : 'e.g. WO-10294'} />
            </div>

            <div><label className="block text-sm font-medium text-gray-700">Reason / Notes</label>
              <textarea className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" rows={3} value={stockFormData.remarks} onChange={e => setStockFormData({...stockFormData, remarks: e.target.value})}></textarea>
            </div>
            
            <div className="pt-4 flex justify-end">
              <button type="submit" className={`px-4 py-2 rounded shadow text-white ${stockActionType === 'PURCHASE' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                Confirm {stockActionType === 'PURCHASE' ? 'Addition' : 'Issue'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* HISTORY MODAL */}
      {selectedPart && (
        <Modal isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)} title={`Stock History: ${selectedPart.name}`}>
          <div className="overflow-y-auto max-h-96">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Type</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Qty</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Reference / Notes</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {historyData.map((record) => (
                  <tr key={record.id}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{new Date(record.date).toLocaleString()}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${record.movement_type === 'PURCHASE' || record.movement_type === 'IN' || record.movement_type === 'INITIAL' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                        {record.movement_type}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                      {record.quantity_change > 0 ? `+${record.quantity_change}` : record.quantity_change}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      <div>{record.reference_id && <span className="font-semibold">{record.reference_id} </span>}</div>
                      <div>{record.remarks}</div>
                    </td>
                  </tr>
                ))}
                {historyData.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-4 text-center text-gray-500">No transaction history found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Modal>
      )}

    </div>
  );
};

export default SpareParts;
