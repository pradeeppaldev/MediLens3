import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import confetti from 'canvas-confetti';

const StreaksComponent = () => {
  const { user } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [hasShownConfetti, setHasShownConfetti] = useState(false);

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
    const dailyAdherence = {};

    // Calculate daily adherence for past 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

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

      const adherence = taken > 0 ? 100 : 0; // Simplified: 100% if at least one dose taken
      dailyAdherence[dateStr] = adherence;
    }

    // Calculate streaks
    const dates = Object.keys(dailyAdherence).sort();
    let current = 0;
    let best = 0;
    let temp = 0;

    for (let i = dates.length - 1; i >= 0; i--) {
      const date = dates[i];
      if (dailyAdherence[date] >= 80) {
        temp++;
        if (i === dates.length - 1) current = temp; // if today or recent
      } else {
        best = Math.max(best, temp);
        temp = 0;
      }
    }
    best = Math.max(best, temp);

    // Current streak is the streak ending at the most recent good day
    setCurrentStreak(current);
    setBestStreak(best);
  }, [medicines]);

  useEffect(() => {
    if (currentStreak >= 7 && !hasShownConfetti) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      setHasShownConfetti(true);
    } else if (currentStreak < 7) {
      setHasShownConfetti(false);
    }
  }, [currentStreak, hasShownConfetti]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Flame className="h-5 w-5 mr-2 text-orange-500" />
          Adherence Streaks
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Current Streak</span>
            <Badge variant="secondary" className="flex items-center">
              <Flame className="h-4 w-4 mr-1 text-orange-500" />
              {currentStreak} days
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Best Streak</span>
            <Badge variant="outline" className="flex items-center">
              <Trophy className="h-4 w-4 mr-1 text-yellow-500" />
              {bestStreak} days
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StreaksComponent;
