import React, { useEffect, useState } from 'react';
import { getRegistrations, updateRegistrationStatus } from '../db';

export default function AdminDashboard() {
  const [registrations, setRegistrations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // All, Pending, Approved, Declined
  
  // Modal state
  const [selectedReg, setSelectedReg] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getRegistrations();
      setRegistrations(data);
    } catch (error) {
      console.error("Failed to fetch registrations", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateRegistrationStatus(id, newStatus);
      // Optimistically update UI
      setRegistrations(prev => 
        prev.map(reg => reg.id === id ? { ...reg, status: newStatus } : reg)
      );
      if (selectedReg && selectedReg.id === id) {
        setSelectedReg({ ...selectedReg, status: newStatus });
      }
    } catch (error) {
      alert("Failed to update status. Please try again.");
    }
  };

  const exportToCSV = () => {
    if (registrations.length === 0) return;
    
    // Headers matching our data keys
    const headers = [
      "ID", "Date Submitted", "Status", "Title", "Full Name", "Position", "Diocese", "Province", 
      "WhatsApp Number", "Email Address", "Date of Arrival", "Mode of Travel", 
      "Require Internal Transport", "Coming with Driver/Escort", "Driver Name", "Escort Name"
    ];

    // CSV rows
    const csvRows = [
      headers.join(','),
      ...registrations.map(r => [
        r.id,
        r.createdAt ? new Date(r.createdAt.toDate ? r.createdAt.toDate() : r.createdAt).toLocaleString() : '',
        r.status || 'Pending',
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
        `"${r.escortName || ''}"`
      ].join(','))
    ].join('\n');

    // Trigger download
    const blob = new Blob([csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "registrations_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredRegistrations = registrations.filter(reg => {
    const matchesSearch = 
      (reg.fullName && reg.fullName.toLowerCase().includes(search.toLowerCase())) || 
      (reg.diocese && reg.diocese.toLowerCase().includes(search.toLowerCase())) ||
      (reg.position && reg.position.toLowerCase().includes(search.toLowerCase()));
    
    const matchesStatus = statusFilter === 'All' || reg.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Stats
  const total = registrations.length;
  const pending = registrations.filter(r => r.status === 'Pending').length;
  const approved = registrations.filter(r => r.status === 'Approved').length;

  return (
    <div className="container" style={{ maxWidth: '1400px', display: 'flex', gap: '2rem' }}>
      
      {/* Sidebar Layout */}
      <div style={{ width: '250px', flexShrink: 0 }}>
        <div className="card" style={{ padding: '1.5rem', position: 'sticky', top: '100px' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>Filters</h3>
          
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label>Search</label>
            <input 
              type="text" 
              placeholder="Name, diocese..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
            />
          </div>

          <div className="form-group">
            <label>Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All Registrations</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Declined">Declined</option>
            </select>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '1.5rem 0' }} />

          <button className="btn btn-secondary" onClick={exportToCSV} style={{ width: '100%', marginBottom: '1rem' }}>
            Export to CSV
          </button>
          
          <button className="btn btn-primary" onClick={loadData} style={{ width: '100%', background: '#F3F4F6', color: 'var(--text-main)', border: '1px solid var(--border)', boxShadow: 'none' }}>
            Refresh Data
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1 }}>
        
        {/* Stats Row */}
        <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '2rem', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--primary)' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase' }}>Total</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-main)' }}>{total}</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #F59E0B' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase' }}>Pending</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#F59E0B' }}>{pending}</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #10B981' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase' }}>Approved</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#10B981' }}>{approved}</div>
          </div>
        </div>

        {/* Table Card */}
        <div className="card" style={{ padding: '0' }}>
          {isLoading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading registrations...
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No registrations found matching your filters.
            </div>
          ) : (
            <div className="table-container" style={{ border: 'none', borderRadius: 'var(--radius-xl)' }}>
              <table>
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Name & Info</th>
                    <th>Contact</th>
                    <th>Arrival</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRegistrations.map((reg) => (
                    <tr key={reg.id} className="fade-in">
                      <td>
                        <select 
                          value={reg.status || 'Pending'} 
                          onChange={(e) => handleStatusChange(reg.id, e.target.value)}
                          style={{
                            padding: '0.25rem 0.5rem',
                            borderRadius: '9999px',
                            border: '1px solid transparent',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            backgroundColor: reg.status === 'Approved' ? '#D1FAE5' : reg.status === 'Declined' ? '#FEE2E2' : '#FEF3C7',
                            color: reg.status === 'Approved' ? '#065F46' : reg.status === 'Declined' ? '#991B1B' : '#92400E',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Approved">Approved</option>
                          <option value="Declined">Declined</option>
                        </select>
                      </td>
                      <td>
                        <strong>{reg.title} {reg.fullName}</strong><br/>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{reg.position} • {reg.diocese}</span>
                      </td>
                      <td>
                        <a href={`mailto:${reg.emailAddress}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>{reg.emailAddress}</a><br/>
                        <span style={{ fontSize: '0.9rem' }}>{reg.whatsappNumber}</span>
                      </td>
                      <td>
                        {new Date(reg.dateOfArrival).toLocaleDateString()}
                      </td>
                      <td>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                          onClick={() => setSelectedReg(reg)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedReg && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(4px)'
        }}>
          <div className="card fade-in" style={{ width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>Registration Details</h2>
              <button onClick={() => setSelectedReg(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}>&times;</button>
            </div>
            
            <div className="grid grid-cols-2" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <strong style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Status</strong>
                <div style={{ marginTop: '0.25rem' }}>
                  <select 
                    value={selectedReg.status || 'Pending'} 
                    onChange={(e) => handleStatusChange(selectedReg.id, e.target.value)}
                    style={{ padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)' }}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Declined">Declined</option>
                  </select>
                </div>
              </div>
              <div>
                <strong style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Submitted On</strong>
                <div style={{ marginTop: '0.25rem' }}>{selectedReg.createdAt ? new Date(selectedReg.createdAt.toDate ? selectedReg.createdAt.toDate() : selectedReg.createdAt).toLocaleString() : 'N/A'}</div>
              </div>
            </div>

            <hr style={{ margin: '1.5rem 0', border: 'none', borderTop: '1px solid var(--border)' }} />

            <div className="grid grid-cols-2" style={{ gap: '1.5rem' }}>
              <div>
                <strong style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'block', marginBottom: '0.25rem' }}>Full Name</strong>
                {selectedReg.title} {selectedReg.fullName}
              </div>
              <div>
                <strong style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'block', marginBottom: '0.25rem' }}>Position</strong>
                {selectedReg.position}
              </div>
              <div>
                <strong style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'block', marginBottom: '0.25rem' }}>Diocese</strong>
                {selectedReg.diocese}
              </div>
              <div>
                <strong style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'block', marginBottom: '0.25rem' }}>Province</strong>
                {selectedReg.province}
              </div>
              <div>
                <strong style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'block', marginBottom: '0.25rem' }}>Email</strong>
                <a href={`mailto:${selectedReg.emailAddress}`} style={{ color: 'var(--primary)' }}>{selectedReg.emailAddress}</a>
              </div>
              <div>
                <strong style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'block', marginBottom: '0.25rem' }}>WhatsApp</strong>
                {selectedReg.whatsappNumber}
              </div>
            </div>

            <h3 style={{ margin: '2rem 0 1rem', fontSize: '1.1rem' }}>Travel Information</h3>
            <div className="grid grid-cols-2" style={{ gap: '1.5rem', background: '#F9FAFB', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
              <div>
                <strong style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'block', marginBottom: '0.25rem' }}>Arrival Date</strong>
                {selectedReg.dateOfArrival}
              </div>
              <div>
                <strong style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'block', marginBottom: '0.25rem' }}>Mode of Travel</strong>
                {selectedReg.modeOfTravel}
              </div>
              <div>
                <strong style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'block', marginBottom: '0.25rem' }}>Internal Transport Needed?</strong>
                {selectedReg.requireInternalTransport}
              </div>
              <div>
                <strong style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'block', marginBottom: '0.25rem' }}>Coming with Driver/Escort?</strong>
                {selectedReg.comingWithDriverEscort}
              </div>
              
              {selectedReg.comingWithDriverEscort === 'Yes' && (
                <>
                  <div>
                    <strong style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'block', marginBottom: '0.25rem' }}>Driver's Name</strong>
                    {selectedReg.driverName || 'Not provided'}
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'block', marginBottom: '0.25rem' }}>Escort's Name</strong>
                    {selectedReg.escortName || 'Not provided'}
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      )}
      
    </div>
  );
}
