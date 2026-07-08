import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Hook reproductor de audio usando HTML5 Audio API.
 * Preparado para archivos reales — cuando tengas las marchas, pasa la URL como src.
 */
export function useAudio(src: string | null = null) {
  const audioRef    = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [playing,     setPlaying]     = useState(false);
  const [progress,    setProgress]    = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration,    setDuration]    = useState(0);

  useEffect(() => {
    if (!src) { audioRef.current = null; return; }
    const audio = new Audio(src);
    audioRef.current = audio;
    audio.addEventListener('loadedmetadata', () => setDuration(audio.duration));
    audio.addEventListener('ended', () => { setPlaying(false); setProgress(0); setCurrentTime(0); });
    return () => { audio.pause(); audio.src = ''; };
  }, [src]);

  useEffect(() => {
    if (playing && audioRef.current) {
      intervalRef.current = setInterval(() => {
        const a = audioRef.current;
        if (!a) return;
        const pct = a.duration ? (a.currentTime / a.duration) * 100 : 0;
        setProgress(pct);
        setCurrentTime(a.currentTime);
      }, 250);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing]);

  const play = useCallback(() => {
    if (audioRef.current) { audioRef.current.play().then(() => setPlaying(true)).catch(() => {}); }
    else { setPlaying(true); }
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current) audioRef.current.pause();
    setPlaying(false);
  }, []);

  const toggle = useCallback(() => { playing ? pause() : play(); }, [playing, play, pause]);

  const seek = useCallback((pct: number) => {
    const clamped = Math.max(0, Math.min(100, pct));
    setProgress(clamped);
    if (audioRef.current && audioRef.current.duration) {
      audioRef.current.currentTime = (clamped / 100) * audioRef.current.duration;
      setCurrentTime(audioRef.current.currentTime);
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
    setPlaying(false); setProgress(0); setCurrentTime(0);
  }, []);

  const formatTime = (secs: number) => {
    const s = Math.floor(secs);
    return String(Math.floor(s / 60)) + ':' + String(s % 60).padStart(2, '0');
  };

  return { playing, progress, currentTime, duration,
    currentTimeDisplay: formatTime(currentTime),
    durationDisplay: formatTime(duration || 210),
    play, pause, toggle, seek, stop };
}
