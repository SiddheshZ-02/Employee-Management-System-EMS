import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppSelector } from '@/hooks/useAppSelector';
import { Clock, Calendar, User, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const EmployeeDashboard = () => {
  const { user } = useAppSelector(state => state.auth);
  const navigate = useNavigate();
  
  return (
    <div className="w-full min-h-full bg-background">
      <div className="w-full h-full p-4 md:p-6 lg:p-8">
        <div className="space-y-6 animate-fade-in w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-slide-in-left">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Welcome, {user?.name}! 👋
          </h2>
          <p className="text-muted-foreground mt-2">Here's your daily overview and quick actions</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground shrink-0">
          <Calendar className="h-4 w-4" />
          <span className="hidden lg:inline">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
          <span className="lg:hidden">
            {new Date().toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            })}
          </span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="animate-fade-in" style={{animationDelay: '100ms'}}>
          <Card className="hover-lift transition-smooth border-0 shadow-lg bg-gradient-to-br from-card to-card/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hours Today</CardTitle>
              <div className="p-2 rounded-full bg-blue-500/10">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">8.5</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 shrink-0"></span>
                <span className="truncate">Normal schedule</span>
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div className="animate-fade-in" style={{animationDelay: '200ms'}}>
          <Card className="hover-lift transition-smooth border-0 shadow-lg bg-gradient-to-br from-card to-card/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Leave Balance</CardTitle>
              <div className="p-2 rounded-full bg-green-500/10">
                <Calendar className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">12</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 shrink-0"></span>
                <span className="truncate">Days remaining</span>
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="animate-fade-in" style={{animationDelay: '300ms'}}>
          <Card className="hover-lift transition-smooth border-0 shadow-lg bg-gradient-to-br from-card to-card/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <div className="p-2 rounded-full bg-purple-500/10">
                <CheckCircle className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">22/23</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0"></span>
                <span className="truncate">Days attended</span>
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="animate-fade-in" style={{animationDelay: '400ms'}}>
          <Card className="hover-lift transition-smooth border-0 shadow-lg bg-gradient-to-br from-card to-card/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Performance</CardTitle>
              <div className="p-2 rounded-full bg-orange-500/10">
                <User className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">A+</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0"></span>
                <span className="truncate">Current rating</span>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="hover-lift transition-smooth border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-primary/10">
                <CheckCircle className="h-5 w-5 text-primary" />
              </div>
              <span className="truncate">Quick Actions</span>
            </CardTitle>
            <CardDescription>Common tasks and actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              className="w-full justify-start hover-lift transition-smooth bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white" 
              onClick={() => navigate('/employee/attendance')}
            >
              <Clock className="h-4 w-4 mr-2 shrink-0" />
              <span className="truncate">Check In/Out</span>
            </Button>
            <Button 
              className="w-full justify-start hover-lift transition-smooth bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white" 
              onClick={() => navigate('/employee/leave')}
            >
              <Calendar className="h-4 w-4 mr-2 shrink-0" />
              <span className="truncate">Request Leave</span>
            </Button>
            <Button 
              className="w-full justify-start hover-lift transition-smooth bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white" 
              onClick={() => navigate('/employee/profile')}
            >
              <User className="h-4 w-4 mr-2 shrink-0" />
              <span className="truncate">Update Profile</span>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover-lift transition-smooth border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-green-500/10">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <span className="truncate">Recent Activity</span>
            </CardTitle>
            <CardDescription>Your recent actions and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                <div className="p-2 rounded-full bg-green-500/10 shrink-0">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1 space-y-1 min-w-0">
                  <p className="text-sm font-medium truncate">Clocked in at 9:00 AM</p>
                  <p className="text-sm text-muted-foreground">Today</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                <div className="p-2 rounded-full bg-blue-500/10 shrink-0">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 space-y-1 min-w-0">
                  <p className="text-sm font-medium truncate">Leave request approved</p>
                  <p className="text-sm text-muted-foreground">Yesterday</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
                <div className="p-2 rounded-full bg-purple-500/10 shrink-0">
                  <User className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1 space-y-1 min-w-0">
                  <p className="text-sm font-medium truncate">Profile updated</p>
                  <p className="text-sm text-muted-foreground">2 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
        </div>
      </div>
    </div>
  );
};