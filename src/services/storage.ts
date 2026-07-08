import { supabase } from './supabase';

const BUCKET = 'comparsas';

function extensionOf(file: File): string {
  const fromName = file.name.split('.').pop();
  if (fromName && fromName.length <= 5) return fromName.toLowerCase();
  return file.type.split('/').pop() ?? 'jpg';
}

/**
 * Sube una imagen al bucket público `comparsas` bajo `path` (sin extensión;
 * se añade la del archivo) y devuelve su URL pública. Sobrescribe cualquier
 * archivo previo en esa misma ruta, para que logos/fotos siempre vivan en
 * una URL estable por comparsa/cargo.
 */
export async function uploadComparsaImage(path: string, file: File): Promise<string> {
  const fullPath = `${path}.${extensionOf(file)}`;

  const { error } = await supabase.storage.from(BUCKET).upload(fullPath, file, {
    upsert: true,
    cacheControl: '3600',
  });
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(fullPath);
  // Cache-bust: la ruta es estable entre subidas, así que sin esto el
  // navegador/CDN podría seguir sirviendo la imagen anterior.
  return `${data.publicUrl}?v=${Date.now()}`;
}
