import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, Search, AlertCircle, Loader2 } from 'lucide-react';
import PharmacyMap from '../components/PharmacyMap';

const PharmacyLocator = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);

  // Get user's current location
  const getCurrentLocation = () => {
    setIsLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setIsLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        setError('Unable to retrieve your location. Please check your browser settings.');
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // The map component will handle the search
      setSelectedPlace(searchQuery);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Pharmacy & Hospital Locator
          </h1>
          <p className="text-muted-foreground mt-2">
            Find nearby pharmacies and hospitals for your healthcare needs
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Location Services
        </Badge>
      </div>

      {/* Search and Location Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Location
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search for pharmacies, hospitals, or clinics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={!searchQuery.trim()}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={getCurrentLocation}
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Navigation className="h-4 w-4" />
              )}
              {isLoading ? 'Getting Location...' : 'Use My Location'}
            </Button>

            {userLocation && (
              <Badge variant="outline" className="text-xs">
                Location: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
              </Badge>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Map Component */}
      <Card>
        <CardContent className="p-0">
          <PharmacyMap
            userLocation={userLocation}
            searchQuery={selectedPlace}
            onLocationUpdate={setUserLocation}
          />
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">📍 Location Access</h4>
              <p className="text-muted-foreground">
                Allow location access to find nearby healthcare facilities automatically.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">🔍 Search Features</h4>
              <p className="text-muted-foreground">
                Search for specific pharmacies, hospitals, or use categories like "emergency" or "24-hour".
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PharmacyLocator;
