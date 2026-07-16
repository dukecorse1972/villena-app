import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminEventosPanel from './AdminEventosPanel';
import type { FiestaEvent, Ruta } from '../../types';

const getAllEventosMock = vi.fn();
const createEventoMock = vi.fn();
const updateEventoMock = vi.fn();
const deleteEventoMock = vi.fn();

vi.mock('../../services/eventsService', () => ({
  getAllEventos: (...args: unknown[]) => getAllEventosMock(...args),
  createEvento: (...args: unknown[]) => createEventoMock(...args),
  updateEvento: (...args: unknown[]) => updateEventoMock(...args),
  deleteEvento: (...args: unknown[]) => deleteEventoMock(...args),
}));

const getRutasMock = vi.fn();
vi.mock('../../services/rutasService', () => ({
  getRutas: (...args: unknown[]) => getRutasMock(...args),
}));

const EVENTO: FiestaEvent = {
  id: 'e1', date: '2026-09-06', time: '11:00', title: 'Entrada Mora',
  location: 'Av. Constitución', type: 'Desfiles',
};
const RUTA: Ruta = { id: 'r1', name: 'Recorrido centro', path: [[38.63, -0.86], [38.64, -0.87]] };

describe('AdminEventosPanel', () => {
  beforeEach(() => {
    getAllEventosMock.mockReset().mockResolvedValue([EVENTO]);
    getRutasMock.mockReset().mockResolvedValue([RUTA]);
    createEventoMock.mockReset().mockResolvedValue({ ...EVENTO, id: 'e2' });
    updateEventoMock.mockReset().mockResolvedValue(undefined);
    deleteEventoMock.mockReset().mockResolvedValue(undefined);
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.spyOn(crypto, 'randomUUID').mockReturnValue('11111111-1111-1111-1111-111111111111');
  });

  it('muestra la lista de eventos cargada', async () => {
    render(<AdminEventosPanel />);
    expect(await screen.findByText('Entrada Mora')).toBeInTheDocument();
  });

  it('el selector de ruta solo aparece si el tipo es Desfiles', async () => {
    render(<AdminEventosPanel />);
    await screen.findByText('Entrada Mora');

    // Por defecto el formulario nuevo ya es tipo "Desfiles"
    expect(screen.getByText('Sin recorrido asignado')).toBeInTheDocument();

    fireEvent.change(screen.getByDisplayValue('Desfiles'), { target: { value: 'Cultural' } });
    expect(screen.queryByText('Sin recorrido asignado')).not.toBeInTheDocument();
  });

  it('crea un evento nuevo con los datos del formulario', async () => {
    const { container } = render(<AdminEventosPanel />);
    await screen.findByText('Entrada Mora');

    fireEvent.change(screen.getByPlaceholderText('Título del acto'), { target: { value: 'Acto nuevo' } });
    fireEvent.change(container.querySelector('input[type="date"]')!, { target: { value: '2026-09-05' } });
    fireEvent.change(container.querySelector('input[type="time"]')!, { target: { value: '20:00' } });
    fireEvent.change(screen.getByPlaceholderText('Ubicación'), { target: { value: 'Plaza Mayor' } });

    fireEvent.click(screen.getByRole('button', { name: 'Crear acto' }));

    await waitFor(() => expect(createEventoMock).toHaveBeenCalledWith(expect.objectContaining({
      id: '11111111-1111-1111-1111-111111111111',
      title: 'Acto nuevo',
      date: '2026-09-05',
      time: '20:00',
      location: 'Plaza Mayor',
      type: 'Desfiles',
    })));
  });

  it('editar precarga el formulario y guarda los cambios', async () => {
    render(<AdminEventosPanel />);
    await screen.findByText('Entrada Mora');

    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
    expect(screen.getByDisplayValue('Entrada Mora')).toBeInTheDocument();

    fireEvent.change(screen.getByDisplayValue('Entrada Mora'), { target: { value: 'Entrada Mora (cambiada)' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() => expect(updateEventoMock).toHaveBeenCalledWith('e1', expect.objectContaining({
      title: 'Entrada Mora (cambiada)',
    })));
  });

  it('borra un evento solo si se confirma', async () => {
    render(<AdminEventosPanel />);
    await screen.findByText('Entrada Mora');

    fireEvent.click(screen.getByRole('button', { name: 'Borrar' }));

    await waitFor(() => expect(deleteEventoMock).toHaveBeenCalledWith('e1'));
  });
});
