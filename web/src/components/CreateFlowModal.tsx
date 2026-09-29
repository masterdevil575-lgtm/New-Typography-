import React, { useState, useRef } from 'react';
import { 
  Upload, Music, Video, Search, Check, Sparkles, AlertCircle, ArrowLeft, ArrowRight,
  Flame, Globe, Wand2, X, RefreshCw
} from 'lucide-react';
import { Scene, TypographyStyle, LanguageOption, UserSettings, Project } from '../types';
import { GroqService } from '../services/groqService';
import { GeminiService } from '../services/geminiService';
import { STYLES } from '../services/kineticRenderer';
import { StorageService } from '../services/storageService';

interface CreateFlowModalProps {
  mode: 'kinetic' | 'autocaptions';
  settings: UserSettings;
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (project: Project) => void;
  onOpenSettings: () => void;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'roman-urdu', name: 'Roman Urdu / Roman English', nativeName: 'Roman Urdu Texting', flag: '🇵🇰' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'hinglish', name: 'Hinglish (Hindi in Roman)', nativeName: 'Hinglish', flag: '🇮🇳' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
];

export const CreateFlowModal: React.FC<CreateFlowModalProps> = ({
  mode,
  settings,
  isOpen,
  onClose,
  onProjectCreated,
  onOpenSettings,
}) => {
  // Step state: 1 = File Pick, 2 = Language, 3 = Transcribing, 4 = Style Picker
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // File state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileDuration, setFileDuration] = useState<number>(0);
  const [demoType, setDemoType] = useState<'motivation' | 'podcast' | null>(null);

  // Language state
  const [selectedLang, setSelectedLang] = useState<string>(settings.defaultLanguage || 'hi');
  const [langSearch, setLangSearch] = useState<string>('');
  const [translateTarget, setTranslateTarget] = useState<string>('');
  const [enableTranslation, setEnableTranslation] = useState<boolean>(false);

  // Transcription state
  const [transcriptionStatus, setTranscriptionStatus] = useState<string>('Initializing transcription...');
  const [transcribedScenes, setTranscribedScenes] = useState<Scene[]>([]);
  const [rawText, setRawText] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [romanUrduNotice, setRomanUrduNotice] = useState<string | null>(null);

  // Style state
  const [selectedStyle, setSelectedStyle] = useState<TypographyStyle>(STYLES[0]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check mime
    const isAudioOrVideo = file.type.startsWith('audio/') || file.type.startsWith('video/') ||
      /\.(mp3|wav|ogg|m4a|mp4|mov|webm)$/i.test(file.name);

    if (!isAudioOrVideo) {
      setErrorMsg('Please select a valid audio or video file (MP3, WAV, MP4, MOV).');
      return;
    }

    setErrorMsg(null);
    setSelectedFile(file);
    setFileName(file.name);
    setDemoType(null);

    // Read duration
    const url = URL.createObjectURL(file);
    const media = file.type.startsWith('video') ? document.createElement('video') : new Audio();
    media.src = url;
    media.onloadedmetadata = () => {
      setFileDuration(media.duration || 5);
      URL.revokeObjectURL(url);
    };

    setStep(2);
  };

  const handleSelectDemo = (type: 'motivation' | 'podcast') => {
    setDemoType(type);
    setSelectedFile(null);
    setFileName(type === 'motivation' ? 'Motivation_Quote.mp3' : 'Podcast_Intro.mp3');
    setFileDuration(type === 'motivation' ? 4.6 : 4.5);
    setStep(2);
  };

  const startTranscription = async () => {
    setStep(3);
    setErrorMsg(null);
    setRomanUrduNotice(null);
    setTranscriptionStatus('Connecting to Groq Whisper Turbo...');

    try {
      let resultScenes: Scene[] = [];
      let finalRawText = '';
      let finalDuration = fileDuration || 5;

      // Handle language code for Whisper
      const isRomanUrdu = selectedLang === 'roman-urdu';
      const whisperLang = isRomanUrdu ? 'ur' : selectedLang;

      if (demoType || !settings.groqApiKey) {
        // Run realistic instant demo or fallback
        setTranscriptionStatus('Generating word-level timestamps...');
        await new Promise(r => setTimeout(r, 800));
        const demoData = GroqService.generateDemoScenes(demoType || 'motivation');
        resultScenes = demoData.scenes;
        finalRawText = demoData.rawText;
        finalDuration = demoData.duration;
      } else if (selectedFile) {
        // Real Groq Whisper call
        const res = await GroqService.transcribeAudio(
          selectedFile,
          fileName,
          settings.groqApiKey,
          whisperLang,
          (status) => setTranscriptionStatus(status)
        );
        resultScenes = res.scenes;
        finalRawText = res.rawText;
        finalDuration = res.duration || fileDuration;
      }

      // 1. Check Roman Urdu / Roman English Transliteration via Gemini
      if (isRomanUrdu) {
        if (settings.geminiApiKey) {
          setTranscriptionStatus('Transliterating into Roman Urdu / Roman English with Gemini...');
          try {
            resultScenes = await GeminiService.transliterateToRomanUrdu(
              resultScenes,
              settings.geminiApiKey
            );
          } catch (translitErr: any) {
            console.warn('Transliteration failed:', translitErr);
            setRomanUrduNotice('Transliteration note: ' + (translitErr?.message || 'Using original transcript.'));
          }
        } else {
          setRomanUrduNotice('Notice: Roman Urdu transliteration requires a free Gemini API Key. Displaying raw transcript. Add your Gemini key in Settings for automatic Roman Urdu conversion.');
        }
      }

      // 2. Check optional Gemini translation
      if (enableTranslation && translateTarget && settings.geminiApiKey && !isRomanUrdu) {
        setTranscriptionStatus(`Translating into ${translateTarget} using Gemini...`);
        try {
          resultScenes = await GeminiService.translateScenes(
            resultScenes,
            translateTarget,
            settings.geminiApiKey
          );
        } catch (transErr: any) {
          console.warn('Translation warning:', transErr);
        }
      }

      setTranscribedScenes(resultScenes);
      setRawText(finalRawText);
      setFileDuration(finalDuration);

      // Auto advance to style picker
      setTimeout(() => {
        setStep(4);
      }, 500);

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Transcription failed. Please check your Groq API key.');
    }
  };

  const handleCreateProjectWithStyle = async (style: TypographyStyle) => {
    try {
      const projectId = `proj_${Date.now()}`;
      let audioBlobKey = `audio_${projectId}`;

      // Save audio blob in IndexedDB
      if (selectedFile) {
        await StorageService.saveBlob(audioBlobKey, selectedFile);
      } else {
        // Synthetic audio blob for demo
        const dummyAudio = new Blob([new Uint8Array(1000)], { type: 'audio/mp3' });
        await StorageService.saveBlob(audioBlobKey, dummyAudio);
      }

      const newProject: Project = {
        id: projectId,
        title: fileName.replace(/\.[^/.]+$/, '') || 'Kinetic Video',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        duration: fileDuration || 5,
        audioBlobKey,
        styleId: style.id,
        scenes: transcribedScenes,
        mode,
        language: selectedLang,
        sfxEnabled: settings.sfxEnabled ?? true,
        background: {
          type: 'auto',
          value: 'auto',
        },
      };

      await StorageService.saveProject(newProject);
      onProjectCreated(newProject);
    } catch (e: any) {
      setErrorMsg(`Failed to save project: ${e.message}`);
    }
  };

  const filteredLanguages = LANGUAGES.filter(l => 
    l.name.toLowerCase().includes(langSearch.toLowerCase()) ||
    (l.nativeName && l.nativeName.toLowerCase().includes(langSearch.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-hidden">
      <div className="w-full sm:max-w-lg bg-[#0F1A16] border-0 sm:border border-white/[0.08] rounded-none sm:rounded-3xl p-4 sm:p-6 shadow-2xl h-full sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] shrink-0">
          <div className="flex items-center space-x-2">
            {step > 1 && step !== 3 && (
              <button
                onClick={() => setStep((s) => (s - 1) as any)}
                className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-gray-300"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <h2 className="text-sm sm:text-base font-heading font-bold text-white">
                {step === 1 && "Pick audio. We'll do the rest."}
                {step === 2 && 'Select Audio Language'}
                {step === 3 && 'AI Transcription & Timing'}
                {step === 4 && 'Choose Kinetic Style'}
              </h2>
              <p className="text-[10px] sm:text-[11px] text-gray-400">Step {step} of 4</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* STEP 1: PICK AUDIO OR VIDEO FILE */}
        {step === 1 && (
          <div className="flex-1 min-h-0 py-3 sm:py-4 space-y-3 sm:space-y-4 overflow-y-auto pr-1">
            {/* Drag & Drop Upload Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-8 rounded-3xl border-2 border-dashed border-[#1FD67A]/40 bg-[#0A120F] hover:bg-[#14261F]/50 hover:border-[#1FD67A] cursor-pointer flex flex-col items-center justify-center text-center transition-all group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,video/*,.mp3,.wav,.ogg,.m4a,.mp4,.mov,.webm"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1FD67A]/20 to-[#16A34A]/10 border border-[#1FD67A]/30 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-glow-sm">
                <Upload className="w-7 h-7 text-[#1FD67A]" />
              </div>

              <h3 className="text-sm font-heading font-bold text-white mb-1">
                Choose Audio or Video
              </h3>
              <p className="text-xs text-gray-400 max-w-xs">
                Supports MP3, WAV, M4A, MP4, MOV. Audio is processed with Groq Whisper word-level timestamps.
              </p>

              <button className="mt-4 px-4 py-2 rounded-xl btn-emerald text-black text-xs font-heading font-bold shadow-glow-sm">
                Browse Files
              </button>
            </div>

            {/* Instant Demo Audios */}
            <div className="pt-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2 px-1">
                Or Try Sample Clips
              </span>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => handleSelectDemo('motivation')}
                  className="p-3 rounded-2xl bg-[#0A120F] border border-white/[0.07] hover:border-[#1FD67A]/40 text-left flex items-start space-x-2.5 group transition-all"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#1FD67A]/15 text-[#1FD67A] flex items-center justify-center shrink-0">
                    <Music className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-[#1FD67A]">Motivation Quote</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">Punchy viral quote</p>
                  </div>
                </button>

                <button
                  onClick={() => handleSelectDemo('podcast')}
                  className="p-3 rounded-2xl bg-[#0A120F] border border-white/[0.07] hover:border-[#1FD67A]/40 text-left flex items-start space-x-2.5 group transition-all"
                >
                  <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center shrink-0">
                    <Video className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-[#1FD67A]">Podcast Intro</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">Catchy voice hook</p>
                  </div>
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: LANGUAGE SELECTOR */}
        {step === 2 && (
          <div className="flex-1 min-h-0 py-3 sm:py-4 space-y-3 sm:space-y-4 flex flex-col overflow-hidden">
            <div className="p-3 rounded-2xl bg-[#0A120F] border border-white/[0.06] flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#1FD67A]/15 text-[#1FD67A] flex items-center justify-center">
                  <Music className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white truncate max-w-[200px]">{fileName}</h4>
                  <p className="text-[10px] text-gray-400">{fileDuration.toFixed(1)}s duration</p>
                </div>
              </div>
              <span className="text-[11px] text-[#1FD67A] font-semibold">Selected</span>
            </div>

            {/* Search Language */}
            <div className="relative shrink-0">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={langSearch}
                onChange={(e) => setLangSearch(e.target.value)}
                placeholder="Search audio language (e.g. Roman Urdu, Hindi, English)..."
                className="w-full bg-[#0A120F] border border-white/[0.08] focus:border-[#1FD67A] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-gray-500 outline-none"
              />
            </div>

            {/* Language List */}
            <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 pr-1">
              {filteredLanguages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setSelectedLang(lang.code)}
                  className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-left transition-all ${
                    selectedLang === lang.code
                      ? 'bg-[#182C25] border-[#1FD67A] text-white shadow-glow-sm'
                      : 'bg-[#0A120F] border-white/[0.05] text-gray-300 hover:border-white/[0.15]'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="text-base">{lang.flag}</span>
                    <div>
                      <span className="text-xs font-semibold">{lang.name}</span>
                      {lang.nativeName && (
                        <span className="text-[10px] text-gray-400 ml-1.5">({lang.nativeName})</span>
                      )}
                    </div>
                  </div>
                  {selectedLang === lang.code && (
                    <div className="w-5 h-5 rounded-full bg-[#1FD67A] flex items-center justify-center text-black">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Optional Translation Toggle */}
            <div className="p-3 rounded-2xl bg-[#0A120F] border border-white/[0.06] space-y-2 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-white">Translate Video Transcript</span>
                </div>
                <input
                  type="checkbox"
                  checked={enableTranslation}
                  onChange={(e) => setEnableTranslation(e.target.checked)}
                  className="w-4 h-4 accent-[#1FD67A]"
                />
              </div>

              {enableTranslation && (
                <div className="pt-2 border-t border-white/[0.05]">
                  <p className="text-[10px] text-gray-400 mb-2">Powered by Gemini 3.8. Preserves proportional word timestamps.</p>
                  <select
                    value={translateTarget}
                    onChange={(e) => setTranslateTarget(e.target.value)}
                    className="w-full bg-[#0F1A16] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white outline-none"
                  >
                    <option value="">Select target language...</option>
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Hinglish">Hinglish (Roman English)</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                  </select>
                </div>
              )}
            </div>

            {/* Continue Button */}
            <div className="shrink-0 pt-1">
              <button
                onClick={startTranscription}
                className="w-full py-3.5 rounded-2xl btn-emerald text-black font-heading font-bold text-xs tracking-wider flex items-center justify-center space-x-2 shadow-glow-sm"
              >
                <span>Transcribe with Groq Whisper</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: TRANSCRIBING & TIMESTAMPING */}
        {step === 3 && (
          <div className="flex-1 min-h-0 py-6 sm:py-8 space-y-5 flex flex-col items-center justify-center text-center overflow-y-auto">
            {errorMsg ? (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs space-y-3">
                <div className="flex items-center justify-center space-x-2 font-bold">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>Transcription Failed</span>
                </div>
                <p>{errorMsg}</p>
                <div className="flex items-center justify-center space-x-2 pt-2">
                  <button
                    onClick={startTranscription}
                    className="px-3 py-1.5 rounded-lg bg-red-500 text-white font-bold flex items-center space-x-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retry</span>
                  </button>
                  <button
                    onClick={() => {
                      // Fallback to sample demo scenes
                      const d = GroqService.generateDemoScenes('motivation');
                      setTranscribedScenes(d.scenes);
                      setRawText(d.rawText);
                      setStep(4);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white/[0.1] text-gray-200"
                  >
                    Continue with Sample Data
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-[#1FD67A]/20"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-[#1FD67A] border-t-transparent animate-spin"></div>
                  <Sparkles className="w-8 h-8 text-[#1FD67A] animate-pulse" />
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-sm font-heading font-bold text-white tracking-wide">
                    {transcriptionStatus}
                  </h3>
                  <p className="text-xs text-gray-400">
                    Extracting high-precision word-level timestamps with Whisper Turbo...
                  </p>
                </div>

                <div className="w-full bg-[#0A120F] rounded-full h-2 overflow-hidden border border-white/[0.05]">
                  <div className="bg-gradient-to-r from-[#1FD67A] to-emerald-400 h-full w-3/4 animate-pulse"></div>
                </div>
              </>
            )}
          </div>
        )}

        {/* STEP 4: STYLE PICKER GRID */}
        {step === 4 && (
          <div className="flex-1 min-h-0 flex flex-col py-2 sm:py-3 space-y-2.5 sm:space-y-3 overflow-hidden">
            {romanUrduNotice && (
              <div className="p-2.5 sm:p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs flex items-start space-x-2 shrink-0">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span>{romanUrduNotice}</span>
                  <button
                    onClick={onOpenSettings}
                    className="text-[#1FD67A] font-bold underline ml-1.5"
                  >
                    Open Settings
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between px-1 shrink-0">
              <span className="text-xs font-semibold text-gray-300">
                {transcribedScenes.length} scenes ({transcribedScenes.reduce((acc, s) => acc + s.words.length, 0)} words)
              </span>
              <span className="text-[11px] text-[#1FD67A] font-bold">Pick Template</span>
            </div>

            {/* Template Cards Grid */}
            <div className="flex-1 min-h-0 overflow-y-auto grid grid-cols-2 gap-2 sm:gap-3 pr-1 pb-1">
              {STYLES.map((style) => {
                const isSelected = selectedStyle.id === style.id;
                return (
                  <div
                    key={style.id}
                    onClick={() => setSelectedStyle(style)}
                    className={`p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border cursor-pointer relative overflow-hidden transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#182C25] border-[#1FD67A] shadow-glow-sm'
                        : 'bg-[#0A120F] border-white/[0.07] hover:border-white/[0.2]'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between mb-1.5">
                        <span className="px-1.5 py-0.5 rounded-md bg-[#1FD67A]/20 text-[#1FD67A] text-[9px] font-bold">
                          {style.badge}
                        </span>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-[#1FD67A] flex items-center justify-center text-black">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      <h4 className="text-xs font-heading font-bold text-white truncate">{style.name}</h4>
                      <p className="text-[10px] text-gray-300 mt-0.5 line-clamp-1">{style.tagline}</p>
                    </div>

                    {/* Live Mini Preview Box */}
                    <div className="mt-2 p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-black/60 border border-white/[0.05] text-center">
                      {style.animationType === 'karaoke-fill' && (
                        <div className="text-[11px] font-extrabold flex items-center justify-center space-x-1">
                          <span className="text-white">THIS</span>
                          <span className="text-[#1FD67A] drop-shadow-[0_0_8px_#1FD67A]">VIRAL</span>
                          <span className="text-gray-500">HOOK</span>
                        </div>
                      )}
                      {style.animationType === 'viral-split' && (
                        <div className="text-[11px] font-black tracking-wider text-white">
                          SPLIT <span className="text-[#00F59B]">COLOR</span>
                        </div>
                      )}
                      {style.animationType === 'cinematic-reveal' && (
                        <div className="text-[11px] font-serif italic text-amber-300">
                          Cinematic Elegance
                        </div>
                      )}
                      {style.animationType === 'huge-punch' && (
                        <div className="text-[13px] font-black text-[#22C55E] tracking-tight">
                          MASSIVE!
                        </div>
                      )}
                      {style.animationType === 'desi-vibes' && (
                        <div className="text-[11px] font-serif font-bold text-white flex items-center justify-center space-x-1">
                          <span>Zabardast</span>
                          <span className="text-[#10B981] drop-shadow-[0_0_6px_#10B981]">✨ Desi</span>
                        </div>
                      )}
                      {style.animationType === 'trending-pk' && (
                        <div className="text-[11px] font-black text-white">
                          TRENDING <span className="bg-[#00F59B] text-black px-1.5 py-0.5 rounded text-[10px]">PK</span>
                        </div>
                      )}
                      {style.animationType === 'vlog-pop' && (
                        <div className="text-[11px] font-medium text-gray-200">
                          daily vlog <span className="text-[#34D399] font-bold">• aesthetic</span>
                        </div>
                      )}
                      {style.animationType === 'qawwali-beat' && (
                        <div className="text-[11px] font-serif italic text-amber-300 drop-shadow-[0_0_8px_#F59E0B]">
                          Sufi Beat ♫ Rhythmic
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Create With Button */}
            <div className="shrink-0 pt-2 border-t border-white/[0.04]">
              <button
                onClick={() => handleCreateProjectWithStyle(selectedStyle)}
                className="w-full py-3.5 rounded-xl sm:rounded-2xl btn-emerald text-black font-heading font-bold text-xs tracking-wider flex items-center justify-center space-x-2 shadow-glow-sm"
              >
                <Sparkles className="w-4 h-4 fill-black" />
                <span>Create with {selectedStyle.name}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
