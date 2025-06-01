// import React, { useState, useRef, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
// } from "@/components/ui/dialog";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Input } from "@/components/ui/input";
// import { useNotebooks } from "@/hooks/useNotebooks";
// import { useMediaRecorder } from "@/hooks/useMediaRecorder";
// import { uploadFile, deleteFile } from "@/utils/fileUpload";
// import { useAuth } from "@/hooks/useAuth";
// import { useToast } from "@/hooks/use-toast";
// import { Camera, Mic, Play, Pause, Square, X, Save } from "lucide-react";
// import { Note } from "@/types";

// interface EditNoteModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   note: Note;
//   onNoteUpdated: () => void;
// }

// const EditNoteModal = ({
//   isOpen,
//   onClose,
//   note,
//   onNoteUpdated,
// }: EditNoteModalProps) => {
//   const { updateNote } = useNotebooks();
//   const { user } = useAuth();
//   const { toast } = useToast();
//   const [loading, setLoading] = useState(false);
//   const [content, setContent] = useState(note.content);
//   const [newFileUrl, setNewFileUrl] = useState<string | null>(null);
//   const [previewUrl, setPreviewUrl] = useState<string | null>(null);
//   const [isTakingPhoto, setIsTakingPhoto] = useState(false);
//   const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
//   const [isCameraReady, setIsCameraReady] = useState(false);
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const audioRef = useRef<HTMLAudioElement | null>(null);
//   const [isPlaying, setIsPlaying] = useState(false);

//   const {
//     isRecording: isVoiceRecording,
//     recordingTime,
//     startRecording,
//     stopRecording,
//     cancelRecording,
//   } = useMediaRecorder({
//     onRecordingComplete: (audioBlob) => {
//       const url = URL.createObjectURL(audioBlob);
//       setPreviewUrl(url);
//     },
//   });

//   // Reset state when note changes
//   useEffect(() => {
//     if (note) {
//       setContent(note.content);
//       setNewFileUrl(null);
//       setPreviewUrl(null);
//       setIsPlaying(false);
//       if (audioRef.current) {
//         audioRef.current.pause();
//         audioRef.current = null;
//       }
//     }
//   }, [note]);

//   // Cleanup on unmount
//   useEffect(() => {
//     return () => {
//       if (cameraStream) {
//         cameraStream.getTracks().forEach((track) => track.stop());
//       }
//       if (previewUrl) {
//         URL.revokeObjectURL(previewUrl);
//       }
//     };
//   }, [cameraStream, previewUrl]);

//   const handleSave = async () => {
//     if (!user) return;

//     setLoading(true);
//     try {
//       let fileUrlToSave: string | null | undefined = undefined;
//       let fileToDelete: string | null = null;

//       // Handle file upload if new file exists
//       if (previewUrl || newFileUrl) {
//         try {
//           if (note.type_id === "photo" && previewUrl) {
//             // Only upload if we don't already have a newFileUrl
//             if (!newFileUrl) {
//               const response = await fetch(previewUrl);
//               const blob = await response.blob();
//               const photoFile = new File([blob], `photo-${Date.now()}.jpg`, {
//                 type: "image/jpeg",
//               });
//               fileUrlToSave = await uploadFile(photoFile, "photos", user.id);
//             } else {
//               fileUrlToSave = newFileUrl;
//             }

//             // Mark old file for deletion if exists and not already replaced
//             if (note.file_url && note.file_url !== newFileUrl) {
//               fileToDelete = note.file_url;
//             }
//           } else if (note.type_id === "voice" && previewUrl) {
//             // Create file from blob for voice recordings
//             const response = await fetch(previewUrl);
//             const blob = await response.blob();
//             const audioFile = new File([blob], `voice-${Date.now()}.webm`, {
//               type: "audio/webm",
//             });
//             fileUrlToSave = await uploadFile(
//               audioFile,
//               "voice-recordings",
//               user.id
//             );

