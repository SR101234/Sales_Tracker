import React, { useState, useEffect } from 'react';
import {
  PlusCircle, Edit3, Trash2, X, CheckSquare, Calendar, User, FileText, AlertCircle, ArrowUpDown, ArrowUp, ArrowDown, Search
} from 'lucide-react';
import { ServiceType } from '../types';
import amcList from "../amc.js";

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const parsedDate = new Date(dateStr);
  if (isNaN(parsedDate.getTime())) return '—';
  return parsedDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const SubTasksView = () => {
  const [subTasks, setSubTasks] = useState([]);
  const [editingId, setEditingId] = useState(null);
  
  // --- SEARCH INPUT STATES (What the user sees in the boxes) ---
  const [searchInput, setSearchInput] = useState('');
  const [startDateInput, setStartDateInput] = useState('');
  const [endDateInput, setEndDateInput] = useState('');

  // --- APPLIED FILTER STATES (What the table actually uses) ---
  const [appliedSearch, setAppliedSearch] = useState('');
  const [appliedStartDate, setAppliedStartDate] = useState('');
  const [appliedEndDate, setAppliedEndDate] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState(null);
  const [filters, setFilters] = useState({ serviceType: 'ALL' });
  const [agents, setAgents] = useState([]);
  const [amcSearch, setAmcSearch] = useState('');
  const [filteredAMCs, setFilteredAMCs] = useState([]);
  const [showAMCList, setShowAMCList] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await fetch("http://192.168.1.46:5000/agent");
        if (!res.ok) throw new Error("Failed to fetch agents");
        const data = await res.json();
        setAgents(data || []);
      } catch (err) {
        console.error("Agents fetch error:", err);
        setAgents([]);
      }
    };

    const fetchSubTasks = async () => {
      try {
        const res = await fetch("http://192.168.1.46:5000/subtasks");
        if (!res.ok) throw new Error("Failed to fetch subtasks");
        const data = await res.json();
        setSubTasks(data.subtasks || []);
      } catch (err) {
        console.error("Subtasks fetch error:", err);
        setSubTasks([]);
      }
    };

    fetchAgents();
    fetchSubTasks();
  }, []);

  useEffect(() => {
    if (!amcSearch) {
      setFilteredAMCs([]);
      return;
    }

    const results = (amcList || []).filter(amc =>
      (amc || '').toLowerCase().includes((amcSearch || '').toLowerCase())
    );

    setFilteredAMCs(results.slice(0, 10));
  }, [amcSearch]);

  // Handle Search Execution
  const handleSearchClick = () => {
    setAppliedSearch(searchInput);
    setAppliedStartDate(startDateInput);
    setAppliedEndDate(endDateInput);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleAddLocalTask = async (newTaskData) => {
    const now = new Date();
    const aId = String(newTaskData.agentId || 'A');
    const pId = String(newTaskData.panOrFolio || 'P');
    
    const generatedId = aId[0] + aId.slice(-1) + pId[0] + pId.slice(-1) + String(now.getDate()).padStart(2, '0') + String(now.getMonth() + 1).padStart(2, '0') + String(now.getFullYear()).slice(-2) + String(now.getHours()).padStart(2, '0') + String(now.getMinutes()).padStart(2, '0') + String(now.getSeconds()).padStart(2, '0');

    const payloadForApi = {
      ...newTaskData,
      id: generatedId
    };

    const taskForLocalDisplay = {
      ...payloadForApi,
      transaction_id: generatedId,
      agent_id: newTaskData.agentId,
      id_or_folio: newTaskData.panOrFolio,
      client_name: newTaskData.clientName,
      service_type: newTaskData.serviceType,
      entery_date: newTaskData.date,
      new_information: newTaskData.newInformation,
    };

    try {
      const res = await fetch("http://192.168.1.46:5000/subtask_create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadForApi)
      });
      if (!res.ok) throw new Error("Failed to create subtask");
      setSubTasks(prev => [taskForLocalDisplay, ...prev]);
    } catch (err) {
      console.error("Error creating subtask:", err);
    }
  };

  const handleUpdateLocalTask = async(id, updatedData) => {
    try{
      const res = await fetch("http://192.168.1.46:5000/subtask_update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updatedData })
      });
      if (!res.ok) throw new Error("Failed to update subtask");
      setSubTasks(prev =>
      prev.map(task =>
        (task.id === id || task.transaction_id === id)
          ? {
              ...task,
              ...updatedData,
              agent_id: updatedData.agentId,
              id_or_folio: updatedData.panOrFolio,
              client_name: updatedData.clientName,
              service_type: updatedData.serviceType,
              entery_date: updatedData.date,
              new_information: updatedData.newInformation,
              id: task.id || id,
              transaction_id: task.transaction_id || id
            }
          : task
      )
    );
    } catch (err) {
      console.error("Error updating subtask:", err);
    }
  };

  const handleDeleteLocalTask = async(id) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try{
        const res = await fetch("http://192.168.1.46:5000/subtask_delete", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id })
        });
        if (!res.ok) throw new Error("Failed to delete subtask");
          setSubTasks(prev => prev.filter(task => task.id !== id && task.transaction_id !== id));
      } catch (err) {
        console.error("Error deleting subtask:", err);
      }
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const renderSortIcon = (columnKey) => {
    if (sortConfig?.key !== columnKey) return <ArrowUpDown size={12} className="opacity-50" />;
    return sortConfig.direction === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />;
  };

  const initialFormState = {
    agentId: '',
    clientName: '',
    panOrFolio: '',
    serviceType: ServiceType?.OTHER || 'OTHER',
    amc: '',
    date: new Date().toISOString().split('T')[0],
    newInformation: '',
    remark: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState([]);

  // FIXED: Using applied states instead of live input states
  const filteredTasks = (subTasks || []).filter(task => {
    if (!task) return false;

    const safeSearchTerm = (appliedSearch || '').toLowerCase();
    const tClientName = task.clientName || task.client_name || '';
    const tPan = task.panOrFolio || task.id_or_folio || '';
    const tAmc = task.amc || '';
    const tTxn = String(task.transactionNumber || task.transaction_id || task.id || '');
    const tDateRaw = task.date || task.entery_date || '';
    
    const tFormattedDate = formatDate(tDateRaw).toLowerCase();

    const matchesSearch = safeSearchTerm === '' ||
      tClientName.toLowerCase().includes(safeSearchTerm) ||
      tPan.toLowerCase().includes(safeSearchTerm) ||
      tAmc.toLowerCase().includes(safeSearchTerm) ||
      tTxn.toLowerCase().includes(safeSearchTerm) ||
      tFormattedDate.includes(safeSearchTerm) || 
      tDateRaw.includes(safeSearchTerm);

    let matchesDate = true;
    if (appliedStartDate || appliedEndDate) {
      if (!tDateRaw) {
        matchesDate = false;
      } else {
        const taskDate = new Date(tDateRaw);
        
        if (isNaN(taskDate.getTime())) {
          matchesDate = false;
        } else {
          // Normalize task date to local midnight
          taskDate.setHours(0, 0, 0, 0);

          if (appliedStartDate) {
            const startD = new Date(appliedStartDate);
            startD.setHours(0, 0, 0, 0); // Start of day
            if (taskDate < startD) matchesDate = false;
          }
          if (appliedEndDate) {
            const endD = new Date(appliedEndDate);
            endD.setHours(23, 59, 59, 999); // End of day boundary fix!
            if (taskDate > endD) matchesDate = false;
          }
        }
      }
    }

    const tService = task.serviceType || task.service_type;
    let matchesServiceType = !filters?.serviceType || filters.serviceType === 'ALL' || tService === filters.serviceType;

    return matchesSearch && matchesDate && matchesServiceType;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (!sortConfig) return 0;

    const { key, direction } = sortConfig;
    const modifier = direction === 'asc' ? 1 : -1;

    if (key === 'date') {
      const dateAStr = a?.date || a?.entery_date;
      const dateBStr = b?.date || b?.entery_date;
      const dateA = dateAStr ? new Date(dateAStr).getTime() : 0;
      const dateB = dateBStr ? new Date(dateBStr).getTime() : 0;
      return (dateA - dateB) * modifier;
    }
    if (key === 'agent') {
      const aAgent = a?.agentId || a?.agent_id;
      const bAgent = b?.agentId || b?.agent_id;
      const agentA = (agents || []).find(ag => String(ag?.id ?? ag?.pan ?? ag?.agent_id ?? ag?.code ?? '') === String(aAgent))?.name || '';
      const agentB = (agents || []).find(ag => String(ag?.id ?? ag?.pan ?? ag?.agent_id ?? ag?.code ?? '') === String(bAgent))?.name || '';
      return agentA.localeCompare(agentB) * modifier;
    }
    if (key === 'clientName') {
      const aClient = a?.clientName || a?.client_name || '';
      const bClient = b?.clientName || b?.client_name || '';
      return aClient.localeCompare(bClient) * modifier;
    }
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil((sortedTasks?.length || 0) / itemsPerPage));
  const currentTasks = sortedTasks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = [];
    if (!formData?.agentId) errors.push('agentId');
    if (!formData?.clientName) errors.push('clientName');
    if (!formData?.panOrFolio) errors.push('panOrFolio');
    if (!formData?.serviceType) errors.push('serviceType');
    if (!formData?.amc) errors.push('amc');

    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    const { id, ...submitPayload } = formData;

    if (editingId) {
      handleUpdateLocalTask(editingId, submitPayload);
      setEditingId(null);
    } else {
      handleAddLocalTask(submitPayload);
    }

    setFormData(initialFormState);
    setAmcSearch('');
    setFilteredAMCs([]);
    setShowAMCList(false);
    setFormErrors([]);
  };

  const handleEdit = (task) => {
    if (!task) return;

    const editId = task.id || task.transaction_id;

    setEditingId(editId);
    setFormData({
      ...initialFormState,
      id: editId,
      agentId: task.agentId || task.agent_id || '',
      clientName: task.clientName || task.client_name || '',
      panOrFolio: task.panOrFolio || task.id_or_folio || '',
      serviceType: task.serviceType || task.service_type || ServiceType?.OTHER || 'OTHER',
      amc: task.amc || '',
      date: task.date || task.entery_date || new Date().toISOString().split('T')[0],
      newInformation: task.newInformation || task.new_information || '',
      remark: task.remark || ''
    });

    setAmcSearch(task.amc || '');
    setShowAMCList(false);
    document.getElementById('subtask-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setAmcSearch('');
    setFilteredAMCs([]);
    setShowAMCList(false);
    setFormErrors([]);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div id="subtask-form" className={`bg-white p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] shadow-sm border transition-all duration-500 ${editingId ? 'border-[#0077c8] ring-4 ring-blue-50' : 'border-gray-100'}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className={`${editingId ? 'bg-[#1e2f5e]' : 'bg-[#0077c8]'} p-3 rounded-2xl text-white shadow-lg`}>
              {editingId ? <Edit3 size={20} /> : <PlusCircle size={20} />}
            </div>
            <div><h3 className="text-xl sm:text-2xl font-black text-[#1e2f5e] uppercase">{editingId ? 'Update Task' : 'New Sub Task'}</h3>{editingId && <p className="text-[10px] font-black text-[#0077c8] uppercase mt-1">ID: {editingId}</p>}</div>
          </div>
          {editingId && <button type="button" onClick={handleCancelEdit} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-red-50 text-red-600 font-black uppercase text-[10px]"><X size={16} /> Cancel Edit</button>}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Responsible Agent *</label>
            <select
              className={`w-full border-2 rounded-xl p-4 bg-slate-50 text-sm ${formErrors.includes('agentId') ? 'border-red-500' : 'border-slate-50'}`}
              value={formData.agentId || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, agentId: e.target.value }))}
            >
              <option value="">Select Agent</option>
              {(agents || []).map((a, index) => {
                const agentValue = String(a?.id ?? a?.pan ?? a?.agent_id ?? a?.code ?? '');
                return (
                  <option key={agentValue || `agent-${index}`} value={agentValue}>
                    {a?.name || 'Unknown'}
                  </option>
                );
              })}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Client Name *</label>
            <input
              type="text"
              className={`w-full border-2 rounded-xl p-4 bg-slate-50 font-black text-sm ${formErrors.includes('clientName') ? 'border-red-500' : 'border-slate-50'}`}
              placeholder="Full Name"
              value={formData.clientName || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">PAN / Folio *</label>
            <input
              type="text"
              className={`w-full border-2 rounded-xl p-4 bg-slate-50 font-black text-sm ${formErrors.includes('panOrFolio') ? 'border-red-500' : 'border-slate-50'}`}
              placeholder="ID Number"
              value={formData.panOrFolio || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, panOrFolio: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Service Type *</label>
            <select
              className={`w-full border-2 rounded-xl p-4 bg-slate-50 text-sm ${formErrors.includes('serviceType') ? 'border-red-500' : 'border-slate-50'}`}
              value={formData.serviceType || ServiceType?.OTHER || 'OTHER'}
              onChange={(e) => setFormData(prev => ({ ...prev, serviceType: e.target.value }))}
            >
              {Object.values(ServiceType || {}).map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
          <div className="relative">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              AMC *
            </label>

            <input
              type="text"
              placeholder="Search AMC"
              className={`w-full border-2 rounded-xl p-4 bg-slate-50 font-black text-sm ${formErrors.includes('amc') ? 'border-red-500' : 'border-slate-50'}`}
              value={amcSearch || formData.amc || ''}
              onChange={(e) => {
                setAmcSearch(e.target.value);
                setShowAMCList(true);
                setFormData(prev => ({ ...prev, amc: e.target.value }));
              }}
            />

            {showAMCList && filteredAMCs.length > 0 && (
              <div className="absolute bg-white border rounded-xl w-full mt-2 shadow-lg z-50 max-h-60 overflow-y-auto">
                {filteredAMCs.map((amc, i) => (
                  <div
                    key={`amc-${i}`}
                    className="p-3 hover:bg-blue-50 cursor-pointer text-sm font-semibold text-slate-700"
                    onClick={() => {
                      setAmcSearch(amc);
                      setShowAMCList(false);
                      setFormData(prev => ({ ...prev, amc }));
                    }}
                  >
                    {amc}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Date</label>
            <input
              type="date"
              className="w-full border-2 border-slate-50 rounded-xl p-4 bg-slate-50 font-bold text-slate-800 text-sm"
              value={formData.date || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            />
          </div>
          <div className="sm:col-span-3">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">New Information</label>
            <input
              type="text"
              className="w-full border-2 border-slate-50 rounded-xl p-4 bg-slate-50 font-bold text-slate-800 text-sm"
              placeholder="Details..."
              value={formData.newInformation || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, newInformation: e.target.value }))}
            />
          </div>
          <div className="sm:col-span-3">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Remark</label>
            <input
              type="text"
              className="w-full border-2 border-slate-50 rounded-xl p-4 bg-slate-50 font-bold text-slate-800 text-sm"
              placeholder="Notes..."
              value={formData.remark || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, remark: e.target.value }))}
            />
          </div>
          <div className="flex items-end sm:col-span-3"><button type="submit" className={`w-full text-white p-4 rounded-xl font-black uppercase tracking-[0.2em] shadow-xl active:scale-95 text-[10px] ${editingId ? 'bg-[#0077c8]' : 'bg-[#1e2f5e]'}`}>{editingId ? 'Update Task' : 'Add Task'}</button></div>
        </form>
        {formErrors.length > 0 && <div className="mt-4 flex items-center gap-2 text-red-500 font-bold text-[10px] uppercase"><AlertCircle size={14} /><span>Please complete mandatory fields (*)</span></div>}
      </div>

      <div className="bg-white rounded-[2rem] sm:rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 sm:p-10 border-b border-gray-100 bg-slate-50 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <h3 className="text-lg font-black text-[#1e2f5e] uppercase">Task List</h3>
          <div className="flex flex-col xl:flex-row gap-4 w-full lg:w-auto">
            
            {/* Search Input */}
            <div className="relative w-full xl:w-64">
              <input 
                type="text" 
                placeholder="Search client..." 
                className="w-full border-2 border-slate-200 rounded-xl p-3 bg-white font-bold text-slate-800 text-xs" 
                value={searchInput} 
                onChange={(e) => setSearchInput(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
              />
            </div>
            
            {/* Date Inputs */}
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2">
                <input 
                  type="date" 
                  className="border-2 border-slate-200 rounded-xl p-3 bg-white font-bold text-slate-800 text-xs" 
                  value={startDateInput} 
                  onChange={(e) => setStartDateInput(e.target.value)} 
                />
                <span className="text-slate-400 font-bold text-xs">to</span>
                <input 
                  type="date" 
                  className="border-2 border-slate-200 rounded-xl p-3 bg-white font-bold text-slate-800 text-xs" 
                  value={endDateInput} 
                  onChange={(e) => setEndDateInput(e.target.value)} 
                />
              </div>
              {startDateInput && endDateInput && new Date(startDateInput) > new Date(endDateInput) && (
                <span className="text-red-500 text-[10px] font-bold mt-1">Start date cannot be after end date</span>
              )}
            </div>

            {/* Search Trigger Button */}
            <button 
              onClick={handleSearchClick}
              className="flex items-center justify-center gap-2 bg-[#0077c8] hover:bg-[#1e2f5e] text-white px-6 py-3 rounded-xl font-black uppercase text-[10px] transition-colors shadow-md w-full xl:w-auto"
            >
              <Search size={14} /> Search
            </button>

          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1400px]">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase whitespace-nowrap">
                  ID
                </th>
                <th
                  className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase whitespace-nowrap cursor-pointer hover:text-slate-600"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center gap-1">
                    Date {renderSortIcon('date')}
                  </div>
                </th>
                <th
                  className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase whitespace-nowrap cursor-pointer hover:text-slate-600"
                  onClick={() => handleSort('agent')}
                >
                  <div className="flex items-center gap-1">
                    Agent ID{renderSortIcon('agent')}
                  </div>
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase whitespace-nowrap">
                  PAN / Folio
                </th>
                <th
                  className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase whitespace-nowrap cursor-pointer hover:text-slate-600"
                  onClick={() => handleSort('clientName')}
                >
                  <div className="flex items-center gap-1">
                    Client {renderSortIcon('clientName')}
                  </div>
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span>Service</span>
                    <select
                      className="bg-transparent border-none outline-none cursor-pointer text-slate-500 font-bold"
                      value={filters?.serviceType || 'ALL'}
                      onChange={(e) => setFilters({ ...filters, serviceType: e.target.value })}
                    >
                      <option value="ALL">All</option>
                      {Object.values(ServiceType || {}).map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase whitespace-nowrap">
                  AMC
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase whitespace-nowrap">
                  New Information
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase whitespace-nowrap">
                  Remark
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase whitespace-nowrap text-center">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {(currentTasks || []).map((task, index) => (
                <tr
                  key={task?.transaction_id || task?.id || `task-${index}`}
                  className={`hover:bg-blue-50/30 transition-colors ${editingId === (task?.transaction_id || task?.id) ? 'bg-blue-50/50' : ''
                    }`}
                >
                  <td className="px-6 py-5 text-[10px] font-black text-[#0077c8] whitespace-nowrap">
                    {task?.transaction_id || task?.id || '—'}
                  </td>

                  <td className="px-6 py-5 text-xs font-bold text-slate-500 whitespace-nowrap">
                    {formatDate(task?.entery_date || task?.date)}
                  </td>

                  <td className="px-6 py-5 text-xs font-black text-[#1e2f5e] uppercase whitespace-nowrap">
                    {task?.agent_id || task?.agentId || '—'}
                  </td>

                  <td className="px-6 py-5 text-xs font-bold text-slate-600 whitespace-nowrap">
                    {task?.id_or_folio || task?.panOrFolio || '—'}
                  </td>

                  <td className="px-6 py-5 text-xs font-bold text-slate-600 whitespace-nowrap">
                    {task?.client_name || task?.clientName || '—'}
                  </td>

                  <td className="px-6 py-5 text-xs font-bold text-slate-600 whitespace-nowrap">
                    {task?.service_type || task?.serviceType || '—'}
                  </td>

                  <td className="px-6 py-5 text-xs font-bold text-slate-600 whitespace-nowrap">
                    {task?.amc || '—'}
                  </td>

                  <td 
                    className="px-6 py-5 text-xs text-slate-500 max-w-[250px] truncate" 
                    title={task?.new_information || task?.newInformation || ''}
                  >
                    {task?.new_information || task?.newInformation || '—'}
                  </td>

                  <td 
                    className="px-6 py-5 text-xs text-slate-500 max-w-[250px] truncate" 
                    title={task?.remark || ''}
                  >
                    {task?.remark || '—'}
                  </td>

                  <td className="px-6 py-5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(task)}
                        className="p-2 bg-white border border-slate-100 text-[#0077c8] rounded-xl hover:bg-[#0077c8] hover:text-white transition-all"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteLocalTask(task?.transaction_id || task?.id)}
                        className="p-2 bg-white border border-slate-100 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {currentTasks.length === 0 && (
                <tr>
                  <td
                    colSpan="10"
                    className="px-6 py-10 text-center text-slate-400 font-bold text-xs uppercase"
                  >
                    No tasks found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50">
            <span className="text-xs font-bold text-slate-500 uppercase">Page {currentPage} of {totalPages}</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 disabled:opacity-50 hover:bg-slate-100 transition-colors uppercase"
              >
                Previous
              </button>
              <button
                type="button"
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

export default SubTasksView;