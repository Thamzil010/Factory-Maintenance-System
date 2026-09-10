import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Alerts = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/alerts`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAlerts(response.data);
      } catch (error) {
        console.error('Error fetching alerts', error);
      }
    };
    fetchAlerts();
  }, []);

  const markRead = async (id: string) => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/alerts/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlerts(alerts.map((a: any) => a.id === id ? { ...a, status: 'READ' } : a));
    } catch (error) {
      alert('Error marking alert as read');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Alerts</h1>

      <div className="space-y-4">
        {alerts.map((a: any) => (
          <div key={a.id} className={`p-4 rounded-lg shadow flex justify-between items-center ${
            a.status === 'UNREAD' ? 'bg-white border-l-4 border-red-500' : 'bg-gray-50'
          }`}>
            <div>
              <div className="flex items-center space-x-2">
                <span className={`text-xs font-bold px-2 py-1 rounded ${
                  a.type === 'INVENTORY' ? 'bg-blue-100 text-blue-800' : 
                  a.type === 'MAINTENANCE' ? 'bg-yellow-100 text-yellow-800' : 'bg-purple-100 text-purple-800'
                }`}>{a.type}</span>
                <span className="font-semibold text-gray-800">{a.title}</span>
              </div>
              <p className="text-gray-600 mt-1">{a.message}</p>
              <p className="text-xs text-gray-400 mt-1">{new Date(a.createdAt).toLocaleString()}</p>
            </div>
            {a.status === 'UNREAD' && (
              <button onClick={() => markRead(a.id)} className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded">Mark Read</button>
            )}
          </div>
        ))}
        {alerts.length === 0 && <p className="text-gray-500">No alerts found.</p>}
      </div>
    </div>
  );
};

export default Alerts;
