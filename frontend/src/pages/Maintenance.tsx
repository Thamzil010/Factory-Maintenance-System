import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Modal } from '../components/Modal';

const Maintenance = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [machines, setMachines] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ machineId: '', type: 'CORRECTIVE', scheduled_date: '', expected_completion_date: '' });
  
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const fetchMaintenance = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get('${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/maintenance', { headers: { Authorization: `Bearer ${token}` } });
      setRecords(response.data);
    } catch (error) {
      console.error('Error fetching maintenance', error);
    }
  };

  const fetchMachines = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get('${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/machines', { headers: { Authorization: `Bearer ${token}` } });
      setMachines(response.data);
      if(response.data.length > 0) setFormData(prev => ({...prev, machineId: response.data[0].id}));
    } catch (error) {
      console.error('Error fetching machines', error);
    }
  };

  useEffect(() => {
    fetchMaintenance();
    fetchMachines();
  }, []);

  const startMaintenance = async (record: any) => {
    if (!confirm(`Start maintenance for ${record.machine.name}?`)) return;
    const token = localStorage.getItem('token');
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/maintenance/${record.id}`, { status: 'IN_PROGRESS' }, { headers: { Authorization: `Bearer ${token}` } });
      fetchMaintenance();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error starting maintenance');
    }
  };

  const markCompleted = async (record: any) => {
    if (!confirm(`Mark ${record.machine.name} as completed and return it to active status?`)) return;
    const work = prompt('Enter work performed:');
    if (!work) return;

    const token = localStorage.getItem('token');
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/maintenance/${record.id}`, { status: 'COMPLETED', work_performed: work }, { headers: { Authorization: `Bearer ${token}` } });
      fetchMaintenance();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error marking completed');
    }
  };

  const openDetails = (record: any) => {
    setSelectedRecord(record);
    setIsDetailModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      await axios.post('${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/maintenance', {
        machineId: formData.machineId,
        type: formData.type,
        scheduled_date: new Date(formData.scheduled_date).toISOString(),
        expected_completion_date: formData.expected_completion_date ? new Date(formData.expected_completion_date).toISOString() : null,
        description: 'Scheduled maintenance',
        frequency: 'One-time',
        priority: 'MEDIUM'
      }, { headers: { Authorization: `Bearer ${token}` } });
      setIsModalOpen(false);
      fetchMaintenance();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error scheduling maintenance');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Maintenance Records</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700">Schedule Maintenance</button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Machine</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start / Expected Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {records.map((record) => (
              <tr key={record.id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{record.machine.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.type}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>Start: {new Date(record.scheduled_date).toLocaleDateString()}</div>
                  {record.expected_completion_date && <div>Expected: {new Date(record.expected_completion_date).toLocaleDateString()}</div>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    record.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                    record.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {record.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                  {record.status === 'SCHEDULED' && (
                    <button onClick={() => startMaintenance(record)} className="text-yellow-600 hover:text-yellow-900 font-bold">Start Maintenance</button>
                  )}
                  {record.status === 'IN_PROGRESS' && (
                    <button onClick={() => markCompleted(record)} className="text-green-600 hover:text-green-900 font-bold">Complete / Return Machine</button>
                  )}
                  {record.status === 'COMPLETED' && (
                    <button onClick={() => openDetails(record)} className="text-gray-600 hover:text-gray-900">View Details</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Schedule Maintenance">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700">Machine</label>
            <select required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" value={formData.machineId} onChange={e => setFormData({...formData, machineId: e.target.value})}>
              {machines.map(m => <option key={m.id} value={m.id}>{m.name} ({m.code})</option>)}
            </select>
          </div>
          <div><label className="block text-sm font-medium text-gray-700">Type</label>
            <select required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
              <option value="PREVENTIVE">PREVENTIVE</option>
              <option value="CORRECTIVE">CORRECTIVE</option>
            </select>
          </div>
          <div><label className="block text-sm font-medium text-gray-700">Start Date</label><input required type="date" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" value={formData.scheduled_date} onChange={e => setFormData({...formData, scheduled_date: e.target.value})} /></div>
          <div><label className="block text-sm font-medium text-gray-700">Expected Completion Date</label><input required type="date" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" value={formData.expected_completion_date} onChange={e => setFormData({...formData, expected_completion_date: e.target.value})} /></div>
          <div className="pt-4 flex justify-end"><button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700">Schedule</button></div>
        </form>
      </Modal>

      {selectedRecord && (
        <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title="Maintenance Details">
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div><span className="font-semibold text-gray-600">Machine:</span> {selectedRecord.machine.name}</div>
              <div><span className="font-semibold text-gray-600">Type:</span> {selectedRecord.type}</div>
              <div><span className="font-semibold text-gray-600">Status:</span> {selectedRecord.status}</div>
            </div>
            <div className="border-t pt-2">
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div><span className="font-semibold text-gray-600">Scheduled:</span> {new Date(selectedRecord.scheduled_date).toLocaleDateString()}</div>
                <div><span className="font-semibold text-gray-600">Expected Completion:</span> {selectedRecord.expected_completion_date ? new Date(selectedRecord.expected_completion_date).toLocaleDateString() : 'N/A'}</div>
                {selectedRecord.start_date && <div><span className="font-semibold text-gray-600">Actual Start:</span> {new Date(selectedRecord.start_date).toLocaleDateString()}</div>}
                {selectedRecord.completion_date && <div><span className="font-semibold text-gray-600">Actual Completion/Retrieved:</span> {new Date(selectedRecord.completion_date).toLocaleDateString()}</div>}
              </div>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};

export default Maintenance;
