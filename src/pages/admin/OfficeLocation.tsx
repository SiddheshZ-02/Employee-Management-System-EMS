import { useEffect, useState, useCallback, useMemo } from "react";
import { useAppSelector } from "@/hooks/useAppSelector";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/constant/Config";
import { toast } from "@/hooks/use-toast";
import { Edit, Trash2, MapPin, Globe, Target, ChevronLeft, ChevronRight } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface OfficeLocation {
  id?: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  address?: string;
  isActive?: boolean;
}

interface OfficeLocationApiItem {
  _id?: string;
  id?: string;
  name?: string;
  latitude?: number | string;
  longitude?: number | string;
  radius?: number | string;
  address?: string;
  isActive?: boolean;
  location?: {
    type?: string;
    coordinates?: Array<number | string>;
  };
}

interface FormState {
  name: string;
  latitude: string;
  longitude: string;
  radius: string;
  address: string;
  isActive: boolean;
}

export const OfficeLocationPage = () => {
  const { token } = useAppSelector((s) => s.auth);
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState<OfficeLocation[]>([]);
  const [isEditingIndex, setIsEditingIndex] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const [form, setForm] = useState<FormState>({
    name: "",
    latitude: "",
    longitude: "",
    radius: "",
    address: "",
    isActive: false,
  });

  const totalPages = Math.max(1, Math.ceil(locations.length / pageSize));
  const current = Math.min(currentPage, totalPages);
  const start = (current - 1) * pageSize;
  const paginatedLocations = useMemo(() => {
    return locations.slice(start, start + pageSize);
  }, [locations, start, pageSize]);

  const fetchLocation = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/office-locations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setLoading(false);
        toast({ title: "Error", description: "Failed to load office location", variant: "destructive" });
        return;
      }
      const json = await res.json();
      if (!json.success) {
        setLoading(false);
        toast({ title: "Error", description: "Unexpected response", variant: "destructive" });
        return;
      }
      if (Array.isArray(json.officeLocations)) {
        const mapped = json.officeLocations.map((loc: OfficeLocationApiItem) => {
          const coords = Array.isArray(loc.location?.coordinates)
            ? loc.location!.coordinates!
            : undefined;
          const latitude =
            coords && coords.length >= 2 ? Number(coords[1]) : Number(loc.latitude) || 0;
          const longitude =
            coords && coords.length >= 2 ? Number(coords[0]) : Number(loc.longitude) || 0;
          return {
            id: String(loc._id || loc.id || ""),
            name: String(loc.name || ""),
            latitude,
            longitude,
            radius: Number(loc.radius) || 0,
            address: String(loc.address || ""),
            isActive: Boolean(loc.isActive),
          };
        });
        setLocations(mapped);
      } else if (json.officeLocation) {
        const loc = json.officeLocation;
        const coords = Array.isArray(loc.location?.coordinates)
          ? loc.location!.coordinates!
          : undefined;
        setLocations([
          {
            id: String(loc._id || loc.id || ""),
            name: String(loc.name || ""),
            latitude:
              coords && coords.length >= 2 ? Number(coords[1]) : Number(loc.latitude) || 0,
            longitude:
              coords && coords.length >= 2 ? Number(coords[0]) : Number(loc.longitude) || 0,
            radius: Number(loc.radius) || 0,
            address: String(loc.address || ""),
            isActive: Boolean(loc.isActive),
          },
        ]);
      } else {
        setLocations([]);
      }
    } catch {
      toast({ title: "Error", description: "Network error while fetching location", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  const createLocation = async () => {
    if (!token) return false;
    if (!form.name || !form.latitude || !form.longitude || !form.radius) {
      toast({ title: "Validation error", description: "Name, latitude, longitude, and radius are required", variant: "destructive" });
      return false;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/office-locations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          latitude: Number(form.latitude),
          longitude: Number(form.longitude),
          radius: Number(form.radius),
          address: form.address,
          isActive: form.isActive,
        }),
      });
      if (!res.ok) {
        toast({ title: "Error", description: "Failed to create location", variant: "destructive" });
        return false;
      }
      await fetchLocation();
      toast({ title: "Location added" });
      return true;
    } catch {
      toast({ title: "Error", description: "Network error while creating location", variant: "destructive" });
      return false;
    }
  };

  const updateLocationById = async (id: string) => {
    if (!token) return false;
    try {
      const current = locations[isEditingIndex ?? -1];
      const payload = {
        name: form.name || current?.name || "",
        latitude: form.latitude ? Number(form.latitude) : current?.latitude ?? 0,
        longitude: form.longitude ? Number(form.longitude) : current?.longitude ?? 0,
        radius: form.radius ? Number(form.radius) : current?.radius ?? 0,
        address: form.address || current?.address || "",
        isActive: form.isActive,
      };
      if (!payload.name || !payload.latitude || !payload.longitude || !payload.radius) {
        toast({ title: "Validation error", description: "Name, latitude, longitude, and radius are required", variant: "destructive" });
        return false;
      }
      const res = await fetch(`${API_BASE_URL}/api/admin/office-locations/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        toast({ title: "Error", description: "Failed to update location", variant: "destructive" });
        return false;
      }
      await fetchLocation();
      toast({ title: "Location updated" });
      return true;
    } catch {
      toast({ title: "Error", description: "Network error while updating location", variant: "destructive" });
      return false;
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      latitude: "",
      longitude: "",
      radius: "",
      address: "",
      isActive: false,
    });
    setIsEditingIndex(null);
  };

  const addLocation = async () => {
    const ok = await createLocation();
    if (ok) resetForm();
  };

  const updateLocation = async () => {
    if (isEditingIndex === null) return;
    const id = locations[isEditingIndex]?.id;
    if (!id) return;
    const ok = await updateLocationById(id);
    if (ok) resetForm();
  };

  const deleteLocation = async (index: number) => {
    const id = locations[index]?.id;
    if (!id || !token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/office-locations/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        toast({ title: "Error", description: "Failed to delete location", variant: "destructive" });
        return;
      }
      await fetchLocation();
      toast({ title: "Location removed" });
    } catch {
      toast({ title: "Error", description: "Network error while deleting location", variant: "destructive" });
    }
  };


  const startEdit = (index: number) => {
    const loc = locations[index];
    setForm({
      name: String(loc.name || ""),
      latitude: String(loc.latitude ?? ""),
      longitude: String(loc.longitude ?? ""),
      radius: String(loc.radius ?? ""),
      address: String(loc.address || ""),
      isActive: Boolean(loc.isActive),
    });
    setIsEditingIndex(index);
  };

  if (loading) {
    return (
      <div className="w-full min-h-full bg-background">
        <div className="p-4 md:p-6 lg:p-8">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-full bg-background">
      <div className="w-full h-full p-4 md:p-6 lg:p-8">
        <div className="space-y-6 w-full">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold">Office Locations</h2>
            <p className="text-muted-foreground">Manage multiple office geofence locations</p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Location Details</CardTitle>
              <CardDescription>Define the office geofence and address</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Globe className="h-4 w-4 text-primary" />
                    Name
                  </label>
                  <Input 
                    className="text-black"
                    value={form.name}
                    placeholder="Company Name"
                    onChange={(e) => setForm({ ...form, name: e.target.value }) } 
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    Radius (meters)
                  </label>
                  <Input
                    className="text-black"
                    type="number"
                    value={form.radius}
                    onChange={(e) => setForm({ ...form, radius: e.target.value })}
                    placeholder="Ex..100"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    Latitude
                  </label>
                  <Input
                    className="text-black"
                    type="number"
                    value={form.latitude}
                    onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                    placeholder="Ex...19.182680"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    Longitude
                  </label>
                  <Input
                    className="text-black"
                    type="number"
                    value={form.longitude}
                    onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                    placeholder="Ex...73.050678"
                  />
                </div>
                <div className="grid gap-2 sm:col-span-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    Address
                  </label>
                  <Textarea
                    className="text-black"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    rows={3}
                    placeholder="Office address"
                  />
                </div>
              <div className="sm:col-span-1">
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    checked={Boolean(form.isActive)}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  />
                  Active Status
                </label>
              </div>
              </div>
              <div className="mt-6 flex gap-3">
                {isEditingIndex === null ? (
                  <Button onClick={addLocation} className="gap-2">
                    <MapPin className="h-4 w-4" />
                    Add Location
                  </Button>
                ) : (
                  <>
                    <Button onClick={updateLocation} className="gap-2">
                      <Edit className="h-4 w-4" />
                      Update Location
                    </Button>
                    <Button variant="outline" onClick={resetForm}>Cancel</Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
          <Card className="border shadow-sm bg-card overflow-hidden">
            <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">Existing Locations</CardTitle>
                <CardDescription>Manage your office geofence locations</CardDescription>
              </div>
              <div className="text-sm font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full">
                {locations.length} Locations
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-semibold text-foreground text-center">Name</TableHead>
                      <TableHead className="font-semibold text-foreground text-center w-[240px]">Address</TableHead>
                      <TableHead className="font-semibold text-foreground text-center">Latitude</TableHead>
                      <TableHead className="font-semibold text-foreground text-center">Longitude</TableHead>
                      <TableHead className="font-semibold text-foreground text-center">Radius</TableHead>
                      <TableHead className="font-semibold text-foreground text-center">Status</TableHead>
                      <TableHead className="font-semibold text-foreground text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {locations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-40 text-center">
                          <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                            <MapPin className="h-10 w-10 opacity-20" />
                            <span className="font-medium">No locations found.</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedLocations.map((loc, idx) => {
                        const actualIdx = start + idx;
                        return (
                          <TableRow key={loc.id || idx} className="hover:bg-muted/30 transition-colors border-b last:border-0">
                            <TableCell className="font-medium text-foreground text-center">{loc.name}</TableCell>
                            <TableCell className="text-center">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div
                                    className="text-sm text-muted-foreground mx-auto"
                                    style={{
                                      display: "-webkit-box",
                                      WebkitLineClamp: 1,
                                      WebkitBoxOrient: "vertical",
                                      overflow: "hidden",
                                      maxWidth: "240px",
                                    }}
                                  >
                                    {loc.address || "-"}
                                  </div>
                                </TooltipTrigger>
                                {loc.address ? (
                                  <TooltipContent sideOffset={6}>{loc.address}</TooltipContent>
                                ) : null}
                              </Tooltip>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-center">{loc.latitude}</TableCell>
                            <TableCell className="text-muted-foreground text-center">{loc.longitude}</TableCell>
                            <TableCell className="text-center">
                              <Badge variant="secondary" className="font-semibold">
                                {loc.radius}m
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              {loc.isActive ? (
                                <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">
                                  Active
                                </Badge>
                              ) : (
                                <Badge variant="destructive" className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20">
                                  Inactive
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex justify-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => startEdit(actualIdx)}
                                  className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                                  title="Edit"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteLocation(actualIdx)}
                                  className="text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Controls */}
              {locations.length > 0 && (
                <div className="px-6 py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 bg-card">
                  <div className="text-sm text-muted-foreground">
                    Showing <span className="font-semibold text-foreground">{start + 1}</span> to{" "}
                    <span className="font-semibold text-foreground">{Math.min(start + pageSize, locations.length)}</span> of{" "}
                    <span className="font-semibold text-foreground">{locations.length}</span> locations
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="h-8 w-8 p-0"
                      >
                        {page}
                      </Button>
                    ))}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
