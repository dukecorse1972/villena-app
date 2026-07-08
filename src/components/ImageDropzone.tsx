import { useRef, useState } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import styles from './ImageDropzone.module.css';

interface ImageDropzoneProps {
  imageUrl?: string;
  onFileSelected: (file: File) => Promise<void>;
  label?: string;
  variant?: 'square' | 'circle';
}

/** Zona de arrastrar-y-soltar (o clic) para subir una imagen, con previsualización. */
export default function ImageDropzone({ imageUrl, onFileSelected, label, variant = 'square' }: ImageDropzoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('El archivo debe ser una imagen');
      return;
    }
    setError(null);
    setUploading(true);
    try {
      await onFileSelected(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  };

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
    e.target.value = '';
  };

  return (
    <div className={styles.wrapper}>
      {label && <span className={styles.label}>{label}</span>}
      <div
        className={`${styles.dropzone} ${styles[variant]}${dragActive ? ` ${styles.active}` : ''}`}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={onDrop}
        role="button"
        tabIndex={0}
      >
        {imageUrl && <img src={imageUrl} alt="" className={styles.preview} />}
        <div className={styles.overlay}>
          {uploading ? 'Subiendo…' : imageUrl ? 'Cambiar' : 'Arrastra o haz clic'}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className={styles.hiddenInput}
          onChange={onInputChange}
        />
      </div>
      {error && <span className={styles.errorMsg}>{error}</span>}
    </div>
  );
}
