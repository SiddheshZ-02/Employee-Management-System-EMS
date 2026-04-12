import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Settings2, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useAppSelector } from '@/hooks/useAppSelector';
import { apiRequest } from '@/lib/api';
import type { LeaveType } from '@/store/slices/leaveSlice';

interface CarryForwardConfigProps {
  leaveTypes: LeaveType[];
  onSuccess: () => void;
}

const CarryForwardConfig: React.FC<CarryForwardConfigProps> = ({ leaveTypes, onSuccess }) => {
  const { token } = useAppSelector((state) => state.auth);
  const [saving, setSaving] = useState<string | null>(null);
  const [localTypes, setLocalTypes] = useState<LeaveType[]>(leaveTypes);

  React.useEffect(() => {
    setLocalTypes(leaveTypes);
  }, [leaveTypes]);

  const handleToggleCarryForward = async (leaveTypeId: string, enabled: boolean) => {
    const updatedTypes = localTypes.map((lt) =>
      (lt._id || lt.id) === leaveTypeId
        ? { ...lt, carryForwardEnabled: enabled, maxCarryForwardDays: enabled ? lt.maxCarryForwardDays || 0 : 0 }
        : lt
    );
    setLocalTypes(updatedTypes);

    if (!token) return;

    setSaving(leaveTypeId);
    try {
      const res = await apiRequest<{ success: boolean; leaveType: LeaveType }>(
        `/api/leave/admin/carry-forward-config/${leaveTypeId}`,
        {
          method: 'PUT',
          body: {
            carryForwardEnabled: enabled,
            maxCarryForwardDays: enabled ? localTypes.find((lt) => (lt._id || lt.id) === leaveTypeId)?.maxCarryForwardDays || 0 : 0,
          },
          token,
        }
      );

      if (res.success) {
        toast.success(`Carry-forward ${enabled ? 'enabled' : 'disabled'} for ${res.leaveType.name}`);
        onSuccess();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update carry-forward settings');
      setLocalTypes(leaveTypes);
    } finally {
      setSaving(null);
    }
  };

  const handleMaxDaysChange = (leaveTypeId: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setLocalTypes((prev) =>
      prev.map((lt) =>
        (lt._id || lt.id) === leaveTypeId ? { ...lt, maxCarryForwardDays: numValue } : lt
      )
    );
  };

  const handleSaveMaxDays = async (leaveTypeId: string) => {
    const leaveType = localTypes.find((lt) => (lt._id || lt.id) === leaveTypeId);
    if (!leaveType || !token) return;

    setSaving(leaveTypeId);
    try {
      const res = await apiRequest<{ success: boolean; leaveType: LeaveType }>(
        `/api/leave/admin/carry-forward-config/${leaveTypeId}`,
        {
          method: 'PUT',
          body: {
            carryForwardEnabled: leaveType.carryForwardEnabled || false,
            maxCarryForwardDays: leaveType.maxCarryForwardDays || 0,
          },
          token,
        }
      );

      if (res.success) {
        toast.success(`Max carry-forward days updated for ${res.leaveType.name}`);
        onSuccess();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update max days');
    } finally {
      setSaving(null);
    }
  };

  return (
    <Card className="shadow-sm border-2">
      <CardHeader className="bg-muted/90">
        <CardTitle className="text-lg flex items-center">
          <Settings2 className="h-5 w-5 mr-2 text-primary" />
          Carry-Forward Configuration
        </CardTitle>
        <CardDescription>
          Configure which leave types can carry forward to the next year and set maximum limits.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {localTypes.map((leaveType) => {
          const id = leaveType._id || leaveType.id || '';
          const isEnabled = leaveType.carryForwardEnabled || false;
          const maxDays = leaveType.maxCarryForwardDays || 0;

          return (
            <div
              key={id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-lg bg-muted/20"
            >
              <div className="flex items-center gap-3 flex-1">
                <Checkbox
                  checked={isEnabled}
                  onCheckedChange={(checked) => handleToggleCarryForward(id, checked as boolean)}
                  className="h-6 w-2 rounded-sm border-2 border-slate-300 data-[state=checked]:!bg-green-600 data-[state=checked]:!border-green-600"
                />
                <div>
                  <p className="font-medium">{leaveType.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {isEnabled
                      ? `Up to ${maxDays} days can carry forward`
                      : 'All unused days will expire'}
                  </p>
                </div>
              </div>

              {isEnabled && (
                <div className="flex items-center gap-2">
                  <Label htmlFor={`max-${id}`} className="text-sm whitespace-nowrap">
                    Max Days:
                  </Label>
                  <Input
                    id={`max-${id}`}
                    type="number"
                    value={maxDays}
                    onChange={(e) => handleMaxDaysChange(id, e.target.value)}
                    className="w-24 h-9"
                    min="0"
                    disabled={saving === id}
                  />
                  <Button
                    size="sm"
                    onClick={() => handleSaveMaxDays(id)}
                    disabled={saving === id}
                    className="h-9"
                  >
                    {saving === id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              )}
            </div>
          );
        })}

        {localTypes.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No leave types configured. Add leave types first.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CarryForwardConfig;
