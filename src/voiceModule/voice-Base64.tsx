import { useState, useRef } from 'react';

interface VoiceRecorderHook {
  isRecording: boolean;
  recordingTime: number;
  base64Audio: string | null;
  isProcessing: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
}

export const useVoiceRecorder = (): VoiceRecorderHook => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [base64Audio, setBase64Audio] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async (): Promise<void> => {
    try {
      console.log('Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('Microphone access granted');

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e: BlobEvent) => {
        if (e.data.size > 0) {
          console.log('Received audio chunk of size:', e.data.size);
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstart = () => {
        console.log('Recording started');
        setIsRecording(true);
        setRecordingTime(0);
        
        // Start timer
        timerIntervalRef.current = window.setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
      };

      mediaRecorder.onstop = async () => {
        console.log('Recording stopped, processing audio...');
        setIsProcessing(true);
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        console.log('Audio blob created, size:', audioBlob.size);

        // Convert to base64
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          console.log('Audio converted to base64:');
          console.log(base64Audio);
          setIsProcessing(false);
          setBase64Audio(base64Audio);
        };
        reader.readAsDataURL(audioBlob);

        // Clean up
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }
        setIsRecording(false);
        chunksRef.current = [];
      };

      mediaRecorder.start();
      console.log('MediaRecorder initialized and started');

    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
    }
  };

  const stopRecording = (): void => {
    if (mediaRecorderRef.current && isRecording) {
      console.log('Stopping recording...');
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => {
        track.stop();
        console.log('Audio track stopped:', track.id);
      });
    }
  };

  return {
    isRecording,
    recordingTime,
    isProcessing,
    base64Audio,
    startRecording,
    stopRecording
  };
};