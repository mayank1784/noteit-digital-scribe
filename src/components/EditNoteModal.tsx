import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useNotebooks } from "@/hooks/useNotebooks";
import { useMediaRecorder } from "@/hooks/useMediaRecorder";
import { uploadFile, deleteFile } from "@/utils/fileUpload";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { FlipHorizontal } from "lucide-react";
import {
  Camera,
  Mic,
  Play,
  Pause,
  Square,
  X,
  Save,
  Upload,
  Settings,
  SwitchCamera,
  ZoomOut,
  ZoomIn,
  RefreshCw,
  Check,
} from "lucide-react";
import { Note } from "@/types";
import { useCamera } from "@/hooks/useCamera";
import { useImageCompressor } from "@/hooks/useImageCompressor";

interface EditNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: Note;
  onNoteUpdated: () => void;
}

const EditNoteModal = ({
  isOpen,
  onClose,
  note,
  onNoteUpdated,
}: EditNoteModalProps) => {
  const { updateNote } = useNotebooks();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState(note.content);
  const [newFileUrl, setNewFileUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [cameraMode, setCameraMode] = useState<"upload" | "camera" | "preview">(
    "upload"
  );
  const [showCameraControls, setShowCameraControls] = useState(false);
  const [compressionQuality, setCompressionQuality] = useState(0.8);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [isCameraFullscreen, setIsCameraFullscreen] = useState(false);
  const camera = useCamera();

  const {
    isRecording: isVoiceRecording,
    recordingTime,
    startRecording,
    stopRecording,
    cancelRecording,
  } = useMediaRecorder({
    onRecordingComplete: (audioBlob) => {
      const url = URL.createObjectURL(audioBlob);
      setPreviewUrl(url);
    },
  });

  // Reset state when note changes
  useEffect(() => {
    if (note) {
      setContent(note.content);
      setNewFileUrl(null);
      setPreviewUrl(null);
      setIsPlaying(false);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    }
  }, [note]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [cameraStream, previewUrl]);

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      let fileUrlToSave: string | null | undefined = undefined;
      let fileToDelete: string | null = null;

      // Handle file upload if new file exists
      if (previewUrl || newFileUrl) {
        try {
          if (note.type_id === "photo" && previewUrl) {
            // Only upload if we don't already have a newFileUrl
            if (!newFileUrl) {
              const response = await fetch(previewUrl);
              const blob = await response.blob();
              const photoFile = new File([blob], `photo-${Date.now()}.jpg`, {
                type: "image/jpeg",
              });
              fileUrlToSave = await uploadFile(photoFile, "photos", user.id);
            } else {
              fileUrlToSave = newFileUrl;
            }

            // Mark old file for deletion if exists and not already replaced
            if (note.file_url && note.file_url !== newFileUrl) {
              fileToDelete = note.file_url;
            }
          } else if (note.type_id === "voice" && previewUrl) {
            // Create file from blob for voice recordings
            const response = await fetch(previewUrl);
            const blob = await response.blob();
            const audioFile = new File([blob], `voice-${Date.now()}.webm`, {
              type: "audio/webm",
            });
            fileUrlToSave = await uploadFile(
              audioFile,
              "voice-recordings",
              user.id
            );

            // Mark old file for deletion if exists
            if (note.file_url) {
              fileToDelete = note.file_url;
            }
          } else if (newFileUrl) {
            // For direct file uploads
            fileUrlToSave = newFileUrl;

            // Mark old file for deletion if exists
            if (note.file_url && note.file_url !== newFileUrl) {
              fileToDelete = note.file_url;
            }
          }
        } catch (uploadError) {
          console.error("Error uploading file:", uploadError);
          toast({
            title: "Upload Failed",
            description: "Could not upload file. Please try again.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
      } else if (newFileUrl === null) {
        // User removed the file
        fileUrlToSave = null;
        if (note.file_url) {
          fileToDelete = note.file_url;
        }
      }

      // Update note content
      await updateNote(note.id, content, fileUrlToSave);

      // Delete old file after successful update
      if (fileToDelete) {
        try {
          await deleteFile(
            fileToDelete,
            note.type_id === "photo" ? "photos" : "voice-recordings"
          );
        } catch (deleteError) {
          console.error("Error deleting old file:", deleteError);
          // Non-blocking error, just log
        }
      }

      toast({
        title: "Note Updated!",
        description: "Your changes have been saved",
      });

      onNoteUpdated();
      handleClose();
    } catch (error) {
      console.error("Error updating note:", error);
      toast({
        title: "Error",
        description: "Failed to update note. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const startCamera = async () => {
    try {
      setIsCameraReady(false);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      setCameraStream(stream);
      setIsTakingPhoto(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        // Wait for video metadata to load
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current
              .play()
              .then(() => {
                setIsCameraReady(true);
              })
              .catch((error) => {
                console.error("Error playing video:", error);
                toast({
                  title: "Camera Error",
                  description: "Could not start camera preview.",
                  variant: "destructive",
                });
              });
          }
        };
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast({
        title: "Camera Error",
        description: "Could not access camera. Please check permissions.",
        variant: "destructive",
      });
      stopCamera();
    }
  };

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current || !isCameraReady) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Draw the current video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const url = canvas.toDataURL("image/jpeg", 0.95);
      setPreviewUrl(url);
      setNewFileUrl(null); // Clear any previously uploaded file
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsTakingPhoto(false);
    setIsCameraReady(false);
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!user) return;
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file based on note type
    if (note.type_id === "photo" && !file.type.startsWith("image/")) {
      toast({
        title: "Invalid File",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    if (note.type_id === "voice" && !file.type.startsWith("audio/")) {
      toast({
        title: "Invalid File",
        description: "Please select an audio file",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const fileUrl = await uploadFile(
        file,
        note.type_id === "photo" ? "photos" : "voice-recordings",
        user.id
      );
      setNewFileUrl(fileUrl);
      setPreviewUrl(null); // Clear any camera preview

      // Create preview for photo
      if (note.type_id === "photo") {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Upload Failed",
        description: "Could not upload file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // const removeFile = () => {
  //   setNewFileUrl(null);
  //   setPreviewUrl(null);

  //   if (note.type_id === "photo") {
  //     setContent("");
  //   }
  // };

  const playPauseAudio = () => {
    if (!previewUrl) return;

    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      const audio = new Audio(previewUrl);
      audio.onended = () => setIsPlaying(false);
      audio.play();
      audioRef.current = audio;
      setIsPlaying(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleClose = () => {
    // Clean up recordings if canceled
    if (isVoiceRecording) {
      cancelRecording();
    }
    if (cameraStream) {
      stopCamera();
    }
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    onClose();
  };

  const getCurrentFileUrl = () => {
    if (previewUrl) return previewUrl;
    if (newFileUrl) return newFileUrl;
    return note.file_url || null;
  };

  const hasFileChanged = () => {
    return previewUrl || newFileUrl !== null;
  };

  const { compressImage } = useImageCompressor();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">
            Edit{" "}
            {note.type_id === "text"
              ? "Text"
              : note.type_id === "photo"
              ? "Photo"
              : "Voice"}{" "}
            Note
          </DialogTitle>
          <DialogDescription className="text-sm">
            Update your note content and media
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Content Editor */}
          <div className="space-y-2">
            <Label htmlFor="note-content" className="text-sm">
              {note.type_id === "text" ? "Content" : "Caption/Description"}
            </Label>
            {note.type_id === "text" ? (
              <Textarea
                id="note-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                className="resize-none text-sm"
                placeholder="Update your note content..."
              />
            ) : (
              <Input
                id="note-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="text-sm"
                placeholder="Add a caption or description..."
              />
            )}
          </div>

          {/* Media Editor */}
          {note.type_id !== "text" && (
            <div className="space-y-3">
              <Label className="text-sm">
                {note.type_id === "photo" ? "Photo" : "Recording"}
              </Label>

              {/* Photo Editor */}
              {note.type_id === "photo" && (
                <>
                  {/* Camera/Upload Controls */}
                  {cameraMode === "upload" && (
                    <div className="flex space-x-2 mb-3">
                      <Button
                        onClick={() => {
                          setCameraMode("camera");
                          camera.startCamera();
                        }}
                        variant="outline"
                        className="flex-1 text-sm"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Take Photo
                      </Button>
                      <label htmlFor="photo-upload" className="flex-1">
                        <Button
                          variant="outline"
                          className="w-full text-sm"
                          asChild
                        >
                          <span>
                            <Upload className="w-4 h-4 mr-2" />
                            Upload File
                          </span>
                        </Button>
                      </label>
                    </div>
                  )}
                  {/* Camera View */}
                  {cameraMode === "camera" && (
                    <div className="space-y-3">
                      {/* Fullscreen Overlay (optional, as in AddNoteModal) */}
                      {isCameraFullscreen && (
                        <div
                          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col items-center justify-center"
                          style={{
                            top: 0,
                            left: 0,
                            width: "100vw",
                            height: "100vh",
                          }}
                        >
                          <div className="relative w-full h-full flex flex-col items-center justify-center">
                            <video
                              ref={camera.videoRef}
                              autoPlay
                              playsInline
                              muted
                              className="w-full h-full object-contain bg-black"
                              style={{
                                maxWidth: "100vw",
                                maxHeight: "100vh",
                                transform: `scale(${camera.zoom}) rotate(${
                                  camera.rotation
                                }deg) ${
                                  camera.flipHorizontal ? "scaleX(-1)" : ""
                                }`,
                              }}
                            />
                            <canvas ref={camera.canvasRef} className="hidden" />
                            {/* Camera Controls Overlay */}
                            <div className="absolute top-2 right-2 flex space-x-1 z-10">
                              <Button
                                size="sm"
                                variant="secondary"
                                className="h-8 w-8 p-0"
                                onClick={() =>
                                  setShowCameraControls(!showCameraControls)
                                }
                              >
                                <Settings className="w-4 h-4" />
                              </Button>
                              {camera.devices.length > 1 && (
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  className="h-8 w-8 p-0"
                                  onClick={camera.switchCamera}
                                >
                                  <SwitchCamera className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="destructive"
                                className="h-8 w-8 p-0"
                                onClick={() => setIsCameraFullscreen(false)}
                                title="Exit Fullscreen"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                            {/* Extended Camera Controls */}
                            {showCameraControls && (
                              <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-75 rounded-lg p-2 z-10">
                                <div className="grid grid-cols-3 gap-2 mb-2">
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() =>
                                      camera.setZoom(
                                        Math.max(0.5, camera.zoom - 0.1)
                                      )
                                    }
                                  >
                                    <ZoomOut className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() =>
                                      camera.setZoom(
                                        Math.min(3, camera.zoom + 0.1)
                                      )
                                    }
                                  >
                                    <ZoomIn className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() =>
                                      camera.setFlipHorizontal(
                                        !camera.flipHorizontal
                                      )
                                    }
                                  >
                                    <FlipHorizontal className="w-3 h-3" />
                                  </Button>
                                </div>
                                <div className="flex space-x-2 text-xs text-white">
                                  <span>Zoom: {camera.zoom.toFixed(1)}x</span>
                                  <span>
                                    Quality:{" "}
                                    {Math.round(compressionQuality * 100)}%
                                  </span>
                                </div>
                                <input
                                  type="range"
                                  min="0.3"
                                  max="1"
                                  step="0.1"
                                  value={compressionQuality}
                                  onChange={(e) =>
                                    setCompressionQuality(
                                      parseFloat(e.target.value)
                                    )
                                  }
                                  className="w-full mt-1"
                                />
                              </div>
                            )}
                            {/* Capture/Cancel Buttons */}
                            <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-2 z-10">
                              <Button
                                onClick={async () => {
                                  const captured = await camera.capturePhoto();
                                  if (captured) {
                                    const compressed = await compressImage(
                                      captured,
                                      compressionQuality
                                    );
                                    setCapturedFile(compressed);
                                    setSelectedFile(compressed);
                                    setPreviewUrl(
                                      URL.createObjectURL(compressed)
                                    );
                                    setCameraMode("preview");
                                    camera.stopCamera();
                                  }
                                }}
                                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white max-w-xs"
                                disabled={!camera.isActive}
                              >
                                <Camera className="w-4 h-4 mr-2" />
                                Capture
                              </Button>
                              <Button
                                onClick={() => {
                                  setIsCameraFullscreen(false);
                                  setCameraMode("upload");
                                  camera.stopCamera();
                                }}
                                variant="outline"
                                className="max-w-xs"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                      {/* Normal Camera View (not fullscreen) */}
                      {!isCameraFullscreen && (
                        <div className="relative bg-black rounded-lg overflow-hidden">
                          <video
                            ref={camera.videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-64 object-cover"
                            style={{
                              transform: `scale(${camera.zoom}) rotate(${
                                camera.rotation
                              }deg) ${
                                camera.flipHorizontal ? "scaleX(-1)" : ""
                              }`,
                            }}
                          />
                          <canvas ref={camera.canvasRef} className="hidden" />
                          {/* Camera Controls Overlay */}
                          <div className="absolute top-2 right-2 flex space-x-1">
                            <Button
                              size="sm"
                              variant="secondary"
                              className="h-8 w-8 p-0"
                              onClick={() =>
                                setShowCameraControls(!showCameraControls)
                              }
                            >
                              <Settings className="w-4 h-4" />
                            </Button>
                            {camera.devices.length > 1 && (
                              <Button
                                size="sm"
                                variant="secondary"
                                className="h-8 w-8 p-0"
                                onClick={camera.switchCamera}
                              >
                                <SwitchCamera className="w-4 h-4" />
                              </Button>
                            )}
                            {/* Fullscreen Button */}
                            <Button
                              size="sm"
                              variant="secondary"
                              className="h-8 w-8 p-0"
                              onClick={() => setIsCameraFullscreen(true)}
                              title="Fullscreen"
                            >
                              <ZoomIn className="w-4 h-4" />
                            </Button>
                          </div>
                          {/* Extended Camera Controls */}
                          {showCameraControls && (
                            <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-75 rounded-lg p-2">
                              <div className="grid grid-cols-3 gap-2 mb-2">
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() =>
                                    camera.setZoom(
                                      Math.max(0.5, camera.zoom - 0.1)
                                    )
                                  }
                                >
                                  <ZoomOut className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() =>
                                    camera.setZoom(
                                      Math.min(3, camera.zoom + 0.1)
                                    )
                                  }
                                >
                                  <ZoomIn className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() =>
                                    camera.setFlipHorizontal(
                                      !camera.flipHorizontal
                                    )
                                  }
                                >
                                  <FlipHorizontal className="w-3 h-3" />
                                </Button>
                              </div>
                              <div className="flex space-x-2 text-xs text-white">
                                <span>Zoom: {camera.zoom.toFixed(1)}x</span>
                                <span>
                                  Quality:{" "}
                                  {Math.round(compressionQuality * 100)}%
                                </span>
                              </div>
                              <input
                                type="range"
                                min="0.3"
                                max="1"
                                step="0.1"
                                value={compressionQuality}
                                onChange={(e) =>
                                  setCompressionQuality(
                                    parseFloat(e.target.value)
                                  )
                                }
                                className="w-full mt-1"
                              />
                            </div>
                          )}
                        </div>
                      )}
                      {camera.error && (
                        <p className="text-red-500 text-sm">{camera.error}</p>
                      )}
                      <div className="flex space-x-2">
                        <Button
                          onClick={async () => {
                            const captured = await camera.capturePhoto();
                            if (captured) {
                              const compressed = await compressImage(
                                captured,
                                compressionQuality
                              );
                              setCapturedFile(compressed);
                              setSelectedFile(compressed);
                              setPreviewUrl(URL.createObjectURL(compressed));
                              setCameraMode("preview");
                              camera.stopCamera();
                            }
                          }}
                          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                          disabled={!camera.isActive}
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          Capture
                        </Button>
                        <Button
                          onClick={() => {
                            setCameraMode("upload");
                            camera.stopCamera();
                          }}
                          variant="outline"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                  {/* Photo Upload Area */}
                  {cameraMode === "upload" && (
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
                              onClick={() => {
                                setSelectedFile(null);
                                setCapturedFile(null);
                                if (previewUrl) {
                                  URL.revokeObjectURL(previewUrl);
                                  setPreviewUrl(null);
                                }
                                setCameraMode("upload");
                              }}
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
                            Upload an image or take a photo
                          </p>
                        </>
                      )}
                      <input
                        id="photo-upload"
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (!file.type.startsWith("image/")) {
                              toast({
                                title: "Invalid File",
                                description: "Please select an image file",
                                variant: "destructive",
                              });
                              return;
                            }
                            if (file.size > 10 * 1024 * 1024) {
                              toast({
                                title: "File Too Large",
                                description:
                                  "Please select an image under 10MB",
                                variant: "destructive",
                              });
                              return;
                            }
                            const compressedFile = await compressImage(
                              file,
                              compressionQuality
                            );
                            setSelectedFile(compressedFile);
                            setPreviewUrl(URL.createObjectURL(compressedFile));
                          }
                        }}
                        className="hidden"
                      />
                    </div>
                  )}
                  {/* Photo Preview with Retake Option */}
                  {cameraMode === "preview" && previewUrl && (
                    <div className="space-y-3">
                      <div className="relative">
                        <img
                          src={previewUrl}
                          alt="Captured photo"
                          className="w-full max-h-64 object-cover rounded-lg"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => {
                            setCapturedFile(null);
                            setSelectedFile(null);
                            if (previewUrl) {
                              URL.revokeObjectURL(previewUrl);
                              setPreviewUrl(null);
                            }
                            setCameraMode("camera");
                            camera.startCamera();
                          }}
                          variant="outline"
                          className="flex-1"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Retake
                        </Button>
                        <Button
                          onClick={() => setCameraMode("upload")}
                          variant="outline"
                          className="flex-1"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Keep Photo
                        </Button>
                      </div>
                    </div>
                  )}
                  {/* Photo Caption (optional, if you want to allow editing) */}
                  <div className="space-y-2">
                    <Label htmlFor="photoCaption" className="text-sm">
                      Caption
                    </Label>
                    <Input
                      id="photoCaption"
                      placeholder="Add a caption..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                </>
              )}

              {/* Voice Editor */}
              {note.type_id === "voice" && (
                <>
                  {/* Current/New Audio Preview */}
                  {getCurrentFileUrl() && (
                    <div className="border rounded-lg p-3 relative">
                      <audio
                        controls
                        src={getCurrentFileUrl() || ""}
                        className="w-full"
                      />
                      {/* <Button
                        variant="destructive"
                        size="sm"
                        onClick={removeFile}
                        className="absolute top-2 right-2"
                      >
                        <X className="w-4 h-4" />
                      </Button> */}
                      <p className="text-xs text-muted-foreground mt-2">
                        {hasFileChanged()
                          ? "New recording to be saved"
                          : "Current recording"}
                      </p>
                    </div>
                  )}

                  {/* Recording Interface */}
                  <div className="space-y-3 border rounded-lg p-3">
                    {!isVoiceRecording && !previewUrl ? (
                      <div className="text-center py-4">
                        <Mic className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground mb-3">
                          Record a new voice note
                        </p>
                        <Button
                          onClick={startRecording}
                          className="gradient-bg"
                        >
                          <Mic className="w-4 h-4 mr-2" />
                          Start Recording
                        </Button>
                      </div>
                    ) : isVoiceRecording ? (
                      <div className="space-y-3 text-center py-4">
                        <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
                          <Mic className="w-6 h-6 text-white" />
                        </div>
                        <p className="text-red-600 font-medium text-sm">
                          Recording... {formatTime(recordingTime)}
                        </p>
                        <div className="flex space-x-2 justify-center">
                          <Button
                            onClick={stopRecording}
                            variant="destructive"
                            className="text-sm"
                          >
                            <Square className="w-4 h-4 mr-2" />
                            Stop
                          </Button>
                          <Button
                            onClick={cancelRecording}
                            variant="outline"
                            className="text-sm"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      previewUrl && (
                        <div className="space-y-3 text-center py-4">
                          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                            <Mic className="w-6 h-6 text-white" />
                          </div>
                          <p className="text-green-600 font-medium text-sm">
                            Recording ready - {formatTime(recordingTime)}
                          </p>
                          <div className="flex space-x-2 justify-center">
                            <Button
                              onClick={playPauseAudio}
                              variant="outline"
                              className="text-sm"
                            >
                              {isPlaying ? (
                                <Pause className="w-4 h-4 mr-2" />
                              ) : (
                                <Play className="w-4 h-4 mr-2" />
                              )}
                              {isPlaying ? "Pause" : "Play"}
                            </Button>
                            <Button
                              onClick={startRecording}
                              variant="outline"
                              className="text-sm"
                            >
                              Re-record
                            </Button>
                          </div>
                        </div>
                      )
                    )}

                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={loading || isVoiceRecording}
                      className="w-full"
                    >
                      Upload Audio File
                    </Button>
                  </div>
                </>
              )}

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept={note.type_id === "photo" ? "image/*" : "audio/*"}
                onChange={handleFileUpload}
                className="hidden"
              />
              {/* Hidden canvas for photo capture */}
              <canvas ref={canvasRef} className="hidden" />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                loading || (!content.trim() && note.type_id !== "photo")
              }
              className="flex-1 gradient-bg"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditNoteModal;
