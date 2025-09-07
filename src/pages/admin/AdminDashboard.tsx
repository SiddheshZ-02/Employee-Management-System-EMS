import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppSelector } from '@/hooks/useAppSelector';
import { 
  Users, 
  Building2,  
  TrendingUp,
  UserCheck,
  Calendar
} from 'lucide-react';
import { useEffect } from 'react';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { setEmployees } from '@/store/slices/employeeSlice';
import { setDepartments } from '@/store/slices/departmentSlice';

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: string;
}

const StatCard = ({ title, value, description, icon: Icon, trend }: StatCardProps) => (
  <Card className="stat-card">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-foreground">{value}</div>
      <p className="text-xs text-muted-foreground">
        {trend && (
          <span className="text-success font-medium">{trend}</span>
        )}
        {description}
      </p>
    </CardContent>
  </Card>
);

export const AdminDashboard = () => {
  const dispatch = useAppDispatch();
  const { employees } = useAppSelector(state => state.employees);
  const { departments } = useAppSelector(state => state.departments);
  const { user } = useAppSelector(state => state.auth);

  useEffect(() => {
    // Fetch employees
    fetch('https://ems-api-data.onrender.com/employees')
      .then(res => res.json())
      .then(data => dispatch(setEmployees(data)));
    // Fetch departments
    fetch('https://ems-api-data.onrender.com/departments')
      .then(res => res.json())
      .then(data => dispatch(setDepartments(data)));
  }, [dispatch]);

  const activeEmployees = employees.filter(emp => emp.status === 'Active').length;
  // const totalBudget = departments.reduce((sum, dept) => sum + dept.budget, 0);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2  className="text-3xl font-bold text-foreground">
            Welcome back, {user?.name}!
          </h2>
          <p className="text-muted-foreground">
            Here's an overview of your organization's current status.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Employees"
          value={employees.length.toString()}
          description={`${activeEmployees} active employees`}
          icon={Users}
          trend="+2.5%"
        />
        <StatCard
          title="Departments"
          value={departments.length.toString()}
          description="across all divisions"
          icon={Building2}
        />
        {/* <StatCard
          title="Total Budget"
          value={`$${(totalBudget / 1000000).toFixed(1)}M`}
          description="allocated this year"
          icon={DollarSign}
          trend="+12.5%"
        /> */}
        <StatCard
          title="Growth Rate"
          value="23.8%"
          description="employee satisfaction"
          icon={TrendingUp}
          trend="+5.2%"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Recent Employee Activity
            </CardTitle>
            <CardDescription>
              Latest employee registrations and updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {employees.slice(0, 3).map((employee) => (
                <div key={employee.id} className="flex items-center space-x-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <span className="text-sm font-medium">
                      {employee.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {employee.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {employee.position} • {employee.department}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {employee.status === 'Active' ? (
                      <span className="inline-flex items-center rounded-full bg-success-bg px-2 py-1 text-xs font-medium text-success">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Department Overview
            </CardTitle>
            <CardDescription>
              Current department statistics and budgets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {departments.slice(0, 3).map((dept) => (
                <div key={dept.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{dept.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {dept.employeeCount} employees • {dept.manager}
                    </p>
                  </div>
                  {/* <div className="text-right">
                    <p className="text-sm font-medium">
                      ${(dept.budget / 1000).toFixed(0)}K
                    </p>
                    <p className="text-xs text-muted-foreground">Budget</p>
                  </div> */}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};