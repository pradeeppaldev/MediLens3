import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { Pill, Save, ArrowLeft } from 'lucide-react';

const AddMedicine = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: '',
    instructions: '',
    startDate: '',
    endDate: '',
    notes: '',
    scheduleTimes: []
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  useEffect(() => {
    if (formData.frequency) {
      const numDoses = formData.frequency === 'Once daily' ? 1 :
                       formData.frequency === 'Twice daily' ? 2 :
                       formData.frequency === 'Three times daily' ? 3 :
                       formData.frequency === 'Four times daily' ? 4 : 0;
      const defaultTimes = [];
      for (let i = 0; i < numDoses; i++) {
        if (i === 0) defaultTimes.push('08:00');
        else if (i === 1) defaultTimes.push('20:00');
        else if (i === 2) defaultTimes.push('12:00');
        else if (i === 3) defaultTimes.push('16:00');
      }
      setFormData(prev => ({ ...prev, scheduleTimes: defaultTimes }));
    }
  }, [formData.frequency]);

  const handleTimeChange = (index, value) => {
    const newTimes = [...formData.scheduleTimes];
    newTimes[index] = value;
    setFormData(prev => ({ ...prev, scheduleTimes: newTimes }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const medicineData = {
        ...formData,
        userId: user.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
        active: true
      };

      const medicinesRef = collection(db, `users/${user.uid}/medicines`);
      await addDoc(medicinesRef, medicineData);

      // Navigate back to dashboard
      navigate('/');
    } catch (error) {
      console.error('Error adding medicine:', error);
      alert('Failed to add medicine. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Add Medicine</h1>
          <p className="text-muted-foreground mt-1">Add a new medication to your schedule</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Pill className="h-5 w-5 mr-2" />
            Medicine Details
          </CardTitle>
          <CardDescription>
            Enter the details of your medication
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Medicine Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Medicine Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Aspirin, Lisinopril"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>

            {/* Dosage */}
            <div className="space-y-2">
              <Label htmlFor="dosage">Dosage *</Label>
              <Input
                id="dosage"
                placeholder="e.g., 10mg, 1 tablet"
                value={formData.dosage}
                onChange={(e) => handleInputChange('dosage', e.target.value)}
                required
              />
            </div>

            {/* Frequency */}
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency *</Label>
              <Select value={formData.frequency} onValueChange={(value) => handleInputChange('frequency', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Once daily">Once daily</SelectItem>
                  <SelectItem value="Twice daily">Twice daily</SelectItem>
                  <SelectItem value="Three times daily">Three times daily</SelectItem>
                  <SelectItem value="Four times daily">Four times daily</SelectItem>
                  <SelectItem value="As needed">As needed</SelectItem>
                  <SelectItem value="Weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Schedule Times */}
            {formData.scheduleTimes.length > 0 && (
              <div className="space-y-2">
                <Label>Schedule Times</Label>
                <div className="grid grid-cols-2 gap-4">
                  {formData.scheduleTimes.map((time, index) => (
                    <div key={index} className="space-y-1">
                      <Label htmlFor={`time-${index}`}>Dose {index + 1}</Label>
                      <Input
                        id={`time-${index}`}
                        type="time"
                        value={time}
                        onChange={(e) => handleTimeChange(index, e.target.value)}
                        required
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="space-y-2">
              <Label htmlFor="instructions">Instructions</Label>
              <Textarea
                id="instructions"
                placeholder="e.g., Take with food, avoid alcohol"
                value={formData.instructions}
                onChange={(e) => handleInputChange('instructions', e.target.value)}
                rows={3}
              />
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
              />
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date (optional)</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional information about this medication"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !formData.name || !formData.dosage || !formData.frequency}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Adding...' : 'Add Medicine'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddMedicine;
