import React from 'react';
import { Home, FolderOpen, Plus, Settings } from 'lucide-react';

export type NavTab = 'home' | 'projects' | 'create' | 'settings';

interface BottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onCreateClick: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  onCreateClick,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0A120F]/95 backdrop-blur-lg border-t border-white/[0.06] pb-[max(env(safe-area-inset-bottom),12px)] pt-2 px-6">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Home */}
        <button
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all duration-200 active:scale-95 ${
            currentTab === 'home' ? 'text-[#1FD67A]' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] font-medium tracking-tight">Home</span>
          {currentTab === 'home' && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#1FD67A] mt-0.5 shadow-glow-sm"></span>
          )}
        </button>

        {/* Projects */}
        <button
          onClick={() => onSelectTab('projects')}
          className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all duration-200 active:scale-95 ${
            currentTab === 'projects' ? 'text-[#1FD67A]' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <FolderOpen className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] font-medium tracking-tight">Projects</span>
          {currentTab === 'projects' && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#1FD67A] mt-0.5 shadow-glow-sm"></span>
          )}
        </button>

        {/* Create Button (Elevated Emerald Center) */}
        <button
          onClick={onCreateClick}
          className="relative -top-3 w-13 h-13 p-3.5 rounded-2xl btn-emerald flex items-center justify-center text-black shadow-glow-md active:scale-90 transition-transform duration-200"
          aria-label="Create New Kinetic Video"
        >
          <Plus className="w-6 h-6 stroke-[2.8]" />
        </button>

        {/* Create Text Tab */}
        <button
          onClick={onCreateClick}
          className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all duration-200 active:scale-95 ${
            currentTab === 'create' ? 'text-[#1FD67A]' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <span className="text-[11px] font-medium tracking-tight mt-1 text-gray-300">Create</span>
          {currentTab === 'create' && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#1FD67A] mt-0.5 shadow-glow-sm"></span>
          )}
        </button>

        {/* Settings */}
        <button
          onClick={() => onSelectTab('settings')}
          className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all duration-200 active:scale-95 ${
            currentTab === 'settings' ? 'text-[#1FD67A]' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Settings className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] font-medium tracking-tight">Settings</span>
          {currentTab === 'settings' && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#1FD67A] mt-0.5 shadow-glow-sm"></span>
          )}
        </button>
      </div>
    </nav>
  );
};
