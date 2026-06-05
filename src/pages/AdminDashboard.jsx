import React, { useEffect, useState } from 'react';
import { getRegistrations, updateRegistrationStatus, deleteRegistration } from '../db';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { 
  Users, CheckCircle, Clock, Car, Download, LogOut, Trash2 
} from 'lucide-react';

export default function AdminDashboard() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getRegistrations();
      setRegistrations(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateRegistrationStatus(id, newStatus);
      fetchData(); // Refresh data
    } catch (error) {
      alert("Error updating status");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this registration? This action cannot be undone.")) {
      try {
        await deleteRegistration(id);
        fetchData(); // Refresh data
      } catch (error) {
        alert("Error deleting registration");
      }
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'Title', 'Full Name', 'Position', 'Diocese', 'Province', 
      'WhatsApp Number', 'Email Address', 'Date of Arrival', 
      'Mode of Travel', 'Require Internal Transport', 
      'Coming with Driver/Escort', 'Driver Name', 'Escort Name', 'Status', 'Registration Date'
    ];
    
    const rows = registrations.map(r => [
      `"${r.title || ''}"`,
      `"${r.fullName || ''}"`,
      `"${r.position || ''}"`,
      `"${r.diocese || ''}"`,
      `"${r.province || ''}"`,
      `"${r.whatsappNumber || ''}"`,
      `"${r.emailAddress || ''}"`,
      `"${r.dateOfArrival || ''}"`,
      `"${r.modeOfTravel || ''}"`,
      `"${r.requireInternalTransport || ''}"`,
      `"${r.comingWithDriverEscort || ''}"`,
      `"${r.driverName || ''}"`,
      `"${r.escortName || ''}"`,
      `"${r.status || 'Pending'}"`,
      `"${r.createdAt?.toDate ? r.createdAt.toDate().toLocaleDateString() : ''}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(',') + "\n" 
      + rows.map(e => e.join(',')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "episcopal_registrations.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Analytics Calculations
  const totalRegs = registrations.length;
  const approved = registrations.filter(r => r.status === 'Approved').length;
  const pending = registrations.filter(r => r.status === 'Pending' || !r.status).length;
  const needTransport = registrations.filter(r => r.requireInternalTransport === 'Yes').length;

  const chartData = [
    { name: 'Approved', count: approved, color: '#10B981' }, // emerald-500
    { name: 'Pending', count: pending, color: '#F59E0B' }, // amber-500
    { name: 'Declined', count: totalRegs - approved - pending, color: '#EF4444' } // red-500
  ];

  return (
    <div className="flex h-screen bg-[#FDFCF0] font-sans overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-64 bg-[#2E0052] text-white flex flex-col shadow-xl hidden md:flex">
        <div className="p-6 flex flex-col items-center border-b border-white/10">
          <img src="/logo.png" alt="Logo" className="w-16 h-16 bg-white rounded-full p-1 mb-3" />
          <h2 className="text-lg font-serif font-bold text-center">DNDN Admin</h2>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          <a href="#" className="flex items-center gap-3 px-4 py-3 bg-white/10 text-[#DDB7FF] rounded-lg font-medium">
            <Users className="w-5 h-5" /> Registrations
          </a>
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={() => signOut(auth)}
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-300 hover:bg-white/5 rounded-lg transition-colors font-medium"
          >
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Mobile Header */}
        <header className="md:hidden bg-[#2E0052] text-white p-4 flex justify-between items-center shadow-md">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="w-8 h-8 bg-white rounded-full p-0.5" />
            <span className="font-serif font-bold">DNDN Admin</span>
          </div>
          <button onClick={() => signOut(auth)} className="text-red-300"><LogOut className="w-5 h-5" /></button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-serif font-bold text-[#1B1C15]">Overview</h1>
              <p className="text-gray-600">Episcopal Consultation Registration Analytics</p>
            </div>
            <button 
              onClick={handleExportCSV}
              className="bg-[#D4AF37] hover:bg-[#c5a030] text-[#2E0052] font-bold py-2.5 px-5 rounded-lg flex items-center gap-2 shadow transition-colors"
            >
              <Download className="w-5 h-5" /> Export to CSV
            </button>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 border-l-4 border-l-[#2E0052]">
              <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-[#2E0052]">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Registrations</p>
                <h3 className="text-2xl font-bold text-[#1B1C15]">{totalRegs}</h3>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 border-l-4 border-l-emerald-500">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Approved</p>
                <h3 className="text-2xl font-bold text-[#1B1C15]">{approved}</h3>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 border-l-4 border-l-amber-500">
              <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Pending Review</p>
                <h3 className="text-2xl font-bold text-[#1B1C15]">{pending}</h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 border-l-4 border-l-blue-500">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <Car className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Need Transport</p>
                <h3 className="text-2xl font-bold text-[#1B1C15]">{needTransport}</h3>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-1">
              <h3 className="text-lg font-serif font-bold text-[#1B1C15] mb-4">Status Breakdown</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: '#f5f4e8'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Empty space for future expansion, or we can stretch the table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-2 overflow-hidden flex flex-col">
              <h3 className="text-lg font-serif font-bold text-[#1B1C15] mb-4">Recent Activity</h3>
              <div className="flex-1 overflow-y-auto pr-2">
                {registrations.slice(0, 5).map(reg => (
                  <div key={reg.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="font-medium text-[#1B1C15]">{reg.title} {reg.fullName}</p>
                      <p className="text-xs text-gray-500">{reg.diocese} • {reg.createdAt?.toDate ? reg.createdAt.toDate().toLocaleDateString() : 'New'}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      reg.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 
                      reg.status === 'Declined' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {reg.status || 'Pending'}
                    </span>
                  </div>
                ))}
                {registrations.length === 0 && !loading && (
                  <p className="text-gray-500 text-sm">No registrations yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-serif font-bold text-[#1B1C15]">All Registrations</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-[#f5f4e8] text-xs uppercase text-gray-700">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Name</th>
                    <th className="px-6 py-4 font-semibold">Diocese</th>
                    <th className="px-6 py-4 font-semibold">Contact</th>
                    <th className="px-6 py-4 font-semibold">Travel</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr><td colSpan="6" className="text-center py-8">Loading...</td></tr>
                  ) : registrations.length === 0 ? (
                    <tr><td colSpan="6" className="text-center py-8">No registrations found.</td></tr>
                  ) : (
                    registrations.map(reg => (
                      <tr key={reg.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-medium text-[#1B1C15]">{reg.title} {reg.fullName}</p>
                          <p className="text-xs text-gray-500">{reg.position}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p>{reg.diocese}</p>
                          <p className="text-xs text-gray-500">{reg.province}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p>{reg.whatsappNumber}</p>
                          <p className="text-xs text-gray-500">{reg.emailAddress}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p>{reg.modeOfTravel} ({new Date(reg.dateOfArrival).toLocaleDateString()})</p>
                          {(reg.requireInternalTransport === 'Yes' || reg.comingWithDriverEscort === 'Yes') && (
                            <div className="mt-1 flex gap-1">
                              {reg.requireInternalTransport === 'Yes' && <span className="inline-block w-2 h-2 rounded-full bg-blue-500" title="Needs Transport"></span>}
                              {reg.comingWithDriverEscort === 'Yes' && <span className="inline-block w-2 h-2 rounded-full bg-purple-500" title="Has Escort"></span>}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <select 
                            value={reg.status || 'Pending'} 
                            onChange={(e) => handleStatusChange(reg.id, e.target.value)}
                            className={`text-xs font-semibold px-2 py-1.5 rounded outline-none border-r-4 border-transparent cursor-pointer ${
                              reg.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' : 
                              reg.status === 'Declined' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Declined">Declined</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => handleDelete(reg.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Registration"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
