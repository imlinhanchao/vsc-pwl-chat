<template>
  <div id="app">
    <MessageBox></MessageBox>
    <MessageList></MessageList>
  </div>
</template>

<script>
import MessageBox from './components/MessageBox.vue'
import MessageList from './components/MessageList.vue'

export default {
  name: 'App',
  components: {
    MessageBox, MessageList
  }
}
</script>

<style lang="less">


</style>
