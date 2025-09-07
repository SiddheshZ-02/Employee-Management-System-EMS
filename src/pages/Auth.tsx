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
    <div style={{
     height: '100%',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#fff',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 1
    }}>
      <div className="w-full max-w-md">
        {isLogin ? (
          <LoginForm/>
        ) : (
          <SignupForm onToggleMode={toggleMode} />
        )}
      </div>
    </div>
  );
};