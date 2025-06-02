import React, { useState, useRef, useCallback, useEffect } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useNotebooks } from "@/hooks/useNotebooks";
import { useMediaRecorder } from "@/hooks/useMediaRecorder";
import { uploadFile, deleteFile } from "@/utils/fileUpload";
import { useCamera } from "@/hooks/useCamera";
import { useImageCompressor } from "@/hooks/useImageCompressor";
import {
  FileText,
  Camera,
  Mic,
  Upload,
  Play,
  Pause,
  Square,
  X,
  RotateCcw,
  FlipHorizontal,
  ZoomIn,
  ZoomOut,
  Settings,
  Check,
  RefreshCw,
  SwitchCamera,
} from "lucide-react";

// Image compression utility
// export const compressImage = (
//   file: File,
//   quality: number = 0.8,
//   maxWidth: number = 1920
// ): Promise<File> => {
//   return new Promise((resolve) => {
//     const canvas = document.createElement("canvas");
//     const ctx = canvas.getContext("2d");
//     const img = new Image();

//     img.onload = () => {
//       // Calculate new dimensions
//       let { width, height } = img;
//       if (width > maxWidth) {
//         height = (height * maxWidth) / width;
//         width = maxWidth;
//       }

//       canvas.width = width;
//       canvas.height = height;

//       // Draw and compress
//       ctx.drawImage(img, 0, 0, width, height);
//       canvas.toBlob(
//         (blob) => {
//           const compressedFile = new File([blob], file.name, {
//             type: "image/jpeg",
//             lastModified: Date.now(),
//           });
//           resolve(compressedFile);
//         },
//         "image/jpeg",
//         quality
//       );
//     };

//     img.src = URL.createObjectURL(file);
//   });
// };

// Camera hook
// export const useCamera = () => {
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const [stream, setStream] = useState<MediaStream | null>(null);
//   const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
//   const [currentDeviceId, setCurrentDeviceId] = useState<string>("");
//   const [isActive, setIsActive] = useState(false);
//   const [error, setError] = useState<string>("");
//   const [zoom, setZoom] = useState(1);
//   const [rotation, setRotation] = useState(0);
//   const [flipHorizontal, setFlipHorizontal] = useState(false);

//   const getDevices = useCallback(async () => {
//     try {
//       const devices = await navigator.mediaDevices.enumerateDevices();
//       const videoDevices = devices.filter(
//         (device) => device.kind === "videoinput"
//       );
//       setDevices(videoDevices);
//       if (videoDevices.length > 0 && !currentDeviceId) {
//         setCurrentDeviceId(videoDevices[0].deviceId);
//       }
//     } catch (err) {
//       setError("Failed to get camera devices");
//     }
//   }, [currentDeviceId]);

//   const startCamera = useCallback(
//     async (deviceId?: string) => {
//       try {
//         setError("");

//         if (stream) {
//           stream.getTracks().forEach((track) => track.stop());
//         }

//         const constraints = {
//           video: {
//             deviceId: deviceId ? { exact: deviceId } : undefined,
//             width: { ideal: 1920 },
//             height: { ideal: 1080 },
//             facingMode: deviceId ? undefined : "user",
//           },
//         };

//         const newStream = await navigator.mediaDevices.getUserMedia(
//           constraints
//         );
//         setStream(newStream);

//         if (videoRef.current) {
//           videoRef.current.srcObject = newStream;
//           await videoRef.current.play();
//           setIsActive(true);
//         }
//       } catch (err) {
//         setError("Failed to access camera. Please check permissions.");
//         console.error("Camera error:", err);
//       }
//     },
//     [stream]
//   );

//   const stopCamera = useCallback(() => {
//     if (stream) {
//       stream.getTracks().forEach((track) => track.stop());
//       setStream(null);
//     }
//     setIsActive(false);
//     setZoom(1);
//     setRotation(0);
//     setFlipHorizontal(false);
//   }, [stream]);

//   const capturePhoto = useCallback((): Promise<File | null> => {
//     return new Promise((resolve) => {
//       if (!videoRef.current || !canvasRef.current) {
//         resolve(null);
//         return;
//       }

//       const video = videoRef.current;
//       const canvas = canvasRef.current;
//       const ctx = canvas.getContext("2d");

//       canvas.width = video.videoWidth;
//       canvas.height = video.videoHeight;

//       // Apply transformations
//       ctx.save();
//       ctx.translate(canvas.width / 2, canvas.height / 2);

//       if (flipHorizontal) {
//         ctx.scale(-1, 1);
//       }

//       ctx.rotate((rotation * Math.PI) / 180);
//       ctx.scale(zoom, zoom);

//       ctx.drawImage(video, -canvas.width / 2, -canvas.height / 2);
//       ctx.restore();

