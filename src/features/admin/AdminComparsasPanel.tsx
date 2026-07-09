import { useState, useEffect } from 'react';
import { getAllComparsasAdmin, updateComparsa } from '../../services/comparsasService';
import { getCargosByComparsa, createCargo, updateCargo, deleteCargo } from '../../services/cargosService';
import { uploadComparsaImage } from '../../services/storage';
import { useAsyncList } from '../../hooks/useAsyncList';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import ImageDropzone from '../../components/ImageDropzone';
import type { Comparsa, Cargo } from '../../types';
import styles from './AdminComparsasPanel.module.css';

const CARGO_SUGERENCIAS = ['Capitán', 'Sargento', 'Abanderado', 'Alférez', 'Teniente', 'Maestre', 'Porta-estandarte'];

export default function AdminComparsasPanel() {
  const { data: comparsas, setData: setComparsas, error: comparsasError } = useAsyncList<Comparsa>(getAllComparsasAdmin);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [description, setDescription] = useState('');
  const [foundedYear, setFoundedYear] = useState('');
  const [numSocios, setNumSocios] = useState('');
  const [comparsaError, setComparsaError] = useState<string | null>(null);
  const [comparsaSaved, setComparsaSaved] = useState(false);
  const { submitting: savingComparsa, run: runComparsa } = useAsyncAction(setComparsaError);

  const [cargoRole, setCargoRole] = useState('');
  const [cargoName, setCargoName] = useState('');
  const [editingCargoId, setEditingCargoId] = useState<string | null>(null);

  // Selecciona la primera comparsa en cuanto llega la lista.
  useEffect(() => {
    if (comparsas.length > 0 && selectedId === null) setSelectedId(comparsas[0].id); // eslint-disable-line react-hooks/set-state-in-effect
  }, [comparsas, selectedId]);

  const selected = comparsas.find((c) => c.id === selectedId) ?? null;

  // El formulario se resetea con los datos de la comparsa recién
  // seleccionada — no es un valor derivable en render porque el usuario
  // edita estos campos localmente antes de guardar.
  useEffect(() => {
    if (!selected) return;
    setDescription(selected.description ?? ''); // eslint-disable-line react-hooks/set-state-in-effect
    setFoundedYear(selected.founded_year ? String(selected.founded_year) : '');
    setNumSocios(selected.num_socios ? String(selected.num_socios) : '');
    setComparsaSaved(false);
    setComparsaError(null);
  }, [selected]);

  const {
    data: cargos,
    setData: setCargos,
    isLoading: cargosLoading,
    error: cargoError,
    setError: setCargoError,
    reload: reloadCargos,
  } = useAsyncList<Cargo>(() => (selectedId ? getCargosByComparsa(selectedId) : Promise.resolve([])), [selectedId]);
  const { run: runCargo } = useAsyncAction(setCargoError);

  const handleSaveComparsa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;

    setComparsaSaved(false);
    const founded = foundedYear ? Number(foundedYear) : undefined;
    const socios  = numSocios ? Number(numSocios) : undefined;

    const ok = await runComparsa(
      () => updateComparsa(selectedId, { description: description.trim() || undefined, founded_year: founded, num_socios: socios }),
      'Error al guardar la comparsa',
    );

    if (ok) {
      setComparsas((prev) => prev.map((c) => c.id === selectedId
        ? { ...c, description, founded_year: founded, num_socios: socios }
        : c));
      setComparsaSaved(true);
    }
  };

  const startEditingCargo = (cargo: Cargo) => {
    setEditingCargoId(cargo.id);
    setCargoRole(cargo.role);
    setCargoName(cargo.person_name);
  };

  const cancelEditingCargo = () => {
    setEditingCargoId(null);
    setCargoRole('');
    setCargoName('');
  };

  const handleSubmitCargo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || !cargoRole.trim() || !cargoName.trim()) return;

    const ok = await runCargo(async () => {
      if (editingCargoId) {
        await updateCargo(editingCargoId, { role: cargoRole.trim(), person_name: cargoName.trim() });
      } else {
        await createCargo({
          comparsa_id: selectedId,
          role: cargoRole.trim(),
          person_name: cargoName.trim(),
          sort_order: cargos.length,
        });
      }
    }, 'Error al guardar el cargo');

    if (ok) {
      cancelEditingCargo();
      reloadCargos();
    }
  };

  const handleDeleteCargo = async (id: string) => {
    if (!selectedId) return;
    const ok = await runCargo(() => deleteCargo(id), 'Error al borrar el cargo');
    if (ok) reloadCargos();
  };

  const handleLogoUpload = async (file: File) => {
    if (!selectedId) return;
    const url = await uploadComparsaImage(`logos/${selectedId}`, file);
    await updateComparsa(selectedId, { img: url });
    setComparsas((prev) => prev.map((c) => (c.id === selectedId ? { ...c, img: url } : c)));
  };

  const handleApartadoUpload = async (
    field: 'desfile_img' | 'traje_gala_img' | 'estandarte_img',
    folder: string,
    file: File,
  ) => {
    if (!selectedId) return;
    const url = await uploadComparsaImage(`${folder}/${selectedId}`, file);
    await updateComparsa(selectedId, { [field]: url });
    setComparsas((prev) => prev.map((c) => (c.id === selectedId ? { ...c, [field]: url } : c)));
  };

  const handleCargoPhotoUpload = async (cargo: Cargo, file: File) => {
    const url = await uploadComparsaImage(`cargos/${cargo.id}`, file);
    await updateCargo(cargo.id, { photo_url: url });
    setCargos((prev) => prev.map((c) => (c.id === cargo.id ? { ...c, photo_url: url } : c)));
  };

  return (
    <div className={styles.panel}>
      <div className={styles.list}>
        {comparsas.map((c) => (
          <button
            key={c.id}
            className={`${styles.chip}${selectedId === c.id ? ` ${styles.active}` : ''}`}
            onClick={() => setSelectedId(c.id)}
          >
            {c.name}
          </button>
        ))}
      </div>
      {comparsasError && <span className={styles.errorMsg}>{comparsasError}</span>}

      {selected && (
        <div className={styles.detail}>
          <p className={styles.detailTitle}>{selected.name}</p>

          <div className={styles.photoRow}>
            <ImageDropzone
              label="Logo / escudo"
              imageUrl={selected.img}
              variant="square"
              onFileSelected={handleLogoUpload}
            />
            <ImageDropzone
              label="Imagen de desfile"
              imageUrl={selected.desfile_img}
              variant="square"
              onFileSelected={(file) => handleApartadoUpload('desfile_img', 'desfile', file)}
            />
            <ImageDropzone
              label="Traje de gala"
              imageUrl={selected.traje_gala_img}
              variant="square"
              onFileSelected={(file) => handleApartadoUpload('traje_gala_img', 'traje-gala', file)}
            />
            <ImageDropzone
              label="Estandarte"
              imageUrl={selected.estandarte_img}
              variant="square"
              onFileSelected={(file) => handleApartadoUpload('estandarte_img', 'estandarte', file)}
            />
          </div>

          <form className={styles.form} onSubmit={handleSaveComparsa}>
            <div>
              <span className={styles.label}>Historia</span>
              <textarea
                className={styles.textarea}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Historia real de la comparsa…"
              />
            </div>
            <div className={styles.row}>
              <div>
                <span className={styles.label}>Año de fundación</span>
                <input
                  type="number"
                  className={styles.input}
                  value={foundedYear}
                  onChange={(e) => setFoundedYear(e.target.value)}
                />
              </div>
              <div>
                <span className={styles.label}>Nº de socios</span>
                <input
                  type="number"
                  className={styles.input}
                  value={numSocios}
                  onChange={(e) => setNumSocios(e.target.value)}
                />
              </div>
            </div>
            <button type="submit" className={styles.submitBtn} disabled={savingComparsa}>
              {savingComparsa ? 'Guardando…' : 'Guardar datos de la comparsa'}
            </button>
            {comparsaError && <span className={styles.errorMsg}>{comparsaError}</span>}
            {comparsaSaved && <span className={styles.successMsg}>Guardado.</span>}
          </form>

          <hr className={styles.divider} />

          <p className={styles.detailTitle}>Cargos del año</p>

          <form className={styles.cargoForm} onSubmit={handleSubmitCargo}>
            <input
              className={styles.input}
              list="cargo-sugerencias"
              placeholder="Rol (Capitán…)"
              value={cargoRole}
              onChange={(e) => setCargoRole(e.target.value)}
              required
            />
            <datalist id="cargo-sugerencias">
              {CARGO_SUGERENCIAS.map((r) => <option key={r} value={r} />)}
            </datalist>
            <input
              className={styles.input}
              placeholder="Nombre real"
              value={cargoName}
              onChange={(e) => setCargoName(e.target.value)}
              required
            />
            <button type="submit" className={styles.submitBtn}>
              {editingCargoId ? 'Guardar' : 'Añadir'}
            </button>
            {editingCargoId && (
              <button type="button" className={styles.actionBtn} onClick={cancelEditingCargo}>
                Cancelar
              </button>
            )}
          </form>
          {cargoError && <span className={styles.errorMsg}>{cargoError}</span>}

          <div className={styles.cargoList}>
            {cargosLoading && <span className={styles.label}>Cargando cargos…</span>}
            {!cargosLoading && cargos.map((cargo) => (
              <div key={cargo.id} className={styles.cargoItem}>
                <ImageDropzone
                  imageUrl={cargo.photo_url}
                  variant="circle"
                  onFileSelected={(file) => handleCargoPhotoUpload(cargo, file)}
                />
                <span className={styles.cargoInfo}>
                  <span className={styles.cargoRole}>{cargo.role}</span>
                  {cargo.person_name}
                </span>
                <div className={styles.itemActions}>
                  <button className={styles.actionBtn} onClick={() => startEditingCargo(cargo)}>Editar</button>
                  <button className={`${styles.actionBtn} ${styles.danger}`} onClick={() => handleDeleteCargo(cargo.id)}>
                    Borrar
                  </button>
                </div>
              </div>
            ))}
            {!cargosLoading && cargos.length === 0 && <span className={styles.label}>Sin cargos todavía.</span>}
          </div>
        </div>
      )}
    </div>
  );
}
