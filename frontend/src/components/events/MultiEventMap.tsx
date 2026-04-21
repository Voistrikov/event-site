import { useEffect, useRef } from 'react';
import type { Event } from '../../types/event.types';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';

interface MultiEventMapProps {
  events: Event[];
  onViewDetails?: (event: Event) => void;
  mapLocation?: {lat: number, lng: number} | null;
  onMapClick?: (lat: number, lng: number) => void;
}

export default function MultiEventMap({ events, onViewDetails, mapLocation, onMapClick }: MultiEventMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const targetMarkerRef = useRef<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!mapRef.current) return;

    let map = mapInstanceRef.current;

    import('leaflet').then((L) => {
      // Initialize map once
      if (!map) {
        // Find center of all events, or default to Athens if no events have coords
        const validCoords = events.filter((e) => e.latitude && e.longitude);
        let center: [number, number] = [37.9838, 23.7275]; // Athens default
        
        if (validCoords.length > 0) {
          const latSum = validCoords.reduce((sum, e) => sum + (e.latitude || 0), 0);
          const lngSum = validCoords.reduce((sum, e) => sum + (e.longitude || 0), 0);
          center = [latSum / validCoords.length, lngSum / validCoords.length];
        }

        map = L.map(mapRef.current!).setView(center, 12);
        mapInstanceRef.current = map;

        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; OpenStreetMap &copy; CARTO',
          maxZoom: 19,
        }).addTo(map);

        // Map Click Listener
        map.on('click', (e: any) => {
          if (onMapClick) onMapClick(e.latlng.lat, e.latlng.lng);
        });
      }

      // Handle Target Marker (Map Location)
      if (targetMarkerRef.current) {
        targetMarkerRef.current.remove();
        targetMarkerRef.current = null;
      }

      if (mapLocation) {
        const targetIcon = L.divIcon({
          className: 'custom-target-marker',
          html: `<div style="width: 20px; height: 20px; background: #34aadc; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });
        targetMarkerRef.current = L.marker([mapLocation.lat, mapLocation.lng], { icon: targetIcon, zIndexOffset: 1000 }).addTo(map);
      }

      // Clear old markers
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      // Add new markers
      const validEvents = events.filter((e) => e.latitude && e.longitude);
      
      if (validEvents.length > 0 && map) {
        // Bounds computation to fit all markers
        const bounds = L.latLngBounds(
          validEvents.map(e => [e.latitude!, e.longitude!])
        );

        validEvents.forEach((event) => {
          // Custom beautiful marker
          const customIcon = L.divIcon({
            className: 'custom-map-marker',
            html: `<div class="marker-pin"><div class="marker-dot"></div></div>`,
            iconSize: [30, 42],
            iconAnchor: [15, 42],
            popupAnchor: [0, -35]
          });

          const price = event.ticketTypes?.[0]?.price ? `€${event.ticketTypes[0].price}` : 'Free';
          const defaultImage = 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80';
          const imageUrl = event.photos && event.photos.length > 0 
            ? `http://localhost:3000/uploads/${event.photos[0].filename}` 
            : defaultImage;

          const popupContent = `
            <div class="map-popup-card" id="popup-${event.id}">
              <img src="${imageUrl}" alt="${event.title}" />
              <div class="map-popup-content">
                <h4>${event.title}</h4>
                <p class="map-popup-price"><span class="price-val">${price}</span> / night</p>
                <div class="map-popup-actions">
                  <button class="map-popup-btn" data-id="${event.id}">View Details</button>
                </div>
              </div>
            </div>
          `;

          const marker = L.marker([event.latitude!, event.longitude!], { icon: customIcon })
            .addTo(map)
            .bindPopup(popupContent, {
               maxWidth: 250,
               minWidth: 200,
               className: 'custom-leaflet-popup'
            });

           marker.on('popupopen', () => {
             const btn = document.querySelector(`.map-popup-btn[data-id="${event.id}"]`);
             if (btn) {
               btn.addEventListener('click', () => {
                 if (onViewDetails) onViewDetails(event);
                 else navigate(`/events/${event.id}`);
                 marker.closePopup();
               });
             }
          });

          markersRef.current.push(marker);
        });

        // Fit map bounds to show all markers smoothly
        if (validEvents.length > 0) {
           map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        }
      }
    });

    return () => {
      // Do not destroy the map on unmount if it's the split screen unmounting, 
      // but if we are really unmounting, we should clean up
      // if (mapInstanceRef.current) {
      //   mapInstanceRef.current.remove();
      //   mapInstanceRef.current = null;
      // }
    };
  }, [events, navigate]);

  return <div ref={mapRef} className="multi-event-map" />;
}
