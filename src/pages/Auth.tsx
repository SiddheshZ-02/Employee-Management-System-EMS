import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { useAppSelector } from '@/hooks/useAppSelector';

export const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { isAuthenticated, user } = useAppSelector(state => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect based on role
      if (user.role.toLowerCase() === 'admin') {
        navigate('/admin/dashboard');
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