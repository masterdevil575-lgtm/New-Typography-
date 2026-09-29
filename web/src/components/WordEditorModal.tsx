import React, { useState } from 'react';
import { Bold, Italic, Type, Palette, Square, Trash2, Check, X } from 'lucide-react';
import { WordItem } from '../types';

interface WordEditorModalProps {
  word: WordItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedWord: WordItem) => void;
  onDelete: (wordId: string) => void;
}

const COLOR_PALETTE = [
  '#FFFFFF', '#1FD67A', '#00F59B', '#FFE600', '#F59E0B', 
  '#EF4444', '#EC4899', '#8B5CF6', '#3B82F6', '#14B8A6'
];

export const WordEditorModal: React.FC<WordEditorModalProps> = ({
  word,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  if (!isOpen || !word) return null;

  const [text, setText] = useState(word.word);
  const [fontSize, setFontSize] = useState(word.fontSize || 1);
  const [color, setColor] = useState(word.color || '#FFFFFF');
  const [highlightColor, setHighlightColor] = useState(word.highlightColor || '#1FD67A');
  const [isBold, setIsBold] = useState(word.isBold !== false);
  const [isItalic, setIsItalic] = useState(Boolean(word.isItalic));
  const [isUppercase, setIsUppercase] = useState(word.isUppercase !== false);
  const [hasBackgroundBox, setHasBackgroundBox] = useState(Boolean(word.hasBackgroundBox));
  const [boxColor, setBoxColor] = useState(word.boxColor || 'rgba(0, 0, 0, 0.8)');

  const handleApply = () => {
    onSave({
      ...word,
      word: text.trim() || word.word,
      fontSize,
      color,
      highlightColor,
      isBold,
      isItalic,
      isUppercase,
      hasBackgroundBox,
      boxColor,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-[#0F1A16] border-t border-white/[0.1] rounded-t-3xl p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
          <h3 className="text-sm font-heading font-bold text-white flex items-center space-x-2">
            <Type className="w-4 h-4 text-[#1FD67A]" />
            <span>Edit Word Chip</span>
          </h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-gray-400"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Word Text Input */}
        <div>
          <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide block mb-1">
            Word Text
          </label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full bg-[#0A120F] border border-white/[0.08] focus:border-[#1FD67A] rounded-xl px-3.5 py-2.5 text-sm text-white font-bold outline-none"
          />
        </div>

        {/* Font Size Slider */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-gray-400 uppercase">Scale Size</span>
            <span className="text-xs text-[#1FD67A] font-bold">{(fontSize * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0.7"
            max="1.8"
            step="0.05"
            value={fontSize}
            onChange={(e) => setFontSize(parseFloat(e.target.value))}
            className="w-full accent-[#1FD67A] cursor-pointer"
          />
        </div>

        {/* Style Toggles (Bold, Italic, Uppercase, Box) */}
        <div>
          <span className="text-[11px] font-semibold text-gray-400 uppercase block mb-1.5">Style Toggles</span>
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => setIsBold(!isBold)}
              className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-xs font-bold transition-all ${
                isBold ? 'bg-[#182C25] border-[#1FD67A] text-[#1FD67A]' : 'bg-[#0A120F] border-white/[0.07] text-gray-400'
              }`}
            >
              <Bold className="w-4 h-4 mb-1" />
              <span>Bold</span>
            </button>

            <button
              onClick={() => setIsItalic(!isItalic)}
              className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-xs font-bold transition-all ${
                isItalic ? 'bg-[#182C25] border-[#1FD67A] text-[#1FD67A]' : 'bg-[#0A120F] border-white/[0.07] text-gray-400'
              }`}
            >
              <Italic className="w-4 h-4 mb-1" />
              <span>Italic</span>
            </button>

            <button
              onClick={() => setIsUppercase(!isUppercase)}
              className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-xs font-bold transition-all ${
                isUppercase ? 'bg-[#182C25] border-[#1FD67A] text-[#1FD67A]' : 'bg-[#0A120F] border-white/[0.07] text-gray-400'
              }`}
            >
              <span className="text-sm font-black mb-0.5">AA</span>
              <span>Caps</span>
            </button>

            <button
              onClick={() => setHasBackgroundBox(!hasBackgroundBox)}
              className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-xs font-bold transition-all ${
                hasBackgroundBox ? 'bg-[#182C25] border-[#1FD67A] text-[#1FD67A]' : 'bg-[#0A120F] border-white/[0.07] text-gray-400'
              }`}
            >
              <Square className="w-4 h-4 mb-1" />
              <span>Box</span>
            </button>
          </div>
        </div>

        {/* Highlight Color Palette */}
        <div>
          <span className="text-[11px] font-semibold text-gray-400 uppercase block mb-1.5 flex items-center space-x-1.5">
            <Palette className="w-3.5 h-3.5" />
            <span>Spoken Highlight Color</span>
          </span>
          <div className="flex items-center space-x-2 overflow-x-auto py-1">
            {COLOR_PALETTE.map((c) => (
              <button
                key={c}
                onClick={() => setHighlightColor(c)}
                style={{ backgroundColor: c }}
                className={`w-7 h-7 rounded-full shrink-0 border-2 transition-transform ${
                  highlightColor === c ? 'scale-110 border-white shadow-glow-sm' : 'border-transparent'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2 pt-2">
          <button
            onClick={() => onDelete(word.id)}
            className="p-3 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 flex items-center justify-center"
            title="Delete Word"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            onClick={handleApply}
            className="flex-1 py-3 rounded-2xl btn-emerald text-black font-heading font-bold text-xs flex items-center justify-center space-x-1.5 shadow-glow-sm"
          >
            <Check className="w-4 h-4" />
            <span>Apply Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
