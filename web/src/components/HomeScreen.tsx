import React from 'react';
import { Sparkles, Subtitles, Volume2, Wand2, ArrowRight, Play, Clock, Flame, Zap } from 'lucide-react';
import { Project } from '../types';

interface HomeScreenProps {
  onStartKinetic: () => void;
  onStartAutoCaptions: () => void;
  onOpenAudioEditor: () => void;
  onOpenProjects: () => void;
  onOpenProject: (projectId: string) => void;
  onTryDemoAudio: (type: 'motivation' | 'podcast') => void;
  recentProjects: Project[];
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onStartKinetic,
  onStartAutoCaptions,
  onOpenAudioEditor,
  onOpenProjects,
  onOpenProject,
  onTryDemoAudio,
  recentProjects,
}) => {
  return (
    <div className="pb-28 pt-2 px-4 max-w-md mx-auto space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl p-5 bg-gradient-to-br from-[#0F291E] via-[#0F1A16] to-[#0A120F] border border-[#1FD67A]/25 shadow-glow-sm">
        <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-[#1FD67A]/15 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-[#1FD67A]/15 border border-[#1FD67A]/30 text-[#1FD67A] text-[11px] font-bold mb-3">
            <Flame className="w-3.5 h-3.5 fill-[#1FD67A]" />
            <span>AI MOTION STUDIO</span>
          </div>

          <h1 className="text-2xl font-heading font-black text-white tracking-tight leading-tight">
            Turn Any Audio Into <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1FD67A] via-[#6EE7B7] to-emerald-400">
              Viral Kinetic Text
            </span>
          </h1>

          <p className="text-xs text-gray-300 mt-2 leading-relaxed max-w-[90%]">
            Ultra-fast word-level timestamps powered by Groq Whisper Turbo. Perfect for Reels, Shorts & TikTok.
          </p>

          <div className="mt-4 flex items-center space-x-2">
            <button
              onClick={onStartKinetic}
              className="px-4 py-2.5 rounded-xl btn-emerald text-black text-xs font-heading font-bold flex items-center space-x-1.5"
            >
              <Zap className="w-4 h-4 fill-black" />
              <span>Create Now</span>
            </button>
            <button
              onClick={() => onTryDemoAudio('motivation')}
              className="px-3 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-gray-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Try Demo</span>
            </button>
          </div>
        </div>
      </div>

      {/* TWO PRIMARY TOOL CARDS */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-heading font-bold text-white tracking-wide uppercase">Core Tools</h2>
          <span className="text-[11px] text-[#1FD67A] font-semibold">Ready to Use</span>
        </div>

        <div className="grid grid-cols-1 gap-3.5">
          {/* Card 1: Kinetic Typography */}
          <div className="glass-card rounded-2xl p-4.5 border border-white/[0.08] hover:border-[#1FD67A]/50 transition-all duration-300 relative overflow-hidden group">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1FD67A] to-[#16A34A] flex items-center justify-center shadow-glow-sm shrink-0">
                  <Sparkles className="w-6 h-6 text-black" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-heading font-bold text-white tracking-tight">Kinetic Typography</h3>
                    <span className="px-2 py-0.5 rounded-md bg-[#1FD67A]/20 text-[#1FD67A] text-[10px] font-bold">VIRAL</span>
                  </div>
                  <p className="text-xs text-gray-300 mt-1">Get Viral Animated Text Videos</p>
                  <div className="mt-2 flex items-center space-x-3 text-[11px] text-gray-400">
                    <span className="flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1FD67A]"></span>
                      <span>Karaoke Highlights</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      <span>Viral Split</span>
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={onStartKinetic}
                className="mt-1 px-4 py-2 rounded-xl btn-emerald text-black text-xs font-heading font-bold flex items-center space-x-1 shadow-glow-sm group-hover:scale-105 transition-transform"
              >
                <span>Start</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 2: Auto Captions */}
          <div className="glass-card rounded-2xl p-4.5 border border-white/[0.08] hover:border-[#1FD67A]/50 transition-all duration-300 relative overflow-hidden group">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#14261F] border border-[#1FD67A]/30 flex items-center justify-center shrink-0">
                  <Subtitles className="w-6 h-6 text-[#1FD67A]" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-heading font-bold text-white tracking-tight">Auto Captions</h3>
                    <span className="px-2 py-0.5 rounded-md bg-white/[0.08] text-gray-300 text-[10px] font-medium">CLEAN</span>
                  </div>
                  <p className="text-xs text-gray-300 mt-1">Get Premium Captions In a Single Click</p>
                  <p className="text-[11px] text-gray-400 mt-1.5">Subtitle burning with custom fonts & position</p>
                </div>
              </div>

              <button
                onClick={onStartAutoCaptions}
                className="mt-1 px-4 py-2 rounded-xl bg-[#0A120F] border border-[#1FD67A]/40 text-[#1FD67A] hover:bg-[#1FD67A] hover:text-black text-xs font-heading font-bold flex items-center space-x-1 transition-all"
              >
                <span>Caption</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECONDARY TOOL CARDS */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-heading font-bold text-white tracking-wide uppercase">Audio & Video Tools</h2>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Audio Editor */}
          <button
            onClick={onOpenAudioEditor}
            className="text-left p-4 rounded-2xl bg-[#0F1A16] border border-white/[0.07] hover:border-[#1FD67A]/30 active:scale-95 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#182C25] flex items-center justify-center text-[#1FD67A] mb-3 group-hover:bg-[#1FD67A] group-hover:text-black transition-colors">
              <Volume2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-heading font-bold text-white">Audio Editor</h4>
            <p className="text-[11px] text-gray-400 mt-1">Trim audio, adjust gain & volume boost</p>
          </button>

          {/* BG Remover (PRO / Coming Soon) */}
          <div className="relative text-left p-4 rounded-2xl bg-[#0F1A16] border border-white/[0.07] opacity-80 overflow-hidden">
            <div className="absolute top-3 right-3 px-1.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[9px] font-bold">
              PRO
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-950/40 text-purple-400 flex items-center justify-center mb-3">
              <Wand2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-heading font-bold text-white">BG Remover</h4>
            <p className="text-[11px] text-gray-400 mt-1">AI background cutout (Coming soon)</p>
          </div>
        </div>
      </div>

      {/* RECENT PROJECTS / SAVED */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-heading font-bold text-white tracking-wide uppercase">Recent Projects</h2>
          {recentProjects.length > 0 && (
            <button
              onClick={onOpenProjects}
              className="text-xs text-[#1FD67A] hover:underline font-medium"
            >
              See all ({recentProjects.length})
            </button>
          )}
        </div>

        {recentProjects.length === 0 ? (
          <div className="p-5 rounded-2xl bg-[#0F1A16] border border-white/[0.06] text-center">
            <p className="text-xs text-gray-400">No projects yet. Tap Create to make your first kinetic video!</p>
            <div className="mt-3 flex items-center justify-center space-x-2">
              <button
                onClick={() => onTryDemoAudio('motivation')}
                className="px-3 py-1.5 rounded-lg bg-[#182C25] text-[#1FD67A] text-xs font-medium hover:bg-[#1FD67A] hover:text-black transition-colors"
              >
                Load Motivation Demo
              </button>
              <button
                onClick={() => onTryDemoAudio('podcast')}
                className="px-3 py-1.5 rounded-lg bg-white/[0.05] text-gray-300 text-xs font-medium hover:bg-white/[0.1] transition-colors"
              >
                Load Podcast Demo
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {recentProjects.slice(0, 3).map((proj) => (
              <div
                key={proj.id}
                onClick={() => onOpenProject(proj.id)}
                className="p-3.5 rounded-2xl bg-[#0F1A16] border border-white/[0.07] hover:border-[#1FD67A]/40 flex items-center justify-between cursor-pointer active:scale-98 transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#182C25] to-[#0A120F] border border-white/[0.08] flex items-center justify-center text-[#1FD67A] font-bold text-xs">
                    {proj.mode === 'autocaptions' ? 'CC' : 'KT'}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white line-clamp-1">{proj.title}</h4>
                    <div className="flex items-center space-x-2 text-[10px] text-gray-400 mt-0.5">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{proj.duration.toFixed(1)}s</span>
                      </span>
                      <span>•</span>
                      <span className="capitalize">{proj.styleId.replace('-', ' ')}</span>
                    </div>
                  </div>
                </div>

                <div className="w-7 h-7 rounded-lg bg-white/[0.04] flex items-center justify-center text-gray-400">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
