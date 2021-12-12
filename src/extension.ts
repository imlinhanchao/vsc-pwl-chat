import * as vscode from 'vscode';
import Command from './command';

export function activate(context: vscode.ExtensionContext) {
	let commands = Command.commands;
	let command = new Command(context);
	commands.forEach( c => context.subscriptions.push(vscode.commands.registerCommand(`pwl-chat.${c}`, (command as any)[c])));

}

export function deactivate() {}
