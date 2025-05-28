import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNotebooks } from "@/hooks/useNotebooks";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useMediaRecorder } from "@/hooks/useMediaRecorder";
import { uploadFile } from "@/utils/fileUpload";
import {
  FileText,
  Camera,
  Mic,
  Upload,
  Play,
  Pause,
  Square,
  X,
} from "lucide-react";

interface AddNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  notebookId: string;
  pageNumber: number;
  onNoteAdded?: () => void;
}

const AddNoteModal: React.FC<AddNoteModalProps> = ({
  isOpen,
  onClose,
  notebookId,
  pageNumber,
  onNoteAdded,
}) => {
  const [activeTab, setActiveTab] = useState("text");
  const [textContent, setTextContent] = useState("");
  const [photoCaption, setPhotoCaption] = useState("");
  const [voiceCaption, setVoiceCaption] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(
    null
  );

  const { addNote } = useNotebooks();
  const { toast } = useToast();
  const { user } = useAuth();

  const {
    isRecording,
    recordingTime,
    startRecording,
    stopRecording,
    cancelRecording,
  } = useMediaRecorder({
    onRecordingComplete: (blob) => {
      setRecordedBlob(blob);
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
    },
  });

  const handleSubmit = async (type: "text" | "photo" | "voice") => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to add notes",
        variant: "destructive",
      });
      return;
    }

    let content = "";
    let fileUrl = "";

    setIsUploading(true);

    try {
      switch (type) {
        case "text":
          if (!textContent.trim()) {
            toast({
              title: "Empty Note",
              description: "Please enter some text",
              variant: "destructive",
            });
            return;
          }
          content = textContent;
          break;

        case "photo":
          if (!selectedFile && !photoCaption.trim()) {
            toast({
              title: "Empty Photo Note",
              description: "Please add a photo or caption",
              variant: "destructive",
            });
            return;
          }

          if (selectedFile) {
            fileUrl = await uploadFile(selectedFile, "photos", user.id);
          }
          content = photoCaption || "Photo note";
          break;

        case "voice":
          if (!recordedBlob && !voiceCaption.trim()) {
            toast({
              title: "Empty Voice Note",
              description: "Please record audio or add a description",
              variant: "destructive",
            });
            return;
          }

          if (recordedBlob) {
            const audioFile = new File(
              [recordedBlob],
              `voice-${Date.now()}.webm`,
              { type: "audio/webm" }
            );
            fileUrl = await uploadFile(audioFile, "voice-recordings", user.id);
          }
          content = voiceCaption || "Voice recording";
          break;
      }

      await addNote(notebookId, pageNumber, {
        type_id: type,
        content,
        duration: type === "voice" ? recordingTime : undefined,
        file_url: fileUrl || undefined,
      });

      toast({
        title: "Note Added!",
        description: `${
          type.charAt(0).toUpperCase() + type.slice(1)
        } note has been saved`,
      });

      // Reset form
      resetForm();
      onClose();

      if (onNoteAdded) {
        onNoteAdded();
      }
    } catch (error) {
      console.error("Error adding note:", error);
      toast({
        title: "Error",
        description: "Failed to save note. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setTextContent("");
    setPhotoCaption("");
    setVoiceCaption("");
    setSelectedFile(null);
    setPreviewUrl(null);
    setRecordedBlob(null);
    setAudioUrl(null);
    setIsPlaying(false);
    if (audioElement) {
      audioElement.pause();
      setAudioElement(null);
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid File",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        toast({
          title: "File Too Large",
          description: "Please select an image under 10MB",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      if (!photoCaption) {
        setPhotoCaption(`Photo: ${file.name}`);
      }
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setPhotoCaption("");
  };

  const playPauseAudio = () => {
    if (!audioUrl) return;

    if (isPlaying && audioElement) {
      audioElement.pause();
      setIsPlaying(false);
    } else {
      const audio = new Audio(audioUrl);
      audio.onended = () => setIsPlaying(false);
      audio.play();
      setAudioElement(audio);
      setIsPlaying(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[90vw] max-w-md mx-auto h-[90vh] max-h-[600px] flex flex-col p-4">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-lg">
            Add Note to Page {pageNumber}
          </DialogTitle>
          <DialogDescription className="text-sm">
            Choose the type of note you'd like to add
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col min-h-0"
        >
          <TabsList className="grid w-full grid-cols-3 flex-shrink-0">
            <TabsTrigger
              value="text"
              className="flex items-center space-x-1 text-xs"
            >
              <FileText className="w-3 h-3" />
              <span className="hidden sm:inline">Text</span>
            </TabsTrigger>
            <TabsTrigger
              value="photo"
              className="flex items-center space-x-1 text-xs"
            >
              <Camera className="w-3 h-3" />
              <span className="hidden sm:inline">Photo</span>
            </TabsTrigger>
            <TabsTrigger
              value="voice"
              className="flex items-center space-x-1 text-xs"
            >
              <Mic className="w-3 h-3" />
              <span className="hidden sm:inline">Voice</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-auto">
            <TabsContent value="text" className="space-y-3 mt-3">
              <div className="space-y-2">
                <Label htmlFor="textNote" className="text-sm">
                  Text Note
                </Label>
                <Textarea
                  id="textNote"
                  placeholder="Type your note here..."
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  rows={8}
                  className="resize-none text-sm"
                />
                <p className="text-xs text-gray-500">
                  {textContent.length} characters
                </p>
              </div>
              <div className="flex space-x-2 pt-2">
                <Button
                  onClick={() => handleSubmit("text")}
                  className="flex-1 gradient-bg text-sm"
                  disabled={!textContent.trim() || isUploading}
                >
                  {isUploading ? "Saving..." : "Save Text Note"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="text-sm"
                >
                  Cancel
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="photo" className="space-y-3 mt-3">
              <div className="space-y-3">
                {/* Photo Upload Area */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  {previewUrl ? (
                    <div className="space-y-3">
                      <div className="relative">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="w-full max-w-xs h-32 object-cover rounded-lg mx-auto"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={removeFile}
                          className="absolute top-1 right-1 h-6 w-6 p-0"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-xs text-gray-600">
                        {selectedFile?.name}
                      </p>
                    </div>
                  ) : (
                    <>
                      <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-3">
                        Upload an image
                      </p>
                      <label htmlFor="photo-upload">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="text-xs"
                        >
                          <span>
                            <Upload className="w-3 h-3 mr-1" />
                            Choose File
                          </span>
                        </Button>
                      </label>
                      <input
                        id="photo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </>
                  )}
                </div>

                {/* Photo Caption */}
                <div className="space-y-2">
                  <Label htmlFor="photoCaption" className="text-sm">
                    Caption
                  </Label>
                  <Input
                    id="photoCaption"
                    placeholder="Add a caption..."
                    value={photoCaption}
                    onChange={(e) => setPhotoCaption(e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <Button
                  onClick={() => handleSubmit("photo")}
                  className="flex-1 gradient-bg text-sm"
                  disabled={
                    (!selectedFile && !photoCaption.trim()) || isUploading
                  }
                >
                  {isUploading ? "Uploading..." : "Save Photo Note"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="text-sm"
                >
                  Cancel
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="voice" className="space-y-3 mt-3">
              <div className="space-y-3">
                {/* Voice Recording Area */}
                <div className="border-2 border-gray-200 rounded-lg p-4 text-center">
                  {!isRecording && !recordedBlob && (
                    <div className="space-y-3">
                      <Mic className="w-8 h-8 text-gray-400 mx-auto" />
                      <p className="text-sm text-gray-600">
                        Record a voice note
                      </p>
                      <Button
                        onClick={startRecording}
                        className="gradient-bg text-sm"
                      >
                        <Mic className="w-3 h-3 mr-1" />
                        Start Recording
                      </Button>
                    </div>
                  )}

                  {isRecording && (
                    <div className="space-y-3">
                      <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
                        <Mic className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-red-600 font-medium text-sm">
                        Recording... {formatTime(recordingTime)}
                      </p>
                      <div className="flex space-x-2 justify-center">
                        <Button
                          onClick={stopRecording}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                        >
                          <Square className="w-3 h-3 mr-1" />
                          Stop
                        </Button>
                        <Button
                          onClick={cancelRecording}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {!isRecording && recordedBlob && (
                    <div className="space-y-3">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                        <Mic className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-green-600 font-medium text-sm">
                        Recording complete - {formatTime(recordingTime)}
                      </p>
                      <div className="flex space-x-2 justify-center">
                        <Button
                          onClick={playPauseAudio}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                        >
                          {isPlaying ? (
                            <Pause className="w-3 h-3 mr-1" />
                          ) : (
                            <Play className="w-3 h-3 mr-1" />
                          )}
                          {isPlaying ? "Pause" : "Play"}
                        </Button>
                        <Button
                          onClick={startRecording}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                        >
                          Re-record
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Voice Caption */}
                <div className="space-y-2">
                  <Label htmlFor="voiceCaption" className="text-sm">
                    Description
                  </Label>
                  <Input
                    id="voiceCaption"
                    placeholder="Add a description..."
                    value={voiceCaption}
                    onChange={(e) => setVoiceCaption(e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <Button
                  onClick={() => handleSubmit("voice")}
                  className="flex-1 gradient-bg text-sm"
                  disabled={
                    (recordingTime === 0 && !voiceCaption.trim()) || isUploading
                  }
                >
                  {isUploading ? "Uploading..." : "Save Voice Note"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="text-sm"
                >
                  Cancel
                </Button>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AddNoteModal;
