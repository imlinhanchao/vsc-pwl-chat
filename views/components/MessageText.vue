<template>
  <div
    class="msg-item"
    v-if="item.content"
    :class="{ 'msg-current': item.userName == current.userName }"
  >
    <div ref="msg" :data-id="item.oId" class="msg-item-contain" @dblclick.stop="menuShow">
      <a class="msg-user"  target="_blank" :href="`https://pwl.icu/member/${item.userName}`" :title="item.userName">
        {{ item.userNickname || item.userName }}
      </a><span>说: </span>
      <a v-if="item.redpacket"  class="redpacket" href="#" @click.stop="openRedpacket(item)">[收到一个红包]</a>
      <span class="msg-contain" v-if="!item.redpacket">
        <span
          class="msg-content md-style"
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
        .replace(/<(\w+)>(.*?)<\/\1>/g, '<span>$2</span>')
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
    display: inline-block;
    padding-left: 5px;
  }
}
</style>
<style lang="less">
.msg-img {
  img {
    max-width: 55vw;
  }
  [alt="图片表情"] {
    max-width: 45vw;
  }
}
</style>