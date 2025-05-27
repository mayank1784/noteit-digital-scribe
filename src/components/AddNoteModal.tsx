
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNotebooks } from '@/hooks/useNotebooks';
import { useToast } from '@/hooks/use-toast';
import { FileText, Camera, Mic, Upload } from 'lucide-react';

interface AddNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  notebookId: string;
  pageNumber: number;
  onNoteAdded?: () => void;
}

const AddNoteModal: React.FC<AddNoteModalProps> = ({ isOpen, onClose, notebookId, pageNumber, onNoteAdded }) => {
  const [activeTab, setActiveTab] = useState('text');
  const [textContent, setTextContent] = useState('');
  const [photoCaption, setPhotoCaption] = useState('');
  const [voiceCaption, setVoiceCaption] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const { addNote } = useNotebooks();
  const { toast } = useToast();

  const handleSubmit = async (type: 'text' | 'photo' | 'voice') => {
    let content = '';
    
    switch (type) {
      case 'text':
        if (!textContent.trim()) {
          toast({
            title: "Empty Note",
            description: "Please enter some text",
            variant: "destructive"
          });
          return;
        }
        content = textContent;
        break;
      case 'photo':
        content = photoCaption || 'Photo note';
        break;
      case 'voice':
        content = voiceCaption || 'Voice recording';
        break;
    }

    try {
      await addNote(notebookId, pageNumber, {
        type_id: type,
        content,
        duration: type === 'voice' ? recordingTime : undefined
      });

      toast({
        title: "Note Added!",
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} note has been saved`
      });

      // Reset form
      setTextContent('');
      setPhotoCaption('');
      setVoiceCaption('');
      setRecordingTime(0);
      setIsRecording(false);
      onClose();
      
      // Notify parent component
      if (onNoteAdded) {
        onNoteAdded();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save note. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    
    // Simulate recording timer
    const timer = setInterval(() => {
      setRecordingTime(prev => {
        if (prev >= 300) { // 5 minutes max
          setIsRecording(false);
          clearInterval(timer);
          return 300;
        }
        return prev + 1;
      });
    }, 1000);

    // Store timer reference for cleanup
    (window as any).recordingTimer = timer;
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    if ((window as any).recordingTimer) {
      clearInterval((window as any).recordingTimer);
      delete (window as any).recordingTimer;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Note to Page {pageNumber}</DialogTitle>
          <DialogDescription>
            Choose the type of note you'd like to add to this page
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="text" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Text</span>
            </TabsTrigger>
            <TabsTrigger value="photo" className="flex items-center space-x-2">
              <Camera className="w-4 h-4" />
              <span>Photo</span>
            </TabsTrigger>
            <TabsTrigger value="voice" className="flex items-center space-x-2">
              <Mic className="w-4 h-4" />
              <span>Voice</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="textNote">Text Note</Label>
              <Textarea
                id="textNote"
                placeholder="Type your note here..."
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                rows={6}
                className="resize-none"
              />
              <p className="text-xs text-gray-500">
                {textContent.length} characters
              </p>
            </div>
            <div className="flex space-x-2">
              <Button 
                onClick={() => handleSubmit('text')}
                className="flex-1 gradient-bg"
                disabled={!textContent.trim()}
              >
                Save Text Note
              </Button>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="photo" className="space-y-4">
            <div className="space-y-4">
              {/* Photo Capture Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Take a photo or upload an image</p>
                <div className="flex space-x-2 justify-center">
                  <Button variant="outline" size="sm">
                    <Camera className="w-4 h-4 mr-2" />
                    Camera
                  </Button>
                  <Button variant="outline" size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                </div>
              </div>

              {/* Photo Caption */}
              <div className="space-y-2">
                <Label htmlFor="photoCaption">Caption (optional)</Label>
                <Input
                  id="photoCaption"
                  placeholder="Add a caption for your photo..."
                  value={photoCaption}
                  onChange={(e) => setPhotoCaption(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button 
                onClick={() => handleSubmit('photo')}
                className="flex-1 gradient-bg"
              >
                Save Photo Note
              </Button>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="voice" className="space-y-4">
            <div className="space-y-4">
              {/* Voice Recording Area */}
              <div className="border-2 border-gray-200 rounded-lg p-6 text-center">
                {!isRecording && recordingTime === 0 && (
                  <div className="space-y-4">
                    <Mic className="w-12 h-12 text-gray-400 mx-auto" />
                    <p className="text-gray-600">Record a voice note</p>
                    <Button onClick={handleStartRecording} className="gradient-bg">
                      <Mic className="w-4 h-4 mr-2" />
                      Start Recording
                    </Button>
                  </div>
                )}

                {isRecording && (
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
                      <Mic className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-red-600 font-medium">Recording... {formatTime(recordingTime)}</p>
                    <Button onClick={handleStopRecording} variant="outline">
                      Stop Recording
                    </Button>
                  </div>
                )}

                {!isRecording && recordingTime > 0 && (
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                      <Mic className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-green-600 font-medium">
                      Recording complete - {formatTime(recordingTime)}
                    </p>
                    <div className="flex space-x-2 justify-center">
                      <Button onClick={handleStartRecording} variant="outline" size="sm">
                        Re-record
                      </Button>
                      <Button variant="outline" size="sm">
                        Play
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Voice Caption */}
              <div className="space-y-2">
                <Label htmlFor="voiceCaption">Description (optional)</Label>
                <Input
                  id="voiceCaption"
                  placeholder="Add a description for your voice note..."
                  value={voiceCaption}
                  onChange={(e) => setVoiceCaption(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button 
                onClick={() => handleSubmit('voice')}
                className="flex-1 gradient-bg"
                disabled={recordingTime === 0}
              >
                Save Voice Note
              </Button>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AddNoteModal;
