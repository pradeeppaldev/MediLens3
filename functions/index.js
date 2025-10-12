const {setGlobalOptions} = require("firebase-functions");
const {onSchedule} = require("firebase-functions/v2/scheduler");
const logger = require("firebase-functions/logger");
const admin = require('firebase-admin');

admin.initializeApp();

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// Scheduled function to send medicine reminders every minute
exports.sendMedicineReminders = onSchedule("every 1 minutes", async () => {
  logger.info("Checking for due medicine reminders", {structuredData: true});

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

    logger.info(`Found ${remindersToSend.length} reminders to send`);

    // Send notifications for each reminder
    for (const reminder of remindersToSend) {
      await sendNotification(reminder);
    }

    logger.info("Medicine reminders sent successfully");
  } catch (error) {
    logger.error("Error sending medicine reminders", error);
  }
});

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
      logger.info(`No FCM tokens found for user ${userId}`);
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
    logger.info(`Sent notification to ${response.successCount} devices for medicine ${medicineId}`);

    // Log failures if any
    if (response.failureCount > 0) {
      logger.warn(`Failed to send to ${response.failureCount} devices`, response.responses);
    }
  } catch (error) {
    logger.error(`Error sending notification for medicine ${medicineId}`, error);
  }
}
