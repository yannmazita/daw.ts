// src/features/composition/services/CompositionTransportService.ts
import { TransportEngine } from "@/features/transport/types";
import { useEngineStore } from "@/core/stores/useEngineStore";
import { Subdivision } from "tone/build/esm/core/type/Units";

export class CompositionTransportService {
  constructor(private readonly transportEngine: TransportEngine) {}

  async play(time?: number): Promise<void> {
    const state = useEngineStore.getState().transport;
    const newState = await this.transportEngine.play(state, time);
    useEngineStore.setState({ transport: newState });
  }

  pause(): void {
    const state = useEngineStore.getState().transport;
    const newState = this.transportEngine.pause(state);
    useEngineStore.setState({ transport: newState });
  }

  stop(): void {
    const state = useEngineStore.getState().transport;
    const newState = this.transportEngine.stop(state);
    useEngineStore.setState({ transport: newState });
  }

  seekTo(time: number): void {
    const state = useEngineStore.getState().transport;
    const newState = this.transportEngine.seekTo(state, time);
    useEngineStore.setState({ transport: newState });
  }

  setTempo(tempo: number): void {
    const state = useEngineStore.getState().transport;
    const newState = this.transportEngine.setTempo(state, tempo);
    useEngineStore.setState({ transport: newState });
  }

  setTimeSignature(numerator: number, denominator: number): void {
    const state = useEngineStore.getState().transport;
    const newState = this.transportEngine.setTimeSignature(
      state,
      numerator,
      denominator,
    );
    useEngineStore.setState({ transport: newState });
  }

  setSwing(amount: number, subdivision?: Subdivision): void {
    const state = useEngineStore.getState().transport;
    const newState = this.transportEngine.setSwing(state, amount, subdivision);
    useEngineStore.setState({ transport: newState });
  }

  startTapTempo(): void {
    const state = useEngineStore.getState().transport;
    const newState = this.transportEngine.startTapTempo(state);
    useEngineStore.setState({ transport: newState });
  }

  endTapTempo(): void {
    const state = useEngineStore.getState().transport;
    const newState = this.transportEngine.endTapTempo(state);
    useEngineStore.setState({ transport: newState });
  }

  setLoop(enabled: boolean): void {
    const state = useEngineStore.getState().transport;
    const newState = this.transportEngine.setLoop(state, enabled);
    useEngineStore.setState({ transport: newState });
  }

  setLoopPoints(start: number, end: number): void {
    const state = useEngineStore.getState().transport;
    const newState = this.transportEngine.setLoopPoints(state, start, end);
    useEngineStore.setState({ transport: newState });
  }

  getTransportDuration(): number {
    return this.transportEngine.getTransportDuration();
  }

  setTransportDuration(duration: number): void {
    const state = useEngineStore.getState().transport;
    const newState = this.transportEngine.setTransportDuration(state, duration);
    useEngineStore.setState({ transport: newState });
  }

  getTransportPosition(): number {
    return this.transportEngine.getTransportPosition();
  }

  setTransportPosition(position: number): void {
    const state = useEngineStore.getState().transport;
    const newState = this.transportEngine.setTransportPosition(state, position);
    useEngineStore.setState({ transport: newState });
  }

  dispose(): void {
    const state = useEngineStore.getState().transport;
    this.transportEngine.dispose(state);
  }
}
