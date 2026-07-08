import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAvisos, timeAgo } from '../../services/avisosService';
import { useAuth } from '../../hooks/useAuth';
import LoginSection from './LoginSection';
import type { InfoView, Aviso } from '../../types';
import styles from './InfoPage.module.css';

const LANGS = [
  { code: 'ES', name: 'Español',   img: 'https://flagcdn.com/es.svg',  imgW: 'auto' },
  { code: 'VA', name: 'Valencià',  img: 'https://openmoji.org/data/color/svg/1F3F4-E0065-E0073-E0076-E0063-E007F.svg', imgW: '26px' },
  { code: 'GB', name: 'English',   img: 'https://flagcdn.com/gb.svg',  imgW: 'auto' },
  { code: 'FR', name: 'Français',  img: 'https://flagcdn.com/fr.svg',  imgW: 'auto' },
  { code: 'DE', name: 'Deutsch',   img: 'https://flagcdn.com/de.svg',  imgW: 'auto' },
  { code: 'CN', name: '中文',       img: 'https://flagcdn.com/cn.svg',  imgW: 'auto' },
];


const GALLERY_PHOTOS = [
  { url: 'photo-1677055290576-ecbf1babede7', ratio: '3/4' },
  { url: 'photo-1718563300857-d2f084703fe9', ratio: '4/3' },
  { url: 'photo-1533551268962-824e232f7ee1', ratio: '1/1' },
  { url: 'photo-1728329849278-e1e74d73425d', ratio: '4/3' },
  { url: 'photo-1755781988015-d1e9c6256e1d', ratio: '3/4' },
  { url: 'photo-1677055380601-393348dc342c', ratio: '1/1' },
  { url: 'photo-1677055290576-ecbf1babede7', ratio: '4/3' },
  { url: 'photo-1718563300857-d2f084703fe9', ratio: '3/4' },
  { url: 'photo-1533551268962-824e232f7ee1', ratio: '4/3' },
  { url: 'photo-1728329849278-e1e74d73425d', ratio: '1/1' },
  { url: 'photo-1755781988015-d1e9c6256e1d', ratio: '4/3' },
  { url: 'photo-1677055380601-393348dc342c', ratio: '3/4' },
];

