import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, RotateCcw, RotateCw, Undo, Redo, Share2, Download, 
  Palette, Sliders, ArrowLeft, Plus, Scissors, Layers, Check, Sparkles, Film,
  Volume2, VolumeX
} from 'lucide-react';
import { Project, Scene, WordItem, TypographyStyle, ProjectBackground } from '../types';
import { KineticRenderer, STYLES } from '../services/kineticRenderer';
import { StorageService } from '../services/storageService';
import { extractAudioPeaks } from '../services/audioWaveform';
import { SFXService } from '../services/sfxService';
import { WordEditorModal } from './WordEditorModal';
import { BackgroundPickerModal } from './BackgroundPickerModal';
import { ExportModal } from './ExportModal';

interface EditorScreenProps {
  project: Project;
  onCloseEditor: () => void;
  onSaveProject: (updated: Project) => void;
}

export const EditorScreen: React.FC<EditorScreenProps> = ({
  project,
  onCloseEditor,
  onSaveProject,
}) => {
  // Current project state
  const [scenes, setScenes] = useState<Scene[]>(project.scenes || []);
  const [styleId, setStyleId] = useState<string>(project.styleId || STYLES[0].id);
  const [background, setBackground] = useState<ProjectBackground>(project.background || { type: 'auto', value: 'auto' });
  const [duration, setDuration] = useState<number>(project.duration || 5);
  const [title, setTitle] = useState<string>(project.title);
  const [sfxEnabled, setSfxEnabled] = useState<boolean>(project.sfxEnabled ?? StorageService.getSettings().sfxEnabled ?? true);

  // Undo/Redo history stack
  const [history, setHistory] = useState<Scene[][]>([project.scenes || []]);
  const [historyIdx, setHistoryIdx] = useState<number>(0);

  // Playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [audioPeaks, setAudioPeaks] = useState<number[]>([]);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  // Modals
  const [editingWord, setEditingWord] = useState<WordItem | null>(null);
  const [isBgPickerOpen, setIsBgPickerOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isCloseConfirmOpen, setIsCloseConfirmOpen] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // Canvas and audio references
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const currentStyle = STYLES.find(s => s.id === styleId) || STYLES[0];

  // 1. Load Audio Blob from IndexedDB
  useEffect(() => {
    let audioUrl = '';
    async function loadAudio() {
      if (project.audioBlobKey) {
        const blob = await StorageService.getBlob(project.audioBlobKey);
        if (blob) {
          setAudioBlob(blob);
          audioUrl = URL.createObjectURL(blob);
          const audio = new Audio(audioUrl);
          audioRef.current = audio;

          audio.onloadedmetadata = () => {
            if (audio.duration && !isNaN(audio.duration)) {
              setDuration(audio.duration);
            }
          };

          audio.ontimeupdate = () => {
            setCurrentTime(audio.currentTime);
          };

          audio.onended = () => {
            setIsPlaying(false);
          };

          // Extract audio waveform peaks
          const peaks = await extractAudioPeaks(blob);
          setAudioPeaks(peaks);
        }
      }
    }
    loadAudio();

    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [project.audioBlobKey]);

  // 2. Play / Pause logic
  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      SFXService.resetPlayback();
    } else {
      if (currentTime >= duration) {
        if (audioRef.current) audioRef.current.currentTime = 0;
        setCurrentTime(0);
      }
      SFXService.resetPlayback();
      audioRef.current?.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const seekTo = (time: number) => {
    const clamped = Math.max(0, Math.min(duration, time));
    if (audioRef.current) {
      audioRef.current.currentTime = clamped;
    }
    setCurrentTime(clamped);
    SFXService.resetPlayback();
  };

  // 3. 60 FPS Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const cur = audioRef.current ? audioRef.current.currentTime : currentTime;
      KineticRenderer.renderFrame(ctx, canvas.width, canvas.height, cur, scenes, currentStyle, background);

      // Trigger synchronized SFX during active playback
      if (isPlaying) {
        SFXService.triggerLivePlaybackSfx(cur, scenes, currentStyle, sfxEnabled);
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [currentTime, scenes, currentStyle, background, isPlaying, sfxEnabled]);

  // 4. History Undo / Redo
  const pushHistory = (newScenes: Scene[]) => {
    const newHist = history.slice(0, historyIdx + 1);
    newHist.push(newScenes);
    setHistory(newHist);
    setHistoryIdx(newHist.length - 1);
    setScenes(newScenes);
    setHasUnsavedChanges(true);
  };

  const handleUndo = () => {
    if (historyIdx > 0) {
      const newIdx = historyIdx - 1;
      setHistoryIdx(newIdx);
      setScenes(history[newIdx]);
    }
  };

  const handleRedo = () => {
    if (historyIdx < history.length - 1) {
      const newIdx = historyIdx + 1;
      setHistoryIdx(newIdx);
      setScenes(history[newIdx]);
    }
  };

  // 5. Update word
  const handleUpdateWord = (updatedWord: WordItem) => {
    const newScenes = scenes.map(s => ({
      ...s,
      words: s.words.map(w => w.id === updatedWord.id ? updatedWord : w),
    }));
    pushHistory(newScenes);
  };

  const handleDeleteWord = (wordId: string) => {
    const newScenes = scenes.map(s => ({
      ...s,
      words: s.words.filter(w => w.id !== wordId),
    })).filter(s => s.words.length > 0);
    pushHistory(newScenes);
    setEditingWord(null);
  };

  // 6. Split Scene at current time
  const handleSplitScene = () => {
    const cur = currentTime;
    const sceneToSplit = scenes.find(s => cur >= s.startTime && cur <= s.endTime);
    if (!sceneToSplit || sceneToSplit.words.length <= 1) return;

    const beforeWords = sceneToSplit.words.filter(w => w.end <= cur);
    const afterWords = sceneToSplit.words.filter(w => w.end > cur);

    if (beforeWords.length === 0 || afterWords.length === 0) return;

    const sceneA: Scene = {
      id: `${sceneToSplit.id}_a`,
      startTime: beforeWords[0].start,
      endTime: beforeWords[beforeWords.length - 1].end,
      words: beforeWords,
    };

    const sceneB: Scene = {
      id: `${sceneToSplit.id}_b`,
      startTime: afterWords[0].start,
      endTime: afterWords[afterWords.length - 1].end,
      words: afterWords,
    };

    const updated = scenes.flatMap(s => s.id === sceneToSplit.id ? [sceneA, sceneB] : [s]);
    pushHistory(updated);
  };

  const toggleSfx = () => {
    const next = !sfxEnabled;
    setSfxEnabled(next);
    StorageService.saveSettings({ sfxEnabled: next });
    setHasUnsavedChanges(true);
    if (next) {
      SFXService.playPop();
    }
  };

  // Save changes
  const saveCurrentProject = async () => {
    const updated: Project = {
      ...project,
      title,
      scenes,
      styleId,
      background,
      duration,
      sfxEnabled,
      updatedAt: Date.now(),
    };
    await StorageService.saveProject(updated);
    onSaveProject(updated);
    setHasUnsavedChanges(false);
  };

  const handleBackPress = () => {
    if (hasUnsavedChanges) {
      setIsCloseConfirmOpen(true);
    } else {
      onCloseEditor();
    }
  };

  // Format time (0:17 / 2:17)
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0A120F] flex flex-col overflow-hidden text-white select-none">
      {/* TOP BAR */}
      <header className="px-4 py-2.5 bg-[#0F1A16] border-b border-white/[0.07] flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2">
          <button
            onClick={handleBackPress}
            className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-gray-300"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setHasUnsavedChanges(true);
            }}
            className="bg-transparent border-b border-transparent focus:border-[#1FD67A] text-xs font-bold text-white max-w-[150px] outline-none"
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {/* SFX Quick Toggle */}
          <button
            onClick={toggleSfx}
            className={`px-2.5 py-1.5 rounded-xl border flex items-center space-x-1 text-xs font-bold transition-all ${
              sfxEnabled
                ? 'bg-[#182C25] border-[#1FD67A] text-[#1FD67A] shadow-glow-sm'
                : 'bg-white/[0.04] border-white/[0.08] text-gray-400'
            }`}
            title="Toggle Sound Effects (Whoosh & Pops)"
          >
            {sfxEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="text-[11px]">{sfxEnabled ? 'SFX ON' : 'SFX OFF'}</span>
          </button>

          {/* Undo / Redo */}
          <button
            onClick={handleUndo}
            disabled={historyIdx <= 0}
            className="w-7 h-7 rounded-lg bg-white/[0.04] flex items-center justify-center text-gray-400 disabled:opacity-30"
            title="Undo"
          >
            <Undo className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIdx >= history.length - 1}
            className="w-7 h-7 rounded-lg bg-white/[0.04] flex items-center justify-center text-gray-400 disabled:opacity-30"
            title="Redo"
          >
            <Redo className="w-3.5 h-3.5" />
          </button>

          {/* Export Button */}
          <button
            onClick={() => setIsExportOpen(true)}
            className="px-3 py-1.5 rounded-xl btn-emerald text-black text-xs font-heading font-bold flex items-center space-x-1 shadow-glow-sm"
          >
            <Film className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </header>

      {/* MIDDLE: PREVIEW CANVAS (9:16 vertical phone aspect ratio) */}
      <div className="flex-1 min-h-0 flex items-center justify-center p-2 relative bg-black/40">
        <div className="relative aspect-[9/16] h-full max-h-[460px] rounded-3xl overflow-hidden border border-white/[0.1] shadow-2xl bg-[#0A120F] flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={720}
            height={1280}
            className="w-full h-full object-contain"
          />

          {/* Floating Canvas Controls */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
            {/* Background Picker button */}
            <button
              onClick={() => setIsBgPickerOpen(true)}
              className="pointer-events-auto px-2.5 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/[0.1] text-xs font-medium text-gray-200 flex items-center space-x-1 hover:border-[#1FD67A]/50"
            >
              <Palette className="w-3.5 h-3.5 text-[#1FD67A]" />
              <span>BG</span>
            </button>

            {/* Current Style Switcher */}
            <select
              value={styleId}
              onChange={(e) => {
                setStyleId(e.target.value);
                setHasUnsavedChanges(true);
              }}
              className="pointer-events-auto bg-black/60 backdrop-blur-md border border-white/[0.1] text-xs font-bold text-white rounded-xl px-2.5 py-1.5 outline-none"
            >
              {STYLES.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: CONTROLS, AUDIO WAVEFORM & SCENE TIMELINE */}
      <div className="bg-[#0F1A16] border-t border-white/[0.08] p-3 space-y-2.5 shrink-0">
        {/* Playhead, Time Display & Play/Pause Controls */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center space-x-2">
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-2xl btn-emerald flex items-center justify-center text-black shadow-glow-sm active:scale-95 transition-transform"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-black" /> : <Play className="w-5 h-5 fill-black ml-0.5" />}
            </button>

            <button
              onClick={() => seekTo(currentTime - 2)}
              className="w-7 h-7 rounded-lg bg-white/[0.05] flex items-center justify-center text-gray-300"
              title="Back 2s"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => seekTo(currentTime + 2)}
              className="w-7 h-7 rounded-lg bg-white/[0.05] flex items-center justify-center text-gray-300"
              title="Forward 2s"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Time Display */}
          <div className="text-xs font-mono font-semibold text-gray-300 bg-[#0A120F] px-2.5 py-1 rounded-lg border border-white/[0.06]">
            <span className="text-[#1FD67A]">{formatTime(currentTime)}</span>
            <span className="text-gray-500"> / </span>
            <span>{formatTime(duration)}</span>
          </div>

          {/* Scene Split Tool */}
          <button
            onClick={handleSplitScene}
            className="px-2.5 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-xs font-semibold text-gray-300 flex items-center space-x-1"
          >
            <Scissors className="w-3.5 h-3.5 text-[#1FD67A]" />
            <span>Split Scene</span>
          </button>
        </div>

        {/* Audio Waveform Scrubber */}
        <div
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickRatio = (e.clientX - rect.left) / rect.width;
            seekTo(clickRatio * duration);
          }}
          className="relative h-11 bg-[#0A120F] rounded-2xl border border-white/[0.06] overflow-hidden cursor-pointer flex items-center px-2"
        >
          {/* Waveform Bars */}
          <div className="w-full h-7 flex items-center justify-between space-x-[2px] opacity-75">
            {audioPeaks.length > 0 ? (
              audioPeaks.map((peak, idx) => {
                const barRatio = idx / audioPeaks.length;
                const isPassed = (barRatio * duration) <= currentTime;
                return (
                  <div
                    key={idx}
                    className={`flex-1 rounded-full transition-all duration-75 ${
                      isPassed ? 'bg-[#1FD67A]' : 'bg-gray-600'
                    }`}
                    style={{ height: `${Math.max(15, peak * 100)}%` }}
                  />
                );
              })
            ) : (
              <div className="text-[10px] text-gray-500 mx-auto">Audio Waveform Loading...</div>
            )}
          </div>

          {/* Scrubber Playhead Line */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_8px_#ffffff] z-10 pointer-events-none"
            style={{ left: `${Math.min(100, (currentTime / Math.max(0.1, duration)) * 100)}%` }}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-white -ml-1 -mt-0.5 shadow-glow-sm"></div>
          </div>
        </div>

        {/* SCENE-BASED TIMELINE & WORD CLIPS */}
        <div
          ref={timelineRef}
          className="max-h-32 overflow-y-auto space-y-2 pr-1 no-scrollbar"
        >
          {scenes.map((scene, sIdx) => {
            const isCurrentScene = currentTime >= scene.startTime && currentTime <= scene.endTime;
            return (
              <div
                key={scene.id}
                className={`p-2 rounded-2xl border transition-all ${
                  isCurrentScene
                    ? 'bg-[#14261F] border-[#1FD67A]/60 shadow-glow-sm'
                    : 'bg-[#0A120F] border-white/[0.06]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5 text-[10px] text-gray-400 px-1">
                  <span className="font-bold text-[#1FD67A]">Scene {sIdx + 1}</span>
                  <span>{scene.startTime.toFixed(1)}s - {scene.endTime.toFixed(1)}s</span>
                </div>

                {/* Word Chips */}
                <div className="flex flex-wrap gap-1.5">
                  {scene.words.map((word) => {
                    const isSpoken = currentTime >= word.start && currentTime <= word.end;
                    return (
                      <button
                        key={word.id}
                        onClick={() => setEditingWord(word)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                          isSpoken
                            ? 'bg-[#1FD67A] text-black shadow-glow-sm'
                            : 'bg-[#182C25] text-gray-200 border border-white/[0.08] hover:border-[#1FD67A]/40'
                        }`}
                      >
                        <span>{word.word}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* WORD EDITOR BOTTOM SHEET */}
      <WordEditorModal
        word={editingWord}
        isOpen={Boolean(editingWord)}
        onClose={() => setEditingWord(null)}
        onSave={handleUpdateWord}
        onDelete={handleDeleteWord}
      />

      {/* BACKGROUND PICKER BOTTOM SHEET */}
      <BackgroundPickerModal
        currentBackground={background}
        isOpen={isBgPickerOpen}
        onClose={() => setIsBgPickerOpen(false)}
        onSelect={(bg) => {
          setBackground(bg);
          setHasUnsavedChanges(true);
        }}
        onUploadMedia={async (file) => {
          const key = `bg_${Date.now()}`;
          await StorageService.saveBlob(key, file);
          setBackground({
            type: 'media',
            value: file.name,
            mediaBlobKey: key,
            mediaType: file.type.startsWith('video') ? 'video' : 'image',
          });
          setHasUnsavedChanges(true);
        }}
      />

      {/* EXPORT MODAL */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        scenes={scenes}
        style={currentStyle}
        background={background}
        audioBlob={audioBlob}
        duration={duration}
        sfxEnabled={sfxEnabled}
      />

      {/* "CLOSE EDITOR?" CONFIRMATION SHEET */}
      {isCloseConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-[#0F1A16] border border-white/[0.1] rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-3">
            <h3 className="text-base font-heading font-bold text-white">Close Editor?</h3>
            <p className="text-xs text-gray-400">
              You have unsaved changes. Do you want to save before leaving?
            </p>

            <div className="space-y-2 pt-2">
              <button
                onClick={async () => {
                  await saveCurrentProject();
                  setIsCloseConfirmOpen(false);
                  onCloseEditor();
                }}
                className="w-full py-3 rounded-2xl btn-emerald text-black font-heading font-bold text-xs shadow-glow-sm"
              >
                Save & Close
              </button>

              <button
                onClick={() => setIsCloseConfirmOpen(false)}
                className="w-full py-2.5 rounded-xl bg-white/[0.06] text-xs font-semibold text-gray-300"
              >
                Keep Editing
              </button>

              <button
                onClick={() => {
                  setIsCloseConfirmOpen(false);
                  onCloseEditor();
                }}
                className="w-full py-2 rounded-xl text-xs text-red-400 hover:text-red-300"
              >
                Discard Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
