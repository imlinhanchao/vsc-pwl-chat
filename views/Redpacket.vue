<template>
    <div id="app">
        <symbol id="redPacketIcon" viewBox="0 0 1024 1024">
            <path d="M705.2 445.28C689.12 536.48 608.608 606.256 512 606.256c-91.232 0-171.728-64.4-187.84-150.272l-134.16-80.496V783.36c0 59.04 48.304 101.968 101.968 101.968h440.064c59.04 0 101.968-48.288 101.968-101.968V370.128l-128.8 75.136zM512 219.856c91.232 0 166.368 64.4 187.84 150.256l134.16-85.856v-48.304c0-59.04-48.304-101.968-101.968-101.968H291.968c-53.664 0-101.968 42.928-101.968 101.968v59.04l134.16 80.48c16.112-91.216 96.608-155.616 187.84-155.616z" fill="#e6464b" p-id="4469"></path>
            <path d="M565.664 434.528h-26.832v-21.456h26.832c16.112 0 26.832-10.736 26.832-26.832 0-16.112-10.72-26.848-26.832-26.848h-16.096l32.208-32.192c10.72-10.72 10.72-26.832 0-37.568-10.736-10.72-26.848-10.72-37.568 0L512 327.2l-32.192-37.568c-10.736-10.72-26.848-10.72-37.568 0-10.736 10.72-10.736 26.832 0 37.568l32.192 32.192h-16.096c-16.096 0-26.832 10.736-26.832 26.848 0 16.096 10.72 26.832 26.832 26.832h32.192v21.456h-32.192c-16.096 0-26.832 10.736-26.832 26.832 0 16.112 10.72 26.848 26.832 26.848h32.192v37.568c0 16.096 10.736 26.816 26.848 26.816 16.096 0 26.832-10.72 26.832-26.816v-37.568h21.456c16.112 0 26.832-10.736 26.832-26.848 0-16.096-10.72-26.832-26.832-26.832z" fill="#fecd41" opacity="1" p-id="4470"></path>
        </symbol>
        <div v-if="!current.userName" class="login-link">
          <a href="#" @click="login">登录</a>或<a href="https://pwl.icu/register?r=imlinhanchao">注册</a>后加入聊天室
        </div>
        <section class="redpack-form">
          <p>
              <select name="redpack_type" id="redpack_type">
                  <option value="random">拼手气红包</option>
                  <option value="average">普通红包</option>
                  <option value="specify">专属红包</option>
                  <option value="heartbeat">心跳红包</option>
              </select>
          </p>
          <p class="redpack-number">
              <input type="number" placeholder="积分">
              <input type="number" placeholder="个数">
          </p>
          <p>
              <input type="text" placeholder="留言">
          </p>
          <p>
              <button >包红包</button>
          </p>
        </section>
    </div>
</template>

<script>
export default {
    name: "App",
    components: {
    },
    data() {
        return {
            current: {},
            quote: null,
        }
    },
    mounted() {
        this.Init()
        window.removeEventListener('message', this.noticeListener);
        window.addEventListener('message', this.noticeListener);
    },
    methods: {
        async Init() {
            await this.info()
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
            await this.Init();
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
.redpack-form {
    >p {
        display: flex;
        align-items: center;
        margin: 1em 0;
        &.redpack-number {
            input:nth-child(1) {
                margin-right: 1em;
            }
        }
    }
}
</style>
<style lang="less">

</style>
