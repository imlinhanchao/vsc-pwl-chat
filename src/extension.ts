import * as vscode from 'vscode';
import Command from './command';
import ChatViewProvider from './webview';

export function activate(context: vscode.ExtensionContext) {
	let commands = Command.commands;
	let command = new Command(context);
	command.init();
	commands.forEach( c => context.subscriptions.push(vscode.commands.registerCommand(`pwl-chat.${c}`, () => (command as any)[c](...arguments))));

	const provider = new ChatViewProvider(context.extensionUri, command.pwl, command);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(ChatViewProvider.viewType, provider));

}

export function deactivate() {}
