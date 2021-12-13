import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import PWL from './lib/pwl';
import Utils from "./lib/utils";

class ChatViewProvider implements vscode.WebviewViewProvider {

	public static readonly viewType = 'pwl-chat.chatView';

	private _view?: vscode.WebviewView;

	constructor(
		private readonly _extensionUri: vscode.Uri,
		private _pwl: PWL
	) { }

	public resolveWebviewView(
		webviewView: vscode.WebviewView,
		context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken,
	) {
		this._view = webviewView;

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
				case 'websocketInit':
					pwl.websocketInit((ev:MessageEvent) => {
						this._view?.webview.postMessage({ type: 'websocket', data: ev.data});
					});
					return;
				case 'showbox':
					Utils.showMessage(req.data);
					return;
			}
			if (!pwl || !pwl[req.type]) { return; }
			req.rsp = await pwl[req.type](req.data);
			req.type = 'response';
			this._view?.webview.postMessage(req);
		});
	}

	private getHtml(webview: vscode.Webview) {
		let exists = false;//fs.existsSync(path.resolve(__dirname, '..', 'dev'));
		let mainHtml = exists ? 
			path.resolve(__dirname, '..', 'dev', 'index.html') : 
			path.resolve(__dirname, 'webview', 'index.html');
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

export default ChatViewProvider;
