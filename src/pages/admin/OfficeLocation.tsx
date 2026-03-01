import { useEffect, useState, useCallback } from "react";
import { useAppSelector } from "@/hooks/useAppSelector";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/constant/Config";
import { toast } from "@/hooks/use-toast";
import { Edit, Trash2 } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

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
  const [form, setForm] = useState<FormState>({
    name: "",
    latitude: "",
    longitude: "",
    radius: "",
    address: "",
    isActive: false,
  });

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
      name: "",
      latitude: "",
      longitude: "",
      radius: "",
      address: "",
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
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm">Name</label>
                  <Input value={form.name}
                    placeholder={
                      isEditingIndex !== null ? String(locations[isEditingIndex]?.name ?? "") : "Company Name"
                    }
                  onChange={(e) => setForm({ ...form, name: e.target.value }) } />
                
                </div>
                <div className="grid gap-2">
                  <label className="text-sm">Radius (meters)</label>
                  <Input
                    type="number"
                    value={form.radius}
                    onChange={(e) => setForm({ ...form, radius: e.target.value })}
                      placeholder={
                      isEditingIndex !== null ? String(locations[isEditingIndex]?.radius ?? "") : "Ex..100"
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm">Latitude</label>
                  <Input
                    type="number"
                    value={form.latitude}
                    onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                    placeholder={
                      isEditingIndex !== null ? String(locations[isEditingIndex]?.latitude ?? "") : "Ex...19.182680"
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm">Longitude</label>
                  <Input
                    type="number"
                    value={form.longitude}
                    onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                    placeholder={
                      isEditingIndex !== null ? String(locations[isEditingIndex]?.longitude ?? "") : "Ex...73.050678"
                    }
                  />
                </div>
                <div className="grid gap-2 sm:col-span-2">
                  <label className="text-sm">Address</label>
                  <Textarea
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    rows={3}
                    placeholder={
                      isEditingIndex !== null ? String(locations[isEditingIndex]?.address ?? "") : "Office address"
                    }
                  />
                </div>
              <div className="sm:col-span-1">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={Boolean(form.isActive)}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  />
                  Active
                </label>
              </div>
              </div>
              <div className="mt-4 flex gap-2">
                {isEditingIndex === null ? (
                  <Button onClick={addLocation}>Add Location</Button>
                ) : (
                  <>
                    <Button onClick={updateLocation}>Update Location</Button>
                    <Button variant="outline" onClick={resetForm}>Cancel</Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Locations</CardTitle>
              <CardDescription>Existing office locations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-center p-2">Name</th>
                      <th className="text-center p-2 w-[240px]">Address</th>
                      <th className="text-center p-2">Latitude</th>
                      <th className="text-center p-2">Longitude</th>
                      <th className="text-center p-2">Radius</th>
                      <th className="text-center p-2">Active</th>
                      <th className="text-center p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {locations.length === 0 ? (
                      <tr>
                        <td className="p-3 text-muted-foreground" colSpan={7}>No locations yet</td>
                      </tr>
                    ) : (
                      locations.map((loc, idx) => (
                        <tr key={(loc.name || "") + idx} className="border-b">
                          <td className="p-2 text-center">{loc.name}</td>
                          <td className="p-2 text-center">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className="text-sm"
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
                          </td>
                          <td className="p-2 text-center">{loc.latitude}</td>
                          <td className="p-2 text-center">{loc.longitude}</td>
                          <td className="p-2 text-center">{loc.radius}</td>
                          <td className="p-2 text-center">{loc.isActive ? "Yes" : "No"}</td>
                          <td className="p-2 text-center">
                            <div className="flex justify-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => startEdit(idx)}
                                className="h-8 w-8 p-0"
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteLocation(idx)}
                                className="text-destructive hover:text-destructive h-8 w-8 p-0"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
