// src/common/components/PlaybackControls/TimeSignatureControl.tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/shadcn/ui/select";
import { Label } from "@/common/shadcn/ui/label";
import { useTransportEngine } from "@/core/engines/EngineManager";
import { useEngineStore } from "@/core/stores/useEngineStore";
import { useState } from "react";

export const TimeSignatureControl: React.FC = () => {
  const transportEngine = useTransportEngine();
  const { timeSignature } = useEngineStore((state) => state.transport);

  const [localNumerator, setLocalNumerator] = useState<number>(timeSignature[0]);
  const [localDenominator, setLocalDenominator] = useState<number>(timeSignature[1]);

  const numerators = [2, 3, 4, 5, 6, 7, 8, 9, 12];
  const denominators = [2, 4, 8, 16];

  const handleNumeratorChange = (value: string) => {
    const num = parseInt(value);
    setLocalNumerator(num);
    transportEngine.setTimeSignature(num, localDenominator);
  };

  const handleDenominatorChange = (value: string) => {
    const denom = parseInt(value);
    setLocalDenominator(denom);
    transportEngine.setTimeSignature(localNumerator, denom);
  };

  return (
    <div className="flex items-center space-x-2">
      <Label htmlFor="time-signature" className="text-sm text-muted-foreground">
        Time Signature
      </Label>
      <div className="flex items-center space-x-1">
        <Select
          value={localNumerator.toString()}
          onValueChange={handleNumeratorChange}
        >
          <SelectTrigger className="w-[60px]" aria-label="Numerator">
            <SelectValue placeholder={localNumerator.toString()} />
          </SelectTrigger>
          <SelectContent>
            {numerators.map((n) => (
              <SelectItem key={n} value={n.toString()}>
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="mx-1 text-muted-foreground">/</span>
        <Select
          value={localDenominator.toString()}
          onValueChange={handleDenominatorChange}
        >
          <SelectTrigger className="w-[60px]" aria-label="Denominator">
            <SelectValue placeholder={localDenominator.toString()} />
          </SelectTrigger>
          <SelectContent>
            {denominators.map((d) => (
              <SelectItem key={d} value={d.toString()}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
