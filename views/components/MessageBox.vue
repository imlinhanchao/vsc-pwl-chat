<template>
  <div class="msg-box">
    <input type="text" placeholder="简单聊聊">
    <button><i class="fa fa-paper-plane" aria-hidden="true"></i></button>
  </div>
</template>

<script>
export default {
  name: 'MessageBox',
  props: {
    msg: String
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less" scoped>
.msg-box {
  display: flex;
  flex-direction: row;
  button {
    width: 50px;
  }
}
</style>
