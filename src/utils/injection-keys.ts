import type { InjectionKey } from 'vue';
import { SequencerInstrumentManager } from '@/services/SequencerInstrumentManager';
import { SequencerPlaybackManager } from '@/services/SequencerPlaybackManager';
import { SequencerTrackManager } from '@/services/SequencerTrackManager';

export const sequencerInstrumentManagerKey: InjectionKey<SequencerInstrumentManager> = Symbol('sequencerInstrumentManager');
export const sequencerPlaybackManagerKey: InjectionKey<SequencerPlaybackManager> = Symbol('sequencerPlaybackManager');
export const sequencerTrackManagerKey: InjectionKey<SequencerTrackManager> = Symbol('sequencerTrackManager');
