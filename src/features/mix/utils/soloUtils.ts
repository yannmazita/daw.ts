// src/features/mix/utils/soloUtils.ts
interface SoloStateUpdate {
  elementId: string;
  isSoloed: boolean;
  muteStates: Record<string, boolean>;
}

/**
 * Calculates new mute states for all elements based on solo changes.
 *
 * @param elementId - ID of the element being changed
 * @param isSoloed - New solo state
 * @param elements - Current elements
 * @returns Object containing element id, solo state, and new mute states
 */
export const calculateSoloState = <T extends { id: string; isSoloed: boolean }>(
  elementId: string,
  isSoloed: boolean,
  elements: Record<string, T>,
): SoloStateUpdate => {
  const muteStates: Record<string, boolean> = {};

  if (isSoloed) {
    // When soloing an element
    Object.entries(elements).forEach(([id, element]) => {
      muteStates[id] = id !== elementId && !element.isSoloed;
    });
  } else {
    // When un-soloing an element
    const otherSoloedElements = Object.values(elements).some(
      (e) => e.id !== elementId && e.isSoloed,
    );

    if (otherSoloedElements) {
      // If other elements are still soloed
      Object.entries(elements).forEach(([id, element]) => {
        muteStates[id] = !element.isSoloed;
      });
    } else {
      // If no elements are soloed anymore, unmute all elements
      Object.entries(elements).forEach(([id, _]) => {
        muteStates[id] = false; // Unmute all elements
      });
    }
  }

  return {
    elementId,
    isSoloed,
    muteStates,
  };
};

export const updateSoloState = <
  T extends { id: string; isSoloed: boolean; isMuted: boolean },
>(
  elements: Record<string, T>,
  soloStateUpdate: SoloStateUpdate,
): Record<string, T> => {
  const updatedElements = { ...elements };
  Object.entries(updatedElements).forEach(([id, element]) => {
    const muteState = soloStateUpdate.muteStates[id];
    if (muteState !== undefined) {
      updatedElements[id] = {
        ...element,
        isSoloed:
          soloStateUpdate.isSoloed && element.id === soloStateUpdate.elementId,
        isMuted: muteState,
      };
    }
  });
  return updatedElements;
};