//             // Mark old file for deletion if exists
//             if (note.file_url) {
//               fileToDelete = note.file_url;
//             }
//           } else if (newFileUrl) {
//             // For direct file uploads
//             fileUrlToSave = newFileUrl;

//             // Mark old file for deletion if exists
//             if (note.file_url && note.file_url !== newFileUrl) {
//               fileToDelete = note.file_url;
//             }
//           }
//         } catch (uploadError) {
//           console.error("Error uploading file:", uploadError);
//           toast({
//             title: "Upload Failed",
//             description: "Could not upload file. Please try again.",
//             variant: "destructive",
//           });
//           setLoading(false);
//           return;
//         }
//       } else if (newFileUrl === null) {
//         // User removed the file
//         fileUrlToSave = null;
//         if (note.file_url) {
//           fileToDelete = note.file_url;
//         }
//       }

//       // Update note content
//       await updateNote(note.id, content, fileUrlToSave);

//       // Delete old file after successful update
//       if (fileToDelete) {
//         try {
//           await deleteFile(
//             fileToDelete,
//             note.type_id === "photo" ? "photos" : "voice-recordings"
//           );
//         } catch (deleteError) {
//           console.error("Error deleting old file:", deleteError);
//           // Non-blocking error, just log
//         }
//       }

//       toast({
//         title: "Note Updated!",
//         description: "Your changes have been saved",
//       });

//       onNoteUpdated();
//       handleClose();
//     } catch (error) {
//       console.error("Error updating note:", error);
//       toast({
//         title: "Error",
//         description: "Failed to update note. Please try again.",
//         variant: "destructive",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const startCamera = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: { facingMode: "environment" },
//       });
//       setCameraStream(stream);
//       setIsCameraReady(false);

//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;
//         // Wait for video to be ready
//         await new Promise((resolve) => {
//           if (videoRef.current) {
//             videoRef.current.onloadedmetadata = () => {
//               videoRef.current?.play();
//               resolve(true);
//             };
//           }
//         });
//         setIsCameraReady(true);
//       }
//       setIsTakingPhoto(true);
//     } catch (error) {
//       console.error("Error accessing camera:", error);
//       toast({
//         title: "Camera Error",
//         description: "Could not access camera. Please check permissions.",
//         variant: "destructive",
//       });
//     }
//   };

//   const takePhoto = () => {
//     if (!videoRef.current || !canvasRef.current || !isCameraReady) return;

//     const canvas = canvasRef.current;
//     const video = videoRef.current;

//     // Set canvas dimensions to match video
//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;

//     const ctx = canvas.getContext("2d");
//     if (ctx) {
//       // Draw the current video frame to canvas
//       ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
//       const url = canvas.toDataURL("image/jpeg", 0.95);
//       setPreviewUrl(url);
//       stopCamera();
//     }
//   };

//   const stopCamera = () => {
//     if (cameraStream) {
//       cameraStream.getTracks().forEach((track) => track.stop());
//       setCameraStream(null);
//     }
//     setIsTakingPhoto(false);
//     setIsCameraReady(false);
//   };

//   const handleFileUpload = async (
//     event: React.ChangeEvent<HTMLInputElement>
//   ) => {
//     if (!user) return;
//     const file = event.target.files?.[0];
//     if (!file) return;

//     // Validate file based on note type
//     if (note.type_id === "photo" && !file.type.startsWith("image/")) {
//       toast({
//         title: "Invalid File",
//         description: "Please select an image file",
//         variant: "destructive",
//       });
//       return;
//     }

//     if (note.type_id === "voice" && !file.type.startsWith("audio/")) {
//       toast({
//         title: "Invalid File",
//         description: "Please select an audio file",
//         variant: "destructive",
//       });
//       return;
//     }

//     setLoading(true);
//     try {
//       const fileUrl = await uploadFile(
//         file,
//         note.type_id === "photo" ? "photos" : "voice-recordings",
//         user.id
//       );
//       setNewFileUrl(fileUrl);

//       // Create preview for photo
//       if (note.type_id === "photo") {
//         const url = URL.createObjectURL(file);
//         setPreviewUrl(url);
//       }
//     } catch (error) {
//       console.error("Error uploading file:", error);
//       toast({
//         title: "Upload Failed",
//         description: "Could not upload file. Please try again.",
//         variant: "destructive",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const removeFile = () => {
//     setNewFileUrl(null);
//     setPreviewUrl(null);

//     if (note.type_id === "photo") {
//       setContent("");
//     }
//   };

//   const playPauseAudio = () => {
//     if (!previewUrl) return;

//     if (isPlaying && audioRef.current) {
//       audioRef.current.pause();
//       setIsPlaying(false);
//     } else {
//       const audio = new Audio(previewUrl);
//       audio.onended = () => setIsPlaying(false);
//       audio.play();
//       audioRef.current = audio;
//       setIsPlaying(true);
//     }
//   };

//   const formatTime = (seconds: number) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins}:${secs.toString().padStart(2, "0")}`;
//   };

//   const handleClose = () => {
//     // Clean up recordings if canceled
//     if (isVoiceRecording) {
//       cancelRecording();
//     }
//     if (cameraStream) {
//       stopCamera();
//     }
//     if (previewUrl) {
//       URL.revokeObjectURL(previewUrl);
//     }
//     onClose();
//   };

//   const getCurrentFileUrl = () => {
//     if (previewUrl) return previewUrl;
//     if (newFileUrl) return newFileUrl;
//     return note.file_url || null;
//   };

//   const hasFileChanged = () => {
//     return previewUrl || newFileUrl !== null;
//   };

//   return (
//     <Dialog open={isOpen} onOpenChange={handleClose}>
//       <DialogContent className="sm:max-w-[90vw] max-w-md mx-auto max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle className="text-lg">
//             Edit{" "}
//             {note.type_id === "text"
//               ? "Text"
//               : note.type_id === "photo"
//               ? "Photo"
//               : "Voice"}{" "}
//             Note
//           </DialogTitle>
//           <DialogDescription className="text-sm">
//             Update your note content and media
//           </DialogDescription>
//         </DialogHeader>

//         <div className="space-y-4">
//           {/* Content Editor */}
//           <div className="space-y-2">
//             <Label htmlFor="note-content" className="text-sm">
//               {note.type_id === "text" ? "Content" : "Caption/Description"}
//             </Label>
//             {note.type_id === "text" ? (
//               <Textarea
//                 id="note-content"
//                 value={content}
//                 onChange={(e) => setContent(e.target.value)}
//                 rows={6}
//                 className="resize-none text-sm"
//                 placeholder="Update your note content..."
//               />
//             ) : (
//               <Input
//                 id="note-content"
//                 value={content}
//                 onChange={(e) => setContent(e.target.value)}
//                 className="text-sm"
//                 placeholder="Add a caption or description..."
//               />
//             )}
//           </div>

//           {/* Media Editor */}
//           {note.type_id !== "text" && (
//             <div className="space-y-3">
//               <Label className="text-sm">
//                 {note.type_id === "photo" ? "Photo" : "Recording"}
//               </Label>

//               {/* Photo Editor */}
//               {note.type_id === "photo" && (
//                 <>
//                   {/* Current/New Photo Preview */}
//                   {getCurrentFileUrl() && (
//                     <div className="border rounded-lg p-3 relative">
//                       <img
//                         src={getCurrentFileUrl() || ""}
//                         alt="Note preview"
//                         className="w-full h-48 object-contain rounded-md bg-black"
//                       />
//                       <Button
//                         variant="destructive"
//                         size="sm"
//                         onClick={removeFile}
//                         className="absolute top-2 right-2"
//                       >
//                         <X className="w-4 h-4" />
//                       </Button>
//                       <p className="text-xs text-muted-foreground mt-2">
//                         {hasFileChanged()
//                           ? "New photo to be saved"
//                           : "Current photo"}
//                       </p>
//                     </div>
//                   )}

