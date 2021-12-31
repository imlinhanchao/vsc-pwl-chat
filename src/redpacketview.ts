import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import Command from './command';
import PWL from './lib/pwl';
import Utils from "./lib/utils";

class RedpacketViewProvider implements vscode.WebviewViewProvider {

	public static readonly viewType = 'pwl-chat.redpacketView';

	private _view?: vscode.WebviewView;

	constructor(
		private readonly _extensionUri: vscode.Uri,
		private _pwl: PWL,
		private _command: Command
	) { 

	}

	public resolveWebviewView(
		webviewView: vscode.WebviewView,
		context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken,
	) {
		this._view = webviewView;
		this._command.appendWebview(this._view?.webview);

		webviewView.webview.options = {
			enableScripts: true,
			
			localResourceRoots: [
				this._extensionUri
			]
		};

		webviewView.webview.html = this.getHtml(webviewView.webview);

		webviewView.webview.onDidReceiveMessage(async req => {
			let pwl:any = this._pwl;
			switch (req.type)
			{
				case 'showbox':
					Utils.showMessage(req.data);
					return;
				case 'command':
					if ((this._command as any)[req.data.cmd]) {
						req.rsp = await (this._command as any)[req.data.cmd](req.data.data);
						req.type = 'response';
						this._view?.webview.postMessage(req);			
					}
			}
			if (!pwl || !pwl[req.type]) { return; }
			req.rsp = await pwl[req.type](req.data);
			req.type = 'response';
			this._view?.webview.postMessage(req);
		});
	}

	changeConfig() {
		this._view?.webview.postMessage({
			type: 'config',
			data: Utils.getConfig()
		});
	}

	private getHtml(webview: vscode.Webview) {
		let exists = fs.existsSync(path.resolve(__dirname, '..', 'dev'));
		let mainHtml = exists ? 
			path.resolve(__dirname, '..', 'dev', 'redpacket.html') : 
			path.resolve(__dirname, 'webview', 'redpacket.html');
		let baseUrl = exists ?
			vscode.Uri.joinPath(this._extensionUri, 'dev', '/') :
			vscode.Uri.joinPath(this._extensionUri, 'out', 'webview', '/');

		return fs.readFileSync(mainHtml).toString().replace(/<base href="[^"]*">/, 
			`<base href="${webview.asWebviewUri(baseUrl)}">`)
			.replace(/<(script|link) /g, '<$1 nonce="vuescript" ')
			.replace(/<head>/, `<head>
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; 
				img-src *; font-src http://* https://*; style-src http://* https://* 'unsafe-inline'; frame-src *;script-src 'nonce-vuescript';">`);
	}
}

export default RedpacketViewProvider;
