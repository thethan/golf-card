import { Platform } from "react-native";

// Optional: only works in dev client / native build
let SR: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  SR = require("@jamsch/expo-speech-recognition");
} catch {}

export async function startVoice(onText: (t: string) => void, onError: (e: string) => void) {
  if (Platform.OS === "web") return onError("Voice not supported on web");
  if (!SR) return onError("Speech module not installed (or not in dev client build)");

  try {
    // basic usage varies by platform/version; keep this as a thin adapter
    await SR.requestPermissionsAsync?.();
    SR.start?.({
      onResult: (r: any) => {
        const t = r?.transcript ?? r?.results?.[0]?.transcript;
        if (t) onText(String(t));
      },
      onError: (e: any) => onError(String(e?.message ?? e)),
    });
  } catch (e: any) {
    onError(String(e?.message ?? e));
  }
}

export function stopVoice() {
  try {
    SR?.stop?.();
  } catch {}
}