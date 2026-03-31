import { useEffect, useRef } from 'react';

interface EventMapProps {
  latitude: number;
  longitude: number;
  title?: string;
}

// Requires leaflet to be installed: npm install leaflet @types/leaflet
export default function EventMap({ latitude, longitude, title }: EventMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    import('leaflet').then((L) => {
      const map = L.map(mapRef.current!).setView([latitude, longitude], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      L.marker([latitude, longitude])
        .addTo(map)
        .bindPopup(title ?? 'Event Location')
        .openPopup();

      return () => { map.remove(); };
    });
  }, [latitude, longitude, title]);

  return <div ref={mapRef} style={{ height: '400px', width: '100%' }} />;
}
