import { Scene, TypographyStyle, ProjectBackground } from '../types';
import { KineticRenderer } from './kineticRenderer';
import { SFXService } from './sfxService';

export interface ExportProgress {
  progress: number; // 0 to 100
  currentSecond: number;
  totalDuration: number;
  estimatedRemainingSecs: number;
  statusText: string;
}

export const ExportService = {
  /**
   * Renders the project to a high quality MP4/WebM video
   */
  async exportVideo(
    scenes: Scene[],
    style: TypographyStyle,
    background: ProjectBackground,
    audioBlob: Blob,
    duration: number,
    resolution: '720p' | '1080p' = '1080p',
    sfxEnabled: boolean = true,
    onProgress?: (p: ExportProgress) => void
  ): Promise<Blob> {
    const is1080 = resolution === '1080p';
    const width = is1080 ? 1080 : 720;
    const height = is1080 ? 1920 : 1280;
    const fps = 30;

    // Create offscreen rendering canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context creation failed on this device.');

    // Prepare audio element & audio context
    const audioUrl = URL.createObjectURL(audioBlob);
    const audioEl = new Audio();
    audioEl.src = audioUrl;
    audioEl.crossOrigin = 'anonymous';

    await new Promise<void>((resolve, reject) => {
      audioEl.oncanplaythrough = () => resolve();
      audioEl.onerror = () => reject(new Error('Audio decoding failed. Please try a different audio format.'));
      // Timeout after 10s
      setTimeout(() => resolve(), 3000);
    });

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const audioCtx = new AudioContextClass();
    const source = audioCtx.createMediaElementSource(audioEl);
    const streamDest = audioCtx.createMediaStreamDestination();
    source.connect(streamDest);
    source.connect(audioCtx.destination); // For listening or monitor

    // Schedule SFX onto export destination node
    if (sfxEnabled) {
      SFXService.scheduleExportSfx(audioCtx, streamDest, scenes, style, sfxEnabled, audioCtx.currentTime);
    }

    // Create canvas stream
    const canvasStream = canvas.captureStream(fps);
    // Combine video tracks with audio track
    const combinedTracks = [
      ...canvasStream.getVideoTracks(),
      ...streamDest.stream.getAudioTracks(),
    ];
    const combinedStream = new MediaStream(combinedTracks);

    // Pick best supported mimeType
    const mimeTypes = [
      'video/mp4;codecs=avc1,mp4a.40.2',
      'video/mp4',
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
    ];
    let selectedMime = '';
    for (const m of mimeTypes) {
      if (MediaRecorder.isTypeSupported(m)) {
        selectedMime = m;
        break;
      }
    }
    if (!selectedMime) selectedMime = 'video/webm';

    return new Promise((resolve, reject) => {
      let mediaRecorder: MediaRecorder;
      try {
        mediaRecorder = new MediaRecorder(combinedStream, {
          mimeType: selectedMime,
          videoBitsPerSecond: is1080 ? 6_000_000 : 3_500_000,
        });
      } catch (err: any) {
        URL.revokeObjectURL(audioUrl);
        audioCtx.close();
        return reject(new Error(`Failed to initialize video encoder: ${err?.message || 'Unsupported format'}`));
      }

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onerror = (e) => {
        URL.revokeObjectURL(audioUrl);
        audioCtx.close();
        reject(new Error('MediaRecorder encountered an encoding error. Try lowering resolution to 720p.'));
      };

      mediaRecorder.onstop = () => {
        URL.revokeObjectURL(audioUrl);
        audioCtx.close();
        const finalBlob = new Blob(chunks, { type: selectedMime.includes('mp4') ? 'video/mp4' : 'video/webm' });
        resolve(finalBlob);
      };

      // Start recording
      mediaRecorder.start(250);
      audioEl.currentTime = 0;
      audioEl.play().catch(() => {});

      const startTime = performance.now();
      let animFrameId: number;

      const renderLoop = () => {
        const curTime = audioEl.currentTime;
        const progress = Math.min(100, Math.round((curTime / Math.max(0.1, duration)) * 100));

        const elapsedSecs = (performance.now() - startTime) / 1000;
        const estimatedTotalSecs = progress > 0 ? (elapsedSecs / (progress / 100)) : duration;
        const remainingSecs = Math.max(0, Math.round(estimatedTotalSecs - elapsedSecs));

        onProgress?.({
          progress,
          currentSecond: curTime,
          totalDuration: duration,
          estimatedRemainingSecs: remainingSecs,
          statusText: `Encoding frame ${Math.round(curTime * fps)} / ${Math.round(duration * fps)} (${progress}%)`,
        });

        // Render frame
        KineticRenderer.renderFrame(ctx, width, height, curTime, scenes, style, background);

        if (curTime >= duration || audioEl.ended) {
          cancelAnimationFrame(animFrameId);
          setTimeout(() => {
            if (mediaRecorder.state !== 'inactive') {
              mediaRecorder.stop();
            }
          }, 300);
        } else {
          animFrameId = requestAnimationFrame(renderLoop);
        }
      };

      animFrameId = requestAnimationFrame(renderLoop);
    });
  },

  /**
   * Triggers download to device storage and calls native Android bridge if available
   */
  saveVideoToDevice(videoBlob: Blob, filename = 'NextGenKinetic_Video.mp4') {
    const url = URL.createObjectURL(videoBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // If Android Native Bridge is available
    if ((window as any).AndroidBridge?.saveToDownloads) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        (window as any).AndroidBridge.saveToDownloads(base64, filename);
      };
      reader.readAsDataURL(videoBlob);
    }
  },

  /**
   * Shares the video using Web Share API or native intent
   */
  async shareVideo(videoBlob: Blob, filename = 'NextGenKinetic_Video.mp4'): Promise<boolean> {
    const file = new File([videoBlob], filename, { type: videoBlob.type });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'NextGen Kinetic Video',
          text: 'Created with NextGen Kinetic App',
        });
        return true;
      } catch (err) {
        // User cancelled or share dismissed
        return false;
      }
    } else {
      // Fallback: download
      this.saveVideoToDevice(videoBlob, filename);
      return true;
    }
  }
};
