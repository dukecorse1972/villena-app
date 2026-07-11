// Noticias de fiestas de El Periódico de Villena (elperiodicodevillena.com),
// vía su API REST pública de WordPress. No hace falta pasar por un Edge
// Function: es un endpoint de solo lectura sin clave que enviar, y el sitio
// devuelve cabeceras CORS abiertas (refleja el Origin de la petición), así
// que se puede llamar directamente desde el cliente.

export const NEWS_CATEGORY_URL = 'https://elperiodicodevillena.com/category/sociedad/fiestas/';

const NEWS_API_URL =
  'https://elperiodicodevillena.com/wp-json/wp/v2/posts?categories=20&per_page=4&_embed=wp:featuredmedia';

const MAX_ITEMS = 4;

export interface NewsItem {
  id: number;
  title: string;
  url: string;
  img: string | null;
  date: string; // ISO
}

interface WpFeaturedMedia {
  source_url?: string;
  media_details?: { sizes?: Record<string, { source_url: string }> };
}

interface WpPost {
  id: number;
  date: string;
  link: string;
  title: { rendered: string };
  _embedded?: { 'wp:featuredmedia'?: WpFeaturedMedia[] };
}

/** Decodifica entidades HTML (`&#8211;`, `&amp;`, …) que WordPress deja sin resolver en `title.rendered`. */
function decodeHtmlEntities(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.documentElement.textContent ?? html;
}

function rowToNewsItem(post: WpPost): NewsItem {
  const media = post._embedded?.['wp:featuredmedia']?.[0];
  const img = media?.media_details?.sizes?.medium?.source_url ?? media?.source_url ?? null;

  return {
    id:    post.id,
    title: decodeHtmlEntities(post.title.rendered),
    url:   post.link,
    img,
    date:  post.date,
  };
}

/** "2026-07-10T11:54:39" → "Viernes, 10 julio 2026" (mismo estilo que usaba el contenido de ejemplo). */
export function formatNewsDate(iso: string): string {
  const formatted = new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day:     'numeric',
    month:   'long',
    year:    'numeric',
  }).format(new Date(iso));

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

// La portada de fiestas no cambia cada minuto: cachear en memoria evita
// volver a pedirla en cada vuelta a Inicio dentro de la misma sesión.
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutos
let cached: { news: NewsItem[]; fetchedAt: number } | null = null;

/** Últimas noticias (máximo 4) de la categoría de fiestas de El Periódico de Villena. */
export async function getLatestNews(): Promise<NewsItem[]> {
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) return cached.news;

  try {
    const res = await fetch(NEWS_API_URL);
    if (!res.ok) return cached?.news ?? [];

    const posts = (await res.json()) as WpPost[];
    const news = posts.slice(0, MAX_ITEMS).map(rowToNewsItem);

    cached = { news, fetchedAt: Date.now() };
    return news;
  } catch {
    return cached?.news ?? [];
  }
}
