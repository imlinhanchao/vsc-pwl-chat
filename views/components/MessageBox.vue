<template>
  <div class="msg-box">
    <!-- <section class="discusse" v-if="discusse">
      <a href="javascript:void(0)" @click="message += discusse">#{{discusse}}#</a> 
    </section> -->
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
            <button @click.stop="controlMore=!controlMore" class="more fa fa-caret-down"></button>
        </span>
        <span class="msg-control-more" v-show="controlMore" >
          <button class="msg-control-item" @click.stop="imageHandle" title="上传图片">
              <i class="fa fa-picture-o"/>
          </button>
          <button class="msg-control-item" @click.stop="faceHandle" title="发表情">
              <i class="fa fa-smile-o"/>
          </button>
        </span>
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
    <section class="quote" v-if="quote">
        <span class="quote-user" v-if="quote">回复：@{{quote.userName}} <i @click="quote=null" class="fa fa-times"></i></span>
        <div class="quote-content">
            <div class="quote-tip md-style" v-html="quote.content"></div>
        </div>
    </section>
    <article class="face-list face-diy" v-show="faceForm">
        <section :ref="`face-${i}`"
            class="face-item" v-for="(u, i) in faces" 
            @click="sendFace(emoji.get(u))">
          <span class="face-space" 
            :style="{ backgroundImage: `url(${u})`}" 
          ></span>
          <span class="face-remove" @click.stop="removeFace(u)">
              <button class="btn-text"><svg style="width: 15px; height: 15px;"><use xlink:href="#delIcon"></use></svg>
              </button>
          </span>
          <div class="msg-quote-tip" slot="content">
              <img :src="u">
          </div>
        </section>
        <section class="face-add" title="上传表情" @click="$refs['facefile'].click()">
            <i class="fa fa-plus" />
            <input type="file" name="images" accept="image/*" ref="facefile" v-show="false" @change="uploadFace">
        </section>
    </article>
  </div>
</template>

<script>
import * as packages from '../../package.json';

