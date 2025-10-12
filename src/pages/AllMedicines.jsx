import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Pill, Plus, Calendar, Clock, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

const AllMedicines = () => {
  const { user } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [medicineToDelete, setMedicineToDelete] = useState(null);

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

  const handleDeleteMedicine = async () => {
    if (!user || !medicineToDelete) return;

    try {
      const medicineRef = doc(db, `users/${user.uid}/medicines`, medicineToDelete.id);
      await deleteDoc(medicineRef);

      // Refresh medicines list
      const medicinesRef = collection(db, `users/${user.uid}/medicines`);
      const snapshot = await getDocs(medicinesRef);
      const medicinesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMedicines(medicinesData);

      setShowDeleteModal(false);
      setMedicineToDelete(null);
    } catch (error) {
      console.error('Error deleting medicine:', error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading medicines...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">All Medications</h1>
        <Link to="/medications/add">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Medicine
          </Button>
        </Link>
      </div>

      {medicines.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {medicines.map((medicine) => (
            <Card key={medicine.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="flex items-center">
                    <Pill className="h-5 w-5 mr-2 text-primary" />
                    {medicine.name}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setMedicineToDelete(medicine);
                      setShowDeleteModal(true);
                    }}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    <strong>Dosage:</strong> {medicine.dosage}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Frequency:</strong> {medicine.frequency}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Purpose:</strong> {medicine.purpose || 'Not specified'}
                  </p>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-1" />
                    Started: {medicine.startDate ? new Date(medicine.startDate).toLocaleDateString() : 'Not specified'}
                  </div>
                  <Link to={`/medications/${medicine.id}`}>
                    <Button variant="outline" size="sm" className="w-full mt-4">
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Pill className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-medium text-muted-foreground mb-2">No medications found</h3>
          <p className="text-muted-foreground mb-6">Start by adding your first medication.</p>
          <Link to="/medications/add">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Medicine
            </Button>
          </Link>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Medication</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {medicineToDelete?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteMedicine}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AllMedicines;
