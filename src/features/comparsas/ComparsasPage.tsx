import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { getComparsas } from '../../services/comparsasService';
import type { Comparsa, Bando } from '../../types';
import { triggerSelectionHaptic } from '../../utils/haptics';
import ComparsaCard from './ComparsaCard';
import ComparsaDetail from './ComparsaDetail';
import styles from './ComparsasPage.module.css';

export default function ComparsasPage() {
  const { t } = useTranslation();
  const [side, setSide]                         = useState<'Cristianas' | 'Moras'>('Cristianas');
  const [prevSide, setPrevSide]                 = useState<'Cristianas' | 'Moras'>('Cristianas');
  const [gridSlideClass, setGridSlideClass]     = useState('');
  const [activeTab, setActiveTab]               = useState<'comparsas' | 'historia'>('comparsas');
  const [selectedComparsa, setSelectedComparsa] = useState<Comparsa | null>(null);
  const [showDetail, setShowDetail]             = useState(false);
  const [activeList, setActiveList]             = useState<Comparsa[]>([]);
  const touchStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  if (side !== prevSide) {
    setPrevSide(side);
    setGridSlideClass(side === 'Moras' ? styles.slideFromRight : styles.slideFromLeft);
  }

  useEffect(() => {
    getComparsas(side).then(setActiveList).catch(() => setActiveList([]));
  }, [side]);

  const handleSelectComparsa = (c: Comparsa) => {
    setSelectedComparsa(c);
    setShowDetail(true);
  };

  const handleBack = () => {
    setShowDetail(false);
    setSelectedComparsa(null);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch) {
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    if (!touch) return;
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;

    // Gesto horizontal claro (> 45px y predomina sobre scroll vertical)
    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.25) {
      if (deltaX < 0 && side === 'Cristianas') {
        // Deslizar hacia la izquierda -> ir a Moras
        triggerSelectionHaptic();
        setSide('Moras');
      } else if (deltaX > 0 && side === 'Moras') {
        // Deslizar hacia la derecha -> ir a Cristianas
        triggerSelectionHaptic();
        setSide('Cristianas');
      }
    }
  };

  return (
    <div className={styles.page}>
      {/* ── Título ── */}
      <div className={styles.titleBar}>
        <h1>{t('comparsas.title')}</h1>
        <p className={styles.subtitle}>{t('comparsas.subtitle')}</p>
      </div>

      {/* ── Sub-tabs ── */}
      <div className={styles.subtabs}>
        <button
          className={`${styles.subtab}${activeTab === 'comparsas' ? ` ${styles.active}` : ''}`}
          onClick={() => setActiveTab('comparsas')}
        >
          {t('comparsas.tabComparsas')}
        </button>
        <button
          className={`${styles.subtab}${activeTab === 'historia' ? ` ${styles.active}` : ''}`}
          onClick={() => setActiveTab('historia')}
        >
          {t('comparsas.tabHistoria')}
        </button>
      </div>

      {/* ── TAB: Comparsas (grid con swipe táctil) ── */}
      {activeTab === 'comparsas' && (
        <div
          className={styles.swipeContainer}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Toggle Cristianas / Moras */}
          <div className={styles.toggle}>
            <button
              className={`${styles.toggleBtn}${side === 'Cristianas' ? ` ${styles.active}` : ''}`}
              onClick={() => setSide('Cristianas')}
            >
              {t('comparsas.cristianas')}
            </button>
            <button
              className={`${styles.toggleBtn}${side === 'Moras' ? ` ${styles.active}` : ''}`}
              onClick={() => setSide('Moras')}
            >
              {t('comparsas.moras')}
            </button>
          </div>

          {/* Grid */}
          <div key={side} className={`${styles.grid}${gridSlideClass ? ` ${gridSlideClass}` : ''}`}>
            {activeList.map((c, i) => {
              const isOddLast = activeList.length % 2 !== 0 && i === activeList.length - 1;
              return (
                <ComparsaCard
                  key={c.id}
                  comparsa={c}
                  isLast={isOddLast}
                  onClick={handleSelectComparsa}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB: Historia ── */}
      {activeTab === 'historia' && (
        <div className={styles.historia}>
          <h2 className={styles.historiaTitle}>
            {t('comparsas.historiaTitle')}
          </h2>
          <div className={styles.historiaImg}>
            <span style={{ color: 'rgba(201,160,48,.5)', fontSize: '40px' }}>🏰</span>
          </div>
          <p className={styles.historiaP}>{t('comparsas.historiaP1')}</p>
          <p className={styles.historiaP}>{t('comparsas.historiaP2')}</p>
          <p className={styles.historiaP}>{t('comparsas.historiaP3')}</p>
        </div>
      )}

      {/* ── Detail panel ── */}
      {showDetail && selectedComparsa && (
        <ComparsaDetail
          comparsa={selectedComparsa}
          bando={selectedComparsa.bando as Bando}
          onBack={handleBack}
        />
      )}
    </div>
  );
}
