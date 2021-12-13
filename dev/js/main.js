let main = document.getElementById('main').contentWindow;
const vscode = acquireVsCodeApi();

document.getElementById('main').onload = () => {
    main.postMessage({ type: 'style', data: document.getElementsByTagName('html')[0].getAttribute('style')}, '*');
};

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