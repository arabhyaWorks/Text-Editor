import React, { useState, useCallback } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { useVoiceRecorder } from "./voice-Base64";
import { useBhashiniVoice } from "./bhashini-voice";

function App() {
  const [transcriptionHistory, setTranscriptionHistory] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const { isRecording, base64Audio, startRecording, stopRecording } =
    useVoiceRecorder();

  const { transcribedText, transcribeAudio } = useBhashiniVoice();

  const handleClick = useCallback(async () => {
    if (isRecording) {
      console.log("Stopping recording...");
      try {
        await stopRecording();
        setIsProcessing(true);
      } catch (err) {
        console.error("Error stopping:", err);
      }
    } else if (!isProcessing) {
      console.log("Starting recording...");
      try {
        await startRecording();
      } catch (err) {
        console.error("Error starting:", err);
      }
    }
  }, [isRecording, isProcessing, startRecording, stopRecording]);

  // Handle audio processing and transcription
  React.useEffect(() => {
    if (base64Audio && isProcessing && !isRecording) {
      console.log("Processing audio...");
      transcribeAudio(base64Audio).finally(() => {
        setIsProcessing(false);
      });
    }
  }, [base64Audio, isRecording, transcribeAudio]);

  // Handle transcribed text
  React.useEffect(() => {
    if (transcribedText) {
      setTranscriptionHistory((prev) => [transcribedText, ...prev].slice(0, 2));
    }
  }, [transcribedText]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="relative">
        {/* Animation layers */}
        {isRecording && (
          <>
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-spin pointer-events-none" />
            <div className="absolute inset-2 border-4 border-blue-400 rounded-full animate-ping pointer-events-none" />
          </>
        )}

        {/* Mic Button */}
        <button
          onClick={handleClick}
          className={`relative z-10 w-24 h-24 flex items-center justify-center
            ${
              isRecording
                ? "bg-red-600 hover:bg-red-700"
                : "bg-blue-600 hover:bg-blue-700"
            }
            ${isProcessing ? "opacity-50 cursor-wait" : "cursor-pointer"}
            rounded-full transition-colors shadow-lg focus:outline-none focus:ring-2 
            focus:ring-offset-2 ${
              isRecording ? "focus:ring-red-500" : "focus:ring-blue-500"
            }`}
        >
          {isRecording ? (
            <MicOff className="w-12 h-12 text-white" />
          ) : (
            <Mic className="w-12 h-12 text-white" />
          )}
        </button>
      </div>

      {/* Processing indicator */}
      {isProcessing && (
        <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          <span className="text-sm text-gray-600">
            Converting speech to text...
          </span>
        </div>
      )}

      {/* Transcriptions display */}
      <div className="fixed bottom-4 right-4 space-y-4">
        {transcriptionHistory.map((text, index) => (
          <div
            key={index}
            className={`bg-white p-4 rounded-lg shadow-lg max-w-md ${
              index > 0 ? "opacity-75" : ""
            }`}
          >
            <div className="text-xs text-gray-500 mb-1">
              {index === 0
                ? "Current transcription:"
                : "Previous transcription:"}
            </div>
            <p className="text-sm text-gray-900">{text}</p>
          </div>
        ))}
      </div>

      {/* Debug Panel */}
      <div className="fixed top-4 right-4 bg-black bg-opacity-75 text-white p-4 rounded text-xs space-y-1">
        <div>isRecording: {String(isRecording)}</div>
        <div>isProcessing: {String(isProcessing)}</div>
        <div>hasBase64: {String(!!base64Audio)}</div>
      </div>
    </div>
  );
}

export default App;
