import { Capacitor } from "@capacitor/core";
import { SpeechRecognition } from "@capacitor-community/speech-recognition";

// Web Speech API types
interface WebSpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    onresult: ((event: { results: { [key: number]: { [key: number]: { transcript: string } } } }) => void) | null;
    onerror: ((event: { error: string }) => void) | null;
}

declare global {
    interface Window {
        SpeechRecognition?: new () => WebSpeechRecognition;
        webkitSpeechRecognition?: new () => WebSpeechRecognition;
    }
}

export async function startVoice(onText: (t: string) => void, onError: (e: string) => void) {
    const platform = Capacitor.getPlatform();

    if (platform === "web") {
        // Use Web Speech API for web
        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognitionAPI) {
            return onError("Voice not supported on this browser");
        }

        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        recognition.onresult = (event) => {
            const transcript = event.results[0]?.[0]?.transcript;
            if (transcript) onText(transcript);
        };

        recognition.onerror = (event) => {
            onError(event.error || "Speech recognition error");
        };

        recognition.start();
        return;
    }

    // Native platforms use Capacitor Speech Recognition
    try {
        const permission = await SpeechRecognition.requestPermissions();
        if (permission.speechRecognition !== "granted") {
            return onError("Speech recognition permission denied");
        }

        await SpeechRecognition.start({
            language: "en-US",
            maxResults: 1,
            partialResults: false,
        });

        SpeechRecognition.addListener("partialResults", (data: { matches?: string[] }) => {
            const transcript = data.matches?.[0];
            if (transcript) onText(transcript);
        });
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        onError(message);
    }
}

export async function stopVoice() {
    const platform = Capacitor.getPlatform();

    if (platform !== "web") {
        try {
            await SpeechRecognition.stop();
            await SpeechRecognition.removeAllListeners();
        } catch {
            // Ignore errors when stopping
        }
    }
}