importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Firebase configuration (same as in your app)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message ', payload);

  const notificationTitle = payload.notification?.title || 'MediLens Reminder';
  const notificationOptions = {
    body: payload.notification?.body || 'Time for your medication',
    icon: '/vite.svg', // Update with your app icon
    badge: '/vite.svg',
    tag: 'medication-reminder',
    requireInteraction: true,
    actions: [
      {
        action: 'mark-taken',
        title: 'Mark as Taken'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ],
    data: payload.data || {}
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received.', event);

  event.notification.close();

  if (event.action === 'mark-taken') {
    // Mark as taken via API call or postMessage to app
    const data = event.notification.data;
    if (data.medicineId && data.doseTime) {
      // For demo, we'll use fetch to a Cloud Function
      // In production, replace with your Cloud Function URL
      fetch(`https://your-region-your-project.cloudfunctions.net/markAsTaken?userId=${data.userId}&medicineId=${data.medicineId}&doseTime=${data.doseTime}`, {
        method: 'POST'
      }).catch(console.error);
    }
  }

  // Open the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if there is already a window/tab open with the target URL
      for (let client of windowClients) {
        if (client.url.includes('/dashboard') && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, open a new window/tab with the target URL
      if (clients.openWindow) {
        return clients.openWindow('/dashboard');
      }
    })
  );
});
