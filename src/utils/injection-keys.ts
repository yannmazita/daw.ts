import type { InjectionKey } from 'vue';
import { SequencerManager } from '@/services/SequencerManager';

export const sequencerManagerKey: InjectionKey<SequencerManager> = Symbol('sequencerManager');
