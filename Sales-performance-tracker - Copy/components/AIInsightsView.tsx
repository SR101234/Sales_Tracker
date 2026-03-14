
import React from 'react';
import { BrainCircuit, RefreshCw } from 'lucide-react';

interface AIInsightsViewProps {
  aiReport: string | null;
  isAnalyzing: boolean;
  runAiAnalysis: () => void;
}

const AIInsightsView: React.FC<AIInsightsViewProps> = ({ aiReport, isAnalyzing, runAiAnalysis }) => {
  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 animate-fadeIn">
      <div className="bg-white p-6 sm:p-14 rounded-[2rem] sm:rounded-[3.5rem] shadow-2xl border border-blue-50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 sm:h-4 bg-gradient-to-r from-[#1e2f5e] via-[#0077c8] to-[#1e2f5e]" />
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 sm:mb-16 text-center sm:text-left">
          <div className="p-4 sm:p-6 bg-[#f0f7ff] text-[#0077c8] rounded-2xl shadow-inner"><BrainCircuit size={48} className="sm:w-16 sm:h-16" /></div>
          <div><h2 className="text-3xl sm:text-5xl font-black text-[#1e2f5e] uppercase tracking-tighter">AI Growth Analyst</h2><p className="text-slate-400 font-black uppercase tracking-[0.4em] text-[8px] sm:text-[10px] mt-1">FC & sons Consulting Proprietary</p></div>
        </div>
        {aiReport ? (
          <div className="prose prose-slate max-w-none text-slate-700">
            <div className="whitespace-pre-wrap leading-relaxed space-y-4 text-base sm:text-xl font-medium">
              {aiReport.split('\n').map((line, i) => <p key={i}>{line}</p>)}
            </div>
          </div>
        ) : (
          <div className="text-center py-16 sm:py-32 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
            <h3 className="text-xl sm:text-3xl font-black text-[#1e2f5e] uppercase mb-4 px-4">Insights Engine Ready</h3>
            <button 
              onClick={runAiAnalysis}
              disabled={isAnalyzing}
              className="bg-[#1e2f5e] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-[0.3em] hover:bg-black transition-all shadow-xl active:scale-95 flex items-center gap-4 mx-auto text-[10px] sm:text-sm"
            >
              {isAnalyzing ? <RefreshCw className="animate-spin" /> : <BrainCircuit />}
              {isAnalyzing ? 'Synthesizing...' : 'Launch AI Engine'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsightsView;
