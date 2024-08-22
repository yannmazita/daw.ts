import { Command } from "@/utils/interfaces"

export class AppDialogWindowItem {
    constructor(public label: string, private command: Command, public icon: string | null = null) {
        this.label = label;
        this.command = command;
        this.icon = icon;
    }
    public performAction(): void {
        this.command.execute();
    }
}
