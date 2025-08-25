import { Plugin, moment } from 'obsidian';
import { QuickInputSettingTab } from 'view/quick_input_setting_tab';

interface QuickInputPluginSettings {
	defaultAuthor: string;
}

const DEFAULT_SETTINGS: Partial<QuickInputPluginSettings> = {
	defaultAuthor: ""
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
				const toInsert = [
					"---",
					`created: ${moment().format("YYYY-MM-DD HH:mm")}`,
					"latitude: ",
					"longitude: ",
					"altitude: ",
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
				const toInsert = `\\[Time\\]${moment().format("HH:mm")}\n`;
				editorCallback.replaceRange(toInsert, cursorPosition);
				editorCallback.setCursor(cursorPosition.line + 1,0);
			}
		})
		this.addCommand({
			id: "insert-date-tag",
			name: "Insert Date Tag",
			editorCallback: (editorCallback) => {
				const cursorPosition = editorCallback.getCursor();
				const toInsert = `\\[Date\\]${moment().format("YYYY-MM-DD")}\n`;
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

