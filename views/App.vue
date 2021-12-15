<template>
    <div id="app">
        <symbol id="redPacketIcon" viewBox="0 0 1024 1024">
            <path d="M705.2 445.28C689.12 536.48 608.608 606.256 512 606.256c-91.232 0-171.728-64.4-187.84-150.272l-134.16-80.496V783.36c0 59.04 48.304 101.968 101.968 101.968h440.064c59.04 0 101.968-48.288 101.968-101.968V370.128l-128.8 75.136zM512 219.856c91.232 0 166.368 64.4 187.84 150.256l134.16-85.856v-48.304c0-59.04-48.304-101.968-101.968-101.968H291.968c-53.664 0-101.968 42.928-101.968 101.968v59.04l134.16 80.48c16.112-91.216 96.608-155.616 187.84-155.616z" fill="#e6464b" p-id="4469"></path>
            <path d="M565.664 434.528h-26.832v-21.456h26.832c16.112 0 26.832-10.736 26.832-26.832 0-16.112-10.72-26.848-26.832-26.848h-16.096l32.208-32.192c10.72-10.72 10.72-26.832 0-37.568-10.736-10.72-26.848-10.72-37.568 0L512 327.2l-32.192-37.568c-10.736-10.72-26.848-10.72-37.568 0-10.736 10.72-10.736 26.832 0 37.568l32.192 32.192h-16.096c-16.096 0-26.832 10.736-26.832 26.848 0 16.096 10.72 26.832 26.832 26.832h32.192v21.456h-32.192c-16.096 0-26.832 10.736-26.832 26.832 0 16.112 10.72 26.848 26.832 26.848h32.192v37.568c0 16.096 10.736 26.816 26.848 26.816 16.096 0 26.832-10.72 26.832-26.816v-37.568h21.456c16.112 0 26.832-10.736 26.832-26.848 0-16.096-10.72-26.832-26.832-26.832z" fill="#fecd41" opacity="1" p-id="4470"></path>
        </symbol>
        <symbol id="delIcon" viewBox="0 0 1029 1024">
            <path d="M5.680999 1.42025h1022.57975v1022.57975C463.001387 1024 5.680999 565.969487 5.680999 1.42025z m592.244105 494.246879L724.327323 622.069348c17.042996 17.042996 44.737864 17.042996 61.78086 0l7.101248-7.101248c17.042996-17.042996 17.042996-44.737864 0-61.78086L666.807212 426.785021l126.402219-126.402219c17.042996-17.042996 17.042996-44.737864 0-61.78086l-7.101248-7.101249c-17.042996-17.042996-44.737864-17.042996-61.78086 0L597.925104 357.902913 471.522885 231.500693c-17.042996-17.042996-44.737864-17.042996-61.78086 0l-7.101248 7.101249c-17.042996 17.042996-17.042996 44.737864 0 61.78086l126.402219 126.402219-126.402219 125.692094c-17.042996 17.042996-17.042996 44.737864 0 61.78086l7.101248 7.101248c17.042996 17.042996 44.737864 17.042996 61.78086 0l126.402219-125.692094z" fill="#bfbfbf" p-id="5348"></path>
        </symbol>
        <div v-if="!current.userName" class="login-link">
          <a href="#" @click="login">登录</a>或<a href="https://pwl.icu/register?r=imlinhanchao">注册</a>后加入聊天室
        </div>
        <MessageBox v-if="current.userName"></MessageBox>
        <MessageList :current="current"></MessageList>
    </div>
</template>

<script>
import MessageBox from "./components/MessageBox.vue";
import MessageList from "./components/MessageList.vue";

export default {
    name: "App",
    components: {
        MessageBox,
        MessageList,
    },
    data() {
        return {
            current: {}
        }
    },
    mounted() {
        this.Init()
        window.removeEventListener('message', this.noticeListener);
        window.addEventListener('message', this.noticeListener);
    },
    methods: {
        async Init() {
            if(await this.info())
            {
                // await emoji.load(this.$root.token);
                // this.faces = emoji.urls;
            }
        },
        async info() {
            let rsp = await this.$root.request('info', this.$root.token);
            if (!rsp) return false;
            if (rsp.code != 0) {
                return false;
            }
            this.current = rsp.data;
            return true;
        },
        async login() {
            let rsp = await this.$root.request('command', {
                cmd: 'login'
            });
            if (!rsp) return false;
            if (rsp.code != 0) {
                return false;
            }
            this.current = rsp.data;
        },
        noticeListener(event) {
            const message = event.data;
            if (message.type != 'notice') return;
            switch(message.cmd)
            {
                case 'login':
                {
                    let rsp = message.data;
                    if (!rsp) return false;
                    if (rsp.code != 0) {
                        return false;
                    }
                    this.info();
                }
                case 'logout':
                    this.current = {}
            }
        },

    }
};
</script>
<style lang="less" scoped>
.login-link {
    text-align: center;
}
</style>
<style lang="less">
.msg-current {
  a {
    border-bottom: 1px dashed var(--vscode-scrollbarSlider-hoverBackground);
  }
}
.md-style {
  * {
    margin-inline-start: 0;
    margin-inline-end: 0;
    line-height: 1.5;
  }
  a {
    border-bottom: 1px dashed var(--vscode-button-foreground);
  }
  img {
    max-height: 60vh;
    max-width: 40vw;
    cursor: pointer;
    background: #fff;
    &[alt="图片表情"] {
      background: transparent;
    }
  }
  ul,
  ol {
    list-style-position: inside;
  }
  .msg-img {
    img.emoji {
      max-width: 40px;
    }
  }
  img.emoji {
    max-width: 20px;
    cursor: auto;
    vertical-align: middle;
    background: transparent;
  }
  h1,
  h2 {
    padding-bottom: 0.3em;
    border-bottom: 1px solid #eaecef;
  }

  hr {
    background-color: #eaecef;
  }

  blockquote {
    color: var(--vscode-input-placeholderForeground);
    border-left: 0.25em inset var(--vscode-badge-foreground);
    background-color: var(--vscode-scrollbarSlider-background);
    padding: 2px 0 2px 5px;
  }

  iframe {
    border: 1px solid #d1d5da;
    width: 100%;
  }

  table {
    border-collapse: collapse;
    empty-cells: show;
    margin-bottom: 16px;
    overflow: auto;
    border-spacing: 0;
    display: block;
    word-break: keep-all;
    width: 100%;
  }

  table tr {
    border-top: 1px solid #c6cbd1;
    background-color: rgba(155, 155, 155, .3);
  }

  table td,
  table th {
    border: 1px solid rgba(138, 138, 138, .5);
    padding: 5px;
  }

  table tbody tr:nth-child(2n) {
    background-color: rgba(55, 55, 55, .3);
  }

  code:not(.hljs):not(.highlight-chroma) {
    background-color: rgba(27, 31, 35, 0.05);
  }

  pre,
  code {
    width: 100%;
    max-height: 300px;
    overflow: auto;
  }

  pre > code {
    margin: 0;
    font-size: 85%;
    padding: 0.5em;
    border-radius: 5px;
    display: block;
    overflow: auto;
    white-space: pre;
    font-family: mononoki, Consolas, "Liberation Mono", Menlo, Courier,
      monospace;
    word-break: initial;
    word-wrap: normal;
  }

  kbd {
    color: #24292e;
    background-color: #fafbfc;
    border: 1px solid #d1d5da;
    box-shadow: inset 0 -1px 0 #d1d5da;
  }
}
</style>
