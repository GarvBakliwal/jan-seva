"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix missing default Leaflet marker icons in Next.js SSR environments
const customIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

interface RecenterMapProps {
    lat: number;
    lng: number;
}

// Recenter component to re-focus the view on external state update
function RecenterMap({ lat, lng }: RecenterMapProps): null {
    const map = useMap();
    useEffect(() => {
        map.setView([lat, lng], map.getZoom());
    }, [lat, lng, map]);
    return null;
}

export interface DraggableMapProps {
    latitude: number;
    longitude: number;
    onLocationChange: (lat: number, lng: number) => void;
}

export default function DraggableMap({
    latitude,
    longitude,
    onLocationChange,
}: DraggableMapProps): React.JSX.Element {
    const markerRef = useRef<L.Marker | null>(null);

    const eventHandlers = useMemo(
        () => ({
            dragend(): void {
                const marker = markerRef.current;
                if (marker !== null) {
                    const { lat, lng } = marker.getLatLng();
                    onLocationChange(lat, lng);
                }
            },
        }),
        [onLocationChange]
    );

    return (
        <MapContainer
            center={[latitude, longitude]}
            zoom={16}
            scrollWheelZoom={false}
            className="w-full h-full z-0"
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <RecenterMap lat={latitude} lng={longitude} />
            <Marker
                draggable={true}
                eventHandlers={eventHandlers}
                position={[latitude, longitude]}
                ref={markerRef}
                icon={customIcon}
            />
        </MapContainer>
    );
}