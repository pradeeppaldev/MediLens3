import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { FileText, Plus, Download, Eye, Calendar, Trash2, Share2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

const AllDocuments = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const documentsRef = collection(db, `users/${user.uid}/documents`);
        const snapshot = await getDocs(documentsRef);
        const documentsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setDocuments(documentsData);
      } catch (error) {
        console.error('Error fetching documents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [user]);

  const handleDeleteDocument = async () => {
    if (!user || !documentToDelete) return;

    try {
      const documentRef = doc(db, `users/${user.uid}/documents`, documentToDelete.id);
      await deleteDoc(documentRef);

      // Refresh documents list
      const documentsRef = collection(db, `users/${user.uid}/documents`);
      const snapshot = await getDocs(documentsRef);
      const documentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDocuments(documentsData);

      setShowDeleteModal(false);
      setDocumentToDelete(null);
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const handleDownload = (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading documents...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">All Documents</h1>
        <Link to="/prescriptions/upload">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </Link>
      </div>

      {documents.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {documents.map((doc) => (
            <Card key={doc.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="aspect-square w-full mb-3 flex items-center justify-center bg-muted rounded-lg">
                    {doc.type && doc.type.startsWith('image/') ? (
                      <img src={doc.downloadURL} alt={doc.name || 'Document'} className="w-full h-full object-cover rounded" />
                    ) : (
                      <FileText className="h-12 w-12 text-muted-foreground" />
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDocumentToDelete(doc);
                      setShowDeleteModal(true);
                    }}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <h4 className="font-medium truncate mb-1">{doc.fileName || 'Unnamed Document'}</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  {doc.uploadDate ? (() => {
                    const date = new Date(doc.uploadDate);
                    return !isNaN(date.getTime()) ? 'Uploaded on ' + date.toLocaleDateString() : 'Unknown';
                  })() : 'Unknown'}
                </p>
                <div className="grid grid-cols-3 gap-1">
                  <Button onClick={() => window.open(doc.downloadURL, '_blank')} size="sm" variant="outline" className="w-full">
                    <Eye className="h-4 w-4 mr-1" />
                    Open
                  </Button>
                  <Button onClick={() => handleShare(doc.downloadURL)} size="sm" variant="outline" className="w-full">
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                  <Button onClick={() => handleDownload(doc.downloadURL, doc.fileName || 'document')} size="sm" variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-medium text-muted-foreground mb-2">No documents found</h3>
          <p className="text-muted-foreground mb-6">Upload your first document to get started.</p>
          <Link to="/prescriptions/upload">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </Link>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {documentToDelete?.name || 'this document'}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteDocument}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AllDocuments;
