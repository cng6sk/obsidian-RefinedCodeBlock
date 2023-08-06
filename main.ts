'use strict';
import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';


var editor;

var select2LineHome = "";
var entireDoc;
var currentCursorLoc;
var currentLineNoLoc;

export default class MyPlugin extends Plugin {
	getEditor() {
		let view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!view) { 
			return;
		};
        let cm = view.editor;
        return cm;
	}

	getEditorInfo = function() {
		
		editor = this.getEditor();
		if (editor == null) {
			return;
		}
		entireDoc = editor.getDoc();
		// console.log(entireDoc);
		currentCursorLoc = editor.getCursor();
		currentLineNoLoc = currentCursorLoc.line;
		select2LineHome = editor.getRange({line:currentLineNoLoc, ch:0}, currentCursorLoc);
		
	}

	inCodeBlock(): boolean {
		const codeBlockRegex = /```([^\n]*)\n([\s\S]*?)```/g;
		let match;
		var tmp = this.getFullText();
		while ((match = codeBlockRegex.exec(tmp)) !== null) {
			const codeBlockStartLine = (tmp.substring(0, match.index).match(/\n/g) || []).length + 1;
			const codeBlockEndLine = codeBlockStartLine + (match[0].match(/\n/g) || []).length;
			// console.log('codeBlockStartLine:' + codeBlockStartLine);
			// console.log(codeBlockStartLine);
			if (currentLineNoLoc >= codeBlockStartLine && currentLineNoLoc <= codeBlockEndLine) {
				return true;
			}
		}
		return false;
	}

	getFullText() {
		var editorTmp = this.getEditor();
		if (!editorTmp) {
			return;
		}
		if (editorTmp.getSelection() == "") {
			return editorTmp.getValue();
		}
		else {
			return;
		}
	}
	

	async onload() {
		console.log('loading obsidian-refinedCodeBlock')

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('Hello World!');
		});


		document.addEventListener('keydown',(e) =>{
			this.getEditorInfo();
			if (e.key == "Tab") {
				if (this.inCodeBlock()) {
					select2LineHome = select2LineHome.replace(/(    |\t)/,"");
					entireDoc.replaceRange(select2LineHome+"	", {line: currentLineNoLoc, ch: 0}, currentCursorLoc);
				}
				
			}
        });
	}

	onunload() {
		console.log('unloading obsidian-refinedCodeBlock');
	}




}



