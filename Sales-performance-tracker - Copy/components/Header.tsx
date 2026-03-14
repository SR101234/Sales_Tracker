
import React from 'react';
import { Menu } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setIsSidebarOpen: (open: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setIsSidebarOpen }) => {
  return (
    <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-8 no-print shadow-sm z-10">
      <div className="flex items-center gap-3 sm:gap-4">
         <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg">
           <Menu size={24} />
         </button>
         <div className="w-1.5 h-8 bg-[#0077c8] rounded-full hidden sm:block" />
         <h1 className="text-lg sm:text-xl font-black text-slate-800 uppercase tracking-tight truncate">{activeTab}</h1>
      </div>
    </header>
  );
};

export default Header;
