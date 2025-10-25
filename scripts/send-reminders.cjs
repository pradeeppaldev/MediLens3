const admin = require('firebase-admin');

// Initialize Firebase Admin with service account
let serviceAccount;
try {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
} catch (error) {
  console.error("Error parsing FIREBASE_SERVICE_ACCOUNT_KEY:", error.message);
  process.exit(1);
}

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
  console.error("Error initializing Firebase Admin:", error.message);
  process.exit(1);
}

async function sendMedicineReminders() {
  console.log("Checking for due medicine reminders");

  try {
    // Get current time in HH:MM format
    const now = new Date();
    const currentTime = now.toTimeString().substring(0, 5); // HH:MM

    // Query all medicines with notifications enabled
    const medicinesSnapshot = await admin.firestore()
      .collectionGroup('medicines')
      .where('enableNotifications', '==', true)
      .get();

    const remindersToSend = [];

    medicinesSnapshot.forEach(doc => {
      const medicine = doc.data();
      const userId = doc.ref.parent.parent.id; // users/{userId}/medicines/{id}

      if (medicine.scheduleTimes && medicine.scheduleTimes.includes(currentTime)) {
        remindersToSend.push({
          userId,
          medicineId: doc.id,
          medicine,
          doseTime: currentTime
        });
      }
    });

    console.log(`Found ${remindersToSend.length} reminders to send`);

    // Send notifications for each reminder
    for (const reminder of remindersToSend) {
      await sendNotification(reminder);
    }

    console.log("Medicine reminders sent successfully");
  } catch (error) {
    console.error("Error sending medicine reminders", error);
  }
}

async function sendNotification({ userId, medicineId, medicine, doseTime }) {
  try {
    // Get user's FCM tokens
    const devicesSnapshot = await admin.firestore()
      .collection(`users/${userId}/devices`)
      .get();

    const tokens = [];
    devicesSnapshot.forEach(doc => {
      const device = doc.data();
      if (device.token) {
        tokens.push(device.token);
      }
    });

    if (tokens.length === 0) {
      console.log(`No FCM tokens found for user ${userId}`);
      return;
    }

    // Send multicast notification
    const message = {
      notification: {
        title: 'MediLens Reminder',
        body: `Time to take ${medicine.name} (${medicine.dosage})`
      },
      data: {
        medicineId: medicineId,
        doseTime: doseTime,
        userId: userId
      },
      tokens: tokens
    };

    const response = await admin.messaging().sendMulticast(message);
    console.log(`Sent notification to ${response.successCount} devices for medicine ${medicineId}`);

    // Log failures if any
    if (response.failureCount > 0) {
      console.warn(`Failed to send to ${response.failureCount} devices`, response.responses);
    }
  } catch (error) {
    console.error(`Error sending notification for medicine ${medicineId}`, error);
  }
}

// Run the function
sendMedicineReminders().then(() => {
  console.log("Script completed");
  process.exit(0);
}).catch((error) => {
  console.error("Script failed", error);
  process.exit(1);
});
