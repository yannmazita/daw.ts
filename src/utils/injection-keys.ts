// File: injection-keys.ts
// Description: Defines Vue injection keys for providing and injecting dependencies in the application.

import type { InjectionKey } from 'vue';
import { SequencerPlaybackManager } from '@/services/SequencerPlaybackManager';
import { SequencerTrackManager } from '@/services/SequencerTrackManager';
import { CommandManager } from '@/services/CommandManager';
import { SequencerInstrumentManager } from '@/services/SequencerInstrumentManager';

/**
 * Vue injection key for providing and injecting `SequencerInstrumentManager` instances.
 * This key is used to ensure type-safe injection of the instrument manager across the application.
 */
export const sequencerInstrumentManagerKey: InjectionKey<SequencerInstrumentManager> = Symbol('sequencerInstrumentManager');

/**
 * Vue injection key for providing and injecting `SequencerPlaybackManager` instances.
 * This key facilitates type-safe access to the playback manager, allowing components to control audio playback.
 */
export const sequencerPlaybackManagerKey: InjectionKey<SequencerPlaybackManager> = Symbol('sequencerPlaybackManager');

/**
 * Vue injection key for providing and injecting `SequencerTrackManager` instances.
 * This key is used for type-safe injection of the track manager, enabling track management functionalities across the application.
 */
export const sequencerTrackManagerKey: InjectionKey<SequencerTrackManager> = Symbol('sequencerTrackManager');

export const commandManagerKey: InjectionKey<CommandManager> = Symbol('commandManager');
