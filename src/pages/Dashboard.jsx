import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import {
  Pill,
  Clock,
  Calendar,
  Upload,
  Plus,
  MessageSquare,
  Download,
  Bell,
  CheckCircle,
  AlertCircle,
  FileText,
  BarChart3,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db, registerForNotifications } from '../lib/firebase';
import { collection, getDocs, addDoc, query, orderBy, updateDoc, doc } from 'firebase/firestore';
import AddEventModal from '../components/AddEventModal';
import WeeklyAdherenceBarChart from '../components/WeeklyAdherenceBarChart';
import StreaksComponent from '../components/StreaksComponent';
import ProgressRing from '../components/ProgressRing';
import { exportUserData } from '../lib/exportData';

const addSampleData = async (user) => {
  if (!user) return;

  const userId = user.uid;

  // Sample medicines
  const sampleMedicines = [
    {
      name: 'Aspirin',
      dosage: '81mg',
      frequency: 'Once daily',
      scheduleTimes: ['08:00'],
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      instructions: 'Take with food',
      enableNotifications: true,
      doses: [
        { time: '08:00', status: 'taken', takenAt: new Date('2024-01-15T08:00:00') },
        { time: '08:00', status: 'taken', takenAt: new Date('2024-01-16T08:00:00') },
        { time: '08:00', status: 'pending' }
      ]
    },
    {
      name: 'Lisinopril',
      dosage: '10mg',
      frequency: 'Once daily',
      scheduleTimes: ['09:00'],
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      instructions: 'Take in the morning',
      enableNotifications: true,
      doses: [
        { time: '09:00', status: 'taken', takenAt: new Date('2024-01-15T09:00:00') },
        { time: '09:00', status: 'taken', takenAt: new Date('2024-01-16T09:00:00') },
        { time: '09:00', status: 'pending' }
      ]
    }
  ];

  for (const med of sampleMedicines) {
    await addDoc(collection(db, `users/${userId}/medicines`), med);
  }

  // Sample documents
  const sampleDocuments = [
    {
      fileName: 'Blood Test Results.pdf',
      uploadDate: new Date('2024-01-10'),
      url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      description: 'Recent blood test results'
    },
    {
      fileName: 'Prescription Scan.jpg',
      uploadDate: new Date('2024-01-12'),
      url: 'https://via.placeholder.com/300x300.jpg?text=Prescription',
      description: 'Scanned prescription'
    }
  ];

  for (const doc of sampleDocuments) {
    await addDoc(collection(db, `users/${userId}/documents`), doc);
  }

  // Sample symptoms
  const sampleSymptoms = [
    {
      symptom: 'Headache',
      severity: 3,
      notes: 'Mild headache after taking medication',
      date: new Date('2024-01-14')
    },
    {
      symptom: 'Fatigue',
      severity: 2,
      notes: 'Feeling tired in the afternoon',
      date: new Date('2024-01-15')
    }
  ];

  for (const sym of sampleSymptoms) {
    await addDoc(collection(db, `users/${userId}/symptoms`), sym);
  }

  // Sample vitals
  const sampleVitals = [
    {
      type: 'Blood Pressure',
      value: '120/80',
      notes: 'Morning reading',
      date: new Date('2024-01-14T08:00:00')
    },
    {
      type: 'Heart Rate',
      value: '72 bpm',
      notes: 'Resting heart rate',
      date: new Date('2024-01-14T08:00:00')
    }
  ];

  for (const vit of sampleVitals) {
    await addDoc(collection(db, `users/${userId}/vitals`), vit);
  }

  // Sample doctors
  const sampleDoctors = [
    {
      name: 'Dr. Sarah Johnson',
      type: 'Cardiologist',
      phone: '+1-555-0123',
      email: 'sarah.johnson@hospital.com',
      address: '123 Heart St, Medical City, MC 12345',
      notes: 'Primary cardiologist'
    }
  ];

  for (const doc of sampleDoctors) {
    await addDoc(collection(db, `users/${userId}/doctors`), doc);
  }

  // Sample events
  const sampleEvents = [
    {
      title: 'Cardiology Appointment',
      type: 'appointment',
      date: new Date('2024-01-20'),
      time: '10:00',
      notes: 'Follow-up appointment with Dr. Johnson'
    }
  ];

  for (const event of sampleEvents) {
    await addDoc(collection(db, `users/${userId}/events`), event);
  }

  alert('Sample data added successfully! Refresh the page to see the data.');
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [showMedicineModal, setShowMedicineModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');

  useEffect(() => {
    const fetchMedicines = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const medicinesRef = collection(db, `users/${user.uid}/medicines`);
        const snapshot = await getDocs(medicinesRef);
        const medicinesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMedicines(medicinesData);
      } catch (error) {
        console.error('Error fetching medicines:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicines();
  }, [user]);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!user) {
        setLoadingEvents(false);
        return;
      }

      try {
        const eventsRef = collection(db, `users/${user.uid}/events`);
        const q = query(eventsRef, orderBy('date', 'asc'));
        const snapshot = await getDocs(q);
        const eventsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setEvents(eventsData);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchEvents();
  }, [user]);

  // Request notification permission on load
  useEffect(() => {
    if (user && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            registerForNotifications(user.uid).catch(console.error);
          }
        });
      } else if (Notification.permission === 'granted') {
        registerForNotifications(user.uid).catch(console.error);
      }
    }
  }, [user]);

  // Client-side fallback timer for notifications
  useEffect(() => {
    if (!user || !medicines.length) return;

    const checkReminders = () => {
      const now = new Date();
      const currentTime = now.toTimeString().substring(0, 5); // HH:MM format

      medicines.forEach((med) => {
        if (med.enableNotifications && med.scheduleTimes) {
          med.scheduleTimes.forEach((time) => {
            if (time === currentTime) {
              // Check if already taken today
              const todayDose = med.doses?.find(d => d.time === time);
              if (!todayDose || todayDose.status !== 'taken') {
                // Show browser notification
                if ('Notification' in window && Notification.permission === 'granted') {
                  new Notification('MediLens Reminder', {
                    body: `Time to take ${med.name} (${med.dosage})`,
                    icon: '/vite.svg',
                    tag: `medication-${med.id}-${time}`,
                    requireInteraction: true
                  });
                }
              }
            }
          });
        }
      });
    };

    // Check every minute
    const interval = setInterval(checkReminders, 60000);

    // Initial check
    checkReminders();

    return () => clearInterval(interval);
  }, [user, medicines]);

  // Map medicines to today's schedule format
  const todaysSchedule = medicines.flatMap((med) => {
    if (!med.scheduleTimes || med.scheduleTimes.length === 0) return [];
    return med.scheduleTimes.map((time, index) => ({
      ...med,
      doseId: `${med.id}-${time}`,
      time,
      status: med.doses?.find(d => d.time === time)?.status || 'pending',
      icon: Pill
    }));
  });



  const handleAddEvent = async (eventData) => {
    try {
      const eventsRef = collection(db, `users/${user.uid}/events`);
      await addDoc(eventsRef, {
        ...eventData,
        createdAt: new Date()
      });
      // Refetch events
      const q = query(eventsRef, orderBy('date', 'asc'));
      const snapshot = await getDocs(q);
      const eventsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEvents(eventsData);
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };

  const handleMarkAsTaken = async (medicineId, time) => {
    try {
      const medicineRef = doc(db, `users/${user.uid}/medicines`, medicineId);
      const medicine = medicines.find(m => m.id === medicineId);
      const existingDoses = medicine.doses || [];
      const updatedDoses = existingDoses.map(d =>
        d.time === time ? { ...d, status: 'taken', takenAt: new Date() } : d
      );
      if (!updatedDoses.find(d => d.time === time)) {
        updatedDoses.push({ time, status: 'taken', takenAt: new Date() });
      }
      await updateDoc(medicineRef, { doses: updatedDoses });
      // Update local state
      setMedicines(prev => prev.map(m =>
        m.id === medicineId ? { ...m, doses: updatedDoses } : m
      ));
    } catch (error) {
      console.error('Error marking as taken:', error);
    }
  };

  const handleToggleNotifications = async (medicineId, enabled) => {
    try {
      const medicineRef = doc(db, `users/${user.uid}/medicines`, medicineId);
      await updateDoc(medicineRef, { enableNotifications: enabled });
      // Update local state
      setMedicines(prev => prev.map(m =>
        m.id === medicineId ? { ...m, enableNotifications: enabled } : m
      ));
    } catch (error) {
      console.error('Error toggling notifications:', error);
    }
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'appointment': return Calendar;
      case 'test': return AlertCircle;
      case 'refill': return Pill;
      default: return Bell;
    }
  };

  const getEventColor = (type) => {
    switch (type) {
      case 'appointment': return 'bg-blue-100 text-blue-600';
      case 'test': return 'bg-red-100 text-red-600';
      case 'refill': return 'bg-green-100 text-green-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const formatDateTime = (date, time) => {
    if (!date) return 'Invalid Date';
    try {
      let dateStr;
      if (date && typeof date === 'object' && date.toDate) {
        // Firestore Timestamp
        const dateObj = date.toDate();
        dateStr = dateObj.toISOString().split('T')[0];
        if (time) {
          const timeStr = dateObj.toTimeString().split(' ')[0].substring(0, 5);
          return dateObj.toLocaleDateString() + ` ${timeStr}`;
        }
        return dateObj.toLocaleDateString();
      } else if (date instanceof Date) {
        dateStr = date.toISOString().split('T')[0];
        const dateObj = new Date(dateStr + (time ? `T${time}` : ''));
        return dateObj.toLocaleDateString() + (time ? ` ${dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : '');
      } else if (typeof date === 'string') {
        // Assume YYYY-MM-DD format
        const dateObj = new Date(date + (time ? `T${time}` : ''));
        if (isNaN(dateObj.getTime())) return 'Invalid Date';
        return dateObj.toLocaleDateString() + (time ? ` ${dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : '');
      } else {
        return 'Invalid Date';
      }
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const quickActions = [
    {
      label: 'Add Sample Data',
      icon: Plus,
      color: 'bg-red-500 hover:bg-red-600',
      action: () => addSampleData(user)
    },
    {
      label: 'Upload Document',
      icon: FileText,
      color: 'bg-blue-500 hover:bg-blue-600',
      action: () => navigate('/prescriptions/upload')
    },
    {
      label: 'Add Medicine',
      icon: Plus,
      color: 'bg-green-500 hover:bg-green-600',
      action: () => navigate('/medications/add')
    },
    {
      label: 'AI Health Chat',
      icon: MessageSquare,
      color: 'bg-purple-500 hover:bg-purple-600',
      action: () => navigate('/ai/chat')
    },
    {
      label: 'Export Data',
      icon: Download,
      color: 'bg-orange-500 hover:bg-orange-600',
      action: async () => {
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
      }
    }
  ];

  return (
    <>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome back! Here's your health overview.</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button onClick={() => setShowAddModal(true)} className="transition-all duration-200 hover:shadow-lg">
              <Bell className="h-4 w-4 mr-2" />
              Set Reminder
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to manage your health</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={index}
                    onClick={action.action}
                    className={`h-20 flex-col space-y-2 ${action.color} text-white transition-all duration-200 hover:shadow-lg hover:scale-105`}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="text-sm font-medium">{action.label}</span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Today's Schedule
                </CardTitle>
                <CardDescription>Your medication schedule for today</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('/medications/add')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Medicine
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {todaysSchedule.length > 0 ? (
              <div className="space-y-3">
                {todaysSchedule.map((med) => {
                  const Icon = med.icon;
                  return (
                    <div
                      key={med.doseId}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full ${med.status === 'taken' ? 'bg-green-100' : 'bg-orange-100'}`}>
                          <Icon className={`h-5 w-5 ${med.status === 'taken' ? 'text-green-600' : 'text-orange-600'}`} />
                        </div>
                        <div>
                          <h4 className="font-medium">{med.name}</h4>
                          <p className="text-sm text-muted-foreground">{med.dosage} • {med.time}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {med.status === 'taken' ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-orange-600" />
                        )}
                        <span className={`text-sm font-medium ${med.status === 'taken' ? 'text-green-600' : 'text-orange-600'}`}>
                          {med.status === 'taken' ? 'Taken' : 'Pending'}
                        </span>
                        {med.status !== 'taken' && (
                          <Button variant="outline" size="sm" onClick={() => handleMarkAsTaken(med.id, med.time)}>
                            Mark as Taken
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => { setSelectedMedicine(med); setShowMedicineModal(true); }}>
                          View Details
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Pill className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground">No medications scheduled</h3>
                <p className="text-sm text-muted-foreground mb-4">Add your first medication to get started</p>
                <Button onClick={() => navigate('/medications/add')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Medication
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analytics Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Health Analytics
            </CardTitle>
            <CardDescription>Track your medication adherence and progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-2">
                <WeeklyAdherenceBarChart />
              </div>
              <div className="space-y-4">
                <ProgressRing />
                <StreaksComponent />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Timeline */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Upcoming
                </CardTitle>
                <CardDescription>Your upcoming health events and reminders</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {events.length > 0 ? (
              <div className="space-y-4">
                {events.map((event) => {
                  const Icon = getEventIcon(event.type);
                  return (
                    <div key={event.id} className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex-shrink-0">
                        <div className={`p-2 rounded-full ${getEventColor(event.type)}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{event.title}</h4>
                        <p className="text-sm text-muted-foreground">{formatDateTime(event.date, event.time)}</p>
                        {event.notes && <p className="text-sm text-muted-foreground">{event.notes}</p>}
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => { setSelectedEvent(event); setShowDetailsModal(true); }}>
                        View Details
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground">No upcoming events</h3>
                <p className="text-sm text-muted-foreground mb-4">Schedule your next appointment or reminder</p>
                <Button onClick={() => setShowAddModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Event
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Event Modal */}
      <AddEventModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddEvent}
      />

      {/* Event Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Event Details</DialogTitle>
            <DialogDescription>View details of the selected event.</DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${getEventColor(selectedEvent.type)}`}>
                  {React.createElement(getEventIcon(selectedEvent.type), { className: 'h-5 w-5' })}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{selectedEvent.title}</h3>
                  <p className="text-sm text-muted-foreground capitalize">{selectedEvent.type}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <Label className="text-sm font-medium">Date & Time</Label>
                  <p className="text-sm text-muted-foreground">{formatDateTime(selectedEvent.date, selectedEvent.time)}</p>
                </div>
                {selectedEvent.notes && (
                  <div>
                    <Label className="text-sm font-medium">Notes</Label>
                    <p className="text-sm text-muted-foreground">{selectedEvent.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Medicine Details Modal */}
      <Dialog open={showMedicineModal} onOpenChange={setShowMedicineModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Medicine Details</DialogTitle>
            <DialogDescription>View details of the selected medicine.</DialogDescription>
          </DialogHeader>
          {selectedMedicine && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-blue-100">
                  <Pill className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{selectedMedicine.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedMedicine.dosage}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <Label className="text-sm font-medium">Frequency</Label>
                  <p className="text-sm text-muted-foreground">{selectedMedicine.frequency}</p>
                </div>
                {selectedMedicine.scheduleTimes && selectedMedicine.scheduleTimes.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Schedule Times</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedMedicine.scheduleTimes.map((time, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs">
                          {time}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="enableNotifications"
                    checked={selectedMedicine.enableNotifications || false}
                    onChange={(e) => handleToggleNotifications(selectedMedicine.id, e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <Label htmlFor="enableNotifications" className="text-sm font-medium">
                    Enable Notifications
                  </Label>
                </div>
                {selectedMedicine.doses && selectedMedicine.doses.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Today's Doses</Label>
                    <div className="space-y-1 mt-1">
                      {selectedMedicine.doses.map((dose, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span>{dose.time}</span>
                          <span className={`font-medium ${dose.status === 'taken' ? 'text-green-600' : 'text-orange-600'}`}>
                            {dose.status === 'taken' ? 'Taken' : 'Pending'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {selectedMedicine.instructions && (
                  <div>
                    <Label className="text-sm font-medium">Instructions</Label>
                    <p className="text-sm text-muted-foreground">{selectedMedicine.instructions}</p>
                  </div>
                )}
                {selectedMedicine.startDate && (
                  <div>
                    <Label className="text-sm font-medium">Start Date</Label>
                    <p className="text-sm text-muted-foreground">{selectedMedicine.startDate}</p>
                  </div>
                )}
                {selectedMedicine.endDate && (
                  <div>
                    <Label className="text-sm font-medium">End Date</Label>
                    <p className="text-sm text-muted-foreground">{selectedMedicine.endDate}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
    </>
  );
};

export default Dashboard;
