import { useState } from 'react';

interface BhashiniResponse {
  pipelineResponse: Array<{
    output: Array<{
      source: string;
    }>;
  }>;
}

interface BhashiniVoiceHook {
  transcribedText: string | null;
  isTranscribing: boolean;
  error: string | null;
  transcribeAudio: (base64Audio: string) => Promise<void>;
}

export const useBhashiniVoice = (): BhashiniVoiceHook => {
  const [transcribedText, setTranscribedText] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const transcribeAudio = async (base64Audio: string) => {
    setIsTranscribing(true);
    setError(null);

    try {
      // Remove the "data:audio/webm;base64," prefix if present
      const cleanBase64 = base64Audio.split('base64,')[1] || base64Audio;

      const response = await fetch('https://dhruva-api.bhashini.gov.in/services/inference/pipeline', {
        method: 'POST',
        headers: {
          'Accept': '*/*',
          'User-Agent': 'Thunder Client (https://www.thunderclient.com)',
          'Authorization': 'G1PL5w8C4R-YZHUK3JuNGbNZzLPwaNrhxjmGOtfuUQahFpdyfURwbsgyVYNx5vc-',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pipelineTasks: [
            {
              taskType: "asr",
              config: {
                language: {
                  sourceLanguage: "hi"
                },
                serviceId: "ai4bharat/conformer-hi-gpu--t4",
                audioFormat: "webm",
                samplingRate: 16000
              }
            }
          ],
          inputData: {
            audio: [
              {
                audioContent: cleanBase64
              }
            ]
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: BhashiniResponse = await response.json();
      
      if (data.pipelineResponse?.[0]?.output?.[0]?.source) {
        setTranscribedText(data.pipelineResponse[0].output[0].source);
      } else {
        throw new Error('Invalid response format from Bhashini API');
      }
    } catch (err) {
      console.error('Error transcribing audio:', err);
      setError(err instanceof Error ? err.message : 'Failed to transcribe audio');
    } finally {
      setIsTranscribing(false);
    }
  };

  return {
    transcribedText,
    isTranscribing,
    error,
    transcribeAudio
  };
};