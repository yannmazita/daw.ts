// src/features/patterns/slices/usePatternStore.ts

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type {} from "@redux-devtools/extension";
import { Pattern, PatternTrack, PatternData } from "@/core/interfaces/pattern";
import { AutomationData } from "@/core/interfaces/automation";

interface PatternState {
  patterns: Pattern[];
  currentPatternId: string | null;

  // Pattern Management
  addPattern: (patternData: Omit<Partial<Pattern>, "id">) => string;
  deletePattern: (id: string) => void;
  updatePattern: (id: string, updates: Partial<Pattern>) => void;
  duplicatePattern: (id: string) => string;

  // Track Management
  addTrack: (patternId: string, track: Omit<PatternTrack, "id">) => string;
  removeTrack: (patternId: string, trackId: string) => void;
  updateTrack: (
    patternId: string,
    trackId: string,
    updates: Partial<PatternTrack>,
  ) => void;

  // Pattern Data Management
  updatePatternData: (
    patternId: string,
    trackId: string,
    data: PatternData,
  ) => void;

  // Automation Management
  addAutomation: (
    patternId: string,
    trackId: string,
    automation: Omit<AutomationData, "id">,
  ) => string;
  removeAutomation: (
    patternId: string,
    trackId: string,
    automationId: string,
  ) => void;
  updateAutomation: (
    patternId: string,
    trackId: string,
    automationId: string,
    updates: Partial<AutomationData>,
  ) => void;
}

export const usePatternStore = create<PatternState>()(
  devtools(
    (set, get) => ({
      patterns: [],
      currentPatternId: null,

      addPattern: (pattern: Omit<Partial<Pattern>, "id">) => {
        const id = `pattern_${Date.now()}`;
        const defaultPattern: Pattern = {
          id,
          name: "Default Pattern",
          color: `hsl(${Math.random() * 360}, 70%, 50%)`,
          length: 4,
          timeSignature: [4, 4],
          tracks: [],
        };

        set((state) => ({
          patterns: [...state.patterns, { ...defaultPattern, ...pattern }],
          currentPatternId: state.currentPatternId ?? id,
        }));

        return id;
      },

      deletePattern: (id) => {
        set((state) => ({
          patterns: state.patterns.filter((p) => p.id !== id),
          currentPatternId:
            state.currentPatternId === id
              ? state.patterns[0]?.id || null
              : state.currentPatternId,
        }));
      },

      updatePattern: (id, updates) => {
        set((state) => ({
          patterns: state.patterns.map((p) =>
            p.id === id ? { ...p, ...updates } : p,
          ),
        }));
      },

      duplicatePattern: (id) => {
        const pattern = get().patterns.find((p) => p.id === id);
        if (!pattern) return id;

        const newId = `pattern_${Date.now()}`;
        const newPattern: Pattern = {
          ...pattern,
          id: newId,
          name: `${pattern.name} (Copy)`,
          tracks: pattern.tracks.map((track) => ({
            ...track,
            id: `track_${Date.now()}_${Math.random()}`,
          })),
        };

        set((state) => ({
          patterns: [...state.patterns, newPattern],
        }));

        return newId;
      },

      addTrack: (patternId, track) => {
        const trackId = `track_${Date.now()}`;
        set((state) => ({
          patterns: state.patterns.map((p) =>
            p.id === patternId
              ? {
                  ...p,
                  tracks: [
                    ...p.tracks,
                    {
                      ...track,
                      id: trackId,
                    },
                  ],
                }
              : p,
          ),
        }));
        return trackId;
      },

      removeTrack: (patternId, trackId) => {
        set((state) => ({
          patterns: state.patterns.map((p) =>
            p.id === patternId
              ? {
                  ...p,
                  tracks: p.tracks.filter((t) => t.id !== trackId),
                }
              : p,
          ),
        }));
      },

      updateTrack: (patternId, trackId, updates) => {
        set((state) => ({
          patterns: state.patterns.map((p) =>
            p.id === patternId
              ? {
                  ...p,
                  tracks: p.tracks.map((t) =>
                    t.id === trackId ? { ...t, ...updates } : t,
                  ),
                }
              : p,
          ),
        }));
      },

      updatePatternData: (patternId, trackId, data) => {
        set((state) => ({
          patterns: state.patterns.map((p) =>
            p.id === patternId
              ? {
                  ...p,
                  tracks: p.tracks.map((t) =>
                    t.id === trackId ? { ...t, data } : t,
                  ),
                }
              : p,
          ),
        }));
      },

      addAutomation: (patternId, trackId, automation) => {
        const automationId = `automation_${Date.now()}`;
        set((state) => ({
          patterns: state.patterns.map((p) =>
            p.id === patternId
              ? {
                  ...p,
                  tracks: p.tracks.map((t) =>
                    t.id === trackId
                      ? {
                          ...t,
                          automationData: [
                            ...t.automationData,
                            { ...automation, id: automationId },
                          ],
                        }
                      : t,
                  ),
                }
              : p,
          ),
        }));
        return automationId;
      },

      removeAutomation: (patternId, trackId, automationId) => {
        set((state) => ({
          patterns: state.patterns.map((p) =>
            p.id === patternId
              ? {
                  ...p,
                  tracks: p.tracks.map((t) =>
                    t.id === trackId
                      ? {
                          ...t,
                          automationData: t.automationData.filter(
                            (a) => a.id !== automationId,
                          ),
                        }
                      : t,
                  ),
                }
              : p,
          ),
        }));
      },

      updateAutomation: (patternId, trackId, automationId, updates) => {
        set((state) => ({
          patterns: state.patterns.map((p) =>
            p.id === patternId
              ? {
                  ...p,
                  tracks: p.tracks.map((t) =>
                    t.id === trackId
                      ? {
                          ...t,
                          automationData: t.automationData.map((a) =>
                            a.id === automationId ? { ...a, ...updates } : a,
                          ),
                        }
                      : t,
                  ),
                }
              : p,
          ),
        }));
      },
    }),
    { name: "pattern-storage" },
  ),
);
