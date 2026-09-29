import React, { useState, useEffect } from 'react';
import { NavTab, BottomNav } from './components/BottomNav';
import { TopBar } from './components/TopBar';
import { HomeScreen } from './components/HomeScreen';
import { ProjectsScreen } from './components/ProjectsScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { CreateFlowModal } from './components/CreateFlowModal';
import { EditorScreen } from './components/EditorScreen';
import { OnboardingModal } from './components/OnboardingModal';
import { AudioEditorModal } from './components/AudioEditorModal';
import { UserSettings, Project } from './types';
import { StorageService } from './services/storageService';
import { GroqService } from './services/groqService';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [settings, setSettings] = useState<UserSettings>(StorageService.getSettings());
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  // Modals
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(!settings.hasCompletedOnboarding && !settings.groqApiKey);
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [createMode, setCreateMode] = useState<'kinetic' | 'autocaptions'>('kinetic');
  const [isAudioEditorOpen, setIsAudioEditorOpen] = useState<boolean>(false);

  // Load saved projects
  const refreshProjects = async () => {
    try {
      const list = await StorageService.getAllProjects();
      setProjects(list);
    } catch (err) {
      console.warn('Failed to load projects from IndexedDB:', err);
    }
  };

  useEffect(() => {
    refreshProjects();
  }, []);

  const handleUpdateSettings = (newSettings: Partial<UserSettings>) => {
    const updated = StorageService.saveSettings(newSettings);
    setSettings(updated);
  };

  // Launch Create Flow with mode
  const handleStartKinetic = () => {
    setCreateMode('kinetic');
    setIsCreateOpen(true);
  };

  const handleStartAutoCaptions = () => {
    setCreateMode('autocaptions');
    setIsCreateOpen(true);
  };

  // Instant Demo Audio Flow
  const handleTryDemoAudio = async (type: 'motivation' | 'podcast') => {
    const demo = GroqService.generateDemoScenes(type);
    const projectId = `demo_${Date.now()}`;
    const audioBlobKey = `audio_${projectId}`;

    // Create synthetic audio blob for demo
    const dummyAudio = new Blob([new Uint8Array(5000)], { type: 'audio/mp3' });
    await StorageService.saveBlob(audioBlobKey, dummyAudio);

    const demoProj: Project = {
      id: projectId,
      title: type === 'motivation' ? 'Motivation Reel' : 'Podcast Highlight',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      duration: demo.duration,
      audioBlobKey,
      styleId: type === 'motivation' ? 'karaoke-highlights' : 'viral-split',
      scenes: demo.scenes,
      mode: 'kinetic',
      language: 'en',
      sfxEnabled: settings.sfxEnabled ?? true,
      background: {
        type: 'auto',
        value: 'auto',
      },
    };

    await StorageService.saveProject(demoProj);
    await refreshProjects();
    setActiveProject(demoProj);
  };

  const handleOpenProject = async (id: string) => {
    const p = await StorageService.getProject(id);
    if (p) setActiveProject(p);
  };

  return (
    <div className="min-h-screen bg-[#0A120F] text-white flex flex-col font-sans antialiased overflow-x-hidden">
      {/* If in Editor Screen, hide normal chrome for full-screen immersive studio */}
      {activeProject ? (
        <EditorScreen
          project={activeProject}
          onCloseEditor={() => {
            setActiveProject(null);
            refreshProjects();
          }}
          onSaveProject={(updated) => {
            setActiveProject(updated);
            refreshProjects();
          }}
        />
      ) : (
        <>
          {/* TOP APP BAR */}
          <TopBar
            settings={settings}
            onOpenSettings={() => setCurrentTab('settings')}
            onOpenOnboarding={() => setIsOnboardingOpen(true)}
          />

          {/* MAIN TAB CONTENT */}
          <main className="flex-1 w-full max-w-md mx-auto">
            {currentTab === 'home' && (
              <HomeScreen
                onStartKinetic={handleStartKinetic}
                onStartAutoCaptions={handleStartAutoCaptions}
                onOpenAudioEditor={() => setIsAudioEditorOpen(true)}
                onOpenProjects={() => setCurrentTab('projects')}
                onOpenProject={handleOpenProject}
                onTryDemoAudio={handleTryDemoAudio}
                recentProjects={projects}
              />
            )}

            {currentTab === 'projects' && (
              <ProjectsScreen
                projects={projects}
                onOpenProject={handleOpenProject}
                onCreateNew={handleStartKinetic}
                onRefreshProjects={refreshProjects}
              />
            )}

            {currentTab === 'settings' && (
              <SettingsScreen
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
                onClearAllData={() => {
                  setProjects([]);
                  setSettings(StorageService.getSettings());
                }}
              />
            )}
          </main>

          {/* BOTTOM NAVIGATION */}
          <BottomNav
            currentTab={currentTab}
            onSelectTab={setCurrentTab}
            onCreateClick={handleStartKinetic}
          />
        </>
      )}

      {/* ONBOARDING / API KEY SETUP MODAL */}
      <OnboardingModal
        settings={settings}
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onSave={handleUpdateSettings}
      />

      {/* CREATE FLOW MODAL */}
      <CreateFlowModal
        mode={createMode}
        settings={settings}
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onOpenSettings={() => {
          setIsCreateOpen(false);
          setCurrentTab('settings');
        }}
        onProjectCreated={(newProj) => {
          setIsCreateOpen(false);
          setActiveProject(newProj);
          refreshProjects();
        }}
      />

      {/* AUDIO EDITOR MODAL */}
      <AudioEditorModal
        isOpen={isAudioEditorOpen}
        onClose={() => setIsAudioEditorOpen(false)}
        onAudioTrimmed={async (file, name) => {
          // Open create flow directly with this trimmed audio
          setCreateMode('kinetic');
          setIsCreateOpen(true);
        }}
      />
    </div>
  );
};
