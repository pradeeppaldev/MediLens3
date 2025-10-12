importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Firebase configuration (same as in your app) - hardcoded for service worker
const firebaseConfig = {
  apiKey: "AIzaSyDummyKeyForDev",
  authDomain: "medilens-dev.firebaseapp.com",
  projectId: "medilens-dev",
  storageBucket: "medilens-dev.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456",
  measurementId: "G-ABCDEFGHIJK"
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
