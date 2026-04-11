import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Calendar, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useAppSelector } from '@/hooks/useAppSelector';
import { apiRequest } from '@/lib/api';

interface YearEndResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  grantYear: string;
}

interface ResetPreview {
  totalEmployeesAffected: number;
  leaveTypes: Array<{
    leaveTypeId: string;
    leaveTypeName: string;
    carryForwardEnabled: boolean;
    maxCarryForwardDays: number;
    employeesWithBalance: number;
    totalRemainingDays: number;
    willCarryForward: number;
    willExpire: number;
  }>;
  summary: {
    totalLeavesWillCarryForward: number;
    totalLeavesWillExpire: number;
  };
}

const YearEndResetModal: React.FC<YearEndResetModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  grantYear,
}) => {
  const { token } = useAppSelector((state) => state.auth);
  const [step, setStep] = useState<'date' | 'preview' | 'confirm'>('date');
  const [resetDate, setResetDate] = useState('');
  const [preview, setPreview] = useState<ResetPreview | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePreview = async () => {
    if (!resetDate) {
      toast.error('Please select a reset date');
      return;
    }

    setLoading(true);
    try {
      const res = await apiRequest<{ success: boolean; preview: ResetPreview }>(
        '/api/leave/admin/preview-reset',
        {
          method: 'POST',
          body: { resetDate },
          token,
        }
      );

      if (res.success) {
        setPreview(res.preview);
        setStep('preview');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate preview');
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteReset = async () => {
    if (!resetDate || !token) return;

    setLoading(true);
    try {
      const newYear = grantYear;
      const res = await apiRequest<{ success: boolean; message: string }>(
        '/api/leave/admin/execute-reset',
        {
          method: 'POST',
          body: { resetDate, year: newYear },
          token,
        }
      );

      if (res.success) {
        toast.success(res.message);
        setStep('date');
        setPreview(null);
        setResetDate('');
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to execute reset');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('date');
    setPreview(null);
    setResetDate('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Year-End Leave Reset
          </DialogTitle>
          <DialogDescription>
            Reset all employee leave balances with carry-forward support
          </DialogDescription>
        </DialogHeader>

        {step === 'date' && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Reset Date</label>
              <input
                type="date"
                value={resetDate}
                onChange={(e) => setResetDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                min={new Date().toISOString().split('T')[0]}
              />
              <p className="text-xs text-muted-foreground">
                This date will be used to reset all employee leave balances
              </p>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handlePreview} disabled={!resetDate || loading}>
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                {loading ? 'Loading...' : 'Preview Impact'}
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === 'preview' && preview && (
          <div className="space-y-4 py-4">
            <div className="bg-muted/50 p-4 rounded-lg space-y-3">
              <h4 className="font-semibold">Reset Summary</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Employees Affected:</span>
                  <span className="font-medium">{preview.totalEmployeesAffected}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Leaves Carrying Forward:</span>
                  <span className="font-medium text-green-600">
                    {preview.summary.totalLeavesWillCarryForward}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Leaves Expiring:</span>
                  <span className="font-medium text-red-600">
                    {preview.summary.totalLeavesWillExpire}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Leave Type Breakdown</h4>
              {preview.leaveTypes.map((lt) => (
                <div
                  key={lt.leaveTypeId}
                  className="p-3 border rounded-lg bg-muted/20 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{lt.leaveTypeName}</p>
                    {lt.carryForwardEnabled ? (
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                        Carry Forward Enabled (Max: {lt.maxCarryForwardDays} days)
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">
                        Will Expire
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                    <span>Employees: {lt.employeesWithBalance}</span>
                    <span>Remaining: {lt.totalRemainingDays} days</span>
                    <span>
                      Will Carry: {lt.willCarryForward} | Will Expire: {lt.willExpire}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-yellow-700">
                This action will reset all employee leave balances according to the carry-forward
                policy. This cannot be undone.
              </p>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep('date')}>
                Back
              </Button>
              <Button onClick={() => setStep('confirm')} className="gap-2">
                Proceed to Reset <ArrowRight className="h-4 w-4" />
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === 'confirm' && (
          <div className="space-y-4 py-4">
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <h4 className="font-semibold text-red-700">Final Confirmation</h4>
                <p className="text-sm text-red-600">
                  You are about to reset leave balances for <strong>{preview?.totalEmployeesAffected} employees</strong>
                </p>
                <ul className="text-sm text-red-600 list-disc list-inside space-y-1">
                  <li>{preview?.summary.totalLeavesWillCarryForward} days will carry forward</li>
                  <li>{preview?.summary.totalLeavesWillExpire} days will expire</li>
                  <li>This action cannot be undone</li>
                </ul>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep('preview')} disabled={loading}>
                Back
              </Button>
              <Button
                variant="destructive"
                onClick={handleExecuteReset}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                )}
                {loading ? 'Executing Reset...' : 'Confirm & Execute Reset'}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default YearEndResetModal;
