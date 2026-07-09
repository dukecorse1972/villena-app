import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useUserLocation } from '../hooks/useUserLocation';
import { useDeviceHeading } from '../hooks/useDeviceHeading';
import type { PointOfInterest } from '../types';
import styles from './MapView.module.css';

/**
 * Leaflet calcula el tamaño del mapa en el momento en que se monta. Si el
 * contenedor todavía no tiene su tamaño final (dentro de un modal con
 * animación de entrada, o de un panel que se acaba de hacer visible), ese
 * cálculo sale mal y todos los pines/la ruta aparecen desplazados hacia el
 * mismo lado. `invalidateSize()` le pide a Leaflet que vuelva a medir.
 */
export function FixMapSize() {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 300);

    const container = map.getContainer().parentElement;
    if (!container) return () => clearTimeout(timer);

    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(container);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [map]);

  return null;
}

// Centro de Villena, usado como fallback cuando no hay POIs/ruta que centrar.
const VILLENA_CENTER: [number, number] = [38.6322, -0.8677];

/**
 * Tiles de CARTO (mismos datos de OpenStreetMap, servidos por su CDN) en
 * vez de tile.openstreetmap.org: ese servidor gratuito de la OSM Foundation
 * es solo para uso puntual/desarrollo — su política de uso bloquea por IP
 * en cuanto detecta que una app real lo llama en cada carga
 * (osm.wiki/Blocked). CARTO no requiere API key. Estilo "Voyager": a color
 * (parques en verde, agua en azul, calles diferenciadas), más legible que
 * el estilo oscuro para un mapa con pines y rutas.
 */
export const TILE_URL = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
export const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors ' +
  '&copy; <a href="https://carto.com/attributions">CARTO</a>';
export const TILE_SUBDOMAINS = 'abcd';

// Icono propio en vez del marcador por defecto de Leaflet (que depende de
// imágenes que los bundlers no resuelven bien) — un pin dorado coherente
// con el resto de iconografía SVG de la app.
const pinIcon = L.divIcon({
  className: styles.pin,
  html: `<svg width="26" height="34" viewBox="0 0 24 32" fill="none">
    <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20c0-6.6-5.4-12-12-12z" fill="#c4972a"/>
    <circle cx="12" cy="12" r="4.5" fill="#0b1a0b"/>
  </svg>`,
  iconSize: [26, 34],
  iconAnchor: [13, 34],
});

// Punto azul para la ubicación en tiempo real del usuario. Sin brújula
// disponible: anillo pulsante (reutiliza la animación ring2 de theme.css).
// Con brújula: cono orientado hacia donde apunta el móvil, como en Google
// Maps — se reconstruye cada vez que cambia el rumbo.
function buildUserLocationIcon(heading: number | null) {
  if (heading === null) {
    return L.divIcon({
      className: styles.userDot,
      html: `<span class="${styles.userDotRing}"></span><span class="${styles.userDotCore}"></span>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });
  }

  return L.divIcon({
    className: styles.userDot,
    html: `<span class="${styles.userDotCone}" style="transform: rotate(${heading}deg)"></span><span class="${styles.userDotCore}"></span>`,
    iconSize: [46, 46],
    iconAnchor: [23, 23],
  });
}

interface MapViewProps {
  pois?: PointOfInterest[];
  /** Recorrido de un desfile a superponer, si el acto tiene uno asignado. */
  route?: [number, number][];
  height?: string;
  /** Desactivar cuando el mapa ya queda recortado por un contenedor padre (p. ej. dentro de un modal). */
  rounded?: boolean;
}

export default function MapView({ pois = [], route, height = '100%', rounded = true }: MapViewProps) {
  const center = route?.[0] ?? (pois[0] ? [pois[0].lat, pois[0].lng] as [number, number] : VILLENA_CENTER);
  const userLocation = useUserLocation();
  const heading = useDeviceHeading();
  const userLocationIcon = useMemo(() => buildUserLocationIcon(heading), [heading]);

  return (
    <div className={styles.wrap} style={{ height, borderRadius: rounded ? undefined : 0 }}>
      <MapContainer center={center} zoom={route ? 16 : 15} scrollWheelZoom={false} className={styles.map}>
        <FixMapSize />
        <TileLayer attribution={TILE_ATTRIBUTION} url={TILE_URL} subdomains={TILE_SUBDOMAINS} />
        {pois.map((poi) => (
          <Marker key={poi.id} position={[poi.lat, poi.lng]} icon={pinIcon}>
            <Popup>
              <strong>{poi.name}</strong>
              {poi.description && <p>{poi.description}</p>}
            </Popup>
          </Marker>
        ))}
        {route && route.length > 1 && (
          <Polyline positions={route} pathOptions={{ color: '#c4972a', weight: 4, opacity: 0.85 }} />
        )}
        {userLocation && (
          <Marker position={userLocation} icon={userLocationIcon} zIndexOffset={1000}>
            <Popup>Tu ubicación</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
