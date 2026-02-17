import React, { useState } from 'react';
import { User, Stethoscope, ArrowRight, Droplets, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { UserRole } from '../types';
import { signIn, signUp } from '../services/supabaseClient';

interface AuthProps {
  onLogin: (role: UserRole, email: string, patientId: string, userName: string) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [role, setRole] = useState<UserRole | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegistering) {
        // Register new user
        const { user, patientId } = await signUp(email, password, role!, fullName);
        console.log('✅ User registered:', user.email, 'Patient ID:', patientId);
        onLogin(role!, user.email!, patientId, fullName);
      } else {
        // Login existing user
        const { user } = await signIn(email, password);
        
        // Fetch user profile to get role and patient ID
        const { getUserProfile } = await import('../services/supabaseClient');
        const profile = await getUserProfile(user.email!);
        
        console.log('✅ User logged in:', user.email, 'Role:', profile.role);
        onLogin(profile.role as UserRole, user.email!, profile.patient_id, profile.full_name);
      }
    } catch (err: any) {
      console.error('Authentication error:', err);
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setRole(null);
    setIsRegistering(false);
    setError(null);
    setEmail('');
    setPassword('');
    setFullName('');
  };

  const handleQuickLogin = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
       {/* Global background is provided by index.html */}

       <div className="max-w-5xl w-full glass-card rounded-[3rem] shadow-2xl relative z-10 flex flex-col md:flex-row min-h-[650px] overflow-hidden border border-white/50">
          {/* Left Side - Brand */}
          <div className="w-full md:w-1/2 bg-[#0B1120] p-12 text-white flex flex-col justify-between relative overflow-hidden">
             {/* Decorative Elements */}
             <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500 rounded-full blur-[100px] opacity-30 -translate-y-1/2 translate-x-1/3"></div>
             <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500 rounded-full blur-[100px] opacity-30 translate-y-1/2 -translate-x-1/3"></div>
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
             
             <div className="relative z-10">
               <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl flex items-center justify-center mb-8 shadow-2xl shadow-rose-900/50 border border-white/10">
                 <Droplets className="text-white w-8 h-8 fill-current" />
               </div>
               <h1 className="text-5xl font-extrabold mb-6 tracking-tight">ParaDetect <span className="text-rose-500 italic">AI</span></h1>
               <p className="text-slate-300 text-lg leading-relaxed font-medium">Next-generation molecular analysis for personalized health monitoring and clinical decision support.</p>
             </div>

             <div className="relative z-10 mt-12">
                <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-slate-500 mb-6">
                  <span className="w-8 h-[2px] bg-slate-600 rounded-full"></span>
                  <span>Trusted By Global Labs</span>
                </div>
                <div className="flex -space-x-4">
                   {[1,2,3,4].map(i => (
                     <div key={i} className="w-12 h-12 rounded-full border-2 border-[#0B1120] bg-slate-700 shadow-lg"></div>
                   ))}
                   <div className="w-12 h-12 rounded-full border-2 border-[#0B1120] bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                     2k+
                   </div>
                </div>
             </div>
          </div>

          {/* Right Side - Form */}
          <div className="w-full md:w-1/2 p-12 md:p-16 flex flex-col justify-center bg-white/40 backdrop-blur-md">
             {!role ? (
               <div className="animate-fade-in space-y-8">
                 <div>
                    <h2 className="text-4xl font-extrabold text-slate-900 mb-3">Welcome Back</h2>
                    <p className="text-slate-500 text-lg font-medium">Choose your portal to continue.</p>
                 </div>
                 
                 <div className="space-y-5">
                    <button 
                      onClick={() => setRole('patient')}
                      className="w-full group glass-panel p-6 rounded-3xl hover:bg-white transition-all duration-300 text-left flex items-center shadow-lg hover:shadow-xl hover:-translate-y-1 border border-white/60"
                    >
                       <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center mr-6 group-hover:bg-teal-500 transition-colors shadow-inner">
                         <User className="w-7 h-7 text-teal-600 group-hover:text-white transition-colors" />
                       </div>
                       <div>
                         <h3 className="font-bold text-slate-800 text-xl group-hover:text-teal-600 transition-colors">Patient Portal</h3>
                         <p className="text-slate-500 text-sm font-medium mt-1">Access your records</p>
                       </div>
                       <div className="ml-auto w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-teal-100 transition-colors">
                           <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-teal-600 transition-all" />
                       </div>
                    </button>

                    <button 
                      onClick={() => setRole('doctor')}
                      className="w-full group glass-panel p-6 rounded-3xl hover:bg-white transition-all duration-300 text-left flex items-center shadow-lg hover:shadow-xl hover:-translate-y-1 border border-white/60"
                    >
                       <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center mr-6 group-hover:bg-rose-500 transition-colors shadow-inner">
                         <Stethoscope className="w-7 h-7 text-rose-600 group-hover:text-white transition-colors" />
                       </div>
                       <div>
                         <h3 className="font-bold text-slate-800 text-xl group-hover:text-rose-600 transition-colors">Doctor Portal</h3>
                         <p className="text-slate-500 text-sm font-medium mt-1">Clinical Workspace</p>
                       </div>
                       <div className="ml-auto w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-rose-100 transition-colors">
                           <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-rose-600 transition-all" />
                       </div>
                    </button>
                 </div>
               </div>
             ) : (
               <div className="animate-fade-in">
                 <button onClick={handleBack} className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-8 hover:text-rose-600 flex items-center transition-colors">
                   <ArrowLeft className="w-4 h-4 mr-2" /> Back to Role Selection
                 </button>

                 <h2 className="text-3xl font-extrabold text-slate-900 mb-3">
                   {isRegistering 
                     ? (role === 'patient' ? 'Create Patient Account' : 'Register as Doctor')
                     : (role === 'patient' ? 'Patient Access' : 'Doctor Access')
                   }
                 </h2>
                 <p className="text-slate-500 mb-8 font-medium">
                   {isRegistering 
                     ? 'Enter your details to create a secure workspace.' 
                     : 'Enter your secure credentials to access the workspace.'
                   }
                 </p>

                 {error && (
                   <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start space-x-3 animate-fade-in">
                     <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                     <p className="text-sm font-medium text-rose-700">{error}</p>
                   </div>
                 )}

                 <form onSubmit={handleLogin} className="space-y-6">
                    {isRegistering && (
                      <div className="space-y-2 animate-fade-in">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Full Name</label>
                        <input 
                          type="text" 
                          placeholder="e.g. John Doe"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          required
                          className="w-full input-3d rounded-2xl px-6 py-4 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email Identifier</label>
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        required
                        className="w-full input-3d rounded-2xl px-6 py-4 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Secure Key</label>
                      <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min. 6 characters"
                        required
                        minLength={6}
                        className="w-full input-3d rounded-2xl px-6 py-4 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                    
                    {isRegistering && (
                      <div className="space-y-2 animate-fade-in">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Confirm Key</label>
                        <input 
                          type="password" 
                          placeholder="Confirm password"
                          className="w-full input-3d rounded-2xl px-6 py-4 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
                        />
                      </div>
                    )}

                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full bg-[#0B1120] text-white py-5 rounded-2xl font-bold uppercase tracking-wider shadow-xl shadow-navy-900/30 hover:bg-[#1a2542] hover:shadow-navy-900/50 hover:-translate-y-1 transition-all btn-glossy mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin mr-2" />
                          {isRegistering ? 'Creating Account...' : 'Logging In...'}
                        </>
                      ) : (
                        <>{isRegistering ? 'Create Account & Enter' : 'Authenticate & Enter'}</>
                      )}
                    </button>

                    {!isRegistering && (
                      <div className="pt-6 mt-6 border-t border-slate-200">
                        <p className="text-xs text-slate-500 text-center mb-4 font-bold uppercase tracking-wider">Quick Demo Access</p>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => handleQuickLogin('patient@example.com', 'patient123')}
                            className="text-xs bg-teal-50 text-teal-600 px-4 py-3 rounded-xl font-bold hover:bg-teal-100 transition-colors flex items-center justify-center shadow-sm"
                          >
                            <User className="w-4 h-4 mr-1" /> Demo Patient
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickLogin('dr.smith@paradetect.ai', 'doctor123')}
                            className="text-xs bg-rose-50 text-rose-600 px-4 py-3 rounded-xl font-bold hover:bg-rose-100 transition-colors flex items-center justify-center shadow-sm"
                          >
                            <Stethoscope className="w-4 h-4 mr-1" /> Demo Doctor
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-400 text-center mt-3 italic">Use these for instant testing without registration</p>
                      </div>
                    )}
                 </form>

                 <div className="mt-8 text-center">
                    <button 
                        onClick={() => setIsRegistering(!isRegistering)}
                        className="text-xs font-bold text-slate-400 hover:text-rose-600 transition-colors uppercase tracking-wider"
                    >
                        {isRegistering 
                            ? 'Already have an account? Login' 
                            : 'New User? Create Account'}
                    </button>
                 </div>
               </div>
             )}
          </div>
       </div>
    </div>
  );
};

export default Auth;