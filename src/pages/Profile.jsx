import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { User, Mail, Calendar, MapPin, Phone, Edit3, Pill, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const Profile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState({
    displayName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    location: '',
    joinDate: '',
    photoURL: ''
  });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // First, use auth user data
        setProfileData(prev => ({
          ...prev,
          displayName: user.displayName || '',
          email: user.email || '',
          photoURL: user.photoURL || ''
        }));

        // Fetch additional profile data from Firestore
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          setProfileData(prev => ({
            ...prev,
            phone: data.phone || '',
            dateOfBirth: data.dateOfBirth || '',
            location: data.location || '',
            joinDate: data.joinDate || new Date(user.metadata.creationTime).toLocaleDateString()
          }));
        } else {
          // If no profile document, create one with basic data
          await updateDoc(userRef, {
            displayName: user.displayName || '',
            email: user.email || '',
            photoURL: user.photoURL || '',
            joinDate: new Date().toLocaleDateString(),
            createdAt: new Date()
          });
          setProfileData(prev => ({
            ...prev,
            joinDate: new Date().toLocaleDateString()
          }));
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleEditProfile = () => {
    setEditForm(profileData);
    setShowEditModal(true);
    setEditing(true);
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, editForm);
      setProfileData(editForm);
      setShowEditModal(false);
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading profile...</div>;
  }

  const getAvatar = () => {
    if (profileData.photoURL) {
      return (
        <img
          src={profileData.photoURL}
          alt="Profile"
          className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
        />
      );
    } else {
      const initial = profileData.displayName.charAt(0).toUpperCase() || 'U';
      return (
        <div className="w-20 h-20 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-lg">
          {initial}
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-card rounded-lg shadow-md overflow-hidden">
          {/* Header with Avatar */}
          <div className="gradient-primary p-8 relative">
            <Button
              onClick={handleEditProfile}
              className="absolute top-4 right-4"
              variant="outline"
              size="sm"
            >
              <Edit3 className="h-4 w-4 mr-1" />
              Edit Profile
            </Button>
            <div className="flex flex-col items-center text-center">
              {getAvatar()}
              <h1 className="text-3xl font-bold text-white mt-4">{profileData.displayName || 'User'}</h1>
              <p className="text-primary-foreground mt-1">Patient Profile</p>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Personal Information */}
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-foreground">Personal Information</h2>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 text-muted-foreground mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Email</p>
                      <p className="text-sm text-muted-foreground">{profileData.email}</p>
                    </div>
                  </div>
                  
                  {profileData.phone && (
                    <div className="flex items-start">
                      <Phone className="h-5 w-5 text-muted-foreground mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Phone</p>
                        <p className="text-sm text-muted-foreground">{profileData.phone}</p>
                      </div>
                    </div>
                  )}
                  
                  {profileData.dateOfBirth && (
                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 text-muted-foreground mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Date of Birth</p>
                        <p className="text-sm text-muted-foreground">{profileData.dateOfBirth}</p>
                      </div>
                    </div>
                  )}
                  
                  {profileData.location && (
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Location</p>
                        <p className="text-sm text-muted-foreground">{profileData.location}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Account Details */}
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-foreground">Account Details</h2>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Member Since</p>
                      <p className="text-sm text-muted-foreground">{profileData.joinDate}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-foreground">Account Type</p>
                    <p className="text-sm text-muted-foreground">Patient</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-foreground">Provider</p>
                    <p className="text-sm text-muted-foreground">MediLens Health Platform</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity - Patient Focused */}
            <div className="mt-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Recent Activity</h2>
              <div className="space-y-4">
                <div className="flex items-center p-4 bg-muted rounded-lg">
                  <div className="bg-accent text-accent-foreground rounded-full p-2 mr-4">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Scheduled doctor appointment</p>
                    <p className="text-sm text-muted-foreground">Today, 10:30 AM</p>
                  </div>
                </div>
                
                <div className="flex items-center p-4 bg-muted rounded-lg">
                  <div className="bg-accent text-accent-foreground rounded-full p-2 mr-4">
                    <Pill className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Added new medication</p>
                    <p className="text-sm text-muted-foreground">Yesterday, 2:15 PM</p>
                  </div>
                </div>
                
                <div className="flex items-center p-4 bg-muted rounded-lg">
                  <div className="bg-accent text-accent-foreground rounded-full p-2 mr-4">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Uploaded prescription document</p>
                    <p className="text-sm text-muted-foreground">Oct 5, 2024</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
              <DialogDescription>Update your personal information.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="displayName">Full Name</Label>
                <Input
                  id="displayName"
                  name="displayName"
                  value={editForm.displayName || ''}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={editForm.phone || ''}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={editForm.dateOfBirth || ''}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={editForm.location || ''}
                  onChange={handleInputChange}
                  placeholder="Enter your location"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowEditModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveProfile}>Save Changes</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Profile;
