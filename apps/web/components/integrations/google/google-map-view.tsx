'use client';

import { useEffect, useRef } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { MapPin } from 'lucide-react';

export interface MapMarker {
  lat: number;
  lng: number;
  title: string;
  type: 'ACTIVITY' | 'RESTAURANT' | 'HOTEL' | 'TRANSPORT' | 'OTHER';
}

interface GoogleMapViewProps {
  markers: MapMarker[];
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
  /** When provided with no markers, geocodes this string to center the map */
  defaultCenter?: string;
}

const TYPE_COLOR: Record<string, string> = {
  ACTIVITY: '#10B981',
  RESTAURANT: '#F59E0B',
  HOTEL: '#3B82F6',
  TRANSPORT: '#8B5CF6',
  OTHER: '#6B7280',
};

const DARK_MAP_STYLES = [
  { elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a2e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2d2d44' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0f3460' }] },
];

export function GoogleMapView({
  markers,
  center,
  zoom = 13,
  height = '300px',
  defaultCenter,
}: GoogleMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey || !mapRef.current) return;
    if (markers.length === 0 && !center && !defaultCenter) return;

    setOptions({ key: apiKey, v: 'weekly' });

    let cancelled = false;

    async function initMap() {
      const { Map } = await importLibrary('maps') as google.maps.MapsLibrary;
      const { AdvancedMarkerElement } = await importLibrary('marker') as google.maps.MarkerLibrary;

      if (cancelled || !mapRef.current) return;

      let mapCenter = center ?? (markers.length > 0 ? { lat: markers[0].lat, lng: markers[0].lng } : null);

      // Geocode defaultCenter string if no explicit center
      if (!mapCenter && defaultCenter) {
        const { Geocoder } = await importLibrary('geocoding') as google.maps.GeocodingLibrary;
        const geocoder = new Geocoder();
        try {
          const result = await geocoder.geocode({ address: defaultCenter });
          if (result.results[0]) {
            const loc = result.results[0].geometry.location;
            mapCenter = { lat: loc.lat(), lng: loc.lng() };
          }
        } catch {}
      }

      if (!mapCenter) mapCenter = { lat: 0, lng: 0 };

      const map = new Map(mapRef.current!, {
        center: mapCenter,
        zoom: markers.length === 0 ? 11 : zoom,
        styles: DARK_MAP_STYLES,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        mapId: 'trpy-map',
      });

      for (const marker of markers) {
        const color = TYPE_COLOR[marker.type] ?? TYPE_COLOR.OTHER;
        const pin = new AdvancedMarkerElement({
          map,
          position: { lat: marker.lat, lng: marker.lng },
          title: marker.title,
          content: buildPinContent(color),
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `<div style="font-family:sans-serif;padding:4px"><strong style="font-size:13px">${marker.title}</strong><p style="font-size:11px;color:#666;margin:2px 0 0">${marker.type.toLowerCase()}</p></div>`,
        });

        pin.addListener('click', () => infoWindow.open(map, pin));
      }

      if (markers.length > 1) {
        const bounds = new google.maps.LatLngBounds();
        markers.forEach((m) => bounds.extend({ lat: m.lat, lng: m.lng }));
        map.fitBounds(bounds);
      }
    }

    initMap().catch(console.error);
    return () => { cancelled = true; };
  }, [markers, center, zoom, defaultCenter]);

  if (markers.length === 0 && !center && !defaultCenter) {
    return (
      <div
        style={{ height }}
        className="rounded-2xl bg-muted flex flex-col items-center justify-center gap-2 text-muted-foreground"
      >
        <MapPin className="w-8 h-8 opacity-40" />
        <span className="text-sm">Sem coordenadas disponíveis</span>
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      style={{ height }}
      className="w-full rounded-2xl overflow-hidden border border-border"
    />
  );
}

function buildPinContent(color: string): HTMLElement {
  const div = document.createElement('div');
  div.style.cssText = `
    width: 28px; height: 28px; border-radius: 50%;
    background: ${color}; border: 2px solid white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.4);
  `;
  return div;
}
