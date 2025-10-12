import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle } from 'lucide-react';
import {
  BarChart3,
  Activity,
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  Download,
  Pill,
  Heart,
  Shield
} from 'lucide-react';
import AnalyticsChart from '../components/AnalyticsChart';

const Analytics = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('30d');
  const [dateRange, setDateRange] = useState({ from: null, to: null });

  // Mock analytics data
  const stats = [
    {
      title: 'Adherence Rate',
      value: '98%',
      change: '+2.5%',
      trend: 'up',
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      title: 'Active Medications',
      value: '12',
      change: '+1',
      trend: 'up',
      icon: Pill,
      color: 'text-blue-600'
    },
    {
      title: 'Missed Doses',
      value: '2',
      change: '-1',
      trend: 'down',
      icon: AlertCircle,
      color: 'text-orange-600'
    },
    {
      title: 'Health Score',
      value: '87/100',
      change: '+5',
      trend: 'up',
      icon: Heart,
      color: 'text-purple-600'
    }
  ];

  const insights = [
    {
      title: 'Excellent Adherence',
      description: 'You\'ve maintained 98% adherence this month. Keep up the great work!',
      type: 'positive',
      icon: TrendingUp
    },
    {
      title: 'Evening Doses',
      description: 'Most missed doses occur in the evening. Consider setting phone alarms.',
      type: 'warning',
      icon: TrendingDown
    },
    {
      title: 'Hydration Reminder',
      description: 'Consider adding hydration tracking to complement your medication routine.',
      type: 'suggestion',
      icon: Activity
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">Track your health progress and medication adherence</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="all">All time</option>
          </select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className={`text-sm ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change} {stat.trend === 'up' ? 'from last month' : 'from last month'}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full bg-accent/10 ${stat.color}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Adherence Trend</CardTitle>
          <CardDescription>
            Your medication adherence over the selected time period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AnalyticsChart timeRange={timeRange} />
        </CardContent>
      </Card>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Health Insights
          </CardTitle>
          <CardDescription>AI-powered recommendations based on your data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.map((insight, index) => {
              const Icon = insight.icon;
              return (
                <div key={index} className={`p-4 rounded-lg border ${insight.type === 'positive' ? 'bg-green-50 border-green-200' : insight.type === 'warning' ? 'bg-orange-50 border-orange-200' : 'bg-blue-50 border-blue-200'}`}>
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${insight.type === 'positive' ? 'bg-green-100' : insight.type === 'warning' ? 'bg-orange-100' : 'bg-blue-100'}`}>
                      <Icon className={`h-5 w-5 ${insight.type === 'positive' ? 'text-green-600' : insight.type === 'warning' ? 'text-orange-600' : 'text-blue-600'}`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{insight.title}</h4>
                      <p className="text-sm text-muted-foreground">{insight.description}</p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${insight.type === 'positive' ? 'bg-primary text-primary-foreground' : insight.type === 'warning' ? 'bg-secondary text-secondary-foreground' : 'bg-background border border-input text-foreground'}`}>
                      {insight.type.charAt(0).toUpperCase() + insight.type.slice(1)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filter Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Medication Type</label>
              <select className="px-3 py-2 border border-input rounded-md bg-background text-foreground w-full">
                <option value="all">All Medications</option>
                <option value="pain">Pain Relief</option>
                <option value="heart">Heart Health</option>
                <option value="diabetes">Diabetes</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Health Metric</label>
              <select className="px-3 py-2 border border-input rounded-md bg-background text-foreground w-full">
                <option value="adherence">Adherence Rate</option>
                <option value="doses">Total Doses</option>
                <option value="missed">Missed Doses</option>
                <option value="score">Health Score</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Compare With</label>
              <select className="px-3 py-2 border border-input rounded-md bg-background text-foreground w-full">
                <option value="previous">Previous Period</option>
                <option value="average">Historical Average</option>
                <option value="goal">Personal Goal</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button className="transition-all duration-200 hover:shadow-lg">
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
