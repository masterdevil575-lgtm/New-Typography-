import React, { useState } from 'react';
import { 
  Key, Shield, Globe, Film, Trash2, CheckCircle2, AlertCircle, Eye, EyeOff, 
  ExternalLink, Sparkles, Heart, Info, RefreshCw
} from 'lucide-react';
import { UserSettings } from '../types';
import { GroqService } from '../services/groqService';
import { StorageService } from '../services/storageService';
import { LicensesModal } from './LicensesModal';

interface SettingsScreenProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onClearAllData: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  onUpdateSettings,
  onClearAllData,
}) => {
  const [groqKey, setGroqKey] = useState(settings.groqApiKey || '');
  const [geminiKey, setGeminiKey] = useState(settings.geminiApiKey || '');
  const [showGroq, setShowGroq] = useState(false);
  const [showGemini, setShowGemini] = useState(false);
  const [exportQuality, setExportQuality] = useState<'720p' | '1080p'>(settings.defaultExportQuality || '1080p');
  const [defaultLang, setDefaultLang] = useState<string>(settings.defaultLanguage || 'hi');
  const [sfxEnabled, setSfxEnabled] = useState<boolean>(settings.sfxEnabled ?? true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<{ success: boolean; msg: string } | null>(null);
  const [isLicensesOpen, setIsLicensesOpen] = useState(false);
  const [isSavedBanner, setIsSavedBanner] = useState(false);

  const handleTestGroqKey = async () => {
    if (!groqKey.trim()) {
      setVerifyStatus({ success: false, msg: 'Please enter a Groq API Key first.' });
      return;
    }
    setIsVerifying(true);
    setVerifyStatus(null);
    const res = await GroqService.verifyApiKey(groqKey);
    setIsVerifying(false);
    setVerifyStatus({ success: res.valid, msg: res.message });
  };

  const handleSaveAll = () => {
    onUpdateSettings({
      groqApiKey: groqKey.trim(),
      geminiApiKey: geminiKey.trim(),
      defaultExportQuality: exportQuality,
      defaultLanguage: defaultLang,
      sfxEnabled,
    });
    setIsSavedBanner(true);
    setTimeout(() => setIsSavedBanner(false), 2500);
  };

  const handleClearCache = async () => {
    if (window.confirm('Are you sure you want to clear all projects and cached data? This cannot be undone.')) {
      await StorageService.clearAllData();
      onClearAllData();
      alert('Cache and local storage cleared.');
    }
  };

  return (
    <div className="pb-28 pt-2 px-4 max-w-md mx-auto space-y-5">
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-xl font-heading font-black text-white tracking-tight">Settings</h1>
          <p className="text-xs text-gray-400">Configure keys, defaults & preferences</p>
        </div>

        <button
          onClick={handleSaveAll}
          className="px-3.5 py-1.5 rounded-xl btn-emerald text-black text-xs font-heading font-bold shadow-glow-sm"
        >
          Save
        </button>
      </div>

      {isSavedBanner && (
        <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      {/* 1. API KEYS MANAGEMENT */}
      <div className="p-4 rounded-3xl bg-[#0F1A16] border border-white/[0.08] space-y-4">
        <div className="flex items-center space-x-2 border-b border-white/[0.06] pb-2.5">
          <Key className="w-4 h-4 text-[#1FD67A]" />
          <h2 className="text-sm font-heading font-bold text-white uppercase tracking-wide">API Keys Management</h2>
        </div>

        {/* Groq Key */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white">Groq API Key (Whisper Turbo)</span>
            <a
              href="https://console.groq.com/keys"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-[#1FD67A] hover:underline flex items-center space-x-1"
            >
              <span>Get Key</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="relative">
            <input
              type={showGroq ? 'text' : 'password'}
              value={groqKey}
              onChange={(e) => setGroqKey(e.target.value)}
              placeholder="gsk_..."
              className="w-full bg-[#0A120F] border border-white/[0.08] focus:border-[#1FD67A] rounded-xl px-3 py-2 text-xs text-white font-mono outline-none pr-16"
            />
            <button
              onClick={() => setShowGroq(!showGroq)}
              className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showGroq ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={handleTestGroqKey}
              disabled={isVerifying}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#1FD67A] px-1.5 py-0.5 rounded hover:bg-[#1FD67A]/10"
            >
              {isVerifying ? '...' : 'Test'}
            </button>
          </div>
        </div>

        {/* Verification Status */}
        {verifyStatus && (
          <div
            className={`p-2 rounded-xl text-xs flex items-center space-x-1.5 ${
              verifyStatus.success
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}
          >
            {verifyStatus.success ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
            <span>{verifyStatus.msg}</span>
          </div>
        )}

        {/* Gemini Key */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white">Gemini API Key (Optional Translation)</span>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-emerald-400 hover:underline flex items-center space-x-1"
            >
              <span>Get Key</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="relative">
            <input
              type={showGemini ? 'text' : 'password'}
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-[#0A120F] border border-white/[0.08] focus:border-[#1FD67A] rounded-xl px-3 py-2 text-xs text-white font-mono outline-none pr-9"
            />
            <button
              onClick={() => setShowGemini(!showGemini)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showGemini ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* 2. DEFAULT PREFERENCES */}
      <div className="p-4 rounded-3xl bg-[#0F1A16] border border-white/[0.08] space-y-4">
        <div className="flex items-center space-x-2 border-b border-white/[0.06] pb-2.5">
          <Film className="w-4 h-4 text-[#1FD67A]" />
          <h2 className="text-sm font-heading font-bold text-white uppercase tracking-wide">Defaults</h2>
        </div>

        {/* Default Quality */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-semibold text-white">Default Export Quality</h4>
            <p className="text-[10px] text-gray-400">Resolution for exported kinetic videos</p>
          </div>
          <select
            value={exportQuality}
            onChange={(e) => setExportQuality(e.target.value as any)}
            className="bg-[#0A120F] border border-white/[0.1] text-xs font-bold text-white rounded-xl px-3 py-1.5 outline-none"
          >
            <option value="1080p">1080p Full HD</option>
            <option value="720p">720p HD</option>
          </select>
        </div>

        {/* Default Language */}
        <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
          <div>
            <h4 className="text-xs font-semibold text-white">Default Language</h4>
            <p className="text-[10px] text-gray-400">Preselected transcription language</p>
          </div>
          <select
            value={defaultLang}
            onChange={(e) => setDefaultLang(e.target.value)}
            className="bg-[#0A120F] border border-white/[0.1] text-xs font-bold text-white rounded-xl px-3 py-1.5 outline-none"
          >
            <option value="roman-urdu">Roman Urdu / Roman English</option>
            <option value="hi">Hindi (हिन्दी)</option>
            <option value="hinglish">Hinglish</option>
            <option value="en">English</option>
            <option value="ur">Urdu (اردو)</option>
            <option value="pa">Punjabi (ਪੰਜਾਬੀ)</option>
            <option value="bn">Bengali (বাংলা)</option>
            <option value="ta">Tamil (தமிழ்)</option>
          </select>
        </div>

        {/* Sound Effects Toggle */}
        <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
          <div>
            <h4 className="text-xs font-semibold text-white">Sound Effects (SFX)</h4>
            <p className="text-[10px] text-gray-400">Play whooshes & pops on transitions and in export</p>
          </div>
          <button
            type="button"
            onClick={() => setSfxEnabled(!sfxEnabled)}
            className={`w-12 h-6 rounded-full p-0.5 transition-colors duration-200 flex items-center ${
              sfxEnabled ? 'bg-[#1FD67A] justify-end' : 'bg-gray-700 justify-start'
            }`}
          >
            <div className="w-5 h-5 rounded-full bg-black shadow-md"></div>
          </button>
        </div>
      </div>

      {/* 3. STORAGE & LICENSES */}
      <div className="p-4 rounded-3xl bg-[#0F1A16] border border-white/[0.08] space-y-3">
        <button
          onClick={() => setIsLicensesOpen(true)}
          className="w-full flex items-center justify-between py-2 text-left hover:text-[#1FD67A] transition-colors"
        >
          <div className="flex items-center space-x-2.5">
            <Shield className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-semibold text-gray-200">Open Source Licenses</span>
          </div>
          <span className="text-xs text-[#1FD67A]">View</span>
        </button>

        <div className="pt-2 border-t border-white/[0.04]">
          <button
            onClick={handleClearCache}
            className="w-full flex items-center justify-between py-2 text-left text-red-400 hover:text-red-300 transition-colors"
          >
            <div className="flex items-center space-x-2.5">
              <Trash2 className="w-4 h-4 text-red-400" />
              <span className="text-xs font-semibold">Clear Cache & Local Storage</span>
            </div>
            <span className="text-xs">Reset</span>
          </button>
        </div>
      </div>

      {/* 4. ABOUT SECTION */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-[#0F1A16] to-[#0A120F] border border-white/[0.07] text-center space-y-1.5">
        <div className="flex items-center justify-center space-x-1.5">
          <span className="font-heading font-black text-white text-sm">NextGen</span>
          <span className="font-heading font-black text-[#1FD67A] text-sm">Kinetic</span>
          <span className="text-[10px] text-gray-400">v1.0.0</span>
        </div>
        <p className="text-xs text-gray-300 flex items-center justify-center space-x-1">
          <span>Made with</span>
          <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
          <span>by</span>
          <span className="font-bold text-[#1FD67A]">Ali</span>
        </p>
        <p className="text-[10px] text-gray-400">
          Native Android Kinetic Typography & Auto-Caption Studio
        </p>
      </div>

      {/* LICENSES MODAL */}
      <LicensesModal isOpen={isLicensesOpen} onClose={() => setIsLicensesOpen(false)} />
    </div>
  );
};
