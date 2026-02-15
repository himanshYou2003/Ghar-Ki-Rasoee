import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, X, Check } from 'lucide-react';
import axios from 'axios';

// Fix for default marker icon in Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface LocationPickerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (location: { address: string; lat: number; lng: number }) => void;
}

const LocationMarker: React.FC<{ setPosition: (pos: L.LatLng) => void, position: L.LatLng | null }> = ({ setPosition, position }) => {
    const map = useMap();
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
            map.flyTo(e.latlng, 18); // Zoom in when user picks a spot
        },
    });

    return position === null ? null : (
        <Marker position={position}></Marker>
    );
};

// Component to handle map centering
const MapController: React.FC<{ center: [number, number], zoom: number }> = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
};

const LocationPicker: React.FC<LocationPickerProps> = ({ isOpen, onClose, onSelect }) => {
    const [position, setPosition] = useState<L.LatLng | null>(null);
    const [loading, setLoading] = useState(false);
    const [addressText, setAddressText] = useState('');
    const [center, setCenter] = useState<[number, number]>([43.6532, -79.3832]); // Toronto, Canada
    const [zoom, setZoom] = useState(5);

    // Reset state when opening
    useEffect(() => {
        if (isOpen) {
            // Optional: Try to get current location automatically on open
            // handleUseCurrentLocation(); 
        }
    }, [isOpen]);

    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                const newPos = new L.LatLng(latitude, longitude);
                setPosition(newPos);
                setCenter([latitude, longitude]);
                setZoom(18); // Zoom in closer for better precision
                fetchAddress(latitude, longitude);
                setLoading(false);
            },
            (error) => {
                console.error("Error getting location:", error);
                setLoading(false);
                alert('Unable to retrieve your location. Please check browser permissions.');
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    const fetchAddress = async (lat: number, lng: number) => {
        try {
            const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
            if (response.data && response.data.display_name) {
                setAddressText(response.data.display_name);
            }
        } catch (error) {
            console.error("Error reverse geocoding:", error);
        }
    };

    useEffect(() => {
        if (position) {
            fetchAddress(position.lat, position.lng);
        }
    }, [position]);

    const handleConfirm = () => {
        if (position && addressText) {
            onSelect({
                address: addressText,
                lat: position.lat,
                lng: position.lng
            });
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col h-[80vh]">
                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center bg-primary text-white">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <MapPin size={20} /> Select Delivery Location
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition">
                        <X size={24} />
                    </button>
                </div>

                {/* Toolbar */}
                <div className="p-3 bg-gray-50 border-b flex justify-between items-center">
                    <span className="text-sm text-gray-500">Tap map to drag marker</span>
                    <button 
                        type="button"
                        onClick={handleUseCurrentLocation}
                        disabled={loading}
                        className="flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors disabled:opacity-50"
                    >
                        <Navigation size={14} />
                        {loading ? 'Locating...' : 'Use Current Location'}
                    </button>
                </div>

                {/* Map Area */}
                <div className="flex-1 relative z-0">
                    <MapContainer 
                        center={center} 
                        zoom={zoom} 
                        style={{ height: '100%', width: '100%' }}
                        scrollWheelZoom={true}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <MapController center={center} zoom={zoom} />
                        <LocationMarker setPosition={setPosition} position={position} />
                    </MapContainer>
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-white flex flex-col gap-3">
                    <div className="bg-gray-50 p-3 rounded border border-gray-200 text-sm text-gray-600 flex gap-2 items-start">
                        <span className="font-medium text-gray-900 shrink-0">Selected:</span>
                        <span className="break-words line-clamp-2">{addressText || 'No location selected'}</span>
                    </div>

                    <button 
                        onClick={handleConfirm}
                        disabled={!position}
                        className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition flex justify-center items-center gap-2"
                    >
                        <Check size={18} /> Confirm Location
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LocationPicker;
