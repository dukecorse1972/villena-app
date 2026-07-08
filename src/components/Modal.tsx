import { useEffect } from 'react';
import styles from './Modal.module.css';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
  fullHeight?: boolean;
}

/**
 * Modal reutilizable con overlay oscuro y animación slideUpFade.
 */
export default function Modal({ open, onClose, children, maxWidth = '100%', fullHeight = false }: ModalProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className={`${styles.panel}${fullHeight ? ` ${styles.panelFull}` : ''}`}
        style={{ width: maxWidth }}
      >
        {children}
      </div>
    </div>
  );
}
