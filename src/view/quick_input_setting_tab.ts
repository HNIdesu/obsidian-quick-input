import QuickInputPlugin from "main";
import { App, PluginSettingTab, Setting } from "obsidian";

export class QuickInputSettingTab extends PluginSettingTab {
    constructor(app: App, plugin: QuickInputPlugin) {
        super(app, plugin)
        this.plugin = plugin
    }
    private plugin: QuickInputPlugin
    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        new Setting(containerEl)
            .setName('Default Author')
            .addText((text) =>
                text
                .setPlaceholder("")
                .setValue(this.plugin.settings.defaultAuthor)
                .onChange(async (value) => {
                    this.plugin.settings.defaultAuthor = value;
                    await this.plugin.saveSettings();
                })
            );
    }
}