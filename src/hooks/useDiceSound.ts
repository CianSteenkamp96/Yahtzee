import { useCallback, useRef } from 'react';

const SOUND_DURATION = 2.5;

function createBrownNoise(audioContext: AudioContext, duration: number): AudioBuffer {
  const frameCount = Math.floor(audioContext.sampleRate * duration);
  const buffer = audioContext.createBuffer(1, frameCount, audioContext.sampleRate);
  const channel = buffer.getChannelData(0);
  let lastOut = 0;

  for (let i = 0; i < frameCount; i++) {
    const white = Math.random() * 2 - 1;
    // Brown noise: integrate white noise (emphasizes low frequencies)
    lastOut = (lastOut + 0.02 * white) / 1.02;
    channel[i] = lastOut * 3.5;
  }

  return buffer;
}

function createImpactNoise(audioContext: AudioContext, duration: number): AudioBuffer {
  const frameCount = Math.floor(audioContext.sampleRate * duration);
  const buffer = audioContext.createBuffer(1, frameCount, audioContext.sampleRate);
  const channel = buffer.getChannelData(0);

  for (let i = 0; i < frameCount; i++) {
    channel[i] = Math.random() * 2 - 1;
  }

  return buffer;
}

export function useDiceSound() {
  const contextRef = useRef<AudioContext | null>(null);

  const playRollSound = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const AudioContextCtor =
      window.AudioContext ??
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

    if (!AudioContextCtor) {
      return;
    }

    const audioContext = contextRef.current ?? new AudioContextCtor();
    contextRef.current = audioContext;

    if (audioContext.state === 'suspended') {
      void audioContext.resume();
    }

    const now = audioContext.currentTime;

    // === Layer 1: Deep bass rumble (table vibration) ===
    const bassSource = audioContext.createBufferSource();
    bassSource.buffer = createBrownNoise(audioContext, SOUND_DURATION);

    const bassLowpass = audioContext.createBiquadFilter();
    bassLowpass.type = 'lowpass';
    bassLowpass.frequency.setValueAtTime(180, now);
    bassLowpass.Q.setValueAtTime(0.7, now);

    const bassGain = audioContext.createGain();
    bassGain.gain.setValueAtTime(0.0001, now);
    bassGain.gain.linearRampToValueAtTime(0.6, now + 0.05);
    bassGain.gain.setValueAtTime(0.6, now + 0.3);
    bassGain.gain.exponentialRampToValueAtTime(0.0001, now + SOUND_DURATION);

    bassSource.connect(bassLowpass);
    bassLowpass.connect(bassGain);
    bassGain.connect(audioContext.destination);
    bassSource.start(now);
    bassSource.stop(now + SOUND_DURATION);

    // === Layer 2: Mid-range rolling body ===
    const bodySource = audioContext.createBufferSource();
    bodySource.buffer = createBrownNoise(audioContext, SOUND_DURATION);

    const bodyBandpass = audioContext.createBiquadFilter();
    bodyBandpass.type = 'bandpass';
    bodyBandpass.frequency.setValueAtTime(350, now);
    bodyBandpass.Q.setValueAtTime(0.8, now);

    const bodyGain = audioContext.createGain();
    bodyGain.gain.setValueAtTime(0.0001, now);
    bodyGain.gain.linearRampToValueAtTime(0.3, now + 0.04);
    bodyGain.gain.setValueAtTime(0.3, now + 0.2);
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + SOUND_DURATION * 0.9);

    bodySource.connect(bodyBandpass);
    bodyBandpass.connect(bodyGain);
    bodyGain.connect(audioContext.destination);
    bodySource.start(now);
    bodySource.stop(now + SOUND_DURATION);

    // === Layer 3: Percussive impacts (dice clicking together) ===
    const impactCount = 16;
    for (let i = 0; i < impactCount; i++) {
      // Impacts cluster at the start, spread out and get quieter
      const progress = i / impactCount;
      const spacing = 0.04 + progress * 0.25;
      const impactTime = now + (i === 0 ? 0 : spacing * i * 0.55);

      if (impactTime > now + SOUND_DURATION * 0.85) break;

      const impactDuration = 0.015 + Math.random() * 0.025;
      const volume = 0.45 * Math.pow(1 - progress, 0.5);

      const impactSource = audioContext.createBufferSource();
      impactSource.buffer = createImpactNoise(audioContext, impactDuration);

      const impactFilter = audioContext.createBiquadFilter();
      impactFilter.type = 'bandpass';
      impactFilter.frequency.setValueAtTime(600 + Math.random() * 1200, impactTime);
      impactFilter.Q.setValueAtTime(3 + Math.random() * 5, impactTime);

      const impactGain = audioContext.createGain();
      impactGain.gain.setValueAtTime(0.0001, impactTime);
      impactGain.gain.linearRampToValueAtTime(volume, impactTime + 0.002);
      impactGain.gain.exponentialRampToValueAtTime(0.0001, impactTime + impactDuration);

      impactSource.connect(impactFilter);
      impactFilter.connect(impactGain);
      impactGain.connect(audioContext.destination);
      impactSource.start(impactTime);
      impactSource.stop(impactTime + impactDuration);
    }
  }, []);

  return { playRollSound };
}

export default useDiceSound;
