<template>
    <section class="chat-content" ref="chat-content">
        <div v-for="(item, i) in content" v-bind:key="(item.type || 'msg') + '_' + item.oId + (item.whoGot || '')">
        <div class="msg-item" v-if="item.content" :class="{ 'msg-current': item.userName == current.userName }">
            <div class="msg-avatar-box">
                <a target="_blank" :href="`https://pwl.icu/member/${item.userName}`"><img class="msg-avatar" :src="item.userAvatarURL"/></a>
            </div>
            <div :ref="`msg-${item.oId}`" :data-id="item.oId" class="msg-item-contain" >
            <div class="msg-user" :title="item.userNickname">
                {{ item.userName }}
            </div>
            <div class="msg-contain">
                <div class="arrow" v-if="item.content.replace(/\n/g, '').match(/>[^<]+?</g)" />
                <div class="msg-content md-style" v-html="formatContent(item.content)" 
                    v-if="item.content.replace(/\n/g, '').match(/>[^<]+?</g)"/>
                    <span class="msg-img" v-if="!item.content.replace(/\n/g, '').match(/>[^<]+?</g)"
                    v-html="formatContent(item.content)"></span>
            </div>
            </div>
        </div>
        </div>
        <div class="msg-more" @click="load(page + 1)" v-if="content.length < 1999">
            <i custom="fa fa-caret-down" v-if="!loading" />
            <i custom="fa fa-circle-o-notch fa-spin" v-if="loading" />
        </div>
    </section>
</template>

<script>
export default {
    name: "MessageList",
    props: {
        current: {
            type: Object,
            default: {}
        }
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
        };
    },
    mounted() {
        this.load(this.page);
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
            if (page > 1) this.content = this.content.concat(data);
            else this.content = rsp.data;
            this.page = page;
        },
        formatContent(content) {
            return content
                .replace(/(<a )/g, '$1target="_blank" ')
                .replace(/(<img )/g, '$1data-action="preview" ');
        },
    },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less" scoped>
.msg-item{
    display: flex;
    flex-direction: row;
}

.msg-item-contain{
    display: flex;
    flex-direction: column;
    max-width: 85%;
    position: relative;
}

.msg-avatar {
    width: 35px;
    height: 35px;
    border-radius: 35px;
    margin-top: 1.5em;
    cursor: pointer;
}

.msg-user{
    margin-left: 1em;
    font-size: .8em;
}

.msg-contain{
    display: flex;
    flex-direction: row;
    position: relative;
    width: 80vw;
    .msg-img {
        padding: 10px;
        display: inline-block;
    }
    .plus-one {
        font-size: .8em;
        margin: auto 5px;
        font-weight: bolder;
        color: #FFF;
        height: 25px;
        width: 25px;
        background: #d23f31;
        border-radius: 15px;
        text-align: center;
        cursor: pointer;
        font-family: mononoki,Consolas,"Liberation Mono",Menlo,Courier,monospace;
    }
}

.arrow{
    border: 5px solid transparent;
    border-right: 5px solid #F6F8FA;
    width: 0;
    margin-top: 15px;
    height: 0;
}

.msg-content{
    background-color: #F6F8FA;
    border-radius: 5px;
    padding: 8px 15px;
    color:#232425;
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
        border-left-color: #515a6e;
    }
    .msg-content {
        background-color: #515a6e;
        color: #F6F8FA;
    }
    .msg-user {
        text-align: right;
        margin-right: 1em;
    }
    .plus-one {
        left: -1.5em;
        right: auto;
    }
}
.chat-content {
    overflow: hidden auto;
    margin-top: 5px;
}
.msg-menu {
    position: absolute;
    background: #FFF;
    box-shadow: 1px 1px 3px #515a6e;
    border-radius: 5px;
    color: #17233d;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    z-index:50;
    .msg-menu-item {
        padding: 5px 10px;
        word-break: keep-all;
        &:hover {
            background: #dcdee2;
        }
    }
}
.msg-more {
    text-align: center;
    margin: 5px 0 0;
    cursor: pointer;
    &:hover {
        color: #57a3f3;
    }
}
.hidden {
    visibility: hidden;
    position: absolute;
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
