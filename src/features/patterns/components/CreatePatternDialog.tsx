// src/features/patterns/components/CreatePatternDialog.tsx
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/common/shadcn/ui/dialog";
import { Button } from "@/common/shadcn/ui/button";
import { Input } from "@/common/shadcn/ui/input";
import { Label } from "@/common/shadcn/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/shadcn/ui/select";
import { Plus } from "lucide-react";

interface CreatePatternDialogProps {
  onCreatePattern: (name: string, timeSignature: [number, number]) => void;
}

export const CreatePatternDialog: React.FC<CreatePatternDialogProps> = ({
  onCreatePattern,
}) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [timeSignature, setTimeSignature] = useState<[number, number]>([4, 4]);

  const handleSubmit = () => {
    if (name.trim()) {
      onCreatePattern(name.trim(), timeSignature);
      setName("");
      setTimeSignature([4, 4]);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          New Pattern
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Pattern</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Pattern name"
            />
          </div>
          <div className="grid gap-2">
            <Label>Time Signature</Label>
            <div className="flex gap-2">
              <Select
                value={timeSignature[0].toString()}
                onValueChange={(value) =>
                  setTimeSignature([parseInt(value), timeSignature[1]])
                }
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2, 3, 4, 5, 6, 7, 8, 9, 12].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={timeSignature[1].toString()}
                onValueChange={(value) =>
                  setTimeSignature([timeSignature[0], parseInt(value)])
                }
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2, 4, 8, 16].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <Button onClick={handleSubmit}>Create Pattern</Button>
      </DialogContent>
    </Dialog>
  );
};
