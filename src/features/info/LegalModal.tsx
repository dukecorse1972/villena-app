import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../../components/Modal';
import styles from './LegalModal.module.css';

interface Props {
  open: boolean;
  onClose: () => void;
  initialTab?: 'privacy' | 'aviso' | 'terms';
}

export default function LegalModal({ open, onClose, initialTab = 'privacy' }: Props) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<'privacy' | 'aviso' | 'terms'>(initialTab);

  return (
    <Modal open={open} onClose={onClose} maxWidth="480px" ariaLabel={t('legal.title')}>
      <div className={styles.modal}>
        {/* Cabecera */}
        <div className={styles.header}>
          <span className={styles.title}>{t('legal.title')}</span>
          <button className={styles.closeBtn} onClick={onClose} aria-label={t('common.close')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Pestañas */}
        <div className={styles.tabs} role="tablist">
          <button
            className={`${styles.tabBtn}${tab === 'privacy' ? ` ${styles.active}` : ''}`}
            onClick={() => setTab('privacy')}
            role="tab"
            aria-selected={tab === 'privacy'}
          >
            {t('legal.tabPrivacy')}
          </button>
          <button
            className={`${styles.tabBtn}${tab === 'aviso' ? ` ${styles.active}` : ''}`}
            onClick={() => setTab('aviso')}
            role="tab"
            aria-selected={tab === 'aviso'}
          >
            {t('legal.tabAviso')}
          </button>
          <button
            className={`${styles.tabBtn}${tab === 'terms' ? ` ${styles.active}` : ''}`}
            onClick={() => setTab('terms')}
            role="tab"
            aria-selected={tab === 'terms'}
          >
            {t('legal.tabTerms')}
          </button>
        </div>

        {/* Contenido según pestaña */}
        <div className={styles.content}>
          {tab === 'privacy' && (
            <>
              <h2 className={styles.sectionTitle}>{t('legal.privacyTitle')}</h2>

              <div className={styles.block}>
                <div className={styles.blockHeader}>{t('legal.privacyResponsibleHeader')}</div>
                <p className={styles.blockText}>{t('legal.privacyResponsibleText')}</p>
              </div>

              <div className={styles.block}>
                <div className={styles.blockHeader}>{t('legal.privacyDataHeader')}</div>
                <p className={styles.blockText}>{t('legal.privacyDataText')}</p>
              </div>

              <div className={styles.block}>
                <div className={styles.blockHeader}>{t('legal.privacyPurposeHeader')}</div>
                <p className={styles.blockText}>{t('legal.privacyPurposeText')}</p>
              </div>

              <div className={styles.block}>
                <div className={styles.blockHeader}>{t('legal.privacyRightsHeader')}</div>
                <p className={styles.blockText}>{t('legal.privacyRightsText')}</p>
              </div>
            </>
          )}

          {tab === 'aviso' && (
            <>
              <h2 className={styles.sectionTitle}>{t('legal.avisoTitle')}</h2>
              <div className={styles.block}>
                <p className={styles.blockText}>{t('legal.avisoContent')}</p>
              </div>
            </>
          )}

          {tab === 'terms' && (
            <>
              <h2 className={styles.sectionTitle}>{t('legal.termsTitle')}</h2>
              <div className={styles.block}>
                <p className={styles.blockText}>{t('legal.termsContent')}</p>
              </div>
            </>
          )}
        </div>

        {/* Botón Aceptar */}
        <div className={styles.footer}>
          <button className={styles.okBtn} onClick={onClose}>
            {t('common.accept')}
          </button>
        </div>
      </div>
    </Modal>
  );
}
