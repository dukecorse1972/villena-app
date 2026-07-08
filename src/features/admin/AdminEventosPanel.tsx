import { useState, useEffect } from 'react';
import { getAllEventos, createEvento, updateEvento, deleteEvento } from '../../services/eventsService';
import type { FiestaEvent, EventType } from '../../types';
import styles from './AdminEventosPanel.module.css';

const EVENT_TYPES: EventType[] = ['Desfiles', 'Religiosos', 'Música', 'Cultural'];

const EMPTY_FORM = {
  title: '',
  time: '',
  location: '',
  type: 'Desfiles' as EventType,
  date: '',
  description: '',
  img_url: '',
};

export default function AdminEventosPanel() {
  const [eventos, setEventos] = useState<FiestaEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const reload = () => {
    setIsLoading(true);
    setError(null);
    getAllEventos()
      .then(setEventos)
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsLoading(false));
  };

  // Mismo patrón de fetching-en-efecto ya documentado en useAgenda.
  useEffect(reload, []); // eslint-disable-line react-hooks/set-state-in-effect

  const resetForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const startEditing = (ev: FiestaEvent) => {
    setEditingId(ev.id);
    setForm({
      title: ev.title,
      time: ev.time,
      location: ev.location,
      type: ev.type,
      date: ev.date,
      description: ev.description ?? '',
      img_url: ev.img_url ?? '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.time || !form.location.trim() || !form.date) return;

    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        title: form.title.trim(),
        time: form.time,
        location: form.location.trim(),
        type: form.type,
        date: form.date,
        description: form.description.trim() || undefined,
        img_url: form.img_url.trim() || undefined,
      };

      if (editingId) {
        await updateEvento(editingId, payload);
      } else {
        await createEvento({ id: crypto.randomUUID(), ...payload });
      }

      resetForm();
      reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el evento');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteEvento(id);
      if (editingId === id) resetForm();
      reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al borrar el evento');
    }
  };

  return (
    <div className={styles.panel}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <p className={styles.formTitle}>{editingId ? 'Editar acto' : 'Nuevo acto'}</p>

        <input
          className={styles.input}
          placeholder="Título del acto"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />

        <div className={styles.row}>
          <input
            type="date"
            className={styles.input}
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            required
          />
          <input
            type="time"
            className={styles.input}
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
            required
          />
          <select
            className={styles.select}
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as EventType })}
          >
            {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <input
          className={styles.input}
          placeholder="Ubicación"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
          required
        />

        <textarea
          className={styles.textarea}
          placeholder="Descripción (opcional)"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <input
          className={styles.input}
          placeholder="URL de foto (opcional)"
          value={form.img_url}
          onChange={(e) => setForm({ ...form, img_url: e.target.value })}
        />

        <div className={styles.formActions}>
          {editingId && (
            <button type="button" className={styles.cancelBtn} onClick={resetForm}>
              Cancelar edición
            </button>
          )}
          <button type="submit" className={styles.submitBtn} disabled={submitting}>
            {submitting ? 'Guardando…' : editingId ? 'Guardar cambios' : 'Crear acto'}
          </button>
        </div>
        {error && <span className={styles.errorMsg}>{error}</span>}
      </form>

      {isLoading && <p className={styles.itemMeta}>Cargando eventos…</p>}

      <div className={styles.list}>
        {!isLoading && eventos.map((ev) => (
          <div key={ev.id} className={styles.item}>
            <div className={styles.itemInfo}>
              <p className={styles.itemTitle}>{ev.title}</p>
              <span className={styles.itemMeta}>{ev.date} · {ev.time}h · {ev.location} · {ev.type}</span>
            </div>
            <div className={styles.itemActions}>
              <button className={styles.actionBtn} onClick={() => startEditing(ev)}>Editar</button>
              <button className={`${styles.actionBtn} ${styles.danger}`} onClick={() => handleDelete(ev.id)}>
                Borrar
              </button>
            </div>
          </div>
        ))}
        {!isLoading && eventos.length === 0 && <p className={styles.itemMeta}>No hay eventos todavía.</p>}
      </div>
    </div>
  );
}
