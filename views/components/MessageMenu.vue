<template>
  <div
    class="msg-menu"
    ref="msg-menu"
    :style="posStyle"
  >
    <div
      class="msg-menu-item"
      v-if="isCurrent"
      @click="revokeMsg"
    >
      撤回消息
    </div>
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
  </div>
</template>

<script>
export default {
  name: "MessageMenu",
  props: {
    isCurrent: {
      type: Boolean,
      default() {
        return false;
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
    async revokeMsg() {
      let rsp = await this.$root.request('revoke', this.item.oId);
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