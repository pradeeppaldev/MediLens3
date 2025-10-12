import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

const ProgressRing = () => {
  const { user } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [todayAdherence, setTodayAdherence] = useState(0);

  useEffect(() => {
    if (!user) return;

    const unsub = onSnapshot(collection(db, `users/${user.uid}/medicines`), (snapshot) => {
      const meds = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMedicines(meds);
    });

    return () => unsub();
  }, [user]);

  useEffect(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    let taken = 0;

    medicines.forEach(med => {
      if (med.doses) {
        med.doses.forEach(dose => {
          if (dose.status === 'taken' && dose.takenAt) {
            const takenDate = dose.takenAt.toDate ? dose.takenAt.toDate() : new Date(dose.takenAt);
            const takenDateStr = takenDate.toISOString().split('T')[0];
            if (takenDateStr === todayStr) {
              taken++;
            }
          }
        });
      }
    });

    const adherence = taken > 0 ? 100 : 0; // Simplified: 100% if at least one dose taken today
    setTodayAdherence(adherence);
  }, [medicines]);

  const data = [
    { name: 'Taken', value: todayAdherence, color: '#10b981' },
    { name: 'Remaining', value: 100 - todayAdherence, color: '#e5e7eb' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
          Today's Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center">
          <div className="relative">
            <ResponsiveContainer width={120} height={120}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={55}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-foreground">{todayAdherence}%</span>
            </div>
          </div>
        </div>
        <p className="text-center text-sm text-muted-foreground mt-2">
          Daily adherence goal
        </p>
      </CardContent>
    </Card>
  );
};

export default ProgressRing;
