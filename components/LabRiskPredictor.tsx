
import React, { useState, useRef } from 'react';
import { LabData, View, UserRole } from '../types';
import { predictLabRisk, extractLabDataFromImage } from '../services/geminiService';
import { createLabHistory } from '../services/databaseService';
import { getCurrentUser } from '../services/supabaseClient';
import { Loader2, AlertTriangle, FileText, Upload, Check, Wand2, Calendar, Phone, Activity, BellRing, History, ArrowLeft, Clock, Share2, Download, Bell, Pill } from 'lucide-react';

interface LabRiskPredictorProps {
  onViewChange?: (view: View) => void;
  onSendAlert?: (targetEmail: string, title: string, message: string, type: 'alert' | 'info' | 'success') => void;
  role?: UserRole;
  history?: any[];
  userEmail?: string;
  patientId?: string;
}

const LabRiskPredictor: React.FC<LabRiskPredictorProps> = ({ onViewChange, onSendAlert, role, history = [], userEmail, patientId }) => {
  const [labData, setLabData] = useState<LabData>({});
  const [loading, setLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [prediction, setPrediction] = useState<{probability: number, riskLevel: string, explanation: string, recommendation: string} | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [patientEmail, setPatientEmail] = useState('');
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : Number(e.target.value);
    setLabData({ ...labData, [e.target.name]: val });
  };

  const handlePredict = async () => {
    setLoading(true);
    const result = await predictLabRisk(labData);
    setPrediction(result);
    setLoading(false);
    
    // Save to Supabase database
    try {
        const currentUser = await getCurrentUser();
        if (currentUser && currentUser.email) {
            const targetEmail = role === 'doctor' ? patientEmail : currentUser.email;
            await createLabHistory(
                targetEmail,
                labData,
                result
            );
            console.log('✅ Lab history saved to database');
        }
    } catch (error: any) {
        console.error('❌ Failed to save lab history:', error);
        // Continue anyway - prediction still works
    }
  };

  const handleAlertPatient = () => {
    if (onSendAlert && prediction) {
        const targetEmail = role === 'doctor' ? patientEmail : (userEmail || '');
        const title = `URGENT: Lab Risk Alert (${prediction.riskLevel})`;
        const message = `High risk of malaria detected (${prediction.probability}%). Recommended action: ${prediction.recommendation}. Please schedule a parasite scan immediately.`;
        onSendAlert(targetEmail, title, message, 'alert');
        alert("Alert sent to patient.");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setOcrLoading(true);
      const reader = new FileReader();
      reader.onload = async (ev) => {
        if (ev.target?.result) {
          const base64Data = (ev.target.result as string).split(',')[1];
          const extractedData = await extractLabDataFromImage(base64Data);
          setLabData((prev) => ({ ...prev, ...extractedData }));
          setOcrLoading(false);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleReset = () => {
      setPrediction(null);
      setLabData({});
  };

  if (showHistory) {
      return (
        <div className="max-w-5xl mx-auto animate-fade-in pb-12">
            <div className="flex items-center mb-8">
                <button 
                    onClick={() => setShowHistory(false)}
                    className="mr-4 p-3 bg-white rounded-full shadow-lg border border-slate-100 text-slate-500 hover:text-rose-500 transition-colors"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h2 className="text-3xl font-extrabold text-slate-800">Risk Assessment History</h2>
            </div>
            
            <div className="space-y-6">
                {history.length === 0 ? (
                    <div className="text-center py-20 bg-white/40 rounded-[2rem] border border-dashed border-slate-300">
                        <History className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500 font-bold">No previous assessments found in this session.</p>
                    </div>
                ) : (
                    history.map((item, idx) => (
                        <div key={idx} className="glass-card rounded-[2rem] p-8 border border-white/60">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="flex items-center text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                                        <Clock className="w-3 h-3 mr-1" />
                                        {new Date(item.date).toLocaleString()}
                                    </div>
                                    <h3 className={`text-xl font-extrabold ${item.result.riskLevel === 'High' ? 'text-rose-600' : item.result.riskLevel === 'Medium' ? 'text-orange-500' : 'text-teal-600'}`}>
                                        {item.result.riskLevel} Risk Detected
                                    </h3>
                                </div>
                                <div className="text-3xl font-extrabold text-slate-800">{item.result.probability}%</div>
                            </div>
                            <p className="text-sm text-slate-700 mb-4 bg-white/50 p-4 rounded-xl border border-white/50 whitespace-pre-wrap leading-relaxed">{item.result.explanation}</p>
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between pt-4 border-t border-slate-200/50 gap-4">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Hb: {item.input.hemoglobin || '-'} | Plt: {item.input.platelets || '-'}</span>
                                <span className="text-xs font-bold text-slate-600 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-lg">Action: {item.result.recommendation.substring(0, 50)}...</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
      );
  }

  // Full Screen Modal for Risk Result
  if (prediction) {
      const isHighRisk = prediction.riskLevel === 'High';
      const isMediumRisk = prediction.riskLevel === 'Medium';
      const colorTheme = isHighRisk ? 'rose' : isMediumRisk ? 'orange' : 'teal';

      return (
        <div className="fixed inset-0 z-[100] bg-[#f0f4f8] overflow-y-auto animate-fade-in">
            {/* Global Background Elements */}
            <div className="fixed inset-0 pointer-events-none">
                <div className={`absolute top-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-${colorTheme}-400/10 blur-[100px]`}></div>
                <div className="absolute bottom-[-10%] left-[-10%] h-[600px] w-[600px] rounded-full bg-slate-400/10 blur-[100px]"></div>
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
                                <span>Risk Assessment</span>
                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                <span>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">AI Diagnostic Result</h1>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 self-stretch md:self-auto">
                         <button className="flex-1 md:flex-none py-3 px-6 bg-white border border-slate-200 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-600 hover:bg-slate-50 transition-all flex items-center justify-center shadow-sm">
                            <Share2 className="w-4 h-4 mr-2" /> Share
                         </button>
                         {role === 'doctor' && (isHighRisk || isMediumRisk) && (
                            <button 
                                onClick={handleAlertPatient}
                                className="flex-1 md:flex-none py-3 px-6 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-rose-100 transition-all flex items-center justify-center shadow-sm"
                            >
                                <Bell className="w-4 h-4 mr-2" /> Notify Patient
                            </button>
                         )}
                         <button className="flex-1 md:flex-none py-3 px-8 bg-navy-900 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-navy-800 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center shadow-lg shadow-navy-900/20 btn-glossy">
                            <Download className="w-4 h-4 mr-2" /> Save PDF
                         </button>
                    </div>
                </div>
    
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* LEFT COLUMN: Status & Metrics */}
                    <div className="lg:col-span-5 space-y-8">
                        {/* Status Card */}
                        <div className={`bg-gradient-to-br from-${colorTheme}-500 to-${colorTheme}-600 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-${colorTheme}-500/30 relative overflow-hidden group`}>
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:opacity-20 transition-opacity duration-700"></div>
                            <div className="relative z-10">
                                <div className="flex items-start justify-between mb-8">
                                    <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner">
                                        {isHighRisk ? <AlertTriangle className="w-10 h-10 text-white" /> : <Activity className="w-10 h-10 text-white" />}
                                    </div>
                                    <span className={`px-4 py-2 bg-white text-${colorTheme}-600 rounded-xl font-extrabold text-xs uppercase tracking-widest shadow-lg`}>
                                        {prediction.riskLevel} Risk
                                    </span>
                                </div>
                                <h3 className="text-3xl font-extrabold mb-2 leading-tight">Malaria Probability</h3>
                                <p className={`text-${colorTheme}-100 text-lg font-medium opacity-90 leading-relaxed border-t border-white/20 pt-4 mt-4`}>
                                    Clinical correlation suggests a <span className="font-bold text-white">{prediction.probability}%</span> probability of active infection based on hematological markers.
                                </p>
                            </div>
                        </div>
    
                        {/* Metrics Grid */}
                        <div className="glass-panel p-8 rounded-[2.5rem] border border-white/60">
                             <div className="flex items-center space-x-3 mb-8">
                                <FileText className="w-5 h-5 text-slate-400" />
                                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Input Parameters</h3>
                             </div>
                             <div className="grid grid-cols-2 gap-6">
                                 <div className="bg-white/60 p-6 rounded-3xl border border-white shadow-sm hover:shadow-md transition-shadow">
                                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Hemoglobin</p>
                                     <p className="text-3xl font-extrabold text-slate-800">{labData.hemoglobin || '-'}<span className="text-sm ml-1 text-slate-400">g/dL</span></p>
                                 </div>
                                 <div className="bg-white/60 p-6 rounded-3xl border border-white shadow-sm hover:shadow-md transition-shadow">
                                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Platelets</p>
                                     <p className="text-3xl font-extrabold text-slate-800">{labData.platelets || '-'}<span className="text-sm ml-1 text-slate-400">k</span></p>
                                 </div>
                                 <div className="bg-white/60 p-6 rounded-3xl border border-white shadow-sm hover:shadow-md transition-shadow">
                                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">WBC Count</p>
                                     <p className="text-3xl font-extrabold text-slate-800">{labData.wbc || '-'}</p>
                                 </div>
                                 <div className="bg-white/60 p-6 rounded-3xl border border-white shadow-sm hover:shadow-md transition-shadow">
                                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Bilirubin</p>
                                     <p className="text-3xl font-extrabold text-slate-800">{labData.bilirubin || '-'}<span className="text-sm ml-1 text-slate-400">mg</span></p>
                                 </div>
                             </div>
                        </div>
                    </div>
    
                    {/* RIGHT COLUMN: Clinical Analysis & Treatment */}
                    <div className="lg:col-span-7 flex flex-col gap-8">
                         
                         {/* Clinical Reasoning */}
                         <div className="glass-panel rounded-[2.5rem] p-10 border border-white/60">
                             <div className="flex items-center space-x-3 mb-6">
                                <Activity className="w-5 h-5 text-slate-400" />
                                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Clinical Reasoning</h3>
                             </div>
                             <div className="pl-6 border-l-4 border-slate-200">
                                 <div 
                                     className="text-lg font-medium text-slate-700 leading-relaxed"
                                     dangerouslySetInnerHTML={{ 
                                         __html: '"' + parseMarkdown(prediction.explanation) + '"'
                                     }}
                                 />
                             </div>
                         </div>
    
                         {/* Action Plan */}
                         <div className="glass-card rounded-[2.5rem] p-10 border border-white/60 shadow-xl relative overflow-hidden flex-1">
                             <div className={`absolute top-0 right-0 w-40 h-40 bg-${colorTheme}-500/5 rounded-full blur-2xl -mr-10 -mt-10`}></div>
                             
                             <div className="flex items-center space-x-3 mb-8 relative z-10">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center shadow-lg">
                                    <Check className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">Recommended Actions</h3>
                             </div>
    
                             <div className={`bg-${colorTheme}-50/50 rounded-3xl p-8 border border-${colorTheme}-100/60 mb-8`}>
                                 <div 
                                     className="text-slate-800 font-bold text-lg leading-loose"
                                     dangerouslySetInnerHTML={{ 
                                         __html: parseMarkdown(prediction.recommendation)
                                     }}
                                 />
                             </div>
    
                             {/* Booking Action if Patient */}
                             {role === 'patient' && (isHighRisk || isMediumRisk) && onViewChange && (
                                 <button 
                                     onClick={() => onViewChange('book')}
                                     className="w-full py-4 bg-navy-900 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-navy-800 transition-all flex items-center justify-center shadow-lg btn-glossy"
                                 >
                                     <Calendar className="w-4 h-4 mr-2" /> Book Confirmation Test Now
                                 </button>
                             )}
                         </div>
                    </div>
                </div>
                
                <div className="mt-16 text-center border-t border-slate-200 pt-8">
                    <button 
                        onClick={handleReset}
                        className="bg-white border border-slate-200 text-slate-500 hover:text-rose-500 hover:border-rose-200 px-8 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm"
                    >
                        Run New Prediction
                    </button>
                </div>
            </div>
        </div>
      );
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-in pb-12">
      {/* Main Container */}
      <div className="glass-card rounded-[3rem] shadow-2xl shadow-slate-200/50 relative">
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none overflow-visible"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-500/10 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/3 pointer-events-none overflow-visible"></div>

        <div className="p-8 md:p-14 relative z-10">
           <div className="mb-10 flex items-start justify-between flex-wrap gap-4">
             <div>
                <h2 className="text-4xl font-extrabold text-slate-800 mb-3 tracking-tight flex items-center">
                    <Activity className="w-8 h-8 text-rose-500 mr-3" />
                    Lab Risk Predictor
                </h2>
                <p className="text-slate-500 font-medium text-lg max-w-2xl">Enter CBC and clinical parameters to estimate Malaria risk, or upload a report for auto-extraction.</p>
             </div>
             <button 
                onClick={() => setShowHistory(true)}
                className="bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider hover:bg-navy-900 hover:text-white hover:border-navy-900 transition-all shadow-lg flex items-center"
             >
                <History className="w-4 h-4 mr-2" /> Previous Analyses
             </button>
           </div>
           
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              
              {/* Left Column: Input Form */}
              <div className="lg:col-span-7 space-y-8">
                 <div className="bg-white/40 p-8 rounded-[2rem] border border-white/60 shadow-sm">
                     {role === 'doctor' && (
                        <div className="mb-6">
                           <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Patient Email</label>
                           <input 
                             type="email" 
                             value={patientEmail}
                             onChange={(e) => setPatientEmail(e.target.value)}
                             className="w-full input-3d rounded-xl px-5 py-4 font-bold text-slate-800 focus:ring-2 focus:ring-teal-500 outline-none transition-all placeholder-slate-300" 
                             placeholder="patient@example.com"
                           />
                        </div>
                     )}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="group">
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1 group-focus-within:text-teal-600 transition-colors">Hemoglobin (g/dL)</label>
                          <input 
                            type="number" name="hemoglobin" 
                            value={labData.hemoglobin || ''}
                            onChange={handleChange}
                            className="w-full input-3d rounded-xl px-5 py-4 font-bold text-slate-800 focus:ring-2 focus:ring-teal-500 outline-none transition-all placeholder-slate-300" 
                            placeholder="e.g. 12.5"
                          />
                        </div>
                        <div className="group">
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1 group-focus-within:text-teal-600 transition-colors">Platelets (10^3/µL)</label>
                          <input 
                            type="number" name="platelets" 
                            value={labData.platelets || ''}
                            onChange={handleChange}
                            className="w-full input-3d rounded-xl px-5 py-4 font-bold text-slate-800 focus:ring-2 focus:ring-teal-500 outline-none transition-all placeholder-slate-300" 
                            placeholder="e.g. 150"
                          />
                        </div>
                        <div className="group">
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1 group-focus-within:text-teal-600 transition-colors">WBC Count</label>
                          <input 
                            type="number" name="wbc" 
                            value={labData.wbc || ''}
                            onChange={handleChange}
                            className="w-full input-3d rounded-xl px-5 py-4 font-bold text-slate-800 focus:ring-2 focus:ring-teal-500 outline-none transition-all placeholder-slate-300" 
                            placeholder="e.g. 5000"
                          />
                        </div>
                        <div className="group">
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1 group-focus-within:text-teal-600 transition-colors">Total Bilirubin</label>
                          <input 
                            type="number" name="bilirubin" 
                            value={labData.bilirubin || ''}
                            onChange={handleChange}
                            className="w-full input-3d rounded-xl px-5 py-4 font-bold text-slate-800 focus:ring-2 focus:ring-teal-500 outline-none transition-all placeholder-slate-300" 
                            placeholder="e.g. 1.2"
                          />
                        </div>
                     </div>

                     <div className="flex items-center space-x-4 bg-white/50 p-5 rounded-2xl border border-white shadow-sm mb-8">
                       <input 
                          type="checkbox" 
                          name="isFever" 
                          id="isFever" 
                          onChange={handleChange} 
                          className="w-6 h-6 text-teal-600 rounded-lg focus:ring-teal-500 border-slate-300 cursor-pointer" 
                       />
                       <label htmlFor="isFever" className="text-slate-700 font-bold cursor-pointer select-none">Patient has history of recent fever?</label>
                     </div>
                     
                     {/* The Button - Updated to match My Profile Button Design */}
                     <button 
                       onClick={handlePredict}
                       disabled={loading}
                       className="w-full bg-navy-900 text-white py-4 rounded-xl text-sm font-bold shadow-xl shadow-navy-900/30 hover:bg-navy-800 hover:shadow-navy-900/50 transition-all hover:-translate-y-0.5 flex justify-center items-center btn-glossy border border-white/10 uppercase tracking-wider"
                     >
                       {loading ? <Loader2 className="animate-spin mr-2" /> : "Run AI Prediction Model"}
                     </button>
                 </div>
              </div>

              {/* Right Column: Upload & Result */}
              <div className="lg:col-span-5 space-y-6">
                  {/* Upload Card - Only show if no prediction yet */}
                  {!prediction && (
                    <div className="bg-gradient-to-br from-rose-50 to-white border border-rose-100/50 rounded-[2rem] p-10 text-center shadow-lg relative overflow-hidden h-full flex flex-col justify-center">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-rose-500/5 rounded-full blur-2xl"></div>
                        <div className="relative z-10">
                            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-rose-100 text-rose-500 border border-rose-100 transform rotate-3">
                                <Wand2 className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-3">Auto-Fill from Report</h3>
                            <p className="text-sm text-slate-500 mb-8 font-medium leading-relaxed">Upload a clear photo of the CBC lab report to automatically extract values.</p>
                            
                            <div 
                              onClick={() => fileInputRef.current?.click()}
                              className={`border-2 border-dashed rounded-3xl p-8 cursor-pointer transition-all ${ocrLoading ? 'border-teal-400 bg-teal-50/50' : 'border-slate-300 hover:border-rose-400 hover:bg-rose-50/30'}`}
                            >
                              {ocrLoading ? (
                                <div className="flex flex-col items-center py-2">
                                  <Loader2 className="w-10 h-10 text-teal-600 animate-spin mb-3" />
                                  <span className="text-xs font-bold text-teal-600 uppercase tracking-wide">Extracting Data...</span>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center py-2">
                                  <Upload className="w-10 h-10 text-slate-400 mb-3" />
                                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Click to Upload</span>
                                </div>
                              )}
                              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                            </div>
                        </div>
                    </div>
                  )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default LabRiskPredictor;
