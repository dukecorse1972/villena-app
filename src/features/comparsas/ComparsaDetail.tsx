import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import type { Comparsa, Bando, Cargo } from '../../types';
import { getCargosByComparsa } from '../../services/cargosService';
import { getUserComparsaRating, submitComparsaRating } from '../../services/ratingsService';
import { useAuth } from '../../hooks/useAuth';
import LoginSection from '../info/LoginSection';
import { onActivateKey } from '../../utils/a11y';
import { triggerLightImpact, triggerSelectionHaptic, triggerSuccessHaptic } from '../../utils/haptics';
import styles from './ComparsaDetail.module.css';

interface ComparsaDetailProps {
  comparsa: Comparsa | null;
  bando: Bando;
  onBack: () => void;
}

const PersonIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(196,151,42,.4)" strokeWidth="1.5">
    <circle cx="12" cy="8" r="4"/>
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
  </svg>
);

export default function ComparsaDetail({ comparsa, bando, onBack }: ComparsaDetailProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [voteStars, setVoteStars]           = useState(0);
  const [savedRating, setSavedRating]       = useState<number | null>(null);
  const [voteSubmitted, setVoteSubmitted]   = useState(false);
  const [isSubmitting, setIsSubmitting]     = useState(false);
  const [ratingError, setRatingError]       = useState<string | null>(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [cargos, setCargos]                 = useState<Cargo[]>([]);
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!comparsa) return;
    getCargosByComparsa(comparsa.id).then(setCargos).catch(() => setCargos([]));

    // Cargar la valoración previa del usuario si está autenticado
    getUserComparsaRating(comparsa.id, user?.id)
      .then((rating) => {
        if (rating !== null) {
          setVoteStars(rating);
          setSavedRating(rating);
          setVoteSubmitted(true);
        } else {
          setVoteStars(0);
          setSavedRating(null);
          setVoteSubmitted(false);
        }
      })
      .catch(() => {});

    if (pageRef.current) {
      pageRef.current.scrollTop = 0;
    }
  }, [comparsa, user?.id]);

  if (!comparsa) return null;

  const handleStarClick = (starIndex: number) => {
    if (!user) {
      triggerLightImpact();
      setLoginModalOpen(true);
      return;
    }
    triggerSelectionHaptic();
    setVoteStars(starIndex);
    setVoteSubmitted(false);
    setRatingError(null);
  };

  const handleVoteSubmit = async () => {
    if (!user) {
      setLoginModalOpen(true);
      return;
    }
    if (voteStars < 1 || voteStars > 5) return;

    setIsSubmitting(true);
    setRatingError(null);

    try {
      await submitComparsaRating(comparsa.id, user.id, voteStars);
      setSavedRating(voteStars);
      setVoteSubmitted(true);
      triggerSuccessHaptic();
    } catch (err) {
      setRatingError(err instanceof Error ? err.message : 'Error al registrar valoración');
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div ref={pageRef} className={styles.page}>

      {/* ── Cabecera sticky ── */}
      <div className={styles.header}>
        <div
          className={styles.backBtn}
          onClick={onBack}
          onKeyDown={onActivateKey(onBack)}
          role="button"
          tabIndex={0}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c4972a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          <span className={styles.backLabel}>{t('comparsaDetail.back')}</span>
        </div>
        <div className={styles.favIconBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(240,228,200,.7)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </div>
      </div>

      {/* ── Hero con imagen de desfile ── */}
      <div
        className={styles.hero}
        style={comparsa.desfile_img ? { backgroundImage: `url(${comparsa.desfile_img})` } : undefined}
      >
        {!comparsa.desfile_img && <span className={styles.heroLabel}>IMAGEN DE DESFILE</span>}
        {/* Escudo superpuesto */}
        <div className={styles.shieldWrap}>
          <div
            className={styles.shield}
            style={{
              background: comparsa.img ? '#0b1a0b' : (comparsa.color || '#1a1a1a'),
              padding: comparsa.img ? '6px' : '0',
            }}
          >
            {comparsa.img ? (
              <img src={comparsa.img} className={styles.shieldImg} loading="lazy" decoding="async" alt={comparsa.name} />
            ) : (
              <span className={styles.shieldInitials}>
                {comparsa.name.slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Nombre y tags ── */}
      <div className={styles.nameArea}>
        <h1 className={styles.comparsaTitle}>{comparsa.name}</h1>
        <div className={styles.tags}>
          <span className={styles.tagBando}>
            {bando === 'Moro' ? t('comparsaDetail.bandoMoro') : t('comparsaDetail.bandoCristiano')}
          </span>
          <span className={styles.tagMuted}>{t('comparsaDetail.fundacion', { year: comparsa.founded_year ?? '—' })}</span>
          <span className={styles.tagMuted}>{t('comparsaDetail.numSocios', { count: comparsa.num_socios ?? '—' })}</span>
        </div>
      </div>

      {/* ── Cargos del año ── */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('comparsaDetail.cargosDelAnio')}</h2>
        {cargos.length > 0 ? (
          <div className={styles.cargosScroll}>
            {cargos.map(cargo => (
              <div key={cargo.id} className={styles.cargoItem}>
                <div className={styles.cargoAvatar}>
                  {cargo.photo_url
                    ? <img src={cargo.photo_url} alt={cargo.person_name} className={styles.cargoAvatarImg} loading="lazy" decoding="async" />
                    : <PersonIcon />}
                </div>
                <span className={styles.cargoName}>{cargo.person_name}</span>
                <span className={styles.cargoRole}>{cargo.role}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.historyText}>{t('comparsaDetail.sinCargos')}</p>
        )}
      </div>

      {/* ── Indumentaria ── */}
      <div className={styles.sectionPadded}>
        <h2 className={styles.sectionTitleNoLeft}>{t('comparsaDetail.indumentaria')}</h2>
        <div className={styles.indu2col}>
          {[
            { label: t('comparsaDetail.trajeGala'), img: comparsa.traje_gala_img },
            { label: t('comparsaDetail.estandarte'), img: comparsa.estandarte_img },
          ].map(({ label, img }) => (
            <div key={label} className={styles.induCard}>
              {img ? (
                <img src={img} alt={label} className={styles.induImg} loading="lazy" decoding="async" />
              ) : (
                <>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(196,151,42,.35)" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <span className={styles.induLabel}>{label}</span>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Historia ── */}
      <div className={styles.sectionPadded}>
        <h2 className={styles.sectionTitleNoLeft}>{t('comparsaDetail.nuestraHistoria')}</h2>
        <p className={styles.historyText}>
          {comparsa.description || t('comparsaDetail.defaultHistoryText')}
        </p>
      </div>

      {/* ── Valoración ── */}
      <div className={styles.ratingSection}>
        <h2 className={styles.ratingTitle}>{t('comparsaDetail.valoracion')}</h2>
        <div className={styles.ratingCard}>
          <p className={styles.ratingPrompt}>
            {!user ? t('comparsaDetail.loginToRate') : t('comparsaDetail.ratingPrompt')}
          </p>
          <div className={`${styles.stars}${voteSubmitted ? ` ${styles.starsSubmitted}` : ''}`}>
            {[1, 2, 3, 4, 5].map((i, idx) => (
              <button
                key={i}
                type="button"
                onClick={() => handleStarClick(i)}
                className={styles.starBtn}
                style={{
                  color: i <= voteStars ? '#c4972a' : 'rgba(196,151,42,.2)',
                  animationDelay: voteSubmitted ? `${idx * 40}ms` : undefined,
                }}
                aria-label={`${i} estrellas`}
              >
                ★
              </button>
            ))}
          </div>

          {ratingError && (
            <p style={{ color: '#e05252', fontSize: '12px', margin: '0 0 12px' }}>{ratingError}</p>
          )}

          {voteSubmitted ? (
            <div className={styles.thanks}>
              <span>✨</span>
              <span>{t('comparsaDetail.thanks')}</span>
              <span>🎉</span>
            </div>
          ) : !user ? (
            <button
              type="button"
              onClick={() => setLoginModalOpen(true)}
              className={`${styles.submitBtn} ${styles.ready}`}
            >
              {t('loginSection.login')}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleVoteSubmit}
              disabled={voteStars === 0 || isSubmitting}
              className={`${styles.submitBtn}${voteStars > 0 && !isSubmitting ? ` ${styles.ready}` : ''}`}
            >
              {isSubmitting
                ? t('comparsaDetail.saving')
                : savedRating !== null
                ? t('comparsaDetail.updateVote')
                : t('comparsaDetail.submitVote')}
            </button>
          )}
        </div>
      </div>

      <LoginSection open={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
    </div>,
    document.body
  );
}
