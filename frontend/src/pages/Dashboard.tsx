import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [alerts, setAlerts] = useState<any>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      try {
        const statsRes = await axios.get('${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/dashboard/stats', config);
        const alertsRes = await axios.get('${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/dashboard/alerts', config);
        setStats(statsRes.data);
        setAlerts(alertsRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data', error);
      }
    };
    fetchDashboard();
  }, []);

  if (!stats || !alerts) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Dashboard Overview</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between">
          <h3 className="text-slate-500 text-sm font-semibold tracking-wide uppercase">Total Machines</h3>
          <p className="text-4xl font-extrabold text-slate-800 mt-2">{stats.totalMachines}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-sm p-6 flex flex-col justify-between text-white">
          <h3 className="text-emerald-50 text-sm font-semibold tracking-wide uppercase">Active Machines</h3>
          <p className="text-4xl font-extrabold mt-2">{stats.activeMachines}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl shadow-sm p-6 flex flex-col justify-between text-white">
          <h3 className="text-amber-50 text-sm font-semibold tracking-wide uppercase">Under Maintenance</h3>
          <p className="text-4xl font-extrabold mt-2">{stats.maintenanceMachines}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between">
          <h3 className="text-slate-500 text-sm font-semibold tracking-wide uppercase">Total Spare Parts</h3>
          <p className="text-4xl font-extrabold text-slate-800 mt-2">{stats.totalSpareParts}</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-xl shadow-sm p-6 flex flex-col justify-between text-white">
          <h3 className="text-rose-50 text-sm font-semibold tracking-wide uppercase">Low Stock Parts</h3>
          <p className="text-4xl font-extrabold mt-2">{stats.lowStockItems}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Machine Warranties */}
        <div className="bg-white rounded-lg shadow p-4 border-t-4 border-indigo-500">
          <h3 className="text-gray-800 font-bold mb-4">Machine Warranties</h3>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-gray-500 text-xs uppercase">Total</div>
              <div className="text-xl font-bold text-gray-800">{stats.machineWarranties.total}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs uppercase">Active</div>
              <div className="text-xl font-bold text-green-600">{stats.machineWarranties.active}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs uppercase">Expired</div>
              <div className="text-xl font-bold text-red-600">{stats.machineWarranties.expired}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs uppercase">Upcoming</div>
              <div className="text-xl font-bold text-yellow-600">{stats.machineWarranties.upcoming}</div>
            </div>
          </div>
        </div>

        {/* Spare Part Warranties */}
        <div className="bg-white rounded-lg shadow p-4 border-t-4 border-teal-500">
          <h3 className="text-gray-800 font-bold mb-4">Spare Part Warranties</h3>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-gray-500 text-xs uppercase">Total</div>
              <div className="text-xl font-bold text-gray-800">{stats.sparePartWarranties.total}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs uppercase">Active</div>
              <div className="text-xl font-bold text-green-600">{stats.sparePartWarranties.active}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs uppercase">Expired</div>
              <div className="text-xl font-bold text-red-600">{stats.sparePartWarranties.expired}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs uppercase">Upcoming</div>
              <div className="text-xl font-bold text-yellow-600">{stats.sparePartWarranties.upcoming}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Low Stock Alerts */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-800">Low Stock Alerts</h3>
          </div>
          <div className="p-6 max-h-64 overflow-y-auto">
            {alerts.lowStockAlerts.length === 0 ? (
              <p className="text-gray-500">No low stock items.</p>
            ) : (
              <ul className="space-y-3">
                {alerts.lowStockAlerts.map((part: any) => (
                  <li key={part.id} className="flex justify-between items-center text-sm">
                    <span className="font-medium text-red-600">{part.name} ({part.code})</span>
                    <span className="text-gray-600">Current: {part.quantity} / Min: {part.min_stock}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Upcoming Maintenance */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-800">Upcoming Maintenance</h3>
          </div>
          <div className="p-6 max-h-64 overflow-y-auto">
            {alerts.upcomingMaintenance.length === 0 ? (
              <p className="text-gray-500">No upcoming maintenance.</p>
            ) : (
              <ul className="space-y-4">
                {alerts.upcomingMaintenance.map((maint: any) => (
                  <li key={maint.id} className="text-sm border-b pb-2 last:border-0">
                    <div className="font-medium text-gray-900">{maint.machine.name}</div>
                    <div className="text-gray-500">{maint.type} - {new Date(maint.scheduled_date).toLocaleDateString()}</div>
                    <div className="mt-1">
                      {maint.status === 'IN_PROGRESS' ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded bg-yellow-100 text-yellow-800">UNDER MAINTENANCE</span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">{maint.status}</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Warranties Expiring Soon */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-800">Warranties Expiring Soon</h3>
          </div>
          <div className="p-6 max-h-64 overflow-y-auto">
            {alerts.expiringWarranties.length === 0 ? (
              <p className="text-gray-500">No warranties expiring within 30 days.</p>
            ) : (
              <ul className="space-y-3">
                {alerts.expiringWarranties.map((w: any) => (
                  <li key={w.id} className="text-sm flex justify-between border-b pb-2 last:border-0">
                    <div>
                      <span className="font-medium text-gray-800">
                        {w.warrantyType === 'MACHINE' ? w.machine?.name : w.sparePart?.name}
                      </span>
                      <div className="text-xs text-gray-500">{w.warrantyType === 'MACHINE' ? 'Machine' : 'Spare Part'}</div>
                    </div>
                    <div className="text-red-600 font-semibold text-right">
                      {new Date(w.end_date).toLocaleDateString()}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
