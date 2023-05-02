<template>
    <div id="app">
        <symbol id="redPacketIcon" viewBox="0 0 1024 1024">
            <path d="M705.2 445.28C689.12 536.48 608.608 606.256 512 606.256c-91.232 0-171.728-64.4-187.84-150.272l-134.16-80.496V783.36c0 59.04 48.304 101.968 101.968 101.968h440.064c59.04 0 101.968-48.288 101.968-101.968V370.128l-128.8 75.136zM512 219.856c91.232 0 166.368 64.4 187.84 150.256l134.16-85.856v-48.304c0-59.04-48.304-101.968-101.968-101.968H291.968c-53.664 0-101.968 42.928-101.968 101.968v59.04l134.16 80.48c16.112-91.216 96.608-155.616 187.84-155.616z" fill="#e6464b" p-id="4469"></path>
            <path d="M565.664 434.528h-26.832v-21.456h26.832c16.112 0 26.832-10.736 26.832-26.832 0-16.112-10.72-26.848-26.832-26.848h-16.096l32.208-32.192c10.72-10.72 10.72-26.832 0-37.568-10.736-10.72-26.848-10.72-37.568 0L512 327.2l-32.192-37.568c-10.736-10.72-26.848-10.72-37.568 0-10.736 10.72-10.736 26.832 0 37.568l32.192 32.192h-16.096c-16.096 0-26.832 10.736-26.832 26.848 0 16.096 10.72 26.832 26.832 26.832h32.192v21.456h-32.192c-16.096 0-26.832 10.736-26.832 26.832 0 16.112 10.72 26.848 26.832 26.848h32.192v37.568c0 16.096 10.736 26.816 26.848 26.816 16.096 0 26.832-10.72 26.832-26.816v-37.568h21.456c16.112 0 26.832-10.736 26.832-26.848 0-16.096-10.72-26.832-26.832-26.832z" fill="#fecd41" opacity="1" p-id="4470"></path>
        </symbol>
        <div v-if="!current.userName" class="login-link">
          <a href="#" @click="login">登录</a>或<a href="https://fishpi.cn/register?r=imlinhanchao">注册</a>后加入聊天室
        </div>
        <section class="redpack-form">
            <p>
                <select v-model="redpacket.type">
                    <option v-for="t in redpacketType" :value="t.value">{{t.label}}</option>
                </select>
            </p>
            <p class="user-list" v-if="redpacket.type == 'specify'">
                <span v-for="u in onlines" @click="reciverCheck(u)"
                    class="user-item" 
                    :title="u.userName" 
                    :class="{ 'user-check': redpacket.recivers.indexOf(u.userName) >= 0 }">
                    <span class="avatar">
                        <img :src="u.userAvatarURL">
                    </span>
                </span>
            </p>
            <p class="redpack-number">
                <input type="number" placeholder="积分" v-model="redpacket.money" :min="32">
                <input type="number" v-if="redpacket.type != 'rockPaperScissors'" placeholder="个数" v-model="redpacket.count" :min="minCount">
                <select v-if="redpacket.type == 'rockPaperScissors'" v-model="redpacket.gesture">
                    <option v-for="t in gestureType" :value="t.value">{{t.label}}</option>
                </select>
            </p>
            <p>
                <input type="text" :placeholder="defaultRedpackWord[redpacket.type]" v-model="redpacket.msg">
            </p>
            <p>
                <button @click="sendRedpacket">包红包</button>
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
            onlines: [],
            redpacket: {
                type: 'random',
                money: 32,
                count: 2,
                msg: '',
                recivers: [],
                gesture: 0
            },
        }
    },
    computed: {
        redpacketType() {
            return [
                { label: '拼手气红包', value: 'random' },
                { label: '普通红包', value: 'average' },
                { label: '专属红包', value: 'specify' },
                { label: '心跳红包', value: 'heartbeat' },
                { label: '猜拳红包', value: 'rockPaperScissors' },
            ]
        },
        gestureType() {
            return [
                { label: '石头', value: 0 },
                { label: '剪刀', value: 1 },
                { label: '布', value: 2 },
            ]
        },
        defaultRedpackWord() {
            return {
                random: '摸鱼者，事竟成！',
                average: '平分红包，人人有份！',
                specify: '试试看，这是给你的红包吗？',
                heartbeat: '玩的就是心跳！',
                rockPaperScissors: '剪刀石头布！'
            }
        },
        minCount() {
            return this.redpacket.type == 'specify' ? this.redpacket.recivers.length : 1;
        }
    },
    mounted() {
        this.Init()
        window.removeEventListener('message', this.noticeListener);
        window.addEventListener('message', this.noticeListener);
        setInterval(async () => {
            this.onlines = await this.$root.request('getOnlines');
        }, 2000)
   },
    methods: {
        async Init() {
            await this.info()
        },
        reciverCheck(user) {
            let index = this.redpacket.recivers.indexOf(user.userName);
            if(index < 0) this.redpacket.recivers.push(user.userName);
            else this.redpacket.recivers.splice(index, 1);
            this.redpacket.count = this.redpacket.recivers.length
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
        async sendRedpacket() {
            if (this.redpacket.count <= 0) return;
            if (this.redpacket.type == 'specify' && this.redpacket.recivers.filter(r => r != r.userName).length == 0) {
                this.$root.msg('warning', '请至少选择一个不是自己的人收红包');
                return;
            }
            let redpacket = Object.assign({}, this.redpacket);
            redpacket.msg = redpacket.msg || this.defaultRedpackWord[redpacket.type];

            let message = `[redpacket]${JSON.stringify(redpacket)}[/redpacket]`
            let rsp = await this.$root.request("push", message);
             if (rsp.code != 0) {
                this.$root.msg('error', rsp.msg);
                return false;
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
    .user-list {
        max-height: 6em;
        overflow: auto;
        flex-wrap: wrap;
        .user-item {
            display: inline-block;
            margin: 2px;
        }
        .user-check {
            .avatar {
                border: 2px solid var(--vscode-button-background);
                box-shadow: 0 0 3px var(--vscode-button-background);
            }
        }
    }

}
</style>
<style lang="less">

</style>
