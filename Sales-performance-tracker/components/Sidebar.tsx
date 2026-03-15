
import React from 'react';
import { 
  LayoutDashboard, Users, History, FileText, X, CheckSquare 
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isSidebarOpen, setIsSidebarOpen }) => {
  const tabs = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'team', icon: Users, label: 'Sales Team' },
    { id: 'transactions', icon: History, label: 'Transactions' },
    { id: 'subtasks', icon: CheckSquare, label: 'Sub Tasks' },
    { id: 'reports', icon: FileText, label: 'Reports' }
  ];

  return (
    <>
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#1e2f5e] transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        no-print border-r border-white/5 flex flex-col
      `}>
        <div className="p-8 pb-10 flex flex-col items-center">
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden absolute top-4 right-4 text-white/60 hover:text-white">
            <X size={24} />
          </button>
          <div className="mb-6 relative">
            <div className="w-32 h-32 sm:w-36 sm:h-36 bg-white rounded-3xl flex items-center justify-center p-3 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
               <img src="/fc-logo.png" alt="FC logo" className="max-w-full h-auto object-contain" />
            </div>
          </div>
          <div className="text-center space-y-1">
            <h2 className="text-lg font-black tracking-tight uppercase text-white">FC & sons</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#0077c8]">Consulting</p>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {tabs.map(tab => (
            <button 
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl transition-all ${activeTab === tab.id ? 'bg-[#0077c8] text-white shadow-lg' : 'text-blue-100/60 hover:bg-white/5 hover:text-white'}`}
            >
              <tab.icon size={20} />
              <span className="font-bold uppercase tracking-widest text-[11px]">{tab.label}</span>
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
