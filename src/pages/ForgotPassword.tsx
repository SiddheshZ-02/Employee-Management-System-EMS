import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/constant/Config';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [emailValid, setEmailValid] = useState(true);
  const [attempted, setAttempted] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAttempted(true);

    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    setEmailValid(isValid);
    if (!email || !isValid) {
      toast({ title: 'Error', description: 'Please enter a valid email', variant: 'destructive' });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg = data?.message || 'Unable to process request';
        toast({ title: 'Request failed', description: msg, variant: 'destructive' });
        return;
      }

      const token = data?.resetToken || data?.token || '';
      const exists = typeof data?.exists === 'boolean' ? data.exists : !!token;
      if (!exists) {
        toast({ title: 'Email address not found', description: 'Please check and try again', variant: 'destructive' });
        setEmail('');
        return;
      }

      sessionStorage.setItem('resetEmail', email);
      if (token) {
        sessionStorage.setItem('resetToken', token);
        navigate(`/auth/reset-password?token=${encodeURIComponent(token)}`);
      } else {
        navigate('/auth/reset-password');
      }

      toast({ title: 'Email sent', description: 'Reset instructions have been sent if the email exists' });
    } catch {
      toast({ title: 'Request failed', description: 'Network or server error', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle>Forgot Password</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    const v = e.target.value;
                    setEmail(v);
                    setEmailValid(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v));
                  }}
                  className={`${attempted && !emailValid ? 'border-destructive' : ''}`}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading || !emailValid || !email}>
                {loading ? 'Sending...' : 'Send Reset Instructions'}
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