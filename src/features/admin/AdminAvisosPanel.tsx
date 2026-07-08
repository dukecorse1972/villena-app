import { useState, useEffect } from 'react';
import { getAvisos, createAviso, updateAviso, deleteAviso, timeAgo } from '../../services/avisosService';
import type { Aviso } from '../../types';
import styles from './AdminAvisosPanel.module.css';

export default function AdminAvisosPanel() {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [text, setText] = useState('');
  const [markAsNew, setMarkAsNew] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  const reload = () => {
    setIsLoading(true);
    setError(null);
    getAvisos()
      .then(setAvisos)
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsLoading(false));
  };

  // Mismo patrón de fetching-en-efecto ya documentado en useAgenda.
  useEffect(reload, []); // eslint-disable-line react-hooks/set-state-in-effect

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      await createAviso(text.trim(), markAsNew);
      setText('');
      setMarkAsNew(true);
      reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el aviso');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleNew = async (aviso: Aviso) => {
    try {
      await updateAviso(aviso.id, { is_new: !aviso.is_new });
      reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el aviso');
    }
  };

  const startEditing = (aviso: Aviso) => {
    setEditingId(aviso.id);
    setEditingText(aviso.text);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingText('');
  };

  const saveEditing = async (id: string) => {
    if (!editingText.trim()) return;
    try {
      await updateAviso(id, { text: editingText.trim() });
      cancelEditing();
      reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el aviso');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAviso(id);
      reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al borrar el aviso');
    }
  };

  return (
    <div className={styles.panel}>
      <form className={styles.form} onSubmit={handleCreate}>
        <textarea
          className={styles.textarea}
          placeholder="Escribe el aviso…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
        />
        <div className={styles.formRow}>
          <label className={styles.checkboxLabel}>
            <input type="checkbox" checked={markAsNew} onChange={(e) => setMarkAsNew(e.target.checked)} />
            Marcar como nuevo
          </label>
          <button type="submit" className={styles.submitBtn} disabled={submitting || !text.trim()}>
            {submitting ? 'Publicando…' : 'Publicar aviso'}
          </button>
        </div>
        {error && <span className={styles.errorMsg}>{error}</span>}
      </form>

      {isLoading && <p className={styles.itemTime}>Cargando avisos…</p>}

      <div className={styles.list}>
        {!isLoading && avisos.map((aviso) => (
          <div key={aviso.id} className={styles.item}>
            {editingId === aviso.id ? (
              <>
                <textarea
                  className={styles.textarea}
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                />
                <div className={styles.itemActions}>
                  <button className={styles.actionBtn} onClick={() => saveEditing(aviso.id)}>Guardar</button>
                  <button className={styles.actionBtn} onClick={cancelEditing}>Cancelar</button>
                </div>
              </>
            ) : (
              <>
                <div className={styles.itemHead}>
                  {aviso.is_new && <span className={styles.badgeNew}>Nuevo</span>}
                  <span className={styles.itemTime}>{timeAgo(aviso.created_at)}</span>
                </div>
                <p className={styles.itemText}>{aviso.text}</p>
                <div className={styles.itemActions}>
                  <button className={styles.actionBtn} onClick={() => handleToggleNew(aviso)}>
                    {aviso.is_new ? 'Quitar "nuevo"' : 'Marcar como nuevo'}
                  </button>
                  <button className={styles.actionBtn} onClick={() => startEditing(aviso)}>Editar</button>
                  <button className={`${styles.actionBtn} ${styles.danger}`} onClick={() => handleDelete(aviso.id)}>
                    Borrar
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
        {!isLoading && avisos.length === 0 && <p className={styles.itemTime}>No hay avisos todavía.</p>}
      </div>
    </div>
  );
}
