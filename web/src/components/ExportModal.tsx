import React, { useState } from 'react';
import { 
  Download, Share2, Sparkles, CheckCircle2, AlertCircle, RefreshCw, X, Play, Film, ShieldCheck
} from 'lucide-react';
import { Scene, TypographyStyle, ProjectBackground } from '../types';
import { ExportService, ExportProgress } from '../services/exportService';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenes: Scene[];
  style: TypographyStyle;
  background: ProjectBackground;
  audioBlob: Blob | null;
  duration: number;
  sfxEnabled?: boolean;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  scenes,
  style,
  background,
  audioBlob,
  duration,
  sfxEnabled = true,
}) => {
  const [resolution, setResolution] = useState<'720p' | '1080p'>('1080p');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [progress, setProgress] = useState<ExportProgress | null>(null);
  const [exportedBlob, setExportedBlob] = useState<Blob | null>(null);
  const [exportedUrl, setExportedUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartExport = async () => {
    if (!audioBlob) {
      setErrorMsg('No audio file found for this project.');
      return;
    }

    setIsExporting(true);
    setErrorMsg(null);
    setProgress({
      progress: 0,
      currentSecond: 0,
      totalDuration: duration,
      estimatedRemainingSecs: Math.round(duration),
      statusText: 'Initializing video encoder...',
    });

    try {
      const blob = await ExportService.exportVideo(
        scenes,
        style,
        background,
        audioBlob,
        duration,
        resolution,
        sfxEnabled,
        (p) => setProgress(p)
      );

      const url = URL.createObjectURL(blob);
      setExportedBlob(blob);
      setExportedUrl(url);
      setIsExporting(false);
    } catch (err: any) {
      console.error(err);
      setIsExporting(false);
      const friendlyMsg = err?.message?.includes('memory') 
        ? 'Device memory limit reached while encoding. Try 720p resolution.'
        : err?.message || 'Video encoding failed. Please try again with 720p.';
      setErrorMsg(friendlyMsg);
    }
  };

  const handleSaveToDevice = () => {
    if (!exportedBlob) return;
    ExportService.saveVideoToDevice(exportedBlob, `NextGen_${style.name.replace(/\s+/g, '_')}.mp4`);
  };

  const handleShare = async () => {
    if (!exportedBlob) return;
    await ExportService.shareVideo(exportedBlob, `NextGen_${style.name.replace(/\s+/g, '_')}.mp4`);
  };

  const resetExport = () => {
    if (exportedUrl) URL.revokeObjectURL(exportedUrl);
    setExportedBlob(null);
    setExportedUrl(null);
    setErrorMsg(null);
    setIsExporting(false);
    setProgress(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-md bg-[#0F1A16] border border-white/[0.08] rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#1FD67A] to-[#16A34A] flex items-center justify-center">
              <Film className="w-4 h-4 text-black" />
            </div>
            <div>
              <h3 className="text-sm font-heading font-bold text-white">Export Kinetic Video</h3>
              <p className="text-[11px] text-gray-400">9:16 Vertical Reel Format</p>
            </div>
          </div>

          <button
            onClick={() => {
              resetExport();
              onClose();
            }}
            className="w-7 h-7 rounded-full bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-gray-400"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 1. SETUP / RESOLUTION STAGE */}
        {!isExporting && !exportedBlob && !errorMsg && (
          <div className="space-y-4 py-2">
            <div>
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide block mb-2">
                Export Resolution
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => setResolution('1080p')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    resolution === '1080p'
                      ? 'bg-[#182C25] border-[#1FD67A] text-white shadow-glow-sm'
                      : 'bg-[#0A120F] border-white/[0.07] text-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">1080p Full HD</span>
                    {resolution === '1080p' && <span className="w-2 h-2 rounded-full bg-[#1FD67A]"></span>}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5">1080 × 1920 (Best for TikTok/Reels)</p>
                </button>

                <button
                  onClick={() => setResolution('720p')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    resolution === '720p'
                      ? 'bg-[#182C25] border-[#1FD67A] text-white shadow-glow-sm'
                      : 'bg-[#0A120F] border-white/[0.07] text-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">720p HD</span>
                    {resolution === '720p' && <span className="w-2 h-2 rounded-full bg-[#1FD67A]"></span>}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5">720 × 1280 (Fast export)</p>
                </button>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#0A120F] border border-white/[0.06] flex items-center justify-between text-xs text-gray-300">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-[#1FD67A] shrink-0" />
                <span>Audio & kinetic composite at 30 FPS</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sfxEnabled ? 'bg-[#1FD67A]/20 text-[#1FD67A]' : 'bg-white/[0.08] text-gray-400'}`}>
                {sfxEnabled ? 'SFX Audio Mixed' : 'SFX Disabled'}
              </span>
            </div>

            <button
              onClick={handleStartExport}
              className="w-full py-3.5 rounded-2xl btn-emerald text-black font-heading font-bold text-xs tracking-wider flex items-center justify-center space-x-2 shadow-glow-sm"
            >
              <Sparkles className="w-4 h-4 fill-black" />
              <span>Render & Export Video</span>
            </button>
          </div>
        )}

        {/* 2. RENDERING PROGRESS STAGE */}
        {isExporting && progress && (
          <div className="py-6 space-y-4 text-center">
            <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-[#1FD67A]/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-[#1FD67A] border-t-transparent animate-spin"></div>
              <span className="text-xs font-bold text-white">{progress.progress}%</span>
            </div>

            <div>
              <h4 className="text-sm font-heading font-bold text-white">Rendering Kinetic Video</h4>
              <p className="text-xs text-gray-400 mt-1">{progress.statusText}</p>
              <p className="text-[11px] text-[#1FD67A] font-semibold mt-1">
                Estimated time remaining: {progress.estimatedRemainingSecs}s
              </p>
            </div>

            <div className="w-full bg-[#0A120F] rounded-full h-2.5 overflow-hidden border border-white/[0.07]">
              <div
                className="bg-gradient-to-r from-[#1FD67A] to-emerald-400 h-full transition-all duration-200"
                style={{ width: `${progress.progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* 3. EXPORT SUCCESS STAGE */}
        {!isExporting && exportedBlob && exportedUrl && (
          <div className="py-2 space-y-4">
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span className="font-semibold">Video rendered successfully!</span>
            </div>

            {/* Video Preview */}
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-[9/14] max-h-56 mx-auto border border-white/[0.1]">
              <video
                src={exportedUrl}
                controls
                autoPlay
                loop
                playsInline
                className="w-full h-full object-contain"
              />
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={handleSaveToDevice}
                className="py-3 rounded-2xl btn-emerald text-black font-heading font-bold text-xs flex items-center justify-center space-x-2 shadow-glow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Save to Device</span>
              </button>

              <button
                onClick={handleShare}
                className="py-3 rounded-2xl bg-[#0A120F] border border-white/[0.1] hover:border-[#1FD67A]/50 text-white font-heading font-bold text-xs flex items-center justify-center space-x-2"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Video</span>
              </button>
            </div>
          </div>
        )}

        {/* 4. ERROR STAGE */}
        {errorMsg && (
          <div className="py-4 space-y-4 text-center">
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs space-y-2">
              <div className="flex items-center justify-center space-x-2 font-bold">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>Export Failed</span>
              </div>
              <p>{errorMsg}</p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setResolution('720p');
                  handleStartExport();
                }}
                className="flex-1 py-3 rounded-2xl bg-[#182C25] border border-[#1FD67A] text-[#1FD67A] font-bold text-xs flex items-center justify-center space-x-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry in 720p HD</span>
              </button>
              <button
                onClick={resetExport}
                className="px-4 py-3 rounded-2xl bg-white/[0.05] text-xs text-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
