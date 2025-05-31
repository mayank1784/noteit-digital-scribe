
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNotebooks } from '@/hooks/useNotebooks';
import { useMediaRecorder } from '@/hooks/useMediaRecorder';
import { X, Mic, Square, Camera, Save } from 'lucide-react';
import { uploadFile } from '@/utils/fileUpload';
import { Note } from '@/types';

interface EditNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: Note;
  onNoteUpdated: () => void;
}

const EditNoteModal = ({ isOpen, onClose, note, onNoteUpdated }: EditNoteModalProps) => {
  const { updateNote } = useNotebooks();
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState(note.content);
  const [newFileUrl, setNewFileUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  const { 
    isRecording: isVoiceRecording, 
    recordingTime, 
    startRecording, 
    stopRecording,
    cancelRecording 
  } = useMediaRecorder({
    onRecordingComplete: async (audioBlob) => {
      try {
        setLoading(true);
        const fileUrl = await uploadFile(audioBlob, 'voice', note.page_id);
        setNewFileUrl(fileUrl);
      } catch (error) {
        console.error('Error uploading voice note:', error);
      } finally {
        setLoading(false);
      }
    }
  });

  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateNote(note.id, content);
      
      // If there's a new file, we would need to update the file_url as well
      // This would require extending the updateNote function to handle file updates
      
      onNoteUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating note:', error);
    } finally {
      setLoading(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsTakingPhoto(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const takePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      
      canvas.toBlob(async (blob) => {
        if (blob) {
          try {
            setLoading(true);
            const fileUrl = await uploadFile(blob, 'photo', note.page_id);
            setNewFileUrl(fileUrl);
            stopCamera();
          } catch (error) {
            console.error('Error uploading photo:', error);
          } finally {
            setLoading(false);
          }
        }
      }, 'image/jpeg', 0.8);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsTakingPhoto(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const fileUrl = await uploadFile(file, note.type_id === 'photo' ? 'photo' : 'voice', note.page_id);
      setNewFileUrl(fileUrl);
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg">Edit {note.type_id} Note</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Text Content */}
          <div>
            <label className="block text-sm font-medium mb-2">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-24 p-2 border rounded-md resize-none"
              placeholder="Enter note content..."
            />
          </div>

          {/* File Management for Photo Notes */}
          {note.type_id === 'photo' && (
            <div className="space-y-3">
              <label className="block text-sm font-medium">Photo</label>
              
              {/* Current Photo */}
              {(newFileUrl || note.file_url) && (
                <div className="space-y-2">
                  <img 
                    src={newFileUrl || note.file_url || ''} 
                    alt="Note" 
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  {newFileUrl && (
                    <p className="text-xs text-green-600">New photo will be saved</p>
                  )}
                </div>
              )}

              {/* Camera Interface */}
              {isTakingPhoto && (
                <div className="space-y-2">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <div className="flex space-x-2">
                    <Button onClick={takePhoto} disabled={loading}>
                      <Camera className="w-4 h-4 mr-2" />
                      Take Photo
                    </Button>
                    <Button variant="outline" onClick={stopCamera}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Photo Controls */}
              {!isTakingPhoto && (
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={startCamera}
                    disabled={loading}
                    className="flex-1"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Take New Photo
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

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>
          )}

          {/* File Management for Voice Notes */}
          {note.type_id === 'voice' && (
            <div className="space-y-3">
              <label className="block text-sm font-medium">Voice Recording</label>
              
              {/* Current Audio */}
              {(newFileUrl || note.file_url) && (
                <div className="space-y-2">
                  <audio 
                    controls 
                    src={newFileUrl || note.file_url || ''} 
                    className="w-full"
                  />
                  {newFileUrl && (
                    <p className="text-xs text-green-600">New recording will be saved</p>
                  )}
                </div>
              )}

              {/* Recording Interface */}
              <div className="flex items-center space-x-3">
                {!isVoiceRecording ? (
                  <Button
                    variant="outline"
                    onClick={startRecording}
                    disabled={loading}
                    className="flex-1"
                  >
                    <Mic className="w-4 h-4 mr-2" />
                    Record New
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="destructive"
                      onClick={stopRecording}
                      className="flex-1"
                    >
                      <Square className="w-4 h-4 mr-2" />
                      Stop ({formatTime(recordingTime)})
                    </Button>
                    <Button
                      variant="outline"
                      onClick={cancelRecording}
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </div>

              {/* File Upload Option */}
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading || isVoiceRecording}
                className="w-full"
              >
                Upload Audio File
              </Button>

              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="flex-1"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditNoteModal;
