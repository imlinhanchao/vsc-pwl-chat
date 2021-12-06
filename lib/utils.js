const vscode = require('vscode');
const { spawn, exec } = require('child_process');

function showProgress(message) {
    let show = true;
    function stopProgress() {
        show = false;
    }

    vscode.window.withProgress({
        location: vscode.ProgressLocation.Window,
        title: message,
        cancellable: false
    }, (progress, token) => {
        return new Promise(resolve => {
            let timer = setInterval(() => {
                if (show) { return; }
                clearInterval(timer);
                resolve(show);
            }, 100);
        });
    });

    return stopProgress;
}

function getConfig() {
    let keys = Object.keys(pkg.contributes.configuration.properties);
    let values = {};
    function toVal(str, val, cfg) {
        let keys = str.split('.');
        if (keys.length === 1) { 
            cfg[keys[0]] = val; 
        } else {
            cfg[keys[0]] = toVal(keys.slice(1).join('.'), val, cfg[keys[0]] || {});
        }
        return cfg;
    }
    keys.forEach(k => toVal(k.split('.').slice(1).join('.'), vscode.workspace.getConfiguration().get(k), values));
    return values;
}

function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

function confirm(message, options) {
    return new Promise((resolve, reject) => {
        return vscode.window.showInformationMessage(message, ...options).then(resolve);
    });
}

function prompt(message, defaultVal = '') {
    return new Promise((resolve, reject) => {
        return vscode.window.showInputBox({
            value: defaultVal,
            prompt: message
        }).then(resolve);
    });
}

function getOpenCmd() {
    let cmd = 'start';
    if (process.platform === 'win32') {
        cmd = 'start';
    } else if (process.platform === 'linux') {
        cmd = 'xdg-open';
    } else if (process.platform === 'darwin') {
        cmd = 'open';
    }
    return cmd;
}

function noticeComment(context) {
    let notice = context.globalState.get('notice');
    let usetimes = context.globalState.get('usetimes') || 0;
    if (!notice && usetimes > 100) {
        confirm('喜欢这个扩展吗？给我一个好评吧！', ['好啊', '不要', '等等再说'])
            .then((option) => {
                switch(option) {
                    case '好啊':
                        exec(`${getOpenCmd()} https://marketplace.visualstudio.com/items?itemName=hancel.markdown-image`);
                        context.globalState.update('notice', true);
                        break;
                    case '不要':
                        context.globalState.update('notice', true);
                        break;
                    case '等等再说':
                        usetimes = 50;
                        context.globalState.update('usetimes', usetimes);
                        context.globalState.update('notice', false);
                        break;
                }
            })
            .catch(e => console.debug(e));
    } else if(!notice) {
        context.globalState.update('usetimes', ++usetimes);
    }
}

module.exports = {
    getConfig, sleep, confirm, prompt, noticeComment
}