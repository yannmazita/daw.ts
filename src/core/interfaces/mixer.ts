// src/core/interfaces/mixer.ts

import { EffectName } from "@/core/enums/EffectName";

export interface MixerEffect {
  id: string;
  effectName: EffectName;
  bypass: boolean;
  wet: number;
  parameters: Record<string, number | string | boolean>;
}

export interface Send {
  id: string;
  from: string;
  to: string;
  level: number;
}

export interface MixerChannel {
  id: string;
  name: string;
  volume: number;
  pan: number;
  mute: boolean;
  solo: boolean;
  effects: MixerEffect[];
  sends: Send[];
}

export interface MixerState {
  channels: MixerChannel[];
  master: MixerChannel;
  sends: Send[];
  soloChannels: Set<string>;
  updateChannel: (id: string, updates: Partial<MixerChannel>) => void;
  addChannel: (channel: Omit<MixerChannel, "id">) => string;
  removeChannel: (id: string) => void;
  addEffect: (channelId: string, effect: Omit<MixerEffect, "id">) => string;
  removeEffect: (channelId: string, effectId: string) => void;
  updateEffect: (
    channelId: string,
    effectId: string,
    updates: Partial<MixerEffect>,
  ) => void;
  addSend: (send: Omit<Send, "id">) => string;
  removeSend: (id: string) => void;
  updateSend: (id: string, updates: Partial<Send>) => void;
}
