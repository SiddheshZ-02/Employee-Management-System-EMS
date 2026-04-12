import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

import { useAppSelector } from '@/hooks/useAppSelector';
import { apiRequest } from '@/lib/api';

interface AdminAllocateModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: {
    _id: string;
    name: string;
  } | null;
  onSuccess: () => void;
}

const AdminAllocateModal: React.FC<AdminAllocateModalProps> = ({ isOpen, onClose, employee, onSuccess }) => {
  const [leaveTypeId, setLeaveTypeId] = useState('');
  const [days, setDays] = useState('');
  const [validityDays, setValidityDays] = useState('40');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { leaveTypes } = useAppSelector((state) => state.leave);
  const { toast } = useToast();

  const handleAllocate = async () => {
    if (!employee || !leaveTypeId || !days) {
      toast({
        title: "Validation Error",
        description: "Please select leave type and enter days.",
        variant: "destructive",
      });
      return;
    }

    const daysNum = parseInt(days);
    if (isNaN(daysNum) || daysNum < 1 || daysNum > 99) {
      toast({
        title: "Validation Error",
        description: "Days must be between 1 and 99.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiRequest<{ success: boolean; expiryDate: string }>('/leave/allocate-individual', {
        method: 'POST',
        body: {
          userId: employee._id,
          leaveTypeId,
          allocatedDays: daysNum,
          validityDays: parseInt(validityDays),
        },
        token: localStorage.getItem('ems_token'),
      });

      if (response.success) {
        const expiryDate = new Date(response.expiryDate).toLocaleDateString();
        const leaveType = leaveTypes.find(t => (t._id || t.id) === leaveTypeId);
        
        toast({
          title: "Leave Allocated",
          description: `Successfully allocated ${daysNum} days of ${leaveType?.name} to ${employee.name}. Expires on ${expiryDate}.`,
        });
        onSuccess();
        onClose();
        setLeaveTypeId('');
        setDays('');
        setValidityDays('40');
      }
    } catch (error: any) {
      toast({
        title: "Allocation Failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Allocate Leave to {employee?.name}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="leave-type" className="text-right">
              Leave Type
            </Label>
            <div className="col-span-3">
              <Select value={leaveTypeId} onValueChange={setLeaveTypeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select leave type" />
                </SelectTrigger>
                <SelectContent>
                  {leaveTypes.filter(t => t.isActive).map((type) => (
                    <SelectItem key={type._id || type.id} value={(type._id || type.id) as string}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="days" className="text-right">
              Days
            </Label>
            <Input
              id="days"
              type="number"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              className="col-span-3"
              placeholder="1-99"
              min="1"
              max="99"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="validity" className="text-right">
              Validity
            </Label>
            <Select value={validityDays} onValueChange={setValidityDays}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select validity period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="15">15 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="40">40 days (Default)</SelectItem>
                <SelectItem value="45">45 days</SelectItem>
                <SelectItem value="60">60 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleAllocate} disabled={isSubmitting}>
            {isSubmitting ? "Allocating..." : "Allocate"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdminAllocateModal;