export default {
  name: "MessageBox",
  props: {
    quote: Object,
    current: Object
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
    quote (val) {
      if (val == null) this.message =  this.message.replace(/^并说：/, '');
      else if(!this.message.startsWith('并说：')) this.message = '并说：' + this.message;
    }
  },
  data() {
    return {
      message: "",
      atList: [],
      emojiList: [],
      currentSel: -1,
      lastCursor: 0,
      controlMore: false,
      faceForm: false,
      faces: [],
      discusse: '',
    };
  },
  mounted() {
      this.faces = this.$root.emoji.urls;
      window.removeEventListener("message", this.wsListener);
      window.addEventListener("message", this.wsListener);
      // document.removeEventListener('paste', this.onPaste);
      // document.addEventListener('paste', this.onPaste);
  },
  computed: {
    emoji() {
      return this.$root.emoji;
    }
  },
  methods: {
    wsListener(event) {
      if (this.message.type != "websocket") return;
      this.wsMessage(message);
    },
    wsMessage(ev) {
      let msg = JSON.parse(ev.data);
      console.log('message', msg)
      switch (msg.type) {
        case 'online':
          this.discusse = msg.discussing;
          break;
        case 'discussChanged':
          this.discusse = msg.newDiscuss;
          break;
      }
    },
    clear() {
      this.controlMore = false;
      this.faceForm = false;
    },
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
        this.$emit('update:quote', null)
      }
      await this.wsSend(this.message + `<span class="vscode-extension-message ver-${packages.version}"/>`, false);
      this.message = "";
      window.scrollTo(0, 0);
      return true;
    },
    async wsSend(message, retry) {
      let rsp = await this.$root.request("push", message);
      if (!rsp) return;
      if (rsp.code == 401 && !retry && (await this.$root.request("relogin"))) {
        if (await this.wsSend(message, true))
          this.$root.msg('warning', '服务器失联，已重新登录.');
        return true;
      }
      if (rsp.code != 0) {
        this.$root.msg('error', rsp.msg);
        return false;
      }
    },
    imageHandle() {
        this.$refs['file'].click();
        this.controlMore = false;
    },
    async uploadImg(ev) {
        let files = Array.from(ev.target.files).map(f => f.path || f)
        if (files.length == 0) return;
        let rsp = await this.$root.request('upload', files);
        this.$refs['file'].value = '';
        if (!rsp) return;
        if (rsp.code != 0) {
            this.$root.msg('error', rsp.msg);
            return;
        }
        let fileData = rsp.data.succMap;
        let filenames = Object.keys(fileData)
        
        this.lastCursor = this.msgCursor();
        this.appendMsg({ regexp: null, data: filenames.map(f => `![${f}](${fileData[f]})`).join('') }); 
    },
    faceHandle() {
      this.faces = this.$root.emoji.urls;
      this.faceForm = true;
      this.controlMore = false;
    },
    sendFace(face) {
        this.lastCursor = this.msgCursor();
        this.appendMsg({ regexp: null, data: face });
        this.faceForm = false;
    },
    async uploadFace(ev) {
        let files = Array.from(ev.target.files)
        let rsp = await this.$root.pwl.upload(files);
        if (!rsp) return;
        if (rsp.code != 0) {
            this.$Message.error(rsp.msg);
            return;
        }
        let fileData = rsp.data.succMap;
        for(let d in fileData) {
            this.faces.push(fileData[d]);
            emoji.push(null, fileData[d])
        }
        emoji.save(this.$root.token);
    },
    async onPaste(ev) {
        let items = ev.clipboardData && ev.clipboardData.items;
        let file = [];
        if (items && items.length) {
            for (var i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    file.push(items[i].getAsFile());
                    break;
                }
                if (items[i].type.indexOf('html') !== -1) {
                    let files = await this.htmlGetImg(items[i])
                    files = files || []
                    files = files.map(f => constructFileFromLocalFileData(new LocalFileData(f.replace(/file:\/\/\//g, ''))))
                    file = file.concat(files);
                }
            }
        }
        if (file.length == 0) return;
        this.lastCursor = this.msgCursor();
        await this.uploadImg({ target: { files: file}});
    },
    async removeFace(u) {
        this.faces = await this.emoji.remove(u);
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
.quote {
  position: absolute;
  top: 3em;
  width: 100%;
  .quote-user {
    background: var(--vscode-button-background);
    padding: 5px;
    cursor: pointer;
  }
  &:hover {
    .quote-content {
      display: block;
    }
  }
  .quote-content {
    display: none;
    position: absolute;
    max-width: 80vw;
    top: 2em;
    background: rgba(69, 69, 69, .65);
    padding: 5px;
  }
}
.face-list {
    position: absolute;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    overflow: auto;
    max-height: 350px;
    top: 3em;
    &.face-diy {
        .face-item {
            width: 60px;
            height: 60px;
            overflow: hidden;
            position: relative;
            background: rgba(100, 100, 100, 0.5);
            .face-space {
                background-size: cover;
                display: inline-block;
                width: 100%;
                height: 100%;
                background-repeat: no-repeat;
            }
            .face-remove {
                position: absolute;
                top: 5px;
                right: 5px;
                font-size: .5em;
                button {
                    padding: 0;
                    width: auto;
                }
            }
            img {
                max-width: 100%;
                max-height: 100%;
                width: auto;
            }
        }
        .msg-quote-tip {
            img {
                width: auto;
                max-width: 150px;
                max-height: 150px;
            }
        }
    }
    .face-item {
        width: 10%;
        padding: 5px;
        cursor: pointer;
        img {
            width: 100%;
        }
    }
    .face-add {
        width: 59px;
        height: 59px;
        cursor: pointer;
        line-height: 59px;
        text-align: center;
        margin: 2px;
        border: 1px dashed #6a737d;
        background: rgba(100, 100, 100, 0.5);
    }
}
</style>
