
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNotebooks } from '@/hooks/useNotebooks';
import { ArrowLeft, ArrowRight, Plus, Trash2, Camera, Mic, FileText } from 'lucide-react';
import Layout from '@/components/Layout';
import AddNoteModal from '@/components/AddNoteModal';
import { NotePage } from '@/types';

const PageInterface = () => {
  const { notebookId, pageNumber } = useParams<{ notebookId: string; pageNumber: string }>();
  const { getNotebook, getPage, deleteNote } = useNotebooks();
  const navigate = useNavigate();
  const [showAddNote, setShowAddNote] = useState(false);
  const [page, setPage] = useState<NotePage | null>(null);
  const [loading, setLoading] = useState(true);

  const notebook = notebookId ? getNotebook(notebookId) : undefined;
  const currentPageNum = parseInt(pageNumber || '1');

  useEffect(() => {
    const loadPage = async () => {
      if (notebookId && pageNumber) {
        try {
          setLoading(true);
          const pageData = await getPage(notebookId, parseInt(pageNumber));
          setPage(pageData);
        } catch (error) {
          console.error('Error loading page:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadPage();
  }, [notebookId, pageNumber, getPage]);

  if (!notebook || loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            {loading ? 'Loading...' : 'Page Not Found'}
          </h1>
          {!loading && (
            <>
              <p className="text-gray-600 mt-2">The requested page could not be found.</p>
              <Link to="/dashboard">
                <Button className="mt-4">Back to Dashboard</Button>
              </Link>
            </>
          )}
        </div>
      </Layout>
    );
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getNoteIcon = (type: string) => {
    switch (type) {
      case 'text': return <FileText className="w-4 h-4" />;
      case 'photo': return <Camera className="w-4 h-4" />;
      case 'voice': return <Mic className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (confirm('Are you sure you want to delete this note?')) {
      await deleteNote(noteId);
      // Reload page data
      if (notebookId) {
        const pageData = await getPage(notebookId, currentPageNum);
        setPage(pageData);
      }
    }
  };

  const handleNoteAdded = async () => {
    // Reload page data after adding a note
    if (notebookId) {
      const pageData = await getPage(notebookId, currentPageNum);
      setPage(pageData);
    }
  };

  return (
    <Layout title={`${notebook.nickname} - Page ${currentPageNum}`}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to={`/notebook/${notebookId}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Notebook
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {notebook.nickname} - Page {currentPageNum}
              </h1>
              <p className="text-gray-600">of {notebook.total_pages} pages</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Page Navigation */}
            {currentPageNum > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/page/${notebookId}/${currentPageNum - 1}`)}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            
            <span className="text-sm text-gray-600 px-2">
              {currentPageNum} / {notebook.total_pages}
            </span>
            
            {currentPageNum < notebook.total_pages && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/page/${notebookId}/${currentPageNum + 1}`)}
              >
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Add Note Button */}
        <div className="mb-6">
          <Button onClick={() => setShowAddNote(true)} className="gradient-bg">
            <Plus className="w-4 h-4 mr-2" />
            Add Note
          </Button>
        </div>

        {/* Notes List */}
        <div className="space-y-4">
          {!page?.notes || page.notes.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Notes Yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Start adding digital notes to this page by clicking the "Add Note" button above.
                </p>
                <Button onClick={() => setShowAddNote(true)} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Note
                </Button>
              </CardContent>
            </Card>
          ) : (
            page.notes
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .map((note) => (
                <Card key={note.id} className="hover-scale">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getNoteIcon(note.type_id)}
                        <span className="font-medium capitalize">{note.type_id} Note</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                          {formatTimestamp(note.timestamp)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteNote(note.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {note.type_id === 'text' && (
                      <div className="prose prose-sm max-w-none">
                        <p className="whitespace-pre-wrap">{note.content}</p>
                      </div>
                    )}
                    
                    {note.type_id === 'photo' && (
                      <div className="space-y-2">
                        <div className="w-full max-w-md h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Camera className="w-12 h-12 text-gray-400" />
                          <span className="ml-2 text-gray-500">Photo</span>
                        </div>
                        {note.content && (
                          <p className="text-sm text-gray-600">{note.content}</p>
                        )}
                      </div>
                    )}
                    
                    {note.type_id === 'voice' && (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                            <Mic className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <div className="h-2 bg-gray-200 rounded-full flex-1">
                                <div className="h-full w-1/3 bg-blue-500 rounded-full"></div>
                              </div>
                              <span className="text-sm text-gray-600">
                                {note.duration ? `${Math.floor(note.duration / 60)}:${(note.duration % 60).toString().padStart(2, '0')}` : '0:30'}
                              </span>
                            </div>
                          </div>
                        </div>
                        {note.content && (
                          <p className="text-sm text-gray-600">{note.content}</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
          )}
        </div>

        {/* Add Note Modal */}
        <AddNoteModal
          isOpen={showAddNote}
          onClose={() => setShowAddNote(false)}
          notebookId={notebookId!}
          pageNumber={currentPageNum}
          onNoteAdded={handleNoteAdded}
        />
      </div>
    </Layout>
  );
};

export default PageInterface;
