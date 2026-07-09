import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { Marcha } from '../../types';
import styles from './MusicaPage.module.css';

const MARCHAS = [
  { title: 'Chimo',                    author: 'Leopoldo Magenti Chelvi',   year: '1958' },
  { title: 'La Entrada',               author: 'Pedro Mendo Rubio',         year: '1972' },
  { title: 'El Moro del Sinc',         author: 'Enrique Llácer Ruiz',       year: '1965' },
  { title: 'Jauja',                    author: 'Enrique Llácer Ruiz',       year: '1960' },
  { title: 'Marcha Cristiana de Villena', author: 'Banda Municipal de Villena', year: '2024' },
];

const TOTAL_SECS = 210; // 3:30

function formatTime(secs: number) {
  const s = Math.floor(secs);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export default function MusicaPage() {
  const { t } = useTranslation();
  const [isRecording, setIsRecording]     = useState(false);
  const [result, setResult]               = useState<Marcha | null>(null);
  const [audioPlaying, setAudioPlaying]   = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);

  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtxRef      = useRef<AudioContext | null>(null);
  const gainNodeRef      = useRef<GainNode | null>(null);

  // Limpiar al desmontar
  useEffect(() => () => {
    if (progressTimerRef.current !== null) clearInterval(progressTimerRef.current);
    if (gainNodeRef.current && audioCtxRef.current) {
      try { gainNodeRef.current.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.1); }
      catch { /* el nodo de audio ya puede estar cerrado: ignorar */ }
    }
  }, []);

  const stopAudioNodes = () => {
    if (progressTimerRef.current !== null) clearInterval(progressTimerRef.current);
    if (gainNodeRef.current && audioCtxRef.current) {
      try { gainNodeRef.current.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.15); }
      catch { /* el nodo de audio ya puede estar cerrado: ignorar */ }
    }
    gainNodeRef.current = null;
  };

  const startRecording = () => {
    if (isRecording) return;
    stopAudioNodes();
    setIsRecording(true);
    setResult(null);
    setAudioPlaying(false);
    setAudioProgress(0);

    setTimeout(() => {
      const pick = MARCHAS[Math.floor(Math.random() * MARCHAS.length)];
      setIsRecording(false);
      setResult(pick);
    }, 3500);
  };

  const playAudio = () => {
    if (audioPlaying) {
      stopAudioNodes();
      setAudioPlaying(false);
    } else {
      try {
        if (!audioCtxRef.current) {
          audioCtxRef.current = new AudioContext();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') ctx.resume();

        if (!gainNodeRef.current) {
          const gain = ctx.createGain();
          gain.gain.value = 0;
          gain.connect(ctx.destination);
          gainNodeRef.current = gain;

          const freqs = [392, 494, 587, 659, 784, 880];
          freqs.forEach((f, i) => {
            const osc  = ctx.createOscillator();
            const eg   = ctx.createGain();
            const filt = ctx.createBiquadFilter();
            osc.type = i % 2 === 0 ? 'sawtooth' : 'triangle';
            osc.frequency.value = f + (Math.random() - 0.5) * 6;
            filt.type = 'lowpass';
            filt.frequency.value = 900 + i * 180;
            filt.Q.value = 1.2;
            eg.gain.value = 0.14 / (i + 1);
            osc.connect(filt); filt.connect(eg); eg.connect(gain);
            osc.start();
          });
        }

        gainNodeRef.current.gain.setTargetAtTime(0.18, audioCtxRef.current.currentTime, 0.15);

        progressTimerRef.current = setInterval(() => {
          setAudioProgress(prev => {
            const next = prev + (100 / 2100);
            if (next >= 100) {
              if (progressTimerRef.current !== null) clearInterval(progressTimerRef.current);
              try { if (gainNodeRef.current && audioCtxRef.current) gainNodeRef.current.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.3); }
              catch { /* el nodo de audio ya puede estar cerrado: ignorar */ }
              setAudioPlaying(false);
              return 0;
            }
            return next;
          });
        }, 100);

        setAudioPlaying(true);
      } catch {
        setAudioPlaying(false);
      }
    }
  };

  const closeResult = () => {
    stopAudioNodes();
    setResult(null);
    setAudioPlaying(false);
    setAudioProgress(0);
  };

  const seekFromClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct  = Math.max(0, Math.min(100, (e.clientX - rect.left) / rect.width * 100));
    setAudioProgress(pct);
  };

  const curSecs = Math.round((audioProgress / 100) * TOTAL_SECS);
  const timeDisplay = formatTime(curSecs);

  return (
    <div className={styles.page}>

      {/* ── Castillo watermark ── */}
      <img
        src="/assets/castillo.png"
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        className={styles.castilloWatermark}
        alt=""
      />

      {/* ── Patrón hojas inferior ── */}
      <img
        src="/assets/patron-hojas.png"
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        className={styles.patronHojas}
        alt=""
      />

      {/* ── Título ── */}
      <div className={styles.titleWrap}>
        <h1 className={styles.title}>{t('musica.title')}</h1>
        <p className={styles.subtitle}>{t('musica.subtitle')}</p>
      </div>

      {/* ── Área botón + filamentos ── */}
      <div className={styles.buttonArea}>

        {/* Filamentos sway — solo cuando escucha */}
        {isRecording && (
          <>
            <div className={`${styles.filament} ${styles.filament1}`} />
            <div className={`${styles.filament} ${styles.filament2}`} />
            <div className={`${styles.filament} ${styles.filament3}`} />
            <div className={`${styles.filament} ${styles.filament4}`} />
            <div className={`${styles.filament} ${styles.filament5}`} />
            <div className={`${styles.filament} ${styles.filament6}`} />
          </>
        )}

        {/* Botón moneda */}
        <button onClick={startRecording} className={styles.recordButton} aria-label={t('musica.identifyAria')}>
          {/* Fallback si no hay imagen */}
          <img
            src="/assets/circulo-boton.png"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.style.display = 'none';
              if (img.nextSibling) (img.nextSibling as HTMLElement).style.display = 'flex';
            }}
            className={styles.buttonImg}
            alt=""
          />
          {/* Fallback visual */}
          <div className={styles.buttonFallback}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(60,35,0,.9)" strokeWidth="2" strokeLinecap="round">
              <path d="M9 18V5l12-2v13"/>
              <circle cx="6" cy="18" r="3"/>
              <circle cx="18" cy="16" r="3"/>
            </svg>
          </div>
        </button>
      </div>

      {/* ── Estado texto ── */}
      <div className={styles.statusText}>
        <span className={`${styles.statusLabel}${isRecording ? ` ${styles.statusLabelBlinking}` : ''}`}>
          {isRecording ? t('musica.listening') : result ? '' : t('musica.pressToIdentify')}
        </span>
      </div>

      {/* ── Result card ── */}
      {result && (
        <div className={styles.resultWrap}>
          {/* Halo */}
          <div className={styles.resultHalo} />
          {/* Card */}
          <div className={styles.resultCard}>
            <div className={styles.cardPadding}>

              {/* Header row */}
              <div className={styles.headerRow}>
                <div className={styles.headerDotWrap}>
                  <div className={styles.headerDot} />
                  <span className={styles.headerLabel}>{t('musica.identified')}</span>
                </div>
                <button onClick={closeResult} className={styles.closeBtn} aria-label={t('musica.closeResultAria')}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7a9070" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6"  x2="6"  y2="18"/>
                    <line x1="6"  y1="6"  x2="18" y2="18"/>
                  </svg>
                </button>
              </div>

              {/* Track info */}
              <div className={styles.trackInfo}>
                <div className={styles.trackIcon}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="rgba(60,35,0,.9)" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M9 18V5l12-2v13"/>
                    <circle cx="6" cy="18" r="3"/>
                    <circle cx="18" cy="16" r="3"/>
                  </svg>
                </div>
                <div className={styles.trackDetails}>
                  <div className={styles.trackTitle}>{result.title}</div>
                  <div className={styles.trackAuthor}>{result.author}</div>
                  <div className={styles.trackYear}>{result.year}</div>
                </div>
              </div>

              {/* Barra de progreso */}
              <div className={styles.progressWrap}>
                <div
                  onClick={seekFromClick}
                  role="slider"
                  tabIndex={0}
                  aria-label={t('musica.progressAria')}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(audioProgress)}
                  className={styles.progressBar}
                >
                  <div className={styles.progressFill} style={{ width: `${audioProgress}%` }} />
                </div>
                <div className={styles.timeRow}>
                  <span className={styles.timeText}>{timeDisplay}</span>
                  <span className={styles.timeText}>3:30</span>
                </div>
              </div>

              {/* Controles */}
              <div className={styles.controls}>
                <button className={styles.skipBtn} aria-label={t('musica.previousAria')} disabled>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c9af75" strokeWidth="1.8" strokeLinecap="round">
                    <polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5"/>
                  </svg>
                </button>
                <button onClick={playAudio} className={styles.playBtn} aria-label={audioPlaying ? t('musica.pauseAria') : t('musica.playAria')}>
                  {audioPlaying ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="rgba(60,35,0,.9)">
                      <rect x="6" y="4" width="4" height="16" rx="1"/>
                      <rect x="14" y="4" width="4" height="16" rx="1"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="rgba(60,35,0,.9)">
                      <polygon points="6,3 20,12 6,21"/>
                    </svg>
                  )}
                </button>
                <button className={styles.skipBtn} aria-label={t('musica.nextAria')} disabled>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c9af75" strokeWidth="1.8" strokeLinecap="round">
                    <polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
