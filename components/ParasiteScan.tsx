
import React, { useState, useRef } from 'react';
import { Upload, X, Check, Loader2, AlertCircle, Microscope, ArrowRight, FileText, RefreshCw, Share2, Download, UserCircle, Activity, Bell, ArrowLeft, Dna, Pill, Calendar } from 'lucide-react';
import { Patient, AnalysisResult, Severity, UserRole } from '../types';
import { analyzeSmearImage } from '../services/geminiService';
import { createReport } from '../services/databaseService';
import { getCurrentUser, getUserProfile } from '../services/supabaseClient';
import { generatePDF } from '../services/pdfService';

interface ParasiteScanProps {
  onScanComplete: (report: any) => void;
  onSendAlert?: (targetEmail: string, title: string, message: string, type: 'alert' | 'info' | 'success') => void;
  role?: UserRole;
  userName?: string;
}

const ParasiteScan: React.FC<ParasiteScanProps> = ({ onScanComplete, onSendAlert, role = 'doctor', userName = 'User' }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [patient, setPatient] = useState<Partial<Patient>>({
    name: '',
    email: '',
    age: 34,
    weight: 70,
    symptoms: [],
    gender: 'Male'
  });
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Convert markdown to HTML for proper rendering
  const parseMarkdown = (text: string): string => {
    return text
      .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n/g, '<br/>');
  };

  const handlePatientChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setPatient({ ...patient, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) setImage(ev.target.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    
    try {
      // Get current user email (doctor)
      const currentUser = await getCurrentUser();
      if (!currentUser || !currentUser.email) {
        alert('Please login to perform analysis');
        return;
      }

      // Convert patient info to string for context
      const patientContext = `Name: ${patient.name}, Age: ${patient.age}, Weight: ${patient.weight}kg, Gender: ${patient.gender}, Symptoms: ${patient.symptoms?.join(', ')}`;
      
      // Strip header from base64 if present for API
      const base64Data = image.split(',')[1];
      
      // Run DL + Gemini analysis
      const analysisResult = await analyzeSmearImage(base64Data, patientContext);
      setResult(analysisResult);
      setStep(3);

      // Save to Supabase
      const profile = await getUserProfile(currentUser.email);
      const report = await createReport(
        patient.email || currentUser.email, // Patient email (or doctor's if not provided)
        patient.name!,
        profile.patient_id,
        'Microscopy',
        analysisResult,
        image // Store base64 image
      );

      console.log('✅ Report saved to database:', report.id);
      
      // Notify parent component
      onScanComplete({ 
        patient: { ...patient, email: patient.email || currentUser.email }, 
        result: analysisResult, 
        date: new Date().toISOString() 
      });

    } catch (error: any) {
      console.error('Analysis error:', error);
      alert(`Analysis failed: ${error.message}. Please try again.`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNotifyPatient = () => {
      if (onSendAlert && result && patient.email) {
          const title = result.isInfected ? 'Urgent: Malaria Detected' : 'Test Results Available';
          const type: 'alert' | 'success' = result.isInfected ? 'alert' : 'success';
          const message = result.isInfected 
            ? `Microscopic analysis confirmed ${result.species} (${result.severity}). Please review the attached report and start recommended treatment.`
            : `Your recent blood smear analysis was negative. No parasites detected.`;
          
          onSendAlert(patient.email, title, message, type);
          alert("Notification sent to patient successfully.");
      } else if (!patient.email) {
          alert("Patient email not provided. Cannot send notification.");
      }
  };

  const handleDownloadPDF = async () => {
    if (!result || !patient.name) {
      alert('Report data is incomplete');
      return;
    }
    
    try {
      await generatePDF(
        patient.name,
        'PAT-' + new Date().getTime(),
        result,
        new Date().toISOString(),
        userName
      );
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handleReset = () => {
      setStep(1);
      setImage(null);
      setResult(null);
  };

  // Full Screen Result Modal
  if (step === 3 && result) {
      return (
        <div className="fixed inset-0 z-[100] bg-[#f0f4f8] overflow-y-auto animate-fade-in">
            {/* Global Background Elements for consistency */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-rose-400/10 blur-[100px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] h-[600px] w-[600px] rounded-full bg-teal-400/10 blur-[100px]"></div>
                <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
            </div>
    
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
                {/* Header Toolbar */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                    <div className="flex items-center self-start md:self-auto">
                        <button 
                            onClick={handleReset} 
                            className="group flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-lg border border-slate-100 hover:scale-105 hover:border-rose-200 hover:text-rose-500 transition-all mr-6"
                        >
                            <ArrowLeft className="w-5 h-5 text-slate-500 group-hover:text-rose-500 transition-colors" />
                        </button>
                        <div>
                            <div className="flex items-center space-x-3 text-sm text-slate-500 font-bold uppercase tracking-widest mb-1">
                                <span>Report Generated</span>
                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                <span>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Microscopic Analysis Result</h1>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 self-stretch md:self-auto">
                         <button className="flex-1 md:flex-none py-3 px-6 bg-white border border-slate-200 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-600 hover:bg-slate-50 transition-all flex items-center justify-center shadow-sm">
                            <Share2 className="w-4 h-4 mr-2" /> Share
                         </button>
                         {role === 'doctor' && (
                            <button 
                                onClick={handleNotifyPatient}
                                className="flex-1 md:flex-none py-3 px-6 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-rose-100 transition-all flex items-center justify-center shadow-sm"
                            >
                                <Bell className="w-4 h-4 mr-2" /> Notify Patient
                            </button>
                         )}
                         <button 
                            onClick={handleDownloadPDF}
                            className="flex-1 md:flex-none py-3 px-8 bg-[#0B1120] text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[#1a2542] hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center shadow-lg shadow-[#0B1120]/20 btn-glossy"
                         >
                            <Download className="w-4 h-4 mr-2" /> Download Report
                         </button>
                    </div>
                </div>
    
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* LEFT COLUMN: Status & Metrics */}
                    <div className="lg:col-span-5 space-y-8">
                        {/* Status Card */}
                        {result.isInfected ? (
                            <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-rose-500/30 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:opacity-20 transition-opacity duration-700"></div>
                                <div className="relative z-10">
                                    <div className="flex items-start justify-between mb-8">
                                        <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner">
                                            <AlertCircle className="w-10 h-10 text-white" />
                                        </div>
                                        <span className="px-4 py-2 bg-white text-rose-600 rounded-xl font-extrabold text-xs uppercase tracking-widest shadow-lg">
                                            Action Required
                                        </span>
                                    </div>
                                    <h3 className="text-3xl font-extrabold mb-2 leading-tight">Malaria Detected</h3>
                                    <p className="text-rose-100 text-lg font-medium opacity-90 leading-relaxed border-t border-white/20 pt-4 mt-4">
                                        <span className="font-bold text-white">{result.species}</span> detected at <span className="font-bold text-white">{result.severity}</span> levels. Immediate attention recommended.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-teal-500/30 relative overflow-hidden group">
                                 <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:opacity-20 transition-opacity duration-700"></div>
                                 <div className="relative z-10">
                                    <div className="flex items-start justify-between mb-8">
                                        <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner">
                                            <Check className="w-10 h-10 text-white" />
                                        </div>
                                        <span className="px-4 py-2 bg-white text-teal-600 rounded-xl font-extrabold text-xs uppercase tracking-widest shadow-lg">
                                            Clear
                                        </span>
                                    </div>
                                    <h3 className="text-3xl font-extrabold mb-2 leading-tight">Negative Result</h3>
                                    <p className="text-teal-100 text-lg font-medium opacity-90 leading-relaxed border-t border-white/20 pt-4 mt-4">
                                        No malaria parasites detected in the provided sample. Blood smear analysis appears normal.
                                    </p>
                                </div>
                            </div>
                        )}
    
                        {/* Metrics Grid */}
                        <div className="glass-panel p-8 rounded-[2.5rem] border border-white/60">
                             <div className="flex items-center space-x-3 mb-8">
                                <Activity className="w-5 h-5 text-slate-400" />
                                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Diagnostic Metrics</h3>
                             </div>
                             <div className="grid grid-cols-2 gap-6">
                                 <div className="bg-white/60 p-6 rounded-3xl border border-white shadow-sm hover:shadow-md transition-shadow">
                                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Parasitemia</p>
                                     <p className="text-3xl font-extrabold text-slate-800">{(result.parasitemia || 0).toFixed(1)}<span className="text-sm ml-1 text-slate-400">%</span></p>
                                 </div>
                                 <div className="bg-white/60 p-6 rounded-3xl border border-white shadow-sm hover:shadow-md transition-shadow">
                                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">AI Confidence</p>
                                     <p className="text-3xl font-extrabold text-slate-800">{(result.confidence || 0).toFixed(1)}<span className="text-sm ml-1 text-slate-400">%</span></p>
                                 </div>
                                 <div className="bg-white/60 p-6 rounded-3xl border border-white shadow-sm hover:shadow-md transition-shadow col-span-2">
                                     <div className="flex items-center mb-2">
                                         <Dna className="w-3 h-3 text-slate-400 mr-2" />
                                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Species Identified</p>
                                     </div>
                                     <p className="text-xl font-extrabold text-slate-800">{result.species || 'None'}</p>
                                 </div>
                                 <div className="bg-white/60 p-6 rounded-3xl border border-white shadow-sm hover:shadow-md transition-shadow col-span-2">
                                     <div className="flex items-center mb-2">
                                         <Microscope className="w-3 h-3 text-slate-400 mr-2" />
                                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Development Stage</p>
                                     </div>
                                     <p className="text-xl font-extrabold text-slate-800">{result.stage || 'None'}</p>
                                 </div>
                             </div>
                        </div>
                    </div>
    
                    {/* RIGHT COLUMN: Clinical Analysis & Treatment */}
                    <div className="lg:col-span-7 flex flex-col gap-8">
                         
                         {/* Treatment Protocol - Prominent */}
                         <div className="glass-card rounded-[2.5rem] p-10 border border-white/60 shadow-xl relative overflow-hidden flex-1">
                             <div className="absolute top-0 right-0 w-40 h-40 bg-rose-500/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
                             
                             <div className="flex items-center space-x-3 mb-8 relative z-10">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center shadow-lg">
                                    <Pill className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">Treatment Protocol</h3>
                             </div>
    
                             <div className="bg-rose-50/50 rounded-3xl p-8 border border-rose-100/60 mb-8">
                                 <div 
                                     className="text-slate-800 font-bold text-lg leading-loose"
                                     dangerouslySetInnerHTML={{ 
                                         __html: parseMarkdown(result.treatmentRecommendation || "No specific medication required for negative diagnosis.") 
                                     }}
                                 />
                             </div>
    
                             <div className="flex items-start space-x-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                 <Activity className="w-6 h-6 text-slate-400 flex-shrink-0 mt-1" />
                                 <div>
                                     <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-2">Dosage Guidelines</h4>
                                     <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                         Dosages are calculated based on patient weight and WHO guidelines. Always confirm contraindications (e.g., G6PD deficiency, pregnancy) before administration.
                                     </p>
                                 </div>
                             </div>
                         </div>
    
                         {/* Microscopic Observation */}
                         <div className="glass-panel rounded-[2.5rem] p-10 border border-white/60">
                             <div className="flex items-center space-x-3 mb-6">
                                <FileText className="w-5 h-5 text-slate-400" />
                                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Microscopic Observation</h3>
                             </div>
                             <div className="pl-6 border-l-4 border-slate-200">
                                 <div 
                                     className="text-lg font-medium text-slate-700 italic leading-relaxed"
                                     dangerouslySetInnerHTML={{ 
                                         __html: '"' + parseMarkdown(result.explanation || 'No abnormalities detected.') + '"'
                                     }}
                                 />
                             </div>
                         </div>
                    </div>
                </div>
                
                <div className="mt-16 text-center border-t border-slate-200 pt-8">
                    <button 
                        onClick={handleReset}
                        className="bg-white border border-slate-200 text-slate-500 hover:text-rose-500 hover:border-rose-200 px-8 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm"
                    >
                        Start New Analysis
                    </button>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-6">
                        Generated by ParaDetect AI • Validated by {userName} • {new Date().getFullYear()}
                    </p>
                </div>
            </div>
        </div>
      );
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      
      {/* Header for Process */}
      <div className="flex items-center space-x-6 mb-10">
        <button onClick={() => step > 1 && setStep(step - 1 as any)} className="w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-lg shadow-slate-200/50 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:scale-105 transition-all">
            <ArrowRight className="w-5 h-5 rotate-180" />
        </button>
        <div>
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
                {step === 1 && "Health Intake"}
                {step === 2 && "Microscopy Upload"}
            </h2>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">
                {step === 1 && "Step 1 of 3"}
                {step === 2 && "Step 2 of 3"}
            </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Input/Upload/Summary */}
        <div className="lg:col-span-1 space-y-6">
             {/* Profile Summary Card */}
             <div className="glass-card rounded-[2rem] p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-bl-full -mr-8 -mt-8 z-0"></div>
                
                <div className="relative z-10">
                    <div className="flex items-center space-x-4 mb-8">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#0B1120] to-[#151e32] text-white rounded-2xl shadow-lg flex items-center justify-center font-bold text-lg">1</div>
                        <h3 className="text-lg font-bold text-slate-800">Profile Context</h3>
                    </div>
                    
                    <div className="space-y-6">
                        <div className="group">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Name</label>
                            {step === 1 ? (
                                <input 
                                    name="name" 
                                    value={patient.name} 
                                    onChange={handlePatientChange}
                                    className="w-full input-3d rounded-xl px-4 py-4 font-bold text-slate-800 focus:ring-2 focus:ring-rose-500 outline-none transition-all" 
                                />
                            ) : (
                                <div className="input-3d rounded-xl px-4 py-4 font-bold text-slate-600 bg-slate-100/50">{patient.name}</div>
                            )}
                        </div>

                        <div className="group">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Email</label>
                            {step === 1 ? (
                                <input 
                                    name="email" 
                                    type="email"
                                    value={patient.email || ''} 
                                    onChange={handlePatientChange}
                                    className="w-full input-3d rounded-xl px-4 py-4 font-bold text-slate-800 focus:ring-2 focus:ring-rose-500 outline-none transition-all" 
                                    placeholder="patient@example.com"
                                />
                            ) : (
                                <div className="input-3d rounded-xl px-4 py-4 font-bold text-slate-600 bg-slate-100/50 truncate">{patient.email || 'N/A'}</div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="group">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Age</label>
                                {step === 1 ? (
                                    <input 
                                        type="number"
                                        name="age" 
                                        value={patient.age} 
                                        onChange={handlePatientChange}
                                        className="w-full input-3d rounded-xl px-4 py-4 font-bold text-slate-800 focus:ring-2 focus:ring-rose-500 outline-none text-center" 
                                    />
                                ) : (
                                    <div className="input-3d rounded-xl px-4 py-4 font-bold text-slate-600 bg-slate-100/50 text-center">{patient.age}</div>
                                )}
                            </div>
                            <div className="group">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Gender</label>
                                {step === 1 ? (
                                    <select 
                                        name="gender" 
                                        value={patient.gender} 
                                        onChange={handlePatientChange}
                                        className="w-full input-3d rounded-xl px-4 py-4 font-bold text-slate-800 focus:ring-2 focus:ring-rose-500 outline-none text-center appearance-none bg-transparent" 
                                    >
                                        <option>Male</option>
                                        <option>Female</option>
                                    </select>
                                ) : (
                                    <div className="input-3d rounded-xl px-4 py-4 font-bold text-slate-600 bg-slate-100/50 text-center">{patient.gender === 'Male' ? 'M' : 'F'}</div>
                                )}
                            </div>
                        </div>
                        <div className="group">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Weight (kg)</label>
                            {step === 1 ? (
                                <input 
                                    type="number"
                                    name="weight" 
                                    value={patient.weight} 
                                    onChange={handlePatientChange}
                                    className="w-full input-3d rounded-xl px-4 py-4 font-bold text-slate-800 focus:ring-2 focus:ring-rose-500 outline-none" 
                                />
                            ) : (
                                <div className="input-3d rounded-xl px-4 py-4 font-bold text-slate-600 bg-slate-100/50">{patient.weight} kg</div>
                            )}
                        </div>
                    </div>
                    
                    {step === 1 && (
                        <button 
                            onClick={() => setStep(2)}
                            className="w-full mt-8 bg-[#0B1120] text-white py-4 rounded-xl font-bold uppercase tracking-wider text-sm hover:bg-[#1a2542] hover:scale-[1.02] transition-all shadow-lg shadow-[#0B1120]/30 btn-glossy"
                        >
                            Confirm Profile
                        </button>
                    )}
                </div>
             </div>
        </div>

        {/* Center/Right Column: Main Action Area */}
        <div className="lg:col-span-2">
            {step === 1 && (
                <div className="glass-card rounded-[2.5rem] p-12 flex flex-col items-center justify-center h-full text-center min-h-[500px] border-2 border-dashed border-white/50">
                    <div className="w-32 h-32 bg-gradient-to-br from-rose-50 to-white rounded-full flex items-center justify-center mb-8 shadow-xl shadow-rose-100">
                        <UserCircle className="w-12 h-12 text-rose-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-4">Waiting for Input</h3>
                    <p className="text-slate-500 max-w-md text-lg leading-relaxed">Please verify the patient biometrics on the left to proceed to the digital slide analysis.</p>
                </div>
            )}

            {step === 2 && (
                <div className="glass-card rounded-[2.5rem] p-8 h-full flex flex-col">
                    <div className="border-3 border-dashed border-slate-200 rounded-[2rem] flex-1 flex flex-col items-center justify-center p-12 bg-white/40 hover:bg-white/60 transition-colors relative min-h-[400px]">
                        {image ? (
                            <div className="relative w-full h-full flex items-center justify-center group">
                                <div className="absolute inset-0 bg-rose-500/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <img src={image} alt="Microscopy" className="max-h-80 rounded-2xl shadow-2xl relative z-10" />
                                <button 
                                    onClick={() => setImage(null)}
                                    className="absolute -top-4 -right-4 bg-white p-3 rounded-full shadow-lg shadow-rose-500/20 text-rose-500 hover:text-white hover:bg-rose-500 transition-all z-20"
                                >
                                    <RefreshCw className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="w-24 h-24 bg-gradient-to-br from-white to-slate-50 rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.05)] flex items-center justify-center mb-8 border border-white">
                                    <Microscope className="w-10 h-10 text-rose-500" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">Upload Microscopic Slide</h3>
                                <p className="text-slate-400 text-sm mb-8 uppercase tracking-wider font-bold">Accepts Blood Smear Image (JPEG/PNG)</p>
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-8 py-4 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold hover:border-rose-400 hover:text-rose-500 hover:shadow-lg transition-all shadow-sm"
                                >
                                    Select Image from Device
                                </button>
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                            </>
                        )}
                    </div>
                    
                    <div className="mt-8 flex justify-end">
                         <button 
                            onClick={handleAnalyze} 
                            disabled={!image || isAnalyzing}
                            className={`px-10 py-5 rounded-2xl font-bold text-white shadow-xl transition-all flex items-center text-lg btn-glossy ${!image || isAnalyzing ? 'bg-slate-300 cursor-not-allowed' : 'bg-gradient-to-r from-[#0B1120] to-[#151e32] hover:scale-105 hover:shadow-xl'}`}
                        >
                            {isAnalyzing ? (
                                <>
                                    <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                                    Analyzing Pattern...
                                </>
                            ) : (
                                <>
                                    Analyze Health <ArrowRight className="w-6 h-6 ml-3" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ParasiteScan;
