import React, { useState } from 'react';
import { saveRegistration } from '../db';

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
    escortName: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await saveRegistration(formData);
      setSubmitted(true);
      window.scrollTo(0,0);
    } catch (error) {
      console.error('Error saving registration', error);
      alert('There was an error submitting your registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="container flex-center" style={{ minHeight: '80vh' }}>
        <div className="card" style={{ textAlign: 'center', maxWidth: '500px' }}>
          <div style={{ fontSize: '3rem', color: 'var(--secondary)', marginBottom: '1rem' }}>✓</div>
          <h2>Registration Successful</h2>
          <p style={{ marginTop: '1rem', marginBottom: '2rem' }}>
            Thank you for registering for the Church of Nigeria Episcopal Consultation. We look forward to seeing you.
          </p>
          <button className="btn btn-secondary" onClick={() => {
            setFormData({
              title: '', fullName: '', position: '', diocese: '', province: '',
              whatsappNumber: '', emailAddress: '', dateOfArrival: '', modeOfTravel: '',
              requireInternalTransport: 'No', comingWithDriverEscort: 'No',
              driverName: '', escortName: ''
            });
            setSubmitted(false);
          }}>
            Submit Another Registration
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      <div className="app-header fade-in">
        <h1>Episcopal Consultation</h1>
        <p>Global Anglican Communion - Diocese of Niger Delta North</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <h3 style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
            Personal Details
          </h3>
          
          <div className="grid grid-cols-2">
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required placeholder="e.g. Rt. Rev." />
            </div>

            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} required placeholder="Your full name" />
            </div>

            <div className="form-group">
              <label htmlFor="position">Position</label>
              <input type="text" id="position" name="position" value={formData.position} onChange={handleChange} required placeholder="e.g. Diocesan Bishop" />
            </div>

            <div className="form-group">
              <label htmlFor="diocese">Diocese</label>
              <input type="text" id="diocese" name="diocese" value={formData.diocese} onChange={handleChange} required placeholder="Your Diocese" />
            </div>

            <div className="form-group">
              <label htmlFor="province">Province</label>
              <input type="text" id="province" name="province" value={formData.province} onChange={handleChange} required placeholder="Your Province" />
            </div>

            <div className="form-group">
              <label htmlFor="whatsappNumber">WhatsApp Number</label>
              <input type="text" id="whatsappNumber" name="whatsappNumber" value={formData.whatsappNumber} onChange={handleChange} required placeholder="Include country code" />
            </div>

            <div className="form-group">
              <label htmlFor="emailAddress">Email Address</label>
              <input type="email" id="emailAddress" name="emailAddress" value={formData.emailAddress} onChange={handleChange} required placeholder="your.email@example.com" />
            </div>

            <div className="form-group">
              <label htmlFor="dateOfArrival">Date of Arrival</label>
              <input type="date" id="dateOfArrival" name="dateOfArrival" value={formData.dateOfArrival} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label htmlFor="modeOfTravel">Mode of Travel</label>
              <select id="modeOfTravel" name="modeOfTravel" value={formData.modeOfTravel} onChange={handleChange} required>
                <option value="">Select Mode</option>
                <option value="Flight">Flight</option>
                <option value="Road">Road</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
            <div className="form-group">
              <label>Do you require internal transportation?</label>
              <div className="radio-group">
                <label className="radio-item">
                  <input type="radio" name="requireInternalTransport" value="Yes" checked={formData.requireInternalTransport === 'Yes'} onChange={handleChange} />
                  Yes
                </label>
                <label className="radio-item">
                  <input type="radio" name="requireInternalTransport" value="No" checked={formData.requireInternalTransport === 'No'} onChange={handleChange} />
                  No
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>Is Your Grace/Your Lordship coming with your driver/escort?</label>
              <div className="radio-group">
                <label className="radio-item">
                  <input type="radio" name="comingWithDriverEscort" value="Yes" checked={formData.comingWithDriverEscort === 'Yes'} onChange={handleChange} />
                  Yes
                </label>
                <label className="radio-item">
                  <input type="radio" name="comingWithDriverEscort" value="No" checked={formData.comingWithDriverEscort === 'No'} onChange={handleChange} />
                  No
                </label>
              </div>
            </div>

            {formData.comingWithDriverEscort === 'Yes' && (
              <div className="grid grid-cols-2" style={{ marginTop: '1rem', background: '#F9FAFB', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="driverName">Driver's Name</label>
                  <input type="text" id="driverName" name="driverName" value={formData.driverName} onChange={handleChange} placeholder="Enter driver's name" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="escortName">Escort's Name</label>
                  <input type="text" id="escortName" name="escortName" value={formData.escortName} onChange={handleChange} placeholder="Enter escort's name" />
                </div>
              </div>
            )}
          </div>

          <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Registration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
