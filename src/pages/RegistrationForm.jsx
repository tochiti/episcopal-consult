import React, { useState } from 'react';
import { saveRegistration } from '../db';
import { CheckCircle } from 'lucide-react';

export default function RegistrationForm() {
  const [formData, setFormData] = useState({
    title: '',
    fullName: '',
    position: '',
    diocese: '',
    province: '',
    whatsappNumber: '',
    emailAddress: '',
    dateOfArrival: '',
    modeOfTravel: '',
    requireInternalTransport: 'No',
    comingWithDriverEscort: 'No',
    driverName: '',
    escortName: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await saveRegistration(formData);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Error saving registration', error);
      alert('There was an error submitting your registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#FDFCF0] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-12 max-w-lg w-full text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#2E0052] via-[#D4AF37] to-[#B22222]"></div>
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-3xl font-serif font-bold text-[#1B1C15] mb-4">Registration Successful!</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Thank you for registering for the Episcopal Consultation. Your submission has been received and is currently <strong className="text-amber-600">Pending Review</strong>.
          </p>
          <div className="bg-[#f5f4e8] p-4 rounded-lg mb-8">
            <p className="text-sm text-[#4c4451]">
              You can check the status of your registration at any time by visiting the 
              <a href="/dashboard" className="text-[#2E0052] font-semibold underline ml-1">User Dashboard</a>.
            </p>
          </div>
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full bg-[#D4AF37] hover:bg-[#c5a030] text-[#2E0052] font-bold py-3 rounded-lg transition-colors"
          >
            Submit Another Registration
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCF0] font-sans">
      {/* Header */}
      <header className="bg-[#2E0052] text-white py-8 px-4 shadow-lg border-b-4 border-[#D4AF37]">
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
          <img src="/logo.png" alt="DNDN Logo" className="w-24 h-24 object-contain bg-white rounded-full p-2 shadow-md" />
          <div>
            <h3 className="text-[#DDB7FF] font-semibold tracking-wider text-sm mb-1 uppercase">Church of Nigeria (Anglican Communion)</h3>
            <h1 className="text-3xl md:text-4xl font-bold font-serif mb-2">Episcopal Consultation</h1>
            <h2 className="text-xl md:text-2xl text-white/90 font-serif">Diocese of Niger Delta North (DNDN)</h2>
          </div>
        </div>
      </header>

      {/* Main Form */}
      <main className="max-w-3xl mx-auto p-4 md:p-8 -mt-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-10">
          <h4 className="text-xl font-serif font-bold text-[#1B1C15] mb-6 pb-2 border-b-2 border-gray-100">Personal Information</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Title <span className="text-red-500">*</span></label>
              <input type="text" name="title" required value={formData.title} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#2E0052] focus:border-transparent outline-none transition-all" placeholder="e.g. Ven." />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name <span className="text-red-500">*</span></label>
              <input type="text" name="fullName" required value={formData.fullName} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#2E0052] focus:border-transparent outline-none transition-all" placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Position <span className="text-red-500">*</span></label>
              <input type="text" name="position" required value={formData.position} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#2E0052] focus:border-transparent outline-none transition-all" placeholder="Archdeacon" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Diocese <span className="text-red-500">*</span></label>
              <input type="text" name="diocese" required value={formData.diocese} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#2E0052] focus:border-transparent outline-none transition-all" placeholder="Niger Delta North" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Province <span className="text-red-500">*</span></label>
              <input type="text" name="province" required value={formData.province} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#2E0052] focus:border-transparent outline-none transition-all" placeholder="Niger Delta" />
            </div>
          </div>

          <h4 className="text-xl font-serif font-bold text-[#1B1C15] mb-6 pb-2 border-b-2 border-gray-100">Contact Information</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">WhatsApp Number <span className="text-red-500">*</span></label>
              <input type="tel" name="whatsappNumber" required value={formData.whatsappNumber} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#2E0052] focus:border-transparent outline-none transition-all" placeholder="+234..." />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address <span className="text-red-500">*</span></label>
              <input type="email" name="emailAddress" required value={formData.emailAddress} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#2E0052] focus:border-transparent outline-none transition-all" placeholder="email@example.com" />
            </div>
          </div>

          <h4 className="text-xl font-serif font-bold text-[#1B1C15] mb-6 pb-2 border-b-2 border-gray-100">Travel Details</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Arrival <span className="text-red-500">*</span></label>
              <input type="date" name="dateOfArrival" required value={formData.dateOfArrival} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#2E0052] focus:border-transparent outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Mode of Travel <span className="text-red-500">*</span></label>
              <select name="modeOfTravel" required value={formData.modeOfTravel} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#2E0052] focus:border-transparent outline-none transition-all bg-white">
                <option value="">Select Mode</option>
                <option value="Air">Air</option>
                <option value="Road">Road</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Require Internal Transport?</label>
              <select name="requireInternalTransport" value={formData.requireInternalTransport} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#2E0052] focus:border-transparent outline-none transition-all bg-white">
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Coming with Driver/Escort?</label>
              <select name="comingWithDriverEscort" value={formData.comingWithDriverEscort} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#2E0052] focus:border-transparent outline-none transition-all bg-white">
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
            
            {formData.comingWithDriverEscort === 'Yes' && (
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-[#f5f4e8] rounded-xl border border-[#e9e9dd]">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Driver's Name</label>
                  <input type="text" name="driverName" value={formData.driverName} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#2E0052] outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Escort's Name</label>
                  <input type="text" name="escortName" value={formData.escortName} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#2E0052] outline-none" />
                </div>
              </div>
            )}
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#2E0052] hover:bg-[#4b0082] text-white font-bold py-4 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-70 text-lg flex justify-center items-center gap-2"
          >
            {loading ? 'Submitting...' : 'Complete Registration'}
          </button>
          
          <div className="mt-6 text-center text-sm text-gray-500">
            Already registered? <a href="/dashboard" className="text-[#2E0052] font-semibold hover:underline">Check your status here.</a>
          </div>
        </form>
      </main>
      
      <footer className="py-8 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Diocese of Niger Delta North. All rights reserved.
      </footer>
    </div>
  );
}
