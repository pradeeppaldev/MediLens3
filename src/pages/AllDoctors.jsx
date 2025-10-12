import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Stethoscope, Plus, Phone, MapPin, Calendar, User, Clock, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, getDocs, addDoc, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import AddEventModal from '../components/AddEventModal';

const AllDoctors = () => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState(null);
  const [newDoctor, setNewDoctor] = useState({
    name: '',
    type: '',
    phone: '',
    address: '',
    email: '',
    notes: ''
  });

  useEffect(() => {
    const fetchDoctors = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const doctorsRef = collection(db, `users/${user.uid}/doctors`);
        const snapshot = await getDocs(doctorsRef);
        const doctorsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setDoctors(doctorsData);
      } catch (error) {
        console.error('Error fetching doctors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [user]);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!user) return;

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
      }
    };

    fetchEvents();
  }, [user]);

  const handleAddDoctor = async () => {
    if (!user || !newDoctor.name || !newDoctor.type) return;

    try {
      const doctorsRef = collection(db, `users/${user.uid}/doctors`);
      await addDoc(doctorsRef, {
        ...newDoctor,
        createdAt: new Date()
      });

      // Refresh doctors list
      const snapshot = await getDocs(doctorsRef);
      const doctorsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDoctors(doctorsData);

      // Reset form
      setNewDoctor({
        name: '',
        type: '',
        phone: '',
        address: '',
        email: '',
        notes: ''
      });
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding doctor:', error);
    }
  };

  const handleDeleteDoctor = async () => {
    if (!user || !doctorToDelete) return;

    try {
      const doctorRef = doc(db, `users/${user.uid}/doctors`, doctorToDelete.id);
      await deleteDoc(doctorRef);

      // Refresh doctors list
      const doctorsRef = collection(db, `users/${user.uid}/doctors`);
      const snapshot = await getDocs(doctorsRef);
      const doctorsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDoctors(doctorsData);

      setShowDeleteModal(false);
      setDoctorToDelete(null);
    } catch (error) {
      console.error('Error deleting doctor:', error);
    }
  };

  const handleScheduleAppointment = (doctor) => {
    setSelectedDoctor(doctor);
    setShowScheduleModal(true);
  };

  const handleAddAppointment = async (eventData) => {
    if (!user) return;

    try {
      const eventsRef = collection(db, `users/${user.uid}/events`);
      await addDoc(eventsRef, {
        ...eventData,
        createdAt: new Date()
      });

      // Refresh events list
      const q = query(eventsRef, orderBy('date', 'asc'));
      const snapshot = await getDocs(q);
      const eventsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEvents(eventsData);
    } catch (error) {
      console.error('Error adding appointment:', error);
    }

    setShowScheduleModal(false);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading doctors...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Healthcare Providers</h1>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Provider
        </Button>
      </div>

      {doctors.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {doctors.map((doctor) => (
            <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="flex items-center">
                    <Stethoscope className="h-5 w-5 mr-2 text-primary" />
                    {doctor.name}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDoctorToDelete(doctor);
                      setShowDeleteModal(true);
                    }}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground capitalize">{doctor.type}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {doctor.phone && (
                    <div className="flex items-center text-sm">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      {doctor.phone}
                    </div>
                  )}
                  {doctor.address && (
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                      {doctor.address}
                    </div>
                  )}
                  {doctor.email && (
                    <div className="flex items-center text-sm">
                      <User className="h-4 w-4 mr-2 text-muted-foreground" />
                      {doctor.email}
                    </div>
                  )}
                  {doctor.notes && (
                    <p className="text-sm text-muted-foreground mt-2">{doctor.notes}</p>
                  )}
                  {/* Scheduled Appointments */}
                  {events.filter(event => event.title && event.title.includes(`Appointment with ${doctor.name}`)).length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2 flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Scheduled Appointments
                      </h4>
                      <div className="space-y-2">
                        {events
                          .filter(event => event.title && event.title.includes(`Appointment with ${doctor.name}`))
                          .map(event => (
                            <div key={event.id} className="text-xs bg-muted p-2 rounded">
                              <div className="font-medium">{event.title}</div>
                              <div className="text-muted-foreground">
                                {new Date(event.date).toLocaleDateString()}
                                {event.time && ` at ${event.time}`}
                              </div>
                              {event.notes && (
                                <div className="text-muted-foreground mt-1">{event.notes}</div>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-4"
                    onClick={() => handleScheduleAppointment(doctor)}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Appointment
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Stethoscope className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-medium text-muted-foreground mb-2">No healthcare providers added</h3>
          <p className="text-muted-foreground mb-6">Add your first healthcare provider to get started.</p>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Provider
          </Button>
        </div>
      )}

      {/* Add Doctor Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Healthcare Provider</DialogTitle>
            <DialogDescription>
              Add a new healthcare provider to your network.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={newDoctor.name}
                onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
                placeholder="Dr. John Smith"
              />
            </div>
            <div>
              <Label htmlFor="type">Type *</Label>
              <Select value={newDoctor.type} onValueChange={(value) => setNewDoctor({ ...newDoctor, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select provider type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hospital">Hospital</SelectItem>
                  <SelectItem value="clinic">Clinic</SelectItem>
                  <SelectItem value="doctor">Doctor</SelectItem>
                  <SelectItem value="pharmacy">Pharmacy</SelectItem>
                  <SelectItem value="laboratory">Laboratory</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={newDoctor.phone}
                onChange={(e) => setNewDoctor({ ...newDoctor, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newDoctor.email}
                onChange={(e) => setNewDoctor({ ...newDoctor, email: e.target.value })}
                placeholder="doctor@example.com"
              />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={newDoctor.address}
                onChange={(e) => setNewDoctor({ ...newDoctor, address: e.target.value })}
                placeholder="123 Medical Center Dr, City, State 12345"
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={newDoctor.notes}
                onChange={(e) => setNewDoctor({ ...newDoctor, notes: e.target.value })}
                placeholder="Additional notes about this provider"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddDoctor} disabled={!newDoctor.name || !newDoctor.type}>
                Add Provider
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Healthcare Provider</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {doctorToDelete?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteDoctor}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Schedule Appointment Modal */}
      <AddEventModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onAdd={handleAddAppointment}
        prefillTitle={selectedDoctor ? `Appointment with ${selectedDoctor.name}` : ''}
        prefillNotes={selectedDoctor ? `Appointment at ${selectedDoctor.name} (${selectedDoctor.type})` : ''}
      />
    </div>
  );
};

export default AllDoctors;
