import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to create user document in Firestore
  const createUserDocument = async (user, additionalData = {}) => {
    if (!user) return;

    const userDocRef = doc(db, 'users', user.uid);
    const userSnapshot = await getDoc(userDocRef);

    // If user data doesn't exist, create it
    if (!userSnapshot.exists()) {
      const { displayName, email, photoURL } = user;
      
      try {
        await setDoc(userDocRef, {
          displayName: displayName || additionalData.displayName || 'User',
          email,
          photoURL: photoURL || '',
          createdAt: new Date(),
          lastLogin: new Date(),
          ...additionalData
        });
      } catch (error) {
        console.error('Error creating user document:', error);
      }
    } else {
      // Update last login time
      try {
        await setDoc(userDocRef, {
          lastLogin: new Date()
        }, { merge: true });
      } catch (error) {
        console.error('Error updating user document:', error);
      }
    }
    
    return userDocRef;
  };

  const register = async (email, password, displayName) => {
    try {
      const response = await createUserWithEmailAndPassword(auth, email, password);
      const user = response.user;
      
      // Update user profile with display name
      await updateProfile(user, { displayName });
      
      // Create user document in Firestore
      await createUserDocument(user, { displayName });
      
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
      const user = response.user;
      
      // Update last login time
      await createUserDocument(user);
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    return signOut(auth);
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const response = await signInWithPopup(auth, provider);
      const user = response.user;
      
      // Create or update user document in Firestore
      await createUserDocument(user);
      
      return response;
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  };

  const guestLogin = () => {
    // For demo purposes, we'll create a temporary guest user
    // In a real app, you might want to handle this differently
    return Promise.resolve({ user: { uid: 'guest', displayName: 'Guest User', email: 'guest@example.com', isGuest: true } });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch additional user data from Firestore
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userSnapshot = await getDoc(userDocRef);
          
          if (userSnapshot.exists()) {
            const userData = userSnapshot.data();
            setUser({
              ...user,
              ...userData
            });
          } else {
            setUser(user);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser(user);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    signInWithGoogle,
    guestLogin
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};