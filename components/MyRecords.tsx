
import React, { useState, useMemo } from 'react';
import { Search, Download, Eye, Calendar, ChevronLeft, FileText, ChevronRight, Share2, X, Microscope, AlertCircle, Check, Activity, ArrowLeft, Pill, Dna, Bell, Trash2 } from 'lucide-react';
import { Report, UserRole } from '../types';
import { deleteReport } from '../services/databaseService';
import { generatePDF } from '../services/pdfService';

interface MyRecordsProps {
  records: Report[];
  role?: UserRole;
  onSendAlert?: (targetEmail: string, title: string, message: string, type: 'alert' | 'info' | 'success') => void;
  onRecordsUpdate?: () => void;
  userName?: string;
}

const MyRecords: React.FC<MyRecordsProps> = ({ records, role = 'patient', onSendAlert, onRecordsUpdate, userName = 'User' }) => {
  const [selectedRecord, setSelectedRecord] = useState<Report | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Convert markdown to HTML for proper rendering
  const parseMarkdown = (text: string): string => {
    return text
      .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n/g, '<br/>');
  };

  const filteredRecords = useMemo(() => {
    if (!searchQuery) return records;
    const lowerQuery = searchQuery.toLowerCase();
    return records.filter(record => 
      record.patientName.toLowerCase().includes(lowerQuery) ||
      record.id.toLowerCase().includes(lowerQuery)
    );
  }, [records, searchQuery]);

  const handleNotifyPatient = (record: Report) => {
      if (onSendAlert) {
          // Note: patient email should be fetched from a separate patient data source
          // For now, using patientId as a placeholder for email lookup
          const patientEmail = `${record.patientId}@example.com`; // TODO: Implement proper patient email lookup
          const title = `New Report Available: ${new Date(record.date).toLocaleDateString()}`;
          const type = record.result?.isInfected ? 'alert' : 'info';
          const message = `A new clinical report (ID: ${record.id}) has been added to your records. Please review the details.`;
          
          // Notify if proper email lookup is implemented
          alert("Notification feature requires patient email database integration.");
          // onSendAlert(patientEmail, title, message, type);
      }
  };

  const handleDeleteRecord = async (recordId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      return;
    }
    
    try {
      await deleteReport(recordId);
      alert('Report deleted successfully!');
      if (onRecordsUpdate) {
        onRecordsUpdate();
      }
    } catch (error) {
      console.error('Failed to delete report:', error);
      alert('Failed to delete report. Please try again.');
    }
  };

  const handleDownloadPDF = async (record: Report, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    
    if (!record.result || !record.patientName) {
      alert('Report data is incomplete');
      return;
    }
    
    try {
      await generatePDF(
        record.patientName,
        record.id,
        record.result,
        record.date,
        userName
      );
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const RecordDetailModal = ({ record, onClose }: { record: Report, onClose: () => void }) => {
    // Safety check for missing result data
    if (!record.result) {
      return (
        <div className="fixed inset-0 z-[100] bg-[#f0f4f8] overflow-y-auto animate-fade-in flex items-center justify-center">
          <div className="glass-card rounded-[2.5rem] p-12 max-w-md mx-4 text-center">
            <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-slate-800 mb-4">Incomplete Report</h3>
            <p className="text-slate-600 mb-6">This report doesn't have complete analysis results.</p>
            <button 
              onClick={onClose}
              className="px-6 py-3 bg-navy-900 text-white rounded-xl font-bold hover:bg-navy-800 transition-all"
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }
    
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
                        onClick={onClose} 
                        className="group flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-lg border border-slate-100 hover:scale-105 hover:border-rose-200 hover:text-rose-500 transition-all mr-6"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-500 group-hover:text-rose-500 transition-colors" />
                    </button>
                    <div>
                        <div className="flex items-center space-x-3 text-sm text-slate-500 font-bold uppercase tracking-widest mb-1">
                            <span>Report ID: {record.id}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <span>{new Date(record.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Clinical Analysis Report</h1>
                    </div>
                </div>
                
                <div className="flex items-center space-x-4 self-stretch md:self-auto">
                     <button className="flex-1 md:flex-none py-3 px-6 bg-white border border-slate-200 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-600 hover:bg-slate-50 transition-all flex items-center justify-center shadow-sm">
                        <Share2 className="w-4 h-4 mr-2" /> Share
                     </button>
                     <button 
                        onClick={() => handleDownloadPDF(record)}
                        className="flex-1 md:flex-none py-3 px-8 bg-navy-900 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-navy-800 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center shadow-lg shadow-navy-900/20 btn-glossy"
                     >
                        <Download className="w-4 h-4 mr-2" /> Download PDF
                     </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* LEFT COLUMN: Status & Metrics */}
                <div className="lg:col-span-5 space-y-8">
                    {/* Status Card */}
                    {record.result?.isInfected ? (
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
                                    <span className="font-bold text-white">{record.result?.species || 'Unknown species'}</span> detected at <span className="font-bold text-white">{record.result?.severity || 'Unknown'}</span> levels. Immediate attention recommended.
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
                                 <p className="text-3xl font-extrabold text-slate-800">{(record.result?.parasitemia || 0).toFixed(1)}<span className="text-sm ml-1 text-slate-400">%</span></p>
                             </div>
                             <div className="bg-white/60 p-6 rounded-3xl border border-white shadow-sm hover:shadow-md transition-shadow">
                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">AI Confidence</p>
                                 <p className="text-3xl font-extrabold text-slate-800">{(record.result?.confidence || 0).toFixed(1)}<span className="text-sm ml-1 text-slate-400">%</span></p>
                             </div>
                             <div className="bg-white/60 p-6 rounded-3xl border border-white shadow-sm hover:shadow-md transition-shadow col-span-2">
                                 <div className="flex items-center mb-2">
                                     <Dna className="w-3 h-3 text-slate-400 mr-2" />
                                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Species Identified</p>
                                 </div>
                                 <p className="text-xl font-extrabold text-slate-800">{record.result?.species || 'None'}</p>
                             </div>
                             <div className="bg-white/60 p-6 rounded-3xl border border-white shadow-sm hover:shadow-md transition-shadow col-span-2">
                                 <div className="flex items-center mb-2">
                                     <Microscope className="w-3 h-3 text-slate-400 mr-2" />
                                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Development Stage</p>
                                 </div>
                                 <p className="text-xl font-extrabold text-slate-800">{record.result?.stage || 'None'}</p>
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
                                     __html: parseMarkdown(record.result?.treatmentRecommendation || "No specific medication required for negative diagnosis.") 
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
                                     __html: '"' + parseMarkdown(record.result?.explanation || 'No abnormalities detected.') + '"'
                                 }}
                             />
                         </div>
                     </div>
                </div>
            </div>
            
            <div className="mt-16 text-center border-t border-slate-200 pt-8">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Generated by ParaDetect AI • Validated by {userName} • {new Date().getFullYear()}
                </p>
            </div>
        </div>
    </div>
    );
  };
  
  // Patient View: Glossy Card Grid
  if (role === 'patient') {
    return (
      <div className="max-w-7xl mx-auto animate-fade-in pb-12 relative">
        {selectedRecord && <RecordDetailModal record={selectedRecord} onClose={() => setSelectedRecord(null)} />}
        
        <div className="text-center mb-12">
          <h1 className="text-6xl font-extrabold text-slate-900 mb-4 tracking-tight">My Vitality Archives</h1>
          <p className="text-slate-500 text-xl font-medium">A molecular timeline of your hematology metrics and recovery milestones.</p>
        </div>

        <div className="glass-card rounded-full p-2 mb-16 flex items-center max-w-4xl mx-auto shadow-2xl shadow-slate-200/50">
           <div className="flex-1 flex items-center px-8">
              <Search className="w-6 h-6 text-slate-400 mr-4" />
              <input 
                type="text" 
                placeholder="Search my clinical history..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none focus:ring-0 text-slate-800 font-bold placeholder-slate-400 text-lg h-14 outline-none"
              />
           </div>
           <div className="flex items-center space-x-6 pr-3">
             <span className="hidden md:block text-xs font-bold text-slate-400 uppercase tracking-widest">Database Sync Active</span>
             <div className="bg-navy-900 text-white px-8 py-4 rounded-full font-bold text-xs uppercase tracking-wider shadow-lg shadow-navy-900/20">
               Total Records: {filteredRecords.length}
             </div>
           </div>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="text-center py-20 bg-white/40 rounded-[2rem] border border-dashed border-slate-300">
             <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
             <p className="text-slate-500 font-bold">No records found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
             {filteredRecords.map((record) => (
               <div key={record.id} className="glass-card rounded-[2.5rem] p-8 hover:transform hover:-translate-y-2 transition-all duration-500 relative overflow-hidden group border border-white/60">
                  {/* 3D Highlight Effect */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-50"></div>
                  
                  {/* Status Indicator */}
                  <div className={`absolute top-0 left-0 right-0 h-2 ${
                    record.result?.isInfected ? 'bg-gradient-to-r from-rose-500 to-rose-600' : 'bg-gradient-to-r from-teal-500 to-teal-600'
                  }`}></div>
                  
                  <div className="flex justify-between items-start mb-8 mt-4">
                     <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        <h3 className={`text-2xl font-extrabold leading-tight ${record.result?.isInfected ? 'text-slate-900' : 'text-slate-900'}`}>
                          {record.result?.isInfected ? 'Malaria Detected' : 'Negative Result'}
                        </h3>
                     </div>
                     <div className={`px-4 py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-wider border shadow-sm ${
                       record.result?.isInfected 
                        ? 'bg-rose-50 text-rose-600 border-rose-100' 
                        : 'bg-teal-50 text-teal-600 border-teal-100'
                     }`}>
                       {record.result?.severity || 'Normal'}
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                     <div className="input-3d rounded-2xl p-5 text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Parasitemia</p>
                        <p className={`text-3xl font-extrabold ${record.result?.parasitemia && record.result.parasitemia > 0 ? 'text-rose-500' : 'text-teal-600'}`}>
                          {record.result?.parasitemia || 0}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold mt-1">%</p>
                     </div>
                     <div className="input-3d rounded-2xl p-5 text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Species</p>
                        <p className="text-lg font-extrabold text-slate-800 leading-tight pt-2 truncate">
                          {record.result?.isInfected ? (record.result?.species?.split(' ')[1] || 'Unknown') : 'None'}
                        </p>
                     </div>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                     <div className="flex items-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <div className={`w-2 h-2 rounded-full mr-2 shadow-[0_0_8px_currentColor] ${record.result?.confidence && record.result.confidence > 90 ? 'bg-emerald-400 text-emerald-400' : 'bg-orange-400 text-orange-400'}`}></div>
                        AI Validated
                     </div>
                     <button 
                       onClick={() => setSelectedRecord(record)}
                       className="text-navy-900 font-bold text-xs uppercase tracking-wider hover:text-rose-500 transition-colors flex items-center group/btn"
                     >
                       View Details <ChevronRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                     </button>
                  </div>
               </div>
             ))}
          </div>
        )}
      </div>
    );
  }

  // Doctor View: Table with enhanced styling
  return (
    <div className="space-y-8 animate-fade-in relative pb-12">
      {selectedRecord && <RecordDetailModal record={selectedRecord} onClose={() => setSelectedRecord(null)} />}

      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-slate-800">Patient Records</h2>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search patient database..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-6 py-4 border border-white/60 bg-white/60 backdrop-blur-md rounded-2xl focus:ring-2 focus:ring-rose-500 focus:outline-none w-80 shadow-lg shadow-slate-200/50 font-medium"
          />
        </div>
      </div>

      <div className="glass-card rounded-[2rem] overflow-hidden shadow-xl border border-white/50">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/80 border-b border-slate-100">
            <tr>
              <th className="px-8 py-6 font-bold text-slate-400 uppercase tracking-wider text-xs">Patient Name</th>
              <th className="px-8 py-6 font-bold text-slate-400 uppercase tracking-wider text-xs">Date</th>
              <th className="px-8 py-6 font-bold text-slate-400 uppercase tracking-wider text-xs">Diagnosis</th>
              <th className="px-8 py-6 font-bold text-slate-400 uppercase tracking-wider text-xs">Parasitemia</th>
              <th className="px-8 py-6 font-bold text-slate-400 uppercase tracking-wider text-xs">Status</th>
              <th className="px-8 py-6 font-bold text-slate-400 uppercase tracking-wider text-xs text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRecords.length === 0 ? (
               <tr>
                 <td colSpan={6} className="px-8 py-12 text-center text-slate-400 font-medium">No records found matching your search.</td>
               </tr>
            ) : (
              filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-rose-50/30 transition-colors group cursor-pointer" onClick={() => setSelectedRecord(record)}>
                  <td className="px-8 py-6">
                    <div className="font-bold text-slate-900 text-base">{record.patientName}</div>
                    <div className="text-xs text-slate-500 font-medium mt-1">ID: {record.patientId}</div>
                  </td>
                  <td className="px-8 py-6 text-slate-600 text-sm font-medium">
                    {record.date ? new Date(record.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                  </td>
                  <td className="px-8 py-6">
                    {record.result?.isInfected ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-lg bg-rose-100 text-rose-700 font-bold text-xs shadow-sm">
                        {record.result?.species || 'Unknown'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-lg bg-teal-100 text-teal-700 font-bold text-xs shadow-sm">
                        Negative
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-6 text-slate-800 font-bold text-sm">
                    {record.result?.parasitemia ? `${record.result.parasitemia.toFixed(1)}%` : '-'}
                  </td>
                  <td className="px-8 py-6">
                    <span className="flex items-center text-xs font-bold text-emerald-600">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2 shadow-sm"></div>
                      Completed
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button 
                         onClick={(e) => { e.stopPropagation(); handleNotifyPatient(record); }}
                         className="p-2 text-rose-400 hover:text-rose-600 hover:bg-white rounded-xl shadow-sm transition-all border border-transparent hover:border-slate-200"
                         title="Notify Patient"
                       >
                         <Bell className="w-5 h-5" />
                       </button>
                       <button 
                         onClick={(e) => { e.stopPropagation(); setSelectedRecord(record); }}
                         className="p-2 text-slate-400 hover:text-navy-900 hover:bg-white rounded-xl shadow-sm transition-all border border-transparent hover:border-slate-200"
                         title="View Details"
                       >
                         <Eye className="w-5 h-5" />
                       </button>
                       <button 
                         onClick={(e) => handleDownloadPDF(record, e)}
                         className="p-2 text-slate-400 hover:text-navy-900 hover:bg-white rounded-xl shadow-sm transition-all border border-transparent hover:border-slate-200"
                         title="Download Report"
                       >
                         <Download className="w-5 h-5" />
                       </button>
                       <button 
                         onClick={(e) => handleDeleteRecord(record.id, e)}
                         className="p-2 text-slate-400 hover:text-red-600 hover:bg-white rounded-xl shadow-sm transition-all border border-transparent hover:border-red-200"
                         title="Delete Report"
                       >
                         <Trash2 className="w-5 h-5" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyRecords;
