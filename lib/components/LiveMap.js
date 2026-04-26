"use client";
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet + Next.js
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const CarIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3202/3202926.png', // Simple car icon
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

// Component to handle map center changes
function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function LiveMap({ rides, drivers }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="map-placeholder">Loading Map...</div>;

  const defaultCenter = [20.5937, 78.9629]; // Center of India

  return (
    <div className="map-wrapper glass">
      <MapContainer 
        center={defaultCenter} 
        zoom={5} 
        style={{ height: '100%', width: '100%', borderRadius: '16px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="map-tiles"
        />
        
        {/* Active Rides Markers */}
        {rides?.filter(r => r.pickupLocation?.latitude).map(ride => (
          <Marker 
            key={ride.id} 
            position={[ride.pickupLocation.latitude, ride.pickupLocation.longitude]}
            icon={DefaultIcon}
          >
            <Popup>
              <div className="popup-content">
                <strong>Ride #{ride.id.substring(0, 5)}</strong>
                <p>User: {ride.userName}</p>
                <p>Status: {ride.status}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Live Driver Markers */}
        {drivers?.filter(d => d.location?.latitude).map(driver => (
          <Marker 
            key={driver.id} 
            position={[driver.location.latitude, driver.location.longitude]}
            icon={CarIcon}
          >
            <Popup>
              <div className="popup-content">
                <strong>Driver: {driver.name}</strong>
                <p>Status: {driver.isOnline ? 'Online' : 'Offline'}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        <ChangeView center={rides?.[0]?.pickupLocation ? [rides[0].pickupLocation.latitude, rides[0].pickupLocation.longitude] : null} />
      </MapContainer>

      <style jsx global>{`
        .map-wrapper {
          height: 400px;
          border-radius: 20px;
          overflow: hidden;
          margin-bottom: 24px;
          border: 1px solid var(--border);
        }
        .map-placeholder {
          height: 400px;
          background: var(--surface);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
        }
        .leaflet-container {
          background: #1a1d26 !important;
        }
        .map-tiles {
          filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
        }
        .popup-content {
          color: #333;
        }
      `}</style>
    </div>
  );
}