//                   {/* Camera Interface */}
//                   {isTakingPhoto ? (
//                     <div className="space-y-3 border rounded-lg p-3">
//                       <video
//                         ref={videoRef}
//                         autoPlay
//                         playsInline
//                         muted
//                         className="w-full h-48 object-contain bg-black rounded-md"
//                       />
//                       <div className="flex space-x-2">
//                         <Button
//                           onClick={takePhoto}
//                           className="flex-1"
//                           disabled={!isCameraReady}
//                         >
//                           <Camera className="w-4 h-4 mr-2" />
//                           {isCameraReady ? "Take Photo" : "Loading Camera..."}
//                         </Button>
//                         <Button
//                           variant="outline"
//                           onClick={stopCamera}
//                           className="flex-1"
//                         >
//                           Cancel
//                         </Button>
//                       </div>
//                     </div>
//                   ) : (
//                     <div className="flex flex-col sm:flex-row gap-2">
//                       <Button
//                         variant="outline"
//                         onClick={startCamera}
//                         disabled={loading}
//                         className="flex-1"
//                       >
//                         <Camera className="w-4 h-4 mr-2" />
//                         Take Photo
//                       </Button>
//                       <Button
//                         variant="outline"
//                         onClick={() => fileInputRef.current?.click()}
//                         disabled={loading}
//                         className="flex-1"
//                       >
//                         Upload Photo
//                       </Button>
//                     </div>
//                   )}
//                 </>
//               )}

//               {/* Voice Editor */}
//               {note.type_id === "voice" && (
//                 <>
//                   {/* Current/New Audio Preview */}
//                   {getCurrentFileUrl() && (
//                     <div className="border rounded-lg p-3 relative">
//                       <audio
//                         controls
//                         src={getCurrentFileUrl() || ""}
//                         className="w-full"
//                       />
//                       <Button
//                         variant="destructive"
//                         size="sm"
//                         onClick={removeFile}
//                         className="absolute top-2 right-2"
//                       >
//                         <X className="w-4 h-4" />
//                       </Button>
//                       <p className="text-xs text-muted-foreground mt-2">
//                         {hasFileChanged()
//                           ? "New recording to be saved"
//                           : "Current recording"}
//                       </p>
//                     </div>
//                   )}

//                   {/* Recording Interface */}
//                   <div className="space-y-3 border rounded-lg p-3">
//                     {!isVoiceRecording && !previewUrl ? (
//                       <div className="text-center py-4">
//                         <Mic className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
//                         <p className="text-sm text-muted-foreground mb-3">
//                           Record a new voice note
//                         </p>
//                         <Button
//                           onClick={startRecording}
//                           className="gradient-bg"
//                         >
//                           <Mic className="w-4 h-4 mr-2" />
//                           Start Recording
//                         </Button>
//                       </div>
//                     ) : isVoiceRecording ? (
//                       <div className="space-y-3 text-center py-4">
//                         <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
//                           <Mic className="w-6 h-6 text-white" />
//                         </div>
//                         <p className="text-red-600 font-medium text-sm">
//                           Recording... {formatTime(recordingTime)}
//                         </p>
//                         <div className="flex space-x-2 justify-center">
//                           <Button
//                             onClick={stopRecording}
//                             variant="destructive"
//                             className="text-sm"
//                           >
//                             <Square className="w-4 h-4 mr-2" />
//                             Stop
//                           </Button>
//                           <Button
//                             onClick={cancelRecording}
//                             variant="outline"
//                             className="text-sm"
//                           >
//                             Cancel
//                           </Button>
//                         </div>
//                       </div>
//                     ) : (
//                       previewUrl && (
//                         <div className="space-y-3 text-center py-4">
//                           <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto">
//                             <Mic className="w-6 h-6 text-white" />
//                           </div>
//                           <p className="text-green-600 font-medium text-sm">
//                             Recording ready - {formatTime(recordingTime)}
//                           </p>
//                           <div className="flex space-x-2 justify-center">
//                             <Button
//                               onClick={playPauseAudio}
//                               variant="outline"
//                               className="text-sm"
//                             >
//                               {isPlaying ? (
//                                 <Pause className="w-4 h-4 mr-2" />
//                               ) : (
//                                 <Play className="w-4 h-4 mr-2" />
//                               )}
//                               {isPlaying ? "Pause" : "Play"}
//                             </Button>
//                             <Button
//                               onClick={startRecording}
//                               variant="outline"
//                               className="text-sm"
//                             >
//                               Re-record
//                             </Button>
//                           </div>
//                         </div>
//                       )
//                     )}

