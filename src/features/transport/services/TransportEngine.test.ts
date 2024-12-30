// src/features/transport/services/TransportEngine.test.ts
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { TransportEngineImpl } from "./TransportEngine";
import * as Tone from "tone";
import { useEngineStore } from "@/core/stores/useEngineStore";
import { initialTransportState } from "../utils/initialState";
import { TransportState } from "../types";

// Mock Tone.js
vi.mock("tone", () => ({
  start: vi.fn().mockResolvedValue(undefined),
  getTransport: vi.fn(() => ({
    start: vi.fn(),
    stop: vi.fn(),
    pause: vi.fn(),
    seconds: 0,
    bpm: { value: 120 },
    timeSignature: [4, 4],
    swing: 0,
    swingSubdivision: "8n",
    loop: false,
    loopStart: 0,
    loopEnd: 0,
  })),
  Time: vi.fn((time) => ({
    toSeconds: () => (typeof time === "number" ? time : 0),
  })),
}));

// Mock Zustand store
vi.mock("@/core/stores/useEngineStore", () => ({
  useEngineStore: {
    getState: vi.fn(() => ({
      transport: { ...initialTransportState },
    })),
    setState: vi.fn(),
  },
}));

function checkUpdatedState(expectedState: Partial<TransportState>) {
  expect(useEngineStore.setState).toHaveBeenCalledTimes(1);
  expect(useEngineStore.setState).toHaveBeenCalledWith(expect.any(Function));

  const mockState = { transport: { ...initialTransportState } };
  const newState = useEngineStore.setState.mock.calls[0][0](mockState);
  expect(newState).toEqual(
    expect.objectContaining({
      transport: expect.objectContaining(expectedState),
    }),
  );
}

describe("TransportEngine", () => {
  let engine: TransportEngineImpl;
  let mockTransport: ReturnType<typeof Tone.getTransport>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockTransport = Tone.getTransport();
    engine = new TransportEngineImpl();
  });

  afterEach(() => {
    engine.dispose();
  });

  describe("Initialization", () => {
    it("should initialize with default state", () => {
      expect(engine.getState()).toEqual(initialTransportState);
    });

    it("should not be disposed initially", () => {
      expect(() => engine.getState()).not.toThrow();
    });
  });

  describe("Transport Controls", () => {
    it("should start playback and update state and call Tone.start", async () => {
      vi.mocked(Tone.start).mockResolvedValueOnce(undefined);
      await engine.play();
      expect(Tone.start).toHaveBeenCalledOnce();
      checkUpdatedState({ isPlaying: true });
    });

    it("should pause playback and update state", () => {
      engine.pause();
      expect(useEngineStore.setState).toHaveBeenCalledTimes(1);
      checkUpdatedState({ isPlaying: false });
    });

    it("should stop playback and update state", () => {
      engine.stop();
      expect(useEngineStore.setState).toHaveBeenCalledTimes(1);
      checkUpdatedState({ isPlaying: false, isRecording: false });
    });

    it("should not throw when pausing if not playing", () => {
      expect(() => engine.pause()).not.toThrow();
    });

    it("should not throw when stopping if not playing", () => {
      expect(() => engine.stop()).not.toThrow();
    });
  });

  describe("Tempo Management", () => {
    it("should set tempo within valid range", () => {
      engine.setTempo(140);
      expect(useEngineStore.setState).toHaveBeenCalledTimes(1);
      checkUpdatedState({ tempo: 140 });
    });

    it("should throw error for invalid tempo", () => {
      expect(() => engine.setTempo(1000)).toThrow();
      expect(() => engine.setTempo(-1)).toThrow();
    });
  });

  describe("Time Signature", () => {
    it("should set valid time signature", () => {
      engine.setTimeSignature(3, 4);
      expect(useEngineStore.setState).toHaveBeenCalledTimes(1);
      checkUpdatedState({ timeSignature: [3, 4] });
    });

    it("should throw error for invalid time signature", () => {
      expect(() => engine.setTimeSignature(0, 4)).toThrow();
      expect(() => engine.setTimeSignature(4, 0)).toThrow();
    });
  });

  describe("Loop Management", () => {
    it("should enable/disable loop", () => {
      engine.setLoop(true);
      expect(useEngineStore.setState).toHaveBeenCalledTimes(1);
      checkUpdatedState({ loop: { enabled: true, start: 0, end: 0 } });
    });

    it("should set loop points", () => {
      engine.setLoopPoints(1, 2);
      expect(useEngineStore.setState).toHaveBeenCalledTimes(1);
      checkUpdatedState({ loop: { enabled: false, start: 1, end: 2 } });
    });

    it("should throw error for invalid loop points", () => {
      expect(() => engine.setLoopPoints(2, 1)).toThrow();
    });
  });

  describe("Tap Tempo", () => {
    beforeEach(() => {
      vi.useFakeTimers(); // Enable fake timers before each test
    });

    afterEach(() => {
      vi.clearAllTimers(); // Clean up timers after each test
      vi.useRealTimers(); // Restore real timers after each test
    });

    it("should calculate tempo from taps", () => {
      // Simulate taps at 500ms intervals (120 BPM)
      engine.startTapTempo(); // First tap
      vi.advanceTimersByTime(500);
      engine.startTapTempo(); // Second tap
      vi.advanceTimersByTime(500);
      const bpm3 = engine.startTapTempo(); // Third tap

      expect(bpm3).toBeCloseTo(120, 0);
    });

    it("should reset tap tempo after timeout", () => {
      engine.startTapTempo();
      vi.advanceTimersByTime(3100); // Exceed TAP_TIMEOUT
      expect(engine.startTapTempo()).toBe(initialTransportState.tempo);
    });
  });
});
