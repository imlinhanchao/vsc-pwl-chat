import Vue from 'vue';
import App from './Redpacket.vue';
import './theme/index.css';
import './theme/vscode.css';
import './theme/font-awesome.min.css';
const vscode = window.acquireVsCodeApi ? acquireVsCodeApi() : window.parent;

Vue.config.productionTip = false;

new Vue({
  render: h => h(App),
  data: {
    callback: {},
    isdev: !window.acquireVsCodeApi,
    config: {}
  },
  mounted() {
    window.addEventListener('message', event => {
      const message = event.data;
      switch (message.type) {
        case 'response': {
          // 接收扩展后端 response 的数据
          this.callback[message.key](message.rsp);
          break;
        }
        case 'style': {
          // 接受 iframe 父窗体转发的 VSCode html 注入的 style
          document.querySelector('html').setAttribute('style', message.data);
          break;
        }
      }
    });
    this.request('command', {
      cmd: 'getConfig'
    }).then((config)=> {
      this.config = config;
    });
  },
  methods: {
    // 给扩展后端发送消息
    request(method, data) {
      return new Promise((resolve) => {
        let message = { data };
        message.realType = message.type = method;
        // 开发模式需要经过 iframe 父窗体转发
        if (this.isdev) { message.type = 'forward'; }
        message.key = message.type + parseInt(Math.random() * 10000).toString();
        this.callback[message.key] = (rsp) => {
          resolve(rsp);
        };
        vscode.postMessage(message, '*');
      });
    },
    msg(type, msg) {
      this.request('showbox', { type, msg });
    }
  }
}).$mount('#app');