import React, { useState } from 'react';
import { getRegistrationByEmail } from '../db';
import { Search, CheckCircle, Clock, XCircle, ChevronRight } from 'lucide-react';

export default function UserDashboard() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    setSearched(true);
    try {
      const reg = await getRegistrationByEmail(email);
      setResult(reg || null);
    } catch (error) {
      console.error(error);
      alert("Error looking up registration.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return (
          <div className="flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full font-semibold border border-emerald-200">
            <CheckCircle className="w-5 h-5" /> Approved
          </div>
        );
      case 'Declined':
        return (
          <div className="flex items-center gap-2 bg-red-100 text-red-800 px-4 py-2 rounded-full font-semibold border border-red-200">
            <XCircle className="w-5 h-5" /> Declined
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full font-semibold border border-amber-200">
            <Clock className="w-5 h-5" /> Pending Review
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF0] font-sans">
      {/* Header */}
      <header className="bg-[#2E0052] text-white p-4 shadow-md border-b-4 border-[#D4AF37]">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="DNDN Logo" className="w-12 h-12 object-contain bg-white rounded-full p-1" />
            <div>
              <h1 className="text-xl md:text-2xl font-bold font-serif">Episcopal Consult DNDN</h1>
              <p className="text-sm text-[#DDB7FF]">Registration Tracker</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-xl mx-auto p-6 mt-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#2E0052] via-[#D4AF37] to-[#B22222]"></div>
          
          <h2 className="text-2xl font-serif font-bold text-[#1B1C15] mb-2">Check Your Status</h2>
          <p className="text-gray-600 mb-6">Enter the email address you used during registration to track your application.</p>
          
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <input 
              type="email" 
              placeholder="Enter your email address..." 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2E0052] focus:border-transparent transition-all"
            />
            <button 
              type="submit" 
              disabled={loading}
              className="bg-[#D4AF37] hover:bg-[#c5a030] text-[#2E0052] font-bold px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
            >
              {loading ? 'Searching...' : 'Lookup'} 
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Results Section */}
        {searched && !loading && (
          <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {result ? (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-6 md:p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-sm font-semibold text-[#D4AF37] uppercase tracking-wider mb-1">Registration Found</h3>
                      <p className="text-2xl font-serif font-bold text-[#1B1C15]">
                        {result.title} {result.fullName}
                      </p>
                    </div>
                    {getStatusBadge(result.status)}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Diocese</p>
                      <p className="font-medium text-[#1B1C15]">{result.diocese}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Position</p>
                      <p className="font-medium text-[#1B1C15]">{result.position}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Date of Arrival</p>
                      <p className="font-medium text-[#1B1C15]">{new Date(result.dateOfArrival).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Mode of Travel</p>
                      <p className="font-medium text-[#1B1C15]">{result.modeOfTravel}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-[#f5f4e8] px-6 py-4 flex justify-between items-center">
                  <p className="text-sm text-gray-600">Need to make changes? Contact the administrator.</p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-8 text-center">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-serif font-bold text-[#1B1C15] mb-2">No Registration Found</h3>
                <p className="text-gray-600">We couldn't find a registration matching that email address. Please double-check for typos or contact support.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
