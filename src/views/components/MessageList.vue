<template>
  <div class="msg-list">
  </div>
</template>

<script>
export default {
  name: 'MessageList',
  props: {
    user: Object
  },
  data() {
    return {
      list: [],
      page: 1
    }
  },
  mounted() {
    this.load(this.page);
  },
  methods: {
    async load(page) {
      let rsp = await this.$root.request('history', page);
      console.dir(rsp);
      this.loading = false;
      if (!rsp) return;
      if (rsp.code != 0) {
          return;
      }
      let oIds = this.content.map(c => c.oId);
      let data = rsp.data.filter(d => oIds.indexOf(d.oId) < 0)
      if(page > 1) this.content = this.content.concat(data);
      else this.content = rsp.data;
      this.page = page;
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less" scoped>
</style>
