import { useState, useEffect } from 'react';
import type { FiestaEvent, EventType, Aviso } from '../../types';
import { FESTIVAL } from '../../constants';
import { festivalISODate, dayOfMonth, weekdayShortLabel } from '../../utils/dates';
import { getCurrentWeather, type Weather } from '../../services/weatherService';
import { getAvisos } from '../../services/avisosService';
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

interface FeaturedCard {
  id: string; img: string; title: string;
  time: string; location: string; type: EventType; date: string;
}

interface RawFeaturedCard {
  id: string; img: string; title: string;
  time: string; location: string; type: EventType; day: number;
}

const rawFeaturedCards: RawFeaturedCard[] = [
  { id: 'e1', img: 'https://images.unsplash.com/photo-1755781988015-d1e9c6256e1d?w=480&h=336&fit=crop&auto=format', title: 'Diana General',      time: '08:00', location: 'Plaza de Santiago', type: 'Desfiles', day: 4 },
  { id: 'e2', img: 'https://images.unsplash.com/photo-1677055290576-ecbf1babede7?w=480&h=336&fit=crop&auto=format', title: 'Alarde de Infantería', time: '12:00', location: 'Av. Constitución',    type: 'Desfiles', day: 4 },
  { id: 'e4', img: 'https://images.unsplash.com/photo-1718563300857-d2f084703fe9?w=480&h=336&fit=crop&auto=format', title: 'Entrada Cristiana',    time: '23:00', location: 'Av. Constitución',    type: 'Desfiles', day: 5 },
  { id: 'e5', img: 'https://images.unsplash.com/photo-1533551268962-824e232f7ee1?w=480&h=336&fit=crop&auto=format', title: 'Contrabando',          time: '11:00', location: 'Casco Antiguo',       type: 'Desfiles', day: 6 },
  { id: 'e7', img: 'https://images.unsplash.com/photo-1677055380601-393348dc342c?w=480&h=336&fit=crop&auto=format', title: 'Entrada Mora',         time: '23:00', location: 'Av. Constitución',    type: 'Desfiles', day: 7 },
];

// dow ('Vie', 'Sáb'...) se calcula a partir de la fecha real en vez de
// escribirse a mano — antes había que recalcularlo cada año sin avisar.
const featuredCards: FeaturedCard[] = rawFeaturedCards.map(({ day, ...rest }) => ({
  ...rest,
  date: festivalISODate(day),
}));

const news = [
  {
    img: 'https://images.unsplash.com/photo-1677055290576-ecbf1babede7?w=130&h=130&fit=crop&auto=format',
    title: 'El Capitán Moro 2025 presenta su espectacular indumentaria en un acto multitudinario',
    date: 'Lunes, 1 septiembre 2025',
  },
  {
    img: 'https://images.unsplash.com/photo-1755781988015-d1e9c6256e1d?w=130&h=130&fit=crop&auto=format',
    title: 'Récord histórico de participantes: más de 3.000 festeros en las comparsas villenenses',
    date: 'Domingo, 31 agosto 2025',
  },
  {
    img: 'https://images.unsplash.com/photo-1718563300857-d2f084703fe9?w=130&h=130&fit=crop&auto=format',
    title: 'La JCF aprueba el programa oficial de actos festeros para Septiembre 2025',
    date: 'Sábado, 30 agosto 2025',
  },
  {
    img: 'https://images.unsplash.com/photo-1728329849278-e1e74d73425d?w=130&h=130&fit=crop&auto=format',
    title: 'La restauración del Castillo de la Atalaya concluye a tiempo para las fiestas',
    date: 'Viernes, 29 agosto 2025',
  },
];

export default function InicioPage({ onGoToServicios, onGoToAgenda, onGoToAvisos, onEventClick }: InicioPageProps) {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [avisos, setAvisos] = useState<Aviso[]>([]);

  useEffect(() => {
    getCurrentWeather().then(setWeather).catch(() => setWeather(null));
  }, []);

  useEffect(() => {
    getAvisos().then(setAvisos).catch(() => setAvisos([]));
  }, []);

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
          aria-label="Abrir menú de servicios"
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
            aria-label="Ver avisos"
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
            <span className={styles.liveLabel}>En Directo</span>
          </div>
          <p className={styles.liveText}>Entrada Cristiana — Intercomarcal</p>
          <a
            href={LIVE_STREAM_URL}
            rel="noopener noreferrer"
            className={styles.watchBtn}
            onClick={(e) => { e.preventDefault(); openExternalLink(LIVE_STREAM_URL); }}
          >
            <svg width="9" height="9" viewBox="0 0 9 9" fill="#0b1a0b"><polygon points="0,0 9,4.5 0,9" /></svg>
            <span className={styles.watchBtnLabel}>Ver</span>
          </a>
        </div>

        {/* ── Próximos Eventos ── */}
        <div>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Próximos Eventos</h2>
            <button className={styles.seeAllBtn} onClick={onGoToAgenda}>
              Ver agenda
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c4972a" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          {/* Carrusel — márgenes negativos para que llegue a los bordes */}
          <div className={styles.carousel}>
            {featuredCards.map((card, i) => (
              <div
                key={i}
                className={styles.eventCard}
                onClick={() => onEventClick && onEventClick(card)}
                onKeyDown={onActivateKey(() => onEventClick && onEventClick(card))}
                role="button"
                tabIndex={0}
              >
                <img src={card.img} className={styles.eventCardImg} alt={card.title} />
                <div className={styles.eventGradient} />
                {/* Badge fecha */}
                <div className={styles.dateBadge}>
                  <span className={styles.dateBadgeMonth}>{FESTIVAL.MONTH.slice(0, 3)}</span>
                  <span className={styles.dateBadgeDay}>{dayOfMonth(card.date)}</span>
                  <span className={styles.dateBadgeDow}>{weekdayShortLabel(card.date)}</span>
                </div>
                {/* Título + hora */}
                <div className={styles.eventInfo}>
                  <p className={styles.eventInfoTitle}>{card.title}</p>
                  <div className={styles.eventInfoTime}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#c4972a" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span className={styles.eventInfoTimeLabel}>{card.time}h</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Últimas Noticias ── */}
        <div>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Últimas Noticias</h2>
            <button className={styles.seeAllBtn}>
              Ver todas
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c4972a" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          <div className={styles.newsList}>
            {news.map((item, i) => (
              <div
                key={i}
                className={`${styles.newsItem}${i < news.length - 1 ? ` ${styles.newsItemBorder}` : ''}`}
              >
                <div className={styles.newsThumb}>
                  <img src={item.img} className={styles.newsThumbImg} alt="" />
                </div>
                <div className={styles.newsText}>
                  <p className={styles.newsTitle}>{item.title}</p>
                  <p className={styles.newsDate}>{item.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
