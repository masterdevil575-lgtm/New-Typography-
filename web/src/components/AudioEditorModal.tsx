import React, { useState, useRef } from 'react';
import { Volume2, Scissors, Play, Pause, Upload, Check, X, ShieldAlert } from 'lucide-react';
import { extractAudioPeaks } from '../services/audioWaveform';
import { StorageService } from '../services/storageService';

interface AudioEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAudioTrimmed?: (trimmedBlob: Blob, filename: string) => void;
}

export const AudioEditorModal: React.FC<AudioEditorModalProps> = ({
  isOpen,
  onClose,
  onAudioTrimmed,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(10);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(10);
  const [volume, setVolume] = useState<number>(1.0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [peaks, setPeaks] = useState<number[]>([]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    const url = URL.createObjectURL(selected);
    setAudioUrl(url);

    const audio = new Audio(url);
    audioRef.current = audio;

    audio.onloadedmetadata = async () => {
      const dur = audio.duration || 10;
      setDuration(dur);
      setStartTime(0);
      setEndTime(dur);
      const extracted = await extractAudioPeaks(selected);
      setPeaks(extracted);
    };

    audio.ontimeupdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.currentTime >= endTime) {
        audio.pause();
        audio.currentTime = startTime;
        setIsPlaying(false);
      }
    };

    audio.onended = () => setIsPlaying(false);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.currentTime = startTime;
      audioRef.current.volume = Math.min(1, volume);
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleApply = () => {
    if (!file) return;
    // Notify parent or save
    onAudioTrimmed?.(file, file.name);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-md bg-[#0F1A16] border border-white/[0.08] rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-[#14261F] text-[#1FD67A] flex items-center justify-center">
              <Scissors className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-heading font-bold text-white">Audio Editor</h3>
              <p className="text-[11px] text-gray-400">Trim & boost speech volume</p>
            </div>
          </div>

          <button
            onClick={() => {
              if (audioRef.current) audioRef.current.pause();
              onClose();
            }}
            className="w-7 h-7 rounded-full bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-gray-400"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {!file ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="p-8 rounded-2xl border-2 border-dashed border-[#1FD67A]/40 bg-[#0A120F] text-center cursor-pointer hover:border-[#1FD67A] transition-all"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFile}
              className="hidden"
            />
            <Upload className="w-8 h-8 text-[#1FD67A] mx-auto mb-2" />
            <h4 className="text-xs font-bold text-white">Select Audio to Edit</h4>
            <p className="text-[10px] text-gray-400 mt-1">MP3, WAV, M4A, AAC</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-3 rounded-2xl bg-[#0A120F] border border-white/[0.06] flex items-center justify-between">
              <span className="text-xs font-bold text-white truncate max-w-[200px]">{file.name}</span>
              <button
                onClick={togglePlay}
                className="w-8 h-8 rounded-xl btn-emerald flex items-center justify-center text-black"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black ml-0.5" />}
              </button>
            </div>

            {/* Waveform with Trim Markers */}
            <div className="h-12 bg-[#0A120F] rounded-2xl border border-white/[0.06] flex items-center px-3 space-x-[2px]">
              {peaks.map((p, i) => (
                <div
                  key={i}
                  className="flex-1 bg-[#1FD67A] rounded-full"
                  style={{ height: `${p * 100}%` }}
                />
              ))}
            </div>

            {/* Start and End Trim Sliders */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-gray-400 font-semibold uppercase">Start Trim</span>
                <input
                  type="range"
                  min="0"
                  max={duration}
                  step="0.1"
                  value={startTime}
                  onChange={(e) => setStartTime(Math.min(parseFloat(e.target.value), endTime - 0.5))}
                  className="w-full accent-[#1FD67A]"
                />
                <span className="text-xs font-mono text-[#1FD67A]">{startTime.toFixed(1)}s</span>
              </div>

              <div>
                <span className="text-[10px] text-gray-400 font-semibold uppercase">End Trim</span>
                <input
                  type="range"
                  min="0"
                  max={duration}
                  step="0.1"
                  value={endTime}
                  onChange={(e) => setEndTime(Math.max(parseFloat(e.target.value), startTime + 0.5))}
                  className="w-full accent-[#1FD67A]"
                />
                <span className="text-xs font-mono text-[#1FD67A]">{endTime.toFixed(1)}s</span>
              </div>
            </div>

            {/* Volume Boost Slider */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-gray-400 font-semibold uppercase flex items-center space-x-1">
                  <Volume2 className="w-3 h-3" />
                  <span>Speech Volume Boost</span>
                </span>
                <span className="text-xs font-bold text-[#1FD67A]">{Math.round(volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full accent-[#1FD67A]"
              />
            </div>

            <button
              onClick={handleApply}
              className="w-full py-3 rounded-2xl btn-emerald text-black font-heading font-bold text-xs flex items-center justify-center space-x-1.5 shadow-glow-sm"
            >
              <Check className="w-4 h-4" />
              <span>Apply Audio Adjustments</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
