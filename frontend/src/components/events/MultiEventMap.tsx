import { useEffect, useRef } from 'react';
import type { Event } from '../../types/event.types';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { Map as LeafletMap, Marker, LeafletMouseEvent } from 'leaflet';
import { eventTypeLabel } from '../../types/event.types';
import { formatDate } from '../../utils/dateFormat';
import { fileUrl } from '../../utils/imageUrl';

interface MultiEventMapProps {
  events: Event[];
  onViewDetails?: (event: Event) => void;
  mapLocation?: {lat: number, lng: number} | null;
  onMapClick?: (lat: number, lng: number) => void;
}

export default function MultiEventMap({ events, onViewDetails, mapLocation, onMapClick }: MultiEventMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const targetMarkerRef = useRef<Marker | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!mapRef.current) return;

    // Find center of all events, or default to Athens if no events have coords
    const validCoords = events.filter((e) => e.latitude != null && e.longitude != null);
    let center: [number, number] = [37.9838, 23.7275];
    if (validCoords.length > 0) {
      const latSum = validCoords.reduce((sum, e) => sum + (e.latitude ?? 0), 0);
      const lngSum = validCoords.reduce((sum, e) => sum + (e.longitude ?? 0), 0);
      center = [latSum / validCoords.length, lngSum / validCoords.length];
    }

    const map = L.map(mapRef.current).setView(center, 12);
    mapInstanceRef.current = map;

    const resizeTimer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Map Click Listener
    map.on('click', (e: LeafletMouseEvent) => {
      if (onMapClick) onMapClick(e.latlng.lat, e.latlng.lng);
    });

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
      
      if (validEvents.length > 0) {
        const activeMap = map;
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

          const minPrice = event.ticketTypes?.length ? Math.min(...event.ticketTypes.map((ticket) => Number(ticket.price))) : null;
          const price = minPrice == null ? 'Χωρίς εισιτήρια' : minPrice === 0 ? 'Δωρεάν' : `Από €${minPrice.toFixed(2)}`;
          const imageUrl = fileUrl(event.photos?.[0]?.filename);

          const popupContent = `
            <div class="map-popup-card" id="popup-${event.id}">
              ${imageUrl ? `<img src="${imageUrl}" alt="${event.title}" />` : '<div class="map-popup-image-empty" aria-label="Δεν υπάρχει φωτογραφία"></div>'}
              <div class="map-popup-content">
                <h4>${event.title}</h4>
                <p>${eventTypeLabel(event.eventType)}</p>
                <p>📅 ${formatDate(event.startDateTime)}</p>
                <p class="map-popup-price"><span class="price-val">${price}</span></p>
                <div class="map-popup-actions">
                  <button class="map-popup-btn" data-id="${event.id}">Προβολή Εκδήλωσης</button>
                </div>
              </div>
            </div>
          `;

          const marker = L.marker([event.latitude!, event.longitude!], { icon: customIcon })
            .addTo(activeMap)
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
           activeMap.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        }
      }

    return () => {
      clearTimeout(resizeTimer);
      map.remove();
      mapInstanceRef.current = null;
      markersRef.current = [];
      targetMarkerRef.current = null;
    };
  }, [events, navigate, mapLocation, onMapClick, onViewDetails]);

  return <div ref={mapRef} className="multi-event-map" />;
}
