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
    @click="openRedpacket(item)"
  >
    <div class="arrow" />
    <div class="redpacket-content">
      <svg class="redpacket-icon">
        <use xlink:href="#redPacketIcon"></use>
      </svg>
      <div class="redpacket-msg">{{ item.redpacket.msg }}</div>
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
    return {
    };
  },
  methods: {
    async openRedpacket() {
    },
  },
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
    display: inline-flex;
    align-items: center;
    background: #f90;
    border-radius: 5px;
    padding-right: 10px;
    .redpacket-icon {
      width: 64px;
      height: 64px;
    }
    .redpacket-msg {
      color: #fff;
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
