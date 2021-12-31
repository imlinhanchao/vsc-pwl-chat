module.exports = {
    pages: {
        index: {
            entry: 'views/main.js',
            template: 'views/index.html',
        },
        redpacket: {
            entry: 'views/redpacket.js',
            template: 'views/index.html',
        }
    },
    publicPath: './',
    outputDir: 'out/webview',
    lintOnSave: false
};