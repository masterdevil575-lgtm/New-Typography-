import { Scene, TypographyStyle, ProjectBackground, WordItem } from '../types';

export const STYLES: TypographyStyle[] = [
  {
    id: 'karaoke-highlights',
    name: 'Karaoke Highlights',
    tagline: 'Word-by-word karaoke glow fill',
    description: 'Dynamic word-by-word neon sweep with highlight glow. The #1 viral TikTok/Reels format.',
    font: 'Poppins',
    primaryColor: '#FFFFFF',
    highlightColor: '#1FD67A',
    secondaryColor: '#FFE600',
    animationType: 'karaoke-fill',
    boxBackground: 'rgba(15, 26, 22, 0.75)',
    badge: 'POPULAR'
  },
  {
    id: 'viral-split',
    name: 'Viral Split',
    tagline: 'Dual-tone bold impact text',
    description: 'Striking two-tone contrast text with spring bounce effect and heavy drop shadow.',
    font: 'Poppins',
    primaryColor: '#FFFFFF',
    highlightColor: '#00F59B',
    secondaryColor: '#10B981',
    animationType: 'viral-split',
    boxBackground: 'rgba(0, 0, 0, 0.65)',
    badge: 'VIRAL'
  },
  {
    id: 'cinematic',
    name: 'Cinematic',
    tagline: 'Elegant reveal with golden gradient',
    description: 'Atmospheric typography with soft fade, elegant tracking, and subtle warm glow.',
    font: 'serif',
    primaryColor: '#F3F4F6',
    highlightColor: '#FBBF24',
    secondaryColor: '#D97706',
    animationType: 'cinematic-reveal',
    badge: 'PREMIUM'
  },
  {
    id: 'this-is-huge',
    name: 'This Is Huge',
    tagline: 'Maximized punch-in words',
    description: 'Bold one-word-at-a-time punch in with subtle impact shake. Grabs instant attention.',
    font: 'Impact, Poppins',
    primaryColor: '#FFFFFF',
    highlightColor: '#22C55E',
    secondaryColor: '#EF4444',
    animationType: 'huge-punch',
    boxBackground: '#000000',
    badge: 'HIGH IMPACT'
  },
  // --- PAKISTANI SHORT-FORM CONTENT STYLES ---
  {
    id: 'desi-vibes',
    name: 'Desi Vibes',
    tagline: 'Urdu-inspired elegance & green/white bounce',
    description: 'Pakistani cultural aesthetic with flag-green & ivory accents, rhythmic festive bounce.',
    font: 'Georgia, Poppins, serif',
    primaryColor: '#FFFFFF',
    highlightColor: '#10B981',
    secondaryColor: '#A7F3D0',
    animationType: 'desi-vibes',
    boxBackground: 'rgba(6, 40, 24, 0.85)',
    badge: 'DESI PK'
  },
  {
    id: 'trending-pk',
    name: 'Trending PK',
    tagline: 'Punchy bold caps with flag-green sweep',
    description: 'High-energy uppercase typography with deep Pakistan flag-green sweep highlight.',
    font: 'Poppins, Impact, sans-serif',
    primaryColor: '#FFFFFF',
    highlightColor: '#00F59B',
    secondaryColor: '#00401A',
    animationType: 'trending-pk',
    boxBackground: 'rgba(0, 28, 14, 0.88)',
    badge: 'TRENDING PK'
  },
  {
    id: 'vlog-style',
    name: 'Vlog Style',
    tagline: 'Clean rounded font with soft pop-in',
    description: 'Modern aesthetic vlogger text with soft pill background box and gentle pop transition.',
    font: 'Inter, Poppins, sans-serif',
    primaryColor: '#F8FAFC',
    highlightColor: '#34D399',
    secondaryColor: '#6EE7B7',
    animationType: 'vlog-pop',
    boxBackground: 'rgba(15, 26, 22, 0.92)',
    badge: 'VLOG'
  },
  {
    id: 'qawwali-beat',
    name: 'Qawwali Beat',
    tagline: 'Rhythmic word-by-word beat bounce',
    description: 'Sufi & Qawwali rhythmic emphasis bounce with golden spiritual glow and aura.',
    font: 'serif, Poppins',
    primaryColor: '#FFFBEB',
    highlightColor: '#F59E0B',
    secondaryColor: '#10B981',
    animationType: 'qawwali-beat',
    boxBackground: 'rgba(26, 18, 7, 0.82)',
    badge: 'SOULFUL'
  }
];

