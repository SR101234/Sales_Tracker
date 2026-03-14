import React, { useState, useEffect } from 'react';
import amcList from "../amc.js";       // array of AMC names
import amcSchemes from "../amc_schemes.json";  // AMC -> schemes JSON
import {
  PlusCircle, Edit3, X, CreditCard, Search, Loader2, Sparkles, MessageSquare, AlertCircle, Trash2, ArrowUpDown, ArrowUp, ArrowDown
} from 'lucide-react';
import { TransactionType } from '../types';

const TransactionsView = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState(null);
  const [filters, setFilters] = useState({ mode: 'ALL', type: 'ALL' });
  const [transactions, setTransactions] = useState([]);
  const [formErrors, setFormErrors] = useState([]);
  const [selectedAMC, setSelectedAMC] = useState("");
  const [schemeSearch, setSchemeSearch] = useState("");
  const [filteredAMCs, setFilteredAMCs] = useState([]);
  const [filteredSchemes, setFilteredSchemes] = useState([]);
  const [tempSearch, setTempSearch] = useState('');
  const [tempStartDate, setTempStartDate] = useState('');
  const [tempEndDate, setTempEndDate] = useState('');

  // FIX: Added missing state variables
  const [newTx, setNewTx] = useState({ mode: "SIP", type: TransactionType.NEW_SIP });
  const [editingId, setEditingId] = useState(null);
  const [amcSearch, setAmcSearch] = useState('');
  const [isFetchingSchemes, setIsFetchingSchemes] = useState(false);
  const [suggestedSchemes, setSuggestedSchemes] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [agents, setAgents] = useState([]);
  const [showAMCList, setShowAMCList] = useState(false);
  const [showSchemeList, setShowSchemeList] = useState(false);

  // FIX: Added default agents so the .map and .find methods don't crash

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await fetch("http://192.168.1.46:5000/agent"); // change to your API
        const data = await res.json();
        setAgents(data || []);
      } catch (err) {
        console.error("Agents fetch error:", err);
        setAgents([]);
      }
    };

    const fetchTransactions = async () => {
      try {
        const res = await fetch("http://192.168.1.46:5000/transactions"); // change to your API
        const data = await res.json();
        setTransactions(data.transactions || []);
      } catch (err) {
        console.error("Transactions fetch error:", err);
        setTransactions([]);
      }
    };


    fetchAgents();
    fetchTransactions();
  }, []);

  useEffect(() => {
    if (selectedAMC === "") {
      setFilteredAMCs([]);
      return;
    }

    const results = amcList.filter(amc =>
      amc.toLowerCase().includes(selectedAMC.toLowerCase())
    );

    setFilteredAMCs(results.slice(0, 10));
  }, [selectedAMC]);

  useEffect(() => {
    if (!selectedAMC || schemeSearch === "") {
      setFilteredSchemes([]);
      return;
    }

    const schemes = amcSchemes[selectedAMC] || [];

    const results = schemes.filter(scheme =>
      scheme.toLowerCase().includes(schemeSearch.toLowerCase())
    );

    setFilteredSchemes(results.slice(0, 10));
  }, [schemeSearch, selectedAMC]);


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

  // FIX: Added missing handler functions
  const onEdit = (tx) => {
    setEditingId(tx.transaction_id);

    setNewTx({
      id: tx.transaction_id,
      agentId: tx.agent_id || "",
      mode: tx.mode || "SIP",
      type: tx.nature || TransactionType.NEW_SIP,
      clientName: tx.investor_name || "",
      panOrFolio: tx.id_or_folio || "",
      amcName: tx.amc_name || "",
      schemeName: tx.scheme_name || "",
      amount: tx.amount || "",
      recordingDate: tx.entery_date
        ? new Date(tx.entery_date).toISOString().split("T")[0]
        : "",
      remark: tx.remark || ""
    });

    setSelectedAMC(tx.amc_name || "");
    setSchemeSearch(tx.scheme_name || "");
    setShowAMCList(false);
    setShowSchemeList(false);
  };

  const onCancelEdit = () => {
    setEditingId(null);
    setNewTx({
      mode: "SIP",
      type: TransactionType.NEW_SIP
    });

    setSelectedAMC("");
    setSchemeSearch("");
    setFilteredAMCs([]);
    setFilteredSchemes([]);
    setShowAMCList(false);
    setShowSchemeList(false);
  };

  const onDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this transaction?");

    if (!confirmed) return;
    console.log("Delete transaction with ID:", id);
    try {
      await fetch(`http://192.168.1.46:5000/transaction_delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setTransactions(prev => prev.filter(tx => tx.transaction_id !== id));
    } catch (err) {
      console.error("Error deleting transaction:", err);
    }


  };

  const onFetchSchemes = () => {
    setIsFetchingSchemes(true);
    // Mocking an API call
    setTimeout(() => {
      setSuggestedSchemes([`${amcSearch} Bluechip Equity Fund`, `${amcSearch} Liquid Debt Fund`]);
      setShowSuggestions(true);
      setIsFetchingSchemes(false);
    }, 600);
  };

  const onSelectScheme = (scheme) => {
    setNewTx({ ...newTx, schemeName: scheme });
    setShowSuggestions(false);
    setAmcSearch('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let errors = [];

    if (!newTx.agentId) errors.push("agentId");
    if (!newTx.mode) errors.push("mode");
    if (!newTx.clientName) errors.push("clientName");
    if (!newTx.panOrFolio) errors.push("panOrFolio");
    if (!newTx.schemeName) errors.push("schemeName");
    if (!newTx.amount) errors.push("amount");
    if (!newTx.recordingDate) errors.push("recordingDate");

    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors([]);

    if (editingId) {

      // UPDATE
      setTransactions(prev =>
        prev.map(tx =>
          tx.transaction_id === editingId
            ? {
              ...tx,
              agent_id: newTx.agentId,
              mode: newTx.mode,
              nature: newTx.type,
              investor_name: newTx.clientName,
              id_or_folio: newTx.panOrFolio,
              amc_name: newTx.amcName,
              scheme_name: newTx.schemeName,
              amount: newTx.amount,
              entery_date: newTx.recordingDate,
              remark: newTx.remark
            }
            : tx
        )
      );
      try {
        const res = await fetch("http://192.168.1.46:5000/transaction_update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingId,
            agent_id: newTx.agentId,
            mode: newTx.mode,
            nature: newTx.type,
            investor_name: newTx.clientName,
            id_or_folio: newTx.panOrFolio,
            amc_name: newTx.amcName,
            scheme_name: newTx.schemeName,
            amount: newTx.amount,
            entery_date: newTx.recordingDate,
            remark: newTx.remark
          }),
        });
        const data = await res.json();
        console.log("Transaction update response:", data);
      }
      catch (err) {
        console.error("Transaction update error:", err);
      }



    } else {

      try {

        const now = new Date();
        const newTransaction = {
          ...newTx,
          remark: newTx.remark || "",
          id: newTx.agentId[0] +
            newTx.agentId[9] +
            newTx.panOrFolio[0] +
            newTx.panOrFolio.slice(-1) +
            String(now.getDate()).padStart(2, '0') +
            String(now.getMonth() + 1).padStart(2, '0') +
            String(now.getFullYear()).slice(-2) +
            String(now.getHours()).padStart(2, '0') +
            String(now.getMinutes()).padStart(2, '0') +
            String(now.getSeconds()).padStart(2, '0')
        };

        const res = await fetch("http://192.168.1.46:5000/transaction_create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newTransaction),
        });
        const data = await res.json();
        console.log("Transaction submission response:", data);

        setTransactions(prev => [newTransaction, ...prev]);
      }
      catch (err) {
        console.error("Transaction submission error:", err);
      }

      // reset form

      setNewTx({
        mode: "SIP",
        type: TransactionType.NEW_SIP
      });
      setSelectedAMC("");
      setSchemeSearch("");

      setFilteredAMCs([]);
      setFilteredSchemes([]);

      setShowAMCList(false);
      setShowSchemeList(false);
      setEditingId(null); // FIX: Reset editing state after submission
      setFormErrors([]);
    };
  }

  const filteredTransactions = transactions.filter(tx => {

    // NAME SEARCH
    const matchesSearch =
      !searchTerm ||
      (tx.investor_name && tx.investor_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tx.id_or_folio && tx.id_or_folio.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tx.scheme_name && tx.scheme_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tx.transaction_id && tx.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()));

    // DATE FILTER
    let matchesDate = true;

    if (startDate || endDate) {

      const txDate = new Date(tx.entery_date);
      txDate.setHours(0, 0, 0, 0);

      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (txDate < start) matchesDate = false;
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(0, 0, 0, 0);
        if (txDate > end) matchesDate = false;
      }

    }

    // MODE FILTER
    const matchesMode = filters.mode === 'ALL' || tx.mode === filters.mode;

    // NATURE FILTER
    const matchesType = filters.type === 'ALL' || tx.nature === filters.type;

    return matchesSearch && matchesDate && matchesMode && matchesType;

  });

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (!sortConfig) return 0;

    const { key, direction } = sortConfig;
    const modifier = direction === 'asc' ? 1 : -1;

    if (key === 'recordingDate') {
      return (new Date(a.recordingDate).getTime() - new Date(b.recordingDate).getTime()) * modifier;
    }
    if (key === 'agent') {
      const agentA = agents.find(ag => ag.id === a.agentId)?.name || '';
      const agentB = agents.find(ag => ag.id === b.agentId)?.name || '';
      return agentA.localeCompare(agentB) * modifier;
    }
    if (key === 'clientName') {
      return (a.clientName || '').localeCompare(b.clientName || '') * modifier;
    }
    if (key === 'amount') {
      return (a.amount - b.amount) * modifier;
    }
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
              {editingId ? <Edit3 size={20} /> : <PlusCircle size={20} />}
            </div>
            <div><h3 className="text-xl sm:text-2xl font-black text-[#1e2f5e] uppercase">{editingId ? 'Modify Entry' : 'New Entry Log'}</h3>{editingId && <p className="text-[10px] font-black text-[#0077c8] uppercase mt-1">ID: {editingId}</p>}</div>
          </div>
          {editingId && <button onClick={onCancelEdit} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-red-50 text-red-600 font-black uppercase text-[10px]"><X size={16} /> Cancel Edit</button>}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Responsible Agent *</label>
            <select className={`w-full border-2 rounded-xl p-4 bg-slate-50 text-sm ${formErrors.includes('agentId') ? 'border-red-500' : 'border-slate-50'}`} value={newTx.agentId || ''} onChange={(e) => setNewTx({ ...newTx, agentId: e.target.value })}>
              <option value="">Select Agent</option>
              {agents.map(a => <option key={a.pan} value={a.pan}>{a.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Mode *</label>
            <select className={`w-full border-2 rounded-xl p-4 bg-slate-50 font-black text-[#0077c8] text-sm ${formErrors.includes('mode') ? 'border-red-500' : 'border-slate-50'}`} value={newTx.mode} onChange={(e) => {
              const mode = e.target.value;
              if (mode === 'REDEMPTION') {
                setNewTx({ ...newTx, mode, type: TransactionType.NONE });
              } else {
                setNewTx({ ...newTx, mode, type: newTx.type === TransactionType.NONE ? TransactionType.NEW_SIP : newTx.type });
              }
            }}>
              <option value="SIP">SIP</option><option value="LUMPSUM">Lumpsum</option><option value="REDEMPTION">Redemption</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              Nature *
            </label>

            <select
              disabled={newTx.mode === 'REDEMPTION'}
              className={`w-full border-2 rounded-xl p-4 bg-slate-50 text-sm ${formErrors.includes('type') ? 'border-red-500' : 'border-slate-50'
                } disabled:opacity-50`}
              value={newTx.type || TransactionType.NEW_SIP}
              onChange={(e) => setNewTx({ ...newTx, type: e.target.value })}
            >
              <option value={TransactionType.NEW_SIP}>New Acquisition</option>
              <option value={TransactionType.RELOGIN}>Relogin</option>

              {newTx.mode === 'SIP' && (
                <option value={TransactionType.CLOSED_SIP}>Closed</option>
              )}

              {newTx.mode === 'REDEMPTION' && (
                <option value={TransactionType.NONE}>N/A</option>
              )}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Investor Name *</label>
            <input type="text" className={`w-full border-2 rounded-xl p-4 bg-slate-50 font-black text-sm ${formErrors.includes('clientName') ? 'border-red-500' : 'border-slate-50'}`} placeholder="Full Name" value={newTx.clientName || ''} onChange={(e) => setNewTx({ ...newTx, clientName: e.target.value })} />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">PAN / Folio *</label>
            <div className="relative"><CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} /><input type="text" className={`w-full pl-12 border-2 rounded-xl p-4 bg-slate-50 font-black text-sm ${formErrors.includes('panOrFolio') ? 'border-red-500' : 'border-slate-50'}`} placeholder="ID Number" value={newTx.panOrFolio || ''} onChange={(e) => setNewTx({ ...newTx, panOrFolio: e.target.value })} /></div>
          </div>
          <div className="relative">
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">
              AMC *
            </label>

            <input
              type="text"
              placeholder="Search AMC"
              className="w-full border-2 rounded-xl p-4 bg-slate-50"
              value={selectedAMC || newTx.amcName || ""}
              onChange={(e) => {
                setSelectedAMC(e.target.value);
                setShowAMCList(true);
              }}
            />

            {showAMCList && filteredAMCs.length > 0 && (
              <div className="absolute bg-white border rounded-xl w-full mt-2 shadow-lg z-50">
                {filteredAMCs.map((amc, i) => (
                  <div
                    key={i}
                    className="p-3 hover:bg-blue-50 cursor-pointer"
                    onClick={() => {
                      setSelectedAMC(amc);
                      setShowAMCList(false);
                      setSchemeSearch("");
                      // reset scheme input

                      setNewTx(prev => ({
                        ...prev,
                        amcName: amc,
                        schemeName: ""
                      }));
                    }}
                  >
                    {amc}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="relative">
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">
              Scheme *
            </label>

            <input
              type="text"
              placeholder="Search Scheme"
              className="w-full border-2 rounded-xl p-4 bg-slate-50"
              value={schemeSearch || newTx.schemeName || ""}
              onChange={(e) => {
                setSchemeSearch(e.target.value);
                setShowSchemeList(true);
              }}
            />

            {showSchemeList && filteredSchemes.length > 0 && (
              <div className="absolute bg-white border rounded-xl w-full mt-2 shadow-lg z-50 max-h-60 overflow-y-auto">
                {filteredSchemes.map((scheme, i) => (
                  <div
                    key={i}
                    className="p-3 hover:bg-blue-50 cursor-pointer"
                    onClick={() => {
                      setSchemeSearch(scheme);
                      setShowSchemeList(false); // close dropdown

                      setNewTx(prev => ({
                        ...prev,
                        schemeName: scheme
                      }));
                    }}
                  >
                    {scheme}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Value (₹) *</label><input type="number" className={`w-full border-2 rounded-xl p-4 bg-slate-50 font-black text-[#1e2f5e] text-sm ${formErrors.includes('amount') ? 'border-red-500' : 'border-slate-50'}`} placeholder="0.00" value={newTx.amount || ''} onChange={(e) => setNewTx({ ...newTx, amount: Number(e.target.value) })} /></div>
          <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Entry Date *</label><input type="date" className="w-full border-2 border-slate-50 rounded-xl p-4 bg-slate-50 font-bold text-slate-800 text-sm" value={newTx.recordingDate || ''} onChange={(e) => setNewTx({ ...newTx, recordingDate: e.target.value })} /></div>
          <div className="sm:col-span-2"><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Internal Note</label><div className="relative"><MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="text" className="w-full pl-12 border-2 border-slate-50 rounded-xl p-4 bg-slate-50 font-bold text-slate-800 text-sm" placeholder="Correction context..." value={newTx.remark || ''} onChange={(e) => setNewTx({ ...newTx, remark: e.target.value })} /></div></div>
          <div className="flex items-end sm:col-span-2"><button type="submit" className={`w-full text-white p-4 rounded-xl font-black uppercase tracking-[0.2em] shadow-xl active:scale-95 text-[10px] ${editingId ? 'bg-[#0077c8]' : 'bg-[#1e2f5e]'}`}>{editingId ? 'Save Correction' : 'Commit Entry'}</button></div>
        </form>
        {formErrors.length > 0 && <div className="mt-4 flex items-center gap-2 text-red-500 font-bold text-[10px] uppercase"><AlertCircle size={14} /><span>Please complete mandatory fields (*)</span></div>}
      </div>

      <div className="bg-white rounded-[2rem] sm:rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 sm:p-10 border-b border-gray-100 bg-slate-50 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <h3 className="text-lg font-black text-[#1e2f5e] uppercase">Audit Ledger</h3>
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="relative w-full sm:w-64">
              <input type="text" placeholder="Search client..." className="w-full border-2 border-slate-200 rounded-xl p-3 bg-white font-bold text-slate-800 text-xs" value={tempSearch} onChange={(e) => setTempSearch(e.target.value)} />
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2">
                <input type="date" className="border-2 border-slate-200 rounded-xl p-3 bg-white font-bold text-slate-800 text-xs" value={tempStartDate} onChange={(e) => setTempStartDate(e.target.value)} />
                <span className="text-slate-400 font-bold text-xs">to</span>
                <input type="date" className="border-2 border-slate-200 rounded-xl p-3 bg-white font-bold text-slate-800 text-xs" value={tempEndDate} onChange={(e) => setTempEndDate(e.target.value)} />
                <button onClick={applyFilters} className="px-4 py-3 bg-[#1e2f5e] text-white rounded-xl text-xs font-black uppercase hover:bg-blue-900 transition-all">Apply</button>
              </div>
              {startDate && endDate && new Date(startDate) > new Date(endDate) && (
                <span className="text-red-500 text-[10px] font-bold mt-1">Start date cannot be after end date</span>
              )}
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1000px]">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase whitespace-nowrap cursor-pointer hover:text-slate-600" onClick={() => handleSort('recordingDate')}>
                  <div className="flex items-center gap-1">Date <SortIcon columnKey="recordingDate" /></div>
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase whitespace-nowrap cursor-pointer hover:text-slate-600" onClick={() => handleSort('agent')}>
                  <div className="flex items-center gap-1">Agent PAN <SortIcon columnKey="agent" /></div>
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase whitespace-nowrap cursor-pointer hover:text-slate-600" onClick={() => handleSort('clientName')}>
                  <div className="flex items-center gap-1">Investor <SortIcon columnKey="clientName" /></div>
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase whitespace-nowrap">
                  PAN / Folio
                </th>

                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase whitespace-nowrap">
                  AMC
                </th>

                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase whitespace-nowrap">
                  Scheme
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase whitespace-nowrap">ID</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span>Mode</span>
                    <select
                      className="bg-transparent border-none outline-none cursor-pointer text-slate-500 font-bold"
                      value={filters.mode}
                      onChange={e => setFilters({ ...filters, mode: e.target.value })}
                    >
                      <option value="ALL">All</option>
                      <option value="SIP">SIP</option>
                      <option value="LUMPSUM">Lumpsum</option>
                      <option value="REDEMPTION">Redemption</option>
                    </select>
                  </div>
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span>Nature</span>
                    <select
                      className="bg-transparent border-none outline-none cursor-pointer text-slate-500 font-bold"
                      value={filters.type}
                      onChange={e => setFilters({ ...filters, type: e.target.value })}
                    >
                      <option value="ALL">All</option>
                      <option value={TransactionType?.NEW_SIP || 'NEW_SIP'}>New</option>
                      <option value={TransactionType?.RELOGIN || 'RELOGIN'}>Relogin</option>
                      <option value={TransactionType?.CLOSED_SIP || 'CLOSED_SIP'}>Closed</option>
                      <option value={TransactionType?.NONE || 'NONE'}>N/A</option>
                    </select>
                  </div>
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase text-right whitespace-nowrap cursor-pointer hover:text-slate-600" onClick={() => handleSort('amount')}>
                  <div className="flex items-center justify-end gap-1">Value (₹) <SortIcon columnKey="amount" /></div>
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase whitespace-nowrap">
                  Remark
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase text-center whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentTransactions.map(tx => (
                <tr key={tx.transaction_id} className={`hover:bg-blue-50/30 transition-colors ${editingId === tx.transaction_id ? 'bg-blue-50/50' : ''}`}>
                  <td className="px-6 py-5 text-xs font-bold text-slate-400 whitespace-nowrap">{formatDate(tx.entery_date)}</td>
                  <td className="px-6 py-5 text-xs font-black text-[#1e2f5e] uppercase whitespace-nowrap">{tx.agent_id || '—'}</td>
                  <td className="px-6 py-5 text-xs text-slate-600 font-bold whitespace-nowrap">{tx.investor_name}</td>
                  <td className="px-6 py-5 text-xs text-slate-600 whitespace-nowrap">{tx.id_or_folio}</td>
                  <td className="px-6 py-5 text-xs text-slate-600 whitespace-nowrap">{tx.amc_name}</td>
                  <td className="px-6 py-5 text-xs text-slate-600 whitespace-nowrap">{tx.scheme_name}</td>
                  <td className="px-6 py-5 text-[10px] font-black text-[#0077c8] whitespace-nowrap">{tx.transaction_id}</td>
                  <td className="px-6 py-5 text-xs font-bold text-slate-600 whitespace-nowrap">{tx.mode}</td>
                  <td className="px-6 py-5">
                    <span className={`text-[8px] uppercase font-black px-3 py-1 rounded-full border whitespace-nowrap ${tx.mode === 'REDEMPTION' ? 'bg-red-50 text-red-700' : tx.nature === (TransactionType?.NEW_SIP || 'NEW_SIP') ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-700'}`}>{tx.mode === 'REDEMPTION' ? 'REDEMPTION' : (tx.nature || '').replace('_', ' ')}</span>
                  </td>
                  <td className="px-6 py-5 text-sm font-black text-right text-[#1e2f5e] whitespace-nowrap">₹{(tx.amount || 0).toLocaleString()}</td>
                  <td className="px-6 py-5 text-xs text-slate-600 max-w-[200px] truncate"><span title={tx.remark}>{tx.remark || '—'}</span></td>
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
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 disabled:opacity-50 hover:bg-slate-100 transition-colors uppercase"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 disabled:opacity-50 hover:bg-slate-100 transition-colors uppercase"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionsView;