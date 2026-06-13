import React, { useState, useEffect } from 'react';
import { UserCircle, Target, Plus, Trash2, Edit2, X, Check } from 'lucide-react';

const TeamView = () => {
  const [subTab, setSubTab] = useState('members');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [agents, setAgents] = useState([]);

  const fetchAgents = async () => {
    try {
      console.log("API URL:", import.meta.env.VITE_API_URL);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/agent`);
      const data = await res.json();

      const normalized = data.map(a => ({
        ...a,
        net_business: Number(a.net_business) || 0,
        sip_target: Number(a.sip_target) || 0,
        lumpsum_target: Number(a.lumpsum_target) || 0
      }));

      setAgents(normalized);
    } catch (error) {
      console.error("Error fetching agents:", error);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const onUpdateTarget = async (pan, field, value) => {
    setAgents(prev =>
      prev.map(agent =>
        agent.pan === pan ? { ...agent, [field]: value } : agent
      )
    );
    
    

  };

  const onAddAgent = async (agent) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/agent_create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(agent)
      });

      const data = await res.json();

      await fetchAgents();
    } catch (error) {
      console.error("Error creating agent:", error);
    }
  };

  const onUpdateAgent = async (pan, updatedData) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/agent_update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ pan, ...updatedData })
      });
      const data = await res.json();
    
      
      await fetchAgents();
    } catch (error) {
      console.error("Error updating agent:", error);
    }
    setAgents(prev =>
      prev.map(agent =>
        agent.pan === pan ? { ...agent, ...updatedData } : agent
      )
    );
  };

  const onDeleteAgent = async (pan) => {
    if (window.confirm(`Are you sure you want to delete agent with PAN: ${pan}? This action cannot be undone.`)) {
    try{
      const res = await fetch(`${import.meta.env.VITE_API_URL}/agent_delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ pan })
      });
      const data = await res.json();
      setAgents(prev => prev.filter(agent => agent.pan !== pan));
      console.log("Agent delete response:", data);
    } catch (error) {
      console.error("Error deleting agent:", error);

    }
    
    
  };
}

  const handleStartAdd = () => {
    setFormData({
      name: '',
      email: '',
      pan: '',
      sip_target: 0,
      lumpsum_target: 0,
      net_business: 0,
      new_pan: ''
    });
    setIsAdding(true);
  };

  const handleSaveAdd = () => {
  
    if (formData.name && formData.email && formData.pan) {
      onAddAgent({
        ...formData,
        sip_target: Number(formData.sip_target) || 0,
        lumpsum_target: Number(formData.lumpsum_target) || 0
      });
      setIsAdding(false);
    }
  };

  const handleStartEdit = (agent) => {
    setEditingId(agent.pan);
    setFormData({
      ...agent,
      new_pan: agent.pan   
    });
  };

  const handleSaveEdit = () => {
    if (!formData.name?.trim() || !formData.email?.trim() || !formData.pan?.trim()) {
      alert("Name, Email, and PAN are required.");
      return;
    }

    if (editingId) {
      onUpdateAgent(editingId, formData);
      setEditingId(null);
    }
  };

  // NEW FUNCTION: Save only the targets from the Allocation tab
  const handleSaveTarget = async (agent) => {
    onUpdateTarget(agent.pan, agent.sip_target, agent.lumpsum_target);
    try{
      const res = await fetch(`${import.meta.env.VITE_API_URL}/agent_target`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          pan: agent.pan,
          sip_target: agent.sip_target,
          lumpsum_target: agent.lumpsum_target
        })
      });
      const data = await res.json();
      alert(`Targets saved for ${agent.name}!`);
      console.log("Target update response:", data);

    } catch (error) {
      console.error("Error saving targets:", error);
    }

    

   
  };

  return (
    <div className="animate-fadeIn space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 w-full sm:w-fit overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSubTab('members')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-black uppercase text-[10px] transition-all whitespace-nowrap ${subTab === 'members' ? 'bg-[#1e2f5e] text-white' : 'text-slate-500 hover:bg-gray-50'}`}
          >
            <UserCircle size={16} />Personnel
          </button>

          <button
            onClick={() => setSubTab('targets')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-black uppercase text-[10px] transition-all whitespace-nowrap ${subTab === 'targets' ? 'bg-[#1e2f5e] text-white' : 'text-slate-500 hover:bg-gray-50'}`}
          >
            <Target size={16} />Allocation
          </button>
        </div>

        {subTab === 'members' && (
          <button
            onClick={handleStartAdd}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl font-black uppercase text-[10px] hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200"
          >
            <Plus size={16} /> Add Agent
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-[2rem] shadow-lg border border-emerald-100 mb-6 animate-fadeIn">
          <h3 className="text-lg font-black text-[#1e2f5e] uppercase mb-4">
            New Agent Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <input
              placeholder="Name"
              value={formData.name || ''}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="px-4 py-3 bg-slate-50 rounded-xl border-2 border-transparent focus:border-emerald-500 outline-none font-bold text-slate-700"
            />
            <input
              placeholder="Email"
              value={formData.email || ''}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="px-4 py-3 bg-slate-50 rounded-xl border-2 border-transparent focus:border-emerald-500 outline-none font-bold text-slate-700"
            />
            <input
              placeholder="PAN Number"
              value={formData.pan || ''}
              onChange={e => setFormData({ ...formData, pan: e.target.value })}
              className="px-4 py-3 bg-slate-50 rounded-xl border-2 border-transparent focus:border-emerald-500 outline-none font-bold text-slate-700 uppercase"
            />
            <input
              type="number"
              placeholder="SIP Target"
              value={formData.sip_target || ''}
              onChange={e => setFormData({ ...formData, sip_target: Number(e.target.value) })}
              className="px-4 py-3 bg-slate-50 rounded-xl border-2 border-transparent focus:border-emerald-500 outline-none font-bold text-slate-700"
            />
            <input
              type="number"
              placeholder="Lumpsum Target"
              value={formData.lumpsum_target || ''}
              onChange={e => setFormData({ ...formData, lumpsum_target: Number(e.target.value) })}
              className="px-4 py-3 bg-slate-50 rounded-xl border-2 border-transparent focus:border-emerald-500 outline-none font-bold text-slate-700"
            />
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => setIsAdding(false)}
              className="px-6 py-2 rounded-xl font-bold text-slate-500 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAdd}
              className="px-6 py-2 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 shadow-lg shadow-emerald-200"
            >
              Save Agent
            </button>
          </div>
        </div>
      )}

      {subTab === 'members' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {agents.map(agent => {
            const netGain = Number(agent.net_business) || 0;
            const netTarget =
              (Number(agent.lumpsum_target) || 0) +
              (Number(agent.sip_target) || 0);
            const isEditing = editingId === agent.pan;

            return (
              <div key={agent.id} className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-xl transition-all group relative">
                <div className={`absolute top-4 right-4 flex gap-2 transition-opacity z-10 ${isEditing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  {isEditing ? (
                    <>
                      <button onClick={handleSaveEdit} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 shadow-sm">
                        <Check size={16} />
                      </button>
                      <button onClick={() => setEditingId(null)} className="p-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 shadow-sm">
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleStartEdit(agent)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 shadow-sm">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => onDeleteAgent(agent.pan)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 shadow-sm">
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-blue-50 text-[#1e2f5e] flex items-center justify-center rounded-2xl font-black text-2xl shadow-inner">
                    {agent.name ? agent.name.charAt(0) : 'A'}
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    {isEditing ? (
                      <div className="space-y-2 pr-12">
                        <input 
                          value={formData.name || ''} 
                          onChange={e => setFormData({...formData, name: e.target.value})} 
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-sm font-bold focus:outline-none focus:border-blue-400" 
                          placeholder="Name" 
                        />
                        <input 
                          value={formData.email || ''} 
                          onChange={e => setFormData({...formData, email: e.target.value})} 
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[10px] font-bold focus:outline-none focus:border-blue-400" 
                          placeholder="Email" 
                        />
                        <input 
                          value={formData.new_pan || ''} 
                          onChange={e => setFormData({...formData, new_pan: e.target.value})} 
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[10px] font-bold focus:outline-none focus:border-blue-400" 
                          placeholder="PAN" 
                        />
                      </div>
                    ) : (
                      <div className="pr-12">
                        <h4 className="font-black text-lg text-[#1e2f5e] uppercase truncate">
                          {agent.name}
                        </h4>
                        <p className="text-slate-400 text-[10px] font-bold uppercase truncate">
                          {agent.email}
                        </p>
                        {agent.pan && (
                          <p className="text-[#0077c8] text-[10px] font-black uppercase tracking-widest mt-1">
                            PAN: {agent.pan}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 rounded-2xl">
                      <span className="text-[8px] text-slate-400 font-black uppercase block mb-1">
                        Net Gain
                      </span>
                      <span className={`text-sm font-black ${netGain >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        ₹{netGain.toLocaleString()}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl">
                      <span className="text-[8px] text-slate-400 font-black uppercase block mb-1">
                        Net Target
                      </span>
                      <span className="text-sm font-black text-slate-700">
                        ₹{netTarget.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl flex justify-between items-center">
                    <div>
                      <span className="text-[8px] text-slate-400 font-black uppercase block mb-1">
                        Monthly SIP Goal
                      </span>
                      <span className="text-lg font-black text-[#1e2f5e]">
                        ₹{(agent.sip_target || 0).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[8px] text-slate-400 font-black uppercase block mb-1 text-right">
                        Lumpsum Goal
                      </span>
                      <span className="text-lg font-black text-[#0077c8] block text-right">
                        ₹{(agent.lumpsum_target || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6 sm:p-10 space-y-6">
          <h3 className="text-xl font-black text-[#1e2f5e] uppercase">
            Investment Goal Allocation
          </h3>
          {agents.map(agent => (
            <div key={agent.pan} className="grid grid-cols-1 md:grid-cols-4 items-center gap-6 p-6 rounded-[2rem] border border-slate-100 bg-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#1e2f5e] rounded-xl flex items-center justify-center font-black text-white text-lg">
                  {agent.name ? agent.name.charAt(0) : 'A'}
                </div>
                <span className="font-black text-[#1e2f5e] uppercase text-base">
                  {agent.name}
                </span>
              </div>

              {/* FIX: Modified grid to fit the inputs and the new save button side-by-side */}
              <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-12 items-end gap-4">
                <div className="space-y-1 sm:col-span-5">
                  <label className="text-[8px] font-black text-[#0077c8] uppercase">
                    SIP Target (₹)
                  </label>
                  <input
                    type="number"
                    value={agent.sip_target || 0}
                    onChange={(e) =>
                      onUpdateTarget(agent.pan, 'sip_target', Number(e.target.value))
                    }
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-[#0077c8] outline-none rounded-xl font-black"
                  />
                </div>
                <div className="space-y-1 sm:col-span-5">
                  <label className="text-[8px] font-black text-[#0077c8] uppercase">
                    LS Target (₹)
                  </label>
                  <input
                    type="number"
                    value={agent.lumpsum_target || 0}
                    onChange={(e) =>
                      onUpdateTarget(agent.pan, 'lumpsum_target', Number(e.target.value))
                    }
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-[#0077c8] outline-none rounded-xl font-black"
                  />
                </div>
                
                {/* NEW SAVE BUTTON */}
                <div className="sm:col-span-2">
                  <button 
                    onClick={() => handleSaveTarget(agent)}
                    className="w-full py-3 bg-[#1e2f5e] hover:bg-blue-900 text-white rounded-xl font-bold transition-all shadow-md"
                  >
                    Save
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamView;