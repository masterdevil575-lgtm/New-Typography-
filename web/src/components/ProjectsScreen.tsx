import React, { useState } from 'react';
import { 
  FolderOpen, Clock, Trash2, Edit3, ArrowRight, Play, Film, Subtitles, Plus, Check, X
} from 'lucide-react';
import { Project } from '../types';
import { StorageService } from '../services/storageService';

interface ProjectsScreenProps {
  projects: Project[];
  onOpenProject: (projectId: string) => void;
  onCreateNew: () => void;
  onRefreshProjects: () => void;
}

export const ProjectsScreen: React.FC<ProjectsScreenProps> = ({
  projects,
  onOpenProject,
  onCreateNew,
  onRefreshProjects,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleStartRename = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(project.id);
    setEditTitle(project.title);
  };

  const handleSaveRename = async (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      await StorageService.saveProject({
        ...project,
        title: editTitle.trim(),
        updatedAt: Date.now(),
      });
      onRefreshProjects();
    }
    setEditingId(null);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await StorageService.deleteProject(id);
    setConfirmDeleteId(null);
    onRefreshProjects();
  };

  return (
    <div className="pb-28 pt-2 px-4 max-w-md mx-auto space-y-5">
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-xl font-heading font-black text-white tracking-tight">Your Projects</h1>
          <p className="text-xs text-gray-400">Stored safely in device storage</p>
        </div>

        <button
          onClick={onCreateNew}
          className="px-3 py-2 rounded-xl btn-emerald text-black text-xs font-heading font-bold flex items-center space-x-1.5 shadow-glow-sm"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New</span>
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="p-8 rounded-3xl bg-[#0F1A16] border border-white/[0.07] text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#14261F] text-[#1FD67A] flex items-center justify-center mx-auto">
            <FolderOpen className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-sm font-heading font-bold text-white">No Projects Saved Yet</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
              Create kinetic animated videos or auto-captions and they will be listed here.
            </p>
          </div>
          <button
            onClick={onCreateNew}
            className="px-4 py-2.5 rounded-xl btn-emerald text-black text-xs font-heading font-bold"
          >
            Create Your First Video
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((proj) => {
            const isEditing = editingId === proj.id;
            const wordCount = proj.scenes.reduce((acc, s) => acc + s.words.length, 0);

            return (
              <div
                key={proj.id}
                onClick={() => !isEditing && onOpenProject(proj.id)}
                className="p-4 rounded-2xl bg-[#0F1A16] border border-white/[0.08] hover:border-[#1FD67A]/40 transition-all cursor-pointer active:scale-98 group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3.5 flex-1 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#182C25] to-[#0A120F] border border-[#1FD67A]/30 flex items-center justify-center text-[#1FD67A] shrink-0 font-black text-sm">
                      {proj.mode === 'autocaptions' ? <Subtitles className="w-5 h-5" /> : <Film className="w-5 h-5" />}
                    </div>

                    <div className="flex-1 min-w-0 pr-2">
                      {isEditing ? (
                        <div className="flex items-center space-x-1.5" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="bg-[#0A120F] border border-[#1FD67A] text-xs font-bold text-white rounded-lg px-2 py-1 outline-none flex-1"
                            autoFocus
                          />
                          <button
                            onClick={(e) => handleSaveRename(proj, e)}
                            className="p-1 rounded bg-[#1FD67A] text-black"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingId(null);
                            }}
                            className="p-1 rounded bg-white/[0.1] text-gray-300"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <h3 className="text-sm font-heading font-bold text-white truncate group-hover:text-[#1FD67A] transition-colors">
                          {proj.title}
                        </h3>
                      )}

                      <div className="flex items-center space-x-2 text-[10px] text-gray-400 mt-1">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{proj.duration.toFixed(1)}s</span>
                        </span>
                        <span>•</span>
                        <span>{wordCount} words</span>
                        <span>•</span>
                        <span className="capitalize">{proj.styleId.replace('-', ' ')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Edit Title & Delete */}
                  <div className="flex items-center space-x-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => handleStartRename(proj, e)}
                      className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] flex items-center justify-center text-gray-400 hover:text-white"
                      title="Rename"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDeleteId(proj.id);
                      }}
                      className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-red-500/20 flex items-center justify-center text-gray-400 hover:text-red-400"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Confirm Delete Confirmation */}
                {confirmDeleteId === proj.id && (
                  <div
                    className="mt-3 pt-3 border-t border-red-500/20 flex items-center justify-between text-xs"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="text-red-400">Delete this project?</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => handleDelete(proj.id, e)}
                        className="px-2.5 py-1 rounded-lg bg-red-500 text-white font-bold"
                      >
                        Yes, Delete
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDeleteId(null);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white/[0.06] text-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
