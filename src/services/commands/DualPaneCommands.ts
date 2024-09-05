import { useWindowsStore } from "@/stores/useWindowsStore";
import { Command } from "@/utils/interfaces";

export class SequencerTrackSettings implements Command {
    private windowsStore = useWindowsStore();

    constructor() { }

    execute(): void {
    }

    undo(): void { }

    redo(): void { }
}

