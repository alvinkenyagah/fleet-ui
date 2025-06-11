import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Users, Car, Clock, Activity } from 'lucide-react';

export default function LiveVehicleTracking() {
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  // Nairobi area coordinates for realistic movement
  const nairobiBounds = {
    north: -1.1636,
    south: -1.4442,
    east: 37.0729,
    west: 36.6509
  };

  // Simulate realistic vehicle positions around Nairobi
  const generateRealisticPosition = () => {
    const lat = nairobiBounds.south + Math.random() * (nairobiBounds.north - nairobiBounds.south);
    const lng = nairobiBounds.west + Math.random() * (nairobiBounds.east - nairobiBounds.west);
    return { lat, lng };
  };

  // Generate random speed and direction for vehicles
  const generateMovementData = () => ({
    speed: Math.floor(Math.random() * 60) + 10, // 10-70 km/h
    direction: Math.floor(Math.random() * 360), // 0-360 degrees
    deltaLat: (Math.random() - 0.5) * 0.001, // Small movement
    deltaLng: (Math.random() - 0.5) * 0.001
  });

  // Fetch real data from your API
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Get auth token from localStorage
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch drivers and vehicles
      const [driversResponse, vehiclesResponse] = await Promise.all([
        fetch('/api/drivers', { headers }),
        fetch('/api/vehicles', { headers })
      ]);

      if (driversResponse.ok && vehiclesResponse.ok) {
        const driversData = await driversResponse.json();
        const vehiclesData = await vehiclesResponse.json();
        
        setDrivers(driversData);
        
        // Enhance vehicles with tracking data
        const enhancedVehicles = vehiclesData.map(vehicle => ({
          ...vehicle,
          position: generateRealisticPosition(),
          movement: generateMovementData(),
          status: Math.random() > 0.3 ? 'active' : 'idle',
          lastUpdate: new Date()
        }));
        
        setVehicles(enhancedVehicles);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      // Fallback to demo data if API fails
      setDrivers([
        { _id: '1', name: 'John Kamau', email: 'john@example.com' },
        { _id: '2', name: 'Mary Wanjiku', email: 'mary@example.com' },
        { _id: '3', name: 'Peter Ochieng', email: 'peter@example.com' }
      ]);
      setVehicles([
        {
          _id: '1',
          plateNumber: 'KCA 123A',
          make: 'Toyota',
          model: 'Hiace',
          assignedDriver: '1',
          position: { lat: -1.2921, lng: 36.8219 },
          movement: generateMovementData(),
          status: 'active',
          lastUpdate: new Date()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Initialize map
  useEffect(() => {
    const initMap = () => {
      if (!window.L) {
        // Load Leaflet CSS and JS
        const cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
        document.head.appendChild(cssLink);

        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js';
        script.onload = () => {
          setTimeout(initMap, 100);
        };
        document.head.appendChild(script);
        return;
      }

      if (mapRef.current && !mapRef.current._leaflet_id) {
        const map = window.L.map(mapRef.current).setView([-1.2921, 36.8219], 12);
        
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        mapRef.current._leaflet_map = map;
      }
    };

    initMap();
    fetchData();
  }, []);

  // Update vehicle positions
  useEffect(() => {
    if (!Array.isArray(vehicles) || vehicles.length === 0) return;

    const interval = setInterval(() => {
      setVehicles(prevVehicles => 
        prevVehicles.map(vehicle => ({
          ...vehicle,
          position: {
            lat: vehicle.position.lat + vehicle.movement.deltaLat,
            lng: vehicle.position.lng + vehicle.movement.deltaLng
          },
          movement: {
            ...vehicle.movement,
            deltaLat: (Math.random() - 0.5) * 0.001,
            deltaLng: (Math.random() - 0.5) * 0.001,
            speed: Math.max(5, vehicle.movement.speed + (Math.random() - 0.5) * 10)
          },
          lastUpdate: new Date()
        }))
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [vehicles.length]);

  // Update map markers
  useEffect(() => {
    if (!mapRef.current?._leaflet_map || !Array.isArray(vehicles) || vehicles.length === 0) return;

    const map = mapRef.current._leaflet_map;
    
    // Clear existing markers
    markersRef.current.forEach(marker => map.removeLayer(marker));
    markersRef.current = [];

    // Add new markers
    vehicles.forEach(vehicle => {
      const driver = Array.isArray(drivers) ? drivers.find(d => d._id === vehicle.assignedDriver) : null;
      
      const marker = window.L.marker([vehicle.position.lat, vehicle.position.lng])
        .bindPopup(`
          <div style="font-family: system-ui, sans-serif;">
            <h3 style="margin: 0 0 8px 0; color: #1f2937;">${vehicle.plateNumber}</h3>
            <p style="margin: 4px 0; color: #6b7280;"><strong>Driver:</strong> ${driver?.name || 'Unassigned'}</p>
            <p style="margin: 4px 0; color: #6b7280;"><strong>Vehicle:</strong> ${vehicle.make} ${vehicle.model}</p>
            <p style="margin: 4px 0; color: #6b7280;"><strong>Speed:</strong> ${Math.floor(vehicle.movement.speed)} km/h</p>
            <p style="margin: 4px 0; color: #6b7280;"><strong>Status:</strong> 
              <span style="color: ${vehicle.status === 'active' ? '#10b981' : '#f59e0b'};">
                ${vehicle.status}
              </span>
            </p>
          </div>
        `)
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [vehicles, drivers]);

  const getDriverName = (driverId) => {
    if (!Array.isArray(drivers) || !driverId) return 'Unassigned';
    const driver = drivers.find(d => d._id === driverId);
    return driver?.name || 'Unassigned';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'idle': return 'bg-yellow-100 text-yellow-800';
      case 'maintenance': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-blue-400 h-10 w-10"></div>
          <div className="space-y-2">
            <div className="h-4 bg-blue-400 rounded w-24"></div>
            <div className="h-4 bg-blue-400 rounded w-16"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Live Vehicle Tracking</h1>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Car className="h-4 w-4" />
                <span>{vehicles.length} Vehicles</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{drivers.length} Drivers</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Map */}
        <div className="flex-1 relative">
          <div 
            ref={mapRef} 
            className="absolute inset-0 z-0"
            style={{ height: '100%', width: '100%' }}
          />
        </div>

        {/* Vehicle List Sidebar */}
        <div className="w-80 bg-white shadow-lg overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Active Vehicles</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {Array.isArray(vehicles) && vehicles.map((vehicle) => (
              <div
                key={vehicle._id}
                className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                  selectedVehicle?._id === vehicle._id ? 'bg-blue-50 border-blue-200' : ''
                }`}
                onClick={() => setSelectedVehicle(vehicle)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900">{vehicle.plateNumber}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                        {vehicle.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{vehicle.make} {vehicle.model}</p>
                    <p className="text-sm text-gray-500">Driver: {getDriverName(vehicle.assignedDriver)}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span>{vehicle.position?.lat?.toFixed(4) || '0.0000'}, {vehicle.position?.lng?.toFixed(4) || '0.0000'}</span>
                      </div>
                      <div>
                        <span className="font-medium">{Math.floor(vehicle.movement?.speed || 0)} km/h</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full ${
                      vehicle.status === 'active' ? 'bg-green-400 animate-pulse' : 'bg-gray-300'
                    }`}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span>Active: {Array.isArray(vehicles) ? vehicles.filter(v => v.status === 'active').length : 0}</span>
            <span>Idle: {Array.isArray(vehicles) ? vehicles.filter(v => v.status === 'idle').length : 0}</span>
            <span>Total Distance: {Math.floor(Math.random() * 500 + 100)} km</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Live Tracking Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}