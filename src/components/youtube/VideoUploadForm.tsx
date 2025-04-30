'use client';

import React, { useState, useRef, useCallback } from 'react'; 
import { useAuth } from '@/contexts/AuthContext'; 
import { uploadVideoToStorage, createVideoRecord } from '@/lib/video';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type UploadStep = 'select' | 'uploading' | 'uploaded';

type VideoUploadFormProps = {
  onUploadComplete: () => void; 
};

/**
 * A multi-step form component for uploading videos.
 */
export function VideoUploadForm({ onUploadComplete }: VideoUploadFormProps) {
  const { user } = useAuth(); 
  const [step, setStep] = useState<UploadStep>('select');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null); 

  const resetForm = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setStatusMessage('');
    setError(null);
    setStep('select');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Basic validation (can be expanded)
      if (!file.type.startsWith('video/')) {
        setError('Please select a valid video file.');
        setSelectedFile(null);
        setStatusMessage('');
        if (fileInputRef.current) {
          fileInputRef.current.value = ''; // Reset file input
        }
        return;
      }
      setSelectedFile(file);
      setError(null);
      setStatusMessage(`Selected: ${file.name}`);
      setUploadProgress(0); // Reset progress for new file
    } else {
      setSelectedFile(null);
      setStatusMessage('');
      setStep('select'); // Go back to select step if file is deselected
    }
  };

  const handleUpload = useCallback(async () => {
    if (!selectedFile || !user?.uid) {
      setError(
        !user?.uid
          ? 'You must be logged in to upload.'
          : 'Please select a video file first.',
      );
      setStep('select'); // Stay on select step if validation fails
      return;
    }

    setStep('uploading');
    setError(null);
    setStatusMessage('Starting upload...');
    setUploadProgress(0);

    try {
      const { storagePath, fileName, contentType } = await uploadVideoToStorage(
        selectedFile,
        user.uid,
        (progress) => {
          setUploadProgress(Math.round(progress));
          setStatusMessage(`Uploading: ${Math.round(progress)}%`);
        },
      );

      setStatusMessage('Finalizing...'); 

      await createVideoRecord({
        userId: user.uid,
        storagePath,
        fileName,
        contentType,
        status: 'uploaded_to_storage',
      });

      setStatusMessage(`Successfully uploaded ${fileName}!`);
      setStep('uploaded'); 

    } catch (err: any) {
      console.error('Upload process failed:', err);
      setError(`Upload failed: ${err.message || 'Unknown error'}`);
      setStatusMessage(''); 
      setStep('select'); 
    }
  }, [selectedFile, user]);

  const handleDone = () => {
    resetForm(); 
    onUploadComplete(); 
  };

  return (
    <div className="space-y-4">
        {/* Step 1: Select File */}
        {step === 'select' && (
          <div className="space-y-4"> 
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="video-upload">Video File</Label>
              <Input
                id="video-upload"
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                ref={fileInputRef}
              />
            </div>
            {statusMessage && !error && (
              <p className="text-sm text-muted-foreground">{statusMessage}</p>
            )}
          </div>
        )}

        {/* Step 2: Uploading */}
        {step === 'uploading' && (
          <div className="w-full text-center space-y-2">
             <p className="text-sm text-muted-foreground">{statusMessage}</p>
             {/* Basic text progress indicator - replace with actual Progress component if added */}
             <div className="w-full bg-muted rounded-full h-2.5 dark:bg-gray-700">
               <div
                 className="bg-primary h-2.5 rounded-full"
                 style={{ width: `${uploadProgress}%` }}
               ></div>
             </div>
          </div>
        )}

        {/* Step 3: Uploaded */}
        {step === 'uploaded' && (
          <div className="text-center space-y-2">
            <p className="text-lg font-medium text-green-600">Success!</p>
            <p className="text-sm text-muted-foreground">{statusMessage}</p>
          </div>
        )}

        {/* Error Display */}
        {error && <p className="text-sm text-red-600 text-center pt-2">{error}</p>}

      <div className="flex justify-end pt-4"> 
         {step === 'select' && (
           <Button
             onClick={handleUpload}
             disabled={!selectedFile}
           >
             Upload Video
           </Button>
         )}
         {step === 'uploading' && (
           <Button disabled>
             Uploading...
           </Button>
         )}
         {step === 'uploaded' && (
           <Button onClick={handleDone}>
             Done
           </Button>
         )}
      </div>
    </div> 
  );
}
