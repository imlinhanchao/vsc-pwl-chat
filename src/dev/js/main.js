let main = document.getElementById('main').contentWindow;
const vscode = acquireVsCodeApi();

window.addEventListener('message', event => {
    const message = event.data; // The json data that the extension sent
    switch (message.type) {
        case 'forward':
            {
                message.type = message.realType;
                vscode.postMessage(message);
                break;
            }
        case 'response':
            {
                main.postMessage(message, '*');
                break;
            }

    }
});