import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAppSelector } from '@/hooks/useAppSelector';
import { loginAsync } from '@/store/slices/authSlice';
import { store } from '@/store';
import { toast } from '@/hooks/use-toast';
import { Eye, EyeOff, LogIn } from 'lucide-react';

// interface LoginFormProps {
//   onToggleMode: () => void;
// }

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [attemptedLogin, setAttemptedLogin] = useState(false);
  
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector(state => state.auth);
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAttemptedLogin(true);
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    try {
      await dispatch(loginAsync(email, password));
      
      // Check if login was successful
      const authState = store.getState().auth;
      if (authState.isAuthenticated) {
        toast({
          title: "Welcome back!",
          description: `Successfully logged in as ${authState.user?.role}`,
        });
        
        // Navigate based on role
        if (authState.user?.role === 'Admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/employee/dashboard');
        }
      } else {
        toast({
          title: "Invalid credentials",
          description: "Please check your email and password",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: "An error occurred during login",
        variant: "destructive"
      });
    }
  };

  const fillDemoCredentials = (role: 'admin' | 'employee') => {
    if (role === 'admin') {
      setEmail('admin@company.com');
      setPassword('admin123');
    } else {
      setEmail('employee@company.com');
      setPassword('employee123');
    }
  };

  return (
    <Card className="w-full shadow-lg border-card-border">
      <CardHeader className="space-y-2 sm:space-y-1 text-center px-4 sm:px-6 pt-4 sm:pt-6">
        <CardTitle className="text-xl sm:text-2xl font-bold">Welcome Back</CardTitle>
        <CardDescription className="text-sm sm:text-base">
          Sign in to your account to continue
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-4 sm:px-6 pb-4 sm:pb-6">
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`h-9 sm:h-10 ${attemptedLogin && !email ? 'border-destructive' : ''}`}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`pr-10 ${attemptedLogin && !password ? 'border-destructive' : ''}`}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-2 sm:px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-9 sm:h-10 text-sm sm:text-base"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 sm:h-4 sm:w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span className="text-xs sm:text-sm">Signing in...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <LogIn className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-sm sm:text-base">Sign In</span>
              </div>
            )}
          </Button>
        </form>

        <div className="space-y-2 sm:space-y-3">
          <p className="text-xs sm:text-sm text-muted-foreground text-center">Demo accounts:</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-8 sm:h-9 text-xs sm:text-sm"
              onClick={() => fillDemoCredentials('admin')}
            >
              Admin Demo
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-8 sm:h-9 text-xs sm:text-sm"
              onClick={() => fillDemoCredentials('employee')}
            >
              Employee Demo
            </Button>
          </div>
        </div>

        {/* <div className="text-center">
          <Button
            variant="link"
            onClick={onToggleMode}
            className="text-sm"
          >
            Don't have an account? Sign up
          </Button>
        </div> */}
      </CardContent>
    </Card>
  );
};