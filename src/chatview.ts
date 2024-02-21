import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import Command from './command';
import PWL from './lib/pwl';
import Utils from "./lib/utils";

class ChatViewProvider implements vscode.WebviewViewProvider {

	public static readonly viewType = 'pwl-chat.chatView';

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
				case 'websocketInit':
					pwl.websocketInit((ev:MessageEvent) => {
						this._view?.webview.postMessage({ type: 'websocket', data: ev.data});
					});
					this._command.liveness(this._command.account);
					return;
				case 'showbox':
					Utils.showMessage(req.data);
					return;
				case 'playMusic':
					req.rsp = await Utils.playMusic(req.data.url, req.data.loop, req.data.autoplay);
					req.type = 'response';
					this._view?.webview.postMessage(req);	
					return;		
				case 'fetchBuffer':
					req.rsp = await Utils.fetchBuffer(req.data);
					req.type = 'response';
					this._view?.webview.postMessage(req);	
					return;		
				case 'confirm':
					req.rsp = await Utils.confirm(req.data.msg, req.data.options);
					req.type = 'response';
					this._view?.webview.postMessage(req);			
					return;
				case 'command':
					if ((this._command as any)[req.data.cmd]) {
						req.rsp = await (this._command as any)[req.data.cmd](req.data.data);
						req.type = 'response';
						this._view?.webview.postMessage(req);			
					}
        case 'barrager':
          {
            const pay = await this._pwl.barragePay();
            const barrager = await Utils.prompt(`发送弹幕每次将花费 ${pay.cost} ${pay.unit}；最大长度32字符。`);
            if (barrager) {
              const rsp = await this._pwl.barrage(barrager);
              if (rsp.code !== 0) { Utils.showMessage({ type: 'warning', msg: rsp.msg }); }
            }
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
