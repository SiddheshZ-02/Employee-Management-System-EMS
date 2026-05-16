import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { SignupForm } from '@/features/auth/components/SignupForm';
import { useAppSelector } from '@/hooks/useAppSelector';

export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { isAuthenticated, user } = useAppSelector(state => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'Admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'Owner') {
        navigate('/owner/dashboard');
      } else {
        navigate('/employee/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const toggleMode = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-3 sm:p-4 md:p-6 bg-background">
      <div className="w-full max-w-sm sm:max-w-md">
        {isLogin ? (
          <LoginForm/>
        ) : (
          <SignupForm onToggleMode={toggleMode} />
        )}
      </div>
    </div>
  );
};
