
import React from 'react';
import { ArrowLeft, Stethoscope, User, ScanLine, Activity, FileText, Calendar, Pill, Microscope, ShieldCheck, Zap, Database, Brain, Smartphone, Share2, Layers } from 'lucide-react';
import { View } from '../types';

interface AboutProps {
  onViewChange: (view: View) => void;
}

const About: React.FC<AboutProps> = ({ onViewChange }) => {
  return (
    <div className="max-w-7xl mx-auto animate-fade-in pb-16 space-y-20">
      
      {/* 1. Hero Section */}
      <div className="relative text-center space-y-6 pt-10">
        <button 
          onClick={() => onViewChange('dashboard')}
          className="absolute left-0 top-0 group flex items-center text-slate-500 font-bold uppercase tracking-wider text-xs hover:text-rose-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>
        
        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-widest shadow-sm mb-4">
           <span className="w-2 h-2 rounded-full bg-rose-500 mr-2 animate-pulse"></span>
           System Documentation v5.0
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight">
          ParaDetect <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500 italic">AI</span>
        </h1>
        <p className="text-2xl text-slate-500 max-w-3xl mx-auto font-medium leading-relaxed">
          A Deep Learning-Based Malaria Diagnosis & Clinical Decision Support System bridging the gap between advanced pathology and patient care.
        </p>
      </div>

      {/* 2. Value Proposition Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureHighlight 
             icon={Brain} 
             color="rose" 
             title="Visual Diagnosis" 
             desc="Utilizes Google's Gemini Vision models to analyze microscopic blood smears for parasite detection, species classification, and staging with 99.1% accuracy." 
          />
          <FeatureHighlight 
             icon={Activity} 
             color="teal" 
             title="Risk Prediction" 
             desc="Analyzes hematological parameters (CBC) to predict malaria risk probability before a smear is even performed, prioritizing high-risk patients." 
          />
          <FeatureHighlight 
             icon={Smartphone} 
             color="blue" 
             title="Digital Integration" 
             desc="Features Optical Character Recognition (OCR) to instantly digitize physical lab reports and integrates telemedicine booking for seamless care." 
          />
      </div>

      {/* 3. Detailed Workflows */}
      <div>
        <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900">Dual-Portal Architecture</h2>
            <p className="text-slate-500 mt-2 font-medium">Tailored interfaces for distinct user roles.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Doctor Workflow */}
            <div className="glass-card rounded-[3rem] p-10 border border-rose-100/50 shadow-2xl shadow-rose-100/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3"></div>
                <div className="relative z-10">
                    <div className="flex items-center space-x-4 mb-10">
                        <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-rose-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/30">
                            <Stethoscope className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-extrabold text-slate-800">Doctor Portal</h3>
                            <p className="text-xs font-bold text-rose-500 uppercase tracking-wider">Clinical Diagnostic Engine</p>
                        </div>
                    </div>
                    
                    <div className="space-y-6">
                        <WorkflowStep number="1" title="Patient Intake" desc="Captures vitals including weight for dosage calculation." />
                        <WorkflowStep number="2" title="Parasite Scan" desc="Uploads thin/thick smear images for AI analysis." />
                        <WorkflowStep number="3" title="AI Pathology" desc="Identifies Species (Pf/Pv), Stage, and Parasitemia %." />
                        <WorkflowStep number="4" title="Rx Generation" desc="Auto-calculates WHO-based dosage (mg/kg)." />
                        <WorkflowStep number="5" title="Patient Alert" desc="Instantly notifies patient via the app." />
                    </div>
                </div>
            </div>

            {/* Patient Workflow */}
            <div className="glass-card rounded-[3rem] p-10 border border-teal-100/50 shadow-2xl shadow-teal-100/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3"></div>
                <div className="relative z-10">
                    <div className="flex items-center space-x-4 mb-10">
                        <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/30">
                            <User className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-extrabold text-slate-800">Patient Portal</h3>
                            <p className="text-xs font-bold text-teal-500 uppercase tracking-wider">Self-Monitoring & Care</p>
                        </div>
                    </div>
                    
                    <div className="space-y-6">
                        <WorkflowStep number="1" title="Lab Risk Check" desc="Uploads CBC reports to check Malaria probability." />
                        <WorkflowStep number="2" title="Book Test" desc="Schedules home collection based on risk level." />
                        <WorkflowStep number="3" title="My Registry" desc="Accesses digital reports and clinical history." />
                        <WorkflowStep number="4" title="Recovery Mode" desc="Tracks medication adherence and prevention." />
                        <WorkflowStep number="5" title="Notifications" desc="Receives real-time alerts from doctors." />
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* 4. Module Deep Dive */}
      <div>
        <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900">Core Modules Explained</h2>
            <p className="text-slate-500 mt-2 font-medium">A breakdown of the system's functional components.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ModuleCard 
                title="Parasite Scan" 
                icon={Microscope}
                features={["Species Detection", "Life Stage Classification", "Parasitemia Calculation", "Severity Grading"]}
                color="indigo"
            />
            <ModuleCard 
                title="Lab Risk Predictor" 
                icon={Activity}
                features={["OCR Data Extraction", "Hemo-Parameter Analysis", "Probabilistic Scoring", "Clinical Reasoning"]}
                color="rose"
            />
            <ModuleCard 
                title="Treatment Engine" 
                icon={Pill}
                features={["Weight-based Dosage", "WHO Guidelines", "Contraindication Checks", "Supportive Care"]}
                color="amber"
            />
            <ModuleCard 
                title="Patient Registry" 
                icon={Database}
                features={["Longitudinal History", "Secure Cloud Storage", "PDF Report Generation", "Search & Filter"]}
                color="emerald"
            />
            <ModuleCard 
                title="Scheduling System" 
                icon={Calendar}
                features={["Home Collection", "Lab Appointments", "Real-time Status", "Digital Confirmation"]}
                color="blue"
            />
            <ModuleCard 
                title="Recovery Hub" 
                icon={ShieldCheck}
                features={["Medication Tracking", "Wellness Tips", "Follow-up Reminders", "Prevention Guide"]}
                color="purple"
            />
        </div>
      </div>

      {/* 5. Tech Stack */}
      <div className="bg-[#0B1120] rounded-[3rem] p-12 text-center relative overflow-hidden">
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
         <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-[#0B1120]/90"></div>
         
         <div className="relative z-10">
             <h2 className="text-3xl font-extrabold text-white mb-8">Powered by Next-Gen Technology</h2>
             <div className="flex flex-wrap justify-center gap-4">
                 <TechBadge label="React 19" />
                 <TechBadge label="TypeScript" />
                 <TechBadge label="Tailwind CSS" />
                 <TechBadge label="Google Gemini Vision" />
                 <TechBadge label="Recharts" />
                 <TechBadge label="Lucide Icons" />
                 <TechBadge label="Glassmorphism UI" />
             </div>
             <p className="text-slate-400 mt-8 text-sm max-w-2xl mx-auto">
                 Built with a focus on performance, accessibility, and clinical precision. The frontend utilizes a responsive glassmorphic design system while the backend logic leverages state-of-the-art multimodal LLMs for diagnostic inference.
             </p>
         </div>
      </div>

      {/* Footer / CTA */}
      <div className="text-center pt-8">
        <button 
          onClick={() => onViewChange('dashboard')}
          className="bg-gradient-to-r from-rose-500 to-rose-600 text-white px-10 py-4 rounded-2xl font-bold text-sm uppercase tracking-wider shadow-xl shadow-rose-500/30 hover:scale-105 transition-transform btn-glossy"
        >
            Return to Dashboard
        </button>
      </div>
    </div>
  );
};

