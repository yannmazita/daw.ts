// src/core/types/store.ts

import { type StateCreator, type StoreMutatorIdentifier } from "zustand";
import { TransportState, TransportActions } from "@/core/interfaces/transport";
import { PatternState, PatternActions } from "@/core/interfaces/pattern";
import { PlaylistState, PlaylistActions } from "@/core/interfaces/playlist";
import { MixerState, MixerActions } from "@/core/interfaces/mixer";

export interface StoreState {
  transport: TransportState;
  patterns: PatternState;
  playlist: PlaylistState;
  mixer: MixerState;
}

export interface StoreActions {
  transport: TransportActions;
  patterns: PatternActions;
  playlist: PlaylistActions;
  mixer: MixerActions;
}

export type Store = StoreState & StoreActions;

export type SliceCreator<T> = StateCreator<
  Store,
  [["zustand/devtools", never]],
  [],
  T
>;
