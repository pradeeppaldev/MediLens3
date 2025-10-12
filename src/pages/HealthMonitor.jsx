import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Activity, HeartPulse, Thermometer, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc, onSnapshot, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';

const HealthMonitor = () => {
  const { user } = useAuth();
  const [symptoms, setSymptoms] = useState([]);
  const [vitals, setVitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Symptom form state
  const [symptomName, setSymptomName] = useState('');
  const [severity, setSeverity] = useState([5]);
  const [symptomNotes, setSymptomNotes] = useState('');
  const [submittingSymptom, setSubmittingSymptom] = useState(false);

  // Vital form state
  const [vitalType, setVitalType] = useState('');
  const [vitalValue, setVitalValue] = useState('');
  const [vitalNotes, setVitalNotes] = useState('');
  const [submittingVital, setSubmittingVital] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Real-time listener for symptoms
    const symptomsQuery = query(
      collection(db, `users/${user.uid}/symptoms`),
      orderBy('date', 'desc')
    );
    const unsubscribeSymptoms = onSnapshot(symptomsQuery, (snapshot) => {
      const symptomsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSymptoms(symptomsData);
    }, (err) => {
      console.error('Error fetching symptoms:', err);
      setError('Failed to load symptoms');
    });

    // Real-time listener for vitals
    const vitalsQuery = query(
      collection(db, `users/${user.uid}/vitals`),
      orderBy('date', 'desc')
    );
    const unsubscribeVitals = onSnapshot(vitalsQuery, (snapshot) => {
      const vitalsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setVitals(vitalsData);
    }, (err) => {
      console.error('Error fetching vitals:', err);
      setError('Failed to load vitals');
    });

    setLoading(false);

    return () => {
      unsubscribeSymptoms();
      unsubscribeVitals();
    };
  }, [user]);

  const handleLogSymptom = async (e) => {
    e.preventDefault();
    if (!user || !symptomName.trim()) return;

    setSubmittingSymptom(true);
    try {
      await addDoc(collection(db, `users/${user.uid}/symptoms`), {
        symptom: symptomName.trim(),
        severity: severity[0],
        notes: symptomNotes.trim(),
        date: serverTimestamp()
      });
      setSymptomName('');
      setSeverity([5]);
      setSymptomNotes('');
    } catch (err) {
      console.error('Error logging symptom:', err);
      setError('Failed to log symptom');
    } finally {
      setSubmittingSymptom(false);
    }
  };

  const handleLogVital = async (e) => {
    e.preventDefault();
    if (!user || !vitalType || !vitalValue.trim()) return;

    setSubmittingVital(true);
    try {
      await addDoc(collection(db, `users/${user.uid}/vitals`), {
        type: vitalType,
        value: vitalValue.trim(),
        notes: vitalNotes.trim(),
        date: serverTimestamp()
      });
      setVitalType('');
      setVitalValue('');
      setVitalNotes('');
    } catch (err) {
      console.error('Error logging vital:', err);
      setError('Failed to log vital sign');
    } finally {
      setSubmittingVital(false);
    }
  };

  const handleDeleteSymptom = async (id) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/symptoms`, id));
    } catch (err) {
      console.error('Error deleting symptom:', err);
      setError('Failed to delete symptom');
    }
  };

  const handleDeleteVital = async (id) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/vitals`, id));
    } catch (err) {
      console.error('Error deleting vital:', err);
      setError('Failed to delete vital sign');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading health monitor...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Activity className="h-8 w-8 mr-3 text-primary" />
        <h1 className="text-3xl font-bold">Health Monitor</h1>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Symptom Logging */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <HeartPulse className="h-5 w-5 mr-2" />
              Log Symptom
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogSymptom} className="space-y-4">
              <div>
                <Label htmlFor="symptom">Symptom</Label>
                <Input
                  id="symptom"
                  value={symptomName}
                  onChange={(e) => setSymptomName(e.target.value)}
                  placeholder="e.g., Headache, Fever"
                  required
                />
              </div>
              <div>
                <Label>Severity: {severity[0]}/10</Label>
                <Slider
                  value={severity}
                  onValueChange={setSeverity}
                  max={10}
                  min={1}
                  step={1}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="symptom-notes">Notes (optional)</Label>
                <Textarea
                  id="symptom-notes"
                  value={symptomNotes}
                  onChange={(e) => setSymptomNotes(e.target.value)}
                  placeholder="Additional details..."
                  rows={3}
                />
              </div>
              <Button type="submit" disabled={submittingSymptom} className="w-full">
                {submittingSymptom ? 'Logging...' : 'Log Symptom'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Vital Signs Logging */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Thermometer className="h-5 w-5 mr-2" />
              Log Vital Signs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogVital} className="space-y-4">
              <div>
                <Label htmlFor="vital-type">Vital Type</Label>
                <Select value={vitalType} onValueChange={setVitalType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vital type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bloodPressure">Blood Pressure</SelectItem>
                    <SelectItem value="heartRate">Heart Rate</SelectItem>
                    <SelectItem value="temperature">Temperature</SelectItem>
                    <SelectItem value="weight">Weight</SelectItem>
                    <SelectItem value="oxygenSaturation">Oxygen Saturation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="vital-value">Value</Label>
                <Input
                  id="vital-value"
                  value={vitalValue}
                  onChange={(e) => setVitalValue(e.target.value)}
                  placeholder="e.g., 120/80 mmHg, 72 bpm, 98.6°F"
                  required
                />
              </div>
              <div>
                <Label htmlFor="vital-notes">Notes (optional)</Label>
                <Textarea
                  id="vital-notes"
                  value={vitalNotes}
                  onChange={(e) => setVitalNotes(e.target.value)}
                  placeholder="Additional details..."
                  rows={3}
                />
              </div>
              <Button type="submit" disabled={submittingVital} className="w-full">
                {submittingVital ? 'Logging...' : 'Log Vital Sign'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Recent Symptoms */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent Symptoms</CardTitle>
        </CardHeader>
        <CardContent>
          {symptoms.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {symptoms.slice(0, 6).map((symptom) => (
                <Card key={symptom.id} className="relative">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{symptom.symptom}</h4>
                        <p className="text-sm text-muted-foreground">
                          Severity: {symptom.severity}/10
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {symptom.date ? new Date(symptom.date.seconds * 1000).toLocaleString() : 'Unknown'}
                        </p>
                        {symptom.notes && (
                          <p className="text-sm mt-2">{symptom.notes}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSymptom(symptom.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">No symptoms logged yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Recent Vitals */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent Vital Signs</CardTitle>
        </CardHeader>
        <CardContent>
          {vitals.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {vitals.slice(0, 6).map((vital) => (
                <Card key={vital.id} className="relative">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium capitalize">{vital.type.replace(/([A-Z])/g, ' $1')}</h4>
                        <p className="text-sm text-muted-foreground">
                          Value: {vital.value}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {vital.date ? new Date(vital.date.seconds * 1000).toLocaleString() : 'Unknown'}
                        </p>
                        {vital.notes && (
                          <p className="text-sm mt-2">{vital.notes}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteVital(vital.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">No vital signs logged yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthMonitor;
