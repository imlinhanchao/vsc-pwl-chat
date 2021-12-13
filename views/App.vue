<template>
  <div id="app">
    <MessageBox></MessageBox>
    <MessageList></MessageList>
  </div>
</template>

<script>
import MessageBox from "./components/MessageBox.vue";
import MessageList from "./components/MessageList.vue";

export default {
  name: 'App',
  components: {
    MessageBox, MessageList
  }
}
</script>

<style lang="less">
.md-style {
    * {
        margin-inline-start: 0;
        margin-inline-end: 0;
        line-height: 1.5;
    }
    a {
        border-bottom: 1px dashed #17233d;
    }
    img {
        max-height: 60vh;
        max-width: 40vw;
        cursor: pointer;
        background: #FFF;
        &[alt='图片表情'] {
            background: transparent;
        }
    }
    ul, ol {
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
    h1,h2 {
        padding-bottom: .3em;
        border-bottom: 1px solid #eaecef
    }
    
    hr {
        background-color: #eaecef
    }
    
    blockquote {
        color: #6a737d;
        border-left: .25em solid #eaecef;
        padding-left: 5px;
    }
    
    iframe {
        border: 1px solid #d1d5da;
        width: 100%;
    }
    
    table tr {
        border-top: 1px solid #c6cbd1;
        background-color: #fafbfc
    }
    
    table td, table th {
        border: 1px solid #dfe2e5
    }
    
    table tbody tr:nth-child(2n) {
        background-color: #fff
    }
    
    code:not(.hljs):not(.highlight-chroma) {
        background-color: rgba(27,31,35,.05)
    }

    pre,code {
        width: 100%;
        max-height: 300px;
        overflow: auto;
    }

    pre>code {
        margin: 0;
        font-size: 85%;
        padding: 0.5em;
        border-radius: 5px;
        display: block;
        overflow: auto;
        white-space: pre;
        font-family: mononoki,Consolas,"Liberation Mono",Menlo,Courier,monospace;
        word-break: initial;
        word-wrap: normal
    }
    
    kbd {
        color: #24292e;
        background-color: #fafbfc;
        border: 1px solid #d1d5da;
        box-shadow: inset 0 -1px 0 #d1d5da
    }
}
</style>
