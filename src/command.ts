import Utils from './lib/utils';
import PWL from './lib/pwl';
import * as vscode from 'vscode';

class Command
{
    token: string = '';
    pwl: PWL;
    context: vscode.ExtensionContext;
    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.pwl = new PWL(this.context.globalState.get('token') || '');
    }

    static get commands() {
        return [
            'login'
        ];
    }

    async login() {
        try {
            let username = await Utils.prompt('用户名') || '';
            if (username === '') { return; }
            let passwd = await Utils.prompt('密码') || '';
            if (passwd === '') { return; }

            let data = (await this.pwl.login({ username, passwd }));
            if (data.code !== 0) {
                throw new Error(data.msg);
            }

            this.token = data.Key;
            this.context.globalState.update('token', this.token);
        } catch (e) {
            vscode.window.showErrorMessage(`登录失败：${(e as Error).message}`);
        }
    }
}

export default Command;