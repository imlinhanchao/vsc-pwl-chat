import * as vscode from 'vscode';
import Command from './command';
import ChatViewProvider from './chatview';
import RedpacketViewProvider from './redpacketview';

export function activate(context: vscode.ExtensionContext) {
	let commands = Command.commands;
	let command = new Command(context);
	command.init();
	commands.forEach( c => context.subscriptions.push(vscode.commands.registerCommand(`pwl-chat.${c}`, () => (command as any)[c](...arguments))));

	const chatProvider = new ChatViewProvider(context.extensionUri, command.pwl, command);
	const redpacketProvider = new RedpacketViewProvider(context.extensionUri, command.pwl, command);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(ChatViewProvider.viewType, chatProvider));

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(RedpacketViewProvider.viewType, redpacketProvider));

	vscode.workspace.onDidChangeConfiguration((event) => {
		chatProvider.changeConfig();
		redpacketProvider.changeConfig();
	});
	
}

export function deactivate() {}
