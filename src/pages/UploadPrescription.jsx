import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Camera, FileText, CheckCircle, AlertCircle, Loader2, Share2, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { doc, setDoc, collection, getDocs } from 'firebase/firestore';

const UploadPrescription = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [uploadedDoc, setUploadedDoc] = useState(null);
  const [documents, setDocuments] = useState([]);

  const cameraInputRef = useRef(null);

  const fetchDocuments = async () => {
    if (!user) return;
    try {
      const docsRef = collection(db, `users/${user.uid}/documents`);
      const snapshot = await getDocs(docsRef);
      const docsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDocuments(docsData);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [user]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && (selectedFile.type.startsWith('image/') || selectedFile.type === 'application/pdf')) {
      setFile(selectedFile);
      if (selectedFile.type.startsWith('image/')) {
        setPreviewUrl(URL.createObjectURL(selectedFile));
      } else {
        setPreviewUrl(null);
      }
      setUploadedDoc(null);
      setError(null);
    } else {
      setError('Please select a valid image or PDF file.');
    }
  };

  const handleUpload = async () => {
    if (!file || !user) {
      setError('Please select a file and ensure you are logged in.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const timestamp = Date.now();

      // Upload file to Cloudinary
      console.log('Uploading file to Cloudinary...');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/auto/upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      const downloadURL = data.secure_url;
      console.log('Upload completed');
      setUploadProgress(70);

      // Save metadata to Firestore
      const docId = timestamp.toString();
      const docRef = doc(db, `users/${user.uid}/documents`, docId);
      await setDoc(docRef, {
        id: docId,
        fileName: file.name,
        fileType: file.type,
        size: file.size,
        uploadDate: new Date().toISOString(),
        downloadURL,
        userId: user.uid
      });

      console.log('Metadata saved to Firestore');
      setUploadedDoc({
        id: docId,
        fileName: file.name,
        fileType: file.type,
        size: file.size,
        uploadDate: new Date().toISOString(),
        downloadURL
      });
      setUploadProgress(100);
      await fetchDocuments();

    } catch (err) {
      console.error('Error uploading document:', err);
      setError(`Failed to upload document: ${err.message}`);
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCameraUpload = () => {
    cameraInputRef.current?.click();
  };

  const handleShare = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      alert('Download link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy link:', err);
      alert('Failed to copy link. Please copy manually: ' + url);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          onClick={() => navigate('/')}
          className="transition-all duration-200 hover:shadow-md"
        >
          <Upload className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="h-6 w-6 mr-3 text-primary" />
            Upload Medical Document
          </CardTitle>
          <CardDescription>
            Store your medical documents (images, reports, PDFs) securely in the cloud
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upload Methods */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* File Upload */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Upload from Device</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <Input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <Input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  className="hidden"
                  ref={cameraInputRef}
                  id="camera-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
                >
                  Choose File
                </label>
                {file && (
                  <p className="text-sm text-muted-foreground mt-2 truncate">
                    {file.name}
                  </p>
                )}
              </div>
            </div>

            {/* Camera Upload */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Scan with Camera</Label>
              <Button
                onClick={handleCameraUpload}
                className="w-full h-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg hover:border-primary/50 transition-colors"
                variant="outline"
              >
                <Camera className="h-12 w-12 text-muted-foreground mb-4" />
                <span className="text-sm font-medium">Take Photo</span>
              </Button>
            </div>
          </div>

          {previewUrl && (
            <div className="mt-6">
              <Label className="text-sm font-medium mb-2 block">Preview</Label>
              <Card>
                <CardContent className="p-4">
                  <img src={previewUrl} alt="Document Preview" className="w-full max-h-96 object-contain rounded-lg" />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Upload Button */}
          {file && (
            <div className="pt-4">
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                className="w-full transition-all duration-200 hover:shadow-lg"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    <span>Uploading... {Math.round(uploadProgress)}%</span>
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Upload Document
                  </>
                )}
              </Button>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg mt-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Uploaded Document */}
          {uploadedDoc && (
            <div className="mt-8 p-6 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center mb-4">
                <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                <h3 className="text-lg font-semibold text-green-800">Document Uploaded Successfully!</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-green-800 mb-2">File Details:</h4>
                  <div className="bg-white p-3 rounded-md">
                    <p className="font-medium">{uploadedDoc.fileName}</p>
                    <p className="text-sm text-muted-foreground">
                      Type: {uploadedDoc.fileType} • Size: {(uploadedDoc.size / 1024).toFixed(2)} KB
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Uploaded: {new Date(uploadedDoc.uploadDate).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    onClick={() => handleShare(uploadedDoc.downloadURL)}
                    className="flex-1 transition-all duration-200 hover:shadow-lg"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Document
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setUploadedDoc(null)}
                    className="transition-all duration-200 hover:shadow-md"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Another
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Documents</CardTitle>
          <CardDescription>All your uploaded medical documents</CardDescription>
        </CardHeader>
        <CardContent>
          {documents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc) => (
                <Card key={doc.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="aspect-square mb-3 flex items-center justify-center bg-muted rounded-lg">
                      {doc.fileType.startsWith('image/') ? (
                        <img src={doc.downloadURL} alt={doc.fileName} className="w-full h-full object-cover rounded" />
                      ) : (
                        <FileText className="h-12 w-12 text-muted-foreground" />
                      )}
                    </div>
                    <h4 className="font-medium truncate mb-1">{doc.fileName}</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      {new Date(doc.uploadDate).toLocaleDateString()}
                    </p>
                    <div className="flex space-x-2">
                      <Button onClick={() => window.open(doc.downloadURL, '_blank')} size="sm" variant="outline" className="flex-1">
                        <Eye className="h-4 w-4 mr-2" />
                        Open
                      </Button>
                      <Button onClick={() => handleShare(doc.downloadURL)} size="sm" variant="outline" className="flex-1">
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">No documents uploaded yet</h3>
              <p className="text-sm text-muted-foreground">Upload your first medical document above</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UploadPrescription;
