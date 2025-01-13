// src/featurs/clips/utils/creationUtils.ts
import { CompositionClip } from "../types";

export const createBlankClip = (
  type: CompositionClip["type"],
  parentId: string,
): CompositionClip => {
  return {
    id: crypto.randomUUID(),
    parentId,
    name: "New Clip",
    type,
    data: null,
    startTime: 0,
    pausedAt: 0,
    duration: 0,
    fadeIn: 0,
    fadeOut: 0,
    node: null,
  };
};
