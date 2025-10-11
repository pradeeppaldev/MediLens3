import React, { useEffect, useState } from 'react';
import { app, auth, db, storage } from '../lib/firebase';
import { getAnalytics } from 'firebase/analytics';

const FirebaseTest = () => {
  const [status, setStatus] = useState('Testing...');
  const [services, setServices] = useState({});

  useEffect(() => {
    const testFirebase = async () => {
      try {
        const testResults = {
          app: app ? '✅ Initialized' : '❌ Not initialized',
          auth: auth ? '✅ Available' : '❌ Not available',
          firestore: db ? '✅ Available' : '❌ Not available',
          storage: storage ? '✅ Available' : '❌ Not available'
        };

        // Test Analytics (browser only)
        try {
          if (typeof window !== 'undefined') {
            const analytics = getAnalytics(app);
            testResults.analytics = analytics ? '✅ Available' : '❌ Not available';
          } else {
            testResults.analytics = '⏭️ Not available in SSR';
          }
        } catch (error) {
          testResults.analytics = `❌ Error: ${error.message}`;
        }

        setServices(testResults);
        setStatus('Firebase services test completed');
      } catch (error) {
        setStatus(`Error testing Firebase: ${error.message}`);
      }
    };

    testFirebase();
  }, []);

  return (
    <div className="p-6 bg-card rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Firebase Integration Test</h2>
      <p className="mb-4">{status}</p>
      
      <div className="space-y-2">
        {Object.entries(services).map(([service, status]) => (
          <div key={service} className="flex justify-between items-center p-2 bg-muted rounded">
            <span className="font-medium capitalize">{service}:</span>
            <span className={status.includes('✅') ? 'text-green-600' : status.includes('⏭️') ? 'text-yellow-600' : 'text-red-600'}>
              {status}
            </span>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 rounded text-sm">
        <p className="font-medium">Note:</p>
        <p>If all services show ✅, your Firebase integration is working correctly.</p>
        <p className="mt-1">Analytics may show ⏭️ in development environment.</p>
      </div>
    </div>
  );
};

export default FirebaseTest;