// Sub-components for About Page

const FeatureHighlight = ({ icon: Icon, color, title, desc }: any) => (
    <div className={`bg-white/60 backdrop-blur-md rounded-[2.5rem] p-8 border border-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group`}>
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-${color}-50 text-${color}-500 group-hover:scale-110 transition-transform`}>
            <Icon className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
        <p className="text-slate-500 leading-relaxed text-sm font-medium">{desc}</p>
    </div>
);

const WorkflowStep = ({ number, title, desc }: any) => (
    <div className="flex items-center p-4 bg-white/40 rounded-2xl border border-white/50 hover:bg-white/70 transition-colors">
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-extrabold text-slate-800 shadow-sm mr-4 text-sm flex-shrink-0">
            {number}
        </div>
        <div>
            <h4 className="font-bold text-slate-800 text-sm">{title}</h4>
            <p className="text-xs text-slate-500 font-medium">{desc}</p>
        </div>
    </div>
);

const ModuleCard = ({ title, icon: Icon, features, color }: any) => (
    <div className="glass-panel p-8 rounded-[2rem] border border-white/60 hover:border-slate-300 transition-colors">
        <div className="flex items-center space-x-3 mb-6">
            <Icon className={`w-6 h-6 text-${color}-500`} />
            <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
        </div>
        <ul className="space-y-3">
            {features.map((feat: string, i: number) => (
                <li key={i} className="flex items-center text-sm text-slate-600 font-medium">
                    <div className={`w-1.5 h-1.5 rounded-full bg-${color}-400 mr-2`}></div>
                    {feat}
                </li>
            ))}
        </ul>
    </div>
);

const TechBadge = ({ label }: { label: string }) => (
    <span className="px-5 py-2 rounded-full bg-white/10 border border-white/10 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-md">
        {label}
    </span>
);

export default About;
