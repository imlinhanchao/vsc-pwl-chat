let main = document.getElementById('main').contentWindow;
const vscode = acquireVsCodeApi();

document.getElementById('main').onload = () => {
    main.postMessage({ type: 'style', data: document.querySelector('html').getAttribute('style')}, '*');
};

window.addEventListener('message', event => {
    const message = event.data; // The json data that the extension sent
    switch (message.type) {
        case 'forward':
            {
                // 转发 iframe 的消息给扩展后端
                message.type = message.realType;
                vscode.postMessage(message);
                break;
            }
        default:
            {
                main.postMessage(message, '*');
                break;
            }
    }
});