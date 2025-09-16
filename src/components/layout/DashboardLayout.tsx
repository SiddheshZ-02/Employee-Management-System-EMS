import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAppSelector } from '@/hooks/useAppSelector';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { loadUserFromStorage } from '@/store/slices/authSlice';

export const DashboardLayout = () => {
  const { isAuthenticated, user } = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    // Try to load user from localStorage on app start
    dispatch(loadUserFromStorage());
  }, [dispatch]);

  useEffect(() => {
    // Redirect to auth if not authenticated
    if (!isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated || !user) {
    return null; // Or a loading spinner
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col min-w-0 w-full">
          {/* Header */}
          <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center px-4 gap-4 w-full">
              <SidebarTrigger className="flex md:hidden" />
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-foreground truncate">
                  {user.role} Dashboard
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 w-full">
            <div className="w-full h-full">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};