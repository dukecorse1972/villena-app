import { useState, useEffect } from 'react';
import { getComparsas } from '../../services/comparsasService';
import type { Comparsa, Bando } from '../../types';
import ComparsaCard from './ComparsaCard';
import ComparsaDetail from './ComparsaDetail';
import styles from './ComparsasPage.module.css';

export default function ComparsasPage() {
  const [side, setSide]                         = useState<'Cristianas' | 'Moras'>('Cristianas');
  const [activeTab, setActiveTab]               = useState<'comparsas' | 'historia'>('comparsas');
  const [selectedComparsa, setSelectedComparsa] = useState<Comparsa | null>(null);
  const [showDetail, setShowDetail]             = useState(false);
  const [activeList, setActiveList]             = useState<Comparsa[]>([]);

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

  return (
    <div className={styles.page}>
      {/* ── Título ── */}
      <div className={styles.titleBar}>
        <h1>Comparsas</h1>
        <p className={styles.subtitle}>Descubre las Comparsas que participan en la fiesta.</p>
      </div>

      {/* ── Sub-tabs ── */}
      <div className={styles.subtabs}>
        <button
          className={`${styles.subtab}${activeTab === 'comparsas' ? ` ${styles.active}` : ''}`}
          onClick={() => setActiveTab('comparsas')}
        >
          Comparsas
        </button>
        <button
          className={`${styles.subtab}${activeTab === 'historia' ? ` ${styles.active}` : ''}`}
          onClick={() => setActiveTab('historia')}
        >
          Historia
        </button>
      </div>

      {/* ── TAB: Comparsas (grid) ── */}
      {activeTab === 'comparsas' && (
        <>
          {/* Toggle Cristianas / Moras */}
          <div className={styles.toggle}>
            <button
              className={`${styles.toggleBtn}${side === 'Cristianas' ? ` ${styles.active}` : ''}`}
              onClick={() => setSide('Cristianas')}
            >
              Cristianas
            </button>
            <button
              className={`${styles.toggleBtn}${side === 'Moras' ? ` ${styles.active}` : ''}`}
              onClick={() => setSide('Moras')}
            >
              Moras
            </button>
          </div>

          {/* Grid */}
          <div className={styles.grid}>
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
        </>
      )}

      {/* ── TAB: Historia ── */}
      {activeTab === 'historia' && (
        <div className={styles.historia}>
          <h2 className={styles.historiaTitle}>
            Historia de los Moros y Cristianos de Villena
          </h2>
          <div className={styles.historiaImg}>
            <span style={{ color: 'rgba(201,160,48,.5)', fontSize: '40px' }}>🏰</span>
          </div>
          <p className={styles.historiaP}>
            Las Fiestas de Moros y Cristianos de Villena son declaradas de Interés Turístico Nacional. Se celebran en honor a la Virgen de las Virtudes, patrona de la ciudad, durante la primera quincena de septiembre.
          </p>
          <p className={styles.historiaP}>
            La festividad rememora la reconquista del Castillo de la Atalaya por el rey Alfonso X el Sabio en el siglo XIII. Dieciséis comparsas, ocho cristianas y ocho moras, protagonizan desfiles, embajadas y la solemne procesión.
          </p>
          <p className={styles.historiaP}>
            Con más de 150 años de historia, las fiestas villeneras son un referente en la Comunidad Valenciana, combinando tradición, música, pólvora y el colorido de sus trajes artesanales.
          </p>
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
