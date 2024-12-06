// src/core/interfaces/automation.ts

import { EffectName } from "../enums/EffectName";

export enum AutomationCurve {
  LINEAR = "linear",
  EXPONENTIAL = "exponential",
  LOGARITHMIC = "logarithmic",
  SINE = "sine",
  COSINE = "cosine",
  STEP = "step",
  HOLD = "hold",
  INSTANT = "instant",
}

export enum AutomationParameterType {
  // Common parameters
  VOLUME = "volume",
  PAN = "pan",
  MUTE = "mute",

  // Instrument parameters
  FREQUENCY = "frequency",
  DETUNE = "detune",
  PHASE = "phase",

  // Filter parameters
  FILTER_CUTOFF = "filterCutoff",
  FILTER_RESONANCE = "filterResonance",

  // Envelope parameters
  ATTACK = "attack",
  DECAY = "decay",
  SUSTAIN = "sustain",
  RELEASE = "release",

  // Effect parameters
  WET = "wet",
  FEEDBACK = "feedback",
  DELAY_TIME = "delayTime",

  // Custom parameter
  CUSTOM = "custom",
}

export type AutomationTargetType = "instrument" | "effect" | "mixer";

export interface AutomationTarget {
  type: AutomationTargetType;
  id: string;
  parameter: AutomationParameterType | string; // string for custom parameters
  effectType?: EffectName; // Only for effect targets
}

export interface AutomationPoint {
  time: number;
  value: number;
  curve: AutomationCurve;
}

export interface AutomationData {
  id: string;
  target: AutomationTarget;
  points: AutomationPoint[];
  enabled: boolean;
  metadata?: {
    name?: string;
    color?: string;
    visible?: boolean;
    [key: string]: any;
  };
}

// Helper type for parameter ranges
export interface ParameterRange {
  min: number;
  max: number;
  default: number;
  step?: number;
  unit?: string;
}

// Parameter definitions for different target types
export const PARAMETER_RANGES: Record<AutomationParameterType, ParameterRange> =
  {
    [AutomationParameterType.VOLUME]: {
      min: -Infinity,
      max: 6,
      default: 0,
      unit: "dB",
    },
    [AutomationParameterType.PAN]: {
      min: -1,
      max: 1,
      default: 0,
      step: 0.01,
    },
    [AutomationParameterType.MUTE]: {
      min: 0,
      max: 1,
      default: 0,
      step: 1,
    },
    [AutomationParameterType.FREQUENCY]: {
      min: 20,
      max: 20000,
      default: 440,
      unit: "Hz",
    },
    [AutomationParameterType.DETUNE]: {
      min: -100,
      max: 100,
      default: 0,
      step: 1,
      unit: "cents",
    },
    [AutomationParameterType.PHASE]: {
      min: 0,
      max: 360,
      default: 0,
      step: 1,
      unit: "°",
    },
    [AutomationParameterType.FILTER_CUTOFF]: {
      min: 20,
      max: 20000,
      default: 1000,
      unit: "Hz",
    },
    [AutomationParameterType.FILTER_RESONANCE]: {
      min: 0,
      max: 20,
      default: 1,
      step: 0.1,
    },
    [AutomationParameterType.ATTACK]: {
      min: 0,
      max: 2,
      default: 0.01,
      step: 0.01,
      unit: "s",
    },
    [AutomationParameterType.DECAY]: {
      min: 0,
      max: 2,
      default: 0.1,
      step: 0.01,
      unit: "s",
    },
    [AutomationParameterType.SUSTAIN]: {
      min: 0,
      max: 1,
      default: 0.5,
      step: 0.01,
    },
    [AutomationParameterType.RELEASE]: {
      min: 0,
      max: 5,
      default: 0.1,
      step: 0.01,
      unit: "s",
    },
    [AutomationParameterType.WET]: {
      min: 0,
      max: 1,
      default: 1,
      step: 0.01,
    },
    [AutomationParameterType.FEEDBACK]: {
      min: 0,
      max: 1,
      default: 0.5,
      step: 0.01,
    },
    [AutomationParameterType.DELAY_TIME]: {
      min: 0,
      max: 5,
      default: 0.25,
      step: 0.01,
      unit: "s",
    },
    [AutomationParameterType.CUSTOM]: {
      min: 0,
      max: 1,
      default: 0,
      step: 0.01,
    },
  };

// Helper functions for automation
export const createAutomationTarget = (
  type: AutomationTargetType,
  id: string,
  parameter: AutomationParameterType | string,
  effectType?: EffectName,
): AutomationTarget => ({
  type,
  id,
  parameter,
  effectType,
});

export const createAutomationPoint = (
  time: number,
  value: number,
  curve: AutomationCurve = AutomationCurve.LINEAR,
): AutomationPoint => ({
  time,
  value,
  curve,
});

export const createAutomationData = (
  target: AutomationTarget,
  points: AutomationPoint[] = [],
  metadata?: AutomationData["metadata"],
): AutomationData => ({
  id: `automation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  target,
  points,
  enabled: true,
  metadata,
});

// Validation functions
export const isValidParameterValue = (
  parameter: AutomationParameterType,
  value: number,
): boolean => {
  const range = PARAMETER_RANGES[parameter];
  if (!range) return true; // Custom parameters are always valid
  return value >= range.min && value <= range.max;
};

export const normalizeParameterValue = (
  parameter: AutomationParameterType,
  value: number,
): number => {
  const range = PARAMETER_RANGES[parameter];
  if (!range) return value;
  return Math.min(Math.max(value, range.min), range.max);
};
