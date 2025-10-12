import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

const WeeklyAdherenceBarChart = () => {
  const { user } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (!user) return;

    const unsub = onSnapshot(collection(db, `users/${user.uid}/medicines`), (snapshot) => {
      const meds = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMedicines(meds);
    });

    return () => unsub();
  }, [user]);

  useEffect(() => {
    const now = new Date();
    const data = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const day = date.toLocaleDateString('en-US', { weekday: 'short' });

      let taken = 0;

      medicines.forEach(med => {
        if (med.doses) {
          med.doses.forEach(dose => {
            if (dose.status === 'taken' && dose.takenAt) {
              const takenDate = dose.takenAt.toDate ? dose.takenAt.toDate() : new Date(dose.takenAt);
              const takenDateStr = takenDate.toISOString().split('T')[0];
              if (takenDateStr === dateStr) {
                taken++;
              }
            }
          });
        }
      });

      data.push({
        day,
        taken,
        missed: 0 // For now, set missed to 0; can be calculated based on schedule later
      });
    }

    setChartData(data);
  }, [medicines]);

  return (
    <div className="bg-card rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-foreground mb-4">Weekly Adherence</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="taken" stackId="a" fill="#10b981" name="Taken" />
            <Bar dataKey="missed" stackId="a" fill="#ef4444" name="Missed" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WeeklyAdherenceBarChart;
