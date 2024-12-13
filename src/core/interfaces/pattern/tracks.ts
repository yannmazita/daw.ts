// src/core/interfaces/pattern/tracks.ts
import { Identifiable, AudioNode } from "../base";
import { SequenceEvent } from "./events";
import {
  InstrumentName,
  InstrumentOptions,
  InstrumentType,
} from "../../types/instrument";
import * as Tone from "tone";

export interface BaseTrack extends Identifiable, AudioNode {
  mixerChannelId: string;
  events: SequenceEvent[];
  parameters: Record<string, number>;
}

export interface InstrumentTrack extends BaseTrack {
  type: "instrument";
  instrumentType: InstrumentName;
  instrumentOptions?: InstrumentOptions;
  instrument: InstrumentType;
  channel: Tone.Channel;
  signals: Record<string, Tone.Signal<any>>;
}

export interface AudioTrack extends BaseTrack {
  type: "audio";
  player: Tone.Player;
  channel: Tone.Channel;
  signals: Record<string, Tone.Signal<any>>;
}

export type PatternTrack = InstrumentTrack | AudioTrack;

export type SerializableTrack = Omit<BaseTrack, "mixerChannelId"> & {
  mixerChannelId: string;
} & (
    | {
        type: "instrument";
        instrumentType: InstrumentName;
        instrumentOptions?: InstrumentOptions;
      }
    | {
        type: "audio";
      }
  );

export interface TrackActions {
  createInstrumentTrack(
    patternId: string,
    name: string,
    instrumentType: InstrumentName,
    options?: InstrumentOptions,
  ): string;

  createAudioTrack(patternId: string, name: string): string;

  removePatternTrack(patternId: string, trackId: string): void;

  updatePatternTrack<T extends PatternTrack>(
    patternId: string,
    trackId: string,
    updates: Partial<T>,
  ): void;
}
