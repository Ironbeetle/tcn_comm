"use client";
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  MessageSquare, 
  Clock, 
  User,
  LogOut,
  TrendingUp,
  Users,
  FileText,
  Calendar,
  DollarSign,
  PieChart,
  Activity
} from 'lucide-react';
import { logout } from '@/lib/auth-actions';
import { useRouter } from 'next/navigation';
import Communications from '@/components/Communications';
import Timesheets from '@/components/Timesheets';

type User = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  department: string;
};

type ActiveView = 'dashboard' | 'reports' | 'communications' | 'timesheets';

interface CnCDashboardProps {
  user: User;
}

export default function CnCDashboard({ user }: CnCDashboardProps) {
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
      id: 'reports' as const,
      title: 'Reports & Analytics',
      description: 'View comprehensive reports and analytics',
      icon: BarChart3,
      color: 'bg-purple-500',
      subItems: [
        { icon: TrendingUp, label: 'Performance' },
        { icon: PieChart, label: 'Demographics' },
        { icon: DollarSign, label: 'Financial' }
      ]
    },
    {
      id: 'communications' as const,
      title: 'Communications',
      description: 'Manage community communications',
      icon: MessageSquare,
      color: 'bg-blue-500',
      subItems: [
        { icon: MessageSquare, label: 'Messages' },
        { icon: Users, label: 'Community' },
        { icon: FileText, label: 'Announcements' }
      ]
    },
    {
      id: 'timesheets' as const,
      title: 'Timesheets',
      description: 'Review and approve staff timesheets',
      icon: Clock,
      color: 'bg-green-500',
      subItems: [
        { icon: Clock, label: 'Pending' },
        { icon: Calendar, label: 'Schedule' },
        { icon: Activity, label: 'Reports' }
      ]
    }
  ];

  const renderContent = () => {
    switch (activeView) {
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
        return <Communications user={user} />;
      case 'timesheets':
        return <Timesheets user={user} />;
      default:
        return (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Staff</p>
                    <p className="text-2xl font-bold text-gray-900">24</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending Timesheets</p>
                    <p className="text-2xl font-bold text-gray-900">7</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Travel Forms</p>
                    <p className="text-2xl font-bold text-gray-900">12</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Monthly Budget</p>
                    <p className="text-2xl font-bold text-gray-900">$45K</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Main Menu */}
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

            {/* Recent Activity */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">New travel form submitted</p>
                      <p className="text-xs text-gray-500">John Smith - 2 hours ago</p>
                    </div>
                  </div>
                  <Badge variant="outline">Pending</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 p-2 rounded-full">
                      <Clock className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Timesheet approved</p>
                      <p className="text-xs text-gray-500">Mary Johnson - 4 hours ago</p>
                    </div>
                  </div>
                  <Badge className="bg-green-500">Approved</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center space-x-3">
                    <div className="bg-purple-100 p-2 rounded-full">
                      <MessageSquare className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Community message sent</p>
                      <p className="text-xs text-gray-500">Sarah Wilson - 1 day ago</p>
                    </div>
                  </div>
                  <Badge className="bg-purple-500">Sent</Badge>
                </div>
              </div>
            </Card>
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
                <div className="bg-purple-100 p-2 rounded-full">
                  <User className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Welcome, Chief {user.first_name}
                  </h1>
                  <p className="text-sm text-gray-600">
                    Chief & Council Portal • Executive Dashboard
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
                className="text-purple-600 hover:text-purple-800"
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