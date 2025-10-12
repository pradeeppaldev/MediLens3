import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import UploadPrescription from './pages/UploadPrescription';
import AddMedicine from './pages/AddMedicine';
import MedicineInfo from './pages/MedicineInfo';
import AllMedicines from './pages/AllMedicines';
import AllDocuments from './pages/AllDocuments';
import AllDoctors from './pages/AllDoctors';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import Analytics from './pages/Analytics';
import AIChat from './pages/AIChat';
import FloatingChatButton from './components/FloatingChatButton';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

// Public route component (redirects logged in users)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (user && !user.isGuest) {
    return <Navigate to="/" />;
  }
  
  return children;
};

// Layout component for authenticated routes
const AppLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 md:ml-64">
          {children}
        </main>
      </div>
      <Footer />
      <FloatingChatButton />
    </div>
  );
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute>
          <Register />
        </PublicRoute>
      } />
      <Route path="/" element={
        <ProtectedRoute>
          <AppLayout>
            <Dashboard />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <AppLayout>
            <Profile />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <AppLayout>
            <Settings />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/analytics" element={
        <ProtectedRoute>
          <AppLayout>
            <Analytics />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/prescriptions/upload" element={
        <ProtectedRoute>
          <AppLayout>
            <UploadPrescription />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/medications/add" element={
        <ProtectedRoute>
          <AppLayout>
            <AddMedicine />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/medications" element={
        <ProtectedRoute>
          <AppLayout>
            <AllMedicines />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/medications/:id" element={
        <ProtectedRoute>
          <AppLayout>
            <MedicineInfo />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/documents" element={
        <ProtectedRoute>
          <AppLayout>
            <AllDocuments />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/doctors" element={
        <ProtectedRoute>
          <AppLayout>
            <AllDoctors />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/ai/chat" element={
        <ProtectedRoute>
          <AppLayout>
            <AIChat />
          </AppLayout>
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default App;