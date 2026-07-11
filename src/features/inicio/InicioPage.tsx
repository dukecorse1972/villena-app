import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { FiestaEvent, Aviso } from '../../types';
import { FESTIVAL, STORAGE_KEYS } from '../../constants';
import { dayOfMonth, weekdayShortLabel, festivalISODate } from '../../utils/dates';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { getCurrentWeather, type Weather } from '../../services/weatherService';
import { getAvisos } from '../../services/avisosService';
import { getAllEventos, getUpcomingEvents } from '../../services/eventsService';
import { getLatestNews, formatNewsDate, NEWS_CATEGORY_URL, type NewsItem } from '../../services/newsService';
import { typePhotos } from '../../data/events';
import { openExternalLink } from '../../utils/openExternalLink';
import { onActivateKey } from '../../utils/a11y';
import WeatherIcon from '../../components/WeatherIcon';
import styles from './InicioPage.module.css';

const LIVE_STREAM_URL = 'https://www.intercomarcal.com/';

interface InicioPageProps {
  onGoToServicios: () => void;
  onGoToAgenda: () => void;
  onGoToAvisos: () => void;
  onEventClick: (event: FiestaEvent) => void;
}

export default function InicioPage({ onGoToServicios, onGoToAgenda, onGoToAvisos, onEventClick }: InicioPageProps) {
  const { t } = useTranslation();
  const [weather, setWeather] = useState<Weather | null>(null);
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  // Se inicializan con la última copia conocida (localStorage) para que
  // aparezcan al instante al abrir la app; la petición de red en el efecto
  // de abajo las refresca por encima en cuanto responde.
  const [news, setNews] = useLocalStorage<NewsItem[]>(STORAGE_KEYS.NEWS_CACHE, []);
  const [featuredEvents, setFeaturedEvents] = useLocalStorage<FiestaEvent[]>(STORAGE_KEYS.FEATURED_EVENTS_CACHE, []);

  useEffect(() => {
    getCurrentWeather().then(setWeather).catch(() => setWeather(null));
  }, []);

  useEffect(() => {
    // El carrusel de Inicio es un escaparate del programa oficial (los días
    // FESTIVAL.START_DAY-END_DAY de FESTIVAL.MONTH_INDEX/YEAR) — se acota
    // aquí para no mezclar actos de otras fechas que puedan existir en la
    // tabla (p.ej. actos previos de la Novena en agosto).
    const startDate = festivalISODate(FESTIVAL.START_DAY);
    const endDate = festivalISODate(FESTIVAL.END_DAY);

    getAllEventos()
      .then((events) => {
        const officialProgram = events.filter((ev) => ev.date >= startDate && ev.date <= endDate);
        setFeaturedEvents(getUpcomingEvents(officialProgram));
      })
      .catch(() => {}); // si falla, se queda la última copia cacheada
  }, [setFeaturedEvents]);

  useEffect(() => {
    getAvisos().then(setAvisos).catch(() => setAvisos([]));
  }, []);

  useEffect(() => {
    getLatestNews().then(setNews).catch(() => {}); // si falla, se queda la última copia cacheada
  }, [setNews]);

  const hasNewAvisos = avisos.some((a) => a.is_new);

  return (
    <div className={styles.page}>

      {/* ── Header ── */}
      <div className={styles.header}>

        {/* Hamburger */}
        <div
          className={styles.hamburger}
          onClick={onGoToServicios}
          onKeyDown={onActivateKey(onGoToServicios)}
          role="button"
          tabIndex={0}
          aria-label={t('inicio.openServicesAria')}
        >
          <div className={styles.hamburgerLine} />
          <div className={styles.hamburgerLine} />
          <div className={styles.hamburgerLine} />
        </div>

        {/* Logo — centrado absolutamente para no depender del ancho de los grupos laterales */}
        <img
          src="/logos/escudo-villena.png"
          alt="Villena Moros y Cristianos"
          className={styles.logo}
          onError={e => { e.currentTarget.style.display = 'none'; }}
        />

        {/* Clima + Campana */}
        <div className={styles.headerRight}>
          {/* Temperatura — solo se muestra si hay dato real (AEMET) */}
          {weather !== null && (
            <div className={styles.weather}>
              <WeatherIcon condition={weather.condition} />
              <span className={styles.weatherTemp}>{Math.round(weather.temperature)}°C</span>
            </div>
          )}
          {/* Campana — el punto solo aparece si hay avisos reales marcados como nuevos */}
          <div
            className={styles.bellWrap}
            onClick={onGoToAvisos}
            onKeyDown={onActivateKey(onGoToAvisos)}
            role="button"
            tabIndex={0}
            aria-label={t('inicio.viewAvisosAria')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(240,228,200,.8)" strokeWidth="1.5" strokeLinecap="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {hasNewAvisos && <div className={styles.bellDot} />}
          </div>
        </div>
      </div>

      {/* ── Cuerpo scrollable — flex:1 para llenar el espacio y scroll interno ── */}
      <div className={styles.body}>

        {/* ── Live Banner ── */}
        <div className={styles.liveBanner}>
          <div className={styles.liveIndicator}>
            <div className={styles.liveDot} />
            <span className={styles.liveLabel}>{t('inicio.live')}</span>
          </div>
          <p className={styles.liveText}>Entrada Cristiana — Intercomarcal</p>
          <a
            href={LIVE_STREAM_URL}
            rel="noopener noreferrer"
            className={styles.watchBtn}
            onClick={(e) => { e.preventDefault(); openExternalLink(LIVE_STREAM_URL); }}
          >
            <svg width="9" height="9" viewBox="0 0 9 9" fill="#0b1a0b"><polygon points="0,0 9,4.5 0,9" /></svg>
            <span className={styles.watchBtnLabel}>{t('inicio.watch')}</span>
          </a>
        </div>

        {/* ── Próximos Eventos ── */}
        <div>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>{t('inicio.proximosEventos')}</h2>
            <button className={styles.seeAllBtn} onClick={onGoToAgenda}>
              {t('inicio.verAgenda')}
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c4972a" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          {/* Carrusel — márgenes negativos para que llegue a los bordes */}
          <div className={styles.carousel}>
            {featuredEvents.map((ev) => (
              <div
                key={ev.id}
                className={styles.eventCard}
                onClick={() => onEventClick && onEventClick(ev)}
                onKeyDown={onActivateKey(() => onEventClick && onEventClick(ev))}
                role="button"
                tabIndex={0}
              >
                <img
                  src={ev.img_url ?? typePhotos[ev.type] ?? typePhotos['Cultural']}
                  className={styles.eventCardImg}
                  alt={ev.title}
                />
                <div className={styles.eventGradient} />
                {/* Badge fecha */}
                <div className={styles.dateBadge}>
                  <span className={styles.dateBadgeMonth}>{FESTIVAL.MONTH.slice(0, 3)}</span>
                  <span className={styles.dateBadgeDay}>{dayOfMonth(ev.date)}</span>
                  <span className={styles.dateBadgeDow}>{weekdayShortLabel(ev.date)}</span>
                </div>
                {/* Título + hora */}
                <div className={styles.eventInfo}>
                  <p className={styles.eventInfoTitle}>{ev.title}</p>
                  <div className={styles.eventInfoTime}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#c4972a" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span className={styles.eventInfoTimeLabel}>{ev.time}h</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Últimas Noticias ── */}
        {news.length > 0 && (
          <div>
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionTitle}>{t('inicio.ultimasNoticias')}</h2>
              <button
                className={styles.seeAllBtn}
                onClick={() => openExternalLink(NEWS_CATEGORY_URL)}
              >
                {t('inicio.verTodas')}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c4972a" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>

            <div className={styles.newsList}>
              {news.map((item, i) => (
                <div
                  key={item.id}
                  className={`${styles.newsItem}${i < news.length - 1 ? ` ${styles.newsItemBorder}` : ''}`}
                  onClick={() => openExternalLink(item.url)}
                  onKeyDown={onActivateKey(() => openExternalLink(item.url))}
                  role="button"
                  tabIndex={0}
                >
                  <div className={styles.newsThumb}>
                    <img
                      src={item.img ?? '/logos/escudo-villena.png'}
                      className={styles.newsThumbImg}
                      onError={(e) => { e.currentTarget.src = '/logos/escudo-villena.png'; }}
                      alt=""
                    />
                  </div>
                  <div className={styles.newsText}>
                    <p className={styles.newsTitle}>{item.title}</p>
                    <p className={styles.newsDate}>{formatNewsDate(item.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
