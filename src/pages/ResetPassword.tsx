import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/constant/Config';
import { Eye, EyeOff } from 'lucide-react';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { loginAsync } from '@/store/slices/authSlice';
import { store } from '@/store';

export const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState('');
  const dispatch = useAppDispatch();
  useEffect(() => {
    const paramToken = searchParams.get('token') || '';
    const stateToken = (location.state as { token?: string } | null)?.token || '';
    const storedToken = sessionStorage.getItem('resetToken') || '';
    const resolvedToken = paramToken || stateToken || storedToken;
    if (!resolvedToken) {
      toast({ title: 'Invalid or expired reset link', description: 'Please request a new link', variant: 'destructive' });
      navigate('/auth/forgot-password');
    } else {
      setToken(resolvedToken);
    }
  }, [searchParams, location.state, navigate]);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const strength = useMemo(() => {
    let s = 0;
    if (password.length >= 6) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast({ title: 'Invalid or expired reset link', description: 'Please request a new link', variant: 'destructive' });
      navigate('/auth/forgot-password');
      return;
    }
    if (!password || !confirm) {
      toast({ title: 'Error', description: 'Fill all fields', variant: 'destructive' });
      return;
    }
    if (password.length < 6) {
      toast({ title: 'Weak password', description: 'Minimum 6 characters required', variant: 'destructive' });
      return;
    }
    if (password !== confirm) {
      toast({ title: 'Error', description: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const msg = data?.message || 'Unable to reset password';
        toast({ title: 'Reset failed', description: msg, variant: 'destructive' });
        return;
      }
      toast({ title: 'Password reset', description: 'Password updated successfully' });
      sessionStorage.removeItem('resetToken');
      const resetEmail = sessionStorage.getItem('resetEmail') || '';
      if (resetEmail) {
        await dispatch(loginAsync(resetEmail, password));
        const authState = store.getState().auth;
        if (authState.isAuthenticated) {
          sessionStorage.removeItem('resetEmail');
          toast({ title: 'Welcome back!', description: `Successfully logged in as ${authState.user?.role}` });
          if (authState.user?.role === 'Admin') {
            navigate('/admin/dashboard');
          } else {
            navigate('/employee/dashboard');
          }
          return;
        }
      }
      toast({ title: 'Success', description: 'Please log in with your new password' });
      navigate('/auth');
    } catch {
      toast({ title: 'Reset failed', description: 'Network or server error', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle>Reset Password</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">

              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                <div className="h-1 rounded bg-muted">
                  <div className={`h-1 rounded ${strength <= 1 ? 'bg-destructive w-1/4' : strength === 2 ? 'bg-yellow-500 w-2/4' : strength === 3 ? 'bg-green-500 w-3/4' : 'bg-green-600 w-full'}`} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirm"
                    type={showConfirm ? 'text' : 'password'}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Confirm new password"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-2"
                    onClick={() => setShowConfirm(!showConfirm)}
                  >
                    {showConfirm ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>
              <Button variant="link" className="w-full" onClick={() => navigate('/auth')}>
                Back to Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
