import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Bell,
  Clock,
  Pill,
  CheckCircle,
  AlertCircle,
  Calendar,
  Filter
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

const Reminders = () => {
  const { user } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [takenHistory, setTakenHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, today, upcoming

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

        // Generate taken history from all medicines' doses
        const allDoses = [];
        medicinesData.forEach((med) => {
          if (med.doses && med.doses.length > 0) {
            med.doses.forEach((dose) => {
              if (dose.status === 'taken') {
                allDoses.push({
                  ...dose,
                  medicineName: med.name,
                  dosage: med.dosage,
                  medicineId: med.id
                });
              }
            });
          }
        });

        // Sort by takenAt descending and take last 10
        allDoses.sort((a, b) => new Date(b.takenAt.seconds * 1000) - new Date(a.takenAt.seconds * 1000));
        setTakenHistory(allDoses.slice(0, 10));
      } catch (error) {
        console.error('Error fetching medicines:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicines();
  }, [user]);

  useEffect(() => {
    if (medicines.length === 0) return;

    const generateReminders = () => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const futureReminders = [];

      medicines.forEach((med) => {
        if (!med.enableNotifications || !med.scheduleTimes || med.scheduleTimes.length === 0) return;

        med.scheduleTimes.forEach((time) => {
          // Generate reminders for next 7 days
          for (let i = 0; i < 7; i++) {
            const reminderDate = new Date(today);
            reminderDate.setDate(today.getDate() + i);

            const [hours, minutes] = time.split(':');
            reminderDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

            if (reminderDate < now) continue; // Skip past reminders

            const doseKey = `${med.id}-${reminderDate.toISOString().split('T')[0]}-${time}`;
            const existingDose = med.doses?.find(d => d.time === time && d.date === reminderDate.toISOString().split('T')[0]);

            futureReminders.push({
              id: doseKey,
              medicineId: med.id,
              medicineName: med.name,
              dosage: med.dosage,
              time: time,
              date: reminderDate,
              status: existingDose?.status || 'pending',
              takenAt: existingDose?.takenAt,
              instructions: med.instructions
            });
          }
        });
      });

      // Sort by date and time
      futureReminders.sort((a, b) => a.date - b.date);

      setReminders(futureReminders);
    };

    generateReminders();
  }, [medicines]);

  const handleMarkAsTaken = async (reminder) => {
    try {
      const medicineRef = doc(db, `users/${user.uid}/medicines`, reminder.medicineId);
      const medicine = medicines.find(m => m.id === reminder.medicineId);
      const existingDoses = medicine.doses || [];
      const doseDate = reminder.date.toISOString().split('T')[0];

      const updatedDoses = existingDoses.filter(d => !(d.time === reminder.time && d.date === doseDate));
      updatedDoses.push({
        time: reminder.time,
        date: doseDate,
        status: 'taken',
        takenAt: new Date()
      });

      await updateDoc(medicineRef, { doses: updatedDoses });

      // Update local state
      setMedicines(prev => prev.map(m =>
        m.id === reminder.medicineId ? { ...m, doses: updatedDoses } : m
      ));

      // Update reminder status
      setReminders(prev => prev.map(r =>
        r.id === reminder.id ? { ...r, status: 'taken', takenAt: new Date() } : r
      ));

      // Update taken history
      const newTakenDose = {
        medicineId: reminder.medicineId,
        medicineName: reminder.medicineName,
        dosage: reminder.dosage,
        date: doseDate,
        time: reminder.time,
        status: 'taken',
        takenAt: new Date()
      };
      setTakenHistory(prev => [newTakenDose, ...prev.slice(0, 9)]); // Keep only 10
    } catch (error) {
      console.error('Error marking as taken:', error);
    }
  };

  const filteredReminders = reminders.filter(reminder => {
    const reminderDate = new Date(reminder.date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    switch (filter) {
      case 'today':
        return reminderDate.toDateString() === today.toDateString();
      case 'upcoming':
        return reminderDate > today;
      default:
        return true;
    }
  });

  const formatDate = (date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center">
            <Bell className="h-8 w-8 mr-3 text-primary" />
            Reminders
          </h1>
          <p className="text-muted-foreground mt-1">Manage your medication reminders and notifications</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            variant={filter === 'today' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('today')}
          >
            Today
          </Button>
          <Button
            variant={filter === 'upcoming' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('upcoming')}
          >
            Upcoming
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Reminders</p>
                <p className="text-2xl font-bold">{filteredReminders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Taken Today</p>
                <p className="text-2xl font-bold">
                  {filteredReminders.filter(r => r.status === 'taken' && formatDate(r.date) === 'Today').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">
                  {filteredReminders.filter(r => r.status === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reminders List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Medication Reminders</CardTitle>
          <CardDescription>
            Upcoming medication reminders for the next 7 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredReminders.length > 0 ? (
            <div className="space-y-4">
              {filteredReminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${reminder.status === 'taken' ? 'bg-green-100' : 'bg-orange-100'}`}>
                      <Pill className={`h-5 w-5 ${reminder.status === 'taken' ? 'text-green-600' : 'text-orange-600'}`} />
                    </div>
                    <div>
                      <h4 className="font-medium">{reminder.medicineName}</h4>
                      <p className="text-sm text-muted-foreground">
                        {reminder.dosage} • {formatDate(reminder.date)} at {reminder.time}
                      </p>
                      {reminder.instructions && (
                        <p className="text-xs text-muted-foreground mt-1">{reminder.instructions}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={reminder.status === 'taken' ? 'default' : 'secondary'}>
                      {reminder.status === 'taken' ? 'Taken' : 'Pending'}
                    </Badge>
                    {reminder.status !== 'taken' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkAsTaken(reminder)}
                      >
                        Mark as Taken
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">No reminders found</h3>
              <p className="text-sm text-muted-foreground">
                {filter === 'today' ? "No reminders for today" : "Enable notifications for your medicines to see reminders here"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Taken History */}
      {takenHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Taken History</CardTitle>
            <CardDescription>
              Your recently taken medication doses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {takenHistory.map((dose, index) => (
                <div
                  key={`${dose.medicineId}-${dose.date}-${dose.time}-${index}`}
                  className="flex items-center justify-between p-4 border rounded-lg bg-green-50"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 rounded-full bg-green-100">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">{dose.medicineName}</h4>
                      <p className="text-sm text-muted-foreground">
                        {dose.dosage} • {dose.date} at {dose.time}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Taken on {new Date(dose.takenAt.seconds * 1000).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="default">Taken</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Reminders;