//                     <Button
//                       variant="outline"
//                       onClick={() => fileInputRef.current?.click()}
//                       disabled={loading || isVoiceRecording}
//                       className="w-full"
//                     >
//                       Upload Audio File
//                     </Button>
//                   </div>
//                 </>
//               )}

//               {/* Hidden file input */}
//               <input
//                 ref={fileInputRef}
//                 type="file"
//                 accept={note.type_id === "photo" ? "image/*" : "audio/*"}
//                 onChange={handleFileUpload}
//                 className="hidden"
//               />
//               <canvas ref={canvasRef} className="hidden" />
//             </div>
//           )}

//           {/* Action Buttons */}
//           <div className="flex space-x-2 pt-4">
//             <Button
//               variant="outline"
//               onClick={handleClose}
//               disabled={loading}
//               className="flex-1"
//             >
//               Cancel
//             </Button>
//             <Button
//               onClick={handleSave}
//               disabled={
//                 loading || (!content.trim() && note.type_id !== "photo")
//               }
//               className="flex-1 gradient-bg"
//             >
//               <Save className="w-4 h-4 mr-2" />
//               {loading ? "Saving..." : "Save Changes"}
//             </Button>
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default EditNoteModal;

import React, { useState, useRef, useEffect } from "react";
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
import { Camera, Mic, Play, Pause, Square, X, Save } from "lucide-react";
import { Note } from "@/types";

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
                  {/* Current/New Photo Preview */}
                  {getCurrentFileUrl() && !isTakingPhoto && (
                    <div className="relative border rounded-lg overflow-hidden">
                      <img
                        src={getCurrentFileUrl() || ""}
                        alt="Note preview"
                        className="w-full max-h-64 object-contain bg-gray-100"
                      />
                      {/* <Button
                        variant="destructive"
                        size="sm"
                        onClick={removeFile}
                        className="absolute top-2 right-2"
                      >
                        <X className="w-4 h-4" />
                      </Button> */}
                      <div className="p-2 bg-gray-50 border-t">
                        <p className="text-xs text-muted-foreground">
                          {hasFileChanged()
                            ? "New photo to be saved"
                            : "Current photo"}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Camera Interface */}
                  {isTakingPhoto && (
                    <div className="space-y-3 border rounded-lg overflow-hidden">
                      <div className="relative bg-black">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-64 object-contain"
                          style={{
                            display: "block",
                            backgroundColor: "#000",
                          }}
                        />
                        {!isCameraReady && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                            <p className="text-white text-sm">
                              Loading Camera...
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="p-3 bg-gray-50 flex space-x-2">
                        <Button
                          onClick={takePhoto}
                          className="flex-1"
                          disabled={!isCameraReady}
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          {isCameraReady ? "Take Photo" : "Loading..."}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={stopCamera}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Camera and Upload Controls */}
                  {!isTakingPhoto && (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        variant="outline"
                        onClick={startCamera}
                        disabled={loading}
                        className="flex-1"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Take Photo
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={loading}
                        className="flex-1"
                      >
                        Upload Photo
                      </Button>
                    </div>
                  )}
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
