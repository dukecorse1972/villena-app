import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ImageDropzone from './ImageDropzone';

function getFileInput(container: HTMLElement): HTMLInputElement {
  return container.querySelector('input[type="file"]') as HTMLInputElement;
}

describe('ImageDropzone', () => {
  it('sin imagen, muestra la invitación a arrastrar o hacer clic', () => {
    render(<ImageDropzone onFileSelected={vi.fn()} label="Logo" />);

    expect(screen.getByText('Arrastra o haz clic')).toBeInTheDocument();
    expect(screen.getByText('Logo')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('con imageUrl, muestra la previsualización y el texto "Cambiar"', () => {
    const { container } = render(<ImageDropzone imageUrl="https://cdn.example.com/x.png" onFileSelected={vi.fn()} />);

    expect(screen.getByText('Cambiar')).toBeInTheDocument();
    // La imagen de previsualización es decorativa (alt=""), así que no tiene
    // rol accesible "img" — se consulta directamente en el DOM.
    const img = container.querySelector('img') as HTMLImageElement;
    expect(img.src).toBe('https://cdn.example.com/x.png');
  });

  it('rechaza un archivo que no es imagen, sin llamar a onFileSelected', async () => {
    const onFileSelected = vi.fn();
    const { container } = render(<ImageDropzone onFileSelected={onFileSelected} />);

    const file = new File(['contenido'], 'documento.pdf', { type: 'application/pdf' });
    fireEvent.change(getFileInput(container), { target: { files: [file] } });

    expect(await screen.findByText('El archivo debe ser una imagen')).toBeInTheDocument();
    expect(onFileSelected).not.toHaveBeenCalled();
  });

  it('sube un archivo de imagen válido y muestra "Subiendo…" mientras está pendiente', async () => {
    let resolveUpload: () => void = () => {};
    const onFileSelected = vi.fn(() => new Promise<void>((resolve) => { resolveUpload = resolve; }));
    const { container } = render(<ImageDropzone onFileSelected={onFileSelected} />);

    const file = new File(['contenido'], 'logo.png', { type: 'image/png' });
    fireEvent.change(getFileInput(container), { target: { files: [file] } });

    expect(await screen.findByText('Subiendo…')).toBeInTheDocument();
    expect(onFileSelected).toHaveBeenCalledWith(file);

    resolveUpload();
    await waitFor(() => expect(screen.queryByText('Subiendo…')).not.toBeInTheDocument());
  });

  it('si onFileSelected falla, muestra el mensaje de error devuelto', async () => {
    const onFileSelected = vi.fn().mockRejectedValue(new Error('Error al subir a Supabase'));
    const { container } = render(<ImageDropzone onFileSelected={onFileSelected} />);

    const file = new File(['contenido'], 'logo.png', { type: 'image/png' });
    fireEvent.change(getFileInput(container), { target: { files: [file] } });

    expect(await screen.findByText('Error al subir a Supabase')).toBeInTheDocument();
  });
});
