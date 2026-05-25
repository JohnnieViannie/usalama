import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

/** Default view (Nairobi) when no point chosen yet. */
const DEFAULT_CENTER: [number, number] = [-1.2921, 36.8219];
const DEFAULT_ZOOM = 15;

// Bundlers break Leaflet’s default image paths; set explicitly.
const DefaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

function MapClickPlacer({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function SyncMapView({ center, hasMarker }: { center: [number, number]; hasMarker: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (hasMarker) {
      map.setView(center, Math.max(map.getZoom(), 16), { animate: true });
    }
  }, [map, hasMarker, center[0], center[1]]);
  return null;
}

type Props = {
  latitude: string;
  longitude: string;
  onPick: (lat: number, lng: number) => void;
  className?: string;
};

/**
 * OpenStreetMap: click to set where the physical QR is installed (same coords the app verifies on scan).
 */
export function CheckpointMapPicker({ latitude, longitude, onPick, className }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const parsed = useMemo(() => {
    const lat = Number(latitude);
    const lng = Number(longitude);
    if (Number.isNaN(lat) || Number.isNaN(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
      return { center: DEFAULT_CENTER, marker: null as [number, number] | null };
    }
    return { center: [lat, lng] as [number, number], marker: [lat, lng] as [number, number] };
  }, [latitude, longitude]);

  if (!mounted) {
    return (
      <div
        className={`flex h-[min(40vh,320px)] w-full min-h-[200px] items-center justify-center rounded-md border border-dashed bg-muted/40 text-sm text-muted-foreground ${className ?? ""}`}
      >
        Loading map…
      </div>
    );
  }

  return (
    <div className={`overflow-hidden rounded-md border ${className ?? ""}`}>
      <MapContainer
        center={parsed.center}
        zoom={DEFAULT_ZOOM}
        className="h-[min(40vh,320px)] w-full min-h-[200px] z-0"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <SyncMapView center={parsed.center} hasMarker={parsed.marker !== null} />
        <MapClickPlacer
          onPick={(lat, lng) => {
            onPick(
              Math.round(lat * 1e6) / 1e6,
              Math.round(lng * 1e6) / 1e6,
            );
          }}
        />
        {parsed.marker && <Marker position={parsed.marker} />}
      </MapContainer>
    </div>
  );
}
