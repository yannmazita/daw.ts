// src/features/mixer/stores/useMixerStore.ts

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type {} from "@redux-devtools/extension";
import {
  MixerState,
  MixerChannel,
  MixerEffect,
  Send,
} from "@/core/interfaces/mixer";
import { audioGraphManager } from "../services/audioGraphManagerInstance";

export const useMixerStore = create<MixerState>()(
  devtools(
    (set, get) => ({
      channels: [],
      master: {
        id: "master",
        name: "Master",
        volume: 0,
        pan: 0,
        mute: false,
        solo: false,
        effects: [],
        sends: [],
      },
      sends: [],
      soloChannels: new Set<string>(),

      updateChannel: (id: string, updates: Partial<MixerChannel>) => {
        set((state) => {
          // Update audio processing
          audioGraphManager.updateChannel(id, {
            volume: updates.volume,
            pan: updates.pan,
            mute: updates.mute,
            solo: updates.solo,
          });

          // Update state
          if (id === "master") {
            return { master: { ...state.master, ...updates } };
          }

          return {
            channels: state.channels.map((ch) =>
              ch.id === id ? { ...ch, ...updates } : ch,
            ),
          };
        });
      },

      addChannel: (channelData: Omit<MixerChannel, "id">) => {
        const id = `channel_${Date.now()}`;

        // Create audio processing
        audioGraphManager.addChannel(id);

        // Update state
        set((state) => ({
          channels: [
            ...state.channels,
            {
              ...channelData,
              id,
              effects: [],
              sends: [],
            },
          ],
        }));

        return id;
      },

      removeChannel: (id: string) => {
        // Clean up audio processing
        audioGraphManager.removeChannel(id);

        // Update state
        set((state) => ({
          channels: state.channels.filter((ch) => ch.id !== id),
          sends: state.sends.filter(
            (send) => send.from !== id && send.to !== id,
          ),
        }));
      },

      addEffect: (channelId: string, effectData: Omit<MixerEffect, "id">) => {
        const effectId = audioGraphManager.addEffect(
          channelId,
          effectData.effectName,
        );

        // Update state
        set((state) => {
          const newEffect: MixerEffect = {
            ...effectData,
            id: effectId,
            bypass: false,
            wet: 1,
            parameters: {},
          };

          if (channelId === "master") {
            return {
              master: {
                ...state.master,
                effects: [...state.master.effects, newEffect],
              },
            };
          }

          return {
            channels: state.channels.map((ch) =>
              ch.id === channelId
                ? { ...ch, effects: [...ch.effects, newEffect] }
                : ch,
            ),
          };
        });

        return effectId;
      },

      removeEffect: (channelId: string, effectId: string) => {
        // Remove from audio processing
        audioGraphManager.removeEffect(channelId, effectId);

        // Update state
        set((state) => {
          if (channelId === "master") {
            return {
              master: {
                ...state.master,
                effects: state.master.effects.filter(
                  (ef) => ef.id !== effectId,
                ),
              },
            };
          }

          return {
            channels: state.channels.map((ch) =>
              ch.id === channelId
                ? {
                    ...ch,
                    effects: ch.effects.filter((ef) => ef.id !== effectId),
                  }
                : ch,
            ),
          };
        });
      },

      updateEffect: (
        channelId: string,
        effectId: string,
        updates: Partial<MixerEffect>,
      ) => {
        const effect = audioGraphManager.getEffect(effectId);
        if (!effect) return;

        // Update effect parameters
        if (updates.parameters) {
          Object.entries(updates.parameters).forEach(([key, value]) => {
            if (key in effect) {
              (effect as any)[key] = value;
            }
          });
        }

        /*
        // Update wet parameter
        if (typeof updates.wet !== "undefined") {
          effect.wet.value = updates.wet;
        }
        */

        // Update state
        set((state) => {
          if (channelId === "master") {
            return {
              master: {
                ...state.master,
                effects: state.master.effects.map((ef) =>
                  ef.id === effectId ? { ...ef, ...updates } : ef,
                ),
              },
            };
          }

          return {
            channels: state.channels.map((ch) =>
              ch.id === channelId
                ? {
                    ...ch,
                    effects: ch.effects.map((ef) =>
                      ef.id === effectId ? { ...ef, ...updates } : ef,
                    ),
                  }
                : ch,
            ),
          };
        });
      },

      addSend: (sendData: Omit<Send, "id">) => {
        const id = audioGraphManager.createSend(
          sendData.from,
          sendData.to,
          sendData.level,
        );

        // Update state
        set((state) => {
          const newSend: Send = { ...sendData, id };
          return {
            sends: [...state.sends, newSend],
            channels: state.channels.map((ch) =>
              ch.id === sendData.from
                ? { ...ch, sends: [...ch.sends, newSend] }
                : ch,
            ),
            master:
              sendData.from === "master"
                ? { ...state.master, sends: [...state.master.sends, newSend] }
                : state.master,
          };
        });

        return id;
      },

      removeSend: (id: string) => {
        set((state) => {
          const send = state.sends.find((s) => s.id === id);
          if (!send) return state;

          // Remove audio routing
          audioGraphManager.removeSend(send.from, send.to);

          // Update state
          return {
            sends: state.sends.filter((s) => s.id !== id),
            channels: state.channels.map((ch) => ({
              ...ch,
              sends: ch.sends.filter((s) => s.id !== id),
            })),
            master: {
              ...state.master,
              sends: state.master.sends.filter((s) => s.id !== id),
            },
          };
        });
      },

      updateSend: (id: string, updates: Partial<Send>) => {
        set((state) => {
          const send = state.sends.find((s) => s.id === id);
          if (!send) return state;

          // Update audio routing
          if (typeof updates.level !== "undefined") {
            audioGraphManager.updateSend(send.from, send.to, updates.level);
          }

          // Update state
          const updatedSend = { ...send, ...updates };
          return {
            sends: state.sends.map((s) => (s.id === id ? updatedSend : s)),
            channels: state.channels.map((ch) => ({
              ...ch,
              sends: ch.sends.map((s) => (s.id === id ? updatedSend : s)),
            })),
            master: {
              ...state.master,
              sends: state.master.sends.map((s) =>
                s.id === id ? updatedSend : s,
              ),
            },
          };
        });
      },
    }),
    { name: "mixer-storage" },
  ),
);
