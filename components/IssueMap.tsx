'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon broken in webpack builds
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface IssueMapProps {
  latitude: number;
  longitude: number;
  popupText?: string;
  zoom?: number;
  height?: string;
}

/**
 * Read-only Leaflet map showing a complaint's location.
 * Must be dynamically imported (no SSR) from parent components.
 */
export default function IssueMap({
  latitude,
  longitude,
  popupText,
  zoom = 15,
  height = '280px',
}: IssueMapProps) {
  return (
    <div style={{ height, borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--gray-200)' }}>
      <MapContainer
        center={[latitude, longitude]}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
        aria-label={`Map showing location at ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[latitude, longitude]}>
          {popupText && <Popup>{popupText}</Popup>}
        </Marker>
      </MapContainer>
    </div>
  );
}
