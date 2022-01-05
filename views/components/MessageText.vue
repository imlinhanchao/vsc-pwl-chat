<template>
  <div
    class="msg-item"
    v-if="item.content"
    :class="{ 'msg-current': item.userName == current.userName }"
  >
    <div ref="msg" :data-id="item.oId" class="msg-item-contain" @dblclick.stop="menuShow">
      <a class="msg-user"  target="_blank" :href="`https://fishpi.cn/member/${item.userName}`" :title="item.userName">
        {{ item.userNickname || item.userName }}
      </a><span>说: </span>
      <a v-if="item.redpacket"  class="redpacket" href="javascript:void(0)" @click.stop="openRedpacket(item)">[收到一个红包]</a>
      <span class="msg-contain" v-if="!item.redpacket">
        <span
          class="msg-content txt-style"
          v-html="formatContent(item.content)"
        />
      </span>
      <span class="msg-menu-btn" @click.stop="menuShow"><i class="fa fa-ellipsis-v"></i></span>
      <div class="db-users" v-if="item.dbUser && item.dbUser.length">
          <span>></span>
          <span class="db-user" :key="db.oId" v-for="(db, i) in item.dbUser">
              <span>{{db.userNickname || db.userName}}</span><span v-if="i < item.dbUser.length - 1">,</span> 
          </span>
          <span class="db-word">也这么说</span>
      </div>
      <MessageMenu 
        v-if="contextmenuId == item.oId" 
        :pos="this.contextmenuPos" 
        :item="item" 
        :isCurrent="item.userName == current.userName" 
        :menuTarget="$refs.msg"
        @msg="$emit('msg', $event)" 
        @face="$emit('face', $event)"
        @quote="$emit('quote', $event)"/>
    </div>
  </div>
</template>

<script>
import MessageMenu from './MessageMenu.vue';
export default {
  components: { MessageMenu },
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
  },
  data() {
    return {
    }
  },
  computed: {
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
        .replace(/(<a )/g, '$1target="_blank" data-action="open-link"')
        .replace(/<img\s+alt="([^"]*?)"\s+class="emoji"([^>]*?>)/g, '[$1]')
        .replace(/<img\s+src="([^"]*?)"\s+alt="图片表情"([^>]*?>)/g, '[动画表情]')
        .replace(/<img\s+src="([^"]*?)"([^>]*?>)/g, '<a href="$1" class="image-link" target="_blank">[图片]</a>')
        .replace(/<(\/)*p[^>]*?>/g, '<$1span>')
        .replace(/<audio[^>]*?>.*?<\/audio>/g, '[音乐]')
        .replace(/<video[^>]*?>.*?<\/video>/g, '[视频]')
        .replace(/<(\w+)>(.*?)<\/\1>/g, '<span>$2</span>')
        .replace(/<iframe.*?<\/iframe>/g, '[内联网页]')
        .replace(new RegExp(`@${this.current.userName}`, 'g'), 
        `<b style="color:var(--vscode-button-background)">@${this.current.userName}</b>`)
    },
    async followMsg(item) {
      let raw = await this.$root.request("raw", item.oId);
      this.$root.request("push", raw);
    },
    async openRedpacket(item) {
      let rsp = await this.$root.request('openRedpacket', item.oId);
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
}

.msg-item-contain {
  position: relative;
  width: 100%;
  &:hover {
    .msg-menu-btn {
      display: inline;
    }
  }
  .msg-menu-btn {
    display: none;
    cursor: pointer;
    padding-left: 5px;
  }
}
.msg-user {
  font-weight: bold;
}
.msg-contain {
  position: relative;
  width: 100%;
}

.msg-content {
  border-radius: 5px;
  word-break: break-word;
  max-width: calc(100% - 45px);
  overflow: auto;
}
.msg-current {
  font-weight: bold;
}
.hidden {
  visibility: hidden;
  position: absolute;
}
.redpacket {
  color: rgba(243, 46, 24, 0.8);
  border-bottom: 1px dashed rgba(243, 46, 24, 0.8);
}
.db-users {
  padding: 0 5px;
  word-break: break-all;
  .db-user {
    padding: 2px;
  }
  .db-avatar {
    width: 25px;
    height: 25px;
  }
  .db-word {
    padding-left: 5px;
  }
}
</style>
<style lang="less">
.txt-style {
  * {
    margin-inline-start: 0;
    margin-inline-end: 0;
    line-height: 1.5;
  }
  a {
    border-bottom: 1px dashed var(--vscode-button-foreground);
  }
  img {
    width: 0;
    height: 0;
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