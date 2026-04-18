import { NavLink, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
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
  ChevronRight,
  CreditCard,
  Ticket,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import logo from '@/assets/svg/EMS.svg';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { logoutAsync } from '@/store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { API_BASE_URL } from '@/constant/Config';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { getSupportAnalytics } from '@/services/api/ownerApi';

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
    url: '/admin/access',
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
  {
    title: 'Billing',
    url: '/owner/billing',
    icon: CreditCard,
  },
  {
    title: 'Plans',
    url: '/owner/plans',
    icon: ClipboardList,
  },
  {
    title: 'Support',
    url: '/owner/support',
    icon: Ticket,
  },
  {
    title: 'Settings',
    url: '/owner/settings',
    icon: Settings,
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const { user, token } = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [pendingLeaves, setPendingLeaves] = useState<number | null>(null);
  const [openTickets, setOpenTickets] = useState<number | null>(null);

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

  useEffect(() => {
    if (!token || user?.role !== 'Owner') {
      setOpenTickets(null);
      return;
    }

    let cancelled = false;

    const fetchOpenTickets = async () => {
      try {
        const response = await getSupportAnalytics();
        
        if (!cancelled && response.success) {
          setOpenTickets(response.data.openTickets);
        }
      } catch {
        if (!cancelled) {
          setOpenTickets(null);
        }
      }
    };

    fetchOpenTickets();
    const interval = setInterval(fetchOpenTickets, 60000);

    const handleTicketResolved = () => {
      fetchOpenTickets();
    };

    window.addEventListener('ticketResolved', handleTicketResolved);

    return () => {
      cancelled = true;
      clearInterval(interval);
      window.removeEventListener('ticketResolved', handleTicketResolved);
    };
  }, [token, user?.role]);

  const navItems =
    user?.role === 'Admin'
      ? adminNavItems
      : user?.role === 'Owner'
      ? ownerNavItems
      : employeeNavItems;

  const handleLogout = async () => {
    await dispatch(logoutAsync());
    navigate('/auth');
  };

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Sidebar className={cn(
      "border-r border-sidebar-border transition-all duration-300 ease-in-out bg-card",
      collapsed ? "w-[70px]" : "w-[260px]"
    )}>
      <TooltipProvider delayDuration={0}>
        <SidebarHeader className="h-[70px]  px-4 flex items-center justify-center">
          <div className="flex items-center gap-3 w-full">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-transparent flex-shrink-0 transition-transform duration-300 hover:scale-110 overflow-hidden">
              <img src={logo} alt="EMS Logo" className="h-full w-full object-contain" />
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0 overflow-hidden animate-in fade-in slide-in-from-left-4 duration-300">
                <span className="text-sm font-bold text-foreground leading-none mb-1">
                  EMS Portal
                </span>
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                  {user?.role} Workspace
                </span>
              </div>
            )}
          </div>
        </SidebarHeader>

        <SidebarContent className="px-3 py-6 scrollbar-hide overflow-y-auto">
          <SidebarGroup className="p-0">
            <SidebarGroupContent>
              <SidebarMenu className="gap-1.5">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.url;
                  const isLeaveRequests = item.title === 'Leave Requests';
                  const isSupport = item.title === 'Support';
                  const showLeaveBadge = isLeaveRequests && pendingLeaves !== null && pendingLeaves > 0;
                  const showTicketBadge = isSupport && openTickets !== null && openTickets > 0;

                  const menuItem = (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild tooltip={item.title}>
                        <NavLink
                          to={item.url}
                          className={cn(
                            "group relative flex items-center h-11 px-3 rounded-lg transition-all duration-200 ease-in-out",
                            isActive 
                              ? "bg-accent text-primary-foreground shadow-md shadow-primary/25" 
                              : "text-muted-foreground hover:bg-primary/10 hover:text-primary hover:shadow-sm"
                          )}
                        >
                          <item.icon className={cn(
                            "h-[18px] w-[18px] flex-shrink-0 transition-transform duration-200 group-hover:scale-110",
                            isActive ? "text-accent-foreground" : "text-muted-foreground group-hover:text-primary"
                          )} />
                          
                          {!collapsed && (
                            <div className="flex items-center justify-between flex-1 ml-3 min-w-0 animate-in fade-in slide-in-from-left-2 duration-300">
                              <span className="text-sm font-semibold truncate">
                                {item.title}
                              </span>
                              
                              <div className="flex items-center gap-2">
                                {showLeaveBadge && (
                                  <span className="inline-flex items-center justify-center h-5 min-w-[20px] rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 animate-pulse shadow-sm shadow-destructive/20">
                                    {pendingLeaves > 99 ? '99+' : pendingLeaves}
                                  </span>
                                )}
                                {showTicketBadge && (
                                  <span className="inline-flex items-center justify-center h-5 min-w-[20px] rounded-full bg-amber-500 text-white text-[10px] font-bold px-1.5 animate-pulse shadow-sm shadow-amber-500/20">
                                    {openTickets > 99 ? '99+' : openTickets}
                                  </span>
                                )}
                                {isActive && (
                                  <ChevronRight className="h-3 w-3 opacity-60" />
                                )}
                              </div>
                            </div>
                          )}
                          
                          {isActive && collapsed && (
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-foreground rounded-l-full shadow-glow" />
                          )}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );

                  if (collapsed) {
                    return (
                      <Tooltip key={item.title}>
                        <TooltipTrigger asChild>
                          {menuItem}
                        </TooltipTrigger>
                        <TooltipContent side="right" sideOffset={10} className="font-semibold text-xs">
                          {item.title}
                          {showLeaveBadge && ` (${pendingLeaves} pending)`}
                          {showTicketBadge && ` (${openTickets} open)`}
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  return menuItem;
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <div className="mt-auto border-t border-sidebar-border/50 p-4 space-y-4">
          <div className={cn(
            "flex items-center gap-3",
            collapsed ? "justify-center" : "px-1"
          )}>
            <div className="relative group cursor-pointer">
              <Avatar className="h-9 w-9 border-2 border-background shadow-sm transition-transform group-hover:scale-105">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                  {user?.name ? getUserInitials(user.name) : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-emerald-500 border-2 border-background rounded-full" />
            </div>
            
            {!collapsed && (
              <div className="flex flex-col min-w-0 flex-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <p className="text-sm font-bold text-foreground truncate leading-tight">
                  {user?.name}
                </p>
                <p className="text-[11px] text-muted-foreground truncate font-medium">
                  {user?.email}
                </p>
              </div>
            )}
          </div>
          
          <div className="flex flex-col gap-2">
            <Button
              variant="destructive"
              size={collapsed ? "icon" : "sm"}
              onClick={handleLogout}
              className={cn(
                "w-full font-bold shadow-md shadow-destructive/10 transition-all duration-200 active:scale-95 hover:bg-destructive/90 hover:shadow-destructive/20",
                collapsed ? "h-10 w-10 p-0" : "h-9 text-xs justify-start gap-3"
              )}
            >
              <LogOut className={cn("h-4 w-4", !collapsed && "ml-0")} />
              {!collapsed && <span>Logout</span>}
            </Button>
          </div>
        </div>
      </TooltipProvider>
    </Sidebar>
  );
}
