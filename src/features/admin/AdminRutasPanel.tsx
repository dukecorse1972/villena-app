import { useState, lazy, Suspense } from 'react';
import { getRutas, createRuta, updateRuta, deleteRuta } from '../../services/rutasService';
import { useAsyncList } from '../../hooks/useAsyncList';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import type { Ruta } from '../../types';
import styles from './AdminRutasPanel.module.css';

const RouteEditorMap = lazy(() => import('./RouteEditorMap'));

const EMPTY_FORM = { name: '', points: [] as [number, number][] };

export default function AdminRutasPanel() {
  const { data: rutas, isLoading, error, setError, reload } = useAsyncList<Ruta>(getRutas);
  const { submitting, run } = useAsyncAction(setError);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const resetForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const startEditing = (ruta: Ruta) => {
    setEditingId(ruta.id);
    setForm({ name: ruta.name, points: ruta.path });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Ponle un nombre a la ruta'); return; }
    if (form.points.length < 2) { setError('Marca al menos dos puntos en el mapa'); return; }

    const ok = await run(async () => {
      if (editingId) {
        await updateRuta(editingId, { name: form.name.trim(), path: form.points });
      } else {
        await createRuta({ id: crypto.randomUUID(), name: form.name.trim(), path: form.points });
      }
    }, 'Error al guardar la ruta');

    if (ok) {
      resetForm();
      reload();
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`¿Borrar la ruta "${name}"? Esta acción no se puede deshacer.`)) return;

    const ok = await run(() => deleteRuta(id), 'Error al borrar la ruta');
    if (ok) {
      if (editingId === id) resetForm();
      reload();
    }
  };

  return (
    <div className={styles.panel}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <p className={styles.formTitle}>{editingId ? 'Editar recorrido' : 'Nuevo recorrido'}</p>

        <input
          className={styles.input}
          placeholder="Nombre de la ruta (p. ej. Av. Constitución)"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />

        <p className={styles.hint}>Toca el mapa para ir marcando el recorrido, en orden.</p>

        <Suspense fallback={<p className={styles.hint}>Cargando mapa…</p>}>
          <RouteEditorMap
            points={form.points}
            onChange={(points) => setForm({ ...form, points })}
          />
        </Suspense>

        <div className={styles.editorActions}>
          <span className={styles.pointCount}>{form.points.length} punto{form.points.length === 1 ? '' : 's'}</span>
          <button
            type="button"
            className={styles.smallBtn}
            disabled={form.points.length === 0}
            onClick={() => setForm({ ...form, points: form.points.slice(0, -1) })}
          >
            Deshacer último punto
          </button>
          <button
            type="button"
            className={styles.smallBtn}
            disabled={form.points.length === 0}
            onClick={() => setForm({ ...form, points: [] })}
          >
            Vaciar
          </button>
        </div>

        <div className={styles.formActions}>
          {editingId && (
            <button type="button" className={styles.cancelBtn} onClick={resetForm}>
              Cancelar edición
            </button>
          )}
          <button type="submit" className={styles.submitBtn} disabled={submitting}>
            {submitting ? 'Guardando…' : editingId ? 'Guardar cambios' : 'Crear ruta'}
          </button>
        </div>
        {error && <span className={styles.errorMsg}>{error}</span>}
      </form>

      {isLoading && <p className={styles.itemMeta}>Cargando rutas…</p>}

      <div className={styles.list}>
        {!isLoading && rutas.map((ruta) => (
          <div key={ruta.id} className={styles.item}>
            <div className={styles.itemInfo}>
              <p className={styles.itemTitle}>{ruta.name}</p>
              <span className={styles.itemMeta}>{ruta.path.length} puntos</span>
            </div>
            <div className={styles.itemActions}>
              <button className={styles.actionBtn} onClick={() => startEditing(ruta)}>Editar</button>
              <button className={`${styles.actionBtn} ${styles.danger}`} onClick={() => handleDelete(ruta.id, ruta.name)}>
                Borrar
              </button>
            </div>
          </div>
        ))}
        {!isLoading && rutas.length === 0 && <p className={styles.itemMeta}>No hay rutas todavía.</p>}
      </div>
    </div>
  );
}
