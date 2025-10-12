const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
admin.initializeApp({
  projectId: 'medilens',
});

// For emulators, uncomment the next line
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';

const db = admin.firestore();

async function addSampleData() {
  const userId = 'sample-user-id'; // Use a consistent sample user ID

  console.log('Adding sample medicines...');
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
    },
    {
      name: 'Metformin',
      dosage: '500mg',
      frequency: 'Twice daily',
      scheduleTimes: ['08:00', '20:00'],
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      instructions: 'Take with meals',
      enableNotifications: true,
      doses: [
        { time: '08:00', status: 'taken', takenAt: new Date('2024-01-15T08:00:00') },
        { time: '20:00', status: 'taken', takenAt: new Date('2024-01-15T20:00:00') },
        { time: '08:00', status: 'taken', takenAt: new Date('2024-01-16T08:00:00') },
        { time: '20:00', status: 'pending' }
      ]
    }
  ];

  for (const med of sampleMedicines) {
    await db.collection(`users/${userId}/medicines`).add(med);
    console.log(`Added medicine: ${med.name}`);
  }

  console.log('Adding sample documents...');
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
    await db.collection(`users/${userId}/documents`).add(doc);
    console.log(`Added document: ${doc.fileName}`);
  }

  console.log('Adding sample symptoms...');
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
    },
    {
      symptom: 'Nausea',
      severity: 4,
      notes: 'Nausea after dinner',
      date: new Date('2024-01-16')
    }
  ];

  for (const sym of sampleSymptoms) {
    await db.collection(`users/${userId}/symptoms`).add(sym);
    console.log(`Added symptom: ${sym.symptom}`);
  }

  console.log('Adding sample vitals...');
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
    },
    {
      type: 'Weight',
      value: '70 kg',
      notes: 'Morning weight',
      date: new Date('2024-01-14T08:00:00')
    }
  ];

  for (const vit of sampleVitals) {
    await db.collection(`users/${userId}/vitals`).add(vit);
    console.log(`Added vital: ${vit.type}`);
  }

  console.log('Adding sample doctors...');
  const sampleDoctors = [
    {
      name: 'Dr. Sarah Johnson',
      type: 'Cardiologist',
      phone: '+1-555-0123',
      email: 'sarah.johnson@hospital.com',
      address: '123 Heart St, Medical City, MC 12345',
      notes: 'Primary cardiologist'
    },
    {
      name: 'Dr. Michael Chen',
      type: 'General Practitioner',
      phone: '+1-555-0456',
      email: 'michael.chen@clinic.com',
      address: '456 Health Ave, Wellness Town, WT 67890',
      notes: 'Family doctor'
    }
  ];

  for (const doc of sampleDoctors) {
    await db.collection(`users/${userId}/doctors`).add(doc);
    console.log(`Added doctor: ${doc.name}`);
  }

  console.log('Adding sample events...');
  const sampleEvents = [
    {
      title: 'Cardiology Appointment',
      type: 'appointment',
      date: new Date('2024-01-20'),
      time: '10:00',
      notes: 'Follow-up appointment with Dr. Johnson'
    },
    {
      title: 'Blood Test',
      type: 'test',
      date: new Date('2024-01-22'),
      time: '09:00',
      notes: 'Routine blood work'
    },
    {
      title: 'Refill Prescription',
      type: 'refill',
      date: new Date('2024-01-25'),
      time: '14:00',
      notes: 'Pick up Lisinopril refill'
    }
  ];

  for (const event of sampleEvents) {
    await db.collection(`users/${userId}/events`).add(event);
    console.log(`Added event: ${event.title}`);
  }

  console.log('Sample data added successfully!');
  console.log(`Use user ID: ${userId} to log in and see the data.`);
  process.exit(0);
}

addSampleData().catch(console.error);
