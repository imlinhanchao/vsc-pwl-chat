<template>
  <section class="chat-content" ref="chat-content">
    <div
      v-for="(item, i) in content"
      v-bind:key="(item.type || 'msg') + '_' + item.oId + (item.whoGot || '')"
    >
      <MessageItem v-if="!isTextMode"
        @redpacket="showRedpacket(item, $event)"
        @msg="$emit('msg', $event)" 
        @face="$emit('face', $event)"
        @quote="$emit('quote', $event)"
        :current="current"
        :item.sync="item"
        :contextmenuId.sync="contextmenuId"
        :contextmenuPos.sync="contextmenuPos"
        @menu="OnMenu"
        :plusOne="
          item.dbUser.length > 0 && 
          item.oId == firstMsg.oId
        "
      ></MessageItem>
      <MessageText v-if="isTextMode"
        @redpacket="showRedpacket(item, $event)"
        @msg="$emit('msg', $event)" 
        @face="$emit('face', $event)"
        @quote="$emit('quote', $event)"
        :current="current"
        :item.sync="item"
        :contextmenuId.sync="contextmenuId"
        :contextmenuPos.sync="contextmenuPos"
        @menu="OnMenu"
      ></MessageText>
    </div>
    <div class="msg-more" @click="load(page + 1)" v-if="content.length < 1999">
      <i class="fa fa-caret-down" v-if="!loading" />
      <i class="fa fa-circle-o-notch fa-spin" v-if="loading" />
    </div>
  </section>
</template>

<script>
import MessageItem from "./MessageItem.vue";
import MessageText from "./MessageText.vue";

export default {
  name: "MessageList",
  props: {
    current: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  components: {
    MessageItem, MessageText,
  },
  data() {
    return {
      page: 1,
      content: [],
      rws: null,
      menu: {},
      faceMenu: {},
      loading: false,
      menuTarget: null,
      contextmenuId: '',
      contextmenuPos: {},
    };
  },
  computed: {
    firstMsg() {
      return this.content.find((item) => !item.redpacket && !item.whoGot);
    },
    secondMsg() {
      return this.content.find(
        (item) =>
          !item.redpacket && !item.whoGot && item.oId != this.firstMsg.oId
      );
    },
    isTextMode() {
      return this.$root.config.viewType == '文字模式'
    }
  },
  mounted() {
    this.load(1);
    this.load(2);
    this.wsInit();
  },
  methods: {
    async load(page) {
      let rsp = await this.$root.request("history", page);
      console.dir(rsp);
      this.loading = false;
      if (!rsp) return;
      if (rsp.code != 0) {
        return;
      }
      let oIds = this.content.map((c) => c.oId);
      let data = rsp.data.filter((d) => oIds.indexOf(d.oId) < 0);
      data.forEach((d) => (d.redpacket = this.getRedPacket(d)));
      data = this.mergeDoubleMsg(data);
      if (page > 1) this.content = this.content.concat(data);
      else this.content = data;
      this.page = page;
    },
    mergeDoubleMsg(contents) {
      contents.forEach((c, i) => {
        contents[i].dbUser = []
        if (!contents[i - 1]) return;
        if (contents[i].redpacket) return; // 红包不合并
        if (c.content != contents[i - 1].content) return;
        contents[i - 1].hide = true;
        contents[i].dbUser = contents[i - 1].dbUser || [];
        contents[i - 1].dbUser = undefined;
        contents[i].dbUser.splice(0, 0, contents[i - 1])
      });
      return contents.filter(c => !c.hide);
    },
    clear() {
      this.contextmenuId = ''
    },
    OnMenu(data) {
      this.contextmenuId = data.id;
      this.contextmenuPos = data.pos;
    },
    wsInit() {
      this.$root.request("websocketInit");
      window.removeEventListener("message", this.wsListener);
      window.addEventListener("message", this.wsListener);
    },
    wsListener(event) {
      const message = event.data;
      if (message.type == "config") {
        this.$root.config = message.data;
      }
      if (message.type != "websocket") return;
      this.wsMessage(message);
    },
    wsMessage(ev) {
      let msg = JSON.parse(ev.data);

      switch (msg.type) {
        case "online": //在线人数
          `摸鱼派 - 聊天室(${msg.onlineChatCnt})`;
          break;
        case "revoke": //撤回
          for (let i = 0; i < this.content.length; i++) {
            let c = this.content[i];
            if (c.oId != msg.oId) continue;
            if (this.content[i].dbUser && this.content[i].dbUser.length) {
              let nextUser = this.content[i].dbUser.shift();
              if(this.content[i].dbUser.length) nextUser.dbUser = this.content[i].dbUser;
              this.content[i] = nextUser;
            }
            else this.content.splice(i, 1);
            break;
          }
          break;
        case "msg": //消息
        case "redPacketStatus":
          if (msg.type == "msg") msg.redpacket = this.getRedPacket(msg);
          else if (msg.count == msg.got) {
            for (let i = 0; i < this.content.length; i++) {
              let c = this.content[i];
              if (c.oId != msg.oId || c.type == "redPacketStatus") continue;
              this.content[i].redpacket.empty = true;
              if (msg.whoGot == this.current.userName)
                this.content[i].redpacket.readed = true;
              break;
            }
          }
          msg.dbUser = []
          if (msg.type == 'msg' && !msg.redpacket
          && msg.content == this.content[0].content) {
              this.content[0].dbUser = this.content[0].dbUser || []
              this.content[0].dbUser.push(msg)
          }
          else this.content.splice(0, 0, msg)
          if (this.content.length > 2000) this.load(1);
          break;
      }
    },
    getRedPacket(item) {
      try {
        let data = JSON.parse(item.content);
        if (data.msgType != "redPacket") return false;
        if (data.recivers) data.recivers = JSON.parse(data.recivers)
        else data.recivers = []
        data.empty = data.got == data.count;
        data.readed = data.who.find((w) => w.userName == this.current.userName);
        return data;
      } catch (e) {
        return false;
      }
    },
    showRedpacket(item, redpacket) {
      let money = redpacket.who.find(
        (w) => w.userName == this.current.userName
      );
      redpacket.recivers = redpacket.recivers || [];
      item.redpacket.readed = true;
      let specify = (redpacket.recivers.length && redpacket.recivers.indexOf(this.current.userName) >= 0)
      let msg;
      if (redpacket.recivers.length && !specify) {
          msg = "会错意，这个红包不是发给你"
      } else if (!money) {
        msg = "没有抢到，错过一个亿";
      } else {
          msg =
            money.userMoney == 0
              ? "抢了个寂寞，抢到 0 积分"
              : `成功抢到 ${money.userMoney} 积分`;
      }
      this.$root.msg('info', msg);
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less" scoped>
.chat-content {
  overflow: hidden auto;
  margin-top: 5px;
}
.msg-more {
  text-align: center;
  margin: 5px 0 0;
  cursor: pointer;
  &:hover {
    color: #57a3f3;
  }
}
</style>
<style lang="less">
</style>
