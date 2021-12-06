// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const Command = require('./command')

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	let commands = Command.commands;
	let command = new Command(context);
	commands.forEach( c => context.subscriptions.push(vscode.commands.registerCommand(`pwl-chat.${c}`, command[c])))
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
