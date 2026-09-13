'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Crosshair } from 'lucide-react';

// Fix default marker icon issue with Leaflet
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom pin icons by status
const createPinIcon = (color: string) =>
  L.divIcon({
    className: 'custom-pin-icon',
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"><div style="width: 6px; height: 6px; background-color: white; border-radius: 50%;"></div></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

const reportedIcon = createPinIcon('#EF4444');  // Red
const progressIcon = createPinIcon('#F59E0B');  // Orange/Amber
const resolvedIcon = createPinIcon('#10B981');  // Green

type PublicMarker = { id: string; category: string; status: string; latitude: number; longitude: number };

function LocationMarker({ position }: { position: [number, number] | null }) {
  const map = useMap();
  useEffect(() => { if (position) map.flyTo(position, 14); }, [map, position]);
  if (position) {
    return (
      <Marker position={position} icon={reportedIcon}>
        <Popup>Your Detected Location</Popup>
      </Marker>
    );
  }
  return null;
}

export default function HomeMap() {
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [markers, setMarkers] = useState<PublicMarker[]>([]);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    fetch('/api/complaints?public=1').then(async (response) => {
      const result = await response.json();
      if (response.ok) setMarkers(result.data ?? []);
    }).catch(() => undefined);
  }, []);

  const handleDetectLocation = () => {
    setLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserPos([pos.coords.latitude, pos.coords.longitude]);
          setLocating(false);
        },
        () => {
          // Fallback location (Bengaluru East)
          setUserPos([12.9716, 77.5946]);
          setLocating(false);
        }
      );
    } else {
      setUserPos([12.9716, 77.5946]);
      setLocating(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Map Container with Legend Overlay */}
      <div className="civic-map-shell relative rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-blue-50/50" style={{ height: '320px' }}>
        <MapContainer
          center={[12.9716, 77.5946]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
          aria-label="Interactive civic issue map"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {markers.map((m) => (
            <Marker key={m.id} position={[m.latitude, m.longitude]} icon={m.status === 'RESOLVED' ? resolvedIcon : m.status === 'IN_PROGRESS' ? progressIcon : reportedIcon}>
              <Popup>
                <div className="p-1 text-xs">
                  <strong className="block font-semibold text-gray-900 mb-0.5">{m.category.replaceAll('_', ' ')}</strong>
                  <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    m.status === 'REPORTED' ? 'bg-red-100 text-red-700' : m.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {m.status}
                  </span>
                </div>
              </Popup>
            </Marker>
          ))}
          <LocationMarker position={userPos} />
        </MapContainer>

        {/* Floating Legend Overlay at Bottom Left */}
        <div className="absolute bottom-3 left-3 z-10 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg shadow border border-gray-200/80 flex items-center gap-3 text-[11px] font-semibold text-gray-700">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span> Reported
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span> In Progress
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Resolved
          </span>
        </div>
      </div>

      {/* Action Button: Detect My Nearby Location */}
      <button
        onClick={handleDetectLocation}
        disabled={locating}
        className="w-full py-3 px-4 rounded-xl bg-blue-50 hover:bg-blue-100/80 text-[var(--gov-blue)] font-semibold text-sm border border-blue-200 transition-all flex items-center justify-center gap-2 shadow-xs active:scale-[0.99]"
      >
        <Crosshair size={18} className={locating ? 'animate-spin' : ''} />
        <span>{locating ? 'Detecting Location...' : 'Detect My Nearby Location'}</span>
      </button>
    </div>
  );
}
