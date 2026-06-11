import React, { useState, useEffect, useMemo } from "react";
import amcList from "../amc.js";       // array of AMC names
import amcSchemes from "../amc_schemes.json";  // AMC -> schemes JSON
import {
  Trophy, ArrowUpRight, TrendingUp, RefreshCw, MinusCircle, 
  ArrowDownRight, LineChart as LineChartIcon,
  ArrowLeft, Search, Calendar, User, Building2, Tag,
  SlidersHorizontal, X, Trash2, ArrowUpDown, ArrowUp, ArrowDown,
  Hash, CreditCard, Banknote, MessageSquare, Flag, Download, ShieldCheck
} from "lucide-react";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

// Import ExcelJS for color-coded Excel exports
import ExcelJS from 'exceljs';

const DashboardView = () => {
  const [metrics, setMetrics] = useState({});
  const [rankedAgents, setRankedAgents] = useState([]);
  const [monthlySummary, setMonthlySummary] = useState([]);
  
  // Specific Transaction States
  const [allTransactions, setAllTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState([]);

  // UI State
  const [activeCategory, setActiveCategory] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState(null);

  // Comprehensive Filter State covering every column + ARN
  const initialFilters = {
    transactionId: "",
    investorName: "",
    agentId: "",
    panFolio: "",
    amc: "",
    scheme: "",
    startDate: "",
    endDate: "",
    mode: "ALL",
    nature: "ALL",
    minAmount: "",
    maxAmount: "",
    remark: "",
    flag: "ALL",
    arn: "ALL" // Added ARN filter
  };
  const [filters, setFilters] = useState(initialFilters);

  const itemsPerPage = 10;

  // 1. Initial Dashboard Core Metric Fetch 
  const fetchDashboardData = async () => {
    try {
      const res = await fetch(import.meta.env.VITE_API_URL);
      const data = await res.json();
      setMetrics(data || {});
      setRankedAgents(data.table || []);
      setMonthlySummary((data.chart || []).map(item => ({
        monthShort: new Date(item.month).toLocaleString("default", { month: "short" }),
        new: Number(item.new_business),
        relogin: Number(item.relogin)
      })));
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Dedicated Transaction Fetcher
  const fetchTransactions = async () => {
    setTransactionsLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/transactions`);
      const data = await res.json();
      
      const txArray = Array.isArray(data) ? data : (data.transactions || []);
      setAllTransactions(txArray);
      
    } catch (err) {
      console.error("Transactions fetch error:", err);
      setAllTransactions([]);
    } finally {
      setTransactionsLoading(false);
    }
  };

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/agent`);
        const data = await res.json();
        setAgents(data || []);
      } catch (err) {
        console.error("Agents fetch error:", err);
        setAgents([]);
      }
    };
    fetchAgents();
    fetchDashboardData();
  }, []);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const statsConfig = {
    NEW_SIP: { label: "New SIPs", icon: ArrowUpRight, color: "bg-emerald-500", text: "text-emerald-600", filter: (tx) => tx.mode === 'SIP' && tx.nature === 'New' },
    LUMPSUM: { label: "Lumpsum", icon: TrendingUp, color: "bg-emerald-600", text: "text-emerald-700", filter: (tx) => tx.mode === 'LUMPSUM' },
    RELOGIN: { label: "Relogins", icon: RefreshCw, color: "bg-[#0077c8]", text: "text-[#0077c8]", filter: (tx) => tx.nature === 'Relogin' },
    CLOSED: { label: "Closed", icon: MinusCircle, color: "bg-orange-500", text: "text-orange-600", filter: (tx) => tx.nature === 'Closed' },
    REDEMPTION: { label: "Redemptions", icon: ArrowDownRight, color: "bg-red-500", text: "text-red-600", filter: (tx) => tx.mode === 'REDEMPTION' },
  };

  const handleCardClick = (key) => {
    setActiveCategory(key);
    
    const newFilters = { ...initialFilters };
    if (key === 'NEW_SIP') {
      newFilters.mode = 'SIP';
      newFilters.nature = 'New';
    } else if (key === 'LUMPSUM') {
      newFilters.mode = 'LUMPSUM';
    } else if (key === 'RELOGIN') {
      newFilters.nature = 'Relogin';
    } else if (key === 'CLOSED') {
      newFilters.nature = 'Closed';
    } else if (key === 'REDEMPTION') {
      newFilters.mode = 'REDEMPTION';
    }
    setFilters(newFilters);
    fetchTransactions();
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    handleCardClick(activeCategory); 
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig?.key !== columnKey) return <ArrowUpDown size={12} className="opacity-50" />;
    return sortConfig.direction === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const onDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this transaction?");
    if (!confirmed) return;
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/transaction_delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      fetchDashboardData();
      fetchTransactions();
    } catch (err) {
      console.error("Error deleting transaction:", err);
    }
  };

  const handleFlagChange = async (tx, newFlag) => {
    setAllTransactions(prev =>
      prev.map(t => (t.transaction_id === tx.transaction_id ? { ...t, flag: newFlag } : t))
    );
    const formattedDate = tx.entery_date ? new Date(tx.entery_date).toISOString().split("T")[0] : null;

    try {
      await fetch(`${import.meta.env.VITE_API_URL}/transaction_update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: tx.transaction_id,
          agent_id: tx.agent_id,
          mode: tx.mode,
          nature: tx.nature,
          investor_name: tx.investor_name,
          id_or_folio: tx.id_or_folio,
          amc_name: tx.amc_name,
          scheme_name: tx.scheme_name,
          amount: tx.amount,
          entery_date: formattedDate,
          remark: tx.remark,
          flag: newFlag,
          arn: tx.arn
        }),
      });
      fetchDashboardData();
    } catch (err) {
      console.error("Inline flag change error:", err);
    }
  };

  // Extract unique ARNs for the filter dropdown
  const uniqueFilteredARNs = Array.from(new Set(allTransactions.map(t => t.arn || 'N/A')));

  // Complex multi-column data filtering
  const filteredTransactions = useMemo(() => {
    let data = [...allTransactions];

    // Text Searches (Case Insensitive)
    if (filters.transactionId) data = data.filter(tx => tx.transaction_id?.toLowerCase().includes(filters.transactionId.toLowerCase()));
    if (filters.investorName) data = data.filter(tx => tx.investor_name?.toLowerCase().includes(filters.investorName.toLowerCase()));
    if (filters.agentId) data = data.filter(tx => tx.agent_id?.toLowerCase().includes(filters.agentId.toLowerCase()));
    if (filters.panFolio) data = data.filter(tx => tx.id_or_folio?.toLowerCase().includes(filters.panFolio.toLowerCase()));
    if (filters.amc) data = data.filter(tx => tx.amc_name?.toLowerCase().includes(filters.amc.toLowerCase()));
    if (filters.scheme) data = data.filter(tx => tx.scheme_name?.toLowerCase().includes(filters.scheme.toLowerCase()));
    if (filters.remark) data = data.filter(tx => tx.remark?.toLowerCase().includes(filters.remark.toLowerCase()));

    // Dropdown / Exact Matches
    if (filters.mode !== 'ALL') data = data.filter(tx => tx.mode === filters.mode);
    if (filters.nature !== 'ALL') data = data.filter(tx => tx.nature === filters.nature);
    if (filters.flag !== 'ALL') data = data.filter(tx => (tx.flag || "") === (filters.flag === "NONE" ? "" : filters.flag));
    if (filters.arn !== 'ALL') data = data.filter(tx => (tx.arn || 'N/A') === filters.arn); // ARN Filter Logic

    // Numerical Amount Ranges
    if (filters.minAmount) data = data.filter(tx => Number(tx.amount || 0) >= Number(filters.minAmount));
    if (filters.maxAmount) data = data.filter(tx => Number(tx.amount || 0) <= Number(filters.maxAmount));

    // Date Frames
    if (filters.startDate || filters.endDate) {
      data = data.filter(tx => {
        const txDate = new Date(tx.entery_date);
        txDate.setHours(0, 0, 0, 0);

        if (filters.startDate && txDate < new Date(filters.startDate).setHours(0, 0, 0, 0)) return false;
        if (filters.endDate && txDate > new Date(filters.endDate).setHours(0, 0, 0, 0)) return false;
        return true;
      });
    }

    // Dynamic Column Sorting
    if (sortConfig) {
      const { key, direction } = sortConfig;
      const modifier = direction === 'asc' ? 1 : -1;

      data.sort((a, b) => {
        if (key === 'recordingDate') return (new Date(a.entery_date).getTime() - new Date(b.entery_date).getTime()) * modifier;
        if (key === 'agent') return (a.agent_id || '').localeCompare(b.agent_id || '') * modifier;
        if (key === 'clientName') return (a.investor_name || '').localeCompare(b.investor_name || '') * modifier;
        if (key === 'amount') return (Number(a.amount || 0) - Number(b.amount || 0)) * modifier;
        if (key === 'arn') return (a.arn || 'N/A').localeCompare(b.arn || 'N/A') * modifier; // ARN Sort Logic
        return 0;
      });
    }

    return data;
  }, [allTransactions, filters, sortConfig]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const currentTransactions = useMemo(() => {
    return filteredTransactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [filteredTransactions, currentPage]);

  // --- NEW EXCEL EXPORT FUNCTION ---
  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Filtered Transactions");

    // Define columns including ARN
    worksheet.columns = [
      { header: "Date", key: "date", width: 15 },
      { header: "Agent PAN", key: "agent", width: 15 },
      { header: "ARN", key: "arn", width: 15 },
      { header: "Investor", key: "investor", width: 25 },
      { header: "PAN / Folio", key: "panFolio", width: 20 },
      { header: "AMC", key: "amc", width: 30 },
      { header: "Scheme", key: "scheme", width: 35 },
      { header: "Transaction ID", key: "txId", width: 25 },
      { header: "Mode", key: "mode", width: 15 },
      { header: "Nature", key: "nature", width: 15 },
      { header: "Amount (₹)", key: "amount", width: 15 },
      { header: "Remark", key: "remark", width: 30 },
      { header: "Flag", key: "flag", width: 10 }
    ];

    // Format Header Row
    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E2F5E' } // Dark blue header
    };

    // Add Data Rows and Apply Styling
    filteredTransactions.forEach(tx => {
      const row = worksheet.addRow({
        date: formatDate(tx.entery_date),
        agent: tx.agent_id || "",
        arn: tx.arn || "N/A",
        investor: tx.investor_name || "",
        panFolio: tx.id_or_folio || "",
        amc: tx.amc_name || "",
        scheme: tx.scheme_name || "",
        txId: tx.transaction_id || "",
        mode: tx.mode || "",
        nature: tx.nature || "",
        amount: Number(tx.amount || 0),
        remark: tx.remark || "",
        flag: tx.flag || "None"
      });

      // Apply Row Colors based on Status Flag (using ARGB hex formats)
      if (tx.flag === 'g') {
        row.eachCell({ includeEmpty: true }, (cell) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } }; // Light Green
        });
      } else if (tx.flag === 'y') {
        row.eachCell({ includeEmpty: true }, (cell) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } }; // Light Yellow
        });
      } else if (tx.flag === 'r') {
        row.eachCell({ includeEmpty: true }, (cell) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } }; // Light Red
        });
      }
    });

    // Write file and prompt download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `Transactions_Export_${new Date().toISOString().slice(0,10)}.xlsx`;
    anchor.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) return <div className="p-10 text-center font-bold text-gray-500">Loading Dashboard...</div>;

  // --- DRILL DOWN SEGMENT VIEW ---
  if (activeCategory) {
    const cfg = statsConfig[activeCategory];
    return (
      <div className="space-y-6 animate-fadeIn pb-10">
        {/* Navigation Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <button 
            onClick={() => {
              setActiveCategory(null);
              setAllTransactions([]); 
            }} 
            className="flex items-center gap-2 text-slate-500 font-black uppercase text-xs hover:text-[#0077c8] transition-colors"
          >
            <ArrowLeft size={18} /> Back to Dashboard
          </button>
          
          <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-2xl border border-gray-100 shadow-sm">
            <div className={`${cfg.color} p-1.5 rounded-lg text-white`}><cfg.icon size={16} /></div>
            <h2 className="font-black text-slate-800 uppercase text-sm tracking-tight">{cfg.label} Segment Explorer</h2>
          </div>
        </div>

        {/* Global Multi-Column Dynamic Filtering Hub */}
        <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-[#1e2f5e] font-black uppercase text-xs tracking-wider">
              <SlidersHorizontal size={16} />
              <span>Advanced Filtering Hub</span>
            </div>
            <button onClick={clearFilters} className="text-red-500 font-black uppercase text-[10px] flex items-center gap-1 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all">
              <X size={14} /> Clear Filters
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Specific Text Searches */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Transaction ID</label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input type="text" placeholder="Search ID..." className="w-full pl-9 border-2 border-slate-100 rounded-xl p-2.5 bg-slate-50 font-bold text-slate-800 text-xs outline-none focus:border-blue-300" value={filters.transactionId} onChange={(e) => handleFilterChange('transactionId', e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Client Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input type="text" placeholder="Search Client..." className="w-full pl-9 border-2 border-slate-100 rounded-xl p-2.5 bg-slate-50 font-bold text-slate-800 text-xs outline-none focus:border-blue-300" value={filters.investorName} onChange={(e) => handleFilterChange('investorName', e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Agent PAN</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input type="text" placeholder="Search Agent PAN..." className="w-full pl-9 border-2 border-slate-100 rounded-xl p-2.5 bg-slate-50 font-bold text-slate-800 text-xs outline-none focus:border-blue-300" value={filters.agentId} onChange={(e) => handleFilterChange('agentId', e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">PAN / Folio</label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input type="text" placeholder="Search PAN/Folio..." className="w-full pl-9 border-2 border-slate-100 rounded-xl p-2.5 bg-slate-50 font-bold text-slate-800 text-xs outline-none focus:border-blue-300" value={filters.panFolio} onChange={(e) => handleFilterChange('panFolio', e.target.value)} />
              </div>
            </div>

            {/* Added ARN Filter */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">ARN</label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <select className="w-full pl-9 border-2 border-slate-100 rounded-xl p-2.5 bg-slate-50 font-bold text-slate-800 text-xs outline-none focus:border-blue-300" value={filters.arn} onChange={e => handleFilterChange('arn', e.target.value)}>
                  <option value="ALL">All ARNs</option>
                  {uniqueFilteredARNs.map(arn => (
                    <option key={arn} value={arn}>{arn}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Asset Categorizations */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">AMC</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input type="text" placeholder="Filter AMC..." className="w-full pl-9 border-2 border-slate-100 rounded-xl p-2.5 bg-slate-50 font-bold text-slate-800 text-xs outline-none focus:border-blue-300" value={filters.amc} onChange={(e) => handleFilterChange('amc', e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Scheme</label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input type="text" placeholder="Filter Scheme..." className="w-full pl-9 border-2 border-slate-100 rounded-xl p-2.5 bg-slate-50 font-bold text-slate-800 text-xs outline-none focus:border-blue-300" value={filters.scheme} onChange={(e) => handleFilterChange('scheme', e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Mode</label>
              <select className="w-full border-2 border-slate-100 rounded-xl p-2.5 bg-slate-50 font-bold text-slate-800 text-xs outline-none focus:border-blue-300" value={filters.mode} onChange={e => handleFilterChange('mode', e.target.value)}>
                <option value="ALL">All Modes</option>
                <option value="SIP">SIP</option>
                <option value="SWP">SWP</option>
                <option value="LUMPSUM">Lumpsum</option>
                <option value="REDEMPTION">Redemption</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Nature</label>
              <select className="w-full border-2 border-slate-100 rounded-xl p-2.5 bg-slate-50 font-bold text-slate-800 text-xs outline-none focus:border-blue-300" value={filters.nature} onChange={e => handleFilterChange('nature', e.target.value)}>
                <option value="ALL">All Natures</option>
                <option value="New">New Acquisition</option>
                <option value="Relogin">Relogin</option>
                <option value="Closed">Closed</option>
                <option value="NONE">N/A</option>
              </select>
            </div>

            {/* Dates & Values */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Date From</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input type="date" className="w-full pl-9 border-2 border-slate-100 rounded-xl p-2.5 bg-slate-50 font-bold text-slate-800 text-xs outline-none focus:border-blue-300" value={filters.startDate} onChange={(e) => handleFilterChange('startDate', e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Date To</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input type="date" className="w-full pl-9 border-2 border-slate-100 rounded-xl p-2.5 bg-slate-50 font-bold text-slate-800 text-xs outline-none focus:border-blue-300" value={filters.endDate} onChange={(e) => handleFilterChange('endDate', e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Min Amount (₹)</label>
              <div className="relative">
                <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input type="number" placeholder="0.00" className="w-full pl-9 border-2 border-slate-100 rounded-xl p-2.5 bg-slate-50 font-bold text-slate-800 text-xs outline-none focus:border-blue-300" value={filters.minAmount} onChange={(e) => handleFilterChange('minAmount', e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Max Amount (₹)</label>
              <div className="relative">
                <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input type="number" placeholder="999999" className="w-full pl-9 border-2 border-slate-100 rounded-xl p-2.5 bg-slate-50 font-bold text-slate-800 text-xs outline-none focus:border-blue-300" value={filters.maxAmount} onChange={(e) => handleFilterChange('maxAmount', e.target.value)} />
              </div>
            </div>

            {/* Misc */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Remark Contains</label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input type="text" placeholder="Search remarks..." className="w-full pl-9 border-2 border-slate-100 rounded-xl p-2.5 bg-slate-50 font-bold text-slate-800 text-xs outline-none focus:border-blue-300" value={filters.remark} onChange={(e) => handleFilterChange('remark', e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Status Flag</label>
              <div className="relative">
                <Flag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <select className="w-full pl-9 border-2 border-slate-100 rounded-xl p-2.5 bg-slate-50 font-bold text-slate-800 text-xs outline-none focus:border-blue-300" value={filters.flag} onChange={e => handleFilterChange('flag', e.target.value)}>
                  <option value="ALL">All Statuses</option>
                  <option value="NONE">None</option>
                  <option value="g">Green (Resolved)</option>
                  <option value="y">Yellow (Pending)</option>
                  <option value="r">Red (Action Needed)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Ledger Grid View */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-slate-50 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-[#1e2f5e] uppercase">Filtered Results</h3>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                Showing <span className="text-[#0077c8]">{filteredTransactions.length}</span> Records
              </span>
            </div>
            
            {/* EXPORT TO EXCEL BUTTON */}
            <button 
              onClick={exportToExcel} 
              disabled={filteredTransactions.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#10b981] hover:bg-[#059669] text-white rounded-xl text-[10px] font-black uppercase transition-all shadow-sm disabled:opacity-50"
            >
              <Download size={14} /> Download Excel
            </button>
          </div>

          <div className="overflow-x-auto min-h-[300px] relative">
            {/* In-Table Loading State */}
            {transactionsLoading && (
              <div className="absolute inset-0 z-10 bg-white/70 backdrop-blur-sm flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <RefreshCw className="animate-spin text-[#0077c8]" size={32} />
                  <span className="text-xs font-black text-[#1e2f5e] uppercase tracking-widest">Retrieving Transactions...</span>
                </div>
              </div>
            )}
            
            <table className="w-full text-left min-w-[1300px]">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase whitespace-nowrap cursor-pointer hover:text-slate-600" onClick={() => handleSort('recordingDate')}>
                    <div className="flex items-center gap-1">Date <SortIcon columnKey="recordingDate" /></div>
                  </th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase whitespace-nowrap cursor-pointer hover:text-slate-600" onClick={() => handleSort('agent')}>
                    <div className="flex items-center gap-1">Agent PAN <SortIcon columnKey="agent" /></div>
                  </th>
                  
                  {/* Added ARN Table Header */}
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase whitespace-nowrap cursor-pointer hover:text-slate-600" onClick={() => handleSort('arn')}>
                    <div className="flex items-center gap-1">ARN <SortIcon columnKey="arn" /></div>
                  </th>

                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase whitespace-nowrap cursor-pointer hover:text-slate-600" onClick={() => handleSort('clientName')}>
                    <div className="flex items-center gap-1">Investor <SortIcon columnKey="clientName" /></div>
                  </th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase whitespace-nowrap">PAN / Folio</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase whitespace-nowrap">AMC</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase whitespace-nowrap">Scheme</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase whitespace-nowrap">Transaction ID</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase whitespace-nowrap">Mode / Nature</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase text-right cursor-pointer hover:text-slate-600" onClick={() => handleSort('amount')}>
                    <div className="flex items-center justify-end gap-1">Value (₹) <SortIcon columnKey="amount" /></div>
                  </th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase whitespace-nowrap">Remark</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase text-center whitespace-nowrap">Status Flag</th>
                 
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentTransactions.map(tx => (
                  <tr key={tx.transaction_id} className={`transition-colors ${
                    tx.flag === 'y' ? 'bg-yellow-50/60 hover:bg-yellow-50' : 
                    tx.flag === 'g' ? 'bg-green-50/60 hover:bg-green-50' : 
                    tx.flag === 'r' ? 'bg-red-50/60 hover:bg-red-50' : 
                    'hover:bg-blue-50/30'
                  }`}>
                    <td className="px-6 py-5 text-xs font-bold text-slate-500 whitespace-nowrap">{formatDate(tx.entery_date)}</td>
                    <td className="px-6 py-5 text-xs font-black text-[#1e2f5e] uppercase whitespace-nowrap">{tx.agent_id || '—'}</td>
                    
                    {/* Added ARN Table Data Cell */}
                    <td className="px-6 py-5 text-xs font-bold text-slate-600 whitespace-nowrap">{tx.arn || 'N/A'}</td>

                    <td className="px-6 py-5 text-xs text-slate-700 font-bold whitespace-nowrap">{tx.investor_name}</td>
                    <td className="px-6 py-5 text-xs text-slate-500 whitespace-nowrap">{tx.id_or_folio}</td>
                    <td className="px-6 py-5 text-xs text-slate-600 whitespace-nowrap">{tx.amc_name}</td>
                    <td className="px-6 py-5 text-xs text-slate-600 whitespace-nowrap">{tx.scheme_name}</td>
                    <td className="px-6 py-5 text-[10px] font-black text-[#0077c8] whitespace-nowrap">{tx.transaction_id}</td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-slate-700 whitespace-nowrap">{tx.mode}</span>
                        <span className={`text-[8px] uppercase font-black px-2 py-0.5 rounded border w-fit whitespace-nowrap ${tx.mode === 'REDEMPTION' ? 'bg-red-50 text-red-700 border-red-200' : tx.nature === 'New' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-700 border-slate-200'}`}>{tx.mode === 'REDEMPTION' ? 'REDEMPTION' : (tx.nature || '').replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm font-black text-right text-[#1e2f5e] whitespace-nowrap">₹{(Number(tx.amount || 0)).toLocaleString()}</td>
                    <td className="px-6 py-5 text-xs text-slate-500 max-w-[150px] truncate"><span title={tx.remark}>{tx.remark || '—'}</span></td>
                    
                    {/* Inline Status Dropdown Control */}
                    <td className="px-6 py-5 text-center">
                      <select
                        className={`text-[10px] font-bold uppercase rounded p-1.5 outline-none cursor-pointer border shadow-sm transition-all ${
                          tx.flag === 'g' ? 'bg-green-100 text-green-800 border-green-300' :
                          tx.flag === 'y' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                          tx.flag === 'r' ? 'bg-red-100 text-red-800 border-red-300' : 'bg-white text-slate-600 border-slate-200'
                        }`}
                        value={tx.flag || ""}
                        onChange={(e) => handleFlagChange(tx, e.target.value)}
                      >
                        <option value="">None</option>
                        <option value="g">Green</option>
                        <option value="y">Yellow</option>
                        <option value="r">Red</option>
                      </select>
                    </td>

                  
                  </tr>
                ))}
                {(!transactionsLoading && currentTransactions.length === 0) && (
                  <tr>
                    <td colSpan="13" className="p-10 text-center text-slate-400 font-bold text-sm">No transactions match your current filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Paging Blocks */}
          {totalPages > 1 && (
            <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50">
              <span className="text-xs font-bold text-slate-500 uppercase">Page {currentPage} of {totalPages}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 disabled:opacity-50 hover:bg-slate-100 transition-colors uppercase shadow-sm"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 disabled:opacity-50 hover:bg-slate-100 transition-colors uppercase shadow-sm"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- STANDARD SUMMARY METRIC DASHBOARD VIEW ---
  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-[#1e2f5e] to-[#0077c8] p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 sm:p-12 opacity-10 hidden sm:block"><Trophy size={180} /></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 sm:gap-8">
          <div>
            <h2 className="text-blue-200 font-black uppercase tracking-[0.3em] text-[10px] sm:text-xs mb-2">Net Business Growth</h2>
            <span className="text-4xl sm:text-6xl font-black text-white tracking-tighter">
              ₹{((Number(metrics.cards?.new_sips) + Number(metrics.cards?.lumpsum) + Number(metrics.cards?.relogins) - Number(metrics.cards?.closed) - Number(metrics.cards?.redemptions)) || 0).toLocaleString()}
            </span>
          </div>
          <div className="bg-white/10 backdrop-blur-xl px-5 sm:px-8 py-4 rounded-2xl border border-white/20">
            <p className="text-blue-100/80 text-[8px] font-black uppercase tracking-widest mb-1">Multiplier</p>
            <p className="text-2xl sm:text-3xl font-black text-white">
              {Math.round(((Number(metrics.cards?.new_sips) + Number(metrics.cards?.lumpsum) + Number(metrics.cards?.relogins)) / ((Number(metrics.cards?.closed) + Number(metrics.cards?.redemptions)) || 1)) * 10) / 10}x
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
        {Object.entries(statsConfig).map(([key, stat]) => (
          <div key={key} onClick={() => handleCardClick(key)} className="bg-white p-5 sm:p-7 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-2 rounded-xl text-white`}><stat.icon size={18} /></div>
              <span className={`text-[8px] sm:text-[9px] font-black uppercase tracking-widest ${stat.text}`}>{stat.label}</span>
            </div>
            <p className="text-xl sm:text-2xl font-black text-[#1e2f5e]">₹{(metrics.cards?.[key.toLowerCase().replace('sip', 'sips').replace('relogin', 'relogins')] || 0).toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Performers Leaderboard & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white rounded-[2rem] border border-gray-100 flex flex-col">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-slate-50 rounded-t-[2rem]">
            <h3 className="font-black text-slate-800 uppercase text-sm">Top Performers</h3>
            <Trophy className="text-yellow-500" size={18} />
          </div>
          <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
            {rankedAgents.map((agent, idx) => (
              <div key={idx} className="flex items-center gap-3 p-4 rounded-2xl border border-gray-50">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${idx === 0 ? "bg-yellow-400" : "bg-slate-100"}`}>{idx + 1}</div>
                <div className="flex-1"><h4 className="font-black text-slate-800 uppercase text-[10px] truncate">{agent.name}</h4></div>
                <span className="text-[10px] font-black text-emerald-600">₹{agent.net_growth}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-[2rem] border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6"><LineChartIcon className="text-[#0077c8]" size={20} /><h3 className="font-black text-slate-800 uppercase text-sm">Growth Trends</h3></div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlySummary}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="monthShort" /> <YAxis /> <Tooltip /> <Legend />
                <Bar dataKey="new" name="New" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="relogin" name="Relogin" fill="#0077c8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;