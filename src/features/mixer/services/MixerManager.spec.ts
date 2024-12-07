// src/features/mixer/services/MixerManager.spec.ts

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { MixerManager } from "./MixerManager";
import { EffectName } from "@/core/types/effect";
import { MixerChannel } from "@/core/interfaces/mixer";

// Mock Tone.js classes and context
vi.mock("tone", () => {
  const mockContext = {
    createGain: vi.fn(),
    createOscillator: vi.fn(),
  };

  const createMockNode = () => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
    dispose: vi.fn(),
    chain: vi.fn(),
    context: mockContext,
  });

  const createMockGain = () => ({
    ...createMockNode(),
    gain: { value: 1 },
  });

  const createMockChannel = () => ({
    ...createMockNode(),
    volume: { value: 0 },
    pan: { value: 0 },
    mute: false,
    solo: false,
  });

  const createMockEffect = () => ({
    ...createMockNode(),
  });

  return {
    getContext: vi.fn(() => mockContext),
    start: vi.fn(),
    Channel: vi.fn().mockImplementation(createMockChannel),
    Gain: vi.fn().mockImplementation(createMockGain),
    AutoFilter: vi.fn().mockImplementation(createMockEffect),
    AutoPanner: vi.fn().mockImplementation(createMockEffect),
    AutoWah: vi.fn().mockImplementation(createMockEffect),
    BitCrusher: vi.fn().mockImplementation(createMockEffect),
    Chebyshev: vi.fn().mockImplementation(createMockEffect),
    Chorus: vi.fn().mockImplementation(createMockEffect),
    Distortion: vi.fn().mockImplementation(createMockEffect),
    FeedbackDelay: vi.fn().mockImplementation(createMockEffect),
    Freeverb: vi.fn().mockImplementation(createMockEffect),
    FrequencyShifter: vi.fn().mockImplementation(createMockEffect),
    JCReverb: vi.fn().mockImplementation(createMockEffect),
    Phaser: vi.fn().mockImplementation(createMockEffect),
    PingPongDelay: vi.fn().mockImplementation(createMockEffect),
    PitchShift: vi.fn().mockImplementation(createMockEffect),
    Reverb: vi.fn().mockImplementation(createMockEffect),
    StereoWidener: vi.fn().mockImplementation(createMockEffect),
    Vibrato: vi.fn().mockImplementation(createMockEffect),
  };
});

