import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Bell, Shield, Palette, Database, User, Key } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { db, doc, updateDoc, onSnapshot } from '../lib/firebase';

const Settings = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [emailNotifications, setEmailNotifications] = useState(false);

  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        setEmailNotifications(docSnap.data().emailNotifications || false);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const handleEmailToggle = async () => {
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        emailNotifications: !emailNotifications
      });
      setEmailNotifications(!emailNotifications);
    } catch (error) {
      console.error('Error updating email notifications:', error);
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className="min-h-screen bg-background dark:bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-card dark:bg-card rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-border dark:border-border">
            <div className="flex items-center">
              <SettingsIcon className="h-6 w-6 text-accent mr-2" />
              <h1 className="text-2xl font-bold text-foreground dark:text-foreground">Settings</h1>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">Manage your account settings and preferences</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
            <div className="md:col-span-1">
              <nav className="space-y-1">
                <a href="#" className="flex items-center px-3 py-2 text-sm font-medium bg-muted dark:bg-muted text-foreground dark:text-foreground rounded-md">
                  <User className="h-4 w-4 mr-3" />
                  Account
                </a>
                <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted dark:hover:bg-muted hover:text-foreground dark:hover:text-foreground rounded-md">
                  <Shield className="h-4 w-4 mr-3" />
                  Security
                </a>
                <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted dark:hover:bg-muted hover:text-foreground dark:hover:text-foreground rounded-md">
                  <Bell className="h-4 w-4 mr-3" />
                  Notifications
                </a>
                <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted dark:hover:bg-muted hover:text-foreground dark:hover:text-foreground rounded-md">
                  <Palette className="h-4 w-4 mr-3" />
                  Appearance
                </a>
                <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted dark:hover:bg-muted hover:text-foreground dark:hover:text-foreground rounded-md">
                  <Database className="h-4 w-4 mr-3" />
                  Data & Privacy
                </a>
              </nav>
            </div>

            <div className="md:col-span-2">
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-medium text-foreground dark:text-foreground">Account Settings</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Update your account information and preferences</p>
                </div>

                <div className="bg-muted dark:bg-muted p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-foreground dark:text-foreground">Theme</h3>
                      <p className="text-sm text-muted-foreground">Choose your preferred color scheme</p>
                    </div>
                    <div className="flex items-center">
                      <span className="mr-2 text-sm text-muted-foreground">Light</span>
                      <button 
                        className="relative inline-flex h-6 w-11 items-center rounded-full bg-accent"
                        onClick={toggleTheme}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${isDark ? 'translate-x-6' : 'translate-x-1'}`}></span>
                      </button>
                      <span className="ml-2 text-sm text-muted-foreground">Dark</span>
                    </div>
                  </div>
                </div>

                <div className="bg-muted dark:bg-muted p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-foreground dark:text-foreground">Email Notifications</h3>
                      <p className="text-sm text-muted-foreground">Receive email updates about your account</p>
                    </div>
                    <button 
                      className="relative inline-flex h-6 w-11 items-center rounded-full bg-accent"
                      onClick={handleEmailToggle}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${emailNotifications ? 'translate-x-6' : 'translate-x-1'}`}></span>
                    </button>
                  </div>
                </div>

                <div className="bg-muted dark:bg-muted p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-foreground dark:text-foreground">Two-factor Authentication</h3>
                      <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-muted-foreground">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-1"></span>
                    </button>
                  </div>
                </div>

                <div className="pt-4">
                  <button className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none">
                    <Key className="h-4 w-4 mr-2" />
                    Change Password
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;