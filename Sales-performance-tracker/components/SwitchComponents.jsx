import React, { useState, useEffect } from 'react';
import amcList from "../amc.js";       // array of AMC names
import amcSchemes from "../amc_schemes.json";  // AMC -> schemes JSON
import {
  PlusCircle, Edit3, X, CreditCard, MessageSquare, AlertCircle, Trash2, ArrowUpDown, ArrowUp, ArrowDown, Repeat
} from 'lucide-react';
import { TransactionType } from '../types';

const SwitchStpView = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState(null);
  const [filters, setFilters] = useState({ mode: 'ALL' });
  const [transactions, setTransactions] = useState([]);
  const [formErrors, setFormErrors] = useState([]);
  
  // Consolidated AMC State
  const [selectedAMC, setSelectedAMC] = useState("");
  const [showAMCList, setShowAMCList] = useState(false);
  const [filteredAMCs, setFilteredAMCs] = useState([]);

  // Scheme States
  const [fromSchemeSearch, setFromSchemeSearch] = useState("");
  const [toSchemeSearch, setToSchemeSearch] = useState("");
  
  const [filteredFromSchemes, setFilteredFromSchemes] = useState([]);
  const [filteredToSchemes, setFilteredToSchemes] = useState([]);
  
  const [showFromSchemeList, setShowFromSchemeList] = useState(false);
  const [showToSchemeList, setShowToSchemeList] = useState(false);
  
  const [tempSearch, setTempSearch] = useState('');
  const [tempStartDate, setTempStartDate] = useState('');
  const [tempEndDate, setTempEndDate] = useState('');

  const [newTx, setNewTx] = useState({ mode: "SWITCH", frequency: "", switchType: "INTERNAL" });
  const [editingId, setEditingId] = useState(null);
  const [agents, setAgents] = useState([]);

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

    const fetchTransactions = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/read_switch_stp`);
        const data = await res.json();
        console.log("Fetched transactions:", data);
        setTransactions(data.switch_stp || []);
      } catch (err) {
        console.error("Transactions fetch error:", err);
        setTransactions([]);
      }
    };

    fetchAgents();
    fetchTransactions();
  }, []);

  // Autocomplete Logic - AMC
  useEffect(() => {
    if (selectedAMC === "") {
      setFilteredAMCs([]);
      return;
    }
    const results = amcList.filter(amc => amc.toLowerCase().includes(selectedAMC.toLowerCase()));
    setFilteredAMCs(results.slice(0, 10));
  }, [selectedAMC]);

  // Autocomplete Logic - FROM Scheme
  useEffect(() => {
    if (!selectedAMC || fromSchemeSearch === "") {
      setFilteredFromSchemes([]);
      return;
    }
    const schemes = amcSchemes[selectedAMC] || [];
    const results = schemes.filter(scheme => scheme.toLowerCase().includes(fromSchemeSearch.toLowerCase()));
    setFilteredFromSchemes(results.slice(0, 10));
  }, [fromSchemeSearch, selectedAMC]);

  // Autocomplete Logic - TO Scheme
  useEffect(() => {
    if (!selectedAMC || toSchemeSearch === "") {
      setFilteredToSchemes([]);
      return;
    }
    const schemes = amcSchemes[selectedAMC] || [];
    const results = schemes.filter(scheme => scheme.toLowerCase().includes(toSchemeSearch.toLowerCase()));
    setFilteredToSchemes(results.slice(0, 10));
  }, [toSchemeSearch, selectedAMC]);

  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, startDate, endDate, filters]);

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

  const applyFilters = () => {
    setSearchTerm(tempSearch);
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
  };

  const onEdit = (tx) => {
    setEditingId(tx.transaction_id);

    const detectedSwitchType = tx.switch_type || (tx.from_amc === tx.to_amc ? "INTERNAL" : "EXTERNAL");

    setNewTx({
      id: tx.transaction_id,
      agentId: tx.agent_id || "",
      mode: tx.mode || "SWITCH",
      switchType: detectedSwitchType,
      clientName: tx.investor_name || "",
      panOrFolio: tx.id_or_folio || "",
      amcName: tx.from_amc || "",
      fromSchemeName: tx.from_scheme || "",
      toSchemeName: tx.to_scheme || "",
      frequency: tx.frequency || "",
      amount: tx.amount || "",
      recordingDate: tx.entery_date ? new Date(tx.entery_date).toISOString().split("T")[0] : "",
      remark: tx.remark || ""
    });

    setSelectedAMC(tx.from_amc || "");
    setFromSchemeSearch(tx.from_scheme || "");
    setToSchemeSearch(tx.to_scheme || "");
    
    setShowAMCList(false);
    setShowFromSchemeList(false);
    setShowToSchemeList(false);
  };

  const onCancelEdit = () => {
    setEditingId(null);
    setNewTx({ mode: "SWITCH", frequency: "", switchType: "INTERNAL" });
    setSelectedAMC("");
    setFromSchemeSearch("");
    setToSchemeSearch("");
    setFormErrors([]);
  };

  const onDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this transfer transaction?");
    if (!confirmed) return;
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/delete_switch_stp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setTransactions(prev => prev.filter(tx => tx.transaction_id !== id));
    } catch (err) {
      console.error("Error deleting transaction:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let errors = [];

    if (!newTx.agentId) errors.push("agentId");
    if (!newTx.clientName) errors.push("clientName");
    if (!newTx.panOrFolio) errors.push("panOrFolio");
    if (!newTx.amcName) errors.push("amcName");
    if (!newTx.fromSchemeName) errors.push("fromSchemeName");
    if (!newTx.toSchemeName) errors.push("toSchemeName");
    if (!newTx.amount) errors.push("amount");
    if (!newTx.recordingDate) errors.push("recordingDate");
    if (newTx.mode === 'STP' && !newTx.frequency) errors.push("frequency");

    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors([]);

    const payload = {
      agent_id: newTx.agentId,
      mode: newTx.mode,
      switch_type: newTx.mode === 'STP' ? 'INTERNAL' : newTx.switchType, 
      investor_name: newTx.clientName,
      id_or_folio: newTx.panOrFolio,
      from_amc: newTx.amcName,        // Sending same AMC to both
      to_amc: newTx.amcName,          // Sending same AMC to both
      from_scheme: newTx.fromSchemeName,
      to_scheme: newTx.toSchemeName,
      frequency: newTx.mode === 'STP' ? newTx.frequency : null,
      amount: newTx.amount,
      entery_date: newTx.recordingDate,
      remark: newTx.remark || ""
    };

    if (editingId) {
      setTransactions(prev => prev.map(tx => tx.transaction_id === editingId ? { ...tx, ...payload } : tx));
      try {
        await fetch(`${import.meta.env.VITE_API_URL}/update_switch_stp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, ...payload }),
        });
        
        alert("Transaction updated successfully!"); 
        
      } catch (err) { 
        console.error("Update error:", err); 
        alert("Failed to update transaction. Please try again.");
      }
      
      onCancelEdit();
      
    } else {
      try {
        const now = new Date();
        const generatedId = newTx.agentId[0] + newTx.agentId[9] + newTx.panOrFolio[0] + 
          String(now.getTime()).slice(-8);

        const newTransaction = { id: generatedId, transaction_id: generatedId, ...payload };

        await fetch(`${import.meta.env.VITE_API_URL}/switch_stp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newTransaction),
        });
        setTransactions(prev => [newTransaction, ...prev]);
        
        alert("Transaction committed successfully!");
        
      } catch (err) { 
        console.error("Creation error:", err); 
        alert("Failed to commit transaction. Please try again.");
      }
      
      onCancelEdit();
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = !searchTerm ||
      (tx.investor_name && tx.investor_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tx.id_or_folio && tx.id_or_folio.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tx.from_amc && tx.from_amc.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tx.from_scheme && tx.from_scheme.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tx.to_scheme && tx.to_scheme.toLowerCase().includes(searchTerm.toLowerCase()));

    let matchesDate = true;
    if (startDate || endDate) {
      const txDate = new Date(tx.entery_date);
      txDate.setHours(0, 0, 0, 0);
      if (startDate && txDate < new Date(startDate).setHours(0,0,0,0)) matchesDate = false;
      if (endDate && txDate > new Date(endDate).setHours(0,0,0,0)) matchesDate = false;
    }

    const matchesMode = filters.mode === 'ALL' || tx.mode === filters.mode;
    return matchesSearch && matchesDate && matchesMode;
  });

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    const modifier = direction === 'asc' ? 1 : -1;

    if (key === 'recordingDate') return (new Date(a.entery_date).getTime() - new Date(b.entery_date).getTime()) * modifier;
    if (key === 'clientName') return (a.investor_name || '').localeCompare(b.investor_name || '') * modifier;
    if (key === 'amount') return (a.amount - b.amount) * modifier;
    return 0;
  });

  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);
  const currentTransactions = sortedTransactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-8 animate-fadeIn">
      <div id="transaction-form" className={`bg-white p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] shadow-sm border transition-all duration-500 ${editingId ? 'border-[#0077c8] ring-4 ring-blue-50' : 'border-gray-100'}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className={`${editingId ? 'bg-[#1e2f5e]' : 'bg-[#0077c8]'} p-3 rounded-2xl text-white shadow-lg`}>
              {editingId ? <Edit3 size={20} /> : <Repeat size={20} />}
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-[#1e2f5e] uppercase">{editingId ? 'Modify Transfer' : 'New Switch/STP'}</h3>
              {editingId && <p className="text-[10px] font-black text-[#0077c8] uppercase mt-1">ID: {editingId}</p>}
            </div>
          </div>
          {editingId && <button onClick={onCancelEdit} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-red-50 text-red-600 font-black uppercase text-[10px]"><X size={16} /> Cancel Edit</button>}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Base Info */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Responsible Agent *</label>
            <select className={`w-full border-2 rounded-xl p-4 bg-slate-50 text-sm ${formErrors.includes('agentId') ? 'border-red-500' : 'border-slate-50'}`} value={newTx.agentId || ''} onChange={(e) => setNewTx({ ...newTx, agentId: e.target.value })}>
              <option value="">Select Agent</option>
              {agents.map(a => <option key={a.pan} value={a.pan}>{a.name}</option>)}
            </select>
          </div>
          
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Transfer Mode *</label>
            <select 
              className="w-full border-2 rounded-xl p-4 bg-slate-50 font-black text-[#0077c8] text-sm border-slate-50" 
              value={newTx.mode} 
              onChange={(e) => {
                const newMode = e.target.value;
                setNewTx(prev => ({ 
                  ...prev, 
                  mode: newMode,
                  frequency: newMode === 'SWITCH' ? '' : prev.frequency,
                  switchType: newMode === 'STP' ? 'INTERNAL' : (prev.switchType || 'INTERNAL')
                }));
              }}
            >
              <option value="SWITCH">Switch</option>
              <option value="STP">STP</option>
            </select>
          </div>
          
          {/* Conditionally Render Switch Type OR STP Frequency */}
          {newTx.mode === 'SWITCH' ? (
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Switch Type *</label>
              <select 
                className="w-full border-2 rounded-xl p-4 bg-slate-50 font-black text-[#0077c8] text-sm border-slate-50" 
                value={newTx.switchType} 
                onChange={(e) => setNewTx({ ...newTx, switchType: e.target.value })}
              >
                <option value="INTERNAL">Internal Switch</option>
                <option value="EXTERNAL">External Switch</option>
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">STP Frequency *</label>
              <select 
                className={`w-full border-2 rounded-xl p-4 bg-slate-50 font-black text-[#0077c8] text-sm ${formErrors.includes('frequency') ? 'border-red-500' : 'border-slate-50'}`} 
                value={newTx.frequency || ''} 
                onChange={(e) => setNewTx({ ...newTx, frequency: e.target.value })}
              >
                <option value="">Select Frequency</option>
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="QUARTERLY">Quarterly</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Investor Name *</label>
            <input type="text" className={`w-full border-2 rounded-xl p-4 bg-slate-50 font-black text-sm ${formErrors.includes('clientName') ? 'border-red-500' : 'border-slate-50'}`} placeholder="Full Name" value={newTx.clientName || ''} onChange={(e) => setNewTx({ ...newTx, clientName: e.target.value })} />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">PAN / Folio *</label>
            <div className="relative"><CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} /><input type="text" className={`w-full pl-12 border-2 rounded-xl p-4 bg-slate-50 font-black text-sm ${formErrors.includes('panOrFolio') ? 'border-red-500' : 'border-slate-50'}`} placeholder="ID Number" value={newTx.panOrFolio || ''} onChange={(e) => setNewTx({ ...newTx, panOrFolio: e.target.value })} /></div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Value (₹) *</label>
            <input type="number" className={`w-full border-2 rounded-xl p-4 bg-slate-50 font-black text-[#1e2f5e] text-sm ${formErrors.includes('amount') ? 'border-red-500' : 'border-slate-50'}`} placeholder="0.00" value={newTx.amount || ''} onChange={(e) => setNewTx({ ...newTx, amount: Number(e.target.value) })} />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Entry Date *</label>
            <input type="date" className={`w-full border-2 rounded-xl p-4 bg-slate-50 font-bold text-slate-800 text-sm ${formErrors.includes('recordingDate') ? 'border-red-500' : 'border-slate-50'}`} value={newTx.recordingDate || ''} onChange={(e) => setNewTx({ ...newTx, recordingDate: e.target.value })} />
          </div>

          <div className="col-span-1 lg:col-span-4 border-t border-slate-100 mt-2 pt-6 pb-2">
            <h4 className="text-xs font-black text-[#1e2f5e] uppercase tracking-widest">Transfer Details</h4>
          </div>

          {/* AMC Section */}
          <div className="relative lg:col-span-4">
            <label className="block text-[10px] font-black text-indigo-500 uppercase mb-2">AMC *</label>
            <input 
              type="text" 
              placeholder="Search AMC" 
              className={`w-full border-2 rounded-xl p-4 bg-indigo-50/30 ${formErrors.includes('amcName') ? 'border-red-500' : 'border-slate-50'}`} 
              value={selectedAMC || newTx.amcName || ""} 
              onChange={(e) => { 
                setSelectedAMC(e.target.value); 
                setNewTx(prev => ({ ...prev, amcName: e.target.value })); 
                setShowAMCList(true); 
              }} 
            />
            {showAMCList && filteredAMCs.length > 0 && (
              <div className="absolute bg-white border rounded-xl w-full mt-2 shadow-lg z-50 max-h-60 overflow-y-auto">
                {filteredAMCs.map((amc, i) => (
                  <div key={i} className="p-3 hover:bg-indigo-50 cursor-pointer" onClick={() => { 
                    setSelectedAMC(amc); 
                    setShowAMCList(false); 
                    setFromSchemeSearch(""); 
                    setToSchemeSearch("");
                    setNewTx(prev => ({ ...prev, amcName: amc, fromSchemeName: "", toSchemeName: "" })); 
                  }}>{amc}</div>
                ))}
              </div>
            )}
          </div>

          {/* Schemes Section */}
          <div className="relative lg:col-span-2">
            <label className="block text-[10px] font-black text-red-400 uppercase mb-2">From Scheme *</label>
            <input type="text" placeholder="Search Source Scheme" className={`w-full border-2 rounded-xl p-4 bg-red-50/30 ${formErrors.includes('fromSchemeName') ? 'border-red-500' : 'border-slate-50'}`} value={fromSchemeSearch || newTx.fromSchemeName || ""} onChange={(e) => { setFromSchemeSearch(e.target.value); setNewTx(prev => ({ ...prev, fromSchemeName: e.target.value })); setShowFromSchemeList(true); }} />
            {showFromSchemeList && filteredFromSchemes.length > 0 && (
              <div className="absolute bg-white border rounded-xl w-full mt-2 shadow-lg z-50 max-h-60 overflow-y-auto">
                {filteredFromSchemes.map((scheme, i) => (
                  <div key={i} className="p-3 hover:bg-red-50 cursor-pointer" onClick={() => { setFromSchemeSearch(scheme); setShowFromSchemeList(false); setNewTx(prev => ({ ...prev, fromSchemeName: scheme })); }}>{scheme}</div>
                ))}
              </div>
            )}
          </div>

          <div className="relative lg:col-span-2">
            <label className="block text-[10px] font-black text-emerald-500 uppercase mb-2">To Scheme *</label>
            <input type="text" placeholder="Search Target Scheme" className={`w-full border-2 rounded-xl p-4 bg-emerald-50/50 ${formErrors.includes('toSchemeName') ? 'border-red-500' : 'border-slate-50'}`} value={toSchemeSearch || newTx.toSchemeName || ""} onChange={(e) => { setToSchemeSearch(e.target.value); setNewTx(prev => ({ ...prev, toSchemeName: e.target.value })); setShowToSchemeList(true); }} />
            {showToSchemeList && filteredToSchemes.length > 0 && (
              <div className="absolute bg-white border rounded-xl w-full mt-2 shadow-lg z-50 max-h-60 overflow-y-auto">
                {filteredToSchemes.map((scheme, i) => (
                  <div key={i} className="p-3 hover:bg-emerald-50 cursor-pointer" onClick={() => { setToSchemeSearch(scheme); setShowToSchemeList(false); setNewTx(prev => ({ ...prev, toSchemeName: scheme })); }}>{scheme}</div>
                ))}
              </div>
            )}
          </div>

          <div className="sm:col-span-2 lg:col-span-4"><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Internal Note</label><div className="relative"><MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="text" className="w-full pl-12 border-2 border-slate-50 rounded-xl p-4 bg-slate-50 font-bold text-slate-800 text-sm" placeholder="Correction context..." value={newTx.remark || ''} onChange={(e) => setNewTx({ ...newTx, remark: e.target.value })} /></div></div>
          
          <div className="sm:col-span-2 lg:col-span-4 flex justify-end"><button type="submit" className={`w-full md:w-auto px-12 text-white py-4 rounded-xl font-black uppercase tracking-[0.2em] shadow-xl active:scale-95 text-[10px] ${editingId ? 'bg-[#0077c8]' : 'bg-[#1e2f5e]'}`}>{editingId ? 'Save Correction' : 'Commit Transfer'}</button></div>
        </form>
        {formErrors.length > 0 && <div className="mt-4 flex items-center gap-2 text-red-500 font-bold text-[10px] uppercase"><AlertCircle size={14} /><span>Please complete mandatory fields (*)</span></div>}
      </div>

      <div className="bg-white rounded-[2rem] sm:rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 sm:p-10 border-b border-gray-100 bg-slate-50 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <h3 className="text-lg font-black text-[#1e2f5e] uppercase">Transfer Ledger</h3>
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="relative w-full sm:w-64">
              <input type="text" placeholder="Search client or scheme..." className="w-full border-2 border-slate-200 rounded-xl p-3 bg-white font-bold text-slate-800 text-xs" value={tempSearch} onChange={(e) => setTempSearch(e.target.value)} />
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2">
                <input type="date" className="border-2 border-slate-200 rounded-xl p-3 bg-white font-bold text-slate-800 text-xs" value={tempStartDate} onChange={(e) => setTempStartDate(e.target.value)} />
                <span className="text-slate-400 font-bold text-xs">to</span>
                <input type="date" className="border-2 border-slate-200 rounded-xl p-3 bg-white font-bold text-slate-800 text-xs" value={tempEndDate} onChange={(e) => setTempEndDate(e.target.value)} />
                <button onClick={applyFilters} className="px-4 py-3 bg-[#1e2f5e] text-white rounded-xl text-xs font-black uppercase hover:bg-blue-900 transition-all">Apply</button>
              </div>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1200px]">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase whitespace-nowrap cursor-pointer hover:text-slate-600" onClick={() => handleSort('recordingDate')}>
                  <div className="flex items-center gap-1">Date <SortIcon columnKey="recordingDate" /></div>
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase whitespace-nowrap cursor-pointer hover:text-slate-600" onClick={() => handleSort('clientName')}>
                  <div className="flex items-center gap-1">Investor <SortIcon columnKey="clientName" /></div>
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase whitespace-nowrap">Trans. ID</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase whitespace-nowrap">AMC</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase whitespace-nowrap">From Scheme</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase whitespace-nowrap">To Scheme</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span>Mode</span>
                    <select className="bg-transparent border-none outline-none cursor-pointer text-slate-500 font-bold" value={filters.mode} onChange={e => setFilters({ ...filters, mode: e.target.value })}>
                      <option value="ALL">All</option>
                      <option value="SWITCH">Switch</option>
                      <option value="STP">STP</option>
                    </select>
                  </div>
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase whitespace-nowrap">Freq</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase text-right whitespace-nowrap cursor-pointer hover:text-slate-600" onClick={() => handleSort('amount')}>
                  <div className="flex items-center justify-end gap-1">Value (₹) <SortIcon columnKey="amount" /></div>
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase text-center whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentTransactions.map(tx => (
                <tr key={tx.transaction_id} className={`hover:bg-blue-50/30 transition-colors ${editingId === tx.transaction_id ? 'bg-blue-50/50' : ''}`}>
                  <td className="px-6 py-5 text-xs font-bold text-slate-400 whitespace-nowrap">{formatDate(tx.entery_date)}</td>
                  <td className="px-6 py-5 text-xs text-slate-600 font-bold whitespace-nowrap">
                    <div>{tx.investor_name}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{tx.id_or_folio}</div>
                  </td>
                  <td className="px-6 py-5 text-[10px] font-black text-[#0077c8] whitespace-nowrap">
                    {tx.transaction_id}
                  </td>
                  <td className="px-6 py-5 text-xs font-bold text-[#1e2f5e] whitespace-nowrap">{tx.from_amc}</td>
                  <td className="px-6 py-5 text-xs text-slate-600 whitespace-nowrap max-w-[150px] truncate" title={tx.from_scheme}>
                    {tx.from_scheme}
                  </td>
                  <td className="px-6 py-5 text-xs text-slate-600 whitespace-nowrap max-w-[150px] truncate" title={tx.to_scheme}>
                    {tx.to_scheme}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1 items-start">
                      <span className={`text-[8px] uppercase font-black px-3 py-1 rounded-full border whitespace-nowrap ${tx.mode === 'SWITCH' ? 'bg-indigo-50 text-indigo-700' : 'bg-fuchsia-50 text-fuchsia-700'}`}>{tx.mode}</span>
                      {tx.mode === 'SWITCH' && (
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                          {tx.switch_type === 'EXTERNAL' ? 'External' : 'Internal'}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-xs font-bold text-slate-600 whitespace-nowrap">{tx.frequency || '—'}</td>
                  <td className="px-6 py-5 text-sm font-black text-right text-[#1e2f5e] whitespace-nowrap">₹{(tx.amount || 0).toLocaleString()}</td>
                  <td className="px-6 py-5 text-center flex items-center justify-center gap-2">
                    <button onClick={() => onEdit(tx)} className="p-2 bg-white border border-slate-100 text-[#0077c8] rounded-xl hover:bg-[#0077c8] hover:text-white transition-all"><Edit3 size={14} /></button>
                    <button onClick={() => onDelete(tx.transaction_id)} className="p-2 bg-white border border-slate-100 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50">
            <span className="text-xs font-bold text-slate-500 uppercase">Page {currentPage} of {totalPages}</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 disabled:opacity-50 hover:bg-slate-100 transition-colors uppercase">Previous</button>
              <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 disabled:opacity-50 hover:bg-slate-100 transition-colors uppercase">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SwitchStpView;