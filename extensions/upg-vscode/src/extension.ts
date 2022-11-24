// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

function commandTranslate() {
	const editor = vscode.window.activeTextEditor;
    if (!editor) {
    	return;
    }
  	const selection = editor.selection;
	const text = editor.document.getText(selection);
	const terminal = vscode.window.createTerminal('upg translate');
	terminal.sendText(`npx upg load ${editor.document.fileName}`);
	terminal.show();
	vscode.window.showInformationMessage('Translate');
}

function commandExplain() {
	const editor = vscode.window.activeTextEditor;
	
    if (!editor) {
    	return;
    }
	const terminal = vscode.window.createTerminal('upg translate');
	terminal.show();
	terminal.sendText('npx upg explain');
	vscode.commands.executeCommand("workbench.action.terminal.sendSequence", "\\x04");
	terminal.sendText(`${editor.document.getText()}`);
	vscode.commands.executeCommand("workbench.action.terminal.sendSequence", "\\x04");
	terminal.sendText(`javascript`);
	vscode.commands.executeCommand("workbench.action.terminal.sendSequence", "\\x04");
	terminal.show();
	vscode.window.showInformationMessage('Explain');
}

function commandNewProgram() {
	vscode.window.showInformationMessage('New Program');
}

function commandEditProgram() {
	vscode.window.showInformationMessage('Edit Program');
}

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerCommand('upg-vscode.editProgram', commandEditProgram));
	context.subscriptions.push(vscode.commands.registerCommand('upg-vscode.explain', commandExplain));
	context.subscriptions.push(vscode.commands.registerCommand('upg-vscode.newProgram', commandNewProgram));
	context.subscriptions.push(vscode.commands.registerCommand('upg-vscode.translate', commandTranslate));
}

export function deactivate() {}
