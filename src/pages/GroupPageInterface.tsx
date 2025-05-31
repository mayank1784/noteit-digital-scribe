
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "lucide-react";
import Layout from "@/components/Layout";
import AddNoteModal from "@/components/AddNoteModal";
import EditNoteModal from "@/components/EditNoteModal";
import { NotePage, Note } from "@/types";

const GroupPageInterface = () => {
  const { notebookId, groupId, pageNumber } = useParams<{
    notebookId: string;
    groupId: string;
    pageNumber: string;
  }>();
  const { getNotebookGroup, getPage, deleteNote } = useNotebooks();
  const navigate = useNavigate();
  const [showAddNote, setShowAddNote] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [page, setPage] = useState<NotePage | null>(null);
  const [loading, setLoading] = useState(true);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [audioElements, setAudioElements] = useState<{
    [key: string]: HTMLAudioElement;
  }>({});

  const group = groupId ? getNotebookGroup(notebookId, groupId)[0] : undefined;
  const currentPageNum = parseInt(pageNumber);
  const sortedPages = group?.pages.sort((a, b) => a - b) || [];
  const currentPageIndex = sortedPages.indexOf(currentPageNum);

  useEffect(() => {
    const loadPage = async () => {
      if (notebookId && groupId && pageNumber) {
        try {
          console.log("page data fetching start");
          setLoading(true);
          const pageData = await getPage(notebookId, parseInt(pageNumber));
          console.log("page data fetched");
          setPage(pageData);
        } catch (error) {
          console.error("Error loading page:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadPage();
  }, [notebookId, groupId, pageNumber, getPage]);

  if (!group || loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            {loading ? "Loading..." : "Group Not Found"}
          </h1>
          {!loading && (
            <>
              <p className="text-gray-600 mt-2 text-sm">
                The requested group could not be found.
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
      if (groupId && group) {
        const pageData = await getPage(group.notebook_id, currentPageNum);
        setPage(pageData);
      }
    }
  };

  const handleNoteAdded = async () => {
    // Reload page data after adding a note
    if (groupId && group) {
      const pageData = await getPage(group.notebook_id, currentPageNum);
      setPage(pageData);
    }
  };

  const handleNoteUpdated = async () => {
    // Reload page data after updating a note
    if (groupId && group) {
      const pageData = await getPage(group.notebook_id, currentPageNum);
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
    <Layout title={`${group.name} - Page ${currentPageNum}`}>
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-8">
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
            <Link to={`/notebook/${group.notebook_id}`}>
              <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span className="hidden sm:inline">Back to Notebook</span>
                <span className="sm:hidden">Back</span>
              </Button>
            </Link>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                {group.name}
              </h1>
              <div className="flex flex-wrap gap-1 mt-1">
                {sortedPages.map((pageNum) => (
                  <Button
                    key={pageNum}
                    variant={pageNum === currentPageNum ? "default" : "outline"}
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() =>
                      navigate(`/${notebookId}/group/${groupId}/${pageNum}`)
                    }
                  >
                    {pageNum}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            {/* Page Navigation */}
            {currentPageIndex > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  navigate(
                    `/${notebookId}/group/${groupId}/${
                      sortedPages[currentPageIndex - 1]
                    }`
                  )
                }
                className="h-8 w-8 p-0"
              >
                <ArrowLeft className="w-3 h-3" />
              </Button>
            )}

            <span className="text-xs text-gray-600 px-1 whitespace-nowrap">
              {currentPageIndex + 1}/{sortedPages.length}
            </span>

            {currentPageIndex < sortedPages.length - 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  navigate(
                    `/${notebookId}/group/${groupId}/${
                      sortedPages[currentPageIndex + 1]
                    }`
                  )
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
            page.notes
              .sort(
                (a, b) =>
                  new Date(b.timestamp).getTime() -
                  new Date(a.timestamp).getTime()
              )
              .map((note) => (
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
                          {formatTimestamp(note.timestamp)}
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
                      {formatTimestamp(note.timestamp)}
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
                    {note.type_id === "photo" && note.file_url && (
                      <div className="mt-2">
                        <img
                          src={note.file_url}
                          alt="Note attachment"
                          className="max-w-full h-auto rounded-lg"
                        />
                      </div>
                    )}
                    {note.type_id === "voice" && note.file_url && (
                      <div className="mt-2 flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            playPauseAudio(note.id, note.file_url!)
                          }
                          className="flex items-center"
                        >
                          {playingAudio === note.id ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            downloadFile(
                              note.file_url!,
                              `voice-note-${note.id}.mp3`
                            )
                          }
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
          )}
        </div>

        {/* Add Note Modal */}
        {showAddNote && (
          <AddNoteModal
            isOpen={showAddNote}
            onClose={() => setShowAddNote(false)}
            onNoteAdded={handleNoteAdded}
            notebookId={group.notebook_id}
            pageNumber={currentPageNum}
          />
        )}

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

export default GroupPageInterface;
