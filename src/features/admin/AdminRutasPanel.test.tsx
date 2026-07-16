import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminRutasPanel from './AdminRutasPanel';
import type { Ruta } from '../../types';

const getRutasMock = vi.fn();
const createRutaMock = vi.fn();
const updateRutaMock = vi.fn();
const deleteRutaMock = vi.fn();

vi.mock('../../services/rutasService', () => ({
  getRutas: (...args: unknown[]) => getRutasMock(...args),
  createRuta: (...args: unknown[]) => createRutaMock(...args),
  updateRuta: (...args: unknown[]) => updateRutaMock(...args),
  deleteRuta: (...args: unknown[]) => deleteRutaMock(...args),
}));

// El editor de mapa real usa Leaflet, que no se puede renderizar en jsdom —
// se sustituye por un stub con un botón que añade un punto fijo, para poder
// probar la lógica del panel (contador de puntos, deshacer, validación).
vi.mock('./RouteEditorMap', () => ({
  default: ({ points, onChange }: { points: [number, number][]; onChange: (p: [number, number][]) => void }) => (
    <button type="button" onClick={() => onChange([...points, [38.63, -0.86]])}>
      Simular clic en mapa
    </button>
  ),
}));

const RUTA: Ruta = { id: 'r1', name: 'Recorrido centro', path: [[38.63, -0.86], [38.64, -0.87]] };

describe('AdminRutasPanel', () => {
  beforeEach(() => {
    getRutasMock.mockReset().mockResolvedValue([RUTA]);
    createRutaMock.mockReset().mockResolvedValue({ ...RUTA, id: 'r2' });
    updateRutaMock.mockReset().mockResolvedValue(undefined);
    deleteRutaMock.mockReset().mockResolvedValue(undefined);
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.spyOn(crypto, 'randomUUID').mockReturnValue('22222222-2222-2222-2222-222222222222');
  });

  it('muestra la lista de rutas cargada', async () => {
    render(<AdminRutasPanel />);
    expect(await screen.findByText('Recorrido centro')).toBeInTheDocument();
  });

  it('no deja enviar con menos de 2 puntos marcados', async () => {
    render(<AdminRutasPanel />);
    await screen.findByText('Recorrido centro');

    fireEvent.change(screen.getByPlaceholderText('Nombre de la ruta (p. ej. Av. Constitución)'), {
      target: { value: 'Ruta sin puntos' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Crear ruta' }));

    expect(await screen.findByText('Marca al menos dos puntos en el mapa')).toBeInTheDocument();
    expect(createRutaMock).not.toHaveBeenCalled();
  });

  it('añadir puntos con el mapa y crear la ruta', async () => {
    render(<AdminRutasPanel />);
    await screen.findByText('Recorrido centro');

    fireEvent.change(screen.getByPlaceholderText('Nombre de la ruta (p. ej. Av. Constitución)'), {
      target: { value: 'Ruta nueva' },
    });
    fireEvent.click(await screen.findByRole('button', { name: 'Simular clic en mapa' }));
    fireEvent.click(screen.getByRole('button', { name: 'Simular clic en mapa' }));
    const editorActions = screen.getByRole('button', { name: 'Deshacer último punto' }).parentElement!;
    expect(within(editorActions).getByText('2 puntos')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Crear ruta' }));

    await waitFor(() => expect(createRutaMock).toHaveBeenCalledWith({
      id: '22222222-2222-2222-2222-222222222222',
      name: 'Ruta nueva',
      path: [[38.63, -0.86], [38.63, -0.86]],
    }));
  });

  it('"Deshacer último punto" quita el último punto marcado', async () => {
    render(<AdminRutasPanel />);
    await screen.findByText('Recorrido centro');

    fireEvent.click(await screen.findByRole('button', { name: 'Simular clic en mapa' }));
    fireEvent.click(screen.getByRole('button', { name: 'Simular clic en mapa' }));
    const editorActions = screen.getByRole('button', { name: 'Deshacer último punto' }).parentElement!;
    expect(within(editorActions).getByText('2 puntos')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Deshacer último punto' }));
    expect(within(editorActions).getByText('1 punto')).toBeInTheDocument();
  });

  it('borra una ruta solo si se confirma', async () => {
    render(<AdminRutasPanel />);
    await screen.findByText('Recorrido centro');

    fireEvent.click(screen.getByRole('button', { name: 'Borrar' }));

    await waitFor(() => expect(deleteRutaMock).toHaveBeenCalledWith('r1'));
  });
});
