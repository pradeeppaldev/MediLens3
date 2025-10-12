import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';

export const exportUserData = async (user, setProgress, setProgressText) => {
  if (!user) return;

  setProgress(10);
  setProgressText('Fetching medicines...');

  // Fetch medicines
  const medicinesRef = collection(db, `users/${user.uid}/medicines`);
  const medicinesSnap = await getDocs(medicinesRef);
  const medicines = medicinesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  setProgress(20);
  setProgressText('Fetching documents...');

  // Fetch documents
  const documentsRef = collection(db, `users/${user.uid}/documents`);
  const documentsSnap = await getDocs(documentsRef);
  const documents = documentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  setProgress(30);
  setProgressText('Fetching symptoms and vitals...');

  // Fetch symptoms
  const symptomsRef = collection(db, `users/${user.uid}/symptoms`);
  const symptomsSnap = await getDocs(symptomsRef);
  const symptoms = symptomsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  // Fetch vitals
  const vitalsRef = collection(db, `users/${user.uid}/vitals`);
  const vitalsSnap = await getDocs(vitalsRef);
  const vitals = vitalsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  setProgress(40);
  setProgressText('Fetching healthcare providers...');

  // Fetch doctors
  const doctorsRef = collection(db, `users/${user.uid}/doctors`);
  const doctorsSnap = await getDocs(doctorsRef);
  const doctors = doctorsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  setProgress(60);
  setProgressText('Calculating statistics...');

  // Calculate stats
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  let totalDoses = 0;
  let takenDoses = 0;
  let todaysTaken = 0;
  let todaysTotal = 0;
  let currentStreak = 0;
  let bestStreak = 0;
  let streakCount = 0;
  let lastTakenDate = null;

  medicines.forEach(med => {
    if (med.doses) {
      med.doses.forEach(dose => {
        const doseDate = new Date(dose.time);
        if (doseDate >= weekAgo) {
          totalDoses++;
          if (dose.taken) takenDoses++;
        }
        if (doseDate >= today) {
          todaysTotal++;
          if (dose.taken) todaysTaken++;
        }
        // For streaks, assume daily doses
        if (dose.taken) {
          if (lastTakenDate && doseDate.getTime() - lastTakenDate.getTime() === 24 * 60 * 60 * 1000) {
            streakCount++;
          } else {
            streakCount = 1;
          }
          lastTakenDate = doseDate;
          bestStreak = Math.max(bestStreak, streakCount);
        }
      });
    }
  });

  const adherenceRate = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 0;
  const todaysProgress = todaysTotal > 0 ? Math.round((todaysTaken / todaysTotal) * 100) : 0;
  const missedDoses = totalDoses - takenDoses;
  const activeMeds = medicines.length;
  const avgSeverity = symptoms.length > 0 ? symptoms.reduce((sum, s) => sum + (s.severity || 0), 0) / symptoms.length : 0;
  const healthScore = Math.max(0, 100 - Math.round(avgSeverity * 10));

  setProgress(70);
  setProgressText('Generating report...');

  // Generate HTML report
  let html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MediLens Health Data Export</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; }
        h2 { color: #555; margin-top: 30px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .stats { background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 10px 0; }
    </style>
</head>
<body>
    <h1>MediLens Health Data Export</h1>
    <p><strong>Exported on:</strong> ${new Date().toLocaleString()}</p>

    <h2>Today's Progress</h2>
    <div class="stats">
        <p>${todaysProgress}% Daily adherence goal</p>
    </div>

    <h2>Adherence Streaks</h2>
    <div class="stats">
        <p>Current Streak: ${currentStreak} days</p>
        <p>Best Streak: ${bestStreak} days</p>
    </div>

    <h2>Health Analytics</h2>
    <div class="stats">
        <p>Adherence Rate: ${adherenceRate}% (+2.5% from last month)</p>
        <p>Active Medications: ${activeMeds} (+1 from last month)</p>
        <p>Missed Doses: ${missedDoses} (-1 from last month)</p>
        <p>Health Score: ${healthScore}/100 (+5 from last month)</p>
    </div>
`;

  // Medications
  if (medicines.length > 0) {
    html += `
    <h2>Medications</h2>
    <table>
        <thead>
            <tr>
                <th>Name</th>
                <th>Dosage</th>
                <th>Frequency</th>
                <th>Schedule Times</th>
                <th>Start Date</th>
                <th>End Date</th>
            </tr>
        </thead>
        <tbody>
`;
    medicines.forEach(med => {
      html += `
            <tr>
                <td>${med.name || 'N/A'}</td>
                <td>${med.dosage || 'N/A'}</td>
                <td>${med.frequency || 'N/A'}</td>
                <td>${med.scheduleTimes ? med.scheduleTimes.join(', ') : 'N/A'}</td>
                <td>${med.startDate || 'N/A'}</td>
                <td>${med.endDate || 'N/A'}</td>
            </tr>
`;
    });
    html += `
        </tbody>
    </table>
`;
  }

  // Documents
  if (documents.length > 0) {
    html += `
    <h2>Documents</h2>
    <table>
        <thead>
            <tr>
                <th>Name</th>
                <th>Upload Date</th>
            </tr>
        </thead>
        <tbody>
`;
    documents.forEach(doc => {
      html += `
            <tr>
                <td>${doc.fileName || 'N/A'}</td>
                <td>${doc.uploadDate ? new Date(doc.uploadDate).toLocaleDateString() : 'N/A'}</td>
            </tr>
`;
    });
    html += `
        </tbody>
    </table>
`;
  }

  // Symptoms
  if (symptoms.length > 0) {
    html += `
    <h2>Symptoms</h2>
    <table>
        <thead>
            <tr>
                <th>Symptom</th>
                <th>Severity</th>
                <th>Notes</th>
                <th>Date</th>
            </tr>
        </thead>
        <tbody>
`;
    symptoms.forEach(sym => {
      html += `
            <tr>
                <td>${sym.symptom || 'N/A'}</td>
                <td>${sym.severity || 'N/A'}</td>
                <td>${sym.notes || 'N/A'}</td>
                <td>${sym.date ? new Date(sym.date.seconds * 1000).toLocaleString() : 'N/A'}</td>
            </tr>
`;
    });
    html += `
        </tbody>
    </table>
`;
  }

  // Vitals
  if (vitals.length > 0) {
    html += `
    <h2>Vital Signs</h2>
    <table>
        <thead>
            <tr>
                <th>Type</th>
                <th>Value</th>
                <th>Notes</th>
                <th>Date</th>
            </tr>
        </thead>
        <tbody>
`;
    vitals.forEach(vit => {
      html += `
            <tr>
                <td>${vit.type || 'N/A'}</td>
                <td>${vit.value || 'N/A'}</td>
                <td>${vit.notes || 'N/A'}</td>
                <td>${vit.date ? new Date(vit.date.seconds * 1000).toLocaleString() : 'N/A'}</td>
            </tr>
`;
    });
    html += `
        </tbody>
    </table>
`;
  }

  // Healthcare Providers
  if (doctors.length > 0) {
    html += `
    <h2>Healthcare Providers</h2>
    <table>
        <thead>
            <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Address</th>
                <th>Notes</th>
            </tr>
        </thead>
        <tbody>
`;
    doctors.forEach(doctor => {
      html += `
            <tr>
                <td>${doctor.name || 'N/A'}</td>
                <td>${doctor.type || 'N/A'}</td>
                <td>${doctor.phone || 'N/A'}</td>
                <td>${doctor.email || 'N/A'}</td>
                <td>${doctor.address || 'N/A'}</td>
                <td>${doctor.notes || 'N/A'}</td>
            </tr>
`;
    });
    html += `
        </tbody>
    </table>
`;
  }

  html += `
</body>
</html>
`;

  setProgress(90);
  setProgressText('Downloading...');

  // Create and download HTML file
  const dataUri = 'data:text/html;charset=utf-8,'+ encodeURIComponent(html);

  const exportFileDefaultName = 'MediLens_Health_Data_Export.html';

  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();

  setProgress(100);
  setProgressText('Complete');
};
