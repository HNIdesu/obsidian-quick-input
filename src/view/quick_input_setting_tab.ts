import QuickInputPlugin, { DEFAULT_SETTINGS } from "main";
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
                .setPlaceholder(DEFAULT_SETTINGS.defaultAuthor!)
                .setValue(this.plugin.settings.defaultAuthor)
                .onChange(async (value) => {
                    this.plugin.settings.defaultAuthor = value;
                    await this.plugin.saveSettings();
                })
            );
            new Setting(containerEl)
                .setName('Date Format')
                .addText((text) =>
                    text
                    .setPlaceholder(DEFAULT_SETTINGS.dateFormat!)
                    .setValue(this.plugin.settings.dateFormat)
                    .onChange(async (value) => {
                        this.plugin.settings.dateFormat = value;
                        await this.plugin.saveSettings();
                    })
                );
            new Setting(containerEl)
                .setName('Time Format')
                .addText((text) =>
                    text
                    .setPlaceholder(DEFAULT_SETTINGS.timeFormat!)
                    .setValue(this.plugin.settings.timeFormat)
                    .onChange(async (value) => {
                        this.plugin.settings.timeFormat = value;
                        await this.plugin.saveSettings();
                    })
                );
            new Setting(containerEl)
                .setName('Host Name')
                .addText((text) =>
                    text
                    .setPlaceholder(DEFAULT_SETTINGS.hostName!)
                    .setValue(this.plugin.settings.hostName)
                    .onChange(async (value) => {
                        this.plugin.settings.hostName = value;
                        await this.plugin.saveSettings();
                    })
                );
            new Setting(containerEl)
                .setName('Port Number')
                .addText((text) =>
                    text
                    .setPlaceholder(DEFAULT_SETTINGS.port!.toString())
                    .setValue(this.plugin.settings.port.toString())
                    .onChange(async (value) => {
                        this.plugin.settings.port = parseInt(value);
                        await this.plugin.saveSettings();
                    })
                );
    }
}