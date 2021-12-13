import Utils from './lib/utils';
import PWL from './lib/pwl';
import * as vscode from 'vscode';

class Command
{
    info: any;
    token: string = '';
    pwl: PWL;
    webview: vscode.Webview | undefined;
    context: vscode.ExtensionContext;
    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.pwl = new PWL(this.context.globalState.get('token') || '');
    }

    static get commands() {
        return [
            'login',
            'logout'
        ];
    }

    setWebview(webview:vscode.Webview) {
        this.webview = webview;
    }

    async logout() {
        this.context.globalState.update('token', '');
        this.context.globalState.update('username', '');
        this.context.globalState.update('passwd', '');
        this.pwl.token = '';
        this.webview?.postMessage({ type: 'notice', cmd: 'logout'});			
    }

    async login() {
        try {
            let username = await Utils.prompt('用户名', this.context.globalState.get('username') || '') || '';
            if (username === '') { return; }
            let passwd = await Utils.prompt('密码', this.context.globalState.get('password') || '', true) || '';
            if (passwd === '') { return; }

            let data = (await this.pwl.login({ username, passwd }));
            if (data.code !== 0) {
                throw new Error(data.msg);
            }
            
            this.context.globalState.update('username', username);
            this.context.globalState.update('passwd', passwd);

            this.token = data.Key;
            this.context.globalState.update('token', this.token);
            this.info = await this.pwl.info();
            this.webview?.postMessage({ type: 'notice', cmd: 'login', data: this.info.data });			

            return this.info;
        } catch (e) {
            vscode.window.showErrorMessage(`登录失败：${(e as Error).message}`);
        }
    }
}

export default Command;