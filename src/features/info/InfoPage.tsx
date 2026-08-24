import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getAvisos, timeAgo } from '../../services/avisosService';
import { useAuth } from '../../hooks/useAuth';
import UserAvatar from '../../components/UserAvatar';
import LoginSection from './LoginSection';
import LegalModal from './LegalModal';
import { onActivateKey } from '../../utils/a11y';
import { SUPPORTED_LANGUAGES } from '../../i18n/languages';
import type { InfoView, Aviso } from '../../types';
import MapPage from './MapPage';
import styles from './InfoPage.module.css';


// Fotos reales de las fiestas 2025, tomadas de
// https://www.morosycristianosvillena.com/fotos-moros-y-cristianos/
// A propósito, fotos fijas de una edición pasada — no hay que auto-actualizar
// esto ni añadir ningún componente que las traiga dinámicamente.
const GALLERY_PHOTOS_BASE_URL =
  'https://www.morosycristianosvillena.com/wp-content/uploads/2025/09/fotos-fiestas-moros-cristianos-villena-2025-escuadras-moors-christians-spain-';

const GALLERY_PHOTO_NUMBERS = [1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13];

// Proporciones alternadas para el efecto Masonry (cajas de distinta altura
// por columna) — object-fit: cover recorta cada foto real a esta forma,
// no depende de las dimensiones nativas de la imagen. Más altas que un
// grid típico a propósito, para que la galería llene la pantalla.
const GALLERY_RATIOS = ['2/3', '3/4', '4/5', '3/4', '2/3', '4/5', '3/4', '2/3', '3/4', '4/5', '3/4', '2/3'];

const GALLERY_PHOTOS = GALLERY_PHOTO_NUMBERS.map((n, i) => ({
  full:  `${GALLERY_PHOTOS_BASE_URL}${n}.webp`,
  thumb: `${GALLERY_PHOTOS_BASE_URL}${n}-400x225.webp`,
  ratio: GALLERY_RATIOS[i],
}));

