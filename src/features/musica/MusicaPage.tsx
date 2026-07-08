import React, { useState, useRef, useEffect } from 'react';
import type { Marcha } from '../../types';

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
    <div style={{ position: 'relative', height: 'calc(100dvh - 68px)', background: '#02120a', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

      {/* ── Castillo watermark ── */}
      <img
        src="/assets/castillo.png"
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        style={{ position: 'absolute', top: '120px', left: '50%', transform: 'translateX(-50%)', width: '380px', opacity: '.16', pointerEvents: 'none', WebkitMaskImage: 'linear-gradient(to bottom,black 45%,transparent 100%)', maskImage: 'linear-gradient(to bottom,black 45%,transparent 100%)' }}
        alt=""
      />

      {/* ── Patrón hojas inferior ── */}
      <img
        src="/assets/patron-hojas.png"
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', opacity: '.45', pointerEvents: 'none', WebkitMaskImage: 'linear-gradient(to bottom,transparent 0%,black 45%)', maskImage: 'linear-gradient(to bottom,transparent 0%,black 45%)' }}
        alt=""
      />

      {/* ── Título ── */}
      <div style={{ position: 'relative', zIndex: 2, marginTop: 'calc(52px + var(--safe-top))', textAlign: 'center', padding: '0 20px' }}>
        <h1 style={{ fontFamily: "'Cinzel',serif", fontSize: '27px', fontWeight: '700', color: '#c9af75', margin: '0 0 8px', letterSpacing: '2px', textShadow: '2px 2px 0 rgba(0,0,0,.6),3px 3px 0 rgba(0,0,0,.3),0 0 30px rgba(201,175,117,.25)' }}>
          VILLENA SUENA
        </h1>
        <p style={{ fontFamily: "'Lato',sans-serif", fontSize: '13px', color: '#baa883', margin: 0, textShadow: '0 1px 6px rgba(0,0,0,.5)' }}>
          El detector de marchas festeras de Villena
        </p>
      </div>

      {/* ── Área botón + filamentos ── */}
      <div style={{ position: 'relative', width: '280px', height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '28px', zIndex: 2 }}>

        {/* Filamentos sway — solo cuando escucha */}
        {isRecording && (
          <>
            <div style={{ position: 'absolute', width: '200px', height: '180px', borderRadius: '50%', border: '2px solid rgba(201,175,117,.45)', filter: 'blur(1px)', boxShadow: '0 0 12px rgba(201,175,117,.4),inset 0 0 8px rgba(201,175,117,.15)', animation: 'sway1 3s ease-in-out alternate infinite', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', width: '180px', height: '205px', borderRadius: '50%', border: '1.5px solid rgba(30,210,100,.50)', filter: 'blur(1px)', boxShadow: '0 0 14px rgba(30,210,100,.4),inset 0 0 8px rgba(30,210,100,.15)', animation: 'sway2 3.8s ease-in-out alternate infinite', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', width: '195px', height: '195px', borderRadius: '50%', border: '2px solid rgba(100,220,80,.42)', filter: 'blur(1px)', boxShadow: '0 0 14px rgba(100,220,80,.35),inset 0 0 6px rgba(100,220,80,.12)', animation: 'sway3 2.6s ease-in-out alternate infinite', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', width: '210px', height: '160px', borderRadius: '50%', border: '1.5px solid rgba(201,175,117,.38)', filter: 'blur(1.5px)', boxShadow: '0 0 10px rgba(201,175,117,.3),inset 0 0 5px rgba(201,175,117,.1)', animation: 'sway4 4.5s ease-in-out alternate infinite', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', width: '165px', height: '220px', borderRadius: '50%', border: '2px solid rgba(20,230,90,.52)', filter: 'blur(1px)', boxShadow: '0 0 18px rgba(20,230,90,.45),inset 0 0 10px rgba(20,230,90,.18)', animation: 'sway5 2.2s ease-in-out alternate infinite', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', width: '215px', height: '200px', borderRadius: '50%', border: '1.5px solid rgba(160,230,50,.42)', filter: 'blur(1px)', boxShadow: '0 0 12px rgba(160,230,50,.35),inset 0 0 6px rgba(160,230,50,.12)', animation: 'sway6 3.4s ease-in-out alternate infinite', pointerEvents: 'none' }} />
          </>
        )}

        {/* Botón moneda */}
        <button
          onClick={startRecording}
          style={{ position: 'relative', width: '176px', height: '176px', borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'none', padding: 0, zIndex: 3, animation: 'heartbeat 2.8s ease-in-out infinite' }}
        >
          {/* Fallback si no hay imagen */}
          <img
            src="/assets/circulo-boton.png"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.style.display = 'none';
              if (img.nextSibling) (img.nextSibling as HTMLElement).style.display = 'flex';
            }}
            style={{ width: '100%', height: '100%', borderRadius: '50%', display: 'block' }}
            alt="Identificar marcha"
          />
          {/* Fallback visual */}
          <div style={{
            display: 'none', width: '176px', height: '176px', borderRadius: '50%',
            background: 'linear-gradient(145deg,#d4aa44,#a07820)',
            alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 40px rgba(196,151,42,.5)',
          }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(60,35,0,.9)" strokeWidth="2" strokeLinecap="round">
              <path d="M9 18V5l12-2v13"/>
              <circle cx="6" cy="18" r="3"/>
              <circle cx="18" cy="16" r="3"/>
            </svg>
          </div>
        </button>
      </div>

      {/* ── Estado texto ── */}
      <div style={{ position: 'relative', zIndex: 2, minHeight: '28px', textAlign: 'center', marginTop: '4px' }}>
        <span style={{
          fontFamily: "'Lato',sans-serif", fontSize: '14px', color: 'rgba(186,168,131,.8)', letterSpacing: '2px',
          animation: isRecording ? 'blink 1s ease-in-out infinite' : undefined,
        }}>
          {isRecording ? 'ESCUCHANDO...' : result ? '' : 'Pulsa para identificar'}
        </span>
      </div>

      {/* ── Result card ── */}
      {result && (
        <div style={{ position: 'relative', zIndex: 2, width: 'calc(100% - 28px)', marginTop: '16px', animation: 'slideUpFade .55s cubic-bezier(.22,.9,.32,1) both' }}>
          {/* Halo */}
          <div style={{ position: 'absolute', inset: '-1px', borderRadius: '22px', background: 'linear-gradient(135deg,rgba(196,151,42,.35),rgba(40,160,80,.2),rgba(196,151,42,.15))', filter: 'blur(4px)', zIndex: 0 }} />
          {/* Card */}
          <div style={{ position: 'relative', zIndex: 1, background: 'linear-gradient(160deg,rgba(8,30,16,.97) 0%,rgba(3,15,8,.99) 100%)', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(196,151,42,.3)' }}>
            <div style={{ padding: '18px 18px 20px' }}>

              {/* Header row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#c4972a', boxShadow: '0 0 6px #c4972a' }} />
                  <span style={{ fontFamily: "'Cinzel',serif", fontSize: '10px', fontWeight: '700', color: '#c4972a', letterSpacing: '2.5px' }}>IDENTIFICADO</span>
                </div>
                <button onClick={closeResult} style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.1)', cursor: 'pointer', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7a9070" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6"  x2="6"  y2="18"/>
                    <line x1="6"  y1="6"  x2="18" y2="18"/>
                  </svg>
                </button>
              </div>

              {/* Track info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
                <div style={{ width: '54px', height: '54px', borderRadius: '12px', background: 'linear-gradient(145deg,#d4aa44,#a07820)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 6px 20px rgba(196,151,42,.45),inset 0 1px 0 rgba(255,220,100,.3)' }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="rgba(60,35,0,.9)" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M9 18V5l12-2v13"/>
                    <circle cx="6" cy="18" r="3"/>
                    <circle cx="18" cy="16" r="3"/>
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "'Cinzel',serif", color: '#e8d5a0', fontSize: '16px', fontWeight: '700', marginBottom: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textShadow: '0 0 20px rgba(196,151,42,.4)' }}>
                    {result.title}
                  </div>
                  <div style={{ fontFamily: "'Lato',sans-serif", fontSize: '12px', color: '#7a9070', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{result.author}</div>
                  <div style={{ fontFamily: "'Lato',sans-serif", fontSize: '11px', color: 'rgba(196,151,42,.6)', marginTop: '2px' }}>{result.year}</div>
                </div>
              </div>

              {/* Barra de progreso */}
              <div style={{ marginBottom: '14px' }}>
                <div
                  onClick={seekFromClick}
                  style={{ height: '3px', background: 'rgba(196,151,42,.15)', borderRadius: '2px', cursor: 'pointer', position: 'relative' }}
                >
                  <div style={{ width: audioProgress + '%', height: '100%', background: 'linear-gradient(to right,#c4972a,#d4aa44)', borderRadius: '2px', transition: 'width .1s linear' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                  <span style={{ fontFamily: "'Lato',sans-serif", fontSize: '11px', color: '#7a9070' }}>{timeDisplay}</span>
                  <span style={{ fontFamily: "'Lato',sans-serif", fontSize: '11px', color: '#7a9070' }}>3:30</span>
                </div>
              </div>

              {/* Controles */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: '.5', padding: '4px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c9af75" strokeWidth="1.8" strokeLinecap="round">
                    <polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5"/>
                  </svg>
                </button>
                <button
                  onClick={playAudio}
                  style={{ width: '54px', height: '54px', borderRadius: '50%', background: 'linear-gradient(145deg,#d4aa44,#a07820)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 20px rgba(196,151,42,.5),inset 0 1px 0 rgba(255,220,100,.3)' }}
                >
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
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: '.5', padding: '4px' }}>
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
