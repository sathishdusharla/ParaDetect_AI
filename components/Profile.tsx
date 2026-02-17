
import React, { useState } from 'react';
import { User, LogOut, FileText, Calendar, Activity, Edit2, Clock, CheckCircle, AlertTriangle, Pill, ChevronRight, MapPin, Stethoscope, Award, Fingerprint } from 'lucide-react';
import { Report, UserRole } from '../types';

interface ProfileProps {
  onLogout: () => void;
  records: Report[];
  role?: UserRole;
  userEmail?: string;
  patientId?: string;
  userName?: string;
}

const Profile: React.FC<ProfileProps> = ({ onLogout, records, role = 'patient', userEmail, patientId, userName }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'bookings' | 'recovery'>('overview');

  // Doctor Profile View - Simplified as requested
  if (role === 'doctor') {
      return (
        <div className="max-w-2xl mx-auto animate-fade-in pt-12 pb-12">
            <div className="glass-card rounded-[3rem] p-12 text-center relative overflow-hidden shadow-2xl shadow-navy-900/20 border border-white/60">
                {/* Decorative backgrounds */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>

                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-36 h-36 rounded-full p-1.5 bg-gradient-to-tr from-rose-500 to-teal-500 shadow-2xl mb-8">
                        <img 
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName || 'Doctor'}`}
                            alt="Doctor Profile" 
                            className="w-full h-full rounded-full bg-white object-cover border-4 border-white"
                        />
                    </div>
                    
                    <h1 className="text-4xl font-extrabold text-slate-800 mb-3 tracking-tight">{userName || 'Doctor'}</h1>
                    
                    <div className="flex items-center space-x-2 mb-10">
                        <Award className="w-5 h-5 text-rose-500" />
                        <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Medical Professional</span>
                    </div>

                    <div className="w-full bg-white/50 rounded-[2rem] p-8 border border-white shadow-inner mb-10">
                        <div className="grid grid-cols-1 gap-6">
                            <div className="flex items-center justify-between border-b border-slate-200/60 pb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-blue-50 rounded-xl text-blue-500">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <span className="text-sm font-bold text-slate-600">Email</span>
                                </div>
                                <span className="text-sm font-bold text-slate-800">{userEmail || 'N/A'}</span>
                            </div>
                            <div className="flex items-center justify-between pt-2">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-emerald-50 rounded-xl text-emerald-500">
                                        <Fingerprint className="w-5 h-5" />
                                    </div>
                                    <span className="text-sm font-bold text-slate-600">Staff ID</span>
                                </div>
                                <span className="text-sm font-bold text-slate-800 font-mono">{patientId || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={onLogout}
                        className="bg-navy-900 text-white px-10 py-4 rounded-2xl font-bold text-xs uppercase tracking-wider hover:bg-navy-800 hover:scale-105 transition-all shadow-xl shadow-navy-900/20 flex items-center btn-glossy"
                    >
                        <LogOut className="w-4 h-4 mr-2" /> Secure Logout
                    </button>
                </div>
            </div>
        </div>
      );
  }

  // PATIENT VIEW LOGIC (Unchanged)
  // Sort records by date descending for "Latest" logic
  const sortedRecords = [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const latestRecord = sortedRecords.length > 0 ? sortedRecords[0] : null;

  // Mock Bookings Data
  const bookings = [
    { id: 'BK-2026-001', type: 'Home Sample Collection', date: '2026-02-20T09:00:00', status: 'Confirmed', location: 'Home (123 Maple St)' },
    { id: 'BK-2025-098', type: 'Lab Visit - Follow up', date: '2025-12-15T14:30:00', status: 'Completed', location: 'City Lab, Center' }
  ];

  const renderTabContent = () => {
      switch (activeTab) {
          case 'overview':
              return (
                <div className="animate-fade-in">
                    <div className="flex justify-between items-center mb-10">
                        <h2 className="text-3xl font-bold text-slate-800">Personal Information</h2>
                        <button className="bg-slate-100 text-slate-600 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[#0B1120] hover:text-white transition-colors flex items-center shadow-sm hover:shadow-lg">
                            <Edit2 className="w-4 h-4 mr-2" /> Edit Profile
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="input-3d rounded-[2rem] p-8">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Full Name</label>
                        <p className="text-xl font-bold text-slate-800">{userName || 'Patient User'}</p>
                        </div>
                        <div className="input-3d rounded-[2rem] p-8">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Email</label>
                        <p className="text-xl font-bold text-slate-800">{userEmail || 'N/A'}</p>
                        </div>
                        <div className="input-3d rounded-[2rem] p-8">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Patient ID</label>
                        <p className="text-xl font-bold text-slate-800 font-mono">{patientId || 'N/A'}</p>
                        </div>
                        <div className="input-3d rounded-[2rem] p-8">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Blood Type</label>
                        <p className="text-xl font-bold text-slate-800">O+</p>
                        </div>
                    </div>
                </div>
              );
          
          case 'reports':
              return (
                <div className="space-y-6 animate-fade-in">
                    <h2 className="text-3xl font-bold text-slate-800 mb-6 flex items-center">
                        <FileText className="w-8 h-8 mr-3 text-rose-500" /> Clinical Summaries
                    </h2>
                    {sortedRecords.length === 0 ? (
                        <div className="text-center py-12 bg-slate-50 rounded-[2rem] border-dashed border-2 border-slate-200">
                            <p className="text-slate-400 font-bold">No reports available in history.</p>
                        </div>
                    ) : (
                        sortedRecords.map((record) => (
                            <div key={record.id} className="bg-white/60 rounded-[2rem] p-8 border border-white shadow-sm hover:shadow-md transition-all group">
                                <div className="flex flex-col md:flex-row justify-between md:items-center mb-6">
                                    <div className="mb-4 md:mb-0">
                                        <div className="flex items-center space-x-3 mb-1">
                                            <span className={`w-3 h-3 rounded-full ${record.result?.isInfected ? 'bg-rose-500' : 'bg-teal-500'} shadow-[0_0_10px_currentColor]`}></span>
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{new Date(record.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                        </div>
                                        <h3 className="text-xl font-extrabold text-slate-800">
                                            {record.result?.isInfected ? `${record.result.species} Infection` : 'Negative Screening'}
                                        </h3>
                                    </div>
                                    <div className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border ${record.result?.isInfected ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-teal-50 text-teal-600 border-teal-100'}`}>
                                        {record.result?.isInfected ? 'Action Required' : 'Cleared'}
                                    </div>
                                </div>
                                
                                <div className="bg-slate-50/80 rounded-2xl p-6 mb-6 border border-slate-100">
                                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                        <span className="text-slate-400 font-bold uppercase text-[10px] block mb-2">Microscopic Findings</span>
                                        {record.result?.explanation}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between">
                                     <div className="flex items-center space-x-2">
                                         <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500">
                                             <Activity className="w-4 h-4" />
                                         </div>
                                         <span className="text-xs font-bold text-slate-600">
                                             {record.result?.isInfected 
                                                ? `Start Protocol: ${record.result?.treatmentRecommendation?.split(':')[0] || 'Antimalarial Therapy'}`
                                                : 'Routine prevention recommended.'}
                                         </span>
                                     </div>
                                     <button className="text-rose-500 font-bold text-xs uppercase tracking-wider hover:underline flex items-center">
                                         Full Report <ChevronRight className="w-4 h-4 ml-1" />
                                     </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
              );

          case 'bookings':
              return (
                  <div className="space-y-6 animate-fade-in">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-3xl font-bold text-slate-800 flex items-center">
                            <Calendar className="w-8 h-8 mr-3 text-blue-500" /> Appointments
                        </h2>
                        <button className="bg-navy-900 text-white px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg btn-glossy">
                            New Booking
                        </button>
                      </div>
                      
                      {bookings.map((booking) => (
                          <div key={booking.id} className="glass-panel p-8 rounded-[2rem] border border-white/60 hover:border-rose-200 transition-colors relative overflow-hidden">
                               <div className={`absolute left-0 top-0 bottom-0 w-2 ${booking.status === 'Confirmed' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                               <div className="flex flex-col md:flex-row justify-between md:items-center">
                                   <div className="mb-4 md:mb-0 pl-4">
                                       <div className="flex items-center space-x-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                                           <span>ID: {booking.id}</span>
                                           <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                           <span>{new Date(booking.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                       </div>
                                       <h3 className="text-xl font-extrabold text-slate-800 mb-2">{booking.type}</h3>
                                       <div className="flex items-center text-sm text-slate-500 font-medium">
                                           <MapPin className="w-4 h-4 mr-1 text-slate-400" />
                                           {booking.location}
                                       </div>
                                   </div>
                                   
                                   <div className="flex flex-col items-end pl-4">
                                       <div className="text-2xl font-extrabold text-slate-800 mb-1">
                                           {new Date(booking.date).getDate()} <span className="text-base font-bold text-slate-400 uppercase">{new Date(booking.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                                       </div>
                                       <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${booking.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                           {booking.status}
                                       </span>
                                   </div>
                               </div>
                          </div>
                      ))}
                  </div>
              );

          case 'recovery':
              if (!latestRecord) {
                  return (
                      <div className="text-center py-20 bg-white/40 rounded-[2rem] border border-dashed border-slate-300 animate-fade-in">
                          <Activity className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                          <p className="text-slate-500 font-bold">No analysis history found. Unable to generate recovery plan.</p>
                      </div>
                  );
              }

              const isInfected = latestRecord.result?.isInfected;

              return (
                  <div className="animate-fade-in space-y-8">
                       <div className={`rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden ${isInfected ? 'bg-gradient-to-br from-rose-500 to-rose-600 shadow-rose-500/30' : 'bg-gradient-to-br from-teal-500 to-teal-600 shadow-teal-500/30'}`}>
                           {/* Background FX */}
                           <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
                           <div className="relative z-10">
                               <h2 className="text-3xl font-extrabold mb-2">
                                   {isInfected ? 'Active Treatment Phase' : 'Maintenance Phase'}
                               </h2>
                               <p className="opacity-90 text-lg font-medium max-w-2xl">
                                   Based on your latest analysis from {new Date(latestRecord.date).toLocaleDateString()}.
                               </p>
                               
                               <div className="mt-8 flex items-center space-x-4">
                                   <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 flex-1 border border-white/20">
                                       <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">Next Checkup</p>
                                       <p className="text-xl font-extrabold">{new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
                                   </div>
                                   <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 flex-1 border border-white/20">
                                       <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">Risk Status</p>
                                       <p className="text-xl font-extrabold">{isInfected ? latestRecord.result?.severity : 'Low Risk'}</p>
                                   </div>
                               </div>
                           </div>
                       </div>

                       {isInfected ? (
                           <div className="glass-panel p-10 rounded-[2.5rem] border border-white/60">
                               <div className="flex items-center mb-6">
                                   <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mr-4">
                                       <Pill className="w-6 h-6" />
                                   </div>
                                   <div>
                                       <h3 className="text-xl font-bold text-slate-800">Prescribed Medication</h3>
                                       <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Dosage calculated for {latestRecord.result?.severity} Infection</p>
                                   </div>
                               </div>
                               
                               <div className="bg-white/50 rounded-2xl p-6 border border-white mb-6">
                                   <p className="text-slate-700 font-bold leading-loose whitespace-pre-wrap text-lg">
                                       {latestRecord.result?.treatmentRecommendation}
                                   </p>
                               </div>

                               <div className="flex items-start space-x-3 bg-amber-50 p-4 rounded-xl border border-amber-100 text-amber-800 text-sm font-medium">
                                   <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                   <p>Complete the full course of medication even if symptoms subside. If fever persists after 24 hours, contact your doctor immediately.</p>
                               </div>
                           </div>
                       ) : (
                           <div className="glass-panel p-10 rounded-[2.5rem] border border-white/60">
                               <div className="flex items-center mb-6">
                                   <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-500 mr-4">
                                       <CheckCircle className="w-6 h-6" />
                                   </div>
                                   <div>
                                       <h3 className="text-xl font-bold text-slate-800">Prevention & Wellness</h3>
                                       <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Standard Protocol</p>
                                   </div>
                               </div>
                               
                               <ul className="space-y-4">
                                   {['Use insecticide-treated mosquito nets daily.', 'Apply insect repellent containing DEET when outdoors.', 'Wear long-sleeved clothing during dawn and dusk.', 'Eliminate standing water sources around your residence.'].map((tip, idx) => (
                                       <li key={idx} className="flex items-center p-4 bg-white/40 rounded-xl border border-white/50">
                                           <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold text-xs mr-4">{idx + 1}</div>
                                           <span className="text-slate-700 font-medium">{tip}</span>
                                       </li>
                                   ))}
                               </ul>
                           </div>
                       )}
                  </div>
              );

          default:
              return null;
      }
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in pb-12">
      {/* Top Card */}
      <div className="glass-card rounded-[3rem] p-10 md:p-14 shadow-2xl shadow-slate-200/50 mb-10 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center mb-16">
           <div>
             <h1 className="text-5xl font-extrabold text-slate-900 mb-2 tracking-tight">Sai Keerthi Miryala</h1>
             <p className="text-sm font-bold text-slate-500 uppercase tracking-widest bg-white/50 inline-block px-3 py-1 rounded-lg backdrop-blur-sm">24EG105A33@ANURAG.EDU.IN</p>
           </div>
           <button 
             onClick={onLogout}
             className="mt-6 md:mt-0 bg-white border border-slate-200 text-slate-700 px-8 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all shadow-lg flex items-center"
           >
             <LogOut className="w-4 h-4 mr-2" /> Logout
           </button>
        </div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="bg-rose-50/50 backdrop-blur-sm rounded-[2rem] p-8 border border-rose-100 hover:scale-105 transition-transform duration-300">
             <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-white rounded-xl shadow-sm text-rose-500">
                   <FileText className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-rose-500 uppercase tracking-wider">Total Reports</span>
             </div>
             <p className="text-5xl font-extrabold text-slate-800">{records.length}</p>
           </div>
           <div className="bg-blue-50/50 backdrop-blur-sm rounded-[2rem] p-8 border border-blue-100 hover:scale-105 transition-transform duration-300">
             <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-white rounded-xl shadow-sm text-blue-500">
                   <Calendar className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-blue-500 uppercase tracking-wider">Active Bookings</span>
             </div>
             <p className="text-5xl font-extrabold text-slate-800">{bookings.filter(b => b.status === 'Confirmed').length}</p>
           </div>
           <div className="bg-emerald-50/50 backdrop-blur-sm rounded-[2rem] p-8 border border-emerald-100 hover:scale-105 transition-transform duration-300">
             <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-white rounded-xl shadow-sm text-emerald-500">
                   <Activity className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Recovery Plans</span>
             </div>
             <p className="text-5xl font-extrabold text-slate-800">{latestRecord?.result?.isInfected ? '1' : '0'}</p>
           </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-10 overflow-x-auto pb-4 px-2 no-scrollbar">
        {['overview', 'reports', 'bookings', 'recovery'].map((tab) => (
            <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-8 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all border shadow-sm flex-shrink-0 ${
                    activeTab === tab
                    ? 'bg-[#0B1120] text-white border-[#0B1120] shadow-xl shadow-[#0B1120]/20 transform -translate-y-0.5 btn-glossy'
                    : 'bg-white/60 backdrop-blur-md text-slate-500 border-white/60 hover:bg-white hover:text-rose-500'
                }`}
            >
                {tab}
            </button>
        ))}
      </div>

      {/* Dynamic Content Area */}
      <div className="glass-card rounded-[3rem] p-10 md:p-14 shadow-xl min-h-[500px] border border-white/60">
         {renderTabContent()}
      </div>
    </div>
  );
};

export default Profile;
