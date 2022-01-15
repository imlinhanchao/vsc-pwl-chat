
module.exports = {
    // 载入脚本后初始化
    /// context: vscode Extension Context 对象
    /// apiKey:String 用户 Api Key，若未登录则为空字符串, 可用于调用摸鱼派 API，API 文档：https://fishpi.cn/article/1636516552191
    init(context, apiKey) {
    },

    /// 登录事件
    /// apiKey:String 用户 Api Key, 可用于调用摸鱼派 API，API 文档：https://fishpi.cn/article/1636516552191
    /// user: 登录用户信息
    loginEvent(apiKey, user) {
        console.log(apiKey, user);
    },

    /// 退出登录事件
    logoutEvent() {
    },

    /// 聊天室收到消息事件
    /// - type:String 消息类型，[ online: 在线消息, revoke: 撤回消息, msg: 聊天消息, redPacket: 红包消息, redPacketStatus: 红包领取消息 ]
    /// - data:Any 消息内容，不同类型包含不同数据
    ///   - online:Array<{ homePage: 用户首页, userAvatarURL: 用户头像, userName: 用户名 }>
    ///   - revoke:String 撤回消息的 Id
    ///   - msg:Object{ oId: 消息 Id, time: 发布时间, userName: 用户名, userNickname: 用户昵称, userAvatarURL: 用户头像, content: 消息 HTML, md: 消息 Markdown }
    ///   - redPacket:Object{ msg: 红包祝福语, recivers:Array<String> 红包接收者用户名，专属红包有效, 
    ///     money: 红包积分, count: 红包个数, type: 红包类型, got: 已领取个数, 
    ///     who:Array<{ userName: 领取者用户名, avatar: 头像, userMoney: 领取到的积分, time: 领取时间 }> }
    ///   - redPacketStatus:Object{ oId: 被领取的红包的消息 Id, count: 红包个数, got: 已领取个数, whoGive: 发送者用户名, whoGot: 领取者用户名 }
    /// return true 为响应该消息，false 则会中断消息响应。比如可以对指定人的消息进行屏蔽
    async messageEvent({ type, data }) {
        return true;
    },

    /// 聊天室发送消息事件
    /// - text:String 用户发送的聊天消息，包含复读消息，红包消息。
    /// return 你要发送的内容，不发送则返回空字符串或 null 或 undefined 或 false
    async sendMsgEvent(text) {
        return text + ' :huaji:';
    },

    /// 活跃度获取，登录后定时 60s 触发
    /// - data:Number 活跃度数据
    liveness(data) {
    },
};