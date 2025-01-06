// src/features/transport/utils/stateUtils.ts

import { TransportState } from "../types";

export const updateTransportState = (
  state: TransportState,
  updates: Partial<TransportState>,
): TransportState => {
  return {
    ...state,
    ...updates,
  };
};
