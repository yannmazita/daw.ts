// src/features/clips/utils/midiPlayback.ts
import * as Tone from "tone";
import { ClipState, CompositionClip } from "../types";
import { Midi } from "@tonejs/midi";

export const startMidiPlayback = (
  state: ClipState,
  clip: CompositionClip,
  startTime?: number,
): ClipState => {
  const midi = clip.data as Midi;
  Tone.getTransport().PPQ = midi.header.ppq;

  if (midi.tracks.length === 0) {
    console.warn("Midi file has no tracks");
    return state;
  }

  const synths: Tone.PolySynth[] = [];
  const now = Tone.now() + 0.5;

  midi.tracks.forEach((track) => {
    if (track.notes.length === 0) {
      console.warn("Midi track has no notes, skipping");
      return;
    }
    //create a synth for each track
    const synth = new Tone.PolySynth(Tone.Synth, {
      envelope: {
        attack: 0.02,
        decay: 0.1,
        sustain: 0.3,
        release: 1,
      },
    }).toDestination();
    synth.maxPolyphony = 256;
    synths.push(synth);
    //schedule all of the events
    track.notes.forEach((note) => {
      synth.triggerAttackRelease(
        note.name,
        note.duration,
        note.time + now,
        note.velocity,
      );
    });
  });
  clip.node = synths; // Store synths for disposal
  return state;
};

export const startAudioPlayback = (
  state: ClipState,
  clip: CompositionClip,
  startTime?: number,
): ClipState => {
  const player = new Tone.Player(
    clip.data as Tone.ToneAudioBuffer,
  ).toDestination();
  player.start(startTime ?? clip.pausedAt);
  clip.node = player;
  clip.playerStartTime = startTime ?? clip.pausedAt; // Store the start time
  return state;
};
