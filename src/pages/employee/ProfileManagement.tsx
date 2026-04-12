import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppSelector } from '@/hooks/useAppSelector';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { updateProfile } from '@/store/slices/authSlice';
import { toast } from '@/hooks/use-toast';
import { 
  Save, 
  Mail, 
  Phone, 
  ShieldCheck,
  CalendarDays,
  Loader2,
  Edit3
} from 'lucide-react';
import { API_BASE_URL } from '@/constant/Config';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  employeeId?: string;
  department?: string;
  phone?: string;
  position?: string;
  dateOfBirth?: string;
  role?: string;
  isActive?: boolean;
  createdAt?: string;
  lastLoginAt?: string;
}

export const ProfileManagement = () => {
  const { token } = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    phone: '',
    position: '',
    dateOfBirth: '',
  });

  const fetchProfile = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        });
        return;
      }

      const data = await response.json();

      if (data?.success && data?.data) {
        setProfileData(data.data);
        setFormData({
          name: data.data.name || '',
          email: data.data.email || '',
          department: data.data.department || '',
          phone: data.data.phone || '',
          position: data.data.position || '',
          dateOfBirth: data.data.dateOfBirth ? new Date(data.data.dateOfBirth).toISOString().split('T')[0] : '',
        });
      } else {
        toast({
          title: "Error",
          description: "Unexpected response from server",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Network error while fetching profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast({
        title: "Not authenticated",
        description: "Please log in again to update your profile",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          department: formData.department,
          phone: formData.phone,
          position: formData.position,
          dateOfBirth: formData.dateOfBirth || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Update failed",
          description: data?.message || "Unable to update profile. Please try again.",
          variant: "destructive",
        });
        setSaving(false);
        return;
      }

      if (data?.success && data?.data) {
        dispatch(
          updateProfile({
            name: data.data.name,
            email: data.data.email,
            department: data.data.department,
            phone: data.data.phone,
          })
        );
        
        setIsEditing(false);
        setSaving(false);

        toast({
          title: "Profile Updated",
          description: "Your profile has been successfully updated",
        });

        await fetchProfile();
      } else {
        toast({
          title: "Update failed",
          description: "Unexpected response from server",
          variant: "destructive",
        });
        setSaving(false);
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        title: "Update failed",
        description: "An error occurred while updating your profile",
        variant: "destructive",
      });
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profileData) {
      setFormData({
        name: profileData.name || '',
        email: profileData.email || '',
        department: profileData.department || '',
        phone: profileData.phone || '',
        position: profileData.position || '',
        dateOfBirth: profileData.dateOfBirth ? new Date(profileData.dateOfBirth).toISOString().split('T')[0] : '',
      });
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <div className="h-4 w-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="w-full min-h-full bg-background">
        <div className="p-4 md:p-6 lg:p-8 flex flex-col items-center justify-center gap-4">
          <div className="text-muted-foreground text-lg">Unable to load profile</div>
          <Button variant="outline" onClick={fetchProfile}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const firstInitial = profileData.name ? profileData.name.charAt(0).toUpperCase() : '?';

  return (
    <div className="w-full min-h-full bg-background pb-10">
      <div className="w-full h-full p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">My Profile</h2>
            <p className="text-muted-foreground mt-1">View and manage your personal information</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Left Column: Profile Sidebar */}
          <div className="md:col-span-1">
            <Card>
              <CardContent className="pt-6 space-y-6">
                <div className="flex flex-col items-center text-center pb-6 border-b">
                  <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-4 border-4 border-background shadow-sm">
                    <span className="text-4xl font-bold text-primary">{firstInitial}</span>
                  </div>
                  <h3 className="font-bold text-lg">{profileData.name}</h3>
                  <p className="text-sm text-muted-foreground">{profileData.position || profileData.employeeId || "Staff Member"}</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold">Email Address</p>
                      <p className="text-sm font-medium truncate">{profileData.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold">Phone Number</p>
                      <p className="text-sm font-medium">{profileData.phone || "Not provided"}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Editable Form */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Personal Information</CardTitle>
                <CardDescription>Update your personal and employment details</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full"
                        disabled={!isEditing}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        disabled
                        className="w-full bg-muted"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="department" className="text-sm font-medium">Department</Label>
                      <Input
                        id="department"
                        value={formData.department}
                        onChange={(e) => setFormData({...formData, department: e.target.value})}
                        className="w-full"
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="position" className="text-sm font-medium">Position</Label>
                      <Input
                        id="position"
                        value={formData.position}
                        onChange={(e) => setFormData({...formData, position: e.target.value})}
                        className="w-full"
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="phone" className="text-sm font-medium">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full"
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="dateOfBirth" className="text-sm font-medium">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                        className="w-full"
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="employeeId" className="text-sm font-medium">Employee ID</Label>
                      <Input 
                        id="employeeId" 
                        value={profileData.employeeId || 'Not Assigned'} 
                        disabled 
                        className="w-full bg-muted" 
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="role" className="text-sm font-medium">Role</Label>
                      <Input 
                        id="role" 
                        value={profileData.role ? profileData.role.charAt(0).toUpperCase() + profileData.role.slice(1) : ''} 
                        disabled 
                        className="w-full bg-muted" 
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    {!isEditing ? (
                      <Button 
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleEdit();
                        }}
                        className="w-full sm:w-auto"
                      >
                        <Edit3 className="h-4 w-4 mr-2 shrink-0" />
                        Edit Profile
                      </Button>
                    ) : (
                      <>
                        <Button 
                          type="submit" 
                          className="w-full sm:w-auto"
                          disabled={saving}
                        >
                          {saving ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin shrink-0" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2 shrink-0" />
                              Save Changes
                            </>
                          )}
                        </Button>
                        <Button 
                          type="button"
                          variant="outline"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleCancel();
                          }}
                          className="w-full sm:w-auto"
                          disabled={saving}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Additional Information Card */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Account Information</CardTitle>
                <CardDescription>System-managed account details</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 sm:grid-cols-2">
                <div className="flex items-start gap-3 p-4 rounded-xl border bg-card hover:bg-muted/20 transition-colors">
                  <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Joining Date</p>
                    <p className="font-bold text-base">
                      {profileData.createdAt ? new Date(profileData.createdAt).toLocaleDateString('en-GB', { 
                        day: '2-digit', 
                        month: 'short', 
                        year: 'numeric' 
                      }) : "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl border bg-card hover:bg-muted/20 transition-colors">
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Account Status</p>
                    <p className="font-bold text-base">
                      {profileData.isActive ? "Active" : "Inactive"}
                    </p>
                  </div>
                </div>

                {profileData.lastLoginAt && (
                  <div className="flex items-start gap-3 p-4 rounded-xl border bg-card hover:bg-muted/20 transition-colors">
                    <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                      <CalendarDays className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Last Login</p>
                      <p className="font-bold text-base">
                        {new Date(profileData.lastLoginAt).toLocaleDateString('en-GB', { 
                          day: '2-digit', 
                          month: 'short', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};