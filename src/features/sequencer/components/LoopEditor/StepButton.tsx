// src/features/sequencer/components/LoopEditor/StepButton.tsx

import React, { useCallback } from "react";
import { usePatternStore } from "@/features/patterns/slices/usePatternStore";
import { useSequencerStore } from "../../slices/useSequencerStore";
import { DEFAULT_STEP, Step } from "@/core/interfaces/pattern";
import { PatternTrackType } from "@/core/enums/PatternTrackType";
import { useMixerStore } from "@/features/mixer/slices/useMixerStore";

interface StepButtonProps {
  trackId: string;
  patternId: string;
  stepIndex: number;
}

const StepButton: React.FC<StepButtonProps> = React.memo(
  ({ trackId, patternId, stepIndex }) => {
    const updatePatternData = usePatternStore(
      (state) => state.updatePatternData,
    );
    const currentStep = useSequencerStore(
      (state) => state.playback.currentStep,
    );

    const track = usePatternStore((state) =>
      state.patterns
        .find((p) => p.id === patternId)
        ?.tracks.find((t) => t.id === trackId),
    );

    if (!track || track.data.type !== PatternTrackType.STEP_SEQUENCE) {
      return null;
    }

    const stepData = track.data;
    const step = stepData.steps[stepIndex] ?? {
      ...DEFAULT_STEP,
      index: stepIndex,
      note: stepData.defaultNote,
      velocity: stepData.defaultVelocity,
    };

    const isWithinLoop = stepIndex < stepData.loopLength;
    const isLastLoopStep = stepIndex === stepData.loopLength - 1;

    const handleClick = useCallback(() => {
      if (!isWithinLoop) return;

      const newSteps = [...stepData.steps];
      if (!newSteps[stepIndex] || newSteps[stepIndex] === null) {
        // Create new step if it doesn't exist or is null
        newSteps[stepIndex] = {
          index: stepIndex,
          note: stepData.defaultNote,
          velocity: stepData.defaultVelocity,
          active: true,
          modulation: 0,
          pitchBend: 0,
          parameters: {},
        };
      } else {
        // Toggle existing step
        newSteps[stepIndex] = {
          ...newSteps[stepIndex],
          active: !newSteps[stepIndex].active,
        };
      }

      updatePatternData(patternId, trackId, {
        ...stepData,
        steps: newSteps,
      });
    }, [
      patternId,
      trackId,
      stepData,
      stepIndex,
      isWithinLoop,
      updatePatternData,
    ]);

    // Calculate button color based on velocity if step is active
    const getStepColor = (step: Step) => {
      if (!step.active) return "bg-gray-200";
      const intensity = Math.floor((step.velocity / 127) * 255);
      return `bg-ts-blue style="opacity: ${step.velocity / 127}"`;
    };

    return (
      <div
        onClick={handleClick}
        className={`
          size-7 m-0.5 border border-slate-400 rounded-xs
          ${isWithinLoop ? getStepColor(step) : "bg-slate-600"}
          ${isWithinLoop ? "cursor-pointer" : "cursor-not-allowed"}
          ${isLastLoopStep ? "border-r-4 border-slate-800" : ""}
          ${stepIndex === currentStep ? "ring-2 ring-slate-600" : ""}
        `}
        title={
          step.active
            ? `Note: ${step.note}, Velocity: ${step.velocity}`
            : "Inactive"
        }
      />
    );
  },
);

export default StepButton;
