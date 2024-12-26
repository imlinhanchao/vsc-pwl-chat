import * as vscode from 'vscode';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import FormData from 'form-data';
import axios from 'axios';
import * as https from 'https';
import ReconnectingWebSocket from "reconnecting-websocket";
import WS from 'ws';
import Hook from './hook';
import * as packages from '../../package.json';
let pkg = packages as any;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
class PWL {
    token:string = '';
    onlines:Array<any>=[];
    discusse:string = '';
    rws:ReconnectingWebSocket|null = null;
    private _timer:NodeJS.Timeout | null = null;
    constructor(token:string) {
        if (!token) { return; }
        this.token = token;
    }

    async login(data: Account) {
        try {
            let md5 = crypto.createHash('md5');
            let rsp = await this.request({
                url: 'api/getKey',
                method: 'post',
                data: {
                    nameOrEmail: data.username,
                    userPassword: md5.update(data.passwd).digest('hex'),
                    mfaCode: data.mfaCode || ''
                },
            });

            this.token = rsp.data.Key;

            return rsp.data;            
        } catch (e) {
            return { code: -1, msg: (e as Error).message };
        }
    }

    async info() {
        try {
            let rsp = await this.request({
                url: `api/user?apiKey=${this.token}`
            });

            if (rsp.status === 401) { 
                return { code: 401, msg: '登录已失效，请重新登录！' };
            }

            return rsp.data;
        } catch (e) {
            return { code: -1, msg: (e as Error).message };
        }
    }

    async history(page=1) {
        try {
            let rsp = await this.request({
                url: `chat-room/more?page=${page}&apiKey=${this.token}`
            });

            if (rsp.status === 401) { 
                return { code: 401, msg: '登录已失效，请重新登录！' };
            }

            return rsp.data;
        } catch (e) {
            return { code: -1, msg: (e as Error).message };
        }
    }

    async atlist(name:string) {
        let rsp;
        try {
            rsp = await this.request({
                url: `users/names`,
                method: 'post',
                data: {
                    name
                },
            });

            if (rsp.status === 401) {
                return { code: 401, msg: '登录已失效，请重新登录！' };
            }

            return rsp.data;            
        } catch (e) {
            return { code: -1, msg: (e as Error).message };
        }
    }

    async revoke(oId:string) {
        let rsp;
        try {
            rsp = await this.request({
                url: `chat-room/revoke/${oId}`,
                method: 'delete',
                data: {
                    apiKey: this.token
                },
            });

            if (rsp.status === 401) {
                return { code: 401, msg: '登录已失效，请重新登录！' };
            }

            return rsp.data;            
        } catch (e) {
            return { code: -1, msg: (e as Error).message };
        }
    }

    async push(msg:string) {
        let rsp;
        try {
            try { if (Hook()) { msg = await Hook()?.sendMsgEvent(msg); } } catch(e) { 
                vscode.window.showErrorMessage(`Hook Send Message 失败：${(e as Error).message}`); 
            }
            rsp = await this.request({
                url: `chat-room/send`,
                method: 'post',
                data: {
                    content: msg,
                    client: `VSCode/${pkg.version}`,
                    apiKey: this.token
                },
            });

            if (rsp.status === 401) {return { code: 401, msg: '登录已失效，请重新登录！' };}

            return rsp.data;            
        } catch (e) {
            return { code: -1, msg: (e as Error).message };
        }
    }

    async raw(oId:string) {
        let rsp;
        try {
            rsp = await this.request({
                url: `cr/raw/${oId}`,
            });

            return rsp.data.replace(/<!--.*?-->/g, '');
        } catch (e) {
            return { code: -1, msg: (e as Error).message };
        }
    }

    async emoji() {
        let rsp;
        try {
            rsp = await this.request({
                url: `api/cloud/get`,
                method: 'post',
                data: {
                    gameId: 'emojis',
                    apiKey: this.token
                },
            });

            if (rsp.status === 401) {return { code: 401, msg: '登录已失效，请重新登录！' };}

            return JSON.parse(rsp.data.data);            
        } catch (e) {
            return { code: -1, msg: (e as Error).message };
        }
    }

    async syncEmoji(data:any) {
        let rsp;
        try {
            rsp = await this.request({
                url: `api/cloud/sync`,
                method: 'post',
                data: {
                    gameId: 'emojis',
                    data: JSON.stringify(data),
                    apiKey: this.token
                },
            });

            if (rsp.status === 401) {
                return { code: 401, msg: '登录已失效，请重新登录！' };
            }

            return rsp.data;            
        } catch (e) {
            return { code: -1, msg: (e as Error).message };
        }
    }

    async openRedpacket({ oId, gesture }: { oId :string, gesture: number | undefined}) {
        let rsp;
        try {
            rsp = await this.request({
                url: `chat-room/red-packet/open`,
                method: 'post',
                data: {
                    oId,
                    gesture,
                    apiKey: this.token
                },
            });

            if (rsp.status === 401) {
                return { code: 401, msg: '登录已失效，请重新登录！' };
            }

            return rsp.data;            
        } catch (e) {
            return { code: -1, msg: (e as Error).message };
        }
    }

    async upload(files:Array<string>) {
        let data = new FormData();
        files.forEach(f => data.append('file[]', fs.readFileSync(f), path.basename(f)));
        data.append('apiKey', this.token);

        let rsp;
        try {
            rsp = await this.request({
                url: `upload`,
                method: 'post',
                data,
                headers: data.getHeaders()
            });

            if (rsp.status === 401) {return { code: 401, msg: '登录已失效，请重新登录！' };}

            return rsp.data;            
        } catch (e) {
            return { code: -1, msg: (e as Error).message };
        }
    }