export class KineticRenderer {
  /**
   * Renders a frame at currentTime onto the provided Canvas 2D context
   */
  static renderFrame(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    currentTime: number,
    scenes: Scene[],
    style: TypographyStyle,
    background: ProjectBackground,
    bgMediaElement?: HTMLVideoElement | HTMLImageElement | null
  ) {
    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // 1. Draw Background (supports Auto animated procedural canvas)
    this.drawBackground(ctx, width, height, background, style, currentTime, bgMediaElement);

    // 2. Find active scene & words
    const activeScene = scenes.find(
      s => currentTime >= s.startTime && currentTime <= s.endTime + 0.15
    );

    if (activeScene) {
      this.drawKineticText(ctx, width, height, currentTime, activeScene, style);
    }

    ctx.restore();
  }

  private static drawBackground(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    bg: ProjectBackground,
    style: TypographyStyle,
    currentTime: number,
    mediaEl?: HTMLVideoElement | HTMLImageElement | null
  ) {
    if (bg.type === 'media' && mediaEl) {
      try {
        ctx.drawImage(mediaEl, 0, 0, width, height);
        ctx.fillStyle = 'rgba(10, 18, 15, 0.45)';
        ctx.fillRect(0, 0, width, height);
        return;
      } catch (e) {}
    }

    // AUTOMATIC BACKGROUND (procedural animated canvas tailored to style mood)
    if (bg.type === 'auto') {
      this.renderAutoAnimatedBackground(ctx, width, height, style, currentTime);
      return;
    }

    if (bg.type === 'gradient') {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      if (bg.value === 'emerald-aurora') {
        grad.addColorStop(0, '#041d13');
        grad.addColorStop(0.5, '#0a2e21');
        grad.addColorStop(1, '#06130d');
      } else if (bg.value === 'cyber-neon') {
        grad.addColorStop(0, '#0a101f');
        grad.addColorStop(0.5, '#06261d');
        grad.addColorStop(1, '#0a120f');
      } else if (bg.value === 'sunset-fire') {
        grad.addColorStop(0, '#2d1109');
        grad.addColorStop(0.5, '#1e111a');
        grad.addColorStop(1, '#0a120f');
      } else {
        grad.addColorStop(0, '#0F1A16');
        grad.addColorStop(1, '#0A120F');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    } else {
      ctx.fillStyle = bg.value || '#0A120F';
      ctx.fillRect(0, 0, width, height);
    }

    // Ambient spotlight glow
    const radialGrad = ctx.createRadialGradient(
      width / 2, height / 2, 50,
      width / 2, height / 2, width * 0.7
    );
    radialGrad.addColorStop(0, 'rgba(31, 214, 122, 0.08)');
    radialGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = radialGrad;
    ctx.fillRect(0, 0, width, height);
  }

  /**
   * Automatic Canvas Animated Background:
   * Dynamically renders moving gradients, soft particles and glowing lights
   * tailored to the selected typography template mood!
   */
  private static renderAutoAnimatedBackground(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    style: TypographyStyle,
    currentTime: number
  ) {
    const t = currentTime;

    if (style.id === 'desi-vibes' || style.id === 'trending-pk') {
      // Pakistani Flag Emerald & Midnight Green with drifting sparkles
      const grad = ctx.createLinearGradient(0, 0, width, height);
      const shift = Math.sin(t * 0.6) * 0.1;
      grad.addColorStop(0, '#021a0f');
      grad.addColorStop(0.45 + shift, '#06331e');
      grad.addColorStop(1, '#011009');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Floating celebratory green-gold ambient particles
      ctx.save();
      for (let i = 0; i < 18; i++) {
        const px = (Math.sin(i * 37 + t * 0.4) * 0.5 + 0.5) * width;
        const py = ((i * 123 + t * 45) % (height + 40)) - 20;
        const pRadius = 2.5 + Math.sin(i + t) * 1.5;
        const alpha = 0.25 + Math.sin(i * 7 + t * 2) * 0.15;

        ctx.fillStyle = i % 2 === 0 ? `rgba(16, 185, 129, ${alpha})` : `rgba(255, 255, 255, ${alpha * 0.8})`;
        ctx.beginPath();
        ctx.arc(px, height - py, pRadius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

    } else if (style.id === 'qawwali-beat') {
      // Sufi spiritual amber-emerald pulsing aura
      const pulse = 1 + Math.sin(t * 4) * 0.06;
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#1c1005');
      grad.addColorStop(0.5, '#120b17');
      grad.addColorStop(1, '#05180f');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Pulsing center halo
      const radial = ctx.createRadialGradient(
        width / 2, height * 0.6, 20 * pulse,
        width / 2, height * 0.6, width * 0.75 * pulse
      );
      radial.addColorStop(0, 'rgba(245, 158, 11, 0.18)');
      radial.addColorStop(0.6, 'rgba(16, 185, 129, 0.08)');
      radial.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = radial;
      ctx.fillRect(0, 0, width, height);

    } else if (style.id === 'cinematic') {
      // Deep midnight indigo with warm golden horizon flare
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#0c101c');
      grad.addColorStop(0.6, '#0f1715');
      grad.addColorStop(1, '#05070a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Soft cinematic golden beam
      const flareY = height * 0.62 + Math.sin(t * 0.3) * 20;
      const flareGrad = ctx.createRadialGradient(
        width / 2, flareY, 10,
        width / 2, flareY, width * 0.8
      );
      flareGrad.addColorStop(0, 'rgba(251, 191, 36, 0.14)');
      flareGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = flareGrad;
      ctx.fillRect(0, 0, width, height);

    } else if (style.id === 'vlog-style') {
      // Soft modern pastel-tinted dark aesthetic
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#0f1715');
      grad.addColorStop(0.5, '#0a1f18');
      grad.addColorStop(1, '#09120f');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Gentle floating blobs
      const b1x = width * 0.3 + Math.sin(t * 0.5) * 60;
      const b1y = height * 0.4 + Math.cos(t * 0.4) * 80;
      const rad1 = ctx.createRadialGradient(b1x, b1y, 10, b1x, b1y, 220);
      rad1.addColorStop(0, 'rgba(52, 211, 153, 0.12)');
      rad1.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = rad1;
      ctx.fillRect(0, 0, width, height);

    } else {
      // Default viral neon fluid motion
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#081711');
      grad.addColorStop(0.5, '#0a2e20');
      grad.addColorStop(1, '#050f0b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Subtle dynamic spotlight
      const spotX = width / 2 + Math.sin(t * 0.8) * 80;
      const spotY = height * 0.6 + Math.cos(t * 0.6) * 50;
      const rad = ctx.createRadialGradient(spotX, spotY, 20, spotX, spotY, width * 0.65);
      rad.addColorStop(0, 'rgba(31, 214, 122, 0.14)');
      rad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = rad;
      ctx.fillRect(0, 0, width, height);
    }
  }

  private static drawKineticText(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    currentTime: number,
    scene: Scene,
    style: TypographyStyle
  ) {
    const centerY = height * 0.62;
    const maxWidth = width * 0.88;

    switch (style.animationType) {
      case 'huge-punch':
        this.renderHugePunch(ctx, width, height, centerY, currentTime, scene, style);
        break;
      case 'viral-split':
        this.renderViralSplit(ctx, width, height, centerY, maxWidth, currentTime, scene, style);
        break;
      case 'cinematic-reveal':
        this.renderCinematicReveal(ctx, width, height, centerY, maxWidth, currentTime, scene, style);
        break;
      case 'desi-vibes':
        this.renderDesiVibes(ctx, width, height, centerY, maxWidth, currentTime, scene, style);
        break;
      case 'trending-pk':
        this.renderTrendingPk(ctx, width, height, centerY, maxWidth, currentTime, scene, style);
        break;
      case 'vlog-pop':
        this.renderVlogStyle(ctx, width, height, centerY, maxWidth, currentTime, scene, style);
        break;
      case 'qawwali-beat':
        this.renderQawwaliBeat(ctx, width, height, centerY, maxWidth, currentTime, scene, style);
        break;
      case 'karaoke-fill':
      default:
        this.renderKaraokeFill(ctx, width, height, centerY, maxWidth, currentTime, scene, style);
        break;
    }
  }

  /**
   * Karaoke Fill: Spoken word sweeps neon emerald with smooth glow
   */
  private static renderKaraokeFill(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    centerY: number,
    maxWidth: number,
    currentTime: number,
    scene: Scene,
    style: TypographyStyle
  ) {
    const baseFontSize = Math.round(width * 0.075);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const words = scene.words;
    if (words.length === 0) return;

    const lines: WordItem[][] = [];
    let currentLine: WordItem[] = [];
    let currentLineWidth = 0;
    const spaceWidth = baseFontSize * 0.35;

    ctx.font = `800 ${baseFontSize}px Poppins, sans-serif`;

    words.forEach(w => {
      const wordText = (w.isUppercase ?? true) ? w.word.toUpperCase() : w.word;
      const wWidth = ctx.measureText(wordText).width;
      if (currentLineWidth + wWidth + spaceWidth > maxWidth && currentLine.length > 0) {
        lines.push(currentLine);
        currentLine = [w];
        currentLineWidth = wWidth;
      } else {
        currentLine.push(w);
        currentLineWidth += wWidth + (currentLine.length > 1 ? spaceWidth : 0);
      }
    });
    if (currentLine.length > 0) lines.push(currentLine);

    const lineHeight = baseFontSize * 1.35;
    const totalBlockHeight = lines.length * lineHeight;
    let startY = centerY - (totalBlockHeight / 2) + (lineHeight / 2);

    lines.forEach(line => {
      const measurements = line.map(w => {
        const wordText = (w.isUppercase ?? true) ? w.word.toUpperCase() : w.word;
        return {
          word: w,
          text: wordText,
          width: ctx.measureText(wordText).width,
        };
      });

      const totalLineWidth = measurements.reduce((acc, m) => acc + m.width, 0) + (line.length - 1) * spaceWidth;
      let curX = (width - totalLineWidth) / 2;

      measurements.forEach(({ word, text, width: wWidth }) => {
        const isActive = currentTime >= word.start && currentTime <= word.end + 0.08;
        const isPast = currentTime > word.end + 0.08;

        ctx.save();
        ctx.font = `${word.isBold !== false ? '800' : '500'} ${baseFontSize * (word.fontSize || 1)}px Poppins, sans-serif`;

        const wordCenterX = curX + (wWidth / 2);

        if (word.hasBackgroundBox || (isActive && style.boxBackground)) {
          ctx.fillStyle = word.boxColor || (isActive ? 'rgba(31, 214, 122, 0.2)' : 'rgba(0, 0, 0, 0.6)');
          const padX = 8;
          const padY = 4;
          this.roundRect(ctx, curX - padX, startY - (lineHeight / 2) + padY, wWidth + (padX * 2), lineHeight - (padY * 2), 8);
          ctx.fill();
        }

        if (isActive) {
          const progress = Math.min(1, Math.max(0, (currentTime - word.start) / Math.max(0.01, word.end - word.start)));
          const scale = 1 + (Math.sin(progress * Math.PI) * 0.12);
          ctx.translate(wordCenterX, startY);
          ctx.scale(scale, scale);
          ctx.translate(-wordCenterX, -startY);

          ctx.shadowColor = style.highlightColor;
          ctx.shadowBlur = 18;
          ctx.fillStyle = word.highlightColor || style.highlightColor;
        } else if (isPast) {
          ctx.shadowBlur = 0;
          ctx.fillStyle = word.color || style.primaryColor;
        } else {
          ctx.shadowBlur = 0;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        }

        ctx.strokeStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.lineWidth = 4;
        ctx.strokeText(text, wordCenterX, startY);
        ctx.fillText(text, wordCenterX, startY);

        ctx.restore();
        curX += wWidth + spaceWidth;
      });

      startY += lineHeight;
    });
  }

  /**
   * Desi Vibes (Pakistani Aesthetic):
   * Calligraphy-inspired elegance with Pakistan flag-green & white tones,
   * gentle festive bounce and subtle starry sparkle.
   */
  private static renderDesiVibes(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    centerY: number,
    maxWidth: number,
    currentTime: number,
    scene: Scene,
    style: TypographyStyle
  ) {
    const baseFontSize = Math.round(width * 0.08);
    const words = scene.words;
    if (words.length === 0) return;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `700 ${baseFontSize}px Georgia, Poppins, serif`;

    const activeWordIdx = words.findIndex(w => currentTime >= w.start && currentTime <= w.end + 0.1);
    const activeWord = activeWordIdx !== -1 ? words[activeWordIdx] : null;

    // Measurement
    const spaceWidth = baseFontSize * 0.35;
    const measurements = words.map(w => {
      const text = w.word;
      return { word: w, text, width: ctx.measureText(text).width };
    });

    const totalW = measurements.reduce((a, b) => a + b.width, 0) + (words.length - 1) * spaceWidth;
    let curX = (width - Math.min(maxWidth, totalW)) / 2;

    ctx.save();

    // Backdrop ribbon pill
    const ribbonH = baseFontSize * 1.7;
    ctx.fillStyle = 'rgba(6, 40, 24, 0.88)';
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
    ctx.lineWidth = 2;
    this.roundRect(ctx, curX - 16, centerY - (ribbonH / 2), Math.min(maxWidth, totalW) + 32, ribbonH, 18);
    ctx.fill();
    ctx.stroke();

    measurements.forEach(({ word, text, width: wWidth }) => {
      const isCur = currentTime >= word.start && currentTime <= word.end + 0.08;
      const wordCenter = curX + (wWidth / 2);

      ctx.save();
      if (isCur) {
        // Festive upward bounce
        const progress = Math.min(1, Math.max(0, (currentTime - word.start) / Math.max(0.01, word.end - word.start)));
        const bounce = Math.sin(progress * Math.PI) * 8;
        ctx.translate(wordCenter, centerY - bounce);
        ctx.scale(1.1, 1.1);
        ctx.translate(-wordCenter, -centerY + bounce);

        ctx.fillStyle = '#10B981'; // Pakistan flag green
        ctx.shadowColor = '#10B981';
        ctx.shadowBlur = 18;

        // Draw small crescent/star sparkle indicator above word
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(wordCenter, centerY - (baseFontSize * 0.95), 3.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowBlur = 0;
      }

      ctx.strokeStyle = '#02180e';
      ctx.lineWidth = 4;
      ctx.strokeText(text, wordCenter, centerY);
      ctx.fillText(text, wordCenter, centerY);
      ctx.restore();

      curX += wWidth + spaceWidth;
    });

    ctx.restore();
  }

  /**
   * Trending PK:
   * Punchy bold uppercase impact typography with an electric green highlight sweep
   */
  private static renderTrendingPk(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    centerY: number,
    maxWidth: number,
    currentTime: number,
    scene: Scene,
    style: TypographyStyle
  ) {
    const baseFontSize = Math.round(width * 0.082);
    const words = scene.words;
    if (words.length === 0) return;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `900 ${baseFontSize}px Poppins, Impact, sans-serif`;

    const spaceWidth = baseFontSize * 0.32;
    const measurements = words.map(w => {
      const text = w.word.toUpperCase();
      return { word: w, text, width: ctx.measureText(text).width };
    });

    const totalW = measurements.reduce((a, b) => a + b.width, 0) + (words.length - 1) * spaceWidth;
    let curX = (width - Math.min(maxWidth, totalW)) / 2;

    ctx.save();
    measurements.forEach(({ word, text, width: wWidth }) => {
      const isCur = currentTime >= word.start && currentTime <= word.end + 0.08;
      const wordCenter = curX + (wWidth / 2);

      ctx.save();
      if (isCur) {
        // High-energy scale pop
        ctx.translate(wordCenter, centerY);
        ctx.scale(1.15, 1.15);
        ctx.translate(-wordCenter, -centerY);

        // Green sweep highlight box
        ctx.fillStyle = '#00F59B';
        this.roundRect(ctx, curX - 6, centerY - (baseFontSize * 0.7), wWidth + 12, baseFontSize * 1.4, 8);
        ctx.fill();

        ctx.fillStyle = '#000000'; // Black text on green sweep
        ctx.shadowBlur = 0;
      } else {
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
        ctx.shadowBlur = 12;
      }

      ctx.strokeStyle = isCur ? '#00F59B' : '#000000';
      ctx.lineWidth = 4;
      ctx.strokeText(text, wordCenter, centerY);
      ctx.fillText(text, wordCenter, centerY);
      ctx.restore();

      curX += wWidth + spaceWidth;
    });

    ctx.restore();
  }

  /**
   * Vlog Style:
   * Clean aesthetic rounded font with smooth soft pill pop-in
   */
  private static renderVlogStyle(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    centerY: number,
    maxWidth: number,
    currentTime: number,
    scene: Scene,
    style: TypographyStyle
  ) {
    const baseFontSize = Math.round(width * 0.072);
    const words = scene.words;
    if (words.length === 0) return;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `600 ${baseFontSize}px Inter, Poppins, sans-serif`;

    const displayText = words.map(w => w.word).join(' ');
    const textWidth = Math.min(maxWidth, ctx.measureText(displayText).width + 36);
    const pillH = baseFontSize * 1.6;

    ctx.save();
    // Soft blurred pill
    ctx.fillStyle = 'rgba(15, 26, 22, 0.92)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1.5;
    this.roundRect(ctx, (width - textWidth) / 2, centerY - (pillH / 2), textWidth, pillH, 20);
    ctx.fill();
    ctx.stroke();

    const spaceWidth = baseFontSize * 0.35;
    const measurements = words.map(w => ({ word: w, text: w.word, width: ctx.measureText(w.word).width }));
    const totalW = measurements.reduce((a, b) => a + b.width, 0) + (words.length - 1) * spaceWidth;
    let curX = (width - totalW) / 2;

    measurements.forEach(({ word, text, width: wWidth }) => {
      const isCur = currentTime >= word.start && currentTime <= word.end + 0.08;
      const wordCenter = curX + (wWidth / 2);

      ctx.save();
      if (isCur) {
        ctx.fillStyle = '#34D399'; // Mint green
        ctx.font = `800 ${baseFontSize}px Inter, Poppins, sans-serif`;
      } else {
        ctx.fillStyle = '#F8FAFC';
      }

      ctx.fillText(text, wordCenter, centerY);
      ctx.restore();

      curX += wWidth + spaceWidth;
    });

    ctx.restore();
  }

  /**
   * Qawwali Beat:
   * Rhythmic word-by-word bounce synced to beat with golden Sufi aura
   */
  private static renderQawwaliBeat(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    centerY: number,
    maxWidth: number,
    currentTime: number,
    scene: Scene,
    style: TypographyStyle
  ) {
    const baseFontSize = Math.round(width * 0.078);
    const words = scene.words;
    if (words.length === 0) return;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `700 ${baseFontSize}px serif, Poppins`;

    const spaceWidth = baseFontSize * 0.35;
    const measurements = words.map(w => ({ word: w, text: w.word, width: ctx.measureText(w.word).width }));
    const totalW = measurements.reduce((a, b) => a + b.width, 0) + (words.length - 1) * spaceWidth;
    let curX = (width - Math.min(maxWidth, totalW)) / 2;

    ctx.save();

    measurements.forEach(({ word, text, width: wWidth }) => {
      const isCur = currentTime >= word.start && currentTime <= word.end + 0.08;
      const wordCenter = curX + (wWidth / 2);

      ctx.save();
      if (isCur) {
        const beatBounce = Math.sin(currentTime * 12) * 6;
        ctx.translate(wordCenter, centerY + beatBounce);
        ctx.scale(1.18, 1.18);
        ctx.translate(-wordCenter, -centerY - beatBounce);

        // Radiant golden aura
        ctx.shadowColor = '#F59E0B';
        ctx.shadowBlur = 22;
        ctx.fillStyle = '#FBBF24';
      } else {
        ctx.fillStyle = '#FFFBEB';
        ctx.shadowBlur = 4;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      }

      ctx.strokeStyle = '#180e04';
      ctx.lineWidth = 5;
      ctx.strokeText(text, wordCenter, centerY);
      ctx.fillText(text, wordCenter, centerY);
      ctx.restore();

      curX += wWidth + spaceWidth;
    });

    ctx.restore();
  }

  /**
   * Viral Split: Dual-tone typography with spring pop
   */
  private static renderViralSplit(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    centerY: number,
    maxWidth: number,
    currentTime: number,
    scene: Scene,
    style: TypographyStyle
  ) {
    const baseFontSize = Math.round(width * 0.08);
    const words = scene.words;
    if (words.length === 0) return;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `900 ${baseFontSize}px Poppins, sans-serif`;

    const activeWordIdx = words.findIndex(w => currentTime >= w.start && currentTime <= w.end + 0.1);
    const activeWord = activeWordIdx !== -1 ? words[activeWordIdx] : null;

    const displayText = words.map(w => (w.isUppercase ?? true) ? w.word.toUpperCase() : w.word).join(' ');
    
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 6;

    const textWidth = Math.min(maxWidth, ctx.measureText(displayText).width + 40);
    const cardHeight = baseFontSize * 1.8;
    ctx.fillStyle = 'rgba(15, 26, 22, 0.9)';
    ctx.strokeStyle = activeWord ? style.highlightColor : 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 2;
    this.roundRect(ctx, (width - textWidth) / 2, centerY - (cardHeight / 2), textWidth, cardHeight, 16);
    ctx.fill();
    ctx.stroke();

    const spaceWidth = baseFontSize * 0.35;
    const measurements = words.map(w => {
      const txt = (w.isUppercase ?? true) ? w.word.toUpperCase() : w.word;
      return { word: w, text: txt, width: ctx.measureText(txt).width };
    });

    const totalW = measurements.reduce((a, b) => a + b.width, 0) + (words.length - 1) * spaceWidth;
    let curX = (width - totalW) / 2;

    measurements.forEach(({ word, text, width: wWidth }, idx) => {
      const isCur = currentTime >= word.start && currentTime <= word.end + 0.08;
      const wordCenter = curX + (wWidth / 2);

      ctx.save();
      if (isCur) {
        ctx.fillStyle = style.highlightColor;
        ctx.shadowColor = style.highlightColor;
        ctx.shadowBlur = 16;
      } else if (idx % 2 === 0) {
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowBlur = 0;
      } else {
        ctx.fillStyle = style.secondaryColor || '#6EE7B7';
        ctx.shadowBlur = 0;
      }

      ctx.strokeText(text, wordCenter, centerY);
      ctx.fillText(text, wordCenter, centerY);
      ctx.restore();

      curX += wWidth + spaceWidth;
    });

    ctx.restore();
  }

  /**
   * Cinematic: Elegant serif reveal with soft fade and warm golden aura
   */
  private static renderCinematicReveal(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    centerY: number,
    maxWidth: number,
    currentTime: number,
    scene: Scene,
    style: TypographyStyle
  ) {
    const baseFontSize = Math.round(width * 0.065);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `600 ${baseFontSize}px Georgia, serif`;

    const fullText = scene.words.map(w => w.word).join(' ');
    const sceneProgress = Math.min(1, Math.max(0, (currentTime - scene.startTime) / Math.max(0.3, scene.endTime - scene.startTime)));

    ctx.save();
    ctx.globalAlpha = Math.min(1, sceneProgress * 2.5);

    const yOffset = (1 - Math.min(1, sceneProgress * 3)) * 12;

    const grad = ctx.createLinearGradient(0, centerY - baseFontSize, 0, centerY + baseFontSize);
    grad.addColorStop(0, '#FFFFFF');
    grad.addColorStop(0.5, style.highlightColor);
    grad.addColorStop(1, '#D97706');

    ctx.fillStyle = grad;
    ctx.shadowColor = 'rgba(251, 191, 36, 0.4)';
    ctx.shadowBlur = 20;

    ctx.fillText(fullText, width / 2, centerY - yOffset);
    ctx.restore();
  }

  /**
   * Huge Punch: One or two massive words punched right in the center with impact
   */
  private static renderHugePunch(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    centerY: number,
    currentTime: number,
    scene: Scene,
    style: TypographyStyle
  ) {
    const activeWord = scene.words.find(w => currentTime >= w.start && currentTime <= w.end + 0.05)
      || scene.words[scene.words.length - 1];

    if (!activeWord) return;

    const baseFontSize = Math.round(width * 0.14);
    const text = activeWord.word.toUpperCase();

    const wordProgress = Math.min(1, Math.max(0, (currentTime - activeWord.start) / Math.max(0.01, activeWord.end - activeWord.start)));
    const scale = 1.0 + (Math.max(0, 0.35 * (1 - (wordProgress * 3))));

    ctx.save();
    ctx.translate(width / 2, centerY);
    ctx.scale(scale, scale);

    ctx.font = `900 ${baseFontSize}px Impact, Poppins, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 14;
    ctx.strokeText(text, 0, 0);

    ctx.shadowColor = style.highlightColor;
    ctx.shadowBlur = 24;
    ctx.fillStyle = activeWord.highlightColor || style.highlightColor;
    ctx.fillText(text, 0, 0);

    ctx.restore();
  }

  private static roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }
}
