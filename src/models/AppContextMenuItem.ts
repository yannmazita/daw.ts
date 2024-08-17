import { Command } from "@/utils/interfaces"

export class AppContextMenuItem {
    public label: string;
    private command: Command;
    public icon: string | null;

    constructor(label: string, command: Command, icon: string | null = null) {
        this.label = label;
        this.command = command;
        this.icon = icon;
    }

    public performAction(): void {
        this.command.execute();
    }
}