    async liveness() {
        if (!this.token) {return 0;}
        try {
            let rsp = await this.request({
                url: `user/liveness?apiKey=${this.token}`
            });

            if (rsp.status === 401) {return { code: 401, msg: '登录已失效，请重新登录！' };}

            return rsp.data.liveness;
        } catch (e) {
            return { code: -1, msg: (e as Error).message };
        }
    }

    getOnlines() {
        return this.onlines;
    }

    /**
     * 发送一条弹幕
     * @param msg 消息内容，支持 Markdown
     * @param color 弹幕颜色
     */
    async barrage(msg:string, color:string='#ffffff') {
      let rsp;
      try {
          rsp = await this.request({
              url: `chat-room/send`,
              method: 'post',
              data: {
                  content: `[barrager]{\"color\":\"${color}\",\"content\":\"${msg}\"}[/barrager]`,
                  apiKey: this.token
              },
          });

          return rsp;
      } catch (e) {
          throw e;
      }
    }
  
    /**
     * 修改话题
     * @param msg 内容
     */
    async setDiscusse(newDiscusse:string) {
      let rsp;
      try {
          rsp = await this.request({
              url: `chat-room/send`,
              method: 'post',
              data: {
                  content: `[setdiscuss]${newDiscusse}[/setdiscuss]`,
                  apiKey: this.token
              },
          });

          return rsp;
      } catch (e) {
          throw e;
      }
    }

    async barragePay(): Promise<{ cost: number; unit: string }> {
      let rsp;
      try {
        rsp = await this.request({
          url: `cr?apiKey=${this.token}`,
        });

        let mat = rsp.data.match(/barragerCost">([-0-9]+)<\/span><\/b>\s*<span id="barragerUnit">([^<]*?)<\//);
        if (mat) {
          return {
            cost: parseInt(mat[1]),
            unit: mat[2]
          };
        }

        return {
          cost: 20,
          unit: '积分'
        };
      }
      catch (e) {
        return {
          cost: 20,
          unit: '积分'
        };
      }
    }

    /**
     * 获取聊天室节点
     * @returns 返回节点地址
     */
    async getNode():Promise<string> {
        let rsp;
        try {
            rsp = await this.request({
                url: `chat-room/node/get?apiKey=${this.token}`,
            });

            return rsp.data.data;
        } catch (e) {
            throw e;
        }
    }
    

    async websocketInit(wsCallback:Function, url='') {
        if (this.rws !== null) { this.rws.close(); }
        if (!url && this.token) { url = await this.getNode().catch(() => `wss://fishpi.cn/chat-room-channel?apiKey=${this.token}`); }
        if (!url) { return; }
        this.rws = new ReconnectingWebSocket(url, [], {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            WebSocket: WS,
            connectionTimeout: 10000
        });

        this.rws.onopen = (e) => {
            console.log("onopen");
            if(this._timer) { clearInterval(this._timer); }
            this._timer = setInterval(() => {
                this.rws?.send('-hb-');
            }, 1000 * 60 * 3);
        };
        this.rws.onmessage = async (e) => {
            let msg = JSON.parse(e.data);
            let data: any = {};
            switch(msg.type) {
                case 'online': {
                    data = this.onlines = msg.users;
                    data.discussing = msg.discusse;
                    this.discusse = msg.discussing;
                    break;
                }
                case 'discussChanged': {
                    data = msg.newDiscuss;
                    break;
                }
                case 'revoke': {
                    data = msg.oId;
                    break;
                }
                case 'barrager': {
                  let { barragerContent, userAvatarURL, userAvatarURL20, userNickname, barragerColor, userName, userAvatarURL210, userAvatarURL48 } = msg;
                  data = { barragerContent, userAvatarURL, userAvatarURL20, userNickname, barragerColor, userName, userAvatarURL210, userAvatarURL48 };
                  break;
                }
                case 'customMessage': {
                  data = msg.message;
                  break;
                }
                case 'msg': {
                    let { oId, time, userName, userNickname, userAvatarURL, content, md } = msg;
                    try {
                        let { msg, recivers, money, count, type, got, who, msgType } = JSON.parse(content);
                        if (msgType === 'redPacket') {
                            data = { msg, recivers, money, count, type, got, who };
                            break;
                        } else {
                            content = '[不支持消息类型，请到<a href="https://fishpi.cn" target="_blank">网页版查看</a>]';
                        }
                    } catch (e) {}
                    data = { oId, time, userName, userNickname, userAvatarURL, content, md };
                    break;
                }
                case 'redPacketStatus': {
                    let { oId, count, got, whoGive, whoGot } = msg;
                    data = { oId, count, got, whoGive, whoGot };
                    break;
                }
            }
            try { if(Hook() && !await Hook()?.messageEvent({type: msg.type, data })){ return; } } catch(e) { 
                vscode.window.showErrorMessage(`Hook Message 失败：${(e as Error).message}`); 
            }
            wsCallback(e);
        };
        this.rws.onerror = (e) => {
        };
        this.rws.onclose = (e) => {
        };
    }

    async request(opt:any) {
        let {
            url,
            method = 'get',
            headers = {},
            data
        } = opt;

        headers['User-Agent'] = `Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36`;
        headers['Referer'] = 'https://fishpi.cn/';

        let options = {
            method, headers,
            httpsAgent: new https.Agent({
                keepAlive: true,
                rejectUnauthorized: false,
            }),
            data
        };
    
        let rsp:any;
        try {
            rsp = await axios(`https://fishpi.cn/${url}`, options);
            return rsp;
        } catch (err) {
            if ((err as any).response?.status === 401) { return (err as any).response; }
            throw(err);
        }
    }
}

export default PWL;