import React from 'react';
import { Sparkles, Key, Settings } from 'lucide-react';
import { UserSettings } from '../types';

interface TopBarProps {
  settings: UserSettings;
  onOpenSettings: () => void;
  onOpenOnboarding: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  settings,
  onOpenSettings,
  onOpenOnboarding,
}) => {
  const hasGroqKey = Boolean(settings.groqApiKey && settings.groqApiKey.trim().length > 5);

  return (
    <header className="sticky top-0 z-30 w-full bg-[#0A120F]/90 backdrop-blur-md border-b border-white/[0.06] px-4 py-3 transition-all">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1FD67A] to-[#16A34A] flex items-center justify-center shadow-glow-sm">
            <span className="font-heading font-black text-black text-lg tracking-tighter">K</span>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-heading font-bold text-white tracking-tight text-base">NextGen</span>
              <span className="font-heading font-bold text-[#1FD67A] tracking-tight text-base">Kinetic</span>
            </div>
            <p className="text-[10px] text-gray-400 font-medium tracking-wide">AI Motion Typography</p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2">
          {hasGroqKey ? (
            <button
              onClick={onOpenSettings}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-[#0F1A16] border border-[#1FD67A]/30 text-[#1FD67A] text-xs font-semibold hover:border-[#1FD67A]/60 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-[#1FD67A] animate-pulse"></span>
              <span>Groq Active</span>
            </button>
          ) : (
            <button
              onClick={onOpenOnboarding}
              className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-400 text-xs font-medium hover:brightness-110 active:scale-95 transition-all"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Add Key</span>
            </button>
          )}

          <button
            onClick={onOpenSettings}
            className="w-9 h-9 rounded-xl bg-[#0F1A16] border border-white/[0.08] flex items-center justify-center text-gray-300 hover:text-white hover:border-[#1FD67A]/30 active:scale-95 transition-all"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
