import React, { useState, useEffect } from 'react';
import { Filter, Printer, RefreshCw } from 'lucide-react';

const ReportsView = () => {
  // Local Data State (populated directly from backend SQL query)
  const [reportData, setReportData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Default to current month (YYYY-MM)
  const currentMonth = new Date().toISOString().slice(0, 7);
  
  // Input State (What the user selects in the dropdown)
  const [monthInput, setMonthInput] = useState(currentMonth);

  // Applied State (What the matrix actually uses to fetch data)
  const [appliedMonth, setAppliedMonth] = useState(currentMonth);

  // Fetch Data whenever appliedMonth changes
  useEffect(() => {
    const fetchReportData = async () => {
      setIsLoading(true);
      try {
        // Make sure this URL matches exactly what you named the route in your Python/Node backend
        const res = await fetch(`${import.meta.env.VITE_API_URL}/report?month=${appliedMonth}`); 
        
        if (res.ok) {
          const data = await res.json();
          console.log("Raw Backend Data:", data); // Check your console to see the structure

      
          // let parsedArray = [];
          // if (Array.isArray(data)) {
          //   parsedArray = data; // If backend returns flat array: [...]
          // } else if (data && typeof data === 'object') {
          //   // If backend wraps in object: { data: [...] } or { reports: [...] }
          //   parsedArray = data.data || data.reports || data.results || data.rows || [];
          // }
         // Check the final data structure used for rendering
          
          setReportData(data.report || []); // Adjust this based on your actual backend response structure
          console.log("Parsed Report Data for Rendering:", reportData);
           // Check the final data structure used for rendering
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

  // Extra safety net for rendering
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
           <table className="w-full text-left min-w-[1200px]">
              <thead className="bg-[#1e2f5e] text-white">
                <tr>
                  <th rowSpan={2} className="px-6 py-4 text-[9px] font-black uppercase border-r border-white/20 align-middle">Agent</th>
                  <th colSpan={6} className="px-6 py-4 text-[9px] font-black uppercase text-center bg-[#0077c8] border-r border-white/20">SIP (₹)</th>
                  <th colSpan={5} className="px-6 py-4 text-[9px] font-black uppercase text-center bg-[#005ba1]">Lumpsum (₹)</th>
                </tr>
                <tr className="bg-slate-800 text-white">
                  {/* SIP Columns */}
                  <th className="px-4 py-3 text-[8px] font-black uppercase text-right border-r border-white/10">New</th>
                  <th className="px-4 py-3 text-[8px] font-black uppercase text-right border-r border-white/10">Relogin</th>
                  <th className="px-4 py-3 text-[8px] font-black uppercase text-right border-r border-white/10 text-red-300">Closed</th>
                  <th className="px-4 py-3 text-[8px] font-black uppercase text-right border-r border-white/10 text-red-300">Redemption</th>
                  <th className="px-4 py-3 text-[8px] font-black uppercase text-right border-r border-white/10">Target</th>
                  <th className="px-4 py-3 text-[8px] font-black uppercase text-right border-r border-white/20 bg-[#0077c8]">Achieved</th>
                  
                  {/* LUMPSUM Columns */}
                  <th className="px-4 py-3 text-[8px] font-black uppercase text-right border-r border-white/10">New</th>
                  <th className="px-4 py-3 text-[8px] font-black uppercase text-right border-r border-white/10">Relogin</th>
                  <th className="px-4 py-3 text-[8px] font-black uppercase text-right border-r border-white/10 text-red-300">Redemption</th>
                  <th className="px-4 py-3 text-[8px] font-black uppercase text-right border-r border-white/10">Target</th>
                  <th className="px-4 py-3 text-[8px] font-black uppercase text-right bg-[#005ba1]">Achieved</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan="12" className="px-6 py-10 text-center text-slate-400 font-bold text-xs uppercase">
                      Loading Report Data...
                    </td>
                  </tr>
                ) : safeReportData.length === 0 ? (
                  <tr>
                    <td colSpan="12" className="px-6 py-10 text-center text-slate-400 font-bold text-xs uppercase">
                      No data available for the selected month
                    </td>
                  </tr>
                ) : (
                  safeReportData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-black text-[#1e2f5e] uppercase text-xs border-r border-slate-100">
                        {row?.agent_name || '—'}
                      </td>
                       {/* Debug each row's data */}
                      
                      {/* SIP Data from SQL mapping */}
                      <td className="px-4 py-4 text-right text-xs font-bold text-slate-600 border-r border-slate-100">{Number(row?.sip_new || 0).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-4 text-right text-xs font-bold text-slate-600 border-r border-slate-100">{Number(row?.sip_relogin || 0).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-4 text-right text-xs font-bold text-red-500 border-r border-slate-100">{Number(row?.sip_closed || 0).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-4 text-right text-xs font-bold text-red-500 border-r border-slate-100">{Number(row?.sip_redemption || 0).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-4 text-right text-xs font-bold text-slate-500 border-r border-slate-100">{Number(row?.sip_target || 0).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-4 text-right text-sm font-black text-[#0077c8] border-r border-slate-200 bg-blue-50/30">{Number(row?.sip_achieved || 0).toLocaleString('en-IN')}</td>
                      
                      {/* Lumpsum Data from SQL mapping */}
                      <td className="px-4 py-4 text-right text-xs font-bold text-slate-600 border-r border-slate-100">{Number(row?.ls_new || 0).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-4 text-right text-xs font-bold text-slate-600 border-r border-slate-100">{Number(row?.ls_relogin || 0).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-4 text-right text-xs font-bold text-red-500 border-r border-slate-100">{Number(row?.ls_redemption || 0).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-4 text-right text-xs font-bold text-slate-500 border-r border-slate-100">{Number(row?.ls_target || 0).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-4 text-right text-sm font-black text-[#005ba1] bg-blue-50/30">{Number(row?.ls_achieved || 0).toLocaleString('en-IN')}</td>
                    </tr>
                  ))
                )}
              </tbody>
           </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsView;