import { Notice, Plugin, moment } from 'obsidian';
import { QuickInputSettingTab } from 'view/quick_input_setting_tab';

interface QuickInputPluginSettings {
	defaultAuthor: string;
	dateFormat: string;
	timeFormat: string,
	hostName: string,
	port: number
}

export const DEFAULT_SETTINGS: Partial<QuickInputPluginSettings> = {
	defaultAuthor: "",
	dateFormat: "YYYY-MM-DD",
	timeFormat: "HH:mm",
	hostName: "127.0.0.1",
	port: 3323
};

export default class QuickInputPlugin extends Plugin {
	settings: QuickInputPluginSettings;
	async onload() {
		await this.loadSettings();
		this.addSettingTab(new QuickInputSettingTab(this.app, this));
		this.addCommand({
			id: "insert-yaml-header",
			name: "Insert Yaml Header",
			editorCallback: async (editorCallback) => {
				const cursorPosition = editorCallback.getCursor();
				let latitude = ""
				let longitude = ""
				let altitude = ""
				try{
					const response = await fetch(`http://${this.settings.hostName}:${this.settings.port}/`)
					if (response.ok) {
						const json = await response.json()
						latitude = json.latitude
						longitude = json.longitude
						altitude = json.altitude
					}
				}catch (ex) {
					new Notice("Failed to get location")
				}
				const toInsert = [
					"---",
					`created: ${moment().format("YYYY-MM-DD HH:mm")}`,
					`latitude: ${latitude}`,
					`longitude: ${longitude}`,
					`altitude: ${altitude}`,
					`author: ${this.settings.defaultAuthor}`,
					"tags: [ ]",
					"---\n"];
				editorCallback.replaceRange(toInsert.join("\n"),cursorPosition);
				editorCallback.setCursor(cursorPosition.line + toInsert.length, 0);
			}
		})
		this.addCommand({
			id: "insert-time-tag",
			name: "Insert Time Tag",
			editorCallback: (editorCallback) => {
				const cursorPosition = editorCallback.getCursor();
				const toInsert = `\\[Time\\]${moment().format(this.settings.timeFormat)}\n`;
				editorCallback.replaceRange(toInsert, cursorPosition);
				editorCallback.setCursor(cursorPosition.line + 1,0);
			}
		})
		this.addCommand({
			id: "insert-date-tag",
			name: "Insert Date Tag",
			editorCallback: (editorCallback) => {
				const cursorPosition = editorCallback.getCursor();
				const toInsert = `\\[Date\\]${moment().format(this.settings.dateFormat)}\n`;
				editorCallback.replaceRange(toInsert, cursorPosition);
				editorCallback.setCursor(cursorPosition.line + 1,0);
			}
		})
		this.addCommand({
			id: "insert-where-tag",
			name: "Insert Where Tag",
			editorCallback: (editorCallback) => {
				const cursorPosition = editorCallback.getCursor();
				const toInsert = "\\[Where\\]";
				editorCallback.replaceRange(toInsert,cursorPosition);
				editorCallback.setCursor(cursorPosition.line,cursorPosition.ch + toInsert.length);
			}
		})
	}
	onunload() {
	}
	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}
	
	async saveSettings() {
		await this.saveData(this.settings);
	}
}

