// src/features/transport/services/TransportClock.ts
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
  private tickCallback: () => void;
  private isRunning = false;

  constructor(
    audioContext: AudioContext,
    tempo: number,
    tickCallback: () => void,
  ) {
    this.audioContext = audioContext;
    this._tempo = tempo;
    this.tickCallback = tickCallback;
    this.createClockSource();
  }

  private createClockSource() {
    this.clockSource = this.audioContext.createBufferSource();
    const buffer = this.audioContext.createBuffer(
      1,
      1,
      this.audioContext.sampleRate,
    );
    this.clockSource.buffer = buffer;
    this.clockSource.connect(this.audioContext.destination);
  }

  start(position: number) {
    if (this.isRunning) return;
    this.isRunning = true;
    this._position = position;
    this.startTime =
      this.audioContext.currentTime - this._position / (this._tempo / 60);
    console.log("Start time", this.startTime);
    this.scheduleTick();
  }

  stop() {
    if (!this.isRunning) return;
    this.isRunning = false;
    if (this.clockSource) {
      this.clockSource.stop();
    }
    console.log("Stop time", this.audioContext.currentTime);
  }

  seek(position: number) {
    this._position = position;
    this.startTime =
      this.audioContext.currentTime - this._position / (this._tempo / 60);
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
      try {
        this.clockSource.stop(); // Stop the previous clock source
      } catch (e) {
        console.warn("Attempted to stop a non-started clock source", e);
      }
      this.clockSource.disconnect();
    }
    this.createClockSource();
    this.clockSource.onended = () => {
      this.tick();
    };
    const secondsPerBeat = 60 / this._tempo;
    this.clockSource.start(this.audioContext.currentTime + secondsPerBeat);
  }

  private tick = () => {
    if (this.isRunning) {
      this._position =
        (this.audioContext.currentTime - this.startTime) * (this._tempo / 60);
      this.tickCallback();
      this.scheduleTick();
    }
  };

  getPosition() {
    return this._position;
  }

  getTempo() {
    return this._tempo;
  }

  dispose() {
    this.stop();
    if (this.clockSource) {
      this.clockSource.disconnect();
      this.clockSource = null;
    }
  }
}
