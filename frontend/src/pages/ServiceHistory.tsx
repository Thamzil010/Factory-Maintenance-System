import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ServiceHistory = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get('${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/service-history', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setHistory(response.data);
      } catch (error) {
        console.error('Error fetching service history', error);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Service History</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Machine</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type / Problem</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Work Performed</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Technician</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {history.map((h: any) => (
              <tr key={h.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {h.maintenance?.start_date && (
                    <div className="text-gray-500 text-xs">Start: {new Date(h.maintenance.start_date).toLocaleDateString()}</div>
                  )}
                  {h.maintenance?.completion_date ? (
                    <div className="font-medium text-gray-800">Retrieved: {new Date(h.maintenance.completion_date).toLocaleDateString()}</div>
                  ) : (
                    <div className="font-medium text-gray-800">{new Date(h.service_date).toLocaleDateString()}</div>
                  )}
                  <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-800 text-xs font-bold rounded-full">COMPLETED</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{h.machine?.name}</div>
                  <div className="text-sm text-gray-500">{h.machine?.code}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{h.type}</div>
                  <div className="text-sm text-gray-500 truncate max-w-xs">{h.problem_description}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 truncate max-w-xs">{h.work_performed}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {h.technician?.name}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ServiceHistory;
