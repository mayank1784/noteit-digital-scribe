import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNotebooks } from "@/hooks/useNotebooks";
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  Camera,
  Mic,
  FileText,
  Play,
  Pause,
  Download,
  Edit,
  Clock,
} from "lucide-react";
import Layout from "@/components/Layout";
import AddNoteModal from "@/components/AddNoteModal";
import EditNoteModal from "@/components/EditNoteModal";
import { NotePage, Note } from "@/types";

const PageInterface = () => {
  const { notebookId, pageNumber } = useParams<{
    notebookId: string;
    pageNumber: string;
  }>();
  const { getNotebook, getPage, deleteNote } = useNotebooks();
  const navigate = useNavigate();
  const [showAddNote, setShowAddNote] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [page, setPage] = useState<NotePage | null>(null);
  const [loading, setLoading] = useState(true);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [audioElements, setAudioElements] = useState<{
    [key: string]: HTMLAudioElement;
  }>({});

  const notebook = notebookId ? getNotebook(notebookId) : undefined;
  const currentPageNum = parseInt(pageNumber || "1");

  useEffect(() => {
    const loadPage = async () => {
      if (notebookId && pageNumber) {
        try {
          setLoading(true);
          const pageData = await getPage(notebookId, parseInt(pageNumber));
          setPage(pageData);
        } catch (error) {
          console.error("Error loading page:", error);
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
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            {loading ? "Loading..." : "Page Not Found"}
          </h1>
          {!loading && (
            <>
              <p className="text-gray-600 mt-2 text-sm">
                The requested page could not be found.
              </p>
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
    return new Date(timestamp).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getNoteIcon = (type: string) => {
    switch (type) {
      case "text":
        return <FileText className="w-4 h-4" />;
      case "photo":
        return <Camera className="w-4 h-4" />;
      case "voice":
        return <Mic className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (confirm("Are you sure you want to delete this note?")) {
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

  const handleNoteUpdated = async () => {
    // Reload page data after updating a note
    if (notebookId) {
      const pageData = await getPage(notebookId, currentPageNum);
      setPage(pageData);
    }
    setEditingNote(null);
  };

  const playPauseAudio = (noteId: string, audioUrl: string) => {
    const currentAudio = audioElements[noteId];

    if (playingAudio === noteId && currentAudio) {
      currentAudio.pause();
      setPlayingAudio(null);
    } else {
      // Pause any currently playing audio
      Object.values(audioElements).forEach((audio) => audio.pause());
      setPlayingAudio(null);

      // Play the selected audio
      let audio = currentAudio;
      if (!audio) {
        audio = new Audio(audioUrl);
        audio.onended = () => setPlayingAudio(null);
        setAudioElements((prev) => ({ ...prev, [noteId]: audio }));
      }

      audio.play();
      setPlayingAudio(noteId);
    }
  };

  const downloadFile = (url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Layout title={`${notebook.nickname} - Page ${currentPageNum}`}>
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-8">
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
            <Link to={`/notebook/${notebookId}`}>
              <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span className="hidden sm:inline">Back to Notebook</span>
                <span className="sm:hidden">Back</span>
              </Button>
            </Link>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                {notebook.nickname}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600">
                Page {currentPageNum} of {notebook.total_pages}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            {/* Page Navigation */}
            {currentPageNum > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  navigate(`/page/${notebookId}/${currentPageNum - 1}`)
                }
                className="h-8 w-8 p-0"
              >
                <ArrowLeft className="w-3 h-3" />
              </Button>
            )}

            <span className="text-xs text-gray-600 px-1 whitespace-nowrap">
              {currentPageNum}/{notebook.total_pages}
            </span>

            {currentPageNum < notebook.total_pages && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  navigate(`/page/${notebookId}/${currentPageNum + 1}`)
                }
                className="h-8 w-8 p-0"
              >
                <ArrowRight className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Add Note Button */}
        <div className="mb-4 sm:mb-6">
          <Button
            onClick={() => setShowAddNote(true)}
            className="gradient-bg w-full sm:w-auto text-sm"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Note
          </Button>
        </div>

        {/* Notes List */}
        <div className="space-y-3 sm:space-y-4">
          {!page?.notes || page.notes.length === 0 ? (
            <Card className="text-center py-8 sm:py-12">
              <CardContent>
                <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                  No Notes Yet
                </h3>
                <p className="text-sm text-gray-600 mb-3 sm:mb-4 px-4">
                  Start adding digital notes to this page by clicking the "Add
                  Note" button above.
                </p>
                <Button
                  onClick={() => setShowAddNote(true)}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Add Your First Note
                </Button>
              </CardContent>
            </Card>
          ) : (
            page.notes.map((note) => (
              <Card key={note.id} className="hover-scale">
                <CardHeader className="pb-2 sm:pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getNoteIcon(note.type_id)}
                      <span className="text-sm font-medium capitalize">
                        {note.type_id} Note
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500 hidden sm:inline">
                        {formatTimestamp(note.created_at)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingNote(note)}
                        className="text-blue-600 hover:text-blue-700 h-6 w-6 p-0"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-red-600 hover:text-red-700 h-6 w-6 p-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 sm:hidden">
                    {formatTimestamp(note.created_at)}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {note.type_id === "text" && (
                    <div className="prose prose-sm max-w-none">
                      <p className="whitespace-pre-wrap text-sm">
                        {note.content}
                      </p>
                    </div>
                  )}

                  {note.type_id === "photo" && (
                    <div className="space-y-2">
                      {note.file_url ? (
                        <div className="relative">
                          <img
                            src={note.file_url}
                            alt="Note photo"
                            className="w-full max-w-md h-32 sm:h-48 object-cover rounded-lg cursor-pointer"
                            onClick={() => window.open(note.file_url, "_blank")}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              downloadFile(
                                note.file_url!,
                                `photo-${note.id}.jpg`
                              )
                            }
                            className="absolute top-2 right-2 h-6 w-6 p-0 bg-white/80"
                          >
                            <Download className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="w-full max-w-md h-32 sm:h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Camera className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" />
                        </div>
                      )}
                      {note.content && (
                        <p className="text-xs sm:text-sm text-gray-600">
                          {note.content}
                        </p>
                      )}
                    </div>
                  )}

                  {note.type_id === "voice" && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            note.file_url &&
                            playPauseAudio(note.id, note.file_url)
                          }
                          disabled={!note.file_url}
                          className="h-8 w-8 p-0"
                        >
                          {playingAudio === note.id ? (
                            <Pause className="w-3 h-3" />
                          ) : (
                            <Play className="w-3 h-3" />
                          )}
                        </Button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <div className="h-1.5 sm:h-2 bg-gray-200 rounded-full flex-1">
                              <div className="h-full w-1/3 bg-blue-500 rounded-full"></div>
                            </div>
                            <span className="text-xs text-gray-600 whitespace-nowrap">
                              {note.duration
                                ? `${Math.floor(note.duration / 60)}:${(
                                    note.duration % 60
                                  )
                                    .toString()
                                    .padStart(2, "0")}`
                                : "0:30"}
                            </span>
                          </div>
                        </div>
                        {note.file_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              downloadFile(
                                note.file_url!,
                                `voice-${note.id}.webm`
                              )
                            }
                            className="h-6 w-6 p-0"
                          >
                            <Download className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                      {note.content && (
                        <p className="text-xs sm:text-sm text-gray-600">
                          {note.content}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pb-2 sm:pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs text-gray-500 hidden sm:inline">
                        {formatTimestamp(note.updated_at)}
                      </span>
                    </div>
                  </div>
                </CardFooter>
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

        {/* Edit Note Modal */}
        {editingNote && (
          <EditNoteModal
            isOpen={!!editingNote}
            onClose={() => setEditingNote(null)}
            note={editingNote}
            onNoteUpdated={handleNoteUpdated}
          />
        )}
      </div>
    </Layout>
  );
};

export default PageInterface;
