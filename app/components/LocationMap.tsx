'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Box, Text, Paper } from '@mantine/core';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useState, useEffect } from 'react';

// Fix for default Leaflet marker icons in Next.js
const icon = L.icon({ 
  iconUrl: "/images/marker-icon.png", 
  shadowUrl: "/images/marker-shadow.png", 
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});

interface LocationMapProps {
  address: string;
  lat: number | null;
  lng: number | null;
}

export function LocationMap({ address, lat, lng }: LocationMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  if (!isMounted) return null;

  // If no coordinates, we don't show the map, just the address text in a nice box
  if (lat === null || lng === null) {
    return null;
  }

  const position = new L.LatLng(lat, lng);

  return (
    <Paper withBorder shadow="sm" radius="md" my="xl">
        <Box h={300} w="100%">
            <MapContainer 
                center={position} 
                zoom={15} 
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false} // Disable scroll zoom for better page scrolling UX
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={position} icon={icon}>
                    <Popup>{address}</Popup>
                </Marker>
            </MapContainer>
        </Box>
        <Box p="md" bg="gray.0">
            <Text size="sm" fw={500} c="dimmed" ta="center">
                {address}
            </Text>
        </Box>
    </Paper>
  );
}