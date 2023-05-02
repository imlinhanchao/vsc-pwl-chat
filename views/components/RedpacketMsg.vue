<template>
  <div
    class="redpacket-item"
    :title="
      item.redpacket.empty
        ? '红包已领完'
        : item.redpacket.readed
        ? '红包已领取'
        : ''
    "
    :class="{
      'msg-current': isCurrent,
      'redpacket-empty': item.redpacket.empty || item.redpacket.readed,
    }"
    v-if="item.redpacket"
    @click="$emit('click')"
  >
    <div class="arrow" />
    <div class="redpacket-content">
      <div class="redpacket-main">
        <svg class="redpacket-icon">
          <use xlink:href="#redPacketIcon"></use>
        </svg>
        <div class="redpacket-msg">{{ item.redpacket.msg }}</div>
      </div>
      <div class="redpacket-type">
        <div>{{ redpacketType[item.redpacket.type] }}</div>
      </div>
    </div>
    <div
      title="猜猜我出什么呢~"
      v-show="
        item.redpacket.type == 'rockPaperScissors' &&
        !isCurrent &&
        !item.redpacket.empty &&
        !item.redpacket.readed
      "
      class="user-gesture"
    >
      <div class="gesture-list gesture-open">
        <div class="gesture-item rock" @click="$emit('click', 0)">
          <img src="../assets/Rock.png" alt="" />
        </div>
        <div class="gesture-item scissors" @click="$emit('click', 1)">
          <img src="../assets/Scissors.png" alt="" />
        </div>
        <div class="gesture-item paper" @click="$emit('click', 2)">
          <img src="../assets/Paper.png" alt="" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "RedpacketMsg",
  props: {
    item: Object,
    isCurrent: Boolean,
  },
  data() {
    return {};
  },
  computed: {
    redpacketType() {
      return {
        random: "拼手气红包",
        average: "普通红包",
        specify: "专属红包",
        heartbeat: "心跳红包",
        rockPaperScissors: "猜拳红包",
      };
    },
  },
  methods: {},
};
</script>

<style lang="less" scoped>
.redpacket-item {
  display: flex;
  flex-direction: row;
  cursor: pointer;
  user-select: none;
  &.redpacket-empty {
    .redpacket-content {
      background: #fecd41;
    }
    .arrow {
      border-right-color: #fecd41;
    }
  }
  .arrow {
    border-right-color: #f90;
  }
  .redpacket-content {
    display: flex;
    flex-direction: column;
    background: #f90;
    border-radius: 5px;
    padding-right: 10px;
    .redpacket-main {
      display: inline-flex;
      align-items: center;
    }
    .redpacket-icon {
      width: 64px;
      height: 64px;
    }
    .redpacket-msg {
      color: #fff;
    }
    .redpacket-type {
      border-top: 1px solid #ed4014;
      color: #fff;
      padding: 2px;
      margin: 0 10px;
      font-size: .5em;
    }
  }

  .user-gesture {
      display: flex;
      flex-direction: row;
      align-items: center;
  }
  .gesture-choose {
      position: relative;
      z-index: 5;
      img {
          width: 1.5em;
          margin: 0 3px;
      }
  }
  .gesture-list {
    position: relative;
    display: flex;
    height: 100%;
    .gesture-item {
      position: absolute;
      z-index: 2;
      top: 1.6em;
      left: -1.9em;
      transition: all .2s;
      img {
        width: 1.5em;
        border-radius: 50%;
        overflow: hidden;
        margin: 0 3px;
        &:hover {
          box-shadow: 0 0 3px 0 #FA0 ;
        }
      }
    }
    &.gesture-open {
      img {
        width: 2.5em;
        max-width: none;
      }
      .rock {
        top: -1em;
        left: -1em;
      }
      .scissors {
        top: 1.5em;
        left: 0.5em;
      }
      .paper {
        top: 4em;
        left: -1em;
      }
    }
  }
}
.msg-current {
    .redpacket-item {
        flex-direction: row-reverse;
        .arrow {
            border-right-color: transparent;
            border-left-color: #f90;
        }
        &.redpacket-empty {
            .arrow {
                border-right-color: transparent;
                border-left-color: #fecd41;
            }
        }
    }
}
</style>
