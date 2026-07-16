import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminComparsasPanel from './AdminComparsasPanel';
import type { Comparsa, Cargo } from '../../types';

const getAllComparsasAdminMock = vi.fn();
const updateComparsaMock = vi.fn();
vi.mock('../../services/comparsasService', () => ({
  getAllComparsasAdmin: (...args: unknown[]) => getAllComparsasAdminMock(...args),
  updateComparsa: (...args: unknown[]) => updateComparsaMock(...args),
}));

const getCargosByComparsaMock = vi.fn();
const createCargoMock = vi.fn();
const updateCargoMock = vi.fn();
const deleteCargoMock = vi.fn();
vi.mock('../../services/cargosService', () => ({
  getCargosByComparsa: (...args: unknown[]) => getCargosByComparsaMock(...args),
  createCargo: (...args: unknown[]) => createCargoMock(...args),
  updateCargo: (...args: unknown[]) => updateCargoMock(...args),
  deleteCargo: (...args: unknown[]) => deleteCargoMock(...args),
}));

const uploadComparsaImageMock = vi.fn();
vi.mock('../../services/storage', () => ({
  uploadComparsaImage: (...args: unknown[]) => uploadComparsaImageMock(...args),
}));

const COMPARSA_1: Comparsa = { id: 'c1', name: 'Estudiantes', color: '#111', img: '', bando: 'Cristiano' };
const COMPARSA_2: Comparsa = { id: 'c2', name: 'Marinos Corsarios', color: '#222', img: '', bando: 'Cristiano' };
const CARGO_1: Cargo = { id: 'g1', comparsa_id: 'c1', role: 'Capitán', person_name: 'Juan Pérez', sort_order: 0 };

describe('AdminComparsasPanel', () => {
  beforeEach(() => {
    getAllComparsasAdminMock.mockReset().mockResolvedValue([COMPARSA_1, COMPARSA_2]);
    updateComparsaMock.mockReset().mockResolvedValue(undefined);
    getCargosByComparsaMock.mockReset().mockResolvedValue([CARGO_1]);
    createCargoMock.mockReset().mockResolvedValue({ ...CARGO_1, id: 'g2' });
    updateCargoMock.mockReset().mockResolvedValue(undefined);
    deleteCargoMock.mockReset().mockResolvedValue(undefined);
    uploadComparsaImageMock.mockReset().mockResolvedValue('https://cdn.example.com/logo.png');
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  it('selecciona automáticamente la primera comparsa de la lista', async () => {
    render(<AdminComparsasPanel />);
    expect(await screen.findByText('Estudiantes', { selector: 'p' })).toBeInTheDocument();
    await waitFor(() => expect(getCargosByComparsaMock).toHaveBeenCalledWith('c1'));
  });

  it('cambiar de comparsa recarga sus cargos', async () => {
    render(<AdminComparsasPanel />);
    await screen.findByText('Estudiantes', { selector: 'p' });

    fireEvent.click(screen.getByRole('button', { name: 'Marinos Corsarios' }));

    await waitFor(() => expect(getCargosByComparsaMock).toHaveBeenCalledWith('c2'));
  });

  it('guarda la historia/año/socios de la comparsa seleccionada', async () => {
    render(<AdminComparsasPanel />);
    await screen.findByPlaceholderText('Historia real de la comparsa…');

    fireEvent.change(screen.getByPlaceholderText('Historia real de la comparsa…'), { target: { value: 'Nueva historia' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar datos de la comparsa' }));

    await waitFor(() => expect(updateComparsaMock).toHaveBeenCalledWith('c1', expect.objectContaining({
      description: 'Nueva historia',
    })));
    expect(await screen.findByText('Guardado.')).toBeInTheDocument();
  });

  it('crea un cargo nuevo para la comparsa seleccionada', async () => {
    render(<AdminComparsasPanel />);
    await screen.findByText('Juan Pérez');

    fireEvent.change(screen.getByPlaceholderText('Rol (Capitán…)'), { target: { value: 'Sargento' } });
    fireEvent.change(screen.getByPlaceholderText('Nombre real'), { target: { value: 'María López' } });
    fireEvent.click(screen.getByRole('button', { name: 'Añadir' }));

    await waitFor(() => expect(createCargoMock).toHaveBeenCalledWith({
      comparsa_id: 'c1',
      role: 'Sargento',
      person_name: 'María López',
      sort_order: 1,
    }));
  });

  it('edita un cargo existente', async () => {
    render(<AdminComparsasPanel />);
    await screen.findByText('Juan Pérez');

    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
    expect(screen.getByDisplayValue('Capitán')).toBeInTheDocument();

    fireEvent.change(screen.getByDisplayValue('Juan Pérez'), { target: { value: 'Juan Pérez Actualizado' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));

    await waitFor(() => expect(updateCargoMock).toHaveBeenCalledWith('g1', {
      role: 'Capitán',
      person_name: 'Juan Pérez Actualizado',
    }));
  });

  it('borra un cargo solo si se confirma', async () => {
    render(<AdminComparsasPanel />);
    await screen.findByText('Juan Pérez');

    fireEvent.click(screen.getByRole('button', { name: 'Borrar' }));

    await waitFor(() => expect(deleteCargoMock).toHaveBeenCalledWith('g1'));
  });

  it('sube el logo de la comparsa y actualiza la comparsa con la URL', async () => {
    const { container } = render(<AdminComparsasPanel />);
    await screen.findByPlaceholderText('Historia real de la comparsa…');

    const fileInput = container.querySelectorAll('input[type="file"]')[0] as HTMLInputElement;
    const file = new File(['contenido'], 'logo.png', { type: 'image/png' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => expect(uploadComparsaImageMock).toHaveBeenCalledWith('logos/c1', file));
    await waitFor(() => expect(updateComparsaMock).toHaveBeenCalledWith('c1', { img: 'https://cdn.example.com/logo.png' }));
  });
});
