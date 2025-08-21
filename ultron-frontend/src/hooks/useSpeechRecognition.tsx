import { useRef, useState } from "react";

export function useSpeechRecognition(onUpdate: (newChunk: string) => void) {
  const recognitionRef = useRef<any>(null);
  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Your browser doesn't support speech recognition.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;

    recognitionRef.current = recognition;

    recognition.onstart = () => {
      console.log("🎙 Listening...");
      setIsListening(true);
    };

    recognition.onerror = (event: any) => {
      console.error("❌ Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      if (isListening) {
        console.log("🔁 Restarting recognition after pause...");
        recognition.start(); // restart on pause
      } else {
        console.log("🛑 Listening stopped");
      }
    };

    recognition.onresult = (event: any) => {
      const lastResult = event.results[event.resultIndex];
      if (lastResult.isFinal) {
        const finalTranscript = lastResult[0].transcript.trim();
        onUpdate(finalTranscript);
      }
    };

    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  return { startListening, stopListening, isListening };
}
