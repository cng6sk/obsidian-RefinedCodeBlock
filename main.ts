'use strict';
import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';


var editor;

var select2LineHome = "";
var bracketsIndex = "";
var preCursorLine = "";
var entireDoc;
var currentCursorLoc;
var oneWordBeforeCursorLoc;
var oneWordAfterCursorLoc ;
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
		select2LineHome = editor.getRange({line:currentLineNoLoc, ch: 0}, currentCursorLoc);
		preCursorLine = editor.getLine(currentLineNoLoc - 1);
		oneWordBeforeCursorLoc = editor.getRange({line: currentLineNoLoc, ch: select2LineHome.length - 1}, currentCursorLoc);
		oneWordAfterCursorLoc  = editor.getRange(currentCursorLoc, {line: currentLineNoLoc, ch: select2LineHome.length + 1});
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

	inBrackets(): number {
		console.log("inBracketsjudge");
		console.log(preCursorLine);
		console.log(oneWordAfterCursorLoc);
		var preflag: number = 0;
		var bckflag: number = 0;
		if (preCursorLine.match(/\($/)) {
			preflag = 1;
		}
		else if (preCursorLine.match(/\[$/)) {
			preflag = 2;
		}
		else if (preCursorLine.match(/\{$/)) {
			preflag = 3;
		}

		if (oneWordAfterCursorLoc .match(/\)/)) {
			bckflag = 1;
		}
		else if (oneWordAfterCursorLoc .match(/\]/)) {
			bckflag = 2;
		}
		else if (oneWordAfterCursorLoc .match(/\}/)) {
			bckflag = 3;
		}
		if (preflag && preflag == bckflag) {
			console.log("inBrackets");
			return preflag;
		}

		return 0;
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
			else if (e.key == "Enter") {
				var typeCheck = this.inBrackets();
				var pre = "";
				var bck = "";
				if (this.inCodeBlock() && typeCheck) {
					switch (typeCheck) {
						case 1:
							pre = "(";
							bck = ")";
							break;
						case 2:
							pre = "[";
							bck = "]";
							break;
						case 3:
							pre = "{";
							bck = "}";
							break;
						default:
							break;
					}
					// console.log(select2LineHome);
					select2LineHome = select2LineHome.replace(/[^    |\t]/, "");
					// console.log(select2LineHome);
					bracketsIndex = pre + '\n' + select2LineHome + "    \n" + select2LineHome + bck;
					// console.log(bracketsIndex);
					entireDoc.replaceRange(bracketsIndex, 
										  	{line: currentLineNoLoc - 1, ch: preCursorLine.length - 1}, 
											{
												line: currentLineNoLoc, ch: select2LineHome.length + 1
											});
					entireDoc.setCursor(currentLineNoLoc, select2LineHome.length + 4);
				}
			}
        });
	}


	onunload() {
		console.log('unloading obsidian-refinedCodeBlock');
	}




}



