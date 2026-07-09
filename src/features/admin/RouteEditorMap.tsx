import { MapContainer, TileLayer, Marker, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FixMapSize, TILE_URL, TILE_ATTRIBUTION, TILE_SUBDOMAINS } from '../../components/MapView';
import styles from './RouteEditorMap.module.css';

const VILLENA_CENTER: [number, number] = [38.6322, -0.8677];

// Círculo numerado en vez de un pin — aquí lo que importa es ver el orden
// de los puntos del recorrido, no marcar un lugar.
function pointIcon(index: number) {
  return L.divIcon({
    className: styles.point,
    html: `<span>${index + 1}</span>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

interface ClickCatcherProps {
  onAddPoint: (point: [number, number]) => void;
}

function ClickCatcher({ onAddPoint }: ClickCatcherProps) {
  useMapEvents({
    click(e) {
      onAddPoint([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

interface RouteEditorMapProps {
  points: [number, number][];
  onChange: (points: [number, number][]) => void;
  height?: string;
}

/**
 * Mapa interactivo para dibujar un recorrido: cada clic añade un punto al
 * final del trazado. Distinto de MapView (que es de solo lectura) para no
 * mezclar responsabilidades de visualización y edición.
 */
export default function RouteEditorMap({ points, onChange, height = '280px' }: RouteEditorMapProps) {
  const center = points[0] ?? VILLENA_CENTER;

  return (
    <div className={styles.wrap} style={{ height }}>
      <MapContainer center={center} zoom={16} scrollWheelZoom className={styles.map}>
        <FixMapSize />
        <TileLayer attribution={TILE_ATTRIBUTION} url={TILE_URL} subdomains={TILE_SUBDOMAINS} />
        <ClickCatcher onAddPoint={(point) => onChange([...points, point])} />
        {points.map((p, i) => (
          <Marker key={i} position={p} icon={pointIcon(i)} />
        ))}
        {points.length > 1 && (
          <Polyline positions={points} pathOptions={{ color: '#c4972a', weight: 4, opacity: 0.85 }} />
        )}
      </MapContainer>
    </div>
  );
}
