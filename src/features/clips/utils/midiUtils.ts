// src/features/clips/utils/midiUtils.ts
import * as Tone from "tone";
import { Midi } from "@tonejs/midi";
import {
  MidiClipContent,
  MidiNote,
  MidiTrackData,
  CompositionClip,
  ClipContent,
} from "../types";
import { Time } from "tone/build/esm/core/type/Units";

export const createMidiContent = (midiFile: ArrayBuffer): MidiClipContent => {
  const midi = new Midi(midiFile);

  return {
    name: midi.name || "Imported MIDI",
    duration: midi.duration,
    tracks: midi.tracks.map((track) => ({
      name: track.name,
      notes: track.notes.map((note) => ({
        midi: note.midi,
        name: note.name,
        pitch: note.pitch,
        octave: note.octave,
        velocity: note.velocity,
        duration: note.duration,
        time: note.time,
        ticks: note.ticks,
      })),
      controlChanges: Object.fromEntries(
        Object.entries(track.controlChanges).map(([ccNum, changes]) => [
          ccNum,
          changes.map((cc) => ({
            number: cc.number,
            value: cc.value,
            time: cc.time ?? 0,
            ticks: cc.ticks,
          })),
        ]),
      ),
      instrument: {
        number: track.instrument.number,
        family: track.instrument.family,
        name: track.instrument.name,
        percussion: track.instrument.percussion,
      },
      channel: track.channel,
    })),
    tempos: midi.header.tempos.map((tempo) => ({
      bpm: tempo.bpm,
      time: tempo.time ?? 0,
    })),
    timeSignatures: midi.header.timeSignatures.map((ts) => ({
      timeSignature: [ts.timeSignature[0], ts.timeSignature[1]],
      time: Tone.Time(ts.ticks).toSeconds() ?? 0,
    })),
  };
};

export const createMidiExport = (content: MidiClipContent): Uint8Array => {
  const midi = new Midi();
  midi.name = content.name;

  content.tracks.forEach((trackData) => {
    const track = midi.addTrack();
    track.name = trackData.name ?? "";
    track.channel = trackData.channel;

    trackData.notes.forEach((note) => {
      track.addNote({
        midi: note.midi,
        time: note.time,
        duration: note.duration,
        velocity: note.velocity,
      });
    });

    Object.entries(trackData.controlChanges).forEach(([ccNum, changes]) => {
      changes.forEach((cc) => {
        track.addCC({
          number: cc.number,
          value: cc.value,
          time: cc.time,
        });
      });
    });

    track.instrument.number = trackData.instrument.number;
  });

  return midi.toArray();
};

export const prepareMidiTracks = (
  content: ClipContent,
  clip: CompositionClip,
) => {
  const preparedParts: Tone.Part[] = [];
  const activeClips: Record<
    string,
    { part: Tone.Part; clip: CompositionClip }
  > = {};

  content.midiData.tracks.forEach((track, trackIndex) => {
    try {
      const synth = new Tone.PolySynth().toDestination();
      // Set the instrument based on track.instrument

      const part = new Tone.Part((time, note: MidiNote) => {
        synth.triggerAttackRelease(
          note.name,
          note.duration,
          time,
          note.velocity,
        );
      }, track.notes);

      // Configure loop settings
      if (clip.loop?.enabled) {
        part.loop = true;
        part.loopStart = clip.loop.start;
        part.loopEnd =
          Tone.Time(clip.loop.start).toSeconds() +
          Tone.Time(clip.loop.duration).toSeconds();
      }

      // Handle control changes
      setupControlChanges(track, clip.startTime);

      // Store prepared part
      preparedParts.push(part);

      // Create clip instance ID
      const clipInstanceId =
        content.midiData.tracks.length > 1
          ? `${clip.id}_${trackIndex}`
          : clip.id;

      activeClips[clipInstanceId] = { part, clip };
    } catch (error) {
      // Cleanup any successfully created parts before throwing
      preparedParts.forEach((p) => p.dispose());
      throw error;
    }
  });

  return { parts: preparedParts, activeClips };
};

const setupControlChanges = (track: MidiTrackData, startTime: Time): void => {
  Object.values(track.controlChanges).forEach((changes) => {
    changes.forEach((cc) => {
      Tone.getTransport().schedule(
        (time) => {
          // todo: handle control changes based on cc.number
          // example: handle modulation, expression, etc.
        },
        cc.time + Tone.Time(startTime).toSeconds(),
      );
    });
  });
};

export const startMidiClip = (part: Tone.Part, startTime?: Time): void => {
  try {
    // Ensure transport is ready
    if (!Tone.getTransport().state) {
      throw new Error("Transport is not initialized");
    }

    // Handle different start time scenarios
    if (startTime !== undefined) {
      part.start(startTime);
    } else {
      part.start();
    }
  } catch (error) {
    console.warn("Error starting MIDI clip:", error);
    throw error;
  }
};
