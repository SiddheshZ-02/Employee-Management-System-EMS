import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { signup,  type UserRole } from '@/store/slices/authSlice';
import { toast } from '@/hooks/use-toast';
import { UserPlus, Eye, EyeOff } from 'lucide-react';

interface SignupFormProps {
  onToggleMode: () => void;
}

export const SignupForm = ({ onToggleMode }: SignupFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '' as UserRole | '',
    department: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const departments = [
    'Engineering',
    'Product',
    'Sales',
    'Marketing',
    'HR',
    'Finance',
    'Operations',
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    const { name, email, password, confirmPassword, role, department } = formData;
    
    if (!name || !email || !password || !confirmPassword || !role || !department) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return false;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return false;
    }

    if (password.length < 6) {
      toast({
        title: "Weak password",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAttemptedSubmit(true);
    
    if (!validateForm()) return;

    const { name, email, password, role, department } = formData;
    
    dispatch(signup({
      name,
      email,
      password,
      role: role as UserRole,
      department,
    }));

    toast({
      title: "Account created!",
      description: `Welcome ${name}! Your ${role} account has been created.`,
    });

    // Navigate based on role
    if (role === 'Admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/employee/dashboard');
    }
  };

  const getFieldError = (field: string) => {
    return attemptedSubmit && !formData[field as keyof typeof formData];
  };

  return (
    <Card className="w-full shadow-lg border-card-border">
      <CardHeader className="space-y-2 sm:space-y-1 text-center px-4 sm:px-6 pt-4 sm:pt-6">
        <CardTitle className="text-xl sm:text-2xl font-bold">Create Account</CardTitle>
        <CardDescription className="text-sm sm:text-base">
          Join our platform and get started today
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-4 sm:px-6 pb-4 sm:pb-6">
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
            <Input
              id="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`h-9 sm:h-10 ${getFieldError('name') ? 'border-destructive' : ''}`}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`h-9 sm:h-10 ${getFieldError('email') ? 'border-destructive' : ''}`}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-medium">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => handleInputChange('role', value)}
              >
                <SelectTrigger className={`h-9 sm:h-10 ${getFieldError('role') ? 'border-destructive' : ''}`}>
                  <SelectValue placeholder="Select role" className="text-sm" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Employee">Employee</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department" className="text-sm font-medium">Department</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => handleInputChange('department', value)}
              >
                <SelectTrigger className={`h-9 sm:h-10 ${getFieldError('department') ? 'border-destructive' : ''}`}>
                  <SelectValue placeholder="Select dept." className="text-sm" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`pr-10 h-9 sm:h-10 ${getFieldError('password') ? 'border-destructive' : ''}`}
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`pr-10 h-9 sm:h-10 ${getFieldError('confirmPassword') ? 'border-destructive' : ''}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-2 sm:px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full h-9 sm:h-10 text-sm sm:text-base">
            <div className="flex items-center gap-2">
              <UserPlus className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-sm sm:text-base">Create Account</span>
            </div>
          </Button>
        </form>

        <div className="text-center pt-2 sm:pt-0">
          <Button
            variant="link"
            onClick={onToggleMode}
            className="text-xs sm:text-sm p-0 h-auto"
          >
            Already have an account? Sign in
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};