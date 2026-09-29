export async function extractAudioPeaks(audioBlob: Blob, numPeaks = 120): Promise<number[]> {
  try {
    const arrayBuffer = await audioBlob.arrayBuffer();
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) {
      return generateSyntheticPeaks(numPeaks);
    }

    const audioCtx = new AudioContextClass();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer.slice(0));
    await audioCtx.close();

    const channelData = audioBuffer.getChannelData(0);
    const blockSize = Math.floor(channelData.length / numPeaks);
    const peaks: number[] = [];

    for (let i = 0; i < numPeaks; i++) {
      const start = i * blockSize;
      let sum = 0;
      for (let j = 0; j < blockSize; j++) {
        sum += Math.abs(channelData[start + j] || 0);
      }
      const avg = sum / blockSize;
      // Normalize with dynamic scaling
      peaks.push(Math.min(1, Math.max(0.1, avg * 4)));
    }

    return peaks;
  } catch (err) {
    console.warn('Audio decoding failed, using synthetic peaks for waveform:', err);
    return generateSyntheticPeaks(numPeaks);
  }
}

export function generateSyntheticPeaks(numPeaks = 120): number[] {
  const peaks: number[] = [];
  for (let i = 0; i < numPeaks; i++) {
    // Natural looking audio speech rhythm
    const val = 0.2 + (Math.sin(i * 0.15) * 0.3) + (Math.cos(i * 0.4) * 0.25) + (Math.random() * 0.2);
    peaks.push(Math.min(0.95, Math.max(0.12, Math.abs(val))));
  }
  return peaks;
}
