import React, { useState, useEffect } from 'react';
import { Filter, Printer, RefreshCw } from 'lucide-react';

const ReportsView = () => {
  const [reportData, setReportData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const [monthInput, setMonthInput] = useState(currentMonth);
  const [appliedMonth, setAppliedMonth] = useState(currentMonth);

  useEffect(() => {
    const fetchReportData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/report?month=${appliedMonth}`); 
        
        if (res.ok) {
          const data = await res.json();
          console.log("Raw Backend Data:", data); 
          setReportData(data.report || []); 
          console.log("Parsed Report Data for Rendering:", reportData);
        } else {
          throw new Error("Failed to fetch report data");
        }
      } catch (err) {
        console.error("Error fetching report data:", err);
        setReportData([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (appliedMonth) {
      fetchReportData();
    }
  }, [appliedMonth]);

  const handleGenerateReport = () => {
    setAppliedMonth(monthInput);
  };

  const safeReportData = Array.isArray(reportData) ? reportData : [];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 no-print">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-[#1e2f5e] p-3 rounded-xl text-white">
              <Filter size={18} />
            </div>
            <div>
              <h3 className="font-black text-lg sm:text-xl text-slate-800 uppercase">Export Center</h3>
              <p className="text-slate-500 text-[8px] font-black uppercase">Proprietary Financial Matrix</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-3">
                <span className="text-slate-400 font-black text-[10px] uppercase tracking-wider">Select Month:</span>
                <input 
                  type="month" 
                  className="border-2 border-slate-100 rounded-xl p-3 bg-slate-50 font-bold text-slate-800 text-xs w-48 focus:border-[#0077c8] outline-none transition-colors" 
                  value={monthInput} 
                  onChange={(e) => setMonthInput(e.target.value)} 
                />
              </div>
            </div>
            
            <button 
              onClick={handleGenerateReport} 
              disabled={isLoading}
              className="flex items-center justify-center gap-2 bg-[#0077c8] text-white px-6 py-3.5 rounded-xl hover:bg-[#1e2f5e] transition-all text-[10px] font-black uppercase shadow-md w-full sm:w-auto disabled:opacity-70"
            >
              <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} /> 
              {isLoading ? "Generating..." : "Generate"}
            </button>

            <button 
              onClick={() => window.print()} 
              className="flex items-center justify-center gap-2 bg-slate-800 text-white px-6 py-3.5 rounded-xl hover:bg-black transition-all text-[10px] font-black uppercase shadow-md w-full sm:w-auto"
            >
              <Printer size={14} /> Print
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden print:shadow-none print:m-0 print:p-0">
        <div className="overflow-x-auto">
           {/* Increased min-width to accommodate the new columns */}
           <table className="w-full text-left min-w-[1400px]">
              <thead className="bg-[#1e2f5e] text-white">
                <tr>
                  <th rowSpan={2} className="px-6 py-4 text-[9px] font-black uppercase border-r border-white/20 align-middle">Agent</th>
                  <th colSpan={5} className="px-6 py-4 text-[9px] font-black uppercase text-center bg-[#0077c8] border-r border-white/20">SIP (₹)</th>
                  <th colSpan={4} className="px-6 py-4 text-[9px] font-black uppercase text-center bg-[#005ba1] border-r border-white/20">Lumpsum (₹)</th>
                  <th rowSpan={2} className="px-6 py-4 text-[9px] font-black uppercase text-center bg-red-900/80 border-r border-white/20 align-middle">Total Redemption (₹)</th>
                  
                  {/* New Overall Performance Headers */}
                  <th colSpan={2} className="px-6 py-4 text-[9px] font-black uppercase text-center bg-emerald-700">Overall (₹)</th>
                </tr>
                <tr className="bg-slate-800 text-white">
                  {/* SIP Columns */}
                  <th className="px-4 py-3 text-[8px] font-black uppercase text-right border-r border-white/10">New</th>
                  <th className="px-4 py-3 text-[8px] font-black uppercase text-right border-r border-white/10">Relogin</th>
                  <th className="px-4 py-3 text-[8px] font-black uppercase text-right border-r border-white/10 text-red-300">Closed</th>
                  <th className="px-4 py-3 text-[8px] font-black uppercase text-right border-r border-white/10">Target</th>
                  <th className="px-4 py-3 text-[8px] font-black uppercase text-right border-r border-white/20 bg-[#0077c8]">Achieved</th>
                  
                  {/* LUMPSUM Columns */}
                  <th className="px-4 py-3 text-[8px] font-black uppercase text-right border-r border-white/10">New</th>
                  <th className="px-4 py-3 text-[8px] font-black uppercase text-right border-r border-white/10">Relogin</th>
                  <th className="px-4 py-3 text-[8px] font-black uppercase text-right border-r border-white/10">Target</th>
                  <th className="px-4 py-3 text-[8px] font-black uppercase text-right border-r border-white/20 bg-[#005ba1]">Achieved</th>
                  
                  {/* Overall Columns */}
                  <th className="px-4 py-3 text-[8px] font-black uppercase text-right border-r border-white/10">Total Target</th>
                  <th className="px-4 py-3 text-[8px] font-black uppercase text-right bg-emerald-600">Net Achieved</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    {/* Updated colSpan to 13 to cover all columns */}
                    <td colSpan="13" className="px-6 py-10 text-center text-slate-400 font-bold text-xs uppercase">
                      Loading Report Data...
                    </td>
                  </tr>
                ) : safeReportData.length === 0 ? (
                  <tr>
                    {/* Updated colSpan to 13 */}
                    <td colSpan="13" className="px-6 py-10 text-center text-slate-400 font-bold text-xs uppercase">
                      No data available for the selected month
                    </td>
                  </tr>
                ) : (
                  safeReportData.map((row, idx) => {
                    // 1. Calculate unified redemption total
                    const totalRedemption = 
                      Number(row?.sip_redemption || 0) + 
                      Number(row?.ls_redemption || 0) + 
                      Number(row?.standalone_redemptions || 0);

                    // 2. Calculate Total Target
                    const totalTarget = 
                      Number(row?.sip_target || 0) + 
                      Number(row?.ls_target || 0);

                    // 3. Calculate Net Achieved accurately using raw additions and deductions
                    const grossAdditions = 
                      Number(row?.sip_new || 0) + 
                      Number(row?.sip_relogin || 0) + 
                      Number(row?.ls_new || 0) + 
                      Number(row?.ls_relogin || 0);

                    const totalClosed = 
                      Number(row?.sip_closed || 0) + 
                      Number(row?.ls_closed || 0);

                    const netAchieved = grossAdditions - totalClosed - totalRedemption;

                    return (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-black text-[#1e2f5e] uppercase text-xs border-r border-slate-100">
                          {row?.agent_name || '—'}
                        </td>
                        
                        {/* SIP Data */}
                        <td className="px-4 py-4 text-right text-xs font-bold text-slate-600 border-r border-slate-100">{Number(row?.sip_new || 0).toLocaleString('en-IN')}</td>
                        <td className="px-4 py-4 text-right text-xs font-bold text-slate-600 border-r border-slate-100">{Number(row?.sip_relogin || 0).toLocaleString('en-IN')}</td>
                        <td className="px-4 py-4 text-right text-xs font-bold text-red-500 border-r border-slate-100">{Number(row?.sip_closed || 0).toLocaleString('en-IN')}</td>
                        <td className="px-4 py-4 text-right text-xs font-bold text-slate-500 border-r border-slate-100">{Number(row?.sip_target || 0).toLocaleString('en-IN')}</td>
                        <td className="px-4 py-4 text-right text-sm font-black text-[#0077c8] border-r border-slate-200 bg-blue-50/30">{Number(row?.sip_achieved || 0).toLocaleString('en-IN')}</td>
                        
                        {/* Lumpsum Data */}
                        <td className="px-4 py-4 text-right text-xs font-bold text-slate-600 border-r border-slate-100">{Number(row?.ls_new || 0).toLocaleString('en-IN')}</td>
                        <td className="px-4 py-4 text-right text-xs font-bold text-slate-600 border-r border-slate-100">{Number(row?.ls_relogin || 0).toLocaleString('en-IN')}</td>
                        <td className="px-4 py-4 text-right text-xs font-bold text-slate-500 border-r border-slate-100">{Number(row?.ls_target || 0).toLocaleString('en-IN')}</td>
                        <td className="px-4 py-4 text-right text-sm font-black text-[#005ba1] border-r border-slate-200 bg-blue-50/30">{Number(row?.ls_achieved || 0).toLocaleString('en-IN')}</td>

                        {/* Standalone Unified Redemption Column */}
                        <td className="px-4 py-4 text-right text-sm font-black text-red-600 border-r border-slate-200 bg-red-50/30">
                          {totalRedemption.toLocaleString('en-IN')}
                        </td>

                        {/* New Overall Performance Columns */}
                        <td className="px-4 py-4 text-right text-xs font-bold text-slate-500 border-r border-slate-200">
                          {totalTarget.toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-4 text-right text-sm font-black text-emerald-700 bg-emerald-50/50">
                          {netAchieved.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
           </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsView;