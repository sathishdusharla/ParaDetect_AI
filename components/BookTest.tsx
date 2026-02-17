
import React, { useState } from 'react';
import { Calendar, MapPin, Clock, Home, Building2, CheckCircle, Loader2, Microscope, TestTube, Activity, Map, User } from 'lucide-react';
import { createBooking } from '../services/databaseService';
import { getCurrentUser } from '../services/supabaseClient';

interface BookTestProps {
  onBookingComplete: (details: any) => void;
  userEmail?: string;
}

const BookTest: React.FC<BookTestProps> = ({ onBookingComplete, userEmail }) => {
  const [formData, setFormData] = useState({
    testType: 'Microscopy Smear',
    locationType: 'Home Collection',
    date: '',
    time: '',
    address: '123 Maple Street, Apt 4B',
    contact: '+91 98765 43210'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [bookingId, setBookingId] = useState('');

  const testTypes = [
    { id: 'Microscopy Smear', label: 'Malaria Smear', icon: Microscope, price: '₹400', desc: 'Gold standard Giemsa stain analysis for species & stage.' },
    { id: 'RDT', label: 'Rapid Antigen', icon: Activity, price: '₹250', desc: 'Quick lateral flow test for Pf/Pv antigens.' },
    { id: 'Parasitemia Panel', label: 'Complete Panel', icon: TestTube, price: '₹1200', desc: 'Smear + CBC + PCR + Viral Markers.' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Get current user
      const currentUser = await getCurrentUser();
      if (!currentUser || !currentUser.email) {
        alert('Please login to book a test');
        return;
      }

      // Create booking in Supabase
      const booking = await createBooking(
        currentUser.email,
        formData.testType,
        formData.locationType,
        formData.date,
        formData.time,
        formData.address,
        formData.contact
      );

      setBookingId(booking.id);
      setIsSuccess(true);
      onBookingComplete(formData);
    } catch (error: any) {
      console.error('Booking error:', error);
      alert(`Booking failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-xl mx-auto pt-10 animate-fade-in">
        <div className="glass-card rounded-[2.5rem] p-12 text-center relative overflow-hidden shadow-2xl shadow-emerald-500/20 border border-emerald-100/50">
           <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
           <div className="relative z-10 flex flex-col items-center">
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-100">
                <CheckCircle className="w-12 h-12 text-emerald-600" />
              </div>
              <h2 className="text-3xl font-extrabold text-slate-800 mb-2">Booking Confirmed!</h2>
              <p className="text-slate-500 font-medium mb-8">Your appointment ID is <span className="font-bold text-slate-800">#{bookingId}</span>. A confirmation has been sent to your email.</p>
              
              <div className="w-full bg-white/60 rounded-2xl p-6 mb-8 text-left border border-white">
                  <div className="flex justify-between mb-3 border-b border-slate-100 pb-2">
                      <span className="text-xs font-bold text-slate-400 uppercase">Test Type</span>
                      <span className="text-sm font-bold text-slate-800">{formData.testType}</span>
                  </div>
                  <div className="flex justify-between mb-3 border-b border-slate-100 pb-2">
                      <span className="text-xs font-bold text-slate-400 uppercase">Date & Time</span>
                      <span className="text-sm font-bold text-slate-800">{formData.date} at {formData.time}</span>
                  </div>
                  <div className="flex justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase">Location</span>
                      <span className="text-sm font-bold text-slate-800">{formData.locationType}</span>
                  </div>
              </div>

              <button 
                onClick={() => setIsSuccess(false)}
                className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold uppercase tracking-wider shadow-lg hover:bg-emerald-700 transition-all w-full btn-glossy"
              >
                Book Another Test
              </button>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-in pb-12">
        <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center mr-4 text-rose-500 shadow-sm border border-rose-100">
                <Calendar className="w-6 h-6" />
            </div>
            <div>
                <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Schedule Diagnostic Test</h2>
                <p className="text-slate-500 font-medium">Select your preferred test type and collection method.</p>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Col: Test Selection */}
            <div className="lg:col-span-2 space-y-8">
                {/* Step 1: Test Type */}
                <section>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 ml-1">1. Select Test Panel</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {testTypes.map((type) => (
                            <div 
                                key={type.id}
                                onClick={() => setFormData({...formData, testType: type.id})}
                                className={`cursor-pointer rounded-[2rem] p-6 border transition-all duration-300 relative overflow-hidden group ${formData.testType === type.id ? 'bg-white border-rose-500 shadow-xl shadow-rose-100 scale-[1.02]' : 'bg-white/40 border-white hover:bg-white/60 hover:border-rose-200'}`}
                            >
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors ${formData.testType === type.id ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-rose-50 group-hover:text-rose-500'}`}>
                                    <type.icon className="w-6 h-6" />
                                </div>
                                <h3 className="font-extrabold text-slate-800 text-lg mb-1">{type.label}</h3>
                                <p className="text-xs text-slate-500 font-medium leading-relaxed mb-4 min-h-[40px]">{type.desc}</p>
                                <span className="font-extrabold text-slate-900 bg-slate-50 px-3 py-1 rounded-lg text-sm">{type.price}</span>
                                {formData.testType === type.id && (
                                    <div className="absolute top-4 right-4 text-rose-500">
                                        <CheckCircle className="w-6 h-6 fill-current" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* Step 2: Location */}
                <section>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 ml-1">2. Collection Method</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div 
                            onClick={() => setFormData({...formData, locationType: 'Home Collection'})}
                            className={`flex items-center p-6 rounded-[2rem] border cursor-pointer transition-all ${formData.locationType === 'Home Collection' ? 'bg-white border-blue-500 shadow-xl shadow-blue-100' : 'bg-white/40 border-white hover:border-blue-200'}`}
                        >
                            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mr-4 flex-shrink-0">
                                <Home className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 text-lg">Home Collection</h4>
                                <p className="text-xs text-slate-500 font-medium">Technician visits your address</p>
                            </div>
                            {formData.locationType === 'Home Collection' && <div className="ml-auto w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-sm ring-2 ring-blue-200"></div>}
                        </div>
                        <div 
                            onClick={() => setFormData({...formData, locationType: 'Lab Visit'})}
                            className={`flex items-center p-6 rounded-[2rem] border cursor-pointer transition-all ${formData.locationType === 'Lab Visit' ? 'bg-white border-blue-500 shadow-xl shadow-blue-100' : 'bg-white/40 border-white hover:border-blue-200'}`}
                        >
                            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mr-4 flex-shrink-0">
                                <Building2 className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 text-lg">Lab Visit</h4>
                                <p className="text-xs text-slate-500 font-medium">Visit nearest ParaDetect Center</p>
                            </div>
                            {formData.locationType === 'Lab Visit' && <div className="ml-auto w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-sm ring-2 ring-blue-200"></div>}
                        </div>
                    </div>
                </section>
                
                {/* Step 3: Date & Time */}
                <section className="glass-card rounded-[2rem] p-8 border border-white/60">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-6 ml-1">3. Schedule Appointment</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="group">
                             <div className="flex items-center space-x-2 mb-2 text-slate-500 font-bold text-sm">
                                <Calendar className="w-4 h-4" />
                                <span>Preferred Date</span>
                             </div>
                             <input 
                                type="date" 
                                required
                                value={formData.date}
                                onChange={(e) => setFormData({...formData, date: e.target.value})}
                                className="w-full input-3d rounded-xl px-5 py-4 font-bold text-slate-800 focus:ring-2 focus:ring-rose-500 outline-none"
                             />
                        </div>
                        <div className="group">
                             <div className="flex items-center space-x-2 mb-2 text-slate-500 font-bold text-sm">
                                <Clock className="w-4 h-4" />
                                <span>Time Slot</span>
                             </div>
                             <select 
                                required
                                value={formData.time}
                                onChange={(e) => setFormData({...formData, time: e.target.value})}
                                className="w-full input-3d rounded-xl px-5 py-4 font-bold text-slate-800 focus:ring-2 focus:ring-rose-500 outline-none appearance-none bg-transparent"
                             >
                                <option value="">Select Time</option>
                                <option value="09:00 AM">09:00 AM - 10:00 AM</option>
                                <option value="10:00 AM">10:00 AM - 11:00 AM</option>
                                <option value="11:00 AM">11:00 AM - 12:00 PM</option>
                                <option value="02:00 PM">02:00 PM - 03:00 PM</option>
                                <option value="04:00 PM">04:00 PM - 05:00 PM</option>
                             </select>
                        </div>
                    </div>
                </section>
            </div>

            {/* Right Col: Contact & Confirmation */}
            <div className="lg:col-span-1">
                <div className="sticky top-6 space-y-6">
                    <div className="glass-card rounded-[2.5rem] p-8 border border-white/60 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                        <h3 className="text-xl font-extrabold text-slate-800 mb-6 relative z-10">Patient Details</h3>
                        
                        <div className="space-y-4 relative z-10">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Contact Number</label>
                                <div className="flex items-center input-3d rounded-xl px-4 py-3">
                                    <User className="w-4 h-4 text-slate-400 mr-3" />
                                    <input 
                                        type="tel" 
                                        value={formData.contact}
                                        onChange={(e) => setFormData({...formData, contact: e.target.value})}
                                        className="bg-transparent border-none outline-none font-bold text-slate-700 w-full"
                                    />
                                </div>
                            </div>

                            {formData.locationType === 'Home Collection' && (
                                <div className="animate-fade-in">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Collection Address</label>
                                    <div className="flex items-start input-3d rounded-xl px-4 py-3">
                                        <Map className="w-4 h-4 text-slate-400 mr-3 mt-1" />
                                        <textarea 
                                            rows={3}
                                            value={formData.address}
                                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                                            className="bg-transparent border-none outline-none font-bold text-slate-700 w-full resize-none text-sm"
                                        ></textarea>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/50">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-slate-500">Service Fee</span>
                                <span className="font-bold text-slate-800">{testTypes.find(t => t.id === formData.testType)?.price}</span>
                            </div>
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-sm font-medium text-slate-500">Location Charge</span>
                                <span className="font-bold text-slate-800">{formData.locationType === 'Home Collection' ? '₹150' : '₹0'}</span>
                            </div>
                            <button 
                                type="submit"
                                disabled={isSubmitting || !formData.date || !formData.time}
                                className={`w-full py-4 rounded-xl font-bold uppercase tracking-wider shadow-lg flex items-center justify-center transition-all btn-glossy ${isSubmitting || !formData.date || !formData.time ? 'bg-slate-300 text-white cursor-not-allowed' : 'bg-navy-900 text-white hover:bg-navy-800 hover:-translate-y-1 shadow-navy-900/30'}`}
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" /> : "Confirm Booking"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    </div>
  );
};

export default BookTest;
