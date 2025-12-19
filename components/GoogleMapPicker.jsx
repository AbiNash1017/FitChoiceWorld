"use client";
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { useCallback, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";

const containerStyle = {
    width: '100%',
    height: '400px'
};

const defaultCenter = {
    lat: 12.9716, // Bengaluru default
    lng: 77.5946
};

export default function GoogleMapPicker({ onLocationSelect, initialLocation }) {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    });

    const [map, setMap] = useState(null);
    const [selectedLocation, setSelectedLocation] = useState(initialLocation || defaultCenter);
    const [currentLocation, setCurrentLocation] = useState(null);

    useEffect(() => {
        if (initialLocation && initialLocation.lat && initialLocation.lng) {
            setSelectedLocation(initialLocation);
        } else if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    setCurrentLocation(pos);
                    if (!initialLocation) setSelectedLocation(pos);
                },
                () => {
                    console.log("Error fetching location");
                }
            );
        }
    }, [initialLocation]);

    const onLoad = useCallback(function callback(map) {
        setMap(map);
    }, []);

    const onUnmount = useCallback(function callback(map) {
        setMap(null);
    }, []);

    const handleMapClick = (e) => {
        const newLocation = {
            lat: e.latLng.lat(),
            lng: e.latLng.lng()
        };
        setSelectedLocation(newLocation);
        onLocationSelect(newLocation);
    };

    const handleCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    setSelectedLocation(pos);
                    onLocationSelect(pos);
                    map?.panTo(pos);
                },
                (error) => {
                    // Handle geolocation errors gracefully
                    let message = "Could not get your current location.";
                    if (error.code === error.PERMISSION_DENIED) {
                        message = "Location permission denied. Please click on the map to select your location.";
                    } else if (error.code === error.POSITION_UNAVAILABLE) {
                        message = "Location information is unavailable. Please click on the map to select your location.";
                    } else if (error.code === error.TIMEOUT) {
                        message = "Location request timed out. Please try again or click on the map.";
                    }
                    alert(message);
                }
            );
        } else {
            alert("Geolocation is not supported by your browser. Please click on the map to select your location.");
        }
    };

    if (!isLoaded) return <div className="h-[400px] w-full bg-gray-100 flex items-center justify-center">Loading Map...</div>;

    return (
        <div className="space-y-4">
            <div className="relative">
                <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={selectedLocation}
                    zoom={15}
                    onLoad={onLoad}
                    onUnmount={onUnmount}
                    onClick={handleMapClick}
                >
                    {selectedLocation && (
                        <Marker position={selectedLocation} />
                    )}
                </GoogleMap>
                <Button
                    type="button"
                    onClick={handleCurrentLocation}
                    className="absolute top-2 right-2 bg-white text-black hover:bg-gray-100 shadow-md z-10"
                >
                    Use Current Location
                </Button>
            </div>
            <p className="text-sm text-gray-500 text-center">
                Tap on the map to pin your exact location.
            </p>
        </div>
    );
}
