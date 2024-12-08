// src/common/components/PlaybackControls/TimeSignatureControl.tsx

import { Select } from "@/common/shadcn/ui/select";
import { Label } from "@/common/shadcn/ui/label";
import { useStore } from "@/common/slices/useStore";

export function TimeSignatureControl() {
  const { timeSignature, setTimeSignature } = useStore();
  const [numerator, denominator] = timeSignature;

  const numerators = [2, 3, 4, 5, 6, 7, 8, 9, 12];
  const denominators = [2, 4, 8, 16];

  return (
    <div className="flex items-center space-x-2">
      <Label className="text-sm text-slate-600 dark:text-slate-400">Time</Label>
      <div className="flex items-center">
        <Select
          value={numerator.toString()}
          onValueChange={(value) =>
            setTimeSignature(parseInt(value), denominator)
          }
        >
          {numerators.map((n) => (
            <option key={n} value={n.toString()}>
              {n}
            </option>
          ))}
        </Select>
        <span className="mx-1 text-slate-600 dark:text-slate-400">/</span>
        <Select
          value={denominator.toString()}
          onValueChange={(value) =>
            setTimeSignature(numerator, parseInt(value))
          }
        >
          {denominators.map((d) => (
            <option key={d} value={d.toString()}>
              {d}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}
