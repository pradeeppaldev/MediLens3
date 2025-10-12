import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import {
  Pill,
  ArrowLeft,
  Clock,
  AlertTriangle,
  Info,
  Heart,
  Shield,
  Zap,
  Calendar,
  User
} from 'lucide-react';

const MedicineInfo = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Mock medicine data - in real app, fetch from API
  const medicine = {
    id: id || 'aspirin',
    name: 'Aspirin',
    genericName: 'Acetylsalicylic Acid',
    dosage: '100mg',
    frequency: 'Once daily',
    purpose: 'Pain relief, anti-inflammatory, anti-platelet',
    sideEffects: ['Stomach irritation', 'Heartburn', 'Increased bleeding risk'],
    interactions: ['Warfarin', 'Other NSAIDs', 'Blood thinners'],
    warnings: 'Do not take if allergic to aspirin or have bleeding disorders',
    manufacturer: 'Bayer',
    expiryDate: '2025-12-31',
    prescriptionRequired: false,
    category: 'Pain Relief',
    description: 'Aspirin is a salicylate used to treat pain, fever, and inflammation. It\'s also used as an anti-platelet agent to prevent heart attacks and strokes.'
  };

  const relatedMedicines = [
    { id: 'ibuprofen', name: 'Ibuprofen', category: 'Pain Relief' },
    { id: 'acetaminophen', name: 'Acetaminophen', category: 'Pain Relief' },
    { id: 'naproxen', name: 'Naproxen', category: 'Pain Relief' }
  ];

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          onClick={() => navigate('/medications')}
          className="transition-all duration-200 hover:shadow-md"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Medications
        </Button>
      </div>

      {/* Medicine Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Pill className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">{medicine.name}</CardTitle>
                <CardDescription className="text-lg">{medicine.genericName}</CardDescription>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground mt-2">{medicine.category}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Dosage</p>
              <p className="text-xl font-semibold">{medicine.dosage}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">{medicine.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-4 bg-accent/50 rounded-lg">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Frequency</p>
                <p className="text-sm text-muted-foreground">{medicine.frequency}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-accent/50 rounded-lg">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Expiry Date</p>
                <p className="text-sm text-muted-foreground">{medicine.expiryDate}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-accent/50 rounded-lg">
              <User className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Prescription</p>
                <p className="text-sm text-muted-foreground">
                  {medicine.prescriptionRequired ? 'Required' : 'Over-the-counter'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Purpose & Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Heart className="h-5 w-5 mr-2 text-primary" />
            Purpose & Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{medicine.purpose}</p>
        </CardContent>
      </Card>

      {/* Warnings & Precautions */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center text-orange-800">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Warnings & Precautions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-orange-700">{medicine.warnings}</p>
        </CardContent>
      </Card>

      {/* Side Effects */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2 text-primary" />
            Common Side Effects
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {medicine.sideEffects.map((effect, index) => (
              <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-background border border-input text-foreground">
                {effect}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Drug Interactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="h-5 w-5 mr-2 text-primary" />
            Drug Interactions
          </CardTitle>
          <CardDescription>
            Medications that may interact with {medicine.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {medicine.interactions.map((interaction, index) => (
              <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-destructive text-destructive-foreground">
                {interaction}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Related Medicines */}
      <Card>
        <CardHeader>
          <CardTitle>Related Medicines</CardTitle>
          <CardDescription>Similar medications you might be interested in</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {relatedMedicines.map((related) => (
              <Card key={related.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Pill className="h-6 w-6 text-primary" />
                    <div>
                      <h4 className="font-medium">{related.name}</h4>
                      <p className="text-sm text-muted-foreground">{related.category}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={() => navigate('/reminders/add')}
          className="flex-1 transition-all duration-200 hover:shadow-lg"
        >
          <Clock className="h-4 w-4 mr-2" />
          Set Reminder
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate('/medications/edit/' + medicine.id)}
          className="flex-1 transition-all duration-200 hover:shadow-md"
        >
          <Info className="h-4 w-4 mr-2" />
          Edit Information
        </Button>
      </div>
    </div>
  );
};

export default MedicineInfo;
