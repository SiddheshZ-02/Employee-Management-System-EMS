import { NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAppSelector } from '@/hooks/useAppSelector';
import {
  LayoutDashboard,
  Users,
  Building2,
  Clock,
  Calendar,
  User,
  LogOut,
  ClipboardList,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { logoutAsync } from '@/store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { API_BASE_URL } from '@/constant/Config';

const adminNavItems = [
  {
    title: 'Dashboard',
    url: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Employee Management',
    url: '/admin/employees',
    icon: Users,
  },
  {
    title: 'Department Management',
    url: '/admin/departments',
    icon: Building2,
  },
  {
    title: 'Leave Requests',
    url: '/admin/leave-requests',
    icon: ClipboardList,
  },
  {
    title: 'Attendance',
    url: '/admin/attendance',
    icon: Clock,
  },
  {
    title: 'Office Location',
    url: '/admin/office-location',
    icon: Building2,
  },
  {
    title: 'Admin Access',
    url: '/admin/weekoff',
    icon: Calendar,
  },
];

const employeeNavItems = [
  {
    title: 'Dashboard',
    url: '/employee/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Attendance',
    url: '/employee/attendance',
    icon: Clock,
  },
  {
    title: 'Leave Management',
    url: '/employee/leave',
    icon: Calendar,
  },
  {
    title: 'Holidays',
    url: '/employee/holidays',
    icon: Calendar,
  },
  {
    title: 'Profile',
    url: '/employee/profile',
    icon: User,
  },
];

const ownerNavItems = [
  {
    title: 'Dashboard',
    url: '/owner/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Companies',
    url: '/owner/companies',
    icon: Building2,
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  // const location = useLocation();
  // const currentPath = location.pathname;
  const { user, token } = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [pendingLeaves, setPendingLeaves] = useState<number | null>(null);

  useEffect(() => {
    if (!token || user?.role !== 'Admin') {
      setPendingLeaves(null);
      return;
    }

    let cancelled = false;

    const fetchPendingLeaves = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/admin/statistics`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          if (!cancelled) {
            setPendingLeaves(null);
          }
          return;
        }

        const data: {
          success?: boolean;
          leaves?: { pending?: number };
        } = await res.json();

        if (!cancelled) {
          if (data.success && data.leaves && typeof data.leaves.pending === 'number') {
            setPendingLeaves(data.leaves.pending);
          } else {
            setPendingLeaves(null);
          }
        }
      } catch {
        if (!cancelled) {
          setPendingLeaves(null);
        }
      }
    };

    fetchPendingLeaves();
    const interval = setInterval(fetchPendingLeaves, 60000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [token, user?.role]);

  const navItems =
    user?.role === 'Admin'
      ? adminNavItems
      : user?.role === 'Owner'
      ? ownerNavItems
      : employeeNavItems;
  // const isActived = (path: string) => currentPath === path;
  const getNavClass = ({ isActive }: { isActive: boolean }) =>
    `sidebar-item ${isActive ? 'sidebar-item-active' : 'sidebar-item-inactive'}`;

  const handleLogout = async () => {
    await dispatch(logoutAsync());
    navigate('/auth');
  };

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Sidebar className={`bg-gradient-sidebar border-sidebar-border ${collapsed ? 'w-14' : 'w-64'}`}>
      <SidebarHeader className="border-b border-sidebar-border p-3 sm:p-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-sidebar-primary flex-shrink-0">
            <h6 className='text-sidebar-primary-foreground text-sm sm:text-lg font-bold'>EMS</h6>
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-xs sm:text-sm font-semibold text-sidebar-foreground truncate">
                Employee Management System
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/90 text-xs font-medium mb-2">
            {/* {!collapsed && 'Navigation'} */}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navItems.map((item) => {
                const isLeaveRequests = item.title === 'Leave Requests';
                const showBadge =
                  isLeaveRequests && pendingLeaves !== null && pendingLeaves > 0;

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className={getNavClass}>
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        {!collapsed && (
                          <span className="flex items-center gap-2 min-w-0">
                            <span className="truncate">{item.title}</span>
                            {showBadge && (
                              <span className="inline-flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] px-1.5 py-0.5">
                                {pendingLeaves > 99 ? '99+' : pendingLeaves}
                              </span>
                            )}
                          </span>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* User Profile & Logout */}
      <div className="mt-auto border-t border-sidebar-border p-3 sm:p-4">
        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
          <Avatar className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0">
            <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs">
              {user?.name ? getUserInitials(user.name) : 'U'}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-sidebar-foreground truncate">
                {user?.name}
              </p>
              <p className="text-xs text-sidebar-foreground/70 truncate">
                {user?.email}
              </p>
            </div>
          )}
        </div>
        
        <Button
          variant="default"
          size="sm"
          onClick={handleLogout}
          className={`bg-grey-900 hover:bg-red-500 focus-visible:ring ring-gray-300 text-black shadow-md hover:shadow-glow transition-smooth w-full text-xs sm:text-sm ${
            collapsed ? 'px-1 sm:px-2' : ''
          }`}
        >
          <LogOut className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
          {!collapsed && <span className="ml-1 sm:ml-2 truncate">Logout</span>}
        </Button>
      </div>
    </Sidebar>
  );
}
