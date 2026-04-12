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
import { Loader2, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAppSelector } from '@/hooks/useAppSelector';
import { apiRequest } from '@/lib/api';

interface YearEndResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const YearEndResetModal: React.FC<YearEndResetModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { token } = useAppSelector((state) => state.auth);
  const [resetDate, setResetDate] = useState('');
  const [autoGrantNewYear, setAutoGrantNewYear] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleExecuteReset = async () => {
    if (!resetDate) {
      toast.error('Please select a reset date');
      return;
    }

    const resetDateObj = new Date(resetDate);
    const newYear = (resetDateObj.getFullYear() + 1).toString();

    setLoading(true);
    try {
      const res = await apiRequest<{ success: boolean; message: string; autoGrantResult?: any }>(
        '/api/leave/admin/execute-reset',
        {
          method: 'POST',
          body: { resetDate, year: newYear, autoGrantNewYear },
          token,
        }
      );

      if (res.success) {
        toast.success(res.message);
        if (autoGrantNewYear && res.autoGrantResult) {
          toast.info(`Auto-granted ${res.autoGrantResult.grantedCount} leave balances for ${newYear}`);
        } else if (!autoGrantNewYear) {
          toast.info('Next step: Grant new year leaves via Grant Leave feature');
        }
        setResetDate('');
        setAutoGrantNewYear(true);
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to execute leave reset');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setResetDate('');
    setAutoGrantNewYear(true);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Year-End Leave Reset
          </DialogTitle>
          <DialogDescription>
            Reset all employee leave balances with carry-forward support
          </DialogDescription>
        </DialogHeader>

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
              All employee leave balances will be reset on this date. Carried-forward days will be preserved according to company policy.
            </p>
          </div>

          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <input
              type="checkbox"
              id="autoGrant"
              checked={autoGrantNewYear}
              onChange={(e) => setAutoGrantNewYear(e.target.checked)}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <label htmlFor="autoGrant" className="text-sm text-green-700 cursor-pointer">
              <span className="font-medium">Automatically grant new year leaves</span>
              <p className="text-xs mt-1 text-green-600">
                After reset, immediately grant {new Date(new Date(resetDate).getFullYear() + 1, 0, 1).getFullYear()} yearly leave balances to all employees
              </p>
            </label>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-700">
                <p className="font-medium">What happens on reset:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Unused days carried forward (if enabled for leave type)</li>
                  <li>Excess days expire according to policy</li>
                  <li>Current year balances reset to 0 or carried-forward amount</li>
                  <li>All changes logged for audit purposes</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-700">
                <p className="font-medium">Important:</p>
                <p className="mt-1">
                  {autoGrantNewYear 
                    ? 'New year balances will be automatically granted after reset. All employees will receive their yearly allocation.'
                    : 'New year balances are NOT automatically granted. After reset, you must manually grant new year leaves via the Grant Leave feature.'
                  }
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleExecuteReset} 
              disabled={!resetDate || loading}
              className="gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              {loading ? 'Executing Reset...' : 'Execute Reset'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default YearEndResetModal;
