import * as vscode from 'vscode';
import { spawn, exec } from 'child_process';
import { tmpdir } from 'os';
import * as fs from 'fs';
import * as path from 'path';
import * as packages from '../../package.json';
import * as crypto from 'crypto';

let pkg = packages as any;

function showProgress(message: string) {
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
    let keys: string[] = Object.keys(pkg.contributes.configuration.properties);
    let values: Config = {};
    function toVal(str: string, val: string|undefined, cfg: Config) : string | Config {
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

function getPasteImage(imagePath: string) : Promise<string[]>{
    return new Promise((resolve, reject) => {
        if (!imagePath) { return; }
    
        let platform = process.platform;
        if (platform === 'win32') {
            // Windows
            const scriptPath = path.join(__dirname, '..', '..' , 'asserts/pc.ps1');
    
            let command = "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe";
            let powershellExisted = fs.existsSync(command);
            let output = '';
            if (!powershellExisted) {
                command = "powershell";
            }
    
            const powershell = spawn(command, [
                '-noprofile',
                '-noninteractive',
                '-nologo',
                '-sta',
                '-executionpolicy', 'unrestricted',
                '-windowstyle', 'hidden',
                '-file', scriptPath,
                imagePath
            ]);
            // the powershell can't auto exit in windows 7 .
            let timer = setTimeout(() => powershell.kill(), 2000);

            powershell.on('error', (e: any) => {
                if (e.code === 'ENOENT') {
                    vscode.window.showErrorMessage('找不到 Powershell');
                } else {
                    vscode.window.showErrorMessage(e);
                }
            });

            powershell.on('exit', function (code, signal) {
                // console.debug('exit', code, signal);
            });
            powershell.stdout.on('data', (data) => {
                data.toString().split('\n').forEach((d: string | string[]) => output += (d.indexOf('Active code page:') < 0 ? d + '\n' : ''));
                clearTimeout(timer);
                timer = setTimeout(() => powershell.kill(), 2000);
            });
            powershell.on('close', (code) => {
                resolve(output.trim().split('\n').map(i => i.trim()));
            });
        }
        else if (platform === 'darwin') {
            // Mac
            let scriptPath = path.join(__dirname, '..', '..' , 'asserts/mac.applescript');
    
            let ascript = spawn('osascript', [scriptPath, imagePath]);
            ascript.on('error', (e: any) => {
                vscode.window.showErrorMessage(e);
            });
            ascript.on('exit', (code, signal) => {
                // console.debug('exit', code, signal);
            });
            ascript.stdout.on('data', (data) => {
                resolve(data.toString().trim().split('\n'));
            });
        } else {
            // Linux 
    
            let scriptPath = path.join(__dirname, '..', '..' , 'asserts/linux.sh');
    
            let ascript = spawn('sh', [scriptPath, imagePath]);
            ascript.on('error', (e: any) => {
                vscode.window.showErrorMessage(e);
            });
            ascript.on('exit', (code, signal) => {
                // console.debug('exit',code,signal);
            });
            ascript.stdout.on('data', (data) => {
                let result = data.toString().trim();
                if (result === "no xclip") {
                    vscode.window.showInformationMessage('请安装 xclip');
                    return;
                }
                let match = decodeURI(result).trim().match(/((\/[^\/]+)+\/[^\/]*?\.(jpg|jpeg|gif|bmp|png))/g);
                resolve(match || []);
            });
        }
    });
}

function getCurrentRoot() : string {
    const editor = vscode.window.activeTextEditor;
    if (!editor || !vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length < 1) { return ''; }
    const resource = editor.document.uri;
    if (resource.scheme === 'vscode-notebook-cell') {
        let filePath = resource.fsPath;
        let root = vscode.workspace.workspaceFolders.find(f => filePath.indexOf(f.uri.fsPath) >= 0);
        if (root) { return root.uri.fsPath; }
        else { return ''; }
    }
    if (resource.scheme !== 'file') { return ''; }
    const folder = vscode.workspace.getWorkspaceFolder(resource);
    if (!folder) { return ''; }
    return folder.uri.fsPath;
}

function getCurrentFilePath() : string {
    const editor = vscode.window.activeTextEditor;
    if (!editor || !vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length < 1) { return ''; }
    return editor.document.uri.fsPath;
}

function getTmpFolder() {
    let savePath = path.join(tmpdir(), pkg.name);
    if (!fs.existsSync(savePath)) { fs.mkdirSync(savePath); }
    return savePath;
}

function sleep (time: number) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

function confirm(message: string, options: string[]) : Promise<string|undefined> {
    return new Promise((resolve, reject) => {
        return vscode.window.showInformationMessage(message, ...options).then(resolve);
    });
}

function prompt(message: string, defaultVal: string = '', password: boolean = false) : Promise<string|undefined> {
    return new Promise((resolve, reject) => {
        return vscode.window.showInputBox({
            value: defaultVal,
            prompt: message,
            password
        }).then(resolve);
    });
}

function hash(buffer:Buffer): string {
    let sha256 = crypto.createHash('sha256');
    let hash = sha256.update(buffer).digest('hex');
    return hash;
}

function getOpenCmd(): string {
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

function noticeComment(context: vscode.ExtensionContext) {
    let notice = context.globalState.get('notice');
    let usetimes: number = context.globalState.get('usetimes') || 0;
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

function showMessage(data:any) {
    switch(data.type)
    {
        case 'error':
            vscode.window.showErrorMessage(data.message);
            break;
        case 'warning':
            vscode.window.showWarningMessage(data.message);
            break;
        case 'info':
            vscode.window.showInformationMessage(data.message);
            break;
    }
}

export default {
    showProgress,
    showMessage,
    getConfig,
    getPasteImage,
    getCurrentRoot,
    getCurrentFilePath,
    getTmpFolder,
    noticeComment,
    sleep,
    confirm,
    prompt,
    hash,
};