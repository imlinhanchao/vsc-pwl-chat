import * as crypto from 'crypto';
import {FormData} from 'formdata-node';
import fetch, { FetchError } from 'node-fetch';

class PWL {
    token:string = '';
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
                    userPassword: md5.update(data.passwd).digest('hex')
                },
            });

            this.token = rsp.data.Key;

            return rsp.data;            
        } catch (e) {
            return { code: -1, msg: (e as Error).message };
        }
    }

    async info(token: string) {
        try {
            let rsp = await this.request({
                url: `api/user?apiKey=${token}`
            });

            if (rsp.data.code === 0) { this.token = token; }

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
            rsp = await this.request({
                url: `chat-room/send`,
                method: 'post',
                data: {
                    content: msg,
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

            return rsp.raw.replace(/<!--.*?-->/g, '');
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

    async syncEmoji(data:any)
    {
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

    async openRedpacket(oId:string) {
        let rsp;
        try {
            rsp = await this.request({
                url: `chat-room/red-packet/open`,
                method: 'post',
                data: {
                    oId,
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
        files.forEach(f => data.append('file[]', f));

        let rsp;
        try {
            rsp = await this.request({
                url: `upload`,
                method: 'post',
                data,
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

    async request(opt:any) {
        let {
            url,
            method = 'get',
            headers = {},
            data = undefined
        } = opt;

        let body = data instanceof FormData ? data : data && JSON.stringify(data);
            
        let options = {
            method, headers, body,
        };
    
        let rsp:any;
        try {
            rsp = await fetch(`https://pwl.icu/${url}`, options);
            try{ rsp.data = await rsp.clone().json(); } catch(e) {}
            rsp.raw = await rsp.clone().text();
            return rsp;
        } catch (err) {
            let e = err as any;
            if (e.response.status === 401) {return e.response;}
            throw(e);
        }
    }
}

export default PWL;