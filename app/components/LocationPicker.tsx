'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { TextInput, Stack, Text, Box } from '@mantine/core';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet marker icons in Next.js
const icon = L.icon({ iconUrl: "/images/marker-icon.png", shadowUrl: "/images/marker-shadow.png", iconAnchor: [12, 41] });

interface LocationValue {
  address: string;
  lat: number | null;
  lng: number | null;
}

interface LocationPickerProps {
  value: LocationValue;
  onChange: (value: LocationValue) => void;
}

function LocationMarker({ position, setPosition }: { position: L.LatLng | null, setPosition: (pos: L.LatLng) => void }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={icon}></Marker>
  );
}

export function LocationPicker({ value, onChange }: LocationPickerProps) {
  // Default view: Balneário Camboriú center if no data
  const defaultCenter = { lat: -26.9925, lng: -48.6353 };
  const [markerPosition, setMarkerPosition] = useState<L.LatLng | null>(
  // Explicitly check that both are not null before creating LatLng object
  (value.lat !== null && value.lng !== null) ? new L.LatLng(value.lat, value.lng) : null
);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  const handleMapClick = (pos: L.LatLng) => {
    setMarkerPosition(pos);
    // In a real app, you would use a Geocoding API here to get the address from lat/lng
    // For now, we'll just update coordinates and keep the currently typed address
    onChange({ ...value, lat: pos.lat, lng: pos.lng });
  };

  const handleAddressChange = (addr: string) => {
     onChange({ ...value, address: addr });
  }

  if (!isMounted) return <TextInput label="Endereço" placeholder="Carregando mapa..." disabled />;

  return (
    <Stack>
      <TextInput 
        label="Endereço Descritivo" 
        placeholder="Ex: Rua Jacob Einsenhuth, 546"
        value={value.address} 
        onChange={(e) => handleAddressChange(e.currentTarget.value)} 
        required
      />
      <Text size="sm" fw={500} mt="sm">Selecione a localização exata no mapa:</Text>
      <Box h={300} style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--mantine-color-gray-3)' }}>
          <MapContainer 
            center={markerPosition || defaultCenter} 
            zoom={13} 
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker position={markerPosition} setPosition={handleMapClick} />
          </MapContainer>
      </Box>
      {value.lat && <Text size="xs" c="dimmed">Coord: {value.lat.toFixed(4)}, {value.lng.toFixed(4)}</Text>}
    </Stack>
  );
}