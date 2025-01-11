// src/features/transport/utils/midiUtils.ts
import * as Tone from "tone";
import { Midi } from "@tonejs/midi";

export const updateTransportTimeSignature = (midi: Midi): void => {
  for (const ts of midi.header.timeSignatures) {
    Tone.getTransport().schedule((time) => {
      Tone.getTransport().timeSignature = ts.timeSignature;
    }, ts.ticks + "i");
  }
};

export const updateTransportTempo = (midi: Midi): void => {
  for (const tempo of midi.header.tempos) {
    Tone.getTransport().schedule((time) => {
      Tone.getTransport().bpm.value = tempo.bpm;
    }, tempo.ticks + "i");
  }
};

export const convertTimeFromSecondsToTicks = (midi: Midi): void => {
  for (const midiTrack of midi.tracks) {
    midiTrack.notes.forEach((note) => {
      note.time = note.ticks + "i";
    });
  }
};
