

import React from 'react';
import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, ShieldCheck, Zap, TrendingUp, ArrowRight, Dna, ScanLine, Smartphone } from 'lucide-react';
import { View } from '../types';

const data = [
  { name: 'Mon', value: 30 },
  { name: 'Tue', value: 45 },
  { name: 'Wed', value: 35 },
  { name: 'Thu', value: 55 },
  { name: 'Fri', value: 48 },
  { name: 'Sat', value: 65 },
  { name: 'Sun', value: 78 },
];

const MetricCard = ({ label, value, sub, icon: Icon, colorClass, barColor, percent }: any) => (
  <div className="glass-card p-6 rounded-[2rem] hover:transform hover:-translate-y-2 transition-all duration-300 group">
    <div className="flex items-start justify-between mb-4">
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{label}</p>
        <h3 className="text-4xl font-extrabold text-slate-800 drop-shadow-sm">{value}</h3>
      </div>
      <div className={`p-4 rounded-2xl ${colorClass} bg-opacity-10 group-hover:bg-opacity-20 transition-colors shadow-inner`}>
        <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} />
      </div>
    </div>
    <div className="flex items-center space-x-3">
      <div className="flex-1 bg-slate-100/50 rounded-full h-2.5 shadow-inner overflow-hidden border border-white/50">
        <div className={`h-full rounded-full ${barColor} shadow-lg relative overflow-hidden transition-all duration-1000 ease-out`} style={{ width: `${percent}%` }}>
            <div className="absolute top-0 left-0 w-full h-1/2 bg-white/30 rounded-t-full"></div>
        </div>
      </div>
      <span className="text-xs font-bold text-slate-600">{sub}</span>
    </div>
  </div>
);

const FeatureCard = ({ title, desc, icon: Icon }: any) => (
  <div className="glass-card p-8 rounded-[2.5rem] relative overflow-hidden group hover:bg-white/60 transition-colors">
    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-rose-50 to-transparent opacity-0 group-hover:opacity-100 rounded-bl-[100px] transition-all duration-500"></div>
    <div className="relative z-10">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white to-slate-50 border border-white shadow-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-8 h-8 text-navy-900 drop-shadow-sm" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed font-medium">{desc}</p>
    </div>
  </div>
);

interface DashboardProps {
  onViewChange: (view: View) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onViewChange }) => {
  return (
    <div className="space-y-12 animate-fade-in">
      
      {/* Hero Section - Glossy Dark Mode */}
      <div className="relative bg-[#0B1120] rounded-[3rem] p-8 md:p-16 overflow-hidden shadow-2xl shadow-navy-900/50 border border-white/10">
        {/* Abstract Background Shapes */}
        <div className="absolute top-[-50%] right-[-10%] w-[800px] h-[800px] bg-gradient-to-b from-rose-500/30 to-transparent rounded-full blur-3xl mix-blend-screen"></div>
        <div className="absolute bottom-[-50%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-t from-teal-500/30 to-transparent rounded-full blur-3xl mix-blend-screen"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        
        {/* Gloss Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none rounded-[3rem]"></div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/10 border border-white/10 backdrop-blur-md text-rose-300 text-xs font-bold uppercase tracking-widest mb-8 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-rose-500 mr-2 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.8)]"></span>
              Parasitology AI 5.0
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-8 tracking-tight drop-shadow-2xl">
              Precision <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-orange-400 to-amber-400">Parasitology.</span>
            </h1>
            <p className="text-slate-300 text-lg mb-10 max-w-lg leading-relaxed font-medium">
              ParaDetect AI analyzes molecular blood patterns to detect malaria variants before clinical symptoms manifest using advanced morphology scanning.
            </p>
            <div className="flex space-x-4">
              <button 
                onClick={() => onViewChange('about')}
                className="group bg-gradient-to-r from-rose-500 to-rose-600 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-rose-500/40 hover:shadow-rose-500/60 hover:-translate-y-1 flex items-center btn-glossy border border-white/20"
              >
                See How It Works <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
          
          <div className="hidden md:block relative">
             {/* Glassmorphic Chart Card */}
             <div className="bg-white/5 backdrop-blur-2xl rounded-[2.5rem] p-8 border border-white/10 shadow-2xl relative overflow-hidden transform rotate-2 hover:rotate-0 transition-all duration-700 group">
               <div className="absolute top-0 right-0 p-32 bg-rose-500/20 blur-[80px] rounded-full group-hover:bg-rose-500/30 transition-all animate-pulse"></div>
               
               <div className="flex justify-between items-center mb-8 relative z-10">
                 <div>
                   <h4 className="text-white text-xl font-bold drop-shadow-md">Detection Confidence</h4>
                   <div className="flex items-center mt-1 space-x-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                      </span>
                      <p className="text-rose-300 text-xs font-bold uppercase tracking-wider">Real-time Analysis</p>
                   </div>
                 </div>
                 <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500/20 to-rose-500/5 flex items-center justify-center border border-rose-500/30 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.3)] group-hover:scale-110 transition-transform duration-500">
                   <div className="absolute inset-0 bg-rose-500/20 blur-lg rounded-full animate-pulse"></div>
                   <Zap className="w-6 h-6 relative z-10" />
                 </div>
               </div>
               
               <div className="h-56 relative z-10">
                  <ResponsiveContainer width="100%" height={224}>
                    <AreaChart data={data}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.6}/>
                          <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Tooltip 
                        contentStyle={{backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff', boxShadow: '0 20px 40px rgba(0,0,0,0.4)'}}
                        itemStyle={{color: '#f43f5e', fontWeight: 'bold'}}
                        cursor={{stroke: 'rgba(255,255,255,0.2)', strokeWidth: 2, strokeDasharray: '4 4'}}
                      />
                      <Area type="monotone" dataKey="value" stroke="#f43f5e" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                  </ResponsiveContainer>
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <FeatureCard 
          title="Pattern Recognition" 
          desc="Deep learning analysis of blood smears, cell morphology, and hemoglobin index correlations."
          icon={ScanLine}
        />
        <FeatureCard 
          title="Digital Integration" 
          desc="Automatic OCR ingestion of standard clinical CBC reports and hematology analyzer data."
          icon={Smartphone}
        />
        <FeatureCard 
          title="Predictive Trends" 
          desc="Longitudinal tracking of red cell distribution width (RDW) and patient metabolic evolution."
          icon={TrendingUp}
        />
      </div>

      {/* Metrics Section */}
      <div>
        <h2 className="text-3xl font-bold text-slate-800 mb-8 flex items-center drop-shadow-sm">
          <Activity className="w-8 h-8 mr-3 text-rose-500" />
          Clinical Vitality Index
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <MetricCard 
            label="Systemic Accuracy" 
            value="99.1%" 
            sub="High Confidence"
            icon={ShieldCheck} 
            colorClass="bg-teal-500" 
            barColor="bg-teal-500"
            percent={99.1}
          />
          <MetricCard 
            label="Analysis Speed" 
            value="< 2s" 
            sub="Real-time"
            icon={Zap} 
            colorClass="bg-orange-500" 
            barColor="bg-orange-500"
            percent={98}
          />
          <MetricCard 
            label="Parasite Types" 
            value="4" 
            sub="Species Covered"
            icon={Dna} 
            colorClass="bg-rose-500" 
            barColor="bg-rose-500"
            percent={100}
          />
          <MetricCard 
            label="Active Cases" 
            value="142" 
            sub="Monitoring"
            icon={Activity} 
            colorClass="bg-blue-500" 
            barColor="bg-blue-500"
            percent={65}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
