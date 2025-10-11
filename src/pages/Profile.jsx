import React from 'react';
import { User, Mail, Calendar, MapPin, Phone } from 'lucide-react';

const Profile = () => {
  return (
    <div className="min-h-screen bg-background dark:bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-card dark:bg-card rounded-lg shadow-md overflow-hidden">
          <div className="gradient-primary p-6">
            <div className="flex flex-col md:flex-row items-center">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center text-gray-500">
                <User className="h-8 w-8 text-gray-500" />
              </div>
              <div className="mt-4 md:mt-0 md:ml-6 text-center md:text-left">
                <h1 className="text-2xl font-bold text-white">Dr. Jane Smith</h1>
                <p className="text-primary-foreground mt-1">Radiologist</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground dark:text-foreground">Personal Information</h2>
                
                <div className="flex items-start">
                  <Mail className="h-5 w-5 text-muted-foreground mt-1 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-foreground dark:text-foreground">Email</p>
                    <p className="text-sm text-muted-foreground">jane.smith@medilens.com</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Phone className="h-5 w-5 text-muted-foreground mt-1 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-foreground dark:text-foreground">Phone</p>
                    <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-1 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-foreground dark:text-foreground">Location</p>
                    <p className="text-sm text-muted-foreground">New York, NY</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-1 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-foreground dark:text-foreground">Member Since</p>
                    <p className="text-sm text-muted-foreground">January 2023</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground dark:text-foreground">Professional Details</h2>
                
                <div>
                  <p className="text-sm font-medium text-foreground dark:text-foreground">Specialization</p>
                  <p className="text-sm text-muted-foreground">Medical Imaging, Radiology</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-foreground dark:text-foreground">License Number</p>
                  <p className="text-sm text-muted-foreground">MD-2023-12345</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-foreground dark:text-foreground">Hospital Affiliation</p>
                  <p className="text-sm text-muted-foreground">Metropolitan Medical Center</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-foreground dark:text-foreground">Years of Experience</p>
                  <p className="text-sm text-muted-foreground">8 years</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-foreground dark:text-foreground mb-4">Recent Activity</h2>
              <div className="space-y-4">
                <div className="flex items-center p-4 bg-muted dark:bg-muted rounded-lg">
                  <div className="bg-accent text-accent-foreground rounded-full p-2">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-foreground dark:text-foreground">Completed 5 image analyses</p>
                    <p className="text-sm text-muted-foreground">Today, 10:30 AM</p>
                  </div>
                </div>
                
                <div className="flex items-center p-4 bg-muted dark:bg-muted rounded-lg">
                  <div className="bg-accent text-accent-foreground rounded-full p-2">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-foreground dark:text-foreground">New patient consultation</p>
                    <p className="text-sm text-muted-foreground">Yesterday, 2:15 PM</p>
                  </div>
                </div>
                
                <div className="flex items-center p-4 bg-muted dark:bg-muted rounded-lg">
                  <div className="bg-accent text-accent-foreground rounded-full p-2">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-foreground dark:text-foreground">Received peer review feedback</p>
                    <p className="text-sm text-muted-foreground">Oct 5, 2025</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;