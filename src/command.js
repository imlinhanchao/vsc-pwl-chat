const Utils = require('../lib/utils');
const PWL = require('../lib/pwl');
const vscode = require('vscode');
class Command
{
    constructor(context) {
        this.context = context;
        this.pwl = new PWL(this.context.globalState.get('token'));
    }

    static get commands() {
        return [
            'login'
        ]
    }

    async login() {
        try {
            let username = await Utils.prompt('用户名');
            let passwd = await Utils.prompt('密码');

            let data = (await this.pwl.login({ username, passwd }));
            if (data.code != 0) {
                throw new Error(data.msg);
            }

            this.token = data.Key;
            this.context.globalState.update('token', this.token);
        } catch (e) {
            vscode.window.showErrorMessage(`登录失败：${e.message}`);
        }
    }
}


module.exports = Command;