import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppSelector } from '@/hooks/useAppSelector';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { updateProfile } from '@/store/slices/authSlice';
import { toast } from '@/hooks/use-toast';
import { User, Save } from 'lucide-react';

export const ProfileManagement = () => {
  const { user } = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    department: user?.department || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(updateProfile(formData));
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated",
    });
  };

  return (
    <div className="w-full min-h-full bg-background">
      <div className="w-full h-full p-4 md:p-6 lg:p-8">
        <div className="space-y-6 w-full max-w-4xl mx-auto">
      <div className="flex flex-col space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold">Profile Management</h2>
        <p className="text-sm sm:text-base text-muted-foreground">Manage your personal information</p>
      </div>

      <div className="grid gap-6">
        <Card className="hover-lift transition-smooth border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <User className="h-5 w-5 shrink-0" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full touch-target"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full touch-target"
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
                    className="w-full touch-target"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role" className="text-sm font-medium">Role</Label>
                  <Input id="role" value={user?.role || ''} disabled className="w-full bg-muted touch-target" />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button type="submit" className="w-full sm:w-auto mobile-button">
                  <Save className="h-4 w-4 mr-2 shrink-0" />
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
        </div>
      </div>
    </div>
  );
};