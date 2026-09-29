import React, { useState } from 'react';
import { Key, ExternalLink, CheckCircle2, AlertCircle, Eye, EyeOff, Play, Sparkles, X } from 'lucide-react';
import { GroqService } from '../services/groqService';
import { UserSettings } from '../types';

interface OnboardingModalProps {
  settings: UserSettings;
  isOpen: boolean;
  onClose: () => void;
  onSave: (newSettings: Partial<UserSettings>) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  settings,
  isOpen,
  onClose,
  onSave,
}) => {
  const [groqKey, setGroqKey] = useState(settings.groqApiKey || '');
  const [geminiKey, setGeminiKey] = useState(settings.geminiApiKey || '');
  const [showGroq, setShowGroq] = useState(false);
  const [showGemini, setShowGemini] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleVerifyAndContinue = async () => {
    if (!groqKey.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter your Groq API key to continue.' });
      return;
    }

    setIsVerifying(true);
    setStatusMessage(null);

    const check = await GroqService.verifyApiKey(groqKey);
    setIsVerifying(false);

    if (check.valid) {
      setStatusMessage({ type: 'success', text: 'Groq Key verified successfully!' });
      setTimeout(() => {
        onSave({
          groqApiKey: groqKey.trim(),
          geminiApiKey: geminiKey.trim(),
          hasCompletedOnboarding: true,
        });
        onClose();
      }, 700);
    } else {
      setStatusMessage({ type: 'error', text: check.message });
    }
  };

  const handleSkipOrSave = () => {
    onSave({
      groqApiKey: groqKey.trim(),
      geminiApiKey: geminiKey.trim(),
      hasCompletedOnboarding: true,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-lg bg-[#0F1A16] border border-white/[0.08] rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#1FD67A] to-[#16A34A] flex items-center justify-center shadow-glow-sm">
              <Key className="w-4 h-4 text-black" />
            </div>
            <div>
              <h2 className="text-lg font-heading font-bold text-white tracking-tight">One quick key to get started</h2>
              <p className="text-xs text-gray-400">Set up your free AI credentials</p>
            </div>
          </div>
          {settings.hasCompletedOnboarding && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="py-4 space-y-5">
          {/* GROQ KEY CARD */}
          <div className="p-4 rounded-2xl bg-[#0A120F] border border-white/[0.06] hover:border-[#1FD67A]/30 transition-all">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold text-white tracking-wide">GROQ KEY</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#1FD67A]/15 text-[#1FD67A] text-[10px] font-bold">REQUIRED</span>
                </div>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  Your free Groq key is all you need — takes about 2 minutes, no credit card required.
                </p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1.5 text-xs text-[#1FD67A] hover:underline font-medium"
              >
                <span>Get my free Groq key</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <a
                href="https://www.youtube.com/results?search_query=how+to+get+free+groq+api+key"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-gray-400 hover:text-gray-200 transition-colors"
              >
                Watch tutorial
              </a>
            </div>

            <div className="mt-3 relative">
              <input
                type={showGroq ? 'text' : 'password'}
                value={groqKey}
                onChange={(e) => setGroqKey(e.target.value)}
                placeholder="gsk_..."
                className="w-full bg-[#0F1A16] border border-white/[0.08] focus:border-[#1FD67A] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 outline-none pr-10 transition-colors font-mono"
              />
              <button
                type="button"
                onClick={() => setShowGroq(!showGroq)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showGroq ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* GEMINI KEY CARD (OPTIONAL) */}
          <div className="p-4 rounded-2xl bg-[#0A120F] border border-white/[0.06] hover:border-white/[0.12] transition-all">
            <div className="flex items-start justify-between mb-1">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold text-white tracking-wide">GEMINI KEY</span>
                  <span className="px-2 py-0.5 rounded-full bg-white/[0.08] text-gray-300 text-[10px] font-medium">(Optional)</span>
                </div>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  Needed only if you want automatic translation into other languages.
                </p>
              </div>
            </div>

            <div className="mt-2.5 flex items-center justify-between">
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1.5 text-xs text-emerald-400 hover:underline font-medium"
              >
                <span>Get my free Gemini key</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="mt-3 relative">
              <input
                type={showGemini ? 'text' : 'password'}
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-[#0F1A16] border border-white/[0.08] focus:border-[#1FD67A] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 outline-none pr-10 transition-colors font-mono"
              />
              <button
                type="button"
                onClick={() => setShowGemini(!showGemini)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showGemini ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Feedback status */}
          {statusMessage && (
            <div
              className={`p-3 rounded-xl flex items-center space-x-2 text-xs font-medium ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="space-y-2 pt-1">
            <button
              onClick={handleVerifyAndContinue}
              disabled={isVerifying}
              className="w-full py-3.5 rounded-2xl btn-emerald text-black font-heading font-bold text-sm tracking-wide shadow-glow-sm flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isVerifying ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  <span>Verifying Groq Key...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Verify & Continue</span>
                </>
              )}
            </button>

            <button
              onClick={handleSkipOrSave}
              className="w-full py-2.5 rounded-xl bg-transparent hover:bg-white/[0.04] text-xs text-gray-400 hover:text-gray-200 transition-colors"
            >
              Continue without verifying (or try demo mode)
            </button>
          </div>

          {/* KT TUTORIAL VIDEOS */}
          <div className="pt-3 border-t border-white/[0.06]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center space-x-1.5">
              <span>KT Tutorial Videos</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Card 1 */}
              <div className="p-3 rounded-xl bg-[#0A120F] border border-white/[0.06] flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-1.5 text-[#1FD67A] mb-1">
                    <Play className="w-3.5 h-3.5 fill-[#1FD67A]" />
                    <span className="text-[11px] font-semibold">2 Min Setup</span>
                  </div>
                  <h4 className="text-xs font-semibold text-white leading-snug">Get Free Groq API Key</h4>
                  <p className="text-[10px] text-gray-400 mt-1">Step by step walkthrough to create your key.</p>
                </div>
                <a
                  href="https://www.youtube.com/results?search_query=groq+api+key+tutorial"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2.5 inline-flex items-center justify-center space-x-1 py-1.5 px-3 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-xs text-gray-300 hover:text-white transition-colors"
                >
                  <span>Watch on YouTube</span>
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>
              </div>

              {/* Card 2 */}
              <div className="p-3 rounded-xl bg-[#0A120F] border border-white/[0.06] flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-1.5 text-emerald-400 mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-semibold">Fast Creation</span>
                  </div>
                  <h4 className="text-xs font-semibold text-white leading-snug">Create your First Typography Video in Just 10 Seconds</h4>
                  <p className="text-[10px] text-gray-400 mt-1">Generate viral animated reels effortlessly.</p>
                </div>
                <a
                  href="https://www.youtube.com/results?search_query=kinetic+typography+short+video+creation"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2.5 inline-flex items-center justify-center space-x-1 py-1.5 px-3 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-xs text-gray-300 hover:text-white transition-colors"
                >
                  <span>Watch on YouTube</span>
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
