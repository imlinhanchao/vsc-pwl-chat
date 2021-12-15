<template>
  <div class="msg-box">
    <input ref="message"
      type="text"
      placeholder="简单聊聊"
      v-model="message"
      @keyup.enter="send"
      @keyup.up="selList(-1)"
      @keyup.down="selList(1)"
      @keyup.left="selList(-1)"
      @keyup.right="selList(1)"
    />
    <span class="msg-control">
        <span class="msg-btn">
            <button @click="send">
                <i class="fa fa-paper-plane"></i>
            </button>
            <button @click="controlMore=!controlMore" class="more fa fa-caret-down"></button>
        </span>
        <button class="msg-control-more" v-show="controlMore" @click="imageHandle" title="上传图片">
            <i class="fa fa-picture-o"/>
        </button>
        <input type="file" name="images" accept="image/*" ref="file" v-show="false" @change="uploadImg">
    </span>
    <section class="at-list" v-if="atList.length">
      <div
        class="at-item"
        @click="atUser(i)"
        :class="{ 'current-at': currentSel == i }"
        v-for="(u, i) in atList"
      >
        <span class="avatar"><img :src="u.userAvatarURL" /></span> {{ u.userName }}
      </div>
    </section>
    <section class="emoji-list" v-if="emojiList.length">
      <div
        class="emoji-item"
        @click="addEmoji(i)"
        :class="{ 'current-at': currentSel == i }"
        v-for="(u, i) in emojiList"
      >
        <img :src="u.url" />
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: "MessageBox",
  props: {
    quote: Object,
  },
  watch: {
    message(val) {
      let data = val.slice(0, this.msgCursor());
      let matAt = data.match(/@([^\s]+?)$/);
      let matEmoji = data.match(/:([^:]+?)$/);
      if (matAt) this.getAt(matAt[1]);
      else if (matEmoji) this.getEmoji(matEmoji[1]);
      else this.emojiList = this.atList = [];
    },
  },
  data() {
    return {
      message: "",
      atList: [],
      emojiList: [],
      currentSel: -1,
      lastCursor: 0,
      controlMore: false
    };
  },
  mounted() {
      
  },
  methods: {
    getEmoji(name) {
      if (!name || name.length < 1) return;
      this.emojiList = this.$root.emoji.search(name);
      this.currentSel = -1;
      this.lastCursor = this.msgCursor();
    },
    msgCursor() {
        return this.$refs['message'].selectionStart
    },
    async getAt(name) {
      if (!name) return;
      let rsp = await this.$root.request('atlist', name);
      if (!rsp) return;
      if (rsp.code != 0) {
        this.$Message.error(rsp.msg);
        return;
      }
      this.atList = rsp.data;
      this.currentSel = -1;
      this.lastCursor = this.msgCursor();
    },
    selList(i) {
        let len = this.atList.length || this.emojiList.length;
        if (len == 0) return;
        this.currentSel = (this.currentSel + i) % len;
        this.$refs['message'].setSelectionRange(this.lastCursor, this.lastCursor)
    },
    atUser(i) {
        let data = '@' + this.atList[i].userName + ' ';
        this.atList = [];
        this.currentSel = -1;
        this.appendMsg({ regexp: /@([^\s]*?)$/, data })
    },
    addEmoji(i) {
        let data = this.$root.emoji.get(this.emojiList[i].name);
        this.emojiList = [];
        this.currentSel = -1;
        this.appendMsg({ regexp: /:([^:]+?)$/, data })
    },
    appendMsg({ regexp, data }){
        let preMsg = this.message.slice(0, this.lastCursor)
        if(regexp) preMsg = preMsg.replace(regexp, data);
        else preMsg += data;
        this.message = preMsg + this.message.slice(this.lastCursor);
        this.$nextTick(() => {
            this.$refs['message'].focus();
            this.$refs['message'].setSelectionRange(preMsg.length, preMsg.length)
            this.emojiList = this.atList = []
        });
    },
    async send() {
      if (this.currentSel >= 0) {
           if (this.atList.length > 0) this.atUser(this.currentSel);
           if (this.emojiList.length > 0) this.addEmoji(this.currentSel);
           return;
      }
      if (!this.message) return;
      if (this.quote) {
        let raw = await this.$root.request("raw", this.quote.oId);
        raw = raw
          .split("\n")
          .map((r) => `>${r}`)
          .join("\n")
          .trim();
        let at =
          this.quote.userName != this.current.userName
            ? `@${this.quote.userName} `
            : "";
        this.message = `${at}引用：\n\n${raw}\n\n${this.message}`;
        this.quote = null;
      }
      await this.wsSend(this.message, false);
      this.message = "";
      window.scrollTo(0, 0);
      return true;
    },
    async wsSend(message, retry) {
      let rsp = await this.$root.request("push", message);
      if (!rsp) return;
      if (rsp.code == 401 && !retry && (await this.$root.request("relogin"))) {
        if (await this.wsSend(message, true))
          this.$root.request("showbox", {
            type: "warning",
            msg: "服务器失联，已重新登录.",
          });
        return true;
      }
      if (rsp.code != 0) {
        this.$root.request("showbox", {
          type: "error",
          msg: rsp.msg,
        });
        return false;
      }
    },
    imageHandle() {
        this.$refs['file'].click();
        this.controlMore = false;
    },
    async uploadImg(ev) {
        let files = Array.from(ev.target.files).map(f => f.path)
        if (files.length == 0) return;
        let rsp = await this.$root.request('upload', files);
        this.$refs['file'].value = '';
        if (!rsp) return;
        if (rsp.code != 0) {
            this.$root.request('showbox', { type: 'error', msg: rsp.msg });
            return;
        }
        let fileData = rsp.data.succMap;
        let filenames = Object.keys(fileData)
        
        this.lastCursor = this.msgCursor();
        this.appendMsg({ regexp: null, data: filenames.map(f => `![${f}](${fileData[f]})`).join('') }); 
    },
  },
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
  .msg-control {
      position: relative;
      .msg-btn {
          display: flex;
          flex-direction: row;
          width: 50px;
          button {
              padding-right: 5px;
          }
          .more {
              &:hover {
                  background: var(--vscode-button-hoverBackground);
              }
              background: transparent;
              width: 12px;
              padding: 0;
              font-size: .6em;
              position: absolute;
              right: 0;
              height: 100%;
          }
      }
    .msg-control-more {
        position: absolute;
    }
  }
}
.at-list,
.emoji-list {
  position: absolute;
  background: var(--vscode-input-background);
  top: 2.5em;
  z-index: 90;
  left: 0;
  color: var(--vscode-input-foreground);
  box-shadow: 0px 1px 2px 0px var(--vscode-input-border);
  overflow: hidden;
  .at-item,
  .emoji-item {
    padding: 6px 5px;
    user-select: none;
    cursor: pointer;
  }
  .current-at {
    background: rgba(100, 100, 100, 0.5);
  }
}
.emoji-list {
  display: flex;
  flex-direction: row;
  .emoji-item {
    img {
      width: 30px;
    }
  }
}
</style>
