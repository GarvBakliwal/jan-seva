"use client";

import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet marker icon paths in Next.js
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

interface ComplaintViewMapProps {
  latitude: number;
  longitude: number;
  address?: string | null;
}

export default function ComplaintViewMap({
  latitude,
  longitude,
  address,
}: ComplaintViewMapProps): React.JSX.Element {
  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={16}
      scrollWheelZoom={false}
      dragging={true}
      className="w-full h-full z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[latitude, longitude]} icon={customIcon}>
        {address && (
          <Popup>
            <div className="text-xs font-sans max-w-[200px]">
              <strong>Issue Location:</strong>
              <p className="m-0 mt-1 text-gray-600">{address}</p>
            </div>
          </Popup>
        )}
      </Marker>
    </MapContainer>
  );
}