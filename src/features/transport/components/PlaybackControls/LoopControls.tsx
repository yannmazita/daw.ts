// src/features/transport/components/PlaybackControls/LoopControls.tsx
import { useCallback, useEffect, useState } from "react";
import { Repeat } from "lucide-react";
import { useEngineStore } from "@/core/stores/useEngineStore";
import { useTransportEngine } from "@/core/engines/EngineManager";
import { Input } from "@/common/shadcn/ui/input";
import { Switch } from "@/common/shadcn/ui/switch";
import { Label } from "@/common/shadcn/ui/label";
import {
  formatTime,
  parseTime,
  isValidTimeString,
} from "../../utils/timeUtils";
import { Time } from "tone/build/esm/core/type/Units";

interface TimeInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  placeholder: string;
  label: string;
  error?: boolean;
  disabled?: boolean;
}

const TimeInput: React.FC<TimeInputProps> = ({
  value,
  onChange,
  onBlur,
  placeholder,
  label,
  error,
  disabled,
}) => (
  <Input
    value={value}
    onChange={(e) => onChange(e.target.value)}
    onBlur={onBlur}
    className={`input-no-wheel h-5 w-16 rounded-none py-1 text-center ${error ? "border-red-500" : ""}`}
    placeholder={placeholder}
    aria-label={label}
    title={label}
    disabled={disabled}
  />
);

export const LoopControls: React.FC = () => {
  const transport = useEngineStore((state) => state.transport);
  const transportEngine = useTransportEngine();

  const [isUpdating, setIsUpdating] = useState(false);
  const [localStart, setLocalStart] = useState(() =>
    formatTime(transport.loop.start),
  );
  const [localEnd, setLocalEnd] = useState(() =>
    formatTime(transport.loop.end),
  );
  const [errors, setErrors] = useState({
    start: false,
    end: false,
  });

  // Update local state when transport state changes
  useEffect(() => {
    if (!isUpdating) {
      setLocalStart(formatTime(transport.loop.start));
      setLocalEnd(formatTime(transport.loop.end));
    }
  }, [transport.loop.start, transport.loop.end, isUpdating]);

  const updateLoop = useCallback(
    (start: Time, end: Time) => {
      try {
        setIsUpdating(true);
        transportEngine.setLoopPoints(start, end);
        setErrors({ start: false, end: false });
      } catch (error) {
        console.error("Failed to update loop points:", error);
      } finally {
        setIsUpdating(false);
      }
    },
    [transportEngine],
  );

  const validateAndUpdateLoop = useCallback(() => {
    const startTime = parseTime(localStart);
    const endTime = parseTime(localEnd);

    const newErrors = {
      start: !isValidTimeString(localStart) || startTime === null,
      end: !isValidTimeString(localEnd) || endTime === null,
    };

    setErrors(newErrors);

    if (
      startTime !== null &&
      endTime !== null &&
      startTime < endTime &&
      !newErrors.start &&
      !newErrors.end
    ) {
      updateLoop(startTime, endTime);
    }
  }, [localStart, localEnd, updateLoop]);

  const handleLoopToggle = useCallback(
    (enabled: boolean) => {
      try {
        setIsUpdating(true);
        transportEngine.setLoop(enabled);
      } catch (error) {
        console.error("Failed to toggle loop:", error);
      } finally {
        setIsUpdating(false);
      }
    },
    [transportEngine],
  );

  return (
    <div
      className="flex items-center space-x-4"
      role="group"
      aria-label="Loop controls"
    >
      {transport.loop.enabled && (
        <div className="flex items-center space-x-2">
          <TimeInput
            value={localStart}
            onChange={setLocalStart}
            onBlur={validateAndUpdateLoop}
            placeholder="0:0:0"
            label="Loop start time"
            error={errors.start}
            disabled={isUpdating}
          />
          <span className="text-muted-foreground dark:text-muted-foreground">
            to
          </span>
          <TimeInput
            value={localEnd}
            onChange={setLocalEnd}
            onBlur={validateAndUpdateLoop}
            placeholder="4:0:0"
            label="Loop end time"
            error={errors.end}
            disabled={isUpdating}
          />
        </div>
      )}
      <div className="flex items-center space-x-2">
        <Switch
          checked={transport.loop.enabled}
          onCheckedChange={handleLoopToggle}
          id="loop-toggle"
          aria-label="Toggle loop mode"
          disabled={isUpdating}
        />
        <Label
          htmlFor="loop-toggle"
          className={`flex cursor-pointer items-center ${
            isUpdating ? "opacity-50" : ""
          }`}
        >
          <Repeat className="mr-1 h-4 w-4" aria-hidden="true" />
          Loop
        </Label>
      </div>
    </div>
  );
};
