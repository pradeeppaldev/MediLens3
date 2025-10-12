// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Firebase configuration
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
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Firebase Messaging (only in browser environments)
export let messaging;
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.log('Firebase Messaging not available in this environment');
  }
}

// FCM Helper Functions
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    throw new Error('This browser does not support notifications');
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Notification permission denied');
  }
  return permission;
};

export const getFCMToken = async () => {
  if (!messaging) {
    throw new Error('Firebase Messaging not initialized');
  }

  try {
    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY // Add this to your .env
    });
    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    throw error;
  }
};

export const storeFCMToken = async (userId, token) => {
  if (!userId || !token) return;

  try {
    const deviceId = navigator.userAgent; // Simple device ID
    const deviceRef = doc(db, `users/${userId}/devices`, deviceId);
    await setDoc(deviceRef, {
      token,
      platform: 'web',
      createdAt: new Date(),
      lastUpdated: new Date()
    }, { merge: true });
    console.log('FCM token stored successfully');
  } catch (error) {
    console.error('Error storing FCM token:', error);
    throw error;
  }
};

export const registerForNotifications = async (userId) => {
  try {
    await requestNotificationPermission();
    const token = await getFCMToken();
    await storeFCMToken(userId, token);
    return token;
  } catch (error) {
    console.error('Error registering for notifications:', error);
    throw error;
  }
};

// Listen for token refresh
if (messaging) {
  onMessage(messaging, (payload) => {
    console.log('Message received in foreground:', payload);
    // Handle foreground messages if needed
  });
}

export default app;