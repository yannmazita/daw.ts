// src/core/exceptions.ts

export class StoreException extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class TrackStoreException extends StoreException {}
export class PlaybackStoreException extends StoreException {}
export class StructureStoreException extends StoreException {}

export class InvalidTrackIndexException extends TrackStoreException {
  constructor(index: number) {
    super(`Invalid track index: ${index}`);
  }
}

export class InvalidStepIndexException extends TrackStoreException {
  constructor(index: number) {
    super(`Invalid step index: ${index}`);
  }
}

export class InvalidVelocityException extends TrackStoreException {
  constructor(velocity: number) {
    super(
      `Invalid velocity: ${velocity}. Must be an integer between 0 and 127.`,
    );
  }
}

export class InvalidNoteException extends TrackStoreException {
  constructor(note: string) {
    super(`Invalid note: ${note}. Must be a valid MIDI note.`);
  }
}

export class InvalidBpmException extends PlaybackStoreException {
  constructor(bpm: number) {
    super(`Invalid BPM value: ${bpm}. BPM must be a positive number.`);
  }
}

export class InvalidTrackNumberException extends StructureStoreException {
  constructor(numTracks: number) {
    super(
      `Invalid number of tracks: ${numTracks}. Must be a positive integer.`,
    );
  }
}

export class InvalidStepNumberException extends StructureStoreException {
  constructor(numSteps: number) {
    super(`Invalid number of steps: ${numSteps}. Must be greater than 2.`);
  }
}

export class InvalidStepDurationException extends StructureStoreException {
  constructor(duration: string) {
    super(
      `Invalid step duration: ${duration}. Expected format like '4n', '8n', '16n', etc.`,
    );
  }
}

export class InvalidTimeSignatureException extends StructureStoreException {
  constructor(numerator: number, denominator: number) {
    super(`Invalid time signature: ${numerator}/${denominator}`);
  }
}

export class InvalidStepPositionException extends StructureStoreException {
  constructor(trackIndex: number, stepIndex: number) {
    super(`Invalid step position: (${trackIndex}, ${stepIndex})`);
  }
}