describe("MixerManager", () => {
  let mixer: MixerManager;

  // Helper function to safely get a channel and throw if not found
  const getChannel = (channelId: string): MixerChannel => {
    const channel = mixer.channels.get(channelId);
    if (!channel) {
      throw new Error(`Channel ${channelId} not found`);
    }
    return channel;
  };

  beforeEach(() => {
    mixer = new MixerManager();
  });

  afterEach(() => {
    mixer.actions.dispose();
    vi.clearAllMocks();
  });

  describe("Channel Management", () => {
    it("should create a channel with default settings", () => {
      const channelId = mixer.actions.createChannel("Test Channel");
      const state = mixer.state;

      expect(channelId).toBeDefined();
      expect(state.channels).toHaveLength(1);
      expect(state.channels[0]).toMatchObject({
        name: "Test Channel",
        volume: 0,
        pan: 0,
        mute: false,
        solo: false,
        effects: [],
        sends: [],
      });
    });

    it("should remove a channel and clean up its resources", () => {
      const channelId = mixer.actions.createChannel("Test Channel");
      const channel = mixer.channels.get(channelId);

      mixer.actions.removeChannel(channelId);

      expect(mixer.state.channels).toHaveLength(0);
      expect(channel?.channel.dispose).toHaveBeenCalled();
    });

    it("should update channel parameters", () => {
      const channelId = mixer.actions.createChannel("Test Channel");

      mixer.actions.updateChannel(channelId, {
        volume: -6,
        pan: 0.5,
        mute: true,
      });

      const channel = mixer.channels.get(channelId);
      expect(channel?.channel.volume.value).toBe(-6);
      expect(channel?.channel.pan.value).toBe(0.5);
      expect(channel?.channel.mute).toBe(true);
    });
  });

  describe("Effect Management", () => {
    let mixer: MixerManager;
    let channelId: string;

    beforeEach(() => {
      mixer = new MixerManager();
      channelId = mixer.actions.createChannel("Test Channel");
    });

    afterEach(() => {
      mixer.actions.dispose();
      vi.clearAllMocks();
    });

    /*
    describe("Effect Creation", () => {
      it.each([
        [
          "AutoFilter",
          EffectName.AutoFilter,
          {
            baseFrequency: 200,
            depth: 1,
            filter: {
              type: "lowpass",
              Q: 1,
              rolloff: -12,
            },
            frequency: 1,
            octaves: 2.6,
            type: "sine",
            wet: 1,
          } as Tone.AutoFilterOptions,
        ],
        [
          "AutoPanner",
          EffectName.AutoPanner,
          {
            channelCount: 2,
            depth: 0.8,
            frequency: 2,
            type: "sine" as const, // explicitly type as ToneOscillatorType
            wet: 1,
          } as Tone.AutoPannerOptions,
        ],
        [
          "AutoWah",
          EffectName.AutoWah,
          {
            Q: 3,
            baseFrequency: 200,
            follower: 0.5,
            gain: 2,
            octaves: 4,
            sensitivity: 0.5,
            wet: 1,
          } as Tone.AutoWahOptions,
        ],
        [
          "BitCrusher",
          EffectName.BitCrusher,
          {
            bits: 8,
            wet: 1,
          } as Tone.BitCrusherOptions,
        ],
        [
          "Chebyshev",
          EffectName.Chebyshev,
          {
            order: 2,
            oversample: "2x",
            wet: 1,
          } as Tone.ChebyshevOptions,
        ],
        [
          "Chorus",
          EffectName.Chorus,
          {
            delayTime: 4,
            depth: 0.8,
            feedback: 0.2,
            frequency: 2,
            spread: 160,
            type: "sine" as const, // explicitly type as ToneOscillatorType
            wet: 1,
          } as Tone.ChorusOptions,
        ],
        [
          "Distortion",
          EffectName.Distortion,
          {
            distortion: 0.8,
            oversample: "4x",
            wet: 1,
          } as Tone.DistortionOptions,
        ],
        [
          "FeedbackDelay",
          EffectName.FeedbackDelay,
          {
            delayTime: "8n",
            maxDelay: 2,
            wet: 1,
          } as FeedbackDelayOptions,
        ],
        [
          "Freeverb",
          EffectName.Freeverb,
          {
            dampening: 4000,
            roomSize: 0.8,
            wet: 1,
          } as Tone.FreeverbOptions,
        ],
        [
          "FrequencyShifter",
          EffectName.FrequencyShifter,
          {
            frequency: 100,
            wet: 1,
          } as FrequencyShifterOptions,
        ],
        [
          "JCReverb",
          EffectName.JCReverb,
          {
            roomSize: 0.6,
            wet: 1,
          } as Tone.JCReverbOptions,
        ],
        [
          "Phaser",
          EffectName.Phaser,
          {
            Q: 12,
            baseFrequency: 400,
            frequency: 1,
            octaves: 4,
            stages: 12,
            wet: 1,
          } as Tone.PhaserOptions,
        ],
        [
          "PingPongDelay",
          EffectName.PingPongDelay,
          {
            delayTime: 0.25,
            feedback: 0.5,
            maxDelay: 1,
            wet: 1,
          } as Tone.PingPongDelayOptions,
        ],
        [
          "PitchShift",
          EffectName.PitchShift,
          {
            delayTime: 0.1,
            feedback: 0.2,
            pitch: 12,
            wet: 1,
            windowSize: 0.2,
          } as Tone.PitchShiftOptions,
        ],
        [
          "Reverb",
          EffectName.Reverb,
          {
            decay: 2,
            preDelay: 0.1,
            wet: 1,
          } as ReverbOptions,
        ],
        [
          "StereoWidener",
          EffectName.StereoWidener,
          {
            width: 0.8,
            wet: 1,
          } as Tone.StereoWidenerOptions,
        ],
      ])(
        "should create %s effect with correct options",
        (name, type, options) => {
          const effectId = mixer.actions.addEffect(channelId, type, options);

          const channel = mixer.channels.get(channelId);
          const effect = channel?.effects.get(effectId);

          expect(effectId).toBeDefined();
          expect(effect).toBeDefined();
          expect(channel?.state.effects).toHaveLength(1);
          expect(channel?.state.effects[0].options).toMatchObject(options);
        },
      );
    });
    */

    describe("Effect Chain Management", () => {
      it("should maintain correct effect order in chain", () => {
        const effect1Id = mixer.actions.addEffect(channelId, EffectName.Reverb);
        const effect2Id = mixer.actions.addEffect(channelId, EffectName.Chorus);
        const effect3Id = mixer.actions.addEffect(
          channelId,
          EffectName.Distortion,
        );

        const channel = getChannel(channelId);
        const effects = channel.state.effects;

        expect(effects[0].id).toBe(effect1Id);
        expect(effects[1].id).toBe(effect2Id);
        expect(effects[2].id).toBe(effect3Id);
      });

      it("should properly connect effects in series", () => {
        const effect1Id = mixer.actions.addEffect(channelId, EffectName.Reverb);
        const effect2Id = mixer.actions.addEffect(channelId, EffectName.Chorus);

        const channel = getChannel(channelId);
        const effect1 = channel.effects.get(effect1Id);
        const effect2 = channel.effects.get(effect2Id);

        expect(effect1?.connect).toHaveBeenCalledWith(effect2);
        expect(effect2?.connect).toHaveBeenCalledWith(mixer.master);
      });

      it("should handle effect removal and reconnect chain", () => {
        const effect1Id = mixer.actions.addEffect(channelId, EffectName.Reverb);
        const effect2Id = mixer.actions.addEffect(channelId, EffectName.Chorus);
        const effect3Id = mixer.actions.addEffect(
          channelId,
          EffectName.Distortion,
        );

        mixer.actions.removeEffect(channelId, effect2Id);

        const channel = getChannel(channelId);
        const effect1 = channel.effects.get(effect1Id);
        const effect3 = channel.effects.get(effect3Id);

        expect(effect1?.connect).toHaveBeenCalledWith(effect3);
        expect(channel.state.effects).toHaveLength(2);
      });
    });

    describe("Effect Bypass", () => {
      it("should toggle effect bypass state", () => {
        const effectId = mixer.actions.addEffect(channelId, EffectName.Reverb);

        mixer.actions.bypassEffect(channelId, effectId, true);

        const channel = getChannel(channelId);
        const effectState = channel.state.effects.find(
          (e) => e.id === effectId,
        );

        expect(effectState?.bypass).toBe(true);
      });

      it("should update routing when bypassing effects", () => {
        const effectId = mixer.actions.addEffect(channelId, EffectName.Reverb);
        const channel = getChannel(channelId);

        mixer.actions.bypassEffect(channelId, effectId, true);

        expect(channel.channel.connect).toHaveBeenCalledWith(mixer.master);
      });
    });

    describe("Error Handling", () => {
      it("should handle missing channel gracefully", () => {
        expect(() => {
          mixer.actions.addEffect("invalid-channel", EffectName.Reverb);
        }).toThrow();
      });

      it("should handle invalid effect ID gracefully", () => {
        expect(() => {
          mixer.actions.updateEffect(channelId, "invalid-effect", { wet: 0.5 });
        }).not.toThrow();
      });
    });

    describe("Resource Management", () => {
      it("should dispose effect resources when removed", () => {
        const effectId = mixer.actions.addEffect(channelId, EffectName.Reverb);
        const channel = getChannel(channelId);
        const effect = channel.effects.get(effectId);

        mixer.actions.removeEffect(channelId, effectId);

        expect(effect?.dispose).toHaveBeenCalled();
      });

      it("should clean up all effects when channel is removed", () => {
        const effect1Id = mixer.actions.addEffect(channelId, EffectName.Reverb);
        const effect2Id = mixer.actions.addEffect(channelId, EffectName.Chorus);
        const channel = getChannel(channelId);

        mixer.actions.removeChannel(channelId);

        expect(channel.effects.get(effect1Id)?.dispose).toHaveBeenCalled();
        expect(channel.effects.get(effect2Id)?.dispose).toHaveBeenCalled();
      });
    });
  });
  describe("Send System", () => {
    let sourceId: string;
    let targetId: string;

    beforeEach(() => {
      sourceId = mixer.actions.createChannel("Source Channel");
      targetId = mixer.actions.createChannel("Target Channel");
    });

    it("should create a send between channels", () => {
      const sendId = mixer.actions.createSend(sourceId, targetId, 0.5);
      const sourceChannel = mixer.channels.get(sourceId);

      expect(sendId).toBeDefined();
      expect(sourceChannel?.state.sends).toHaveLength(1);
      expect(sourceChannel?.sends.size).toBe(1);
    });

    it("should remove a send connection", () => {
      const sendId = mixer.actions.createSend(sourceId, targetId);
      const sourceChannel = mixer.channels.get(sourceId);
      const send = sourceChannel?.sends.get(sendId);

      mixer.actions.removeSend(sourceId, sendId);

      expect(sourceChannel?.state.sends).toHaveLength(0);
      expect(send?.dispose).toHaveBeenCalled();
    });

    it("should update send level", () => {
      const sendId = mixer.actions.createSend(sourceId, targetId, 0.5);

      mixer.actions.updateSend(sourceId, sendId, 0.8);

      const sourceChannel = mixer.channels.get(sourceId);
      const send = sourceChannel?.sends.get(sendId);
      expect(send?.gain.value).toBe(0.8);
    });
  });

  describe("State Management", () => {
    it("should serialize current state", () => {
      const channelId = mixer.actions.createChannel("Test Channel");
      mixer.actions.addEffect(channelId, EffectName.Reverb);

      const state = mixer.toJSON();

      expect(state.channels).toHaveLength(1);
      expect(state.channels[0].effects).toHaveLength(1);
    });

    it("should restore from serialized state", () => {
      // Create some state
      const channelId = mixer.actions.createChannel("Test Channel");
      mixer.actions.addEffect(channelId, EffectName.Reverb);
      const state = mixer.toJSON();

      // Create new mixer and restore state
      const newMixer = new MixerManager();
      newMixer.fromJSON(state);

      expect(newMixer.state.channels).toHaveLength(1);
      expect(newMixer.state.channels[0].effects).toHaveLength(1);
    });
  });

  describe("Audio Routing", () => {
    it("should return correct input node", () => {
      const channelId = mixer.actions.createChannel("Test Channel");
      const inputNode = mixer.getInputNode(channelId);

      expect(inputNode).toBeDefined();
      expect(inputNode).toBe(mixer.channels.get(channelId)?.channel);
    });

    it("should return correct output node", () => {
      const channelId = mixer.actions.createChannel("Test Channel");
      mixer.actions.addEffect(channelId, EffectName.Reverb);

      const outputNode = mixer.getOutputNode(channelId);
      const channel = mixer.channels.get(channelId);
      const lastEffect = Array.from(channel!.effects.values()).pop();

      expect(outputNode).toBe(lastEffect);
    });

    it("should maintain proper audio routing when adding effects", () => {
      const channelId = mixer.actions.createChannel("Test Channel");
      const effectId1 = mixer.actions.addEffect(channelId, EffectName.Reverb);
      const effectId2 = mixer.actions.addEffect(
        channelId,
        EffectName.Distortion,
      );

      const channel = mixer.channels.get(channelId);
      const effect1 = channel?.effects.get(effectId1);
      const effect2 = channel?.effects.get(effectId2);

      expect(channel?.channel.connect).toHaveBeenCalledWith(effect1);
      expect(effect1?.connect).toHaveBeenCalledWith(effect2);
      expect(effect2?.connect).toHaveBeenCalledWith(mixer.master);
    });
  });

  describe("Error Handling", () => {
    it("should handle invalid channel IDs gracefully", () => {
      expect(() => {
        mixer.actions.updateChannel("invalid-id", { volume: -6 });
      }).not.toThrow();
    });

    it("should handle invalid effect IDs gracefully", () => {
      const channelId = mixer.actions.createChannel("Test Channel");
      expect(() => {
        mixer.actions.removeEffect(channelId, "invalid-effect-id");
      }).not.toThrow();
    });
  });
});
