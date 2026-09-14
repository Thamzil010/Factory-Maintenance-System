import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Modal } from '../components/Modal';

const Machines = () => {
  const [machines, setMachines] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', code: '', model: '', manufacturer: '', department: '', status: 'ACTIVE' });
  const [selectedMachine, setSelectedMachine] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const fetchMachines = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/machines`, { headers: { Authorization: `Bearer ${token}` } });
      setMachines(response.data);
    } catch (error) {
      console.error('Error fetching machines', error);
    }
  };

  useEffect(() => { fetchMachines(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const payload = { ...formData, location: 'Factory Floor', installation_date: new Date().toISOString() };
      await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/machines`, payload, { headers: { Authorization: `Bearer ${token}` } });
      setIsModalOpen(false);
      fetchMachines();
    } catch (error) {
      alert('Error creating machine');
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm('Delete this machine?')) return;
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/machines/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchMachines();
    } catch (error) {
      alert('Error deleting machine');
    }
  };

  const openDetails = async (id: string) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/machines/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setSelectedMachine(response.data);
      setIsDetailModalOpen(true);
    } catch (error) {
      alert('Error fetching details');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Machines</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700">Add Machine</button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name / Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Power / Availability</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Maintenance</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Warranty</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {machines.map((machine) => {
              const activeMaint = machine.maintenance && machine.maintenance.length > 0 ? machine.maintenance[0] : null;
              const activeWarranty = machine.warranties && machine.warranties.length > 0 ? machine.warranties[0] : null;

              return (
              <tr key={machine.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{machine.name}</div>
                  <div className="text-sm text-gray-500">{machine.code}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {machine.status === 'ACTIVE' ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">ACTIVE</span>
                  ) : machine.status === 'UNDER_MAINTENANCE' ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">UNDER MAINTENANCE</span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">{machine.status}</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {machine.isOperational ? (
                    <span className="text-green-600 font-bold flex items-center"><span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>ON</span>
                  ) : (
                    <span className="text-red-600 font-bold flex items-center"><span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>OFF</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {activeMaint ? (
                    <div>
                      <div className="font-medium text-gray-800">{activeMaint.type}</div>
                      <div className="text-xs">Started: {new Date(activeMaint.start_date).toLocaleDateString()}</div>
                    </div>
                  ) : (
                    <span className="text-gray-400">None</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {(() => {
                    if (!activeWarranty) return <span className="text-gray-400">No Warranty</span>;
                    let calcStatus = 'ACTIVE';
                    const now = new Date();
                    now.setHours(0, 0, 0, 0);
                    const endDate = new Date(activeWarranty.end_date);
                    endDate.setHours(0, 0, 0, 0);
                    if (endDate < now) calcStatus = 'EXPIRED';

                    return (
                      <div>
                        <div className={`font-semibold ${calcStatus === 'EXPIRED' ? 'text-red-600' : 'text-green-600'}`}>{calcStatus}</div>
                        <div className="text-xs text-gray-500">{new Date(activeWarranty.start_date).toLocaleDateString()} - {new Date(activeWarranty.end_date).toLocaleDateString()}</div>
                      </div>
                    );
                  })()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button onClick={() => openDetails(machine.id)} className="text-blue-600 hover:text-blue-900 mr-4">Details</button>
                  <button onClick={() => handleDelete(machine.id)} className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Machine">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700">Name</label><input required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
          <div><label className="block text-sm font-medium text-gray-700">Code</label><input required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} /></div>
          <div><label className="block text-sm font-medium text-gray-700">Model</label><input required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} /></div>
          <div><label className="block text-sm font-medium text-gray-700">Manufacturer</label><input required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" value={formData.manufacturer} onChange={e => setFormData({...formData, manufacturer: e.target.value})} /></div>
          <div><label className="block text-sm font-medium text-gray-700">Department</label><input required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} /></div>
          <div className="pt-4 flex justify-end"><button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700">Save Machine</button></div>
        </form>
      </Modal>

      {selectedMachine && (
        <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title={`Machine Details: ${selectedMachine.name}`}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500 font-medium">Code:</span> <span className="text-gray-800">{selectedMachine.code}</span></div>
              <div><span className="text-gray-500 font-medium">Model:</span> <span className="text-gray-800">{selectedMachine.model}</span></div>
              <div>
                <span className="text-gray-500 font-medium">Status:</span>{' '}
                <span className={`font-bold ${selectedMachine.status === 'UNDER_MAINTENANCE' ? 'text-yellow-600' : 'text-green-600'}`}>{selectedMachine.status}</span>
              </div>
              <div>
                <span className="text-gray-500 font-medium">Availability:</span>{' '}
                <span className={`font-bold ${selectedMachine.isOperational ? 'text-green-600' : 'text-red-600'}`}>{selectedMachine.isOperational ? 'ON' : 'OFF'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500 font-medium block">Warranty:</span>
                {(() => {
                  const w = selectedMachine.warranties && selectedMachine.warranties.length > 0 ? selectedMachine.warranties[0] : null;
                  if (!w) return <span className="text-gray-800">No Warranty</span>;
                  const now = new Date(); now.setHours(0, 0, 0, 0);
                  const end = new Date(w.end_date); end.setHours(0, 0, 0, 0);
                  const status = end < now ? 'EXPIRED' : 'ACTIVE';
                  return (
                    <div>
                      <span className={`font-bold ${status === 'EXPIRED' ? 'text-red-600' : 'text-green-600'}`}>{status}</span>
                      <div className="text-sm text-gray-600">{new Date(w.start_date).toLocaleDateString()} - {new Date(w.end_date).toLocaleDateString()}</div>
                      {w.supplier && <div className="text-sm text-gray-500">Provider: {w.supplier.name}</div>}
                    </div>
                  );
                })()}
              </div>
            </div>
            
            <div className="mt-6 border-t pt-4">
              <h4 className="font-semibold text-gray-800 mb-2">Maintenance History</h4>
              {selectedMachine.maintenance && selectedMachine.maintenance.length > 0 ? (
                <ul className="space-y-3">
                  {selectedMachine.maintenance.map((m: any) => (
                    <li key={m.id} className="bg-gray-50 p-3 rounded border text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium text-blue-800">{m.type}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${m.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : m.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>{m.status}</span>
                      </div>
                      <div className="mt-2 text-gray-600 grid grid-cols-2 gap-2 text-xs">
                        {m.start_date && <div>Started: {new Date(m.start_date).toLocaleDateString()}</div>}
                        {m.completion_date && <div>Retrieved: {new Date(m.completion_date).toLocaleDateString()}</div>}
                        {!m.completion_date && m.scheduled_date && <div>Scheduled/Expected: {new Date(m.scheduled_date).toLocaleDateString()}</div>}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">No maintenance records.</p>
              )}
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};

export default Machines;
