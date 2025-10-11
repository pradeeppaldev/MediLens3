import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Layout from '../components/Layout';
import {
  Camera,
  Zap,
  Shield,
  BarChart3,
  Plus,
  Upload,
  FileText,
  Bell,
  Pill
} from 'lucide-react';
import AnalyticsChart from '../components/AnalyticsChart';

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Prescription Scan',
      description: 'Upload and scan prescriptions with advanced OCR technology',
      icon: Camera,
      action: () => navigate('/prescriptions'),
    },
    {
      title: 'Smart Reminders',
      description: 'Never miss a dose with AI-powered medication reminders',
      icon: Bell,
      action: () => navigate('/reminders'),
    },
    {
      title: 'Medicine Database',
      description: 'Access comprehensive information about your medications',
      icon: FileText,
      action: () => navigate('/medications'),
    },
    {
      title: 'Health Analytics',
      description: 'Track your health progress with detailed analytics',
      icon: BarChart3,
      action: () => navigate('/analytics'),
    },
  ];

  const quickActions = [
    {
      label: 'Scan Prescription',
      icon: Upload,
      variant: 'default',
      onClick: () => navigate('/prescriptions/new'),
    },
    {
      label: 'Add Medication',
      icon: Plus,
      variant: 'outline',
      onClick: () => navigate('/medications/new'),
    },
  ];

  return (
    <Layout
      title="Welcome to MediLens"
      description="Your smart prescription and medication management platform"
      showHero={true}
      heroKeyword="healthcare"
      actions={quickActions}
    >
      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={feature.action} variant="ghost" className="w-full">
                  Learn More
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Analytics Section */}
      <div className="mt-12">
        <Card>
          <CardHeader>
            <CardTitle>Health Analytics</CardTitle>
            <CardDescription>
              Track your medication adherence and health progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AnalyticsChart />
          </CardContent>
        </Card>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="rounded-full bg-primary/10 p-3 mr-4">
                <Pill className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">24</p>
                <p className="text-sm text-muted-foreground">Medications</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="rounded-full bg-primary/10 p-3 mr-4">
                <Bell className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">98%</p>
                <p className="text-sm text-muted-foreground">Adherence Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="rounded-full bg-primary/10 p-3 mr-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-sm text-muted-foreground">Active Reminders</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Home;