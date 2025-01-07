// src/features/clips/utils/stateUtils.ts
import { EngineState } from "@/core/stores/useEngineStore";
import { ClipState } from "../types";

export const updateClipState = (
  state: ClipState,
  updates: Partial<ClipState>,
): ClipState => ({
  ...state,
  ...updates,
});

export const updateClipAndTransportState = (
  state: EngineState,
  clipUpdates: Partial<ClipState>,
  transportUpdates?: Partial<EngineState["transport"]>,
): EngineState => {
  return {
    ...state,
    clips: updateClipState(state.clips, clipUpdates),
    transport: {
      ...state.transport,
      ...transportUpdates,
    },
  };
};