const SERVICIOS = [
  { label: 'Aparcar',     icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0b1a0b" strokeWidth="2" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><circle cx="8" cy="14" r="1.5"/><circle cx="16" cy="14" r="1.5"/></svg> },
  { label: 'Dormir',      icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0b1a0b" strokeWidth="2" strokeLinecap="round"><rect x="2" y="3" width="20" height="18" rx="2"/><line x1="2" y1="9" x2="22" y2="9"/><line x1="12" y1="3" x2="12" y2="9"/></svg> },
  { label: 'Comer',       icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0b1a0b" strokeWidth="2" strokeLinecap="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2"/><line x1="7" y1="2" x2="7" y2="11"/><path d="M21 15V2a5 5 0 00-5 5v6h3l-1 11h3l-1-11h1z"/></svg> },
  { label: 'Transporte',  icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0b1a0b" strokeWidth="2" strokeLinecap="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M16 19v2M8 19v2M2 9h20"/><circle cx="7" cy="15" r="1"/><circle cx="17" cy="15" r="1"/></svg> },
  { label: 'Que visitar', icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0b1a0b" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg> },
  { label: 'Parajes',     icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0b1a0b" strokeWidth="2" strokeLinecap="round"><polyline points="22,2 2,22"/><polyline points="12,2 2,12"/><polyline points="22,12 12,22"/></svg> },
  { label: 'Comercio',    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0b1a0b" strokeWidth="2" strokeLinecap="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg> },
  { label: 'Mapa',        icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0b1a0b" strokeWidth="2" strokeLinecap="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg> },
];

const REVISTAS = [
  { title: 'Revista Festera JCF Villena', period: 'SEPTIEMBRE 2025', author: 'JCF Villena', bg: 'linear-gradient(135deg,#0d1e12,#1a4a2a)', img: 'https://images.unsplash.com/photo-1677055290576-ecbf1babede7?w=600&h=320&fit=crop&auto=format', opacity: .55, overlay: 'to right' },
  { title: 'Boletín Comparsas de Villena', period: 'ESPECIAL 2024',  author: 'JCF Villena', bg: 'linear-gradient(135deg,#3d2510,#6a4a2a)', img: 'https://images.unsplash.com/photo-1533551268962-824e232f7ee1?w=600&h=320&fit=crop&auto=format', opacity: .45, overlay: 'to right' },
  { title: '150 Años de Fiesta en Villena', period: 'HISTORIA',     author: '150 Años de Fiesta', bg: 'linear-gradient(135deg,#1e2a4a,#2a4a7a)', img: 'https://images.unsplash.com/photo-1728329849278-e1e74d73425d?w=600&h=320&fit=crop&auto=format', opacity: .45, overlay: 'to right' },
];

interface GalleryPhoto {
  url: string;
  ratio: string;
  full?: string;
  thumb?: string;
  isLast?: boolean;
}

export default function InfoPage() {
  const [searchParams] = useSearchParams();
  const initialView = searchParams.get('view') as InfoView;
  // La pestaña inicial depende de ?view=... en la URL, ya disponible en el
  // primer render — se deriva aquí en vez de sincronizarla con un efecto.
  const [mainTab,    setMainTab]    = useState(initialView === 'avisos' ? 'multimedia' : 'servicios');
  const [multiTab,   setMultiTab]   = useState('avisos');
  const [avisos,     setAvisos]     = useState<Aviso[]>([]);
  const [loginOpen,  setLoginOpen]  = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    getAvisos().then(setAvisos).catch(() => setAvisos([]));
  }, []);
  const [selectedLang, setSelectedLang] = useState('ES');
  const [focusedPhoto, setFocusedPhoto] = useState<string | null>(null);

  // Preparar columnas de galería
  const cols: GalleryPhoto[][] = [[], [], []];
  GALLERY_PHOTOS.forEach((d, i) => cols[i % 3].push(d));
  const makeCol = (items: GalleryPhoto[]) => items.map((d, i) => ({
    ...d,
    full:  `https://images.unsplash.com/${d.url}?w=600&fit=crop&auto=format`,
    thumb: `https://images.unsplash.com/${d.url}?w=300&fit=crop&auto=format`,
    isLast: i === items.length - 1,
  }));
  const [col1, col2, col3] = cols.map(makeCol);

  return (
    <div className={styles.page}>
      {/* ── Título ── */}
      <div className={styles.titleBar}>
        <h1>Info Práctica</h1>
        <button className={styles.authBtn} onClick={() => setLoginOpen(true)}>
          {user ? (
            user.user_metadata?.avatar_url
              ? <img src={user.user_metadata.avatar_url as string} className={styles.authAvatar} alt="" />
              : <span className={styles.authInitial}>{(user.email?.[0] ?? '?').toUpperCase()}</span>
          ) : (
            <span className={styles.authLabel}>Acceder</span>
          )}
        </button>
      </div>

      <LoginSection open={loginOpen} onClose={() => setLoginOpen(false)} />

      {/* ── Toggle principal Servicios / Multimedia ── */}
      <div className={styles.mainToggle}>
        <button
          className={`${styles.mainTabBtn}${mainTab === 'servicios' ? ` ${styles.active}` : ''}`}
          onClick={() => setMainTab('servicios')}
        >
          Servicios
        </button>
        <button
          className={`${styles.mainTabBtn}${mainTab === 'multimedia' ? ` ${styles.active}` : ''}`}
          onClick={() => setMainTab('multimedia')}
        >
          Multimedia
        </button>
      </div>

      {/* ════════ SERVICIOS ════════ */}
      {mainTab === 'servicios' && (
        <div>
          <div className={styles.serviciosLabel}>
            <span>Información de Interés</span>
          </div>

          {/* Grid iconos servicios */}
          <div className={styles.serviciosGrid}>
            {SERVICIOS.map(s => (
              <div key={s.label} className={styles.servicioItem}>
                <div className={styles.servicioIcon}>{s.icon}</div>
                <span className={styles.servicioLabel}>{s.label}</span>
              </div>
            ))}
          </div>

          {/* Selector de idioma */}
          <div className={styles.langSectionLabel}>
            <span>Idioma de la App</span>
          </div>
          <div className={styles.langList}>
            {LANGS.map(l => {
              const active = selectedLang === l.code;
              return (
                <div
                  key={l.code}
                  onClick={() => setSelectedLang(l.code)}
                  className={`${styles.langItem}${active ? ` ${styles.active}` : ''}`}
                >
                  <img
                    src={l.img}
                    className={styles.langFlag}
                    style={{ width: l.imgW }}
                    alt={l.name}
                  />
                  <span>{l.name}</span>
                </div>
              );
            })}
          </div>

          {/* Puntos clave y contacto */}
          <div className={styles.poiLabel}>
            <span>Puntos Clave y Contacto</span>
          </div>
          <div className={styles.poiList}>
            {[
              { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c4972a" strokeWidth="1.8" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.24h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.86a16 16 0 0 0 6 6l.86-.86a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z"/></svg>, title: 'Teléfonos de Interés', sub: 'Emergencias 112 / Policía 092', border: true },
              { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c4972a" strokeWidth="1.8" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>, title: 'Caseta de Información', sub: 'Punto Festero Central y Mapas', border: true },
              { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c4972a" strokeWidth="1.8" strokeLinecap="round"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg>, title: 'Asistencia Sanitaria', sub: 'Zonas de Primeros Auxilios', border: false },
            ].map((item, i) => (
              <div
                key={i}
                className={`${styles.poiItem}${item.border ? ` ${styles.poiItemBorder}` : ''}`}
              >
                <div className={styles.poiIconWrap}>{item.icon}</div>
                <div className={styles.poiInfo}>
                  <div className={styles.poiTitle}>{item.title}</div>
                  <div className={styles.poiSub}>{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════ MULTIMEDIA ════════ */}
      {mainTab === 'multimedia' && (
        <div>
          {/* Sub-tabs */}
          <div className={styles.subtabs}>
            <button
              className={`${styles.subtab}${multiTab === 'avisos' ? ` ${styles.active}` : ''}`}
              onClick={() => setMultiTab('avisos')}
            >
              Avisos
            </button>
            <button
              className={`${styles.subtab}${multiTab === 'galeria' ? ` ${styles.active}` : ''}`}
              onClick={() => setMultiTab('galeria')}
            >
              Galería
            </button>
            <button
              className={`${styles.subtab}${multiTab === 'revistas' ? ` ${styles.active}` : ''}`}
              onClick={() => setMultiTab('revistas')}
            >
              Revistas
            </button>
          </div>

          {/* ── Avisos ── */}
          {multiTab === 'avisos' && (
            <div className={styles.avisosList}>
              {avisos.map(n => (
                <div
                  key={n.id}
                  className={`${styles.avisosItem}${n.is_new ? ` ${styles.isNew}` : ''}`}
                >
                  <div className={styles.avisosInner}>
                    <div className={`${styles.avisosDot}${n.is_new ? ` ${styles.isNew}` : ''}`} />
                    <div className={styles.avisosContent}>
                      <div className={`${styles.avisosText}${n.is_new ? ` ${styles.isNew}` : ''}`}>
                        {n.text}
                      </div>
                      <div className={styles.avisosTime}>{timeAgo(n.created_at)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Galería ── */}
          {multiTab === 'galeria' && (
            <div className={styles.galeria}>
              {[col1, col2, col3].map((col, ci) => (
                <div key={ci} className={styles.galeriaCol}>
                  {col.map((photo: GalleryPhoto, pi: number) => (
                    <img
                      key={pi}
                      src={photo.thumb}
                      onClick={() => setFocusedPhoto(photo.full ?? null)}
                      className={styles.galeriaImg}
                      style={{
                        aspectRatio: photo.isLast ? undefined : photo.ratio,
                        flex: photo.isLast ? '1' : undefined,
                        minHeight: photo.isLast ? '80px' : undefined,
                      }}
                      alt=""
                    />
                  ))}
                </div>
              ))}

              {/* Lightbox */}
              {focusedPhoto && (
                <div className={styles.lightbox} onClick={() => setFocusedPhoto(null)}>
                  <img src={focusedPhoto} className={styles.lightboxImg} alt="" />
                  <div className={styles.lightboxClose}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Revistas ── */}
          {multiTab === 'revistas' && (
            <div className={styles.revistas}>
              {REVISTAS.map((r, i) => (
                <div key={i} className={styles.revistaCard} style={{ background: r.bg }}>
                  <img src={r.img} className={styles.revistaImg} style={{ opacity: r.opacity }} alt="" />
                  <div
                    className={styles.revistaOverlay}
                    style={{ background: `linear-gradient(${r.overlay},rgba(0,0,0,.7) 55%,transparent)` }}
                  />
                  <div className={styles.revistaContent}>
                    <h3 className={styles.revistaTitle}>{r.title}</h3>
                    <div className={styles.revistaFooter}>
                      <div className={styles.revisataInfo}>
                        <div className={styles.revistaPeriod}>{r.period}</div>
                        <div className={styles.revistaAuthor}>{r.author}</div>
                      </div>
                      <button className={styles.revistaBtn}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0b1a0b" strokeWidth="2.5" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="12" x2="12" y2="18"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
                        <span className={styles.revistaBtnLabel}>LEER PDF</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
