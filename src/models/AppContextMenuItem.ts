import { Command } from "@/utils/interfaces";

export class AppContextMenuItem {
    public label: string;
    public icon: string;
    private command: Command;

    constructor(label: string, icon: string, command: Command) {
        this.label = label;
        this.icon = icon;
        this.command = command;
    }

    public performAction(): void {
        this.command.execute();
    }
}
