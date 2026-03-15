import { useState, useMemo, memo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon, LatLngBounds } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  AlertCircle,
  ExternalLink,
  Users,
  Shield,
  Navigation,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import usersData from "@/data/users.json";
import { useNavigate } from "react-router-dom";

// Fix for default markers in Leaflet
delete (Icon.Default.prototype as unknown as { _getIconUrl?: () => string })._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface UserData {
  id: string;
  name: string;
  status: "verified" | "pending" | "alert";
  location: { lat: number; lng: number };
  lastCheckIn: string;
  photo: string;
  country: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
}

interface Tourist {
  id: string;
  name: string;
  status: "verified" | "pending" | "alert";
  location: { lat: number; lng: number };
  lastCheckIn: string;
  photo: string;
  country: string;
  emergencyContact?: {
    name: string;
    phone: string;
  };
}

interface InteractiveMapProps {
  onViewId?: (userId: string) => void;
  className?: string;
}

const STATUS_COLORS = {
  verified: "#10b981", // green
  pending: "#f59e0b",  // yellow
  alert: "#ef4444",    // red
};

const STATUS_LABELS = {
  verified: "Verified",
  pending: "Pending Verification",
  alert: "Alert",
};

// Custom marker icons
const createCustomIcon = (status: keyof typeof STATUS_COLORS) => {
  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.5 0C5.596 0 0 5.596 0 12.5c0 2.5 0.7 4.8 2 6.8L12.5 41l10.5-21.7c1.3-2 2-4.3 2-6.8C25 5.596 19.404 0 12.5 0z" fill="${STATUS_COLORS[status]}"/>
        <circle cx="12.5" cy="12.5" r="6" fill="white"/>
        <circle cx="12.5" cy="12.5" r="3" fill="${STATUS_COLORS[status]}"/>
      </svg>
    `)}`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });
};

// Component to fit map bounds to markers
function FitBounds({ tourists }: { tourists: Tourist[] }) {
  const map = useMap();

  useMemo(() => {
    if (tourists.length > 0) {
      const bounds = new LatLngBounds(
        tourists.map(tourist => [tourist.location.lat, tourist.location.lng])
      );
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [map, tourists]);

  return null;
}

export const InteractiveMap = memo(function InteractiveMap({
  onViewId,
  className,
}: InteractiveMapProps) {
  const [selectedTourist, setSelectedTourist] = useState<Tourist | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Transform users data to tourist format
  const tourists = useMemo(() => {
    return (usersData as UserData[]).map((user) => ({
      id: user.id,
      name: user.name,
      status: user.status,
      location: user.location,
      lastCheckIn: user.lastCheckIn,
      photo: user.photo,
      country: user.country,
      emergencyContact: user.emergencyContact,
    }));
  }, []);

  const handleTouristClick = (tourist: Tourist) => {
    setSelectedTourist(tourist);
  };

  const handleViewProfile = () => {
    if (selectedTourist) {
      if (onViewId) {
        onViewId(selectedTourist.id);
      } else {
        navigate(`/my-id?user=${selectedTourist.id}`);
      }
      setSelectedTourist(null);
    }
  };

  const handleEmergencyContact = () => {
    if (selectedTourist?.emergencyContact?.phone) {
      window.open(`tel:${selectedTourist.emergencyContact.phone}`);
      toast({
        title: "Emergency Contact",
        description: `Calling ${selectedTourist.emergencyContact.name}`,
      });
    }
  };

  // Calculate center point of all tourists
  const mapCenter = useMemo(() => {
    if (tourists.length === 0) return [20.5937, 78.9629]; // Center of India

    const avgLat = tourists.reduce((sum, t) => sum + t.location.lat, 0) / tourists.length;
    const avgLng = tourists.reduce((sum, t) => sum + t.location.lng, 0) / tourists.length;

    return [avgLat, avgLng];
  }, [tourists]);

  return (
    <>
      <Card className={cn("relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900", className)}>
        {/* Map Container */}
        <div className="relative w-full h-full min-h-[300px] p-4">
          <MapContainer
            center={mapCenter as [number, number]}
            zoom={5}
            style={{ height: '100%', width: '100%', borderRadius: '0.75rem' }}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <FitBounds tourists={tourists} />

            {tourists.map((tourist) => (
              <Marker
                key={tourist.id}
                position={[tourist.location.lat, tourist.location.lng]}
                icon={createCustomIcon(tourist.status)}
                eventHandlers={{
                  click: () => handleTouristClick(tourist),
                }}
              >
                <Popup>
                  <div className="p-2 min-w-[200px]">
                    <div className="flex items-center gap-2 mb-2">
                      <img
                        src={tourist.photo}
                        alt={tourist.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-semibold text-sm">{tourist.name}</h3>
                        <p className="text-xs text-gray-600">{tourist.country}</p>
                      </div>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span>Status:</span>
                        <Badge
                          variant={tourist.status === 'verified' ? 'default' : tourist.status === 'pending' ? 'secondary' : 'destructive'}
                          className="text-xs"
                        >
                          {STATUS_LABELS[tourist.status]}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Last Check-in:</span>
                        <span>{new Date(tourist.lastCheckIn).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-1 mt-2">
                      <Button size="sm" variant="outline" onClick={() => handleTouristClick(tourist)}>
                        View Details
                      </Button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Legend */}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg z-10">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">Live Tourists</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-xs">Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-xs">Pending</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-xs">Alert</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg z-10">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div>
                <div className="text-lg font-bold text-blue-600">{tourists.length}</div>
                <div className="text-xs text-gray-600">Active</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">
                  {tourists.filter(t => t.status === 'verified').length}
                </div>
                <div className="text-xs text-gray-600">Verified</div>
              </div>
            </div>
          </div>

          {/* Map Controls Info */}
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg z-10">
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <Navigation className="w-3 h-3" />
              <span>Click markers for details</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Tourist Detail Dialog */}
      <Dialog open={!!selectedTourist} onOpenChange={() => setSelectedTourist(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <img
                src={selectedTourist?.photo}
                alt={selectedTourist?.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              {selectedTourist?.name}
            </DialogTitle>
            <DialogDescription>
              Tourist from {selectedTourist?.country}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status</span>
              <Badge
                variant={selectedTourist?.status === 'verified' ? 'default' : selectedTourist?.status === 'pending' ? 'secondary' : 'destructive'}
                className="flex items-center gap-1"
              >
                {selectedTourist?.status === 'alert' && <AlertCircle className="w-3 h-3" />}
                {selectedTourist && STATUS_LABELS[selectedTourist.status]}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Last Check-in</span>
              <span className="text-sm text-muted-foreground">
                {selectedTourist && new Date(selectedTourist.lastCheckIn).toLocaleDateString()}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Location</span>
              <span className="text-sm text-muted-foreground">
                {selectedTourist?.location.lat.toFixed(4)}, {selectedTourist?.location.lng.toFixed(4)}
              </span>
            </div>

            {selectedTourist?.emergencyContact && (
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-2">Emergency Contact</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">{selectedTourist.emergencyContact.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedTourist.emergencyContact.phone}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleEmergencyContact}
                    className="flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Call
                  </Button>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setSelectedTourist(null)}>
              Close
            </Button>
            <Button onClick={handleViewProfile} className="flex items-center gap-1">
              <Shield className="w-4 h-4" />
              View Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
});
