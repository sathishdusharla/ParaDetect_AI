
import React, { useState, useEffect } from 'react';
import { Droplets, Calendar, Users, Activity, Menu, X, ChevronRight, LayoutGrid, Stethoscope, User, LogOut, Bell, CheckCheck, Trash2 } from 'lucide-react';
import Dashboard from './components/Dashboard';
import ParasiteScan from './components/ParasiteScan';
import LabRiskPredictor from './components/LabRiskPredictor';
import MyRecords from './components/MyRecords';
import Profile from './components/Profile';
import BookTest from './components/BookTest';
import Auth from './components/Auth';
import About from './components/About';
import { View, Report, UserRole, Notification } from './types';
import { supabase, signOut, getCurrentUser, getUserProfile } from './services/supabaseClient';
import { 
  getReportsByEmail, 
  getAllReports, 
  getNotificationsByEmail, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  deleteNotification,
  getLabHistoryByEmail,
  subscribeToNotifications
} from './services/databaseService';
import { preloadModel } from './services/deepLearningModel';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [userRole, setUserRole] = useState<UserRole>('patient');
  const [userEmail, setUserEmail] = useState<string>('');
  const [patientId, setPatientId] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [records, setRecords] = useState<Report[]>([]);
  const [labHistory, setLabHistory] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    checkSession();
  }, []);

  // Preload Deep Learning model for fast analysis
  useEffect(() => {
    preloadModel();
  }, []);

  // Subscribe to real-time notifications
  useEffect(() => {
    if (isLoggedIn && userEmail && userRole === 'patient') {
      const subscription = subscribeToNotifications(userEmail, (newNotification) => {
        setNotifications(prev => [newNotification, ...prev]);
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [isLoggedIn, userEmail, userRole]);

  const checkSession = async () => {
    try {
      const user = await getCurrentUser();
      if (user && user.email) {
        const profile = await getUserProfile(user.email);
        setUserEmail(user.email);
        setPatientId(profile.patient_id);
        setUserRole(profile.role as UserRole);
        setUserName(profile.full_name);
        setIsLoggedIn(true);
        await loadUserData(user.email, profile.role as UserRole);
      }
    } catch (error) {
      console.error('Session check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async (email: string, role: UserRole) => {
    try {
      // Load records
      if (role === 'doctor') {
        const allReports = await getAllReports();
        setRecords(allReports);
      } else {
        const userReports = await getReportsByEmail(email);
        setRecords(userReports);
      }

      // Load notifications (patients only)
      if (role === 'patient') {
        const userNotifications = await getNotificationsByEmail(email);
        setNotifications(userNotifications);
      }

      // Load lab history
      const userLabHistory = await getLabHistoryByEmail(email);
      setLabHistory(userLabHistory);

    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const handleLogin = async (role: UserRole, email: string, patId: string, name: string) => {
    setUserRole(role);
    setUserEmail(email);
    setPatientId(patId);
    setUserName(name);
    setIsLoggedIn(true);
    await loadUserData(email, role);
  };

  // Filter records based on role (Mocking "My Records" vs "All Records")
  const displayedRecords = records;

  const handleScanComplete = async (data: any) => {
    // Data is already saved in the ParasiteScan component
    // Just reload records here
    await loadUserData(userEmail, userRole);
    
    // Send notification if patient
    if (userRole === 'doctor' && data.patient.email) {
      handleSendNotification(
        data.patient.email,
        "Analysis Complete", 
        `Your blood smear analysis has been completed. ${data.result.isInfected ? 'Malaria detected' : 'No infection found'}.`, 
        data.result.isInfected ? 'alert' : 'success'
      );
    }
  };

  const handleLabAnalysisComplete = async (data: any) => {
    // Lab history is saved in LabRiskPredictor component
    // Just reload here
    await loadUserData(userEmail, userRole);
  };

  const handleSendNotification = async (
    targetEmail: string, 
    title: string, 
    message: string, 
    type: 'alert' | 'info' | 'success' = 'info'
  ) => {
    try {
      const { createNotification } = await import('./services/databaseService');
      await createNotification(targetEmail, title, message, type);
      console.log(`✅ Notification sent to ${targetEmail}`);
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const deleteNotif = async (id: string) => {
    try {
      await deleteNotification(id);
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const formatNotificationDate = (dateString: string): string => {
    if (!dateString) return 'Just now';
    
    const date = new Date(dateString);
    const now = new Date();
    
    // Check if date is invalid
    if (isNaN(date.getTime())) return 'Just now';
    
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    // For older dates, show formatted date
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setIsLoggedIn(false);
      setActiveView('dashboard');
      setUserEmail('');
      setPatientId('');
      setUserName('');
      setRecords([]);
      setLabHistory([]);
      setNotifications([]);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const NavItem = ({ view, label }: { view: View; label: string }) => (
    <button
      onClick={() => {
        setActiveView(view);
        setIsMobileMenuOpen(false);
      }}
      className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 transform hover:-translate-y-0.5 btn-glossy relative overflow-hidden ${
        activeView === view 
          ? 'text-white bg-gradient-to-r from-rose-500 to-rose-600 shadow-lg shadow-rose-500/30 border border-rose-400/50' 
          : 'text-slate-600 hover:text-slate-800 hover:bg-white/60 border border-transparent'
      }`}
    >
      {label}
    </button>
  );

  if (!isLoggedIn) {
    return <Auth onLogin={handleLogin} />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-bold">Loading ParaDetect AI...</p>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="flex flex-col font-sans animate-fade-in relative z-10 min-h-screen">
      {/* Floating Glass Navigation Bar */}
      <header className="sticky top-4 z-50 px-4 md:px-6">
        <div className="max-w-7xl mx-auto glass-panel rounded-3xl shadow-2xl shadow-slate-300/20 relative z-20">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              {/* Logo */}
              <div className="flex items-center cursor-pointer group" onClick={() => setActiveView('dashboard')}>
                <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl shadow-lg shadow-rose-500/30 flex items-center justify-center mr-3 transform group-hover:scale-110 transition-transform duration-300 border border-rose-400">
                  <Droplets className="text-white w-6 h-6 fill-current" />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight drop-shadow-sm">ParaDetect <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500 italic">AI</span></h1>
                </div>
              </div>

              {/* Desktop Nav */}
              <nav className="hidden md:flex items-center space-x-2 bg-white/40 backdrop-blur-md p-1.5 rounded-full border border-white/50 shadow-inner">
                <NavItem view="dashboard" label="Home" />
                
                {userRole === 'doctor' && (
                  <>
                    <NavItem view="scan" label="Parasite Scan" />
                    <NavItem view="records" label="Records" />
                    <NavItem view="lab" label="Lab Risk" />
                  </>
                )}

                {userRole === 'patient' && (
                  <>
                    <NavItem view="records" label="My Registry" />
                    <NavItem view="lab" label="Lab Risk" />
                    <NavItem view="book" label="Book Test" />
                  </>
                )}
              </nav>

              {/* User Profile / CTA */}
              <div className="hidden md:flex items-center space-x-4">
                
                {/* Notification Bell (Only for Patient) */}
                {userRole === 'patient' && (
                    <div className="relative">
                        <button 
                            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                            className={`p-2.5 rounded-xl hover:bg-white/80 transition-colors relative ${isNotificationOpen ? 'text-rose-500 bg-white shadow-sm' : 'text-slate-500'}`}
                        >
                            <Bell className="w-6 h-6" />
                            {unreadCount > 0 && (
                                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full"></span>
                            )}
                        </button>

                        {/* Notification Dropdown */}
                        {isNotificationOpen && (
                            <div className="absolute top-14 right-0 w-80 md:w-96 glass-card rounded-[2rem] shadow-2xl p-4 animate-fade-in border border-white/60">
                                <div className="flex justify-between items-center mb-4 px-2">
                                    <h3 className="font-bold text-slate-800">Notifications</h3>
                                    <div className="flex items-center space-x-3">
                                      <button 
                                        onClick={async () => {
                                          await markAllNotificationsAsRead(userEmail);
                                          setNotifications(notifications.map(n => ({...n, read: true})));
                                        }} 
                                        className="text-xs font-bold text-rose-500 hover:underline"
                                      >
                                        Mark all read
                                      </button>
                                      <button 
                                        onClick={() => setIsNotificationOpen(false)} 
                                        className="p-1 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-500 transition-colors"
                                        title="Close Notifications"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                </div>
                                <div className="max-h-80 overflow-y-auto space-y-3 custom-scrollbar">
                                    {notifications.length === 0 ? (
                                        <p className="text-center text-slate-400 py-8 text-sm font-medium">No new notifications.</p>
                                    ) : (
                                        notifications.map(n => (
                                            <div key={n.id} className={`p-4 rounded-2xl border transition-all ${n.read ? 'bg-white/40 border-slate-100' : 'bg-white border-rose-100 shadow-sm'}`}>
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className={`text-sm font-bold ${n.type === 'alert' ? 'text-rose-600' : 'text-slate-800'}`}>{n.title}</h4>
                                                    <button 
                                                      onClick={() => deleteNotif(n.id)} 
                                                      className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-all"
                                                      title="Delete notification"
                                                    >
                                                      <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                                <p className="text-xs text-slate-500 leading-relaxed mb-2">{n.message}</p>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[10px] text-slate-400 font-bold">{formatNotificationDate(n.date)}</span>
                                                    {!n.read && <button onClick={() => markAsRead(n.id)} className="text-[10px] bg-rose-50 text-rose-600 px-2 py-1 rounded-lg font-bold hover:bg-rose-100 transition-colors">Mark Read</button>}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {userRole === 'doctor' ? (
                  <button 
                    className="bg-navy-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-xl shadow-navy-900/30 hover:bg-navy-800 hover:shadow-navy-900/50 transition-all hover:-translate-y-0.5 flex items-center btn-glossy border border-white/10"
                    onClick={() => setActiveView('scan')}
                  >
                    <Stethoscope className="w-4 h-4 mr-2" /> Diagnose
                  </button>
                ) : (
                  <button 
                    className="bg-navy-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-xl shadow-navy-900/30 hover:bg-navy-800 hover:shadow-navy-900/50 transition-all hover:-translate-y-0.5 flex items-center btn-glossy border border-white/10"
                    onClick={() => setActiveView('profile')}
                  >
                    My Profile
                  </button>
                )}
                
                <div className="flex items-center space-x-3 pl-3 border-l border-slate-300/50">
                    <div 
                      className="w-10 h-10 rounded-full p-0.5 bg-gradient-to-tr from-rose-400 to-teal-400 cursor-pointer shadow-lg hover:scale-105 transition-transform"
                      onClick={() => setActiveView('profile')}
                    >
                      <img className="rounded-full border-2 border-white h-full w-full bg-white object-cover" src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userRole === 'doctor' ? 'DrSmith' : 'Sarah'}`} alt="User" />
                    </div>

                    <button 
                      onClick={handleLogout}
                      className="text-slate-400 hover:text-rose-500 transition-colors p-2 hover:bg-rose-50 rounded-lg"
                      title="Logout"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                </div>
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-600 hover:bg-slate-100 p-2 rounded-lg">
                  {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 mx-auto max-w-7xl glass-panel rounded-2xl p-4 space-y-2 animate-fade-in shadow-2xl relative z-20">
            <NavItem view="dashboard" label="Home" />
            {userRole === 'patient' ? (
                <>
                    <NavItem view="records" label="My Records" />
                    <NavItem view="lab" label="Lab Risk Predictor" />
                    <NavItem view="book" label="Book Test" />
                    <NavItem view="profile" label="My Profile" />
                </>
            ) : (
                <>
                    <NavItem view="scan" label="Parasite Scan" />
                    <NavItem view="records" label="Patient Records" />
                    <NavItem view="lab" label="Lab Risk Predictor" />
                </>
            )}
            <button 
              onClick={handleLogout}
              className="w-full text-left px-5 py-3 text-sm font-bold text-white bg-rose-500 rounded-xl shadow-lg shadow-rose-500/30 mt-4 btn-glossy"
            >
              Logout
            </button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 mt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-16">
           {activeView === 'dashboard' && <Dashboard onViewChange={setActiveView} />}
           {activeView === 'scan' && <ParasiteScan onScanComplete={handleScanComplete} onSendAlert={handleSendNotification} role={userRole} userName={userName} />}
           
           {activeView === 'lab' && (
              <LabRiskPredictor 
                onViewChange={setActiveView} 
                onSendAlert={handleSendNotification} 
                role={userRole}
                history={labHistory}
                onSave={handleLabAnalysisComplete}
              />
           )}
           
           {activeView === 'records' && <MyRecords records={displayedRecords} role={userRole} onSendAlert={handleSendNotification} onRecordsUpdate={() => loadUserData(userEmail, userRole)} userName={userName} />}
           {activeView === 'profile' && <Profile onLogout={handleLogout} records={displayedRecords} role={userRole} userEmail={userEmail} patientId={patientId} userName={userName} />}
           {activeView === 'book' && (
             <BookTest onBookingComplete={(data) => handleSendNotification("Appointment Confirmed", `Your ${data.testType} has been scheduled for ${data.date} at ${data.time}.`, "success")} userEmail={userEmail} />
           )}
           {activeView === 'about' && <About onViewChange={setActiveView} />}
        </div>
      </main>

      {/* Footer */}
      <footer className="glass-panel mt-auto border-t-0 border-b-0 border-x-0 rounded-t-[3rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div className="max-w-7xl mx-auto px-8 py-12 relative z-10">
           <div className="flex flex-col md:flex-row justify-between items-center">
             <div className="mb-6 md:mb-0">
               <div className="flex items-center mb-2">
                  <Droplets className="text-rose-500 w-6 h-6 mr-3" />
                  <span className="text-2xl font-bold tracking-tight text-slate-800">ParaDetect <span className="text-rose-500">AI</span></span>
               </div>
               <p className="text-slate-500 text-sm font-medium">Next-generation molecular analysis for personalized health.</p>
             </div>
             <div className="flex space-x-8 text-sm font-bold text-slate-500">
               <a href="#" className="hover:text-rose-500 transition-colors">Privacy Policy</a>
               <a href="#" className="hover:text-rose-500 transition-colors">Terms of Service</a>
               <a href="#" className="hover:text-rose-500 transition-colors">Support</a>
             </div>
           </div>
           <div className="mt-10 pt-8 border-t border-slate-200 text-center md:text-left text-xs font-bold text-slate-400 uppercase tracking-widest">
             © 2026 ParaDetect AI. All rights reserved. Global Access 24/7 Digital Monitoring.
           </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
