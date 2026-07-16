import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminAvisosPanel from './AdminAvisosPanel';
import type { Aviso } from '../../types';

const getAvisosMock = vi.fn();
const createAvisoMock = vi.fn();
const updateAvisoMock = vi.fn();
const deleteAvisoMock = vi.fn();

vi.mock('../../services/avisosService', () => ({
  getAvisos: (...args: unknown[]) => getAvisosMock(...args),
  createAviso: (...args: unknown[]) => createAvisoMock(...args),
  updateAviso: (...args: unknown[]) => updateAvisoMock(...args),
  deleteAviso: (...args: unknown[]) => deleteAvisoMock(...args),
  timeAgo: () => 'hace 1 hora',
}));

const AVISO: Aviso = { id: 'a1', text: 'Aviso existente', is_new: true, created_at: '2026-09-04T10:00:00.000Z' };

describe('AdminAvisosPanel', () => {
  beforeEach(() => {
    getAvisosMock.mockReset().mockResolvedValue([AVISO]);
    createAvisoMock.mockReset().mockResolvedValue({ ...AVISO, id: 'a2' });
    updateAvisoMock.mockReset().mockResolvedValue(undefined);
    deleteAvisoMock.mockReset().mockResolvedValue(undefined);
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  it('muestra la lista de avisos cargada', async () => {
    render(<AdminAvisosPanel />);

    expect(await screen.findByText('Aviso existente')).toBeInTheDocument();
  });

  it('crea un aviso nuevo y recarga la lista', async () => {
    render(<AdminAvisosPanel />);
    await screen.findByText('Aviso existente');

    fireEvent.change(screen.getByPlaceholderText('Escribe el aviso…'), { target: { value: 'Aviso recién escrito' } });
    fireEvent.click(screen.getByRole('button', { name: 'Publicar aviso' }));

    await waitFor(() => expect(createAvisoMock).toHaveBeenCalledWith('Aviso recién escrito', true));
    // reload() vuelve a llamar a getAvisos tras el create con éxito
    await waitFor(() => expect(getAvisosMock).toHaveBeenCalledTimes(2));
  });

  it('muestra el error si crear el aviso falla, sin vaciar el formulario', async () => {
    createAvisoMock.mockRejectedValue(new Error('fallo de red'));
    render(<AdminAvisosPanel />);
    await screen.findByText('Aviso existente');

    fireEvent.change(screen.getByPlaceholderText('Escribe el aviso…'), { target: { value: 'Texto que falla' } });
    fireEvent.click(screen.getByRole('button', { name: 'Publicar aviso' }));

    expect(await screen.findByText('fallo de red')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Escribe el aviso…')).toHaveValue('Texto que falla');
  });

  it('borra un aviso solo si se confirma', async () => {
    render(<AdminAvisosPanel />);
    await screen.findByText('Aviso existente');

    fireEvent.click(screen.getByRole('button', { name: 'Borrar' }));

    expect(window.confirm).toHaveBeenCalled();
    await waitFor(() => expect(deleteAvisoMock).toHaveBeenCalledWith('a1'));
  });

  it('no borra si el usuario cancela la confirmación', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(<AdminAvisosPanel />);
    await screen.findByText('Aviso existente');

    fireEvent.click(screen.getByRole('button', { name: 'Borrar' }));

    expect(deleteAvisoMock).not.toHaveBeenCalled();
  });

  it('marca/desmarca "nuevo" con el botón de alternar', async () => {
    render(<AdminAvisosPanel />);
    await screen.findByText('Aviso existente');

    fireEvent.click(screen.getByRole('button', { name: 'Quitar "nuevo"' }));

    await waitFor(() => expect(updateAvisoMock).toHaveBeenCalledWith('a1', { is_new: false }));
  });
});
