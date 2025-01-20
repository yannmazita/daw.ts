// src/features/mix/services/MixParameterService.ts
import { MixState } from "../types";
import { calculateSoloState, updateSoloState } from "../utils/soloUtils";

export class MixParameterService {
  constructor(private audioContext: AudioContext) {}

  /**
   * Sets the mute state of a track.
   * @param state - The current state.
   * @param trackId - The id of the track to set the mute state for.
   * @param isMuted - The mute state to set.
   * @throws If the track is not found.
   * @returns The updated state.
   */
  setTrackIsMuted(
    state: MixState,
    trackId: string,
    isMuted: boolean,
  ): MixState {
    const track = state.mixer.tracks[trackId];
    if (!track) {
      throw new Error(`Track with id ${trackId} not found`);
    }
    track.isMuted = isMuted;
    track.outputNode.gain.exponentialRampToValueAtTime(
      isMuted ? 0.01 : track.previousGain,
      this.audioContext.currentTime + 2,
    );

    return {
      ...state,
      mixer: {
        ...state.mixer,
        tracks: { ...state.mixer.tracks, [trackId]: track },
      },
    };
  }

  /**
   * Sets the mute state of a return track.
   * @param state - The current state.
   * @param trackId - The id of the track to set the mute state for.
   * @param isMuted - The mute state to set.
   * @returns The updated state.
   * @throws If the return track is not found.
   */
  setReturnTrackIsMuted(
    state: MixState,
    trackId: string,
    isMuted: boolean,
  ): MixState {
    const track = state.mixer.returnTracks[trackId];
    if (!track) {
      throw new Error(`Return Track with id ${trackId} not found`);
    }
    track.isMuted = isMuted;
    track.outputNode.gain.exponentialRampToValueAtTime(
      isMuted ? 0.01 : track.previousGain,
      this.audioContext.currentTime + 2,
    );

    return {
      ...state,
      mixer: {
        ...state.mixer,
        returnTracks: { ...state.mixer.returnTracks, [trackId]: track },
      },
    };
  }

  /**
   * Sets the mute state of a chain.
   * @param state - The current state.
   * @param trackId - The chain's parent track id.
   * @param chainId - The id of the chain to set the mute state for.
   * @param isMuted - The mute state to set.
   * @returns The updated state.
   * @throws If the sound chain or the chain is not found.
   */
  setChainIsMuted(
    state: MixState,
    trackId: string,
    chainId: string,
    isMuted: boolean,
  ): MixState {
    const soundChain = state.mixer.tracks[trackId].soundChain;
    if (!soundChain) {
      throw new Error(`Sound chain for track ${trackId} not found`);
    }
    const chain = soundChain.chains[chainId];
    if (!chain) {
      throw new Error(`Chain with id ${chainId} not found`);
    }
    chain.isMuted = isMuted;
    chain.outputNode.gain.exponentialRampToValueAtTime(
      isMuted ? 0.01 : chain.previousGain,
      this.audioContext.currentTime + 2,
    );

    return {
      ...state,
      mixer: {
        ...state.mixer,
        tracks: {
          ...state.mixer.tracks,
          [trackId]: {
            ...state.mixer.tracks[trackId],
            soundChain: {
              ...state.mixer.tracks[trackId].soundChain,
              chains: {
                ...state.mixer.tracks[trackId].soundChain?.chains,
                [chainId]: chain,
              },
            },
          },
        },
      },
    };
  }

  /**
   * Sets the solo state of a track.
   * @param state - The current state.
   * @param trackId - The id of the track to set the solo state for.
   * @param isSoloed - The solo state to set.
   * @returns The updated state.
   */
  setTrackIsSoloed(
    state: MixState,
    trackId: string,
    isSoloed: boolean,
  ): MixState {
    const track = state.mixer.tracks[trackId];
    if (!track) {
      throw new Error(`Track with id ${trackId} not found`);
    }
    const { muteStates, elementId } = calculateSoloState(
      trackId,
      isSoloed,
      state.mixer.tracks,
    );
    const updatedTracks = updateSoloState(state.mixer.tracks, {
      elementId,
      isSoloed,
      muteStates,
    });
    const soloedElementsIds = new Set(state.mixer.soloedElementsIds);
    if (isSoloed) {
      soloedElementsIds.add(trackId);
    } else {
      soloedElementsIds.delete(trackId);
    }
    Object.values(updatedTracks).forEach((updatedTrack) => {
      updatedTrack.outputNode.gain.exponentialRampToValueAtTime(
        updatedTrack.isMuted ? 0.01 : updatedTrack.previousGain,
        this.audioContext.currentTime + 2,
      );
    });
    return {
      ...state,
      mixer: {
        ...state.mixer,
        tracks: updatedTracks,
        soloedElementsIds,
      },
    };
  }

  /**
   * Sets the solo state of a return track.
   * @param state - The current state.
   * @param trackId - The id of the return track to set the solo state for.
   * @param isSoloed - The solo state to set.
   * @returns The updated state.
   */
  setReturnTrackIsSoloed(
    state: MixState,
    trackId: string,
    isSoloed: boolean,
  ): MixState {
    const track = state.mixer.returnTracks[trackId];
    if (!track) {
      throw new Error(`Return Track with id ${trackId} not found`);
    }
    const { muteStates, elementId } = calculateSoloState(
      trackId,
      isSoloed,
      state.mixer.returnTracks,
    );
    const updatedReturnTracks = updateSoloState(state.mixer.returnTracks, {
      elementId,
      isSoloed,
      muteStates,
    });
    const soloedElementsIds = new Set(state.mixer.soloedElementsIds);
    if (isSoloed) {
      soloedElementsIds.add(trackId);
    } else {
      soloedElementsIds.delete(trackId);
    }
    Object.values(updatedReturnTracks).forEach((updatedTrack) => {
      updatedTrack.outputNode.gain.exponentialRampToValueAtTime(
        updatedTrack.isMuted ? 0.01 : updatedTrack.previousGain,
        this.audioContext.currentTime + 2,
      );
    });
    return {
      ...state,
      mixer: {
        ...state.mixer,
        returnTracks: updatedReturnTracks,
        soloedElementsIds,
      },
    };
  }

  setChainIsSoloed(
    state: MixState,
    trackId: string,
    chainId: string,
    isSoloed: boolean,
  ): MixState {
    const soundChain = state.mixer.tracks[trackId].soundChain;
    if (!soundChain) {
      throw new Error(`Sound chain for track ${trackId} not found`);
    }
    const chain = soundChain.chains[chainId];
    if (!chain) {
      throw new Error(`Chain with id ${chainId} not found`);
    }
    const { muteStates, elementId } = calculateSoloState(
      chainId,
      isSoloed,
      soundChain.chains,
    );
    const updatedChains = updateSoloState(soundChain.chains, {
      elementId,
      isSoloed,
      muteStates,
    });
    Object.values(updatedChains).forEach((updatedChain) => {
      updatedChain.outputNode.gain.exponentialRampToValueAtTime(
        updatedChain.isMuted ? 0.01 : updatedChain.previousGain,
        this.audioContext.currentTime + 2,
      );
    });
    return {
      ...state,
      mixer: {
        ...state.mixer,
        tracks: {
          ...state.mixer.tracks,
          [trackId]: {
            ...state.mixer.tracks[trackId],
            soundChain: {
              ...state.mixer.tracks[trackId].soundChain,
              chains: updatedChains,
            },
          },
        },
      },
    };
  }

  /**
   * Sets the volume of a track.
   * @param state - The current state.
   * @param trackId - The id of the track to set the volume for.
   * @param volume - The volume to set.
   * @returns The updated state.
   * @throws If the track is not found.
   */
  setTrackVolume(state: MixState, trackId: string, volume: number): MixState {
    const track = state.mixer.tracks[trackId];
    if (!track) {
      throw new Error(`Track with id ${trackId} not found`);
    }
    const clampedVolume = Math.max(0.01, Math.min(1, volume));
    track.previousGain = clampedVolume;
    track.outputNode.gain.exponentialRampToValueAtTime(
      clampedVolume,
      this.audioContext.currentTime + 2,
    );

    return {
      ...state,
      mixer: {
        ...state.mixer,
        tracks: { ...state.mixer.tracks, [trackId]: track },
      },
    };
  }

  /**
   * Sets the volume of a return track.
   * @param state - The current state.
   * @param trackId - The id of the track to set the volume for.
   * @param volume - The volume to set.
   * @returns The updated state.
   * @throws If the return track is not found.
   */
  setReturnTrackVolume(
    state: MixState,
    trackId: string,
    volume: number,
  ): MixState {
    const track = state.mixer.returnTracks[trackId];
    if (!track) {
      throw new Error(`Return Track with id ${trackId} not found`);
    }
    const clampedVolume = Math.max(0.01, Math.min(1, volume));
    track.previousGain = clampedVolume;
    track.outputNode.gain.exponentialRampToValueAtTime(
      clampedVolume,
      this.audioContext.currentTime + 2,
    );

    return {
      ...state,
      mixer: {
        ...state.mixer,
        returnTracks: { ...state.mixer.returnTracks, [trackId]: track },
      },
    };
  }

  /**
   * Sets the volume state of a chain.
   * @param state - The current state.
   * @param trackId - The chain's parent track id.
   * @param chainId - The id of the chain to set the volume state for.
   * @param volumeu - The volume to set.
   * @returns The updated state.
   * @throws If the sound chain or the chain is not found.
   */
  setChainVolume(
    state: MixState,
    trackId: string,
    chainId: string,
    volume: number,
  ): MixState {
    const soundChain = state.mixer.tracks[trackId].soundChain;
    if (!soundChain) {
      throw new Error(`Sound chain for track ${trackId} not found`);
    }
    const chain = soundChain.chains[chainId];
    if (!chain) {
      throw new Error(`Chain with id ${chainId} not found`);
    }
    const clampedVolume = Math.max(0.01, Math.min(1, volume));
    chain.previousGain = clampedVolume;
    chain.outputNode.gain.exponentialRampToValueAtTime(
      clampedVolume,
      this.audioContext.currentTime + 2,
    );

    return {
      ...state,
      mixer: {
        ...state.mixer,
        tracks: {
          ...state.mixer.tracks,
          [trackId]: {
            ...state.mixer.tracks[trackId],
            soundChain: {
              ...state.mixer.tracks[trackId].soundChain,
              chains: {
                ...state.mixer.tracks[trackId].soundChain?.chains,
                [chainId]: chain,
              },
            },
          },
        },
      },
    };
  }

  /**
   * Sets the pan of a track.
   * @param state - The current state.
   * @param trackId - The track id.
   * @param pan - The pan to set.
   * @returns The updated state.
   * @throws If the track is not found.
   */
  setTrackPan(state: MixState, trackId: string, pan: number): MixState {
    const track = state.mixer.tracks[trackId];
    if (!track) {
      throw new Error(`Track with id ${trackId} not found`);
    }
    const clampedPan = Math.max(-1, Math.min(1, pan));
    track.panNode.pan.value = clampedPan;
    return {
      ...state,
      mixer: {
        ...state.mixer,
        tracks: { ...state.mixer.tracks, [trackId]: track },
      },
    };
  }

  /**
   * Sets the pan of a return track.
   * @param state - The current state.
   * @param trackId - The return track id.
   * @param pan - The pan to set.
   * @returns The updated state.
   * @throws If the track is not found.
   */
  setReturnTrackPan(state: MixState, trackId: string, pan: number): MixState {
    const track = state.mixer.returnTracks[trackId];
    if (!track) {
      throw new Error(`Return Track with id ${trackId} not found`);
    }
    const clampedPan = Math.max(-1, Math.min(1, pan));
    track.panNode.pan.value = clampedPan;
    return {
      ...state,
      mixer: {
        ...state.mixer,
        returnTracks: { ...state.mixer.returnTracks, [trackId]: track },
      },
    };
  }

  /**
   * Sets the pan of a chain.
   * @param state - The current state.
   * @param trackId - The chain's parent track id.
   * @param chainId - The id of the chain to set the pan state for.
   * @param pan - The pan to set.
   * @returns The updated state.
   * @throws If the sound chain or the chain is not found.
   */
  setChainPan(
    state: MixState,
    trackId: string,
    chainId: string,
    pan: number,
  ): MixState {
    const soundChain = state.mixer.tracks[trackId].soundChain;
    if (!soundChain) {
      throw new Error(`Sound chain for track ${trackId} not found`);
    }
    const chain = soundChain.chains[chainId];
    if (!chain) {
      throw new Error(`Chain with id ${chainId} not found`);
    }
    const clampedPan = Math.max(-1, Math.min(1, pan));
    chain.panNode.pan.value = clampedPan;
    return {
      ...state,
      mixer: {
        ...state.mixer,
        tracks: {
          ...state.mixer.tracks,
          [trackId]: {
            ...state.mixer.tracks[trackId],
            soundChain: {
              ...state.mixer.tracks[trackId].soundChain,
              chains: {
                ...state.mixer.tracks[trackId].soundChain?.chains,
                [chainId]: chain,
              },
            },
          },
        },
      },
    };
  }
}