const SERVICIOS = [
  { key: 'servicioAparcar',     icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0b1a0b" strokeWidth="2" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><circle cx="8" cy="14" r="1.5"/><circle cx="16" cy="14" r="1.5"/></svg> },
  { key: 'servicioDormir',      icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0b1a0b" strokeWidth="2" strokeLinecap="round"><rect x="2" y="3" width="20" height="18" rx="2"/><line x1="2" y1="9" x2="22" y2="9"/><line x1="12" y1="3" x2="12" y2="9"/></svg> },
  { key: 'servicioComer',       icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0b1a0b" strokeWidth="2" strokeLinecap="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2"/><line x1="7" y1="2" x2="7" y2="11"/><path d="M21 15V2a5 5 0 00-5 5v6h3l-1 11h3l-1-11h1z"/></svg> },
  { key: 'servicioTransporte',  icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0b1a0b" strokeWidth="2" strokeLinecap="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M16 19v2M8 19v2M2 9h20"/><circle cx="7" cy="15" r="1"/><circle cx="17" cy="15" r="1"/></svg> },
  { key: 'servicioLegal',       icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0b1a0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
  { key: 'servicioParajes',     icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0b1a0b" strokeWidth="2" strokeLinecap="round"><polyline points="22,2 2,22"/><polyline points="12,2 2,12"/><polyline points="22,12 12,22"/></svg> },
  { key: 'servicioComercio',    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0b1a0b" strokeWidth="2" strokeLinecap="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg> },
  { key: 'servicioMapa',        icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0b1a0b" strokeWidth="2" strokeLinecap="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg> },
];

const REVISTAS = [
  { title: 'Revista Festera JCF Villena', period: 'SEPTIEMBRE 2025', author: 'JCF Villena', bg: 'linear-gradient(135deg,#0d1e12,#1a4a2a)', img: 'https://images.unsplash.com/photo-1677055290576-ecbf1babede7?w=600&h=320&fit=crop&auto=format', opacity: .55, overlay: 'to right' },
  { title: 'Boletín Comparsas de Villena', period: 'ESPECIAL 2024',  author: 'JCF Villena', bg: 'linear-gradient(135deg,#3d2510,#6a4a2a)', img: 'https://images.unsplash.com/photo-1533551268962-824e232f7ee1?w=600&h=320&fit=crop&auto=format', opacity: .45, overlay: 'to right' },
  { title: '150 Años de Fiesta en Villena', period: 'HISTORIA',     author: '150 Años de Fiesta', bg: 'linear-gradient(135deg,#1e2a4a,#2a4a7a)', img: 'https://images.unsplash.com/photo-1728329849278-e1e74d73425d?w=600&h=320&fit=crop&auto=format', opacity: .45, overlay: 'to right' },
];

interface GalleryPhoto {
  full: string;
  thumb: string;
  ratio: string;
  isLast?: boolean;
}

export default function InfoPage() {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const initialView = searchParams.get('view') as InfoView;
  // La pestaña inicial depende de ?view=... en la URL, ya disponible en el
  // primer render — se deriva aquí en vez de sincronizarla con un efecto.
  const [mainTab,    setMainTab]    = useState(initialView === 'avisos' ? 'multimedia' : 'servicios');
  const [multiTab,   setMultiTab]   = useState('avisos');
  const [avisos,     setAvisos]     = useState<Aviso[]>([]);
  const [loginOpen,  setLoginOpen]  = useState(false);
  const [showMap,    setShowMap]    = useState(false);
  const [legalOpen,  setLegalOpen]  = useState(false);
  // Códigos de idioma cuya bandera (servida desde flagcdn.com/openmoji.org)
  // no ha cargado — se muestra el código en texto en su lugar.
  const [brokenFlags, setBrokenFlags] = useState<Set<string>>(new Set());
  const { user } = useAuth();

  useEffect(() => {
    getAvisos().then(setAvisos).catch(() => setAvisos([]));
  }, []);
  const [focusedPhoto, setFocusedPhoto] = useState<string | null>(null);

  // Preparar columnas de galería
  const cols: GalleryPhoto[][] = [[], [], []];
  GALLERY_PHOTOS.forEach((d, i) => cols[i % 3].push(d));
  const makeCol = (items: GalleryPhoto[]) => items.map((d, i) => ({
    ...d,
    isLast: i === items.length - 1,
  }));
  const [col1, col2, col3] = cols.map(makeCol);

  return (
    <div className={styles.page}>
      {/* ── Título ── */}
      <div className={styles.titleBar}>
        <h1>{t('info.title')}</h1>
        <button className={styles.authBtn} onClick={() => setLoginOpen(true)}>
          {user ? (
            <UserAvatar user={user} imgClassName={styles.authAvatar} fallbackClassName={styles.authInitial} />
          ) : (
            <span className={styles.authLabel}>{t('info.accessLabel')}</span>
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
          {t('info.servicios')}
        </button>
        <button
          className={`${styles.mainTabBtn}${mainTab === 'multimedia' ? ` ${styles.active}` : ''}`}
          onClick={() => setMainTab('multimedia')}
        >
          {t('info.multimedia')}
        </button>
      </div>

      {/* ════════ SERVICIOS ════════ */}
      {mainTab === 'servicios' && (
        <div>
          <div className={styles.serviciosLabel}>
            <span>{t('info.infoInteres')}</span>
          </div>

          {/* Grid iconos servicios */}
          <div className={styles.serviciosGrid}>
            {SERVICIOS.map(s => {
              const isMap = s.key === 'servicioMapa';
              const isLegal = s.key === 'servicioLegal';
              const isClickable = isMap || isLegal;
              return (
                <div
                  key={s.key}
                  className={styles.servicioItem}
                  {...(isClickable
                    ? {
                        onClick: () => {
                          if (isMap) setShowMap(true);
                          if (isLegal) setLegalOpen(true);
                        },
                        onKeyDown: onActivateKey(() => {
                          if (isMap) setShowMap(true);
                          if (isLegal) setLegalOpen(true);
                        }),
                        role: 'button',
                        tabIndex: 0,
                      }
                    : {})}
                >
                  <div className={styles.servicioIcon}>{s.icon}</div>
                  <span className={styles.servicioLabel}>{t(`info.${s.key}`)}</span>
                </div>
              );
            })}
          </div>

          {/* Selector de idioma */}
          <div className={styles.langSectionLabel}>
            <span>{t('info.languageSection')}</span>
          </div>
          <div className={styles.langList}>
            {SUPPORTED_LANGUAGES.map(l => {
              const active = i18n.language === l.code;
              return (
                <div
                  key={l.code}
                  onClick={() => i18n.changeLanguage(l.code)}
                  onKeyDown={onActivateKey(() => i18n.changeLanguage(l.code))}
                  role="button"
                  tabIndex={0}
                  aria-pressed={active}
                  className={`${styles.langItem}${active ? ` ${styles.active}` : ''}`}
                >
                  {brokenFlags.has(l.code) ? (
                    <span className={styles.langFlagFallback}>{l.code.toUpperCase()}</span>
                  ) : (
                    <img
                      src={l.img}
                      className={styles.langFlag}
                      style={{ width: l.imgW }}
                      loading="lazy"
                      decoding="async"
                      alt={l.name}
                      onError={() => setBrokenFlags(prev => new Set(prev).add(l.code))}
                    />
                  )}
                  <span>{l.name}</span>
                </div>
              );
            })}
          </div>

          {/* Puntos clave y contacto */}
          <div className={styles.poiLabel}>
            <span>{t('info.poiSection')}</span>
          </div>
          <div className={styles.poiList}>
            {[
              { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c4972a" strokeWidth="1.8" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.24h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.86a16 16 0 0 0 6 6l.86-.86a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z"/></svg>, title: t('info.telefonosTitle'), sub: t('info.telefonosSub'), border: true },
              { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c4972a" strokeWidth="1.8" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>, title: t('info.casetaTitle'), sub: t('info.casetaSub'), border: true },
              { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c4972a" strokeWidth="1.8" strokeLinecap="round"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg>, title: t('info.sanidadTitle'), sub: t('info.sanidadSub'), border: false },
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
              {t('info.subtabAvisos')}
            </button>
            <button
              className={`${styles.subtab}${multiTab === 'galeria' ? ` ${styles.active}` : ''}`}
              onClick={() => setMultiTab('galeria')}
            >
              {t('info.subtabGaleria')}
            </button>
            <button
              className={`${styles.subtab}${multiTab === 'revistas' ? ` ${styles.active}` : ''}`}
              onClick={() => setMultiTab('revistas')}
            >
              {t('info.subtabRevistas')}
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
                      loading="lazy"
                      decoding="async"
                      onClick={() => setFocusedPhoto(photo.full ?? null)}
                      onKeyDown={onActivateKey(() => setFocusedPhoto(photo.full ?? null))}
                      role="button"
                      tabIndex={0}
                      className={styles.galeriaImg}
                      style={{
                        aspectRatio: photo.isLast ? undefined : photo.ratio,
                        flex: photo.isLast ? '1' : undefined,
                        minHeight: photo.isLast ? '80px' : undefined,
                      }}
                      alt={t('info.verFotoAmpliada')}
                    />
                  ))}
                </div>
              ))}

              {/* Lightbox */}
              {focusedPhoto && (
                <div
                  className={styles.lightbox}
                  onClick={() => setFocusedPhoto(null)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
                      e.preventDefault();
                      setFocusedPhoto(null);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={t('info.cerrarImagen')}
                >
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
                  <img src={r.img} className={styles.revistaImg} style={{ opacity: r.opacity }} loading="lazy" decoding="async" alt="" />
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
                        <span className={styles.revistaBtnLabel}>{t('info.leerPdf')}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showMap && <MapPage onBack={() => setShowMap(false)} />}
      <LegalModal open={legalOpen} onClose={() => setLegalOpen(false)} />
    </div>
  );
}
