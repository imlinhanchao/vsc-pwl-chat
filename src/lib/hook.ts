import Utils from './utils';
import * as fs from 'fs';
let hook = require('../../hook');

export default ():any => {
    try {
        let hookjs = Utils.getConfig().hook;
        if (!fs.existsSync(hookjs)) { return undefined; }
        return Object.assign(hook, require(hookjs));
    } catch (error) {
        return undefined;
    }
};