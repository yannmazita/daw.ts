import type { InjectionKey } from 'vue';
import { SequencerService } from '@/services/SequencerServices.ts';

export const sequencerServiceKey: InjectionKey<SequencerService> = Symbol('sequencerService');
