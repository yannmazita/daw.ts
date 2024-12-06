// src/features/sequencer/hooks/playback/useAutomationScheduler.ts

import { useCallback, useRef } from "react";
import * as Tone from "tone";
import {
  AutomationData,
  AutomationPoint,
  AutomationCurve,
  AutomationTarget,
  AutomationParameterType,
  normalizeParameterValue,
} from "@/core/interfaces/automation";
import { instrumentManager } from "@/common/services/instrumentManagerInstance";
import { audioGraphManager } from "@/features/mixer/services/audioGraphManagerInstance";

interface AutomationScheduleOptions {
  startTime: number;
  endTime: number;
  relativePosition: number;
  scheduledEvents: Set<number>;
}

interface AutomationValue {
  time: number;
  value: number;
  curve: AutomationCurve;
}

interface ScheduledAutomation {
  target: Tone.Param<any>;
  points: AutomationValue[];
  lastValue: number;
}

export const useAutomationScheduler = () => {
  // Track active automations for cleanup and updates
  const activeAutomations = useRef<Map<string, ScheduledAutomation>>(new Map());

  // Get automation target parameter
  const getAutomationTarget = useCallback(
    (target: AutomationTarget): Tone.Param<any> | null => {
      switch (target.type) {
        case "instrument": {
          const instrument = instrumentManager.getInstrument(target.id);
          if (!instrument) return null;

          // Handle built-in parameters
          if (target.parameter in AutomationParameterType) {
            return instrument[target.parameter] as Tone.Param<any>;
          }

          // Handle custom parameters
          return (instrument as any)[target.parameter] as Tone.Param<any>;
        }
        case "effect": {
          const effect = audioGraphManager.getEffect(target.id);
          if (!effect || !target.effectType) return null;

          // Handle built-in parameters
          if (target.parameter in AutomationParameterType) {
            return effect[target.parameter] as Tone.Param<any>;
          }

          // Handle effect-specific parameters
          return (effect as any)[target.parameter] as Tone.Param<any>;
        }
        case "mixer": {
          const channel = audioGraphManager.getChannel(target.id);
          if (!channel) return null;

          switch (target.parameter) {
            case "volume":
              return channel.volume;
            case "pan":
              return channel.pan;
            case "wet":
              if (target.effectType) {
                const effect = audioGraphManager.getEffect(target.id);
                return effect?.wet || null;
              }
              return null;
            default:
              if (target.effectType) {
                const effect = audioGraphManager.getEffect(target.id);
                return (effect as any)?.[target.parameter] || null;
              }
              return null;
          }
        }

        default:
          return null;
      }
    },
    [],
  );

  // Calculate interpolated value based on curve type
  const interpolateValue = useCallback(
    (
      startValue: number,
      endValue: number,
      progress: number,
      curve: AutomationCurve,
    ): number => {
      switch (curve) {
        case AutomationCurve.LINEAR:
          return startValue + (endValue - startValue) * progress;

        case AutomationCurve.EXPONENTIAL:
          if (startValue <= 0 || endValue <= 0) return startValue;
          return startValue * Math.pow(endValue / startValue, progress);

        case AutomationCurve.LOGARITHMIC:
          if (startValue <= 0 || endValue <= 0) return startValue;
          const logStart = Math.log(startValue);
          const logEnd = Math.log(endValue);
          return Math.exp(logStart + (logEnd - logStart) * progress);

        case AutomationCurve.SINE:
          const phase = progress * Math.PI;
          return (
            startValue + ((endValue - startValue) * (1 - Math.cos(phase))) / 2
          );

        case AutomationCurve.COSINE:
          const cosPhase = progress * Math.PI;
          return (
            startValue +
            ((endValue - startValue) * (1 - Math.sin(cosPhase))) / 2
          );

        case AutomationCurve.STEP:
          return progress < 1 ? startValue : endValue;

        case AutomationCurve.HOLD:
          return startValue;

        default:
          return startValue;
      }
    },
    [],
  );

  // Schedule automation points for a parameter
  const scheduleAutomationPoints = useCallback(
    (
      target: Tone.Param<any>,
      points: AutomationPoint[],
      options: AutomationScheduleOptions,
      automationId: string,
    ) => {
      const { startTime, endTime, relativePosition, scheduledEvents } = options;

      // Sort points by time
      const sortedPoints = [...points].sort((a, b) => a.time - b.time);

      // Find relevant points for the time window
      const relevantPoints = sortedPoints.filter((point) => {
        const pointTime = point.time + startTime - relativePosition;
        return pointTime >= startTime && pointTime <= endTime;
      });

      // Find the last value before the window for continuous automation
      const lastPoint = sortedPoints
        .filter(
          (point) => point.time + startTime - relativePosition < startTime,
        )
        .pop();

      // Store automation state
      activeAutomations.current.set(automationId, {
        target,
        points: relevantPoints.map((p) => ({
          time: p.time + startTime - relativePosition,
          value: p.value,
          curve: p.curve,
        })),
        lastValue: lastPoint?.value ?? target.value,
      });

      // Schedule each point
      relevantPoints.forEach((point, index) => {
        const pointTime = point.time + startTime - relativePosition;
        const nextPoint = relevantPoints[index + 1];

        const eventId = Tone.getTransport().schedule((time) => {
          switch (point.curve) {
            case AutomationCurve.INSTANT:
            case AutomationCurve.STEP:
              target.setValueAtTime(point.value, time);
              break;

            case AutomationCurve.LINEAR:
              if (nextPoint) {
                target.linearRampToValueAtTime(
                  nextPoint.value,
                  time + (nextPoint.time - point.time),
                );
              }
              break;

            case AutomationCurve.EXPONENTIAL:
              if (nextPoint && nextPoint.value > 0 && point.value > 0) {
                target.exponentialRampToValueAtTime(
                  nextPoint.value,
                  time + (nextPoint.time - point.time),
                );
              }
              break;

            default: {
              // For custom curves, use setValueCurveAtTime
              if (nextPoint) {
                const duration = nextPoint.time - point.time;
                const steps = Math.ceil(duration * 100); // 100 steps per second
                const curve = new Float32Array(steps);

                for (let i = 0; i < steps; i++) {
                  const progress = i / (steps - 1);
                  curve[i] = interpolateValue(
                    point.value,
                    nextPoint.value,
                    progress,
                    point.curve,
                  );
                }

                target.setValueCurveAtTime(curve, time, duration);
              }
            }
          }
        }, pointTime);

        scheduledEvents.add(eventId);
      });
    },
    [interpolateValue],
  );

  // Main automation scheduling function
  const scheduleAutomation = useCallback(
    (automationData: AutomationData[], options: AutomationScheduleOptions) => {
      automationData.forEach((automation) => {
        const target = getAutomationTarget(automation.target);
        if (!target) return;

        const automationId = `${automation.target.type}_${automation.target.id}_${automation.target.parameter}`;

        scheduleAutomationPoints(
          target,
          automation.points,
          options,
          automationId,
        );
      });
    },
    [getAutomationTarget, scheduleAutomationPoints],
  );

  // Update automation in real-time (for UI interaction)
  const updateAutomationValue = useCallback(
    (automationId: string, value: number, time?: number) => {
      const automation = activeAutomations.current.get(automationId);
      if (!automation) return;

      const currentTime = time ?? Tone.now();

      // Validate and normalize the value if it's a built-in parameter
      if (
        automation.target instanceof Tone.Param &&
        automation.target.name in AutomationParameterType
      ) {
        value = normalizeParameterValue(
          automation.target.name as AutomationParameterType,
          value,
        );
      }

      automation.target.cancelScheduledValues(currentTime);
      automation.target.setValueAtTime(value, currentTime);
      automation.lastValue = value;
    },
    [],
  );

  // Clear all scheduled automation
  const clearAutomation = useCallback(() => {
    const currentTime = Tone.now();
    activeAutomations.current.forEach((automation) => {
      automation.target.cancelScheduledValues(currentTime);
    });
    activeAutomations.current.clear();
  }, []);

  // Get current automation value
  const getAutomationValue = useCallback(
    (automationId: string): number | null => {
      const automation = activeAutomations.current.get(automationId);
      return automation ? automation.lastValue : null;
    },
    [],
  );

  return {
    scheduleAutomation,
    updateAutomationValue,
    clearAutomation,
    getAutomationValue,
  };
};
