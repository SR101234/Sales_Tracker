import React, { useState, useEffect } from 'react';
import {
  PlusCircle, Edit3, X, CreditCard, Search, Loader2, Sparkles, MessageSquare, AlertCircle, Trash2, ArrowUpDown, ArrowUp, ArrowDown
} from 'lucide-react';

// Using standard strings if TransactionType isn't available
const TransactionType = {
  NEW_SIP: 'NEW_SIP',
  RELOGIN: 'RELOGIN',
  CLOSED_SIP: 'CLOSED_SIP',
  NONE: 'NONE'
};

const TransactionsView = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState(null);
  const [filters, setFilters] = useState({ mode: 'ALL', type: 'ALL' });
  const [transactions, setTransactions] = useState([]);
  const [formErrors, setFormErrors] = useState([]);

  // Form states
  const [newTx, setNewTx] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [agents, setAgents] = useState([]);

  // Autocomplete states
  const [amcSearch, setAmcSearch] = useState('');
  const [showAmcDropdown, setShowAmcDropdown] = useState(false);
  const [showSchemeDropdown, setShowSchemeDropdown] = useState(false);
  const [suggestedSchemes, setSuggestedSchemes] = useState([]);

  // Mock AMC Data mapped exactly to your screenshot examples
  const amcData = {
    "Aditya Birla Sun Life Mutual Fund": ["ADITYA BIRLA SUN LIFE ARBITRAGE FUND", "Aditya Birla Frontline Equity"],
    "ICICI Prudential AMC": ["ICICI Bluechip Fund", "ICICI Value Discovery"],
    "SBI Mutual Fund": ["SBI Small Cap Fund", "SBI Bluechip Fund"],
    "Axis Mutual Fund": ["Axis Growth Opportunities Fund", "Axis Long Term Equity"],
    "HDFC AMC": ["HDFC Balanced Advantage Fund", "HDFC Flexi Cap"]
  };
  const amcOptions = Object.keys(amcData);

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
  }, []);

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

  const onEdit = (tx) => {
    setEditingId(tx.transaction_id || tx.id);
    setNewTx(tx);
    setAmcSearch(tx.amc_name || tx.amcSearch || ''); 
  };

  const onCancelEdit = () => {
    setEditingId(null);
    setNewTx({});
    setAmcSearch('');
    setFormErrors([]);
  };

  const onDelete = (id) => {
    setTransactions(prev => prev.filter(tx => (tx.transaction_id || tx.id) !== id));
  };

  const handleSelectAmc = (amc) => {
    setAmcSearch(amc);
    setShowAmcDropdown(false);
    setSuggestedSchemes(amcData[amc] || []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let errors = [];

    if (!newTx.agent_id) errors.push("agent_id");
    if (!newTx.mode) errors.push("mode");
    if (!newTx.investor_name) errors.push("investor_name");
    if (!newTx.id_or_folio) errors.push("id_or_folio");
    if (!amcSearch) errors.push("amcSearch"); 
    if (!newTx.scheme_name) errors.push("scheme_name");
    if (!newTx.amount) errors.push("amount");

    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors([]);

    const txToSave = { ...newTx, amc_name: amcSearch };

    if (editingId) {
      // UPDATE
      setTransactions(prev =>
        prev.map(tx =>
          (tx.transaction_id || tx.id) === editingId ? { ...tx, ...txToSave } : tx
        )
      );
    } else {
      // CREATE
      try {
        const now = new Date();
        const generatedId = "TXN" + Date.now().toString().slice(-4); // Simplified ID generation for example
        
        const newTransaction = {
          ...txToSave,
          transaction_id: generatedId,
          entery_date: txToSave.entery_date || now.toISOString().split('T')[0]
        };

        const res = await fetch(`${import.meta.env.VITE_API_URL}/transaction_create`, {
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
    }

    setNewTx({});
    setAmcSearch('');
    setEditingId(null);
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = searchTerm === '' ||
      (tx.investor_name && tx.investor_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tx.id_or_folio && tx.id_or_folio.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tx.scheme_name && tx.scheme_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tx.transaction_id && tx.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()));

    const txDate = new Date(tx.entery_date || tx.recordingDate);
    txDate.setHours(0, 0, 0, 0);

    let matchesDate = true;
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

    let matchesMode = filters.mode === 'ALL' || tx.mode === filters.mode;
    let matchesType = filters.type === 'ALL' || tx.nature === filters.type;

    return matchesSearch && matchesDate && matchesMode && matchesType;
  });

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    const modifier = direction === 'asc' ? 1 : -1;

    if (key === 'entery_date') {
      return (new Date(a.entery_date || 0).getTime() - new Date(b.entery_date || 0).getTime()) * modifier;
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
      {/* ---------------- FORM SECTION ---------------- */}
      <div id="transaction-form" className={`bg-white p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] shadow-sm border transition-all duration-500 ${editingId ? 'border-[#0077c8] ring-4 ring-blue-50' : 'border-gray-100'}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className={`${editingId ? 'bg-[#1e2f5e]' : 'bg-[#0077c8]'} p-3 rounded-2xl text-white shadow-lg`}>
              {editingId ? <Edit3 size={20} /> : <PlusCircle size={20} />}
            </div>
            <div><h3 className="text-xl sm:text-2xl font-black text-[#1e2f5e] uppercase">{editingId ? 'Modify Entry' : 'New Entry Log'}</h3>{editingId && <p className="text-[10px] font-black text-[#0077c8] uppercase mt-1">TXN ID: {editingId}</p>}</div>
          </div>
          {editingId && <button onClick={onCancelEdit} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-red-50 text-red-600 font-black uppercase text-[10px]"><X size={16} /> Cancel Edit</button>}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Agent ID *</label>
            <select className={`w-full border-2 rounded-xl p-4 bg-slate-50 text-sm ${formErrors.includes('agent_id') ? 'border-red-500' : 'border-slate-50'}`} value={newTx.agent_id || ''} onChange={(e) => setNewTx({ ...newTx, agent_id: e.target.value })}>
              <option value="">Select Agent</option>
              {agents.map(a => <option key={a.pan} value={a.pan}>{a.name} ({a.pan})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Mode *</label>
            <select className={`w-full border-2 rounded-xl p-4 bg-slate-50 font-black text-[#0077c8] text-sm ${formErrors.includes('mode') ? 'border-red-500' : 'border-slate-50'}`} value={newTx.mode || 'SIP'} onChange={(e) => {
              const mode = e.target.value;
              if (mode === 'REDEMPTION') {
                setNewTx({ ...newTx, mode, nature: TransactionType.NONE });
              } else {
                setNewTx({ ...newTx, mode, nature: newTx.nature === TransactionType.NONE ? TransactionType.NEW_SIP : newTx.nature });
              }
            }}>
              <option value="SIP">SIP</option><option value="Lumpsum">Lumpsum</option><option value="REDEMPTION">Redemption</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nature *</label>
            <select disabled={newTx.mode === 'REDEMPTION'} className={`w-full border-2 rounded-xl p-4 bg-slate-50 text-sm ${formErrors.includes('nature') ? 'border-red-500' : 'border-slate-50'} disabled:opacity-50`} value={newTx.nature || TransactionType.NEW_SIP} onChange={(e) => setNewTx({ ...newTx, nature: e.target.value })}>
              <option value={TransactionType.NEW_SIP}>New SIP</option><option value={TransactionType.RELOGIN}>Relogin</option><option value={TransactionType.CLOSED_SIP}>Closed SIP</option><option value="Purchase">Purchase</option>
              {newTx.mode === 'REDEMPTION' && <option value={TransactionType.NONE}>None</option>}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Investor Name *</label>
            <input type="text" className={`w-full border-2 rounded-xl p-4 bg-slate-50 font-black text-sm ${formErrors.includes('investor_name') ? 'border-red-500' : 'border-slate-50'}`} placeholder="Full Name" value={newTx.investor_name || ''} onChange={(e) => setNewTx({ ...newTx, investor_name: e.target.value })} />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">ID or Folio *</label>
            <div className="relative"><CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} /><input type="text" className={`w-full pl-12 border-2 rounded-xl p-4 bg-slate-50 font-black text-sm ${formErrors.includes('id_or_folio') ? 'border-red-500' : 'border-slate-50'}`} placeholder="Folio No." value={newTx.id_or_folio || ''} onChange={(e) => setNewTx({ ...newTx, id_or_folio: e.target.value })} /></div>
          </div>
          
          <div className="sm:col-span-1 space-y-2 relative">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">AMC Name *</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                className={`w-full pl-10 border-2 rounded-xl p-4 bg-slate-50 font-black text-sm ${formErrors.includes('amcSearch') ? 'border-red-500' : 'border-slate-50'}`} 
                placeholder="Type or select AMC" 
                value={amcSearch} 
                onChange={(e) => {
                  setAmcSearch(e.target.value);
                  setShowAmcDropdown(true);
                }}
                onFocus={() => setShowAmcDropdown(true)}
                onBlur={() => setTimeout(() => setShowAmcDropdown(false), 200)}
              />
              {showAmcDropdown && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto p-2">
                  {amcOptions.filter(amc => amc.toLowerCase().includes(amcSearch.toLowerCase())).map((amc, idx) => (
                      <button key={idx} type="button" onClick={() => handleSelectAmc(amc)} className="w-full text-left px-4 py-3 hover:bg-blue-50 rounded-lg text-xs font-bold text-slate-700 mb-1">{amc}</button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="sm:col-span-2 space-y-2 relative">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Scheme Name *</label>
            <div className="relative">
              <input 
                type="text" 
                className={`w-full border-2 rounded-xl p-4 bg-slate-50 font-black text-[#1e2f5e] text-sm ${formErrors.includes('scheme_name') ? 'border-red-500' : 'border-slate-50'}`} 
                placeholder={amcSearch ? "Type or select Scheme" : "Select an AMC first..."} 
                value={newTx.scheme_name || ''} 
                onChange={(e) => {
                  setNewTx({ ...newTx, scheme_name: e.target.value });
                  setShowSchemeDropdown(true);
                }}
                onFocus={() => setShowSchemeDropdown(true)}
                onBlur={() => setTimeout(() => setShowSchemeDropdown(false), 200)}
              />
              {showSchemeDropdown && suggestedSchemes.length > 0 && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto p-2">
                  {suggestedSchemes.filter(scheme => scheme.toLowerCase().includes((newTx.scheme_name || '').toLowerCase())).map((scheme, idx) => (
                      <button key={idx} type="button" onClick={() => { setNewTx({ ...newTx, scheme_name: scheme }); setShowSchemeDropdown(false);}} className="w-full text-left px-4 py-3 hover:bg-blue-50 rounded-lg text-xs font-bold text-slate-700 mb-1">{scheme}</button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Amount (₹) *</label><input type="number" className={`w-full border-2 rounded-xl p-4 bg-slate-50 font-black text-[#1e2f5e] text-sm ${formErrors.includes('amount') ? 'border-red-500' : 'border-slate-50'}`} placeholder="0.00" value={newTx.amount || ''} onChange={(e) => setNewTx({ ...newTx, amount: Number(e.target.value) })} /></div>
          <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Entry Date</label><input type="date" className="w-full border-2 border-slate-50 rounded-xl p-4 bg-slate-50 font-bold text-slate-800 text-sm" value={newTx.entery_date || ''} onChange={(e) => setNewTx({ ...newTx, entery_date: e.target.value })} /></div>
          <div className="sm:col-span-2"><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Remark</label><div className="relative"><MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="text" className="w-full pl-12 border-2 border-slate-50 rounded-xl p-4 bg-slate-50 font-bold text-slate-800 text-sm" placeholder="Notes..." value={newTx.remark || ''} onChange={(e) => setNewTx({ ...newTx, remark: e.target.value })} /></div></div>
          <div className="flex items-end sm:col-span-2"><button type="submit" className={`w-full text-white p-4 rounded-xl font-black uppercase tracking-[0.2em] shadow-xl active:scale-95 text-[10px] ${editingId ? 'bg-[#0077c8]' : 'bg-[#1e2f5e]'}`}>{editingId ? 'Save Correction' : 'Commit Entry'}</button></div>
        </form>
        {formErrors.length > 0 && <div className="mt-4 flex items-center gap-2 text-red-500 font-bold text-[10px] uppercase"><AlertCircle size={14} /><span>Please complete mandatory fields (*)</span></div>}
      </div>

      {/* ---------------- TABLE HISTORY SECTION ---------------- */}
      <div className="bg-white rounded-[2rem] sm:rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 sm:p-10 border-b border-gray-100 bg-slate-50 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <h3 className="text-lg font-black text-[#1e2f5e] uppercase">Transaction Ledger</h3>
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="relative w-full sm:w-64">
              <input type="text" placeholder="Search transactions..." className="w-full border-2 border-slate-200 rounded-xl p-3 bg-white font-bold text-slate-800 text-xs" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2">
                <input type="date" className="border-2 border-slate-200 rounded-xl p-3 bg-white font-bold text-slate-800 text-xs" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                <span className="text-slate-400 font-bold text-xs">to</span>
                <input type="date" className="border-2 border-slate-200 rounded-xl p-3 bg-white font-bold text-slate-800 text-xs" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        {/* UPDATED TABLE TO MATCH DB SCHEMA EXPLICITLY */}
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1400px]">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase whitespace-nowrap">Transaction ID</th>
                <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase whitespace-nowrap">Agent ID</th>
                <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase whitespace-nowrap">Mode</th>
                <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase whitespace-nowrap">Nature</th>
                <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase whitespace-nowrap">Investor Name</th>
                <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase whitespace-nowrap">ID or Folio</th>
                <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase whitespace-nowrap max-w-[150px]">AMC Name</th>
                <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase whitespace-nowrap max-w-[200px]">Scheme Name</th>
                <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase whitespace-nowrap cursor-pointer hover:text-slate-600" onClick={() => handleSort('amount')}>
                  <div className="flex items-center gap-1">Amount <SortIcon columnKey="amount" /></div>
                </th>
                <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase whitespace-nowrap cursor-pointer hover:text-slate-600" onClick={() => handleSort('entery_date')}>
                  <div className="flex items-center gap-1">Entry Date <SortIcon columnKey="entery_date" /></div>
                </th>
                <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase whitespace-nowrap max-w-[150px]">Remark</th>
                <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase text-center whitespace-nowrap shadow-[-10px_0_15px_-5px_rgba(0,0,0,0.05)] sticky right-0 bg-slate-50">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentTransactions.map(tx => (
                <tr key={tx.transaction_id || tx.id} className={`hover:bg-blue-50/30 transition-colors ${editingId === (tx.transaction_id || tx.id) ? 'bg-blue-50/50' : ''}`}>
                  <td className="px-4 py-4 text-xs font-black text-[#0077c8] whitespace-nowrap">{tx.transaction_id || tx.id}</td>
                  <td className="px-4 py-4 text-xs font-bold text-slate-600 whitespace-nowrap">{tx.agent_id}</td>
                  <td className="px-4 py-4 text-xs font-bold text-slate-600 whitespace-nowrap">{tx.mode}</td>
                  <td className="px-4 py-4">
                    <span className={`text-[9px] uppercase font-black px-2 py-1 rounded-md border whitespace-nowrap ${tx.mode === 'REDEMPTION' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                      {(tx.nature || '').replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-xs text-slate-700 font-bold whitespace-nowrap">{tx.investor_name}</td>
                  <td className="px-4 py-4 text-xs text-slate-500 font-bold whitespace-nowrap">{tx.id_or_folio}</td>
                  <td className="px-4 py-4 text-[10px] text-slate-500 font-bold truncate max-w-[150px]" title={tx.amc_name}>{tx.amc_name}</td>
                  <td className="px-4 py-4 text-[10px] text-slate-600 font-bold truncate max-w-[200px]" title={tx.scheme_name}>{tx.scheme_name}</td>
                  <td className="px-4 py-4 text-sm font-black text-[#1e2f5e] whitespace-nowrap">₹{(tx.amount || 0).toLocaleString()}</td>
                  <td className="px-4 py-4 text-[10px] font-bold text-slate-400 whitespace-nowrap">{formatDate(tx.entery_date)}</td>
                  <td className="px-4 py-4 text-[10px] text-slate-500 italic truncate max-w-[150px]" title={tx.remark}>{tx.remark || '—'}</td>
                  
                  <td className="px-4 py-4 text-center flex items-center justify-center gap-2 shadow-[-10px_0_15px_-5px_rgba(0,0,0,0.02)] sticky right-0 bg-white">
                    <button onClick={() => onEdit(tx)} className="p-2 border border-slate-100 text-[#0077c8] rounded-lg hover:bg-[#0077c8] hover:text-white transition-all"><Edit3 size={14} /></button>
                    <button onClick={() => onDelete(tx.transaction_id || tx.id)} className="p-2 border border-slate-100 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"><Trash2 size={14} /></button>
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