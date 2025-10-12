import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
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
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { exportUserData } from '../lib/exportData';

const Analytics = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('30d');
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [medicines, setMedicines] = useState([]);
  const [symptoms, setSymptoms] = useState([]);
  const [vitals, setVitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const unsubMedicines = onSnapshot(collection(db, `users/${user.uid}/medicines`), (snapshot) => {
      const meds = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMedicines(meds);
    });

    const unsubSymptoms = onSnapshot(collection(db, `users/${user.uid}/symptoms`), (snapshot) => {
      const syms = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSymptoms(syms);
    });

    const unsubVitals = onSnapshot(collection(db, `users/${user.uid}/vitals`), (snapshot) => {
      const vits = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setVitals(vits);
      setLoading(false);
    });

    return () => {
      unsubMedicines();
      unsubSymptoms();
      unsubVitals();
    };
  }, [user]);

  // Calculate stats
  const calculateStats = () => {
    const now = new Date();
    let startDate;
    if (timeRange === 'all') {
      startDate = new Date(0); // Beginning of time
    } else {
      const timeRangeMs = timeRange === '7d' ? 7 * 24 * 60 * 60 * 1000 :
                          timeRange === '30d' ? 30 * 24 * 60 * 60 * 1000 :
                          timeRange === '90d' ? 90 * 24 * 60 * 60 * 1000 : 0;
      startDate = new Date(now.getTime() - timeRangeMs);
    }

    let totalDoses = 0;
    let takenDoses = 0;

    medicines.forEach(med => {
      if (med.doses) {
        med.doses.forEach(dose => {
          const doseDate = new Date(dose.time);
          if (doseDate >= startDate) {
            totalDoses++;
            if (dose.taken) takenDoses++;
          }
        });
      }
    });

    const adherenceRate = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 0;
    const missedDoses = totalDoses - takenDoses;
    const activeMeds = medicines.length;

    const avgSeverity = symptoms.length > 0 ? symptoms.reduce((sum, s) => sum + (s.severity || 0), 0) / symptoms.length : 0;
    const healthScore = Math.max(0, 100 - Math.round(avgSeverity * 10));

    return {
      adherenceRate,
      missedDoses,
      activeMeds,
      healthScore
    };
  };

  const statsData = calculateStats();

  const stats = [
    {
      title: 'Adherence Rate',
      value: `${statsData.adherenceRate}%`,
      change: '+2.5%', // Mock change, could calculate from previous period
      trend: 'up',
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      title: 'Active Medications',
      value: statsData.activeMeds.toString(),
      change: '+1',
      trend: 'up',
      icon: Pill,
      color: 'text-blue-600'
    },
    {
      title: 'Missed Doses',
      value: statsData.missedDoses.toString(),
      change: '-1',
      trend: 'down',
      icon: AlertCircle,
      color: 'text-orange-600'
    },
    {
      title: 'Health Score',
      value: `${statsData.healthScore}/100`,
      change: '+5',
      trend: 'up',
      icon: Heart,
      color: 'text-purple-600'
    }
  ];

  const generateInsights = () => {
    const insights = [];

    if (statsData.adherenceRate >= 90) {
      insights.push({
        title: 'Excellent Adherence',
        description: `You've maintained ${statsData.adherenceRate}% adherence. Keep up the great work!`,
        type: 'positive',
        icon: TrendingUp
      });
    } else if (statsData.adherenceRate >= 70) {
      insights.push({
        title: 'Good Adherence',
        description: `Your adherence is ${statsData.adherenceRate}%. Try to improve by setting reminders.`,
        type: 'warning',
        icon: TrendingDown
      });
    } else {
      insights.push({
        title: 'Low Adherence',
        description: `Adherence is only ${statsData.adherenceRate}%. Consider reviewing your medication schedule.`,
        type: 'warning',
        icon: AlertCircle
      });
    }

    if (statsData.missedDoses > 5) {
      insights.push({
        title: 'Missed Doses Alert',
        description: `You've missed ${statsData.missedDoses} doses recently. Check your reminders.`,
        type: 'warning',
        icon: AlertCircle
      });
    }

    if (statsData.healthScore < 70) {
      insights.push({
        title: 'Health Score Low',
        description: `Your health score is ${statsData.healthScore}/100. Monitor symptoms closely.`,
        type: 'warning',
        icon: Heart
      });
    } else {
      insights.push({
        title: 'Good Health',
        description: `Health score is ${statsData.healthScore}/100. You're doing well!`,
        type: 'positive',
        icon: Heart
      });
    }

    if (insights.length === 0) {
      insights.push({
        title: 'No Data',
        description: 'Add some medications and health data to see insights.',
        type: 'suggestion',
        icon: Activity
      });
    }

    return insights.slice(0, 3); // Limit to 3
  };

  const insights = generateInsights();

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
            <p className="text-muted-foreground">Track your health progress and medication adherence</p>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your analytics data...</p>
          </div>
        </div>
      </div>
    );
  }

  const hasData = medicines.length > 0 || symptoms.length > 0 || vitals.length > 0;

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
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              setShowProgressModal(true);
              setProgress(0);
              setProgressText('Starting export...');
              try {
                await exportUserData(user, setProgress, setProgressText);
              } catch (error) {
                console.error('Export failed:', error);
                setProgressText('Export failed');
              } finally {
                setTimeout(() => setShowProgressModal(false), 1000);
              }
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {!hasData ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
            <p className="text-muted-foreground mb-4">
              Add some medications, symptoms, or health data to see your analytics.
            </p>
            <div className="space-x-2">
              <Button variant="outline" onClick={() => navigate('/medications/add')}>
                Add Medication
              </Button>
              <Button variant="outline" onClick={() => navigate('/monitor')}>
                Track Health
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
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
        </>
      )}

      {/* Export Progress Modal */}
      <Dialog open={showProgressModal} onOpenChange={setShowProgressModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exporting Data</DialogTitle>
            <DialogDescription>Please wait while we prepare your health data export.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground">{progressText}</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Analytics;
