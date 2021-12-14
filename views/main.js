import Vue from 'vue';
import App from './App.vue';
import './theme/index.css';
import './theme/vscode.css';
import './theme/font-awesome.min.css';
const vscode = window.acquireVsCodeApi ? acquireVsCodeApi() : window.parent;

Vue.config.productionTip = false;

new Vue({
  render: h => h(App),
  data: {
    wsCallback: [],
    callback: {},
    isdev: !window.acquireVsCodeApi
  },
  mounted() {
    window.addEventListener('message', event => {
      const message = event.data;
      console.log(message.type);
      switch (message.type) {
        case 'response': {
          this.callback[message.key](message.rsp);
          break;
        }
        case 'style': {
          document.getElementsByTagName('html')[0].setAttribute('style', message.data);
          break;
        }
      }
    });
    document.addEventListener('click', (ev) => {
      let link = ev.target;
      if (link.nodeName.toLowerCase() !== 'a' || link.dataset.action !== 'open-link') return;
      let url = link.href;
      let mat = url.match(/goto=(.*?)$/);
      if (mat) url = decodeURIComponent(mat[1]);
      link.href = url;
    });
  },
  methods: {
    request(method, data) {
      return new Promise((resolve) => {
        let message = { data };
        message.realType = message.type = method;
        if (this.isdev) { message.type = 'forward'; }
        message.key = message.type + parseInt(Math.random() * 10000).toString();
        this.callback[message.key] = (rsp) => {
          resolve(rsp);
        };
        vscode.postMessage(message, '*');
      });
    }
  }
}).$mount('#app');