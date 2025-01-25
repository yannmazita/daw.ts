// src/features/clips/ClipAudioService.ts
import { AudioClip } from "../types";
import { MixRoutingService } from "@/features/mix/services/MixRoutingService";

export class ClipAudioService {
  constructor(
    private audioContext: AudioContext,
    private routingService: MixRoutingService,
  ) {}
}
