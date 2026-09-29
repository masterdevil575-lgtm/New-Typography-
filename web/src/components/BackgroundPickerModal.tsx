import React, { useRef } from 'react';
import { Palette, Image as ImageIcon, Video, Upload, Check, X } from 'lucide-react';
import { ProjectBackground } from '../types';

interface BackgroundPickerModalProps {
  currentBackground: ProjectBackground;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (bg: ProjectBackground) => void;
  onUploadMedia: (file: File) => void;
}

const GRADIENT_PRESETS = [
  { id: 'emerald-aurora', name: 'Emerald Aurora', css: 'from-[#041d13] via-[#0a2e21] to-[#06130d]' },
  { id: 'cyber-neon', name: 'Cyber Neon', css: 'from-[#0a101f] via-[#06261d] to-[#0a120f]' },
  { id: 'sunset-fire', name: 'Sunset Blaze', css: 'from-[#2d1109] via-[#1e111a] to-[#0a120f]' },
  { id: 'obsidian-black', name: 'Dark Obsidian', css: 'from-[#0F1A16] to-[#0A120F]' },
];

const SOLID_COLORS = [
  '#0A120F', '#071A12', '#0E1726', '#1A0B2E', '#2B0E14', '#111827', '#000000'
];

export const BackgroundPickerModal: React.FC<BackgroundPickerModalProps> = ({
  currentBackground,
  isOpen,
  onClose,
  onSelect,
  onUploadMedia,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadMedia(file);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-[#0F1A16] border-t border-white/[0.1] rounded-t-3xl p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
          <h3 className="text-sm font-heading font-bold text-white flex items-center space-x-2">
            <Palette className="w-4 h-4 text-[#1FD67A]" />
            <span>Video Background</span>
          </h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-gray-400"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Auto Background Option (NEW) */}
        <div>
          <button
            onClick={() => {
              onSelect({ type: 'auto', value: 'auto' });
              onClose();
            }}
            className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between relative overflow-hidden transition-all ${
              currentBackground.type === 'auto'
                ? 'bg-[#182C25] border-[#1FD67A] shadow-glow-sm'
                : 'bg-[#0A120F] border-white/[0.08] hover:border-[#1FD67A]/40'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1FD67A]/20 to-[#16A34A]/10 border border-[#1FD67A]/30 flex items-center justify-center text-[#1FD67A] shadow-glow-sm">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-bold text-white">Auto Background (AI Motion)</span>
                  <span className="px-1.5 py-0.5 rounded bg-[#1FD67A]/20 text-[#1FD67A] text-[9px] font-bold">SMART</span>
                </div>
                <p className="text-[10px] text-gray-300 mt-0.5">
                  Animated procedural canvas particles & glow matched to your template
                </p>
              </div>
            </div>
            {currentBackground.type === 'auto' && (
              <div className="w-5 h-5 rounded-full bg-[#1FD67A] flex items-center justify-center text-black">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
            )}
          </button>
        </div>

        {/* Gradient Presets */}
        <div>
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide block mb-2">
            Dynamic Gradients
          </span>
          <div className="grid grid-cols-2 gap-2.5">
            {GRADIENT_PRESETS.map((grad) => {
              const isSelected = currentBackground.type === 'gradient' && currentBackground.value === grad.id;
              return (
                <button
                  key={grad.id}
                  onClick={() => {
                    onSelect({ type: 'gradient', value: grad.id });
                    onClose();
                  }}
                  className={`p-3 rounded-2xl border text-left flex items-center justify-between relative overflow-hidden transition-all ${
                    isSelected ? 'border-[#1FD67A] shadow-glow-sm' : 'border-white/[0.08]'
                  }`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${grad.css} opacity-90`}></div>
                  <span className="relative z-10 text-xs font-bold text-white drop-shadow">
                    {grad.name}
                  </span>
                  {isSelected && (
                    <div className="relative z-10 w-4 h-4 rounded-full bg-[#1FD67A] flex items-center justify-center text-black">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Solid Colors */}
        <div>
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide block mb-2">
            Solid Studio Backgrounds
          </span>
          <div className="flex items-center space-x-2 overflow-x-auto py-1">
            {SOLID_COLORS.map((col) => {
              const isSelected = currentBackground.type === 'color' && currentBackground.value === col;
              return (
                <button
                  key={col}
                  onClick={() => {
                    onSelect({ type: 'color', value: col });
                    onClose();
                  }}
                  style={{ backgroundColor: col }}
                  className={`w-9 h-9 rounded-2xl shrink-0 border-2 flex items-center justify-center transition-all ${
                    isSelected ? 'border-[#1FD67A] scale-110 shadow-glow-sm' : 'border-white/[0.1]'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#1FD67A] stroke-[3]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Video / Image Upload */}
        <div>
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide block mb-2">
            Custom Media
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleMediaUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full p-3.5 rounded-2xl bg-[#0A120F] border border-dashed border-[#1FD67A]/40 hover:border-[#1FD67A] flex items-center justify-center space-x-2 text-xs font-semibold text-gray-300 hover:text-white transition-all"
          >
            <Upload className="w-4 h-4 text-[#1FD67A]" />
            <span>Upload Background Video or Photo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
