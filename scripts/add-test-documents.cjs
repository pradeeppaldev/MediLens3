const admin = require('firebase-admin');

// Initialize Firebase Admin SDK for emulators
admin.initializeApp({
  projectId: 'medilens', // Use the project ID from .firebaserc or firebase.json
});

// Set emulator host
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';

const db = admin.firestore();

async function addTestDocuments() {
  const userId = 'test-user-id'; // Replace with a test user ID

  const testDocuments = [
    {
      id: 'doc1',
      name: 'Prescription 1',
      type: 'image/jpeg',
      url: 'https://via.placeholder.com/300x300.jpg?text=Prescription+1',
      uploadDate: new Date(),
      description: 'Test prescription document'
    },
    {
      id: 'doc2',
      name: 'Report 1',
      type: 'application/pdf',
      url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      uploadDate: new Date(),
      description: 'Test report document'
    },
    {
      id: 'doc3',
      name: 'X-Ray Image',
      type: 'image/png',
      url: 'https://via.placeholder.com/300x300.png?text=X-Ray',
      uploadDate: new Date(),
      description: 'Test X-ray image'
    }
  ];

  for (const doc of testDocuments) {
    await db.collection(`users/${userId}/documents`).doc(doc.id).set(doc);
    console.log(`Added document: ${doc.name}`);
  }

  console.log('Test documents added successfully!');
  process.exit(0);
}

addTestDocuments().catch(console.error);
