// src/common/components/PlaybackControls/TimeSignatureControl.tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/shadcn/ui/select";
import { Label } from "@/common/shadcn/ui/label";
import { useStore } from "@/common/slices/useStore";

export function TimeSignatureControl() {
  const { timeSignature, setTimeSignature } = useStore();
  const [numerator, denominator] = timeSignature;

  const numerators = [2, 3, 4, 5, 6, 7, 8, 9, 12];
  const denominators = [2, 4, 8, 16];

  return (
    <div className="flex items-center space-x-2">
      <Label className="text-sm text-muted-foreground dark:text-muted-foreground">
        Time Signature
      </Label>
      <div className="flex items-center space-x-1">
        <Select
          value={numerator.toString()}
          onValueChange={(value) =>
            setTimeSignature(parseInt(value), denominator)
          }
        >
          <SelectTrigger className="w-[60px]">
            <SelectValue placeholder={numerator.toString()} />
          </SelectTrigger>
          <SelectContent>
            {numerators.map((n) => (
              <SelectItem key={n} value={n.toString()}>
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="mx-1 text-muted-foreground dark:text-muted-foreground">
          /
        </span>

        <Select
          value={denominator.toString()}
          onValueChange={(value) =>
            setTimeSignature(numerator, parseInt(value))
          }
        >
          <SelectTrigger className="w-[60px]">
            <SelectValue placeholder={denominator.toString()} />
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
}
