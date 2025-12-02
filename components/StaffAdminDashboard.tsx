"use client";
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, 
  Clock, 
  Plane, 
  User,
  Users,
  LogOut,
  Mail,
  Send,
  Bell,
  FileText,
  Settings,
  BarChart3,
  CheckCircle
} from 'lucide-react';
import { logout } from '@/lib/auth-actions';
import { useRouter } from 'next/navigation';
import Communications from './Communications';
import Timesheets from './Timesheets';
import TravelForms from './Travel_Forms';

type User = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  department: string;
};

type ActiveView = 'dashboard' | 'communications' | 'timesheets' | 'travel' | 'staff-management' | 'approvals' | 'reports';

interface StaffAdminDashboardProps {
  user: User;
}

export default function StaffAdminDashboard({ user }: StaffAdminDashboardProps) {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      setLoading(false);
    }
  };

  const menuItems = [
    {
      id: 'staff-management' as const,
      title: 'Staff Management',
      description: 'Manage staff members and their information',
      icon: Users,
      color: 'bg-indigo-500',
      subItems: [
        { icon: User, label: 'View Staff' },
        { icon: Settings, label: 'Permissions' },
        { icon: FileText, label: 'Records' }
      ]
    },
    {
      id: 'approvals' as const,
      title: 'Approvals',
      description: 'Review and approve timesheets and travel forms',
      icon: CheckCircle,
      color: 'bg-emerald-500',
      subItems: [
        { icon: Clock, label: 'Timesheets' },
        { icon: Plane, label: 'Travel Forms' },
        { icon: FileText, label: 'Pending' }
      ]
    },
    {
      id: 'reports' as const,
      title: 'Reports & Analytics',
      description: 'View department reports and analytics',
      icon: BarChart3,
      color: 'bg-amber-500',
      subItems: [
        { icon: BarChart3, label: 'Dashboard' },
        { icon: Clock, label: 'Time Reports' },
        { icon: Plane, label: 'Travel Reports' }
      ]
    },
    {
      id: 'communications' as const,
      title: 'Communications',
      description: 'Send SMS, emails, and notifications to staff',
      icon: MessageSquare,
      color: 'bg-blue-500',
      subItems: [
        { icon: Send, label: 'SMS' },
        { icon: Mail, label: 'Email' },
        { icon: Bell, label: 'Notifications' }
      ]
    },
    {
      id: 'timesheets' as const,
      title: 'My Timesheets',
      description: 'Create and submit your own timesheets',
      icon: Clock,
      color: 'bg-green-500',
      subItems: [
        { icon: Clock, label: 'New Timesheet' },
        { icon: User, label: 'History' }
      ]
    },
    {
      id: 'travel' as const,
      title: 'My Travel Forms',
      description: 'Submit your own travel and per diem requests',
      icon: Plane,
      color: 'bg-purple-500',
      subItems: [
        { icon: Plane, label: 'New Form' },
        { icon: User, label: 'My Forms' }
      ]
    }
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'staff-management':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Staff Management</h2>
              <p className="text-gray-600 mb-4">Manage staff members, their roles, and permissions.</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800">
                  🚧 Staff management features are coming soon. This will include staff directory, role management, and permission settings.
                </p>
              </div>
            </div>
          </div>
        );
      case 'approvals':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Pending Approvals</h2>
              <p className="text-gray-600 mb-4">Review and approve staff timesheets and travel requests.</p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-amber-800">
                  🚧 Approval workflow features are coming soon. This will include timesheet approvals, travel form reviews, and approval history.
                </p>
              </div>
            </div>
          </div>
        );
      case 'reports':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Reports & Analytics</h2>
              <p className="text-gray-600 mb-4">View department analytics, time tracking reports, and travel summaries.</p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800">
                  🚧 Reporting features are coming soon. This will include department dashboards, time reports, and travel analytics.
                </p>
              </div>
            </div>
          </div>
        );
      case 'communications':
        return <Communications user={{
            id: '',
            first_name: '',
            last_name: '',
            department: ''
        }} />;
      case 'timesheets':
        return <Timesheets user={user} />;
      case 'travel':
        return <TravelForms user={user} />;
      default:
        return (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Active Staff</p>
                    <p className="text-2xl font-bold text-gray-900">--</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-amber-100 p-2 rounded-full">
                    <CheckCircle className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Pending Approvals</p>
                    <p className="text-2xl font-bold text-gray-900">--</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <Clock className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">This Month Hours</p>
                    <p className="text-2xl font-bold text-gray-900">--</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-100 p-2 rounded-full">
                    <Plane className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Travel Requests</p>
                    <p className="text-2xl font-bold text-gray-900">--</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Main Menu Items */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Card key={item.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer group">
                    <div 
                      onClick={() => setActiveView(item.id)}
                      className="space-y-4"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-3 rounded-lg ${item.color} text-white group-hover:scale-110 transition-transform`}>
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm">{item.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {item.subItems.map((subItem, index) => {
                          const SubIcon = subItem.icon;
                          return (
                            <div key={index} className="flex items-center space-x-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              <SubIcon className="h-3 w-3" />
                              <span>{subItem.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header/Welcome Banner */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="bg-indigo-100 p-2 rounded-full">
                  <Users className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Staff Admin Portal
                  </h1>
                  <p className="text-sm text-gray-600">
                    Welcome, {user.first_name} {user.last_name} • {user.department} Department
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm text-gray-900 font-medium">
                  {user.first_name} {user.last_name}
                </p>
                <p className="text-xs text-gray-500">{user.email}</p>
                <p className="text-xs text-indigo-600 font-medium">Staff Administrator</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                disabled={loading}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      {activeView !== 'dashboard' && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-4 py-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveView('dashboard')}
                className="text-indigo-600 hover:text-indigo-800"
              >
                ← Back to Dashboard
              </Button>
              <div className="text-sm text-gray-500">
                {menuItems.find(item => item.id === activeView)?.title}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </div>
    </div>
  );
}