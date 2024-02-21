<template>
  <div
    ref="msg-view"
    class="msg-item"
    v-if="item.content"
    :class="{ barrager: isBaggager, 'msg-current': item.userName == current.userName }"
  >
    <div class="msg-avatar-box">
      <a target="_blank" :href="`https://fishpi.cn/member/${item.userName}`">
        <div class="christmas" v-if="new Date().getMonth() == 11 && new Date().getDate() < 26 && new Date().getDate() > 23"></div>
        <span class="msg-avatar avatar">
          <img :src="item.userAvatarURL">
        </span>
      </a>
    </div>
    <div ref="msg" :data-id="item.oId" class="msg-item-contain" @dblclick.stop="menuShow">
      <div class="msg-user" :title="item.userName">
        {{ item.userNickname || item.userName }}
      </div>
      <RedpacketMsg :item="item" :isCurrent="item.userName == current.userName" @click="getsture => openRedpacket(item, getsture)"/>
      <div class="msg-contain" v-if="!item.redpacket">
        <div
          class="arrow"
          v-if="item.content.replace(/\n/g, '').match(/>[^<]+?</g)"
        />
        <div
          class="msg-content md-style"
          :style="{
            color: item.barragerColor, 
          }"
          v-html="formatContent(item.content)"
          v-if="item.content.replace(/\n/g, '').match(/>[^<]+?</g)"
        />
        <span
          class="msg-img"
          v-if="!item.content.replace(/\n/g, '').match(/>[^<]+?</g)"
          v-html="formatContent(item.content)"
        ></span>
        <span class="plus-one" @click="followMsg(item)" v-if="plusOne">+1</span>
        <div class="msg-menu-btn" @click.stop="menuShow"><i class="fa fa-ellipsis-v"></i></div>
      </div>
      <div class="db-users" v-if="item.dbUser && item.dbUser.length">
          <span class="db-user" :key="db.oId" v-for="db in item.dbUser" :title="db.userNickame || db.userName">
              <span class="db-avatar avatar"><img :src="db.userAvatarURL" /></span>
          </span>
          <span class="db-word">也这么说</span>
      </div>
      <MessageMenu 
        v-if="contextmenuId == item.oId" 
        :pos="this.contextmenuPos" 
        :item="item" 
        :current="current" 
        :menuTarget="$refs.msg" 
        @msg="$emit('msg', $event)" 
        @face="$emit('face', $event)"
        @quote="$emit('quote', $event)"/>
    </div>
  </div>
</template>

<script>
import RedpacketMsg from './RedpacketMsg.vue';
import MessageMenu from './MessageMenu.vue';
export default {
  components: { RedpacketMsg, MessageMenu },
  name: "MessageItem",
  props: {
    current: {
      type: Object,
      default() {
        return {};
      },
    },
    contextmenuId: String,
    contextmenuPos: Object,
    item: {
      type: Object,
      require: true,
    },
    plusOne: {
      type: Boolean,
      default() {
        return false;
      },
    },
  },
  data() {
    return {
    }
  },
  computed: {
    isBaggager() {
        return !!this.item.barragerColor
    },
  },
  mounted() {
    this.$nextTick(() => {
      if (this.isBaggager) {
        setTimeout(() => {
          this.$refs['msg-view'].classList.add('barrager-show');
        }, 100);
      }
    })
  },
  methods: {
    getRedPacket(item) {
      try {
        let data = JSON.parse(item.content);
        if (data.msgType != "redPacket") return false;
        data.empty = item.empty || data.got == data.count;
        data.readed =
          item.readed ||
          data.who.find((w) => w.userName == this.current.userName);
        return data;
      } catch (e) {
        return false;
      }
    },
    formatContent(content) {
      return content
        .replace(/<audio[^>]*>\s*<source src="([^"]*?key=userVoice)"[^>]*>\s*<\/audio>/g, '<div class="voice" data-url="$1"></div>')
        .replace(/(<a )/g, '$1target="_blank" data-action="open-link"')
        .replace(/<img\s+src="([^"]*?)"([^>]*?>)/g, '<a href="$1" class="image-link" target="_blank"><img src="$1" data-action="preview" $2</a>');
    },
    async followMsg(item) {
      let raw = await this.$root.request("raw", item.oId);
      this.$root.request("push", raw);
    },
    async openRedpacket(item, gesture) {
      let rsp = await this.$root.request('openRedpacket', { oId: item.oId, gesture});
      if (!rsp) return;
      this.$emit('redpacket', rsp);
    },
    menuShow(ev) {
      let ele = this.$refs.msg;
      let pos = {
          x: ev.clientX < window.innerWidth / 2 ? 
            ev.clientX - ele.offsetLeft : ele.offsetLeft + ele.offsetWidth - ev.clientX,
          y: ev.clientY - ele.offsetTop + window.scrollY,
          left: ev.clientX < window.innerWidth / 2
      }
      this.$emit('menu', {
        id: this.item.oId,
        pos: pos,
      });
      ev.preventDefault()
    }
  },
};
</script>

<style lang="less" scoped>
.msg-item {
  display: flex;
  flex-direction: row;
  margin: 5px 0;

  &.barrager {
    background-color: var(--vscode-scrollbarSlider-background);
    border-radius: 40px;
    margin: 10px 5px;
    font-weight: bold;
    box-shadow: 0 0 5px 1px var(--vscode-scrollbarSlider-background);
    overflow: hidden;
    transition: all .5s;
    height: 0;
    opacity: 0;
    width: 0%;
    max-width: calc(95%);
    display: inline-flex;
    &.barrager-show {
        opacity: 1;
        height: 45px;
        animation: shake 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) both 0.2s;
        width: auto;
    }
    .msg-content {
        background-color: transparent;
        white-space: nowrap;
        text-overflow: ellipsis;
        max-width: calc(100%);
    }
    .msg-user, .arrow {
        display: none;
    }
    .msg-avatar-box .msg-avatar {
        min-width: 40px;
        width: 40px;
        height: 40px;
        margin: 0;
    }
    .msg-item-contain, .msg-contain {
        display: inline-flex;
        width: auto;
        max-width: calc(100%);
        height: 100%;
        align-items: center;
        &:hover {
          .msg-menu-btn {
            display: none;
          }
        }
    }
    &.msg-current {
        flex-direction: row;
        .msg-contain {
            flex-direction: row;
        }
    }
  }
}

.msg-item-contain {
  display: flex;
  flex-direction: column;
  max-width: 85%;
  position: relative;
  width: 100%;
}

.msg-avatar {
  width: 35px;
  height: 35px;
  border-radius: 35px;
  margin-top: 1.5em;
  cursor: pointer;
  img {
    min-width: 100%;
    max-width: 100%;
  }
}

.msg-user {
  margin-left: 1em;
  font-size: 1em;
  margin-bottom: 2px;
  min-height: 1em;
}

.msg-contain {
  display: flex;
  flex-direction: row;
  position: relative;
  max-width: 80vw;
  .msg-img {
    padding: 10px 15px 10px 10px;
    display: inline-block;
  }
  .plus-one {
    font-size: 0.8em;
    margin: auto 5px;
    font-weight: bolder;
    color: #fff;
    height: 25px;
    width: 25px;
    background: #d23f31;
    border-radius: 15px;
    text-align: center;
    cursor: pointer;
    line-height: 23px;
    font-family: mononoki, Consolas, "Liberation Mono", Menlo, Courier,
      monospace;
  }
  &:hover {
    .msg-menu-btn {
      display: flex;
    }
  }
  .msg-menu-btn {
    display: none;
    position: relative;
    left: -15px;
    align-items: flex-end;
    bottom: 10px;
    cursor: pointer;
    padding: 0 5px;
  }
}

.msg-content {
  background-color: var(--vscode-scrollbarSlider-background);
  border-radius: 5px;
  padding: 8px 15px;
  color: var(--vscode-button-foreground);
  word-break: break-word;
  max-width: calc(100% - 45px);
  overflow: auto;
}
.msg-current {
  flex-direction: row-reverse;
  .msg-contain {
    flex-direction: row-reverse;
  }
  .arrow {
    border-right-color: transparent;
    border-left-color: var(--vscode-button-background);
  }
  .msg-content {
    background-color: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
  }
  .msg-user {
    text-align: right;
    margin-right: 1em;
  }
  .plus-one {
    left: -1.5em;
    right: auto;
  }
  .msg-menu-btn {
    color: var(--vscode-button-foreground);
    left: auto;
    right: -15px;
  }
}
.hidden {
  visibility: hidden;
  position: absolute;
}
.db-users {
  padding: 5px 0 5px 10px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-wrap: wrap;
  .db-user {
    padding: 2px;
  }
  .db-avatar {
    width: 25px;
    height: 25px;
  }
  .db-word {
    display: inline-block;
    padding-left: 5px;
  }
}
.msg-avatar-box {
    position: relative;
}
.christmas {
    position: absolute;
    background: url(../assets/christmas.png) top left no-repeat;
    width: 100%;
    height: 100%;
    background-size: 100% auto;
    right: -14px;
    transform: scaleX(-1);
    top: 16px;
    z-index: 9;
}
.msg-current {
    .christmas {
        transform: none;
        right: auto;
        left: -14px;
    }
}
</style>
<style lang="less">
.msg-img {
  img {
    max-width: 100%;
  }
  [alt="图片表情"] {
    max-width: 45vw;
  }
}
.voice {
  height: 1.5em;
  width: 60px;
  background: url(../assets/voice.png) left top no-repeat;
  background-size: 1.5em auto;
}
.voice-play {
  animation: voiceplay 2s infinite step-start;
} 
.msg-current {
  .voice {
    transform:scaleX(-1);
  }
}
@keyframes voiceplay{
  0%, 100%{
    background-position: 0 -3em; 
  }
  33.333%{
    background-position: 0 -1.5em;
  }
  66.666%{
    background-position: 0 0;
  }
}

@keyframes shake {
  0% {
    transform: translateY(0);
  }
  20% {
    transform: translateY(-8px);
  }
  40% {
    transform: translateY(0);
  }
  60% {
    transform: translateY(-4px);
  }
  80% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-2px);
  }
}
</style>