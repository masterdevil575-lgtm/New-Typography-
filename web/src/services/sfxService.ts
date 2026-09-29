import { Scene, TypographyStyle } from '../types';

export class SFXService {
  private static sharedCtx: AudioContext | null = null;
  private static lastPlayedWordId: string = '';
  private static lastPlayedSceneId: string = '';

  private static getAudioContext(): AudioContext {
    if (!this.sharedCtx || this.sharedCtx.state === 'closed') {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.sharedCtx = new AudioCtxClass();
    }
    if (this.sharedCtx.state === 'suspended') {
      this.sharedCtx.resume().catch(() => {});
    }
    return this.sharedCtx;
  }

  /**
   * Crisp energetic pop sound (ideal for word highlights, bounces)
   */
  static playPop(ctx?: AudioContext, atTime?: number, dest?: AudioNode) {
    try {
      const audioCtx = ctx || this.getAudioContext();
      const targetDest = dest || audioCtx.destination;
      const t = atTime ?? audioCtx.currentTime;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(550, t);
      osc.frequency.exponentialRampToValueAtTime(70, t + 0.07);

      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

      osc.connect(gain);
      gain.connect(targetDest);

      osc.start(t);
      osc.stop(t + 0.08);
    } catch (e) {
      // AudioContext might be blocked or inactive
    }
  }

  /**
   * Smooth airy whoosh (ideal for scene transitions & split animations)
   */
  static playWhoosh(ctx?: AudioContext, atTime?: number, dest?: AudioNode) {
    try {
      const audioCtx = ctx || this.getAudioContext();
      const targetDest = dest || audioCtx.destination;
      const t = atTime ?? audioCtx.currentTime;

      // Filtered frequency sweep simulating rushing air
      const osc = audioCtx.createOscillator();
      const filter = audioCtx.createBiquadFilter();
      const gain = audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.exponentialRampToValueAtTime(480, t + 0.12);
      osc.frequency.exponentialRampToValueAtTime(100, t + 0.25);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(400, t);
      filter.frequency.exponentialRampToValueAtTime(1200, t + 0.12);
      filter.frequency.exponentialRampToValueAtTime(200, t + 0.25);
      filter.Q.value = 2.5;

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.22, t + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(targetDest);

      osc.start(t);
      osc.stop(t + 0.26);
    } catch (e) {}
  }

  /**
   * Resonant bell ding (ideal for cinematic and high impact finishes)
   */
  static playDing(ctx?: AudioContext, atTime?: number, dest?: AudioNode) {
    try {
      const audioCtx = ctx || this.getAudioContext();
      const targetDest = dest || audioCtx.destination;
      const t = atTime ?? audioCtx.currentTime;

      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(1046.5, t); // C6
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(2093, t);   // C7 harmonic

      gain.gain.setValueAtTime(0.28, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(targetDest);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + 0.36);
      osc2.stop(t + 0.36);
    } catch (e) {}
  }

  /**
   * Fast modern swipe sound
   */
  static playSwipe(ctx?: AudioContext, atTime?: number, dest?: AudioNode) {
    try {
      const audioCtx = ctx || this.getAudioContext();
      const targetDest = dest || audioCtx.destination;
      const t = atTime ?? audioCtx.currentTime;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, t);
      osc.frequency.exponentialRampToValueAtTime(90, t + 0.1);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

      osc.connect(gain);
      gain.connect(targetDest);

      osc.start(t);
      osc.stop(t + 0.11);
    } catch (e) {}
  }

  /**
   * Triggers live preview sound during timeline playback
   */
  static triggerLivePlaybackSfx(
    currentTime: number,
    scenes: Scene[],
    style: TypographyStyle,
    sfxEnabled: boolean
  ) {
    if (!sfxEnabled) return;

    // Check scene transition
    const activeScene = scenes.find(s => currentTime >= s.startTime && currentTime <= s.endTime);
    if (activeScene && activeScene.id !== this.lastPlayedSceneId) {
      if (Math.abs(currentTime - activeScene.startTime) < 0.15) {
        this.lastPlayedSceneId = activeScene.id;
        if (style.animationType === 'cinematic-reveal' || style.animationType === 'desi-vibes') {
          this.playDing();
        } else {
          this.playWhoosh();
        }
      }
    }

    // Check active word transition
    if (activeScene) {
      const activeWord = activeScene.words.find(w => currentTime >= w.start && currentTime <= w.end);
      if (activeWord && activeWord.id !== this.lastPlayedWordId) {
        if (Math.abs(currentTime - activeWord.start) < 0.1) {
          this.lastPlayedWordId = activeWord.id;
          if (style.animationType === 'huge-punch' || style.animationType === 'trending-pk') {
            this.playPop();
          } else if (style.animationType === 'qawwali-beat') {
            this.playDing();
          } else {
            this.playPop();
          }
        }
      }
    }
  }

  /**
   * Resets playback tracking pointers
   */
  static resetPlayback() {
    this.lastPlayedWordId = '';
    this.lastPlayedSceneId = '';
  }

  /**
   * Schedules all sound effects onto an AudioContext and destination node
   * for exact synchronization during video export!
   */
  static scheduleExportSfx(
    audioCtx: AudioContext,
    destNode: AudioNode,
    scenes: Scene[],
    style: TypographyStyle,
    sfxEnabled: boolean,
    exportStartAudioTime: number = 0
  ) {
    if (!sfxEnabled) return;

    scenes.forEach(scene => {
      // Scene transition sound
      const sceneTime = exportStartAudioTime + scene.startTime;
      if (style.animationType === 'cinematic-reveal' || style.animationType === 'desi-vibes') {
        this.playDing(audioCtx, sceneTime, destNode);
      } else {
        this.playWhoosh(audioCtx, sceneTime, destNode);
      }

      // Word level transition sounds
      scene.words.forEach(word => {
        const wordTime = exportStartAudioTime + word.start;
        if (style.animationType === 'qawwali-beat') {
          this.playDing(audioCtx, wordTime, destNode);
        } else if (style.animationType === 'huge-punch' || style.animationType === 'trending-pk') {
          this.playPop(audioCtx, wordTime, destNode);
        } else {
          this.playPop(audioCtx, wordTime, destNode);
        }
      });
    });
  }
}
