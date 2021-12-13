<template>
    <div class="msg-box">
        <input type="text" placeholder="简单聊聊" v-model="message"
            @keyup.enter="send"
        />
        <button @click="send"><i class="fa fa-paper-plane" aria-hidden="true"></i></button>
    </div>
</template>

<script>
export default {
    name: "MessageBox",
    props: {
        quote: Object
    },
    data() {
        return {
            message: ''
        }
    },
    methods: {
        async send() {
            // if (this.currentSel >= 0) {
            //     if (this.atList.length > 0) this.atUser(this.currentSel);
            //     if (this.emojiList.length > 0) this.emojiSel(this.currentSel);
            //     return;
            // }
            if (!this.message) return;
            if (this.quote) {
                let raw = await this.$root.request('raw', this.quote.oId);
                raw = raw.split('\n').map(r => `>${r}`).join('\n').trim();
                let at = this.quote.userName != this.current.userName ? `@${this.quote.userName} ` : ''
                this.message = `${at}引用：\n\n${raw}\n\n${this.message}`;
                this.quote = null;
            }
            await this.wsSend(this.message, false);
            this.message = '';
            return true;
        },
        async wsSend(message, retry) {
            let rsp = await this.$root.request('push', message);
            if (!rsp) return;
            if (rsp.code == 401 && !retry && await this.$root.request('relogin')) {
                if(await this.wsSend(message, true))
                    this.$root.request('showbox', { 
                        type: 'warning', msg: '服务器失联，已重新登录.'
                    });
                return true;
            }
            if (rsp.code != 0) {
                this.$root.request('showbox', { 
                    type: 'error', msg: rsp.msg
                });
                return false;
            }
        }
    }
};
</script>

<style lang="less" scoped>
.msg-box {
    display: flex;
    flex-direction: row;
    position: sticky;
    top: 5px;
    z-index: 10;
    button {
        width: 50px;
    }
}
</style>
