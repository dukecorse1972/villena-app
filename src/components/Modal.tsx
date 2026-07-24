import { useEffect, useRef } from 'react';
import { useModalA11y } from '../hooks/useModalA11y';
import styles from './Modal.module.css';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
  fullHeight?: boolean;
  ariaLabel?: string;
}

/**
 * Modal reutilizable con overlay oscuro y animación slideUpFade.
 */
export default function Modal({ open, onClose, children, maxWidth = '100%', fullHeight = false, ariaLabel }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useModalA11y(open, onClose, panelRef);

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        className={`${styles.panel}${fullHeight ? ` ${styles.panelFull}` : ''}`}
        style={{ width: maxWidth }}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        tabIndex={-1}
      >
        {children}
      </div>
    </div>
  );
}