//       canvas.toBlob(
//         (blob) => {
//           if (blob) {
//             const file = new File([blob], `camera-${Date.now()}.jpg`, {
//               type: "image/jpeg",
//               lastModified: Date.now(),
//             });
//             resolve(file);
//           } else {
//             resolve(null);
//           }
//         },
//         "image/jpeg",
//         0.9
//       );
//     });
//   }, [zoom, rotation, flipHorizontal]);

//   const switchCamera = useCallback(() => {
//     if (devices.length > 1) {
//       const currentIndex = devices.findIndex(
//         (device) => device.deviceId === currentDeviceId
//       );
//       const nextIndex = (currentIndex + 1) % devices.length;
//       const nextDeviceId = devices[nextIndex].deviceId;
//       setCurrentDeviceId(nextDeviceId);
//       startCamera(nextDeviceId);
//     }
//   }, [devices, currentDeviceId, startCamera]);

//   useEffect(() => {
//     getDevices();
//   }, [getDevices]);

//   return {
//     videoRef,
//     canvasRef,
//     isActive,
//     error,
//     devices,
//     currentDeviceId,
//     zoom,
//     rotation,
//     flipHorizontal,
//     startCamera,
//     stopCamera,
//     capturePhoto,
//     switchCamera,
//     setZoom,
//     setRotation,
//     setFlipHorizontal,
//     getDevices,
//   };
// };

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

  // Camera states
  const [cameraMode, setCameraMode] = useState<"upload" | "camera" | "preview">(
    "upload"
  );
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [showCameraControls, setShowCameraControls] = useState(false);
  const [compressionQuality, setCompressionQuality] = useState(0.8);

  const camera = useCamera();
  const { compressImage } = useImageCompressor();

  // Mock hooks - replace with your actual implementations

  const { toast } = useToast();
  const { user } = useAuth(); // Your user object

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
            // Compress image before upload
            const compressedFile = await compressImage(
              selectedFile,
              compressionQuality
            );
            fileUrl = await uploadFile(compressedFile, "photos", user.id);
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
    setCameraMode("upload");
    setCapturedFile(null);
    camera.stopCamera();

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

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
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
          description: "Please select an image under 10MB",
          variant: "destructive",
        });
        return;
      }

      const compressedFile = await compressImage(file, compressionQuality);
      setSelectedFile(compressedFile);
      const url = URL.createObjectURL(compressedFile);
      setPreviewUrl(url);

      if (!photoCaption) {
        setPhotoCaption(`Photo: ${compressedFile.name}`);
      }
    }
  };

  const handleCameraCapture = async () => {
    const capturedFile = await camera.capturePhoto();
    if (capturedFile) {
      const compressedFile = await compressImage(
        capturedFile,
        compressionQuality
      );
      setCapturedFile(compressedFile);
      setSelectedFile(compressedFile);
      const url = URL.createObjectURL(compressedFile);
      setPreviewUrl(url);
      setCameraMode("preview");
      camera.stopCamera();

      if (!photoCaption) {
        setPhotoCaption(`Camera photo: ${new Date().toLocaleString()}`);
      }
    }
  };

  const handleRetakePhoto = () => {
    setCapturedFile(null);
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setCameraMode("camera");
    camera.startCamera();
  };

  const removeFile = () => {
    setSelectedFile(null);
    setCapturedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setPhotoCaption("");
    setCameraMode("upload");
  };

  const startCameraMode = () => {
    setCameraMode("camera");
    camera.startCamera();
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

  useEffect(() => {
    return () => {
      camera.stopCamera();
    };
  }, []);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[95vw] max-w-md mx-auto h-[95vh] max-h-[700px] flex flex-col p-4">
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
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-sm"
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
                  {/* Camera/Upload Controls */}
                  {cameraMode === "upload" && (
                    <div className="flex space-x-2 mb-3">
                      <Button
                        onClick={startCameraMode}
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
                            }deg) ${camera.flipHorizontal ? "scaleX(-1)" : ""}`,
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
                                  camera.setZoom(Math.min(3, camera.zoom + 0.1))
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
                                Quality: {Math.round(compressionQuality * 100)}%
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

                      {camera.error && (
                        <p className="text-red-500 text-sm">{camera.error}</p>
                      )}

                      <div className="flex space-x-2">
                        <Button
                          onClick={handleCameraCapture}
                          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                          disabled={!camera.isActive}
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          Capture
                        </Button>
                        <Button
                          onClick={() => setCameraMode("upload")}
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
                            Upload an image or take a photo
                          </p>
                        </>
                      )}
                      <input
                        id="photo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
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
                          onClick={handleRetakePhoto}
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
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-sm"
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
                          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-sm"
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
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-sm"
                    disabled={
                      (recordingTime === 0 && !voiceCaption.trim()) ||
                      isUploading
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
    </>
  );
};

export default AddNoteModal;
