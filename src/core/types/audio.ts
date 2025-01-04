// src/core/types/audio.ts
import { ToneAudioNode } from "tone";

export type ToneWithBypass = ToneAudioNode & {
  bypass: (bypass: boolean) => void;
};
