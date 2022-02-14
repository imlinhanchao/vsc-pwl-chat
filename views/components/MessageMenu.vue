<template>
  <div
    class="msg-menu"
    ref="msg-menu"
    :style="posStyle"
  >
    <div
      class="msg-menu-item"
      v-if="!isCurrent"
      @click="atMsg"
    >
      @{{ item.userName }}
    </div>
    <div class="msg-menu-item" v-if="hasFace" @click="addFace">
      收藏表情
    </div>
    <div class="msg-menu-item" v-if="!item.redpacket" @click="followMsg">
      复读机
    </div>
    <div
      class="msg-menu-item"
      v-if="isEmoji"
      title="消息中插入该表情"
      @click="appendMsg(emojiCode)"
    >
      {{ emojiCode }}
    </div>
    <div class="msg-menu-item" v-if="!item.redpacket" @click="quoteMsg">
      回复
    </div>
    <div
      class="msg-menu-item"
      v-if="isCurrent || ['纪律委员', 'OP', '管理员'].indexOf(current.userRole) >= 0"
      @click="revokeMsg()"
    >
      撤回消息
    </div>
    <div class="msg-menu-item" 
      v-if="item.dbUser && 
        item.dbUser.length && ['纪律委员', 'OP', '管理员'].indexOf(current.userRole) >= 0" 
      @click="revokeAllMsg">
      撤回复读
    </div>
  </div>
</template>

<script>
export default {
  name: "MessageMenu",
  props: {
    current: {
      type: Object,
      default() {
        return {};
      },
    },
    item: {
      type: Object,
      require: true,
    },
    menuTarget: {
      require: true,
    },
    pos: {
      type: Object,
      require: true,
      default() {
        return {}
      }
    },
  },
  computed: {
    posStyle() {
      return { 
        top: this.pos.y + 'px', 
        left: this.pos.left ? this.pos.x + 'px' : undefined,
        right: !this.pos.left ? this.pos.x + 'px' : undefined
      }
    },
    isCurrent() {
      return this.item.userName == this.current.userName
    },
    isEmoji() {
      return (
        this.menuTarget.querySelector('img') != null &&
        this.menuTarget.querySelector('img').className == "emoji"
      );
    },
    hasFace() {
      return (
        this.menuTarget.querySelector('img') != null &&
        this.menuTarget.querySelector('img').className != "emoji"
      );
    },
    emojiCode() {
      return `:${this.menuTarget.querySelector('img.emoji').src.match(/\/([^\/.]*?)(.gif|.png)/)[1]}:`;
    },
  },
  methods: {
    async followMsg() {
      let raw = await this.$root.request("raw", this.item.oId);
      this.$root.request("push", raw);
    },
    appendMsg(msg) {
      this.$emit("msg", msg);
    },
    async revokeAllMsg() {
      if ((await this.$root.request('confirm', { 
        options: ['是', '否'], 
        msg: '是否确定批量撤回所有复读消息？' 
      })) != '是') return;
      
      let oIds = this.item.dbUser.map(i => i.oId).concat([this.item.oId]);
      oIds.forEach(o => this.revokeMsg(o));
    },
    async revokeMsg(oId) {
      console.log('revoke', oId);
      oId = oId || this.item.oId;
      let rsp = await this.$root.request('revoke', oId);
      if (!rsp) return;
      if (rsp.code != 0) {
        this.$root.msg('error', rsp.msg);
        return;
      }
    },
    atMsg() {
      this.appendMsg(`@${this.item.userName} `)
    },
    addFace() {
      this.$emit('face', Array.from(this.menuTarget.querySelectorAll('img')).map(i => i.src));
    },
    quoteMsg() {
      this.$emit('quote', this.item);
    },
  },
};
</script>

<style lang="less" scoped>
.msg-menu {
  position: absolute;
  background: var(--vscode-menu-background);
  box-shadow: 0px 0px 2px var(--vscode-menu-selectionBackground);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 50;
  .msg-menu-item {
    padding: 5px 10px;
    word-break: keep-all;
    min-width: 8em;
    &:hover {
      background: var(--vscode-menu-selectionBackground);    }
  }
}
</style>
<style lang="less">
</style>