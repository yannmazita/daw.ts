// src/features/transport/services/TransportClock.ts
import { secondsToBarsBeats } from "../../../common/utils/timeUtils";

export interface TransportClockConfig {
  tapTimeout: number;
  maxTapHistory: number;
  minTapInterval: number;
  maxTapInterval: number;
}

export class TransportClock {
  private audioContext: AudioContext;
  private clockSource: AudioBufferSourceNode | null = null;
  private startTime = 0;
  private _position = 0;
  private _tempo: number;
  private _timeSignature: number[];
  private tickCallback: () => void;
  private isRunning = false;
  private nextTickTime: number | null = null;

  constructor(
    audioContext: AudioContext,
    tempo: number,
    timeSignature: number[],
    tickCallback: () => void,
  ) {
    this.audioContext = audioContext;
    this._tempo = tempo;
    this._timeSignature = timeSignature;
    this.tickCallback = tickCallback;
  }

  private createClockSource() {
    const clockSource = this.audioContext.createBufferSource();
    const buffer = this.audioContext.createBuffer(
      1,
      1,
      this.audioContext.sampleRate,
    );
    clockSource.buffer = buffer;
    clockSource.connect(this.audioContext.destination);
    return clockSource;
  }

  start(position: number) {
    if (this.isRunning) return;
    this.isRunning = true;
    this._position = position;
    this.startTime = this.audioContext.currentTime - this._position;
    this.scheduleTick();
    console.log("Start time", this.startTime, "position", this._position);
  }

  stop() {
    if (!this.isRunning) return;
    this.isRunning = false;
    if (this.clockSource) {
      this.clockSource.stop();
      this.clockSource.disconnect();
      this.clockSource = null;
    }
    this.nextTickTime = null;
    console.log("Stop time", this.audioContext.currentTime);
  }

  seek(position: number) {
    this._position = position; // Position in seconds
    this.startTime = this.audioContext.currentTime - this._position;
    if (this.isRunning) {
      this.scheduleTick();
    }
  }

  setTempo(tempo: number) {
    this._tempo = tempo;
    if (this.isRunning) {
      this.scheduleTick();
    }
    console.log("Set tempo", tempo);
  }

  private scheduleTick() {
    if (!this.isRunning) return;
    if (this.clockSource) {
      this.clockSource.stop();
      this.clockSource.disconnect();
    }

    this.clockSource = this.createClockSource();
    const secondsPerBeat = 60 / this._tempo;
    this.nextTickTime = this.audioContext.currentTime + secondsPerBeat;

    this.clockSource.start(this.nextTickTime, 0, secondsPerBeat);
    this.clockSource.onended = () => {
      this.tick();
    };
  }

  private tick = () => {
    if (this.isRunning) {
      this.tickCallback();
      this.scheduleTick();
    }
  };

  getPosition() {
    return this._position;
  }

  getCurrentPositionBeats() {
    return (
      (this.audioContext.currentTime - this.startTime) * (this._tempo / 60)
    );
  }

  getCurrentPositionBarsBeats() {
    return secondsToBarsBeats(
      this.audioContext.currentTime - this.startTime,
      this._tempo,
      this._timeSignature,
    );
  }

  getTempo() {
    return this._tempo;
  }

  getTimeSignature() {
    return this._timeSignature;
  }

  dispose() {
    this.stop();
    if (this.clockSource) {
      this.clockSource.disconnect();
      this.clockSource = null;
    }
  }

  getAudioContext() {
    return this.audioContext;
  }
}
