import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Pill,
  Calendar,
  BarChart3,
  Brain,
  Settings,
  User,
  FileText,
  Bell,
  Stethoscope,
  Heart,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { theme } = useTheme();
  const { user } = useAuth();

  const navigationItems = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Medications', href: '/medications', icon: Pill },
    { name: 'Reminders', href: '/reminders', icon: Bell },
    { name: 'All Documents', href: '/documents', icon: FileText },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Health Monitor', href: '/monitor', icon: Activity },
    { name: 'Doctors', href: '/doctors', icon: Stethoscope },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-40">
      <div className="flex flex-col flex-grow border-r bg-card/80 backdrop-blur-lg">
        <div className="flex items-center h-16 px-4 border-b shrink-0">
          <div className="flex items-center">
            <div className="rounded-full bg-gradient-to-r from-primary to-secondary p-2 shadow-lg">
              <Heart className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="ml-2 text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              MediLens
            </span>
          </div>
        </div>

        <div className="flex flex-col flex-1 overflow-y-auto pt-5 pb-4">
          <nav className="flex-1 px-2 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-md'
                      : 'text-foreground hover:bg-accent hover:text-accent-foreground hover:shadow-sm'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto p-4 border-t">
            <div className="flex items-center">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Profile"
                  className="rounded-full h-10 w-10 shadow"
                />
              ) : (
                <div className="bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-full h-10 w-10 flex items-center justify-center shadow">
                  {user?.displayName ? user.displayName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <div className="ml-3">
                <p className="text-sm font-medium">
                  {user?.displayName || 'User'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user?.email || 'user@example.com'}
                </p>
              </div>
            </div>

            <Link to="/settings">
              <Button variant="outline" className="w-full mt-4 transition-all duration-200 hover:shadow-md">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
