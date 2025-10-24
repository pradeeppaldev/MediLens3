import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Loader2, MapPin, Phone, Clock, Star, Navigation, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import 'leaflet/dist/leaflet.css';

const PharmacyMap = ({ userLocation, searchQuery, onLocationUpdate }) => {
  const [places, setPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentLocation, setCurrentLocation] = useState(userLocation);
  const [mapCenter, setMapCenter] = useState([19.0760, 72.8777]); // Default to Mumbai
  const [mapZoom, setMapZoom] = useState(13);

  // Generate mock data based on user location with Mumbai hospitals and pharmacies
  const generateMockPlaces = (userLat, userLng) => {
    const baseLat = userLat || 19.0760; // Default to Mumbai if no user location
    const baseLng = userLng || 72.8777;

    const mumbaiPlaces = [
      {
        id: 1,
        name: "Apollo Pharmacy - Bandra",
        address: "Shop No. 5, Linking Road, Bandra West, Mumbai",
        phone: "(022) 2642-5678",
        type: "pharmacy",
        rating: 4.3,
        distance: `${(Math.random() * 2 + 0.1).toFixed(1)} km`,
        hours: "Open until 11 PM",
        coordinates: {
          lat: baseLat + (Math.random() - 0.5) * 0.02,
          lng: baseLng + (Math.random() - 0.5) * 0.02
        }
      },
      {
        id: 2,
        name: "Lilavati Hospital",
        address: "A-791, Bandra Reclamation, Bandra West, Mumbai",
        phone: "(022) 2675-1000",
        type: "hospital",
        rating: 4.5,
        distance: `${(Math.random() * 3 + 0.5).toFixed(1)} km`,
        hours: "24/7 Emergency",
        coordinates: {
          lat: baseLat + (Math.random() - 0.5) * 0.03,
          lng: baseLng + (Math.random() - 0.5) * 0.03
        }
      },
      {
        id: 3,
        name: "MedPlus Pharmacy - Andheri",
        address: "Shop No. 12, SV Road, Andheri West, Mumbai",
        phone: "(022) 2678-3456",
        type: "pharmacy",
        rating: 4.1,
        distance: `${(Math.random() * 2 + 0.1).toFixed(1)} km`,
        hours: "Open until 10 PM",
        coordinates: {
          lat: baseLat + (Math.random() - 0.5) * 0.02,
          lng: baseLng + (Math.random() - 0.5) * 0.02
        }
      },
      {
        id: 4,
        name: "Kokilaben Dhirubhai Ambani Hospital",
        address: "Rao Saheb Acharya Marg, Four Bungalows, Andheri West, Mumbai",
        phone: "(022) 3091-9191",
        type: "hospital",
        rating: 4.7,
        distance: `${(Math.random() * 3 + 0.5).toFixed(1)} km`,
        hours: "24/7 Emergency",
        coordinates: {
          lat: baseLat + (Math.random() - 0.5) * 0.03,
          lng: baseLng + (Math.random() - 0.5) * 0.03
        }
      },
      {
        id: 5,
        name: "Wellness Forever Pharmacy - Powai",
        address: "Hiranandani Gardens, Powai, Mumbai",
        phone: "(022) 2570-1234",
        type: "pharmacy",
        rating: 4.4,
        distance: `${(Math.random() * 2 + 0.1).toFixed(1)} km`,
        hours: "Open until 9 PM",
        coordinates: {
          lat: baseLat + (Math.random() - 0.5) * 0.02,
          lng: baseLng + (Math.random() - 0.5) * 0.02
        }
      },
      {
        id: 6,
        name: "Jaslok Hospital",
        address: "15, Dr. G. Deshmukh Marg, Pedder Road, Mumbai",
        phone: "(022) 2353-3333",
        type: "hospital",
        rating: 4.6,
        distance: `${(Math.random() * 3 + 0.5).toFixed(1)} km`,
        hours: "24/7 Emergency",
        coordinates: {
          lat: baseLat + (Math.random() - 0.5) * 0.03,
          lng: baseLng + (Math.random() - 0.5) * 0.03
        }
      }
    ];

    return mumbaiPlaces;
  };

  // Initialize with mock data and set map center
  useEffect(() => {
    const mockPlaces = generateMockPlaces(
      userLocation?.lat,
      userLocation?.lng
    );
    setPlaces(mockPlaces);
    if (userLocation) {
      setCurrentLocation(userLocation);
      setMapCenter([userLocation.lat, userLocation.lng]);
      setMapZoom(15);
    }
  }, [userLocation]);

  // Search functionality
  const handleSearch = () => {
    const allPlaces = generateMockPlaces(
      currentLocation?.lat,
      currentLocation?.lng
    );

    if (!searchTerm.trim()) {
      setPlaces(allPlaces);
      return;
    }

    setIsLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      const filtered = allPlaces.filter(place =>
        place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        place.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        place.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setPlaces(filtered);
      setIsLoading(false);
    }, 500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Get directions (opens in default maps app)
  const getDirections = (place) => {
    if (!currentLocation) {
      alert('Please enable location services to get directions.');
      return;
    }

    const url = `https://www.google.com/maps/dir/${currentLocation.lat},${currentLocation.lng}/${place.coordinates.lat},${place.coordinates.lng}`;
    window.open(url, '_blank');
  };

  // Custom marker icons
  const createCustomIcon = (type) => {
    return L.divIcon({
      html: `
        <div style="
          background-color: ${type === 'pharmacy' ? '#10B981' : '#EF4444'};
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 12px;
        ">
          ${type === 'pharmacy' ? 'P' : 'H'}
        </div>
      `,
      className: 'custom-marker',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  };

  // Component to update map center when location changes
  const MapController = () => {
    const map = useMap();

    useEffect(() => {
      map.setView(mapCenter, mapZoom);
    }, [map, mapCenter, mapZoom]);

    return null;
  };

  // Update places when search term changes (real-time search)
  useEffect(() => {
    const allPlaces = generateMockPlaces(
      currentLocation?.lat,
      currentLocation?.lng
    );

    if (!searchTerm.trim()) {
      setPlaces(allPlaces);
      return;
    }

    const filtered = allPlaces.filter(place =>
      place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      place.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      place.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setPlaces(filtered);
  }, [searchTerm, currentLocation]);



  if (error) {
    return (
      <div className="h-96 flex items-center justify-center bg-muted rounded-lg">
        <div className="text-center">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <Input
          placeholder="Search pharmacies, hospitals..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1"
        />
        <Button onClick={handleSearch} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Map Container */}
      <div className="h-96 w-full rounded-lg border overflow-hidden">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapController />

          {/* User location marker */}
          {currentLocation && (
            <Marker
              position={[currentLocation.lat, currentLocation.lng]}
              icon={L.divIcon({
                html: `
                  <div style="
                    background-color: #4285F4;
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    border: 3px solid white;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                  "></div>
                `,
                className: 'user-location-marker',
                iconSize: [16, 16],
                iconAnchor: [8, 8],
              })}
            >
              <Popup>
                <div className="text-center">
                  <strong>Your Location</strong>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Place markers */}
          {places.map((place) => (
            <Marker
              key={place.id}
              position={[place.coordinates.lat, place.coordinates.lng]}
              icon={createCustomIcon(place.type)}
            >
              <Popup>
                <div className="p-2 max-w-xs">
                  <h3 className="font-semibold text-sm mb-1">{place.name}</h3>
                  <p className="text-xs text-gray-600 mb-2">{place.address}</p>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      <span>{place.phone}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{place.hours}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span>{place.rating}</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => getDirections(place)}
                    className="w-full mt-2 text-xs"
                  >
                    <Navigation className="h-3 w-3 mr-1" />
                    Get Directions
                  </Button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Results List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Searching...</span>
        </div>
      ) : places.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {places.map((place) => (
            <Card key={place.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-sm line-clamp-2">{place.name}</h3>
                  <Badge variant={place.type === 'pharmacy' ? 'default' : 'secondary'} className="text-xs">
                    {place.type === 'pharmacy' ? 'Pharmacy' : 'Hospital'}
                  </Badge>
                </div>

                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                  {place.address}
                </p>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    <span>{place.phone}</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{place.hours}</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{place.distance}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs ml-1">{place.rating}</span>
                    </div>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => getDirections(place)}
                  className="w-full mt-3 text-xs"
                >
                  <Navigation className="h-3 w-3 mr-1" />
                  Get Directions
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No places found. Try adjusting your search.</p>
        </div>
      )}
    </div>
  );
};

export default PharmacyMap;